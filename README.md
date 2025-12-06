# Money Pay - 個人記帳應用程式

一個使用 React + Vite + Cloudflare Workers 建構的現代化個人記帳應用程式，支援 Google OAuth 登入和 Google Sheets 雲端同步。

## 功能特色

- 🔐 **Google OAuth 登入** - 安全的使用者認證
- ☁️ **雲端同步** - 資料自動同步到 Google Sheets
- 📱 **手機友善** - 響應式設計，觸控優化
- 📊 **收支報表** - 視覺化的財務分析
- 🧾 **發票掃描** - 支援台灣電子發票 QR Code
- 💳 **多帳戶管理** - 銀行、現金、電子支付、信用卡
- 🏷️ **分類與標籤** - 靈活的交易分類系統
- 💱 **多幣別支援** - 跨幣別轉帳和匯率計算

## 技術架構

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **後端**: Cloudflare Workers + Hono
- **認證**: Google OAuth 2.0 (redirect flow)
- **儲存**: localStorage + Google Sheets API
- **掃描**: @yudiel/react-qr-scanner

---

## 專案結構說明

### 頁面組件 (pages/)

| 檔案 | 說明 |
|------|------|
| `LoginPage.tsx` | 登入頁面 - Google OAuth 登入流程 (redirect flow) |
| `HomePage.tsx` | 首頁 - 餘額卡片、交易列表、快速新增 |
| `AccountsPage.tsx` | 帳戶頁面 - 帳戶列表、新增/編輯/刪除帳戶 |
| `ReportsPage.tsx` | 報表頁面 - 收支統計、分類圓餅圖、趨勢圖表 |
| `SettingsPage.tsx` | 設定頁面 - 雲端同步、資料管理、登出 |

### 功能組件 (features/)

| 檔案 | 說明 |
|------|------|
| `TransactionForm.tsx` | 交易表單 - 新增/編輯收入或支出，支援發票掃描 |
| `TransferForm.tsx` | 轉帳表單 - 帳戶間轉帳，支援跨幣別和手續費 |
| `AccountForm.tsx` | 帳戶表單 - 新增/編輯帳戶 (銀行/現金/電子支付/信用卡) |
| `CategoryForm.tsx` | 分類管理 - 新增/刪除收入或支出分類 |
| `TagForm.tsx` | 標籤管理 - 新增/刪除標籤 (含顏色選擇) |
| `MerchantForm.tsx` | 商家管理 - 新增/刪除商家 |
| `CurrencyForm.tsx` | 幣別管理 - 新增/編輯/刪除幣別 |
| `BalanceAdjustmentForm.tsx` | 餘額校正 - 調整帳戶實際餘額 |
| `CreditCardPaymentForm.tsx` | 信用卡還款 - 從帳戶還款到信用卡 |
| `InvoiceScan.tsx` | 發票掃描 - 掃描台灣電子發票雙 QR Code |
| `Search.tsx` | 搜尋功能 - 依日期/分類/標籤/金額篩選交易 |
| `GoogleOAuthWrapper.tsx` | OAuth 包裝 - 載入設定並提供 GoogleOAuthProvider |

### 小工具組件 (widgets/)

| 檔案 | 說明 |
|------|------|
| `TransactionList.tsx` | 交易列表 - 顯示交易記錄，支援詳情、編輯、刪除 |
| `BalanceCard.tsx` | 餘額卡片 - 總餘額、本月收支、信用卡欠款 |
| `AccountList.tsx` | 帳戶列表 - 依類型分組、拖曳排序、收合展開 |

### UI 組件 (shared/ui/)

| 檔案 | 說明 |
|------|------|
| `Button.tsx` | 按鈕 - 多種變體和大小 |
| `Input.tsx` | 輸入框 - 文字/數字/日期輸入 |
| `Select.tsx` | 下拉選單 - 基本選擇器 |
| `InputSelect.tsx` | 可搜尋下拉選單 - 手機底部彈出模式 |
| `Modal.tsx` | 彈窗 - 手機底部滑出/桌面置中 |
| `LoadingScreen.tsx` | 載入畫面 - 全螢幕載入動畫 |
| `InvoiceScanModal.tsx` | 發票掃描彈窗 - 包裝 InvoiceScan |
| `Toast.tsx` | 提示訊息 - 操作結果通知 |

### 共用庫 (shared/lib/)

| 檔案 | 說明 |
|------|------|
| `storage.ts` | 本機儲存 - localStorage 讀寫封裝 |
| `utils.ts` | 工具函數 - 格式化、計算、日期處理 |
| `parseInvoice.ts` | 發票解析 - 解析台灣電子發票 QR Code |
| `googleSheets.ts` | Google Sheets API - 雲端資料同步 |
| `useConfig.ts` | 設定 Hook - 載入環境變數或 API 設定 |
| `defaults.ts` | 預設資料 - 初始化用的空陣列 |

### 狀態管理

| 檔案 | 說明 |
|------|------|
| `AppContext.tsx` | 應用狀態 - 交易/帳戶/分類 CRUD、雲端同步 |
| `AuthContext.tsx` | 認證狀態 - 登入/登出、Token 管理 |
| `ToastContext.tsx` | 提示狀態 - 全域提示訊息 |
| `useUIStore.ts` | UI 狀態 - Zustand 管理的 UI 狀態 |

### 型別定義 (shared/types/)

| 檔案 | 說明 |
|------|------|
| `index.ts` | 型別定義 - Transaction, Account, Category, Tag 等 |

### Worker 後端 (worker/)

| 檔案 | 說明 |
|------|------|
| `index.ts` | Worker 入口 - CORS、安全標頭、路由 |
| `routes/config.ts` | Config API - 提供前端設定 (Google Client ID) |

---

## 檔案依賴關係

### 依賴層級架構

```
┌─────────────────────────────────────────────────────────────┐
│                         App 層                              │
│  (App, AppContent, MainContent, Contexts)                   │
├─────────────────────────────────────────────────────────────┤
│                        Pages 層                             │
│  (HomePage, AccountsPage, ReportsPage, SettingsPage, etc.)  │
├─────────────────────────────────────────────────────────────┤
│         Features 層              │        Widgets 層        │
│  (TransactionForm, TransferForm) │ (TransactionList, etc.)  │
├─────────────────────────────────────────────────────────────┤
│                       Shared 層                             │
│  (ui/, lib/, types/, stores/)                               │
└─────────────────────────────────────────────────────────────┘
```

**依賴規則**：上層可以依賴下層，同層可以互相依賴，下層不可依賴上層。

### App 層依賴

| 檔案 | 依賴 |
|------|------|
| `App.tsx` | `GoogleOAuthWrapper`, `AppContent`, `AppContext`, `AuthContext`, `ToastContext` |
| `AppContent.tsx` | `LoginPage`, `LoadingScreen`, `AuthContext`, `MainContent` |
| `MainContent.tsx` | `TransactionForm`, `TransferForm`, `CreditCardPaymentForm`, `AccountsPage`, `HomePage`, `ReportsPage`, `SettingsPage`, `AddMenu`, `TabBar`, `useUIStore` |
| `AppContext.tsx` | `googleSheets`, `storage`, `useConfig`, `ToastContext`, `types/*` |
| `AuthContext.tsx` | `googleSheets`, `storage`, `useConfig` |
| `ToastContext.tsx` | `Toast` |

### Pages 層依賴

| 檔案 | 依賴 |
|------|------|
| `HomePage.tsx` | `AppContext`, `Search`, `TransactionForm`, `useUIStore`, `types`, `BalanceCard`, `TransactionList` |
| `AccountsPage.tsx` | `AppContext`, `AccountForm`, `BalanceAdjustmentForm`, `utils`, `useUIStore`, `types`, `AccountList` |
| `ReportsPage.tsx` | `AppContext`, `utils`, `CategoryChart`, `CategoryPieChart` |
| `SettingsPage.tsx` | `AppContext`, `AuthContext`, `CategoryForm`, `CurrencyForm`, `MerchantForm`, `TagForm`, `useUIStore` |
| `LoginPage.tsx` | `AuthContext`, `ToastContext` |
| `AddMenu.tsx` | (無內部依賴) |
| `TabBar.tsx` | (無內部依賴) |

### Features 層依賴

| 檔案 | 依賴 |
|------|------|
| `TransactionForm.tsx` | `AppContext`, `parseInvoice`, `utils`, `types`, `Button`, `Input`, `InputSelect`, `InvoiceScanModal`, `Modal`, `Select` |
| `TransferForm.tsx` | `AppContext`, `utils`, `types`, `Button`, `Input`, `Modal`, `Select` |
| `AccountForm.tsx` | `AppContext`, `ToastContext`, `utils`, `types`, `Button`, `Input`, `Modal`, `Select` |
| `CategoryForm.tsx` | `AppContext`, `ToastContext`, `utils`, `types`, `Button`, `Input`, `Modal` |
| `TagForm.tsx` | `AppContext`, `ToastContext`, `utils`, `types`, `Button`, `Input`, `Modal` |
| `MerchantForm.tsx` | `AppContext`, `utils`, `types`, `Button`, `Input`, `Modal` |
| `CurrencyForm.tsx` | `AppContext`, `ToastContext`, `utils`, `types`, `Button`, `Input`, `Modal` |
| `BalanceAdjustmentForm.tsx` | `AppContext`, `utils`, `types`, `Input`, `Modal` |
| `CreditCardPaymentForm.tsx` | `AppContext`, `utils`, `types`, `Button`, `Input`, `Modal`, `Select` |
| `InvoiceScan.tsx` | (外部：@yudiel/react-qr-scanner) |
| `Search.tsx` | `AppContext`, `types`, `Modal`, `Input`, `Button` |
| `GoogleOAuthWrapper.tsx` | `useConfig`, `LoadingScreen` |

### Widgets 層依賴

| 檔案 | 依賴 |
|------|------|
| `TransactionList.tsx` | `AppContext`, `utils`, `types` |
| `BalanceCard.tsx` | `AppContext`, `utils` |
| `AccountList.tsx` | `AppContext`, `utils`, `types` |

### Shared 層依賴

| 檔案 | 依賴 |
|------|------|
| `lib/index.ts` | 匯出所有 lib 模組 |
| `lib/googleSheets.ts` | `types`, `storage` |
| `lib/storage.ts` | (無內部依賴) |
| `lib/utils.ts` | (無內部依賴) |
| `lib/parseInvoice.ts` | (無內部依賴) |
| `lib/useConfig.ts` | (無內部依賴) |
| `lib/defaults.ts` | `types` |
| `ui/InvoiceScanModal.tsx` | `parseInvoice` |
| `ui/*.tsx` | (無內部依賴) |
| `stores/useUIStore.ts` | (無內部依賴，使用 Zustand) |
| `types/index.ts` | (無內部依賴) |

### Worker 層依賴

| 檔案 | 依賴 |
|------|------|
| `index.ts` | `routes/config` |
| `routes/config.ts` | (無內部依賴，使用 Hono) |

### Context 使用一覽

| Context | 使用位置 |
|---------|----------|
| `AppContext` | HomePage, AccountsPage, ReportsPage, SettingsPage, 所有 Features (除 InvoiceScan, GoogleOAuthWrapper), 所有 Widgets |
| `AuthContext` | AppContent, LoginPage, SettingsPage |
| `ToastContext` | AppContext, LoginPage, AccountForm, CategoryForm, CurrencyForm, TagForm |
| `useUIStore` | MainContent, HomePage, AccountsPage, SettingsPage |

---

## 開始使用

### 前置需求

1. Node.js 18+
2. Google Cloud Project (OAuth 2.0)

### 安裝

```bash
npm install
```

### 設定 Google OAuth

```bash
# 複製環境變數範例
cp .env.example .env

# 編輯 .env 填入你的 Google Client ID
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

詳細設定請參考 [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

### 開發

```bash
npm run dev
```

開啟 [http://localhost:5173](http://localhost:5173)

### 建構與部署

```bash
# 建構
npm run build

# 本機預覽
npm run preview

# 部署到 Cloudflare Workers
npm run deploy
```

---

## 授權

MIT License
