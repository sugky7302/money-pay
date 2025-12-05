// Google Sheets API service for reading and writing data to Google Drive
// Requires scope: https://www.googleapis.com/auth/drive.file

import { Account, Category, Currency, Merchant, Tag, Transaction } from '../types';
import { storage } from './storage';

const FOLDER_NAME = 'cloudbudget';
const SPREADSHEET_NAME = 'cloudbudget-data';

// Backup data structure
export interface BackupData {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  merchants: Merchant[];
  currencies: Currency[];
  exportDate: string;
}

// Sheet names for each data type
const SHEET_NAMES = {
  transactions: 'Transactions',
  accounts: 'Accounts',
  categories: 'Categories',
  tags: 'Tags',
  merchants: 'Merchants',
  currencies: 'Currencies',
  metadata: 'Metadata',
} as const;

class GoogleSheetsService {
  private getAccessToken(): string | null {
    return storage.getAuthToken();
  }

  // Callback for token expiration - will be set by AuthContext
  public onTokenExpired: (() => void) | null = null;

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('未登入，請先登入 Google 帳號');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expired, trigger re-login
      storage.removeAuthToken();
      if (this.onTokenExpired) {
        this.onTokenExpired();
      }
      throw new Error('登入已過期，請重新登入後再試一次');
    }

    return response;
  }

  // Find or create the cloudbudget folder in Google Drive
  async findOrCreateFolder(): Promise<string> {
    // Search for existing folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive`;
    const searchResponse = await this.fetchWithAuth(searchUrl);
    const searchResult = await searchResponse.json();

    if (searchResult.files && searchResult.files.length > 0) {
      return searchResult.files[0].id;
    }

    // Create folder if not exists
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createResponse = await this.fetchWithAuth(createUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    const folder = await createResponse.json();
    return folder.id;
  }

  // Find or create the spreadsheet in the cloudbudget folder
  async findOrCreateSpreadsheet(folderId: string): Promise<string> {
    // Search for existing spreadsheet in the folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const searchResponse = await this.fetchWithAuth(searchUrl);
    const searchResult = await searchResponse.json();

    if (searchResult.files && searchResult.files.length > 0) {
      const spreadsheetId = searchResult.files[0].id;
      
      // For existing spreadsheets: check for and create missing sheets
      const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
      const getResponse = await this.fetchWithAuth(getUrl);
      const spreadsheetData = await getResponse.json();
      const existingSheetTitles = spreadsheetData.sheets?.map((s: any) => s.properties.title) || [];
      
      const allSheetNames = Object.values(SHEET_NAMES);
      const missingSheets = allSheetNames.filter(name => !existingSheetTitles.includes(name));

      if (missingSheets.length > 0) {
        const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
        const requests = missingSheets.map(title => ({
          addSheet: { properties: { title } },
        }));
        await this.fetchWithAuth(batchUpdateUrl, {
          method: 'POST',
          body: JSON.stringify({ requests }),
        });
      }
      
      return spreadsheetId;
    }

    // Create spreadsheet using Drive API (more reliable for CORS)
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createResponse = await this.fetchWithAuth(createUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: SPREADSHEET_NAME,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId],
      }),
    });

    const file = await createResponse.json();
    
    if (!file.id) {
      console.error('Failed to create spreadsheet:', file);
      throw new Error('無法建立 Google Sheets 檔案');
    }

    // Add sheets using Sheets API batchUpdate
    const sheetsToAdd = [
      SHEET_NAMES.transactions,
      SHEET_NAMES.accounts,
      SHEET_NAMES.categories,
      SHEET_NAMES.tags,
      SHEET_NAMES.merchants,
      SHEET_NAMES.currencies,
      SHEET_NAMES.metadata,
    ];

    // Rename default Sheet1 to first sheet name and add others
    const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${file.id}:batchUpdate`;
    
    // First, get the default sheet ID
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${file.id}`;
    const getResponse = await this.fetchWithAuth(getUrl);
    const spreadsheetData = await getResponse.json();
    const defaultSheetId = spreadsheetData.sheets?.[0]?.properties?.sheetId || 0;

    const requests = [
      // Rename default sheet
      {
        updateSheetProperties: {
          properties: { sheetId: defaultSheetId, title: sheetsToAdd[0] },
          fields: 'title',
        },
      },
      // Add other sheets
      ...sheetsToAdd.slice(1).map(title => ({
        addSheet: { properties: { title } },
      })),
    ];

    await this.fetchWithAuth(batchUpdateUrl, {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });

    return file.id;
  }

  // Get spreadsheet ID (find or create)
  async getSpreadsheetId(): Promise<string> {
    const folderId = await this.findOrCreateFolder();
    const spreadsheetId = await this.findOrCreateSpreadsheet(folderId);
    return spreadsheetId;
  }

  // Clear a sheet and write new data
  private async writeSheet(
    spreadsheetId: string,
    sheetName: string,
    headers: string[],
    rows: (string | number | boolean | undefined)[][]
  ): Promise<void> {
    // Clear existing data
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:clear`;
    await this.fetchWithAuth(clearUrl, { method: 'POST' });

    // Write headers and data
    const values = [headers, ...rows];
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW`;
    await this.fetchWithAuth(updateUrl, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
  }

  // Read data from a sheet
  private async readSheet(
    spreadsheetId: string,
    sheetName: string
  ): Promise<string[][]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`;
    const response = await this.fetchWithAuth(url);
    const result = await response.json();
    return result.values || [];
  }

  // Save all data to Google Sheets
  async saveToGoogleSheets(data: BackupData): Promise<void> {
    const spreadsheetId = await this.getSpreadsheetId();

    // Save transactions
    const transactionHeaders = ['id', 'type', 'amount', 'category', 'date', 'note', 'tags', 'merchant', 'account', 'fromAccount', 'toAccount'];
    const transactionRows = data.transactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.category,
      t.date,
      t.note || '',
      JSON.stringify(t.tags || []),
      t.merchant || '',
      t.account || '',
      t.fromAccount || '',
      t.toAccount || '',
    ]);
    await this.writeSheet(spreadsheetId, SHEET_NAMES.transactions, transactionHeaders, transactionRows);

    // Save accounts
    const accountHeaders = ['id', 'name', 'type', 'balance', 'currency', 'isVirtual', 'icon', 'color'];
    const accountRows = data.accounts.map(a => [
      a.id,
      a.name,
      a.type,
      a.balance,
      a.currency,
      a.isVirtual ? 'true' : 'false',
      a.icon || '',
      a.color || '',
    ]);
    await this.writeSheet(spreadsheetId, SHEET_NAMES.accounts, accountHeaders, accountRows);

    // Save categories
    const categoryHeaders = ['id', 'name', 'type', 'icon'];
    const categoryRows = data.categories.map(c => [
      c.id,
      c.name,
      c.type,
      c.icon || '',
    ]);
    await this.writeSheet(spreadsheetId, SHEET_NAMES.categories, categoryHeaders, categoryRows);

    // Save tags
    const tagHeaders = ['id', 'name', 'color'];
    const tagRows = data.tags.map(t => [
      t.id,
      t.name,
      t.color || '',
    ]);
    await this.writeSheet(spreadsheetId, SHEET_NAMES.tags, tagHeaders, tagRows);

    // Save merchants
    const merchantHeaders = ['id', 'name', 'category'];
    const merchantRows = data.merchants.map(m => [
      m.id,
      m.name,
      m.category || '',
    ]);
    await this.writeSheet(spreadsheetId, SHEET_NAMES.merchants, merchantHeaders, merchantRows);

    // Save currencies
    const currencyHeaders = ['id', 'code', 'name', 'symbol'];
    const currencyRows = (data.currencies || []).map(c => [
      c.id,
      c.code,
      c.name,
      c.symbol,
    ]);
    await this.writeSheet(spreadsheetId, SHEET_NAMES.currencies, currencyHeaders, currencyRows);

    // Save metadata
    const metadataHeaders = ['key', 'value'];
    const metadataRows = [
      ['exportDate', data.exportDate],
      ['version', '2.0.0'],
    ];
    await this.writeSheet(spreadsheetId, SHEET_NAMES.metadata, metadataHeaders, metadataRows);
  }

  // Safely parse tags from string
  private parseTags(value: string | undefined): string[] | undefined {
    if (!value || value.trim() === '' || value === '[]') {
      return undefined;
    }
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Not valid JSON, try other formats
    }
    
    // Handle comma-separated format (e.g., "tag1,tag2,tag3")
    if (value.includes(',')) {
      return value.split(',').map(t => t.trim()).filter(t => t);
    }
    
    // Single tag
    return [value.trim()];
  }

  // Helper to create a row mapper based on headers
  private createRowMapper(headers: string[]) {
    const headerIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerIndex[h.toLowerCase()] = i;
    });
    return (row: string[], field: string): string | undefined => {
      const idx = headerIndex[field.toLowerCase()];
      return idx !== undefined ? row[idx] : undefined;
    };
  }

  // Load all data from Google Sheets
  async loadFromGoogleSheets(): Promise<BackupData | null> {
    try {
      const spreadsheetId = await this.getSpreadsheetId();

      // Helper to safely parse number
      const safeNumber = (value: string | undefined, fallback: number = 0): number => {
        if (!value || value.trim() === '') return fallback;
        const num = Number(value);
        return isNaN(num) ? fallback : num;
      };

      // Read transactions
      const transactionData = await this.readSheet(spreadsheetId, SHEET_NAMES.transactions);
      const txHeaders = transactionData[0] || [];
      const txGet = this.createRowMapper(txHeaders);
      const transactions: Transaction[] = transactionData.slice(1).map(row => ({
        id: safeNumber(txGet(row, 'id') || row[0], Date.now()),
        type: (txGet(row, 'type') || row[1] || 'expense') as 'expense' | 'income' | 'transfer' | 'adjustment',
        amount: safeNumber(txGet(row, 'amount') || row[2], 0),
        category: txGet(row, 'category') || '',
        date: txGet(row, 'date') || row[4] || new Date().toISOString().split('T')[0],
        note: txGet(row, 'note') || undefined,
        tags: this.parseTags(txGet(row, 'tags')),
        merchant: txGet(row, 'merchant') || undefined,
        account: txGet(row, 'account') || undefined,
        fromAccount: txGet(row, 'fromAccount') || txGet(row, 'fromaccount') || undefined,
        toAccount: txGet(row, 'toAccount') || txGet(row, 'toaccount') || undefined,
      }));

      // Read accounts
      const accountData = await this.readSheet(spreadsheetId, SHEET_NAMES.accounts);
      const accHeaders = accountData[0] || [];
      const accGet = this.createRowMapper(accHeaders);
      const parseBoolean = (value: string | undefined): boolean => {
        if (!value) return false;
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes';
      };
      const accounts: Account[] = accountData.slice(1).map(row => ({
        id: safeNumber(accGet(row, 'id') || row[0], Date.now()),
        name: accGet(row, 'name') || row[1] || '未命名帳戶',
        type: (accGet(row, 'type') || row[2] || 'cash') as Account['type'],
        balance: safeNumber(accGet(row, 'balance') || row[3], 0),
        currency: accGet(row, 'currency') || 'TWD',
        isVirtual: parseBoolean(accGet(row, 'isVirtual') || row[5]),
        icon: accGet(row, 'icon') || undefined,
        color: accGet(row, 'color') || row[7] || row[6] || undefined,
      }));

      // Read categories
      const categoryData = await this.readSheet(spreadsheetId, SHEET_NAMES.categories);
      const catHeaders = categoryData[0] || [];
      const catGet = this.createRowMapper(catHeaders);
      const categories: Category[] = categoryData.slice(1).map(row => ({
        id: safeNumber(catGet(row, 'id') || row[0], Date.now()),
        name: catGet(row, 'name') || row[1] || '未分類',
        type: (catGet(row, 'type') || row[2] || 'expense') as 'expense' | 'income',
        icon: catGet(row, 'icon') || undefined,
      }));

      // Read tags
      const tagData = await this.readSheet(spreadsheetId, SHEET_NAMES.tags);
      const tagHeaders = tagData[0] || [];
      const tagGet = this.createRowMapper(tagHeaders);
      const tags: Tag[] = tagData.slice(1).map(row => ({
        id: safeNumber(tagGet(row, 'id') || row[0], Date.now()),
        name: tagGet(row, 'name') || row[1] || '未命名標籤',
        color: tagGet(row, 'color') || undefined,
      }));

      // Read merchants
      const merchantData = await this.readSheet(spreadsheetId, SHEET_NAMES.merchants);
      const merchantHeaders = merchantData[0] || [];
      const merchantGet = this.createRowMapper(merchantHeaders);
      const merchants: Merchant[] = merchantData.slice(1).map(row => ({
        id: safeNumber(merchantGet(row, 'id') || row[0], Date.now()),
        name: merchantGet(row, 'name') || row[1] || '未命名商家',
        category: merchantGet(row, 'category') || undefined,
      }));

      // Read currencies
      const currencyData = await this.readSheet(spreadsheetId, SHEET_NAMES.currencies);
      let currencies: Currency[] = [];
      if (currencyData && currencyData.length > 1) {
        const currencyHeaders = currencyData[0] || [];
        const currencyGet = this.createRowMapper(currencyHeaders);
        currencies = currencyData.slice(1).map(row => ({
          id: safeNumber(currencyGet(row, 'id') || row[0], Date.now()),
          code: currencyGet(row, 'code') || row[1] || '',
          name: currencyGet(row, 'name') || row[2] || '',
          symbol: currencyGet(row, 'symbol') || row[3] || '',
        }));
      } else {
        // Provide default currencies if sheet is empty or does not exist
        currencies = [
          { id: 1, code: 'TWD', name: '新台幣', symbol: 'NT$' },
          { id: 2, code: 'USD', name: '美元', symbol: '$' },
          { id: 3, code: 'EUR', name: '歐元', symbol: '€' },
          { id: 4, code: 'JPY', name: '日圓', symbol: '¥' },
          { id: 5, code: 'CNY', name: '人民幣', symbol: '¥' },
        ];
      }

      // Read metadata
      const metadataData = await this.readSheet(spreadsheetId, SHEET_NAMES.metadata);
      const metadata = Object.fromEntries(metadataData.slice(1));

      return {
        transactions,
        accounts,
        categories,
        tags,
        merchants,
        currencies,
        exportDate: metadata.exportDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error loading from Google Sheets:', error);
      return null;
    }
  }

  // Check if backup exists
  async hasBackup(): Promise<boolean> {
    try {
      const folderId = await this.findOrCreateFolder();
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
      const searchResponse = await this.fetchWithAuth(searchUrl);
      const searchResult = await searchResponse.json();
      return searchResult.files && searchResult.files.length > 0;
    } catch {
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
