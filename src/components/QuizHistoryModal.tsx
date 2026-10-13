import React from 'react';
import { X, Trash2, Calendar, Trophy, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { StoredQuizRecord } from '../types/quiz.ts';

interface QuizHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: StoredQuizRecord[];
  onSelectRecord: (record: StoredQuizRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

export const QuizHistoryModal: React.FC<QuizHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord,
}) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182B3A]/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col shadow-xl border border-[#182B3A]/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Past Quizzes"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#182B3A]/10 flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D94C27]" />
            <div>
              <h3 className="text-base font-bold text-[#182B3A]">
                Past Quiz History
              </h3>
              <p className="text-xs text-[#182B3A]/60">
                {history.length} completed quiz session{history.length === 1 ? '' : 's'} saved locally
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#182B3A]/60 hover:text-[#182B3A] hover:bg-[#182B3A]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-[#182B3A]/60">
              <BookOpen className="w-10 h-10 mx-auto text-[#182B3A]/20 mb-2" />
              <p className="text-sm font-semibold text-[#182B3A]">No past quizzes yet</p>
              <p className="text-xs text-[#182B3A]/60 mt-1">
                Completed quiz results will be archived here for your review.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#182B3A]/10 bg-[#F7F5F0]/50 hover:bg-[#F7F5F0] transition-all flex items-center justify-between gap-3 group"
              >
                <div 
                  onClick={() => {
                    onSelectRecord(item);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#182B3A] line-clamp-1">
                      {item.topic}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-[#182B3A]/10 text-[#182B3A]/70 uppercase">
                      {item.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#182B3A]/60">
                    <span className="font-bold text-[#182B3A]">
                      {item.score}/{item.totalQuestions} ({item.percentage}%)
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.gradeBadge}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(item.completedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectRecord(item);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#182B3A] text-white text-xs font-semibold hover:bg-[#D94C27] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(item.id)}
                    className="p-1.5 rounded-lg text-[#182B3A]/40 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-[#182B3A]/10 bg-[#F7F5F0] flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Clear All History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#182B3A] bg-white border border-[#182B3A]/10 hover:bg-white/80 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
