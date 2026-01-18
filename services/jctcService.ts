import { Article } from "../types";
import { crawlJCTCRawData } from "./geminiService";
import { generateArticleSummary } from "./myModelService";
import { loadCachedArticles, saveCachedArticles } from "./jctcStore";

/**
 * Main entry point for data refresh.
 * 1. Load Cache
 * 2. Crawl for fresh data (English only)
 * 3. Deduplicate
 * 4. Call External AI for NEW items only
 * 5. Save and Return
 */
export const refreshJctcData = async (
  onProgress?: (stage: string) => void
): Promise<Article[]> => {
  
  // 1. Load Cache
  if (onProgress) onProgress("Loading cached data...");
  const cachedMap = new Map<string, Article>();
  const cachedArticles = loadCachedArticles();
  
  cachedArticles.forEach(art => {
    cachedMap.set(art.id || art.url, art);
  });

  // 2. Crawl
  if (onProgress) onProgress("Crawling JCTC website (Gemini Grounding)...");
  let rawFreshArticles: Partial<Article>[] = [];
  try {
    rawFreshArticles = await crawlJCTCRawData();
  } catch (e) {
    console.error("Crawl failed, using cache only", e);
    // If crawl fails, return cache but notify? For now, simply return cache.
    // In a real app, we might throw or return a status object.
    return cachedArticles; 
  }

  // 3. Process & Identify New Items
  const finalArticles: Article[] = [];
  const articlesToEnrich: Article[] = [];

  for (const raw of rawFreshArticles) {
    const id = raw.url || raw.title || "unknown_id"; // Prefer URL as ID
    const existing = cachedMap.get(id);

    if (existing) {
      // It exists. 
      // Optional: Logic to update if "last_updated" is too old?
      // For now, we assume if we have it, we keep it.
      finalArticles.push({
        ...existing,
        is_new: false
      });
    } else {
      // It's New
      const newArticle: Article = {
        id: id,
        title: raw.title!,
        url: raw.url!,
        authors: raw.authors,
        date: raw.date || new Date().toISOString(),
        abstract: raw.abstract,
        first_seen: Date.now(),
        last_updated: Date.now(),
        is_new: true,
      };
      articlesToEnrich.push(newArticle);
    }
  }

  // 4. Enrich New Items (Call External AI)
  if (articlesToEnrich.length > 0) {
    if (onProgress) onProgress(`Enriching ${articlesToEnrich.length} new articles via External AI...`);
    
    // Process in parallel or sequence depending on API rate limits. 
    // Using Promise.all for speed.
    const enrichedPromises = articlesToEnrich.map(async (art) => {
      try {
        return await generateArticleSummary(art);
      } catch (e) {
        console.error(`Failed to enrich ${art.title}`, e);
        return art; // Return unenriched on fail
      }
    });

    const enrichedArticles = await Promise.all(enrichedPromises);
    finalArticles.push(...enrichedArticles);
  }

  // 5. Merge existing articles that weren't in the fresh scan?
  // (i.e., older articles not on the ASAP page anymore)
  // We should keep them so the history grows.
  const freshIds = new Set(finalArticles.map(a => a.id));
  cachedArticles.forEach(old => {
    if (!freshIds.has(old.id)) {
      finalArticles.push({ ...old, is_new: false });
    }
  });

  // Sort by date (conceptually, though date formats vary) or first_seen
  finalArticles.sort((a, b) => b.first_seen - a.first_seen);

  // 6. Save
  saveCachedArticles(finalArticles);
  
  return finalArticles;
};

export const getStoredData = (): Article[] => {
    return loadCachedArticles().sort((a, b) => b.first_seen - a.first_seen);
};