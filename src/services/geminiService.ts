
import { GoogleGenAI } from "@google/genai";
import { LATEX_MATH_CONFIG } from "../utils/common";

export const callGeminiAPI = async (prompt: string): Promise<string> => {
  // Initialized strictly using process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const delays = [1000, 2000];

  const systemInstruction = `
    Bạn là một trợ lý giáo dục thông minh. 
    QUY TẮC QUAN TRỌNG: Bạn phải tuân thủ định dạng LaTeX cho công thức Toán, Lý, Hóa:
    ${JSON.stringify(LATEX_MATH_CONFIG, null, 2)}
    
    Khi giải thích:
    1. Dùng \\( ... \\) cho công thức trên cùng dòng.
    2. Dùng \\[ ... \\] cho công thức xuống dòng.
    3. Trình bày bằng Markdown sạch sẽ (Headers ###, Bold **, Bullet points -).
    4. Trả lời bằng tiếng Việt thân thiện, dễ hiểu.
  `;

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${systemInstruction}\n\nCâu hỏi: ${prompt}`,
      });
      // Extract text output using .text property (not a method).
      return response.text || "Không thể tạo nội dung.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (i === delays.length) return "AI đang bận, vui lòng thử lại sau.";
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
  return "Lỗi kết nối AI.";
};

export const getAIHint = callGeminiAPI;
