import { Article } from "../types";

const STORAGE_KEY = 'jctc_articles_cache_v1';

export const loadCachedArticles = (): Article[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load cache", e);
    return [];
  }
};

export const saveCachedArticles = (articles: Article[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error("Failed to save cache", e);
  }
};

export const clearCache = () => {
  localStorage.removeItem(STORAGE_KEY);
};