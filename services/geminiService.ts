import { GoogleGenAI } from "@google/genai";
import { Article } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchJCTCArticles = async (): Promise<Article[]> => {
  const ai = getClient();
  
  // We use gemini-3-flash-preview for fast reasoning + search capabilities
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Find the 10 most recent "ASAP" (As Soon As Publishable) research articles from the "Journal of Chemical Theory and Computation" (JCTC) website (pubs.acs.org).
    
    For each article found, extract:
    1. The full English title.
    2. Translate the title into Simplified Chinese (as title_cn).
    3. The list of authors (as a string).
    4. The publication date (e.g., "October 24, 2023").
    5. The direct URL to the article on pubs.acs.org.
    6. A brief version of the English abstract (approx. 2-3 sentences).
    7. Translate this abstract into concise, academic-style Simplified Chinese (as abstract_cn).

    Format the output as a strict JSON array of objects. 
    Each object must have the keys: "title", "title_cn", "authors", "date", "url", "abstract", "abstract_cn".
    Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.
    If you cannot find exact dates, approximate based on the search result snippets.
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
    
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Clean up potential markdown code blocks if the model ignores the instruction
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const articles: Article[] = JSON.parse(cleanedText);
      
      // Post-process to ensure we have valid URLs from grounding if needed, 
      // but for this specific "scrape" task, we rely on the model's extraction capability first.
      // If the model fails to return valid JSON, the catch block will handle it.
      
      return articles.filter(a => a.title && a.url); // Simple validation
    } catch (parseError) {
      console.error("Failed to parse JSON from Gemini response:", text);
      // Fallback: Try to extract links from grounding chunks if JSON parsing fails completely
      // Ideally, we would have a more robust fallback, but for this demo, we throw to UI.
      throw new Error("Failed to parse article data. Please try again.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An error occurred while fetching articles.");
  }
};

export const summarizeArticle = async (articleTitle: string, articleUrl: string): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Provide a concise, 2-sentence summary of the scientific significance of the article titled "${articleTitle}".
    Write the summary in Simplified Chinese.
    Assume the audience is a computational chemist.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Could not generate summary.";
  }
};