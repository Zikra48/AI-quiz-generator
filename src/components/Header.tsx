import React from 'react';
import { Sparkles, GraduationCap, History, PlusCircle } from 'lucide-react';

interface HeaderProps {
  onNewQuiz: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isTakingQuiz: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewQuiz,
  onOpenHistory,
  historyCount,
  isTakingQuiz,
}) => {
  return (
    <header className="border-b border-[#182B3A]/10 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewQuiz} 
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNewQuiz(); }}
          aria-label="Quiz Studio Home"
        >
          <div className="w-10 h-10 rounded-xl bg-[#182B3A] text-white flex items-center justify-center shadow-sm group-hover:bg-[#D94C27] transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#182B3A]">
                Quiz<span className="text-[#D94C27]">Studio</span>
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#D94C27]/10 text-[#D94C27]">
                AI
              </span>
            </div>
            <p className="text-xs text-[#182B3A]/60 hidden sm:block">
              Academic Multiple-Choice Generator
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {historyCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#182B3A] hover:text-[#D94C27] bg-[#F7F5F0] hover:bg-[#F0ECE1] border border-[#182B3A]/10 rounded-lg transition-colors cursor-pointer"
              title="View past quiz attempts"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Past Quizzes</span>
              <span className="w-4 h-4 rounded-full bg-[#182B3A]/10 text-[10px] flex items-center justify-center font-semibold">
                {historyCount}
              </span>
            </button>
          )}

          {isTakingQuiz ? (
            <button
              onClick={onNewQuiz}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#182B3A]/70 hover:text-[#D94C27] hover:bg-[#F7F5F0] rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Quit & New Quiz</span>
            </button>
          ) : (
            <button
              onClick={onNewQuiz}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#182B3A] hover:bg-[#D94C27] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Quiz</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
