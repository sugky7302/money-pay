/**
 * defaults.ts - 預設資料
 *
 * 功能說明：
 * 1. 提供交易、帳戶、分類的預設空陣列
 * 2. 作為應用程式初始化時的預設值
 */

import { Account, Category, Transaction } from '../types';

export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_ACCOUNTS: Account[] = [];

export const DEFAULT_CATEGORIES: Category[] = [];
