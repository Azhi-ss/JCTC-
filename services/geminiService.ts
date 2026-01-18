import { GoogleGenAI } from "@google/genai";
import { Article } from "../types";

/**
 * This service now strictly handles the "Crawling" aspect using Gemini Search Grounding.
 * It fetches raw English data. Translation and Summarization are offloaded to the external API.
 */

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const crawlJCTCRawData = async (): Promise<Partial<Article>[]> => {
  const ai = getClient();
  const modelId = "gemini-3-flash-preview";

  // Prompt focused purely on extraction, not translation
  const prompt = `
    Find the 10 most recent "ASAP" (As Soon As Publishable) research articles from the "Journal of Chemical Theory and Computation" (JCTC) website (pubs.acs.org).
    
    For each article, extract:
    1. The full English title.
    2. The list of authors.
    3. The publication date.
    4. The direct URL.
    5. The full English abstract (or at least the first paragraph).

    STRICTLY output a VALID JSON ARRAY. 
    Do not include markdown formatting like \`\`\`json.
    Do not include any introductory or concluding text. 
    Just the raw JSON array.

    JSON Keys: "title", "authors", "date", "url", "abstract".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini Crawler");

    // Robust parsing: Find the first '[' and last ']' to ignore any conversational filler
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.error("Raw response was not an array:", text);
        throw new Error("Model response did not contain a JSON array.");
    }

    const jsonString = text.substring(firstBracket, lastBracket + 1);
    
    try {
      const rawArticles = JSON.parse(jsonString);
      // Validate and sanitize
      return rawArticles.filter((a: any) => a.title && a.url).map((a: any) => ({
        ...a,
        // Ensure we have a stable ID structure for later deduplication
        id: a.url, 
      }));
    } catch (parseError) {
      console.error("Crawler parse error", parseError, "JSON String:", jsonString);
      throw new Error("Failed to parse crawler results");
    }

  } catch (error: any) {
    console.error("Crawler Error:", error);
    throw new Error(error.message || "Crawler failed to retrieve articles");
  }
};

// Removed summarizeArticle from here as it is now in myModelService.ts