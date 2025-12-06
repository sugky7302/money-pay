/**
 * AI Advice API - AI 收支建議 API
 *
 * 功能說明：
 * 1. 接收使用者的收支資料摘要
 * 2. 使用 Cloudflare Workers AI 生成收支建議
 * 3. 回傳個人化的財務建議
 */

import { Hono } from "hono";

const aiAdvice = new Hono<{ Bindings: Env }>();
/** 從環境變數取得 AI 模型名稱，預設為 Llama 3.1-8b-instruct */
function getModelName(env: Env): string {
  return env.MODEL_NAME || '@cf/meta/llama-3.1-8b-instruct';
}

/** 請求資料介面 */
interface AdviceRequest {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  avgMonthlyExpense: number;
  avgMonthlyIncome: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  period: string;
}

/**
 * 生成 AI 提示詞
 */
function buildPrompt(data: AdviceRequest): string {
  const categoryList = data.topCategories
    .map((c, i) => `${i + 1}. ${c.category}: NT$${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`)
    .join('\n');

  const trendList = data.monthlyTrend
    .slice(-3)
    .map(m => `${m.month}: 收入 NT$${m.income.toLocaleString()}, 支出 NT$${m.expense.toLocaleString()}`)
    .join('\n');

  return `你是一位專業的個人理財顧問。請根據以下使用者的收支資料，提供簡潔實用的財務建議。

## 收支摘要（${data.period}）
- 總收入：NT$${data.totalIncome.toLocaleString()}
- 總支出：NT$${data.totalExpense.toLocaleString()}
- 淨收支：NT$${data.netBalance.toLocaleString()}
- 平均月收入：NT$${data.avgMonthlyIncome.toLocaleString()}
- 平均月支出：NT$${data.avgMonthlyExpense.toLocaleString()}

## 支出分類排行
${categoryList || '無資料'}

## 近期趨勢
${trendList || '無資料'}

請用繁體中文提供 3-5 條具體、可執行的建議，每條建議用一句話說明。格式如下：
1. 💡 [建議標題]：[具體說明]

注意：
- 針對使用者的實際數據給出具體建議
- 如果淨收支為負，優先建議如何減少支出
- 如果某個分類支出佔比過高，給出具體改善建議
- 建議要實際可行，不要太籠統`;
}

// POST /api/ai-advice - 取得 AI 收支建議
aiAdvice.post("/", async (c) => {
  try {
    const data = await c.req.json<AdviceRequest>();

    // 驗證必要欄位
    if (typeof data.totalIncome !== 'number' || typeof data.totalExpense !== 'number') {
      return c.json({ error: '缺少必要的收支資料' }, 400);
    }

    // 檢查是否有 AI binding
    const ai = (c.env as any).AI;
    if (!ai) {
      // 如果沒有 AI binding，回傳預設建議
      return c.json({
        advice: generateFallbackAdvice(data),
        source: 'fallback',
      });
    }

    // 使用 Cloudflare Workers AI
    const prompt = buildPrompt(data);
    const modelName = getModelName(c.env as Env);
    const response = await ai.run(modelName, {
      input: `你是一位專業的個人理財顧問，專門提供繁體中文的財務建議。\n\n${prompt}`,
      max_tokens: 500,
    });

    return c.json({
      advice: response.response || generateFallbackAdvice(data),
      source: 'ai',
    });
  } catch (error) {
    console.error('AI advice error:', error);
    return c.json({
      advice: '無法取得 AI 建議，請稍後再試。',
      source: 'error',
    }, 500);
  }
});

/**
 * 生成備用建議（當 AI 不可用時）
 */
function generateFallbackAdvice(data: AdviceRequest): string {
  const tips: string[] = [];
  const savingsRate = data.totalIncome > 0 
    ? ((data.totalIncome - data.totalExpense) / data.totalIncome * 100)
    : 0;

  // 基於淨收支的建議
  if (data.netBalance < 0) {
    tips.push('💡 收支失衡：您的支出超過收入，建議優先檢視非必要支出，設定每月預算上限。');
  } else if (savingsRate < 10) {
    tips.push('💡 儲蓄率偏低：建議將儲蓄率提高到收入的 10-20%，可設定自動轉帳到儲蓄帳戶。');
  } else if (savingsRate >= 20) {
    tips.push('💡 儲蓄習慣良好：您的儲蓄率達到 ' + savingsRate.toFixed(0) + '%，可以考慮將部分資金進行投資理財。');
  }

  // 基於分類的建議
  if (data.topCategories.length > 0) {
    const topCategory = data.topCategories[0];
    if (topCategory.percentage > 40) {
      tips.push(`💡 支出集中：「${topCategory.category}」佔支出 ${topCategory.percentage.toFixed(0)}%，建議檢視是否有優化空間。`);
    }
  }

  // 基於趨勢的建議
  if (data.monthlyTrend.length >= 2) {
    const recent = data.monthlyTrend.slice(-2);
    const expenseTrend = recent[1].expense - recent[0].expense;
    if (expenseTrend > recent[0].expense * 0.2) {
      tips.push('💡 支出上升：近期支出有明顯上升趨勢，建議檢視是否有非預期的花費。');
    }
  }

  // 通用建議
  tips.push('💡 記帳習慣：持續記錄每筆支出，有助於更清楚掌握金錢流向。');

  if (tips.length < 3) {
    tips.push('💡 緊急預備金：建議準備 3-6 個月的生活費作為緊急預備金。');
  }

  return tips.slice(0, 5).join('\n\n');
}

export default aiAdvice;
