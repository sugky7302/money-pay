# Google OAuth 設定指南

本應用程式使用 Google OAuth 2.0 進行使用者認證。請按照以下步驟設定 Google 憑證：

## 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點選「建立專案」或選擇現有專案
3. 為您的專案命名（例如：「CloudBudget」）

## 步驟 2：啟用 Google Sign-In API

1. 在 Google Cloud Console 中，前往「API 和服務」>「資訊主頁」
2. 點選「啟用 API 和服務」
3. 搜尋「Google+ API」或「Google Identity」並啟用

## 步驟 3：建立 OAuth 2.0 憑證

1. 前往「API 和服務」>「憑證」
2. 點選「建立憑證」>「OAuth 用戶端 ID」
3. 如果這是您第一次建立憑證，系統會要求您設定 OAuth 同意畫面：
   - 選擇「外部」使用者類型（除非您的組織使用 Google Workspace）
   - 填寫必要資訊：
     - 應用程式名稱：CloudBudget
     - 使用者支援電子郵件：您的電子郵件
     - 授權網域：（如果有自己的網域）
     - 開發人員聯絡資訊：您的電子郵件
   - 點選「儲存並繼續」
   - 在範圍設定中，點選「儲存並繼續」（基本範圍已足夠）
   - 在測試使用者中，新增您自己的 Google 帳號用於測試
   - 點選「儲存並繼續」

4. 回到「憑證」頁面，再次點選「建立憑證」>「OAuth 用戶端 ID」
5. 選擇應用程式類型：「網頁應用程式」
6. 設定已授權的 JavaScript 來源：
   ```
   http://localhost:5173
   https://yourdomain.com
   ```
7. 設定已授權的重新導向 URI：
   ```
   http://localhost:5173
   https://yourdomain.com
   ```
8. 點選「建立」
9. 記下您的「用戶端 ID」

## 步驟 4：設定環境變數

1. 在專案根目錄建立 `.env` 檔案：
   ```bash
   cp .env.example .env
   ```

2. 編輯 `.env` 檔案，加入您的 Google Client ID：
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

## 步驟 5：測試認證

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 在瀏覽器中開啟 http://localhost:5173

3. 您應該會看到登入頁面，點選「使用 Google 登入」按鈕

4. 選擇您的 Google 帳號並授權應用程式

5. 成功登入後，您應該會進入應用程式的主頁

## 部署到生產環境

### Cloudflare Workers

1. 在 Cloudflare Dashboard 中設定環境變數：
   - 前往您的 Worker 設定
   - 點選「Variables」標籤
   - 新增環境變數 `VITE_GOOGLE_CLIENT_ID`，值為您的 Google Client ID

2. 確保在 Google Cloud Console 中已將您的生產網域加入到已授權的 JavaScript 來源和重新導向 URI

### 其他部署平台

根據您使用的部署平台，設定環境變數的方式可能不同：

- **Vercel**: 在專案設定中的「Environment Variables」區域新增
- **Netlify**: 在「Site settings」>「Environment variables」中新增
- **其他平台**: 請參考該平台的環境變數設定文件

## 安全性注意事項

1. **絕對不要**將 `.env` 檔案提交到版本控制系統
2. **絕對不要**在前端程式碼中硬編碼 Client ID
3. 定期檢查 OAuth 同意畫面的設定
4. 監控 Google Cloud Console 中的 API 使用情況
5. 如果 Client ID 洩漏，立即在 Google Cloud Console 中撤銷並建立新的

### 重要：JWT Token 驗證

目前的實作僅在前端解析 JWT token 以顯示使用者資訊。這適用於基本的身份識別和 UI 顯示。

**生產環境建議**：
- 對於任何安全敏感的操作（如存取受保護的資源、API 呼叫等），應該在後端伺服器上驗證 JWT token
- 使用 Google 的 token verification library 或呼叫 Google 的 tokeninfo endpoint 進行驗證
- 不要完全信任前端解析的 JWT payload

範例後端驗證（使用 Node.js）：
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
```

## 疑難排解

### 問題：看不到 Google 登入按鈕

- 檢查瀏覽器控制台是否有錯誤訊息
- 確認 `VITE_GOOGLE_CLIENT_ID` 環境變數已正確設定
- 確認 Google Sign-In 腳本已成功載入

### 問題：點選登入後出現錯誤

- 確認您的網域已加入到 Google Cloud Console 的已授權來源
- 檢查 OAuth 同意畫面是否已正確設定
- 確認您的測試帳號已加入到測試使用者清單中（如果應用程式仍在測試模式）

### 問題：登入成功但立即登出

- 檢查瀏覽器的 localStorage 是否被封鎖
- 確認沒有瀏覽器擴充功能干擾 localStorage
- 嘗試在無痕視窗中測試

## 相關連結

- [Google Sign-In 文件](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 說明](https://developers.google.com/identity/protocols/oauth2)
