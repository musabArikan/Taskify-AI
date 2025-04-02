import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiService = {
  async getAdvice(content) {
    try {
      const prompt = `
        I'm going to give you a piece of content. Analyze this content and provide relevant, helpful advice about it.
        
        Content: "${content}"
        
        Important rules:
        1. DETECT THE LANGUAGE of the content and respond in THE SAME LANGUAGE as the input.
        2. If the content is about a plan, activity, or task, provide practical advice for it.
        3. If the content mentions a specific topic (e.g., shopping, travel, meeting, buying tickets), give topic-specific advice.
        4. Format your response using valid HTML elements for better readability:
           - Use <strong> or <b> for emphasis and important points
           - Use <br> for line breaks
           - Use <ul> and <li> for lists
           - Use <h3> for section headings if needed
        5. Keep your advice concise and practical, no more than 3-5 sentences.
        6. If the content is completely nonsensical, respond with "ERROR: Please provide valid content." in the SAME LANGUAGE as the input.
        7. Do not mention that you detected the language in your response.
        8. Make sure your HTML is valid and properly formatted.
        9. DO NOT INCLUDE any visible HTML tags in your output like <html>, <body>, <p> at the beginning and end of your response.
        10. Your output must be ready to be inserted directly into an HTML element with dangerouslySetInnerHTML.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text.includes("ERROR:")) {
        return { error: true, message: text.replace("ERROR:", "").trim() };
      }

      return { error: false, text };
    } catch (error) {
      console.error("AI advice generation failed:", error);
      throw new Error("AI advice generation failed: " + error.message);
    }
  },

  async fixGrammar(content) {
    try {
      const prompt = `
        You are a professional proofreader. I'll give you a text that may contain spelling or grammar errors.
        
        Text: "${content}"
        
        Important rules:
        1. DETECT THE LANGUAGE of the text automatically.
        2. Fix any spelling, grammar, and punctuation errors in THE SAME LANGUAGE as the input.
        3. Preserve the original meaning, style, and tone - only fix errors.
        4. Start your response with "Corrected:" followed by the fixed text.
        5. If the text is already correct, respond with "ERROR: The text is already correct." in THE SAME LANGUAGE as the input.
        6. Do not explain or comment on the corrections, just provide the fixed text.
        7. Do not mention that you detected the language in your response.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text.includes("ERROR:")) {
        return { error: true, message: text.replace("ERROR:", "").trim() };
      }

      return { error: false, text };
    } catch (error) {
      console.error("Grammar fix error:", error);
      throw new Error("Grammar correction failed: " + error.message);
    }
  },
};
