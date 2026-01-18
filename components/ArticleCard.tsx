import React, { useState } from 'react';
import { Article } from '../types';
import { ExternalLink, Users, Calendar, ChevronDown, ChevronUp, BookOpen, FileText, Globe } from 'lucide-react';
import { generateArticleSummary } from '../services/myModelService'; // Optional if we want manual retry

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);
  const [localSummary, setLocalSummary] = useState<string | undefined>(article.summary_cn);
  const [loadingRetry, setLoadingRetry] = useState(false);

  // Handle case where summary is missing (maybe API failed during scan)
  const handleRetrySummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingRetry) return;
    
    setLoadingRetry(true);
    setIsSummaryExpanded(true);
    try {
        const updated = await generateArticleSummary(article);
        setLocalSummary(updated.summary_cn || "Generation failed.");
    } catch(e) {
        setLocalSummary("Failed to retrieve summary.");
    } finally {
        setLoadingRetry(false);
    }
  };

  const hasSummary = Boolean(localSummary);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden group ${article.is_new ? 'ring-2 ring-green-100' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
             {article.is_new && (
                <span className="inline-block px-2 py-0.5 mb-2 text-xs font-bold text-green-700 bg-green-100 rounded-md uppercase tracking-wide">
                    New
                </span>
             )}
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group-hover:text-blue-600 transition-colors block"
            >
              <h3 className="text-lg font-semibold text-slate-900 leading-tight mb-1">
                {article.title}
              </h3>
              {article.title_cn && (
                <p className="text-base text-slate-600 font-medium leading-tight mb-2">
                  {article.title_cn}
                </p>
              )}
            </a>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{article.date}</span>
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="line-clamp-1">{article.authors || "Unknown Authors"}</span>
              </div>
            </div>
          </div>
          
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Read Article on ACS"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2">
           <button
            onClick={(e) => hasSummary ? setIsSummaryExpanded(!isSummaryExpanded) : handleRetrySummary(e)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isSummaryExpanded 
                ? 'bg-blue-50 text-blue-700' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            {loadingRetry ? (
               <div className="w-4 h-4 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
                <Globe className="w-4 h-4" />
            )}
            
            {hasSummary 
                ? (isSummaryExpanded ? "隐藏中文总结" : "中文总结") 
                : "生成中文总结"
            }
            {hasSummary && (isSummaryExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />)}
          </button>

          <button
            onClick={() => setShowAbstract(!showAbstract)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${showAbstract 
                ? 'bg-slate-100 text-slate-700' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            {showAbstract ? "隐藏摘要" : "显示摘要"}
            {showAbstract ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </button>
        </div>

        {isSummaryExpanded && hasSummary && (
           <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex gap-3">
               <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
               <div className="text-slate-700 text-sm leading-relaxed">
                   {localSummary}
               </div>
             </div>
           </div>
        )}

        {showAbstract && (
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">English Abstract</h4>
               <p className="text-sm text-slate-700 leading-relaxed text-justify">
                 {article.abstract || "No abstract available."}
               </p>
            </div>
            <div>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">中文摘要 (Translated)</h4>
               <p className="text-sm text-slate-700 leading-relaxed text-justify">
                 {article.abstract_cn || "暂未提供摘要的中文翻译。"}
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};