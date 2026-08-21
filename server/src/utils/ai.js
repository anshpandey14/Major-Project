import { GoogleGenAI } from "@google/genai";
import { ApiError } from "./api-error.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAIResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      content: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new ApiError(500, "Invalid response from Gemini");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);

    if (error.status === 401 || error.status === 403) {
      throw new ApiError(500, "Invalid Gemini API key");
    }

    if (error.status === 429) {
      throw new ApiError(429, "Gemini API rate limit exceeded");
    }

    if (error.status >= 500) {
      throw new ApiError(503, "Gemini AI seervice is temporarily unavailable");
    }

    throw new ApiError(500, error.message || "Unable to generate AI Response");
  }
};
