import React, { useState } from 'react';
import { HopeItem } from '../types';
import { Sun, Plus, Sparkles, Check, HeartHandshake, Coffee, Wind, Music, Smile, RefreshCw, RotateCcw, Trash2, X, Moon } from 'lucide-react';

interface HopeCapsuleSectionProps {
  onSaveHope: (hope: HopeItem) => void;
  onClearHopes?: () => void;
  onRemoveHope?: (id: string) => void;
  onEnterSleepMode?: () => void;
  savedHopes: HopeItem[];
}

const PRESET_HOPES: HopeItem[] = [
  {
    id: 'p1',
    title: '朝の陽の光と美味しい温かい一杯',
    detail: '目覚めたらカーテンを開けて光を浴び、好きな紅茶やコーヒーをゆっくり味わう。',
    category: '味覚・朝時間',
  },
  {
    id: 'p2',
    title: '他人の機嫌に巻き込まれない「心の透明バリア」',
    detail: '不機嫌な人がいても「それは相手の課題」と心の中で優しく受け流し、自分の穏やかさを守る。',
    category: '自分軸・安らぎ',
  },
  {
    id: 'p3',
    title: '自分のペースで深呼吸するお昼休み',
    detail: '誰にも急かされず、好きな音楽や散歩で自分をねぎらう時間を作る。',
    category: '休息・リセット',
  },
  {
    id: 'p4',
    title: '帰り道に見上げる綺麗な夕焼けや夜空',
    detail: '一日を無事に終えた自分に「今日もよくやった」と静かに心で拍手する。',
    category: '景色・達成感',
  },
];

export const HopeCapsuleSection: React.FC<HopeCapsuleSectionProps> = ({
  onSaveHope,
  onClearHopes,
  onRemoveHope,
  onEnterSleepMode,
  savedHopes,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customDetail, setCustomDetail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<HopeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'presets' | 'ai' | 'custom'>('presets');

  const handleGenerateAiHopes = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-hope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: 'restful' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: HopeItem[] = data.data.map((item: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          title: item.title,
          detail: item.detail,
          category: item.category || 'AIの提案',
        }));
        setAiSuggestions(mapped);
        setActiveTab('ai');
      }
    } catch (e) {
      console.error('Failed to generate hope:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newItem: HopeItem = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      detail: customDetail.trim() || '明日、自分らしく心地よく過ごすための小さな希望。',
      category: '自分への約束',
      custom: true,
    };

    onSaveHope(newItem);
    setCustomTitle('');
    setCustomDetail('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2.5 bg-amber-950/50 rounded-xl border border-amber-800/50 mb-3 text-amber-300">
          <Sun className="w-5 h-5 mr-2 text-amber-400" />
          <span className="text-sm font-medium tracking-wide">明日のための希望のカプセル</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">
          明日を少し楽しみにするための「小さな光」
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          大きな目標ではなく、朝の一杯のお茶や澄んだ空気など、<br className="hidden sm:inline" />
          確実にあなたを温めてくれる小さな楽しみを心に抱いて眠りにつきましょう。
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          定番の優しい希望
        </button>

        <button
          type="button"
          onClick={handleGenerateAiHopes}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center cursor-pointer ${
            activeTab === 'ai'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
          <span>AIが紡ぐ希望</span>
          {isGenerating && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'custom'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          自分で書く
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {PRESET_HOPES.map((hope) => {
            const isSaved = savedHopes.some((h) => h.title === hope.title);
            return (
              <div
                key={hope.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <span className="inline-block px-2 py-0.5 bg-amber-950/60 text-amber-300 text-[10px] rounded-md mb-2 font-medium">
                    {hope.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">{hope.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{hope.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSaveHope(hope)}
                  disabled={isSaved}
                  className={`mt-3 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>心に留めました</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>明日の希望に加える</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-3 mb-6">
          {aiSuggestions.length === 0 && !isGenerating && (
            <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <Sparkles className="w-8 h-8 mx-auto text-indigo-400 mb-2 opacity-80" />
              <p className="text-sm text-slate-300 mb-3">AIがあなたにぴったりの温かな希望の種を提案します</p>
              <button
                type="button"
                onClick={handleGenerateAiHopes}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                希望の種を生成する
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-indigo-300">明日の優しい光を紡いでいます…</p>
            </div>
          )}

          {aiSuggestions.map((hope) => {
            const isSaved = savedHopes.some((h) => h.title === hope.title);
            return (
              <div
                key={hope.id}
                className="bg-slate-950/70 border border-indigo-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="inline-block px-2 py-0.5 bg-indigo-950/70 text-indigo-300 text-[10px] rounded-md mb-1 font-medium">
                    {hope.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200">{hope.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{hope.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSaveHope(hope)}
                  disabled={isSaved}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium shrink-0 flex items-center transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>保存済み</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>希望に加える</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'custom' && (
        <form onSubmit={handleAddCustom} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              明日楽しみにしたい小さなこと（タイトル）
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="例：朝起きたら、お気に入りの曲を1曲聴く"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              一言メモ（任意）
            </label>
            <input
              type="text"
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              placeholder="例：急がず、ゆったりとした気持ちで家を出る。"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={!customTitle.trim()}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>明日の希望の種として保存する</span>
          </button>
        </form>
      )}

      {/* Saved Hope Seeds Summary */}
      <div className="border-t border-slate-800/80 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center">
            <Sun className="w-4 h-4 mr-1.5 text-amber-400" />
            <span>今夜心に抱いて眠る希望 ({savedHopes.length})</span>
          </h4>
          {savedHopes.length > 0 && onClearHopes && (
            <button
              type="button"
              onClick={onClearHopes}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="明日の希望をリセット"
            >
              <RotateCcw className="w-3 h-3 mr-1 text-slate-400" />
              <span>希望をリセット</span>
            </button>
          )}
        </div>

        {savedHopes.length > 0 ? (
          <div className="space-y-2">
            {savedHopes.map((h) => (
              <div
                key={h.id}
                className="bg-slate-950/80 border border-amber-900/30 rounded-xl p-3 flex items-center justify-between group hover:border-amber-700/50 transition-colors"
              >
                <div className="pr-3">
                  <span className="text-xs font-bold text-slate-200 block">{h.title}</span>
                  <span className="text-[11px] text-slate-400 block">{h.detail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400 text-xs">✨</span>
                  {onRemoveHope && (
                    <button
                      type="button"
                      onClick={() => onRemoveHope(h.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="削除"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
            <p className="text-slate-300 font-medium mb-1">今夜の希望はまだ選ばれていません</p>
            <p className="text-[11px] text-slate-500">
              上のプリセットから気になるものをタップするか、AIに希望を提案してもらいましょう。
            </p>
          </div>
        )}

        {/* Enter Sleep Mode with Tonight's Hope */}
        {onEnterSleepMode && (
          <div className="pt-6 mt-4 border-t border-slate-800/80 flex justify-center">
            <button
              type="button"
              id="enter-sleep-mode-from-hope"
              onClick={onEnterSleepMode}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 hover:from-indigo-900 hover:to-purple-950 text-amber-200 border border-amber-500/40 hover:border-amber-400 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2.5 transition-all shadow-xl shadow-indigo-950/80 cursor-pointer group"
              title="選んだ希望を心に宿して、おやすみ暗転画面へ"
            >
              <Moon className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>この願いを心に灯して「おやすみ暗転」へ</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
