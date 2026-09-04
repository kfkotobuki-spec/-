import React from 'react';
import { ReleasedMemory } from '../types';
import { Sparkles, Sun, X, Trash2, MoonStar, Calendar } from 'lucide-react';

interface StarGardenModalProps {
  isOpen: boolean;
  onClose: () => void;
  releasedMemories: ReleasedMemory[];
  onClearHistory: () => void;
}

export const StarGardenModal: React.FC<StarGardenModalProps> = ({
  isOpen,
  onClose,
  releasedMemories,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const totalStars = releasedMemories.reduce((acc, m) => acc + (m.starsGenerated || 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">手放した星たちの庭</h3>
              <p className="text-xs text-slate-400">
                夜空へと昇華された重荷と、心に芽生えた希望の記録
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary bar */}
        <div className="px-5 py-3.5 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center justify-between text-center">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-[11px] text-indigo-300 block">手放した重荷</span>
              <span className="text-xl font-bold text-white font-mono">{releasedMemories.length}</span>
              <span className="text-xs text-indigo-300 ml-0.5">件</span>
            </div>
            <div className="w-px h-8 bg-indigo-800/40" />
            <div>
              <span className="text-[11px] text-amber-300 block">夜空に輝く浄化の星屑</span>
              <span className="text-xl font-bold text-amber-300 font-mono">{totalStars}</span>
              <span className="text-xs text-amber-300 ml-0.5">個の光</span>
            </div>
          </div>

          {releasedMemories.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 flex items-center space-x-1 transition-colors cursor-pointer"
              title="星の庭をリセットして0件にする"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>星の庭をリセット</span>
            </button>
          )}
        </div>

        {/* List of past released memories */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
          {releasedMemories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MoonStar className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-300 font-medium">まだ手放しの記録はありません</p>
              <p className="text-xs text-slate-500 mt-1">
                今日あった嫌なことを手放すと、ここに輝く星として刻まれます。
              </p>
            </div>
          ) : (
            releasedMemories.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 rounded-md text-[10px] font-medium">
                      {item.ritualType === 'stardust' && '✨ 星屑'}
                      {item.ritualType === 'lantern' && '🏮 ランタン'}
                      {item.ritualType === 'waves' && '🌊 波音'}
                      {item.ritualType === 'candle' && '🕯️ 灯火'}
                      {item.ritualType === 'bubbles' && '🫧 泡'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200">
                      {item.summaryTitle || '手放した夜の記憶'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.dateStr}
                  </span>
                </div>

                {item.cleansingAffirmation && (
                  <p className="text-xs text-amber-200/90 italic mb-2 bg-amber-950/30 p-2 rounded-lg border border-amber-900/30">
                    "{item.cleansingAffirmation}"
                  </p>
                )}

                {item.hopeSeed && (
                  <div className="flex items-start text-xs text-teal-300">
                    <Sun className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5 text-teal-400" />
                    <span>{item.hopeSeed}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          {releasedMemories.length > 0 ? (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>星の庭をリセット (履歴消去)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">今夜の手放しで新しい星がここに灯ります</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
