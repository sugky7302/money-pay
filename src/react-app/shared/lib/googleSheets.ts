// Google Sheets API service for reading and writing data to Google Drive
// Requires scope: https://www.googleapis.com/auth/drive.file

import { Account, Category, Merchant, Tag, Transaction } from '../types';
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
  exportDate: string;
}

// Sheet names for each data type
const SHEET_NAMES = {
  transactions: 'Transactions',
  accounts: 'Accounts',
  categories: 'Categories',
  tags: 'Tags',
  merchants: 'Merchants',
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
      return searchResult.files[0].id;
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
    const accountHeaders = ['id', 'name', 'type', 'balance', 'icon', 'color'];
    const accountRows = data.accounts.map(a => [
      a.id,
      a.name,
      a.type,
      a.balance,
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

    // Save metadata
    const metadataHeaders = ['key', 'value'];
    const metadataRows = [
      ['exportDate', data.exportDate],
      ['version', '2.0.0'],
    ];
    await this.writeSheet(spreadsheetId, SHEET_NAMES.metadata, metadataHeaders, metadataRows);
  }

  // Load all data from Google Sheets
  async loadFromGoogleSheets(): Promise<BackupData | null> {
    try {
      const spreadsheetId = await this.getSpreadsheetId();

      // Read transactions
      const transactionData = await this.readSheet(spreadsheetId, SHEET_NAMES.transactions);
      const transactions: Transaction[] = transactionData.slice(1).map(row => ({
        id: Number(row[0]),
        type: row[1] as 'expense' | 'income' | 'transfer',
        amount: Number(row[2]),
        category: row[3],
        date: row[4],
        note: row[5] || undefined,
        tags: row[6] ? JSON.parse(row[6]) : undefined,
        merchant: row[7] || undefined,
        account: row[8] || undefined,
        fromAccount: row[9] || undefined,
        toAccount: row[10] || undefined,
      }));

      // Read accounts
      const accountData = await this.readSheet(spreadsheetId, SHEET_NAMES.accounts);
      const accounts: Account[] = accountData.slice(1).map(row => ({
        id: Number(row[0]),
        name: row[1],
        type: row[2] as Account['type'],
        balance: Number(row[3]),
        icon: row[4] || undefined,
        color: row[5] || undefined,
      }));

      // Read categories
      const categoryData = await this.readSheet(spreadsheetId, SHEET_NAMES.categories);
      const categories: Category[] = categoryData.slice(1).map(row => ({
        id: Number(row[0]),
        name: row[1],
        type: row[2] as 'expense' | 'income',
        icon: row[3] || undefined,
      }));

      // Read tags
      const tagData = await this.readSheet(spreadsheetId, SHEET_NAMES.tags);
      const tags: Tag[] = tagData.slice(1).map(row => ({
        id: Number(row[0]),
        name: row[1],
        color: row[2] || undefined,
      }));

      // Read merchants
      const merchantData = await this.readSheet(spreadsheetId, SHEET_NAMES.merchants);
      const merchants: Merchant[] = merchantData.slice(1).map(row => ({
        id: Number(row[0]),
        name: row[1],
        category: row[2] || undefined,
      }));

      // Read metadata
      const metadataData = await this.readSheet(spreadsheetId, SHEET_NAMES.metadata);
      const metadata = Object.fromEntries(metadataData.slice(1));

      return {
        transactions,
        accounts,
        categories,
        tags,
        merchants,
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
