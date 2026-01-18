export interface Article {
  id: string; // Unique ID (URL or DOI)
  title: string;
  title_cn?: string;
  authors?: string;
  date: string;
  url: string;
  
  // Content
  abstract?: string; // English abstract
  abstract_cn?: string; // Chinese translation
  summary_cn?: string; // Chinese summary
  
  // Metadata for Caching
  first_seen: number; // Timestamp
  last_updated: number; // Timestamp
  is_new?: boolean; // UI flag for newly discovered articles
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: Article[];
  lastScanTime?: number;
}

export enum LoadingStage {
  IDLE = 'IDLE',
  LOADING_CACHE = 'LOADING_CACHE',
  CRAWLING = 'CRAWLING',
  ENRICHING = 'ENRICHING', // Calling external AI
  COMPLETE = 'COMPLETE',
}