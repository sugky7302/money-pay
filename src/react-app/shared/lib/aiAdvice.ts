/**
 * aiAdvice.ts - AI 收支建議服務
 *
 * 功能說明：
 * 1. 呼叫後端 AI API 取得收支建議
 * 2. 處理請求錯誤和 fallback
 */

/** AI 建議請求資料 */
export interface AiAdviceRequest {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  avgMonthlyExpense: number;
  avgMonthlyIncome: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
  period: string;
}

/** AI 建議回應 */
export interface AiAdviceResponse {
  advice: string;
  source: 'ai' | 'fallback' | 'error';
}

/**
 * 取得 AI 收支建議
 * @param data 收支資料摘要
 * @returns AI 建議回應
 */
export async function getAiAdvice(data: AiAdviceRequest): Promise<AiAdviceResponse> {
  try {
    const response = await fetch('/api/ai-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get AI advice:', error);
    return {
      advice: '無法取得 AI 建議，請檢查網路連線後再試。',
      source: 'error',
    };
  }
}
