import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface AnalysisResult {
  report: string;
  indicators: {
    rsi?: string;
    adx?: string;
    macd?: string;
    stochastic?: string;
    ma20?: string;
    ma50?: string;
    ma100?: string;
    ma200?: string;
  };
}

export async function analyzeAsset(asset: string, timeframe: string, imageBase64?: string): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const basePrompt = `
قم بدور محلل فني محترف وخبير في الأسواق المالية، وقم بتحليل الأصل التالي:
الأصل: ${asset || "غير محدد (من الصورة)"}
الفريم الزمني: ${timeframe || "غير محدد (من الصورة)"}

اعتمد في تحليلك على جميع المدارس الفنية التالية بشكل متكامل:

1. التحليل الكلاسيكي:
* تحديد الاتجاه العام (ترند صاعد / هابط / عرضي)
* رسم الدعوم والمقاومات الرئيسية
* تحليل النماذج السعرية (Head & Shoulders – Double Top/Bottom – Triangles – Flags)
* تحديد مناطق الكسر الحقيقي والاختراقات الوهمية

2. تحليل Smart Money Concept (SMC):
* تحديد مناطق Order Blocks (القوية فقط)
* تحديد مناطق Liquidity (Buy Side / Sell Side)
* تحليل Break of Structure (BOS) و Change of Character (CHOCH)
* تحديد مناطق Fair Value Gap (FVG)
* تحديد أفضل مناطق الدخول (Entry Zones)

3. تحليل Wyckoff:
* تحديد المرحلة الحالية (Accumulation / Distribution / Markup / Markdown)
* تحديد Spring / Upthrust إن وجد
* تحليل العلاقة بين السعر والفوليوم

4. المؤشرات الفنية (Technical Indicators):
* RSI: تحديد القيمة الحالية + التشبع الشرائي والبيعي + الدايفرجنس.
* ADX: تحديد القيمة الحالية + قياس قوة الترند.
* MACD: تحليل التقاطعات والزخم (Momentum).
* Stochastic: تحديد القيمة الحالية + مناطق التشبع.
* Moving Averages: تحديد القيم الحالية والتقاطعات لـ (MA20, MA50, MA100, MA200).
* Volume: تأكيد الحركة.

5. التحليل الزمني (Multi-Timeframe):
* تحليل الفريم الكبير (Trend)
* تحليل الفريم المتوسط (Structure)
* تحليل الفريم الصغير (Entry)

6. إدارة الصفقة:
* تحديد:
  • نقطة الدخول المثالية
  • وقف الخسارة (Stop Loss)
  • الهدف الأول (TP1)
  • الهدف الثاني (TP2)

7. السيناريوهات:
* السيناريو الأساسي (الأكثر احتمالاً)
* السيناريو البديل في حالة فشل التحليل

8. التقييم النهائي:
* نسبة نجاح الصفقة المتوقعة (٪)
* هل الصفقة مناسبة للسكالبينج أم سوينج؟

مهم جداً:
يجب أن يكون الرد بتنسيق JSON حصرياً كالتالي:
{
  "report": "نص التحليل الكامل بتنسيق Markdown هنا",
  "indicators": {
    "rsi": "القيمة الرقمية فقط (مثال: 65)",
    "adx": "القيمة الرقمية فقط (مثال: 25)",
    "macd": "الحالة (مثال: تقاطع إيجابي / سلبي)",
    "stochastic": "القيمة الرقمية",
    "ma20": "القيمة",
    "ma50": "القيمة",
    "ma100": "القيمة",
    "ma200": "القيمة"
  }
}
`;

  const prompt = imageBase64 
    ? basePrompt + "\n\nملاحظة: لقد قمت بإرفاق صورة للشارت، يرجى تحليلها بدقة واستخراج البيانات منها."
    : basePrompt;

  try {
    const contents = imageBase64 
      ? {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: imageBase64.split(",")[1],
              },
            },
          ],
        }
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: contents,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}
