import { GoogleGenAI } from "@google/genai";
import { Article } from "../types";

// Placeholder for your external API host. 
// In a real build, this might come from import.meta.env or process.env
const EXTERNAL_API_HOST = "https://api.my-custom-ai-host.com"; 

interface EnrichmentResponse {
  summary_cn: string;
  title_cn?: string;
  abstract_cn?: string;
}

export const generateArticleSummary = async (article: Article): Promise<Article> => {
  // If we already have a fresh summary, skip the network call (redundancy check)
  if (article.summary_cn) {
    return article;
  }

  const endpoint = `${EXTERNAL_API_HOST}/v1/jctc-summary`;
  
  // MOCK IMPLEMENTATION
  // If the host is the placeholder, we simulate the External API behavior.
  // To ensure the user sees unique, valid Chinese text for each article in this demo,
  // we will use the available Gemini key to generate the "response" of the external API.
  if (EXTERNAL_API_HOST.includes("my-custom-ai-host")) {
    console.log(`[MOCK] Calling External AI (simulated) for: ${article.title}`);
    
    try {
        // NOTE: In a production app using a real External API, this block would not exist.
        // We use Gemini here ONLY to mock the response of the external service for the demo.
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("No API Key for mock simulation");
        
        const ai = new GoogleGenAI({ apiKey });
        const modelId = "gemini-3-flash-preview";
        
        const prompt = `
          You are simulating an external translation API.
          Translate the following JCTC article metadata into Simplified Chinese.
          
          Input Title: "${article.title}"
          Input Abstract: "${article.abstract || "No abstract provided."}"

          Output JSON with keys:
          - title_cn: The title translated to Chinese.
          - summary_cn: A concise 1-2 sentence summary of the abstract in Chinese (academic style).
          - abstract_cn: A full translation of the abstract to Chinese.

          Do not use markdown. Return raw JSON.
        `;

        const resp = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        const text = resp.text || "{}";
        const json = JSON.parse(text);

        return {
            ...article,
            title_cn: json.title_cn || `[AI译] ${article.title}`,
            summary_cn: json.summary_cn || "摘要生成失败",
            abstract_cn: json.abstract_cn || "摘要翻译失败",
            last_updated: Date.now()
        };

    } catch (e) {
        console.warn("Mock simulation failed, falling back to static strings", e);
        // Fallback if Gemini simulation fails
        return {
            ...article,
            title_cn: `[AI译] ${article.title}`, 
            summary_cn: `(模拟数据 - API不可用) 关于 "${article.title}" 的中文总结... (API模拟失败)`,
            abstract_cn: `(模拟翻译) ${article.abstract?.substring(0, 100)}...`,
            last_updated: Date.now()
        };
    }
  }

  // REAL EXTERNAL API CALL
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if needed: 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: article.title,
        url: article.url,
        abstract: article.abstract,
        authors: article.authors,
        date: article.date
      })
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }

    const data: EnrichmentResponse = await response.json();

    return {
      ...article,
      summary_cn: data.summary_cn,
      title_cn: data.title_cn || article.title_cn, // Prefer API, fallback to existing
      abstract_cn: data.abstract_cn || article.abstract_cn,
      last_updated: Date.now()
    };

  } catch (error) {
    console.error("Failed to enrich article via External AI:", error);
    // Return original article on failure, can try again next refresh
    return article; 
  }
};