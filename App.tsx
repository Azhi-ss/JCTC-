import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { refreshJctcData, getStoredData } from './services/jctcService';
import { Article } from './types';
import { Search, RotateCw, AlertCircle, FlaskConical, Database } from 'lucide-react';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Load cache on mount
  useEffect(() => {
    const cached = getStoredData();
    setArticles(cached);
  }, []);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setProgressMsg("Initializing...");
    
    try {
      // The refresh logic handles: Crawl -> Dedupe -> External AI call -> Cache Save
      const updatedData = await refreshJctcData((stage) => {
        setProgressMsg(stage);
      });
      setArticles(updatedData);
    } catch (err: any) {
      setError(err.message || "Failed to complete the refresh workflow.");
    } finally {
      setLoading(false);
    }
  };

  const hasArticles = articles.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Intro / Empty State (only if no cache and not loading) */}
        {!hasArticles && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full"></div>
              <div className="bg-white p-6 rounded-2xl shadow-xl ring-1 ring-slate-100 relative">
                <FlaskConical className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            
            <div className="max-w-lg space-y-4">
              <h2 className="text-3xl font-bold text-slate-900">JCTC Literature Scout</h2>
              <p className="text-slate-600 text-lg">
                Daily crawler for Journal of Chemical Theory and Computation.
                Scans for new articles, calls external AI for translation, and updates your local cache.
              </p>
            </div>

            <button
              onClick={handleScan}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/25 transition-all focus:ring-4 focus:ring-blue-500/20 active:scale-95"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Initialize Data
            </button>
          </div>
        )}

        {/* Loading State with Progress */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600 animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Refreshing Data...</h3>
                <p className="text-slate-500">{progressMsg}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && hasArticles && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Library <span className="text-slate-400 font-normal ml-2">({articles.length})</span>
              </h2>
              
              <button 
                onClick={handleScan}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Refresh Daily Scan
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold">Refresh Failed</p>
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

            <div className="grid gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        <p>© {new Date().getFullYear()} JCTC Scout • Powered by Gemini (Crawl) & Custom AI (Analysis)</p>
      </footer>
    </div>
  );
};

export default App;