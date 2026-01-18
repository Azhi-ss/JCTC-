import React, { useState } from 'react';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { fetchJCTCArticles } from './services/geminiService';
import { Article } from './types';
import { Search, RotateCw, AlertCircle, FlaskConical } from 'lucide-react';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const data = await fetchJCTCArticles();
      setArticles(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch articles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Intro / Empty State */}
        {!hasSearched && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full"></div>
              <div className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-slate-100 relative">
                <FlaskConical className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            
            <div className="max-w-lg space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">Latest JCTC Research</h2>
              <p className="text-slate-600 text-lg">
                Use Gemini AI to scan the web for the most recent <i>ASAP</i> articles from the Journal of Chemical Theory and Computation.
              </p>
            </div>

            <button
              onClick={handleScan}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/25 transition-all focus:ring-4 focus:ring-blue-500/20 active:scale-95"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Scan for Literature
            </button>
            
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Note: This tool uses Google Search Grounding to discover public article data.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Scanning ACS Publications...</h3>
                <p className="text-slate-500">Gemini is finding the latest ASAP articles for you.</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Latest Results <span className="text-slate-400 font-normal ml-2">({articles.length})</span>
              </h2>
              
              <button 
                onClick={handleScan}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Refresh Scan
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold">Scan Failed</p>
                    <p className="text-sm opacity-90">{error}</p>
                    <button 
                        onClick={handleScan}
                        className="mt-2 text-sm underline hover:text-red-800 font-medium"
                    >
                        Try Again
                    </button>
                </div>
              </div>
            )}

            {articles.length === 0 && !error && (
                 <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <p className="text-slate-500">No articles found. Try refreshing the scan.</p>
                 </div>
            )}

            <div className="grid gap-4">
              {articles.map((article, index) => (
                <ArticleCard key={`${article.url}-${index}`} article={article} />
              ))}
            </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        <p>© {new Date().getFullYear()} JCTC Scout • Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;