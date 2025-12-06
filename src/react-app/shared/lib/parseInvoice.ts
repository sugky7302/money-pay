/**
 * parseInvoice.ts - 台灣電子發票 QR Code 解析工具
 * 
 * 功能說明：
 * 1. 解析電子發票 QR Code 資料
 * 2. 轉換民國年為西元年
 * 3. 擷取發票金額和日期
 * 4. 擷取賣家統編
 */

/** 解析後的發票資料介面 */
export interface ParsedInvoice {
  number?: string;
  date?: string; // yyyy-mm-dd
  amount?: number;
  merchant?: string;
  note?: string;
  sellerId?: string;
}

/**
 * 將民國年日期轉換為西元年日期
 * @param raw - 民國年日期字串（7位數字，例如：1140105）
 * @returns 西元年日期字串（格式：YYYY-MM-DD）或 undefined
 */
const toTWDate = (raw: string): string | undefined => {
  if (!/^[0-9]{7}$/.test(raw)) return undefined;

  const y = Number(raw.slice(0, 3));
  const m = Number(raw.slice(3, 5));
  const d = Number(raw.slice(5, 7));

  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined;
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined;

  const year = 1911 + y;
  const date = new Date(year, m - 1, d);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return undefined;
  }

  // Return local yyyy-MM-dd to avoid timezone shifts when slicing ISO.
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

/**
 * 解析電子發票 QR Code 內容
 * @param payload - QR Code 掃描得到的原始字串
 * @returns 解析後的發票資料（包含發票號碼、日期、金額、賣家統編）
 */
export const parseInvoicePayload = (payload: string): ParsedInvoice => {
  if (!payload) return {};

  const text = payload.trim();
  if (text.length < 37) return {};

  const number = text.slice(0, 10);
  const dateRaw = text.slice(10, 17);
  const totalHex = text.slice(29, 37);
  const amount = /^[0-9A-Fa-f]+$/.test(totalHex) ? parseInt(totalHex, 16) : undefined;
  const date = toTWDate(dateRaw);
  const sellerId = text.length >= 53 ? text.slice(45, 53) : undefined;

  return {
    number,
    date,
    amount,
    sellerId,
    note: number ? `發票 ${number}` : undefined,
  };
};
