/**
 * index.ts - Shared Lib 匯出入口
 *
 * 功能說明：
 * 統一匯出所有共用工具函數和服務
 */

export * from './aiAdvice';
export * from './defaults';
export * from './googleSheets';
export * from './parseInvoice';
export * from './storage';
export { prefetchConfig, useConfig } from "./useConfig";
export * from './utils';

