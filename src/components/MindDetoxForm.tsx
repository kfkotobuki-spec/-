import React, { useState } from 'react';
import { RitualType, RitualOption } from '../types';
import { Sparkles, Flame, Waves, Feather, Disc3, ShieldAlert, MoonStar, SendHorizontal, Trash2 } from 'lucide-react';

interface MindDetoxFormProps {
  onStartPurification: (text: string, tags: string[], ritual: RitualType) => void;
  isLoading: boolean;
}

const RITUAL_OPTIONS: RitualOption[] = [
  {
    id: 'stardust',
    name: '星屑への昇華',
    subtitle: 'Stardust Dissolution',
    description: '重い言葉を幾千の光る星屑に変え、夜空の彼方へ放ちます',
    iconName: 'Sparkles',
    accentColor: 'from-amber-300 to-indigo-400',
  },
  {
    id: 'lantern',
    name: '夜空のランタン',
    subtitle: 'Sky Lantern',
    description: '温かな灯籠に思いをのせ、静かな天の川へと浮かべます',
    iconName: 'Feather',
    accentColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 'waves',
    name: '月夜の波音',
    subtitle: 'Moonlit Waves',
    description: '月明かりの寄せる波が、嫌な感情をきれいに洗い流します',
    iconName: 'Waves',
    accentColor: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'candle',
    name: '浄化の灯火',
    subtitle: 'Purifying Flame',
    description: '穏やかなキャンドルの火が、モヤモヤを心地よい煙に変えて消し去ります',
    iconName: 'Flame',
    accentColor: 'from-rose-400 to-purple-500',
  },
  {
    id: 'bubbles',
    name: '夜の静かな泡',
    subtitle: 'Moon Bubbles',
    description: '虹色の泡に苦しみを閉じ込め、夜空でふわりと弾けさせます',
    iconName: 'Disc3',
    accentColor: 'from-teal-300 to-indigo-300',
  },
];

const PRESET_TAGS = [
  { label: '誰かの心無い言葉', icon: '💬' },
  { label: '理不尽な態度・不機嫌', icon: '⚡' },
  { label: '自分のミス・失敗', icon: '🥀' },
  { label: '人間関係のモヤモヤ', icon: '🌀' },
  { label: '重いプレッシャー', icon: '⚓' },
  { label: '自分を責める気持ち', icon: '🩹' },
];

export const MindDetoxForm: React.FC<MindDetoxFormProps> = ({ onStartPurification, isLoading }) => {
  const [burdenText, setBurdenText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRitual, setSelectedRitual] = useState<RitualType>('stardust');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleQuickAdd = (tagLabel: string) => {
    toggleTag(tagLabel);
    if (!burdenText.includes(tagLabel)) {
      const addition = burdenText ? `\n・${tagLabel}についての出来事` : `今日、${tagLabel}があって心が苦しくなりました。`;
      setBurdenText((prev) => prev + addition);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!burdenText.trim() || isLoading) return;
    onStartPurification(burdenText.trim(), selectedTags, selectedRitual);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Soft atmospheric background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2.5 bg-indigo-950/60 rounded-xl border border-indigo-800/50 mb-3 text-indigo-300">
          <MoonStar className="w-5 h-5 mr-2 text-amber-300" />
          <span className="text-sm font-medium tracking-wide">夜の心のデトックス</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">
          今日あった嫌なこと、すべてここに置いていきませんか？
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
          他人の心無い言動、理不尽な対応、自分の失敗や後悔…。<br className="hidden sm:inline" />
          あなたの夜と眠りを奪う権利は誰にもありません。すべて夜空に解き放ちましょう。
        </p>
      </div>

      {/* Quick Preset Tags */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          当てはまる心の重荷をタップ（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.label);
            return (
              <button
                key={tag.label}
                type="button"
                id={`tag-btn-${tag.label}`}
                onClick={() => handleQuickAdd(tag.label)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/90 text-white border border-indigo-400 shadow-sm shadow-indigo-500/30 scale-102'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <span className="mr-1.5">{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Area Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center">
              <span>胸の内をありのままに吐き出す</span>
              <span className="ml-2 text-xs text-slate-500 font-normal">（誰にも見られず、夜空に消えます）</span>
            </label>
            {burdenText && (
              <button
                type="button"
                onClick={() => setBurdenText('')}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                クリア
              </button>
            )}
          </div>
          <textarea
            id="burden-input-textarea"
            value={burdenText}
            onChange={(e) => setBurdenText(e.target.value)}
            rows={4}
            placeholder="例：今日、職場で理不尽な言い方をされてとても傷ついた。自分のミスもあって落ち込んでいる。ずっと頭から離れなくて苦しい…"
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Ritual Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            手放し・浄化の儀式を選ぶ
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {RITUAL_OPTIONS.map((ritual) => {
              const isSelected = selectedRitual === ritual.id;
              return (
                <button
                  key={ritual.id}
                  type="button"
                  id={`ritual-select-${ritual.id}`}
                  onClick={() => setSelectedRitual(ritual.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col items-center text-center cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-400 shadow-md shadow-indigo-950'
                      : 'bg-slate-950/40 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br ${
                      isSelected ? ritual.accentColor : 'from-slate-800 to-slate-900 text-slate-400'
                    } ${isSelected ? 'text-slate-950 font-bold shadow-sm' : ''}`}
                  >
                    {ritual.id === 'stardust' && <Sparkles className="w-5 h-5" />}
                    {ritual.id === 'lantern' && <Feather className="w-5 h-5" />}
                    {ritual.id === 'waves' && <Waves className="w-5 h-5" />}
                    {ritual.id === 'candle' && <Flame className="w-5 h-5" />}
                    {ritual.id === 'bubbles' && <Disc3 className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs font-medium leading-tight ${
                      isSelected ? 'text-slate-100 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {ritual.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {RITUAL_OPTIONS.find((r) => r.id === selectedRitual)?.description}
          </p>
        </div>

        {/* Submit Release Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="release-burden-submit-btn"
            disabled={!burdenText.trim() || isLoading}
            className={`w-full py-4 px-6 rounded-xl font-medium text-base flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
              !burdenText.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin" />
                <span>夜空へ手放し浄化中…</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="font-semibold tracking-wide">この重荷を夜空へ手放す</span>
                <SendHorizontal className="w-4 h-4 ml-1 opacity-80" />
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
