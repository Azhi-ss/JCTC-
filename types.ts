export interface Article {
  title: string;
  title_cn?: string;
  authors?: string;
  date: string;
  url: string;
  summary?: string;
  abstract?: string;
  abstract_cn?: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  data: Article[];
}

export enum LoadingStage {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
}