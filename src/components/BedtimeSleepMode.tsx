import React, { useState, useEffect, useMemo } from 'react';
import {
  Moon,
  Sparkles,
  X,
  Sun,
  Star,
  Heart,
  Edit3,
  Check,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface BedtimeSleepModeProps {
  onExit: () => void;
  hopeText?: string;
  affirmationText?: string;
}

const DEFAULT_MORNING_WISHES = [
  '明日は心が晴れやかで、あたたかな一日になりますように',
  '自分のペースを大切に、心地よく穏やかに過ごせますように',
  '新しい朝が、優しい光と小さな喜びを運んでくれますように',
  '昨日までの重荷を忘れ、まっさらな笑顔で歩めますように',
  'どんな出来事も軽やかに受け流し、心が守られますように',
];

const SLEEP_WHISPERS = [
  '今日一日、本当によく頑張りましたね。お疲れさまでした。',
  '他人の心無い言葉や不機嫌は、すべて夜の彼方へ消えました。',
  'あなたの心は守られています。今はただ、安らかに体を休めましょう。',
  '明日の朝、新しい光があなたを優しく迎えてくれます。',
  '呼吸をゆったりと… ふかふかの温もりに身をあずけてください。',
  '夜の静寂が、あなたの心と体を優しく包み込んでいます。',
];

export const BedtimeSleepMode: React.FC<BedtimeSleepModeProps> = ({
  onExit,
  hopeText: initialHopeText,
  affirmationText,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [whisperIdx, setWhisperIdx] = useState(0);

  // Active Wish state
  const [currentWish, setCurrentWish] = useState<string>(
    initialHopeText || DEFAULT_MORNING_WISHES[0]
  );
  const [isEditingWish, setIsEditingWish] = useState(false);
  const [customWishInput, setCustomWishInput] = useState('');
  const [wishInscribed, setWishInscribed] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);

  // Dimness Level: 'normal' (soft dim) or 'ultra' (subtle bedside ultra-dim)
  const [isUltraDim, setIsUltraDim] = useState(false);

  // Background ambient stars
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.4 + 0.15,
    }));
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('ja-JP', {
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const whisperTimer = setInterval(() => {
      setWhisperIdx((prev) => (prev + 1) % SLEEP_WHISPERS.length);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(whisperTimer);
    };
  }, []);

  // Inscribe wish with sound and visual wave
  const handleInscribeWish = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      audioSynth.playWishChime();
    } catch {}

    setRippleActive(true);
    setWishInscribed(true);

    setTimeout(() => {
      setRippleActive(false);
    }, 1800);
  };

  const handleSaveCustomWish = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (customWishInput.trim()) {
      setCurrentWish(customWishInput.trim());
      setIsEditingWish(false);
      handleInscribeWish();
    }
  };

  const handleSelectPresetWish = (wish: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentWish(wish);
    setIsEditingWish(false);
    handleInscribeWish();
  };

  return (
    <div
      id="bedtime-sleep-mode-view"
      onClick={() => {
        if (!isEditingWish) onExit();
      }}
      className={`fixed inset-0 z-50 transition-colors duration-1000 flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none cursor-pointer overflow-y-auto ${
        isUltraDim ? 'bg-black text-slate-500' : 'bg-slate-950 text-slate-300'
      }`}
    >
      {/* Background Dim Night Sky Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {backgroundStars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-amber-100"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animation: `pulse ${s.duration}s infinite ease-in-out ${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Top Bar: Controls & Exit prompt */}
      <div
        className="relative z-10 w-full max-w-2xl mx-auto flex justify-between items-center text-xs font-mono text-slate-500 pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-amber-300/80">
            <Moon className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-sans font-medium text-[11px]">おやすみ暗転・明日への願い</span>
          </span>

          {/* Dimness Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsUltraDim(!isUltraDim)}
            className="px-2 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800/80 transition-colors cursor-pointer"
            title="ベッドサイド用の超微光モードに切り替え"
          >
            {isUltraDim ? '💡 微光表示' : '🌙 超微光モード'}
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs flex items-center space-x-1 border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>画面を閉じる</span>
        </button>
      </div>

      {/* Center Sacred Wishing Emblem & Tomorrow's Hope */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 max-w-lg mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Breathing Moonlight Aura */}
        <div className="relative mb-6">
          {/* Ripple wave when wish is inscribed */}
          {rippleActive && (
            <div className="absolute inset-0 rounded-full border-2 border-amber-300/60 animate-ping pointer-events-none scale-150" />
          )}

          {/* Glowing Ambient Backdrop */}
          <div
            className={`absolute -inset-8 rounded-full blur-3xl transition-opacity duration-1000 pointer-events-none ${
              wishInscribed
                ? 'bg-amber-400/20'
                : 'bg-indigo-600/15'
            }`}
          />

          {/* The Celestial Wishing Emblem (明日への願いを宿す星月紋) */}
          <div
            onClick={handleInscribeWish}
            className="group relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
            title="タップして明日への願いを込める（安らぎの音色が響きます）"
          >
            {/* SVG Crest Artwork */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_0_25px_rgba(251,191,36,0.25)]"
            >
              <defs>
                {/* Gradients */}
                <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="goldAura" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
                </linearGradient>
                <radialGradient id="starRadial" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Outer Constellation Ring */}
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                strokeOpacity="0.35"
                className="animate-spin"
                style={{ animationDuration: '60s' }}
              />

              {/* Inner Sacred Geometric Circle */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                strokeOpacity="0.4"
              />

              {/* 4 Cardinal Star Points on Circle */}
              <circle cx="100" cy="8" r="2.5" fill="#fde68a" />
              <circle cx="100" cy="192" r="2.5" fill="#fde68a" />
              <circle cx="8" cy="100" r="2.5" fill="#fde68a" />
              <circle cx="192" cy="100" r="2.5" fill="#fde68a" />

              {/* The Serene Crescent Moon (三日月の優雅な曲線) */}
              <path
                d="M 96,28 A 72,72 0 1,0 162,130 A 58,58 0 1,1 96,28 Z"
                fill="url(#moonGradient)"
                opacity="0.88"
                filter="drop-shadow(0 2px 8px rgba(245, 158, 11, 0.4))"
              />

              {/* Constellation Connecting Arc */}
              <path
                d="M 60,65 Q 100,100 135,135"
                fill="none"
                stroke="#a5b4fc"
                strokeWidth="0.8"
                strokeDasharray="2 4"
                strokeOpacity="0.5"
              />

              {/* The Morning Star / Seed of Hope (明けの明星・明日への願いの光核) */}
              <g transform="translate(112, 82)">
                {/* Radiant Halo */}
                <circle cx="0" cy="0" r="20" fill="url(#starRadial)" opacity="0.6" />

                {/* 8-Point Diamond Star */}
                <polygon
                  points="0,-22 4,-6 20,0 4,6 0,22 -4,6 -20,0 -4,-6"
                  fill="#ffffff"
                  filter="drop-shadow(0 0 6px #fde047)"
                />
                <polygon
                  points="0,-14 3,-4 14,0 3,4 0,14 -3,4 -14,0 -3,-4"
                  fill="#fef08a"
                  transform="rotate(45)"
                  opacity="0.8"
                />
                <circle cx="0" cy="0" r="3.5" fill="#fffbeb" />
              </g>

              {/* Smaller Starlight nodes */}
              <circle cx="68" cy="138" r="2" fill="#e0e7ff" opacity="0.8" />
              <circle cx="140" cy="52" r="2.5" fill="#fde68a" opacity="0.9" />
              <circle cx="52" cy="85" r="1.5" fill="#c7d2fe" opacity="0.7" />
            </svg>

            {/* Subtle center prompt pill */}
            <div className="absolute -bottom-3 bg-slate-900/90 border border-amber-500/40 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-lg group-hover:border-amber-400">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>{wishInscribed ? '願いが灯りました' : '願いを込める'}</span>
            </div>
          </div>
        </div>

        {/* Minimal Bedside Time & Date */}
        <div className="mb-5">
          <div className="text-4xl sm:text-5xl font-light font-mono tracking-widest text-slate-300/90">
            {timeStr}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-serif">{dateStr}</div>
        </div>

        {/* Wish for Tomorrow (明日への願い) Display Card */}
        <div className="w-full px-2">
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/80 border border-amber-900/40 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
            {/* Header with emblem badge */}
            <div className="flex items-center justify-between mb-2.5 border-b border-amber-900/20 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="tracking-wide">明日への願い</span>
                <span className="text-[10px] text-amber-400/70 font-normal">
                  （夜空へ託す希望）
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingWish(!isEditingWish)}
                  className="text-slate-400 hover:text-amber-300 p-1 rounded transition-colors text-[11px] flex items-center space-x-1 cursor-pointer"
                  title="願いを自由に入力または変更"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">変更</span>
                </button>
              </div>
            </div>

            {/* Wish text or Edit Form */}
            {isEditingWish ? (
              <form onSubmit={handleSaveCustomWish} className="space-y-3 mt-2 text-left">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    明日どんな一日であってほしいか、心からの願いを書いてください：
                  </label>
                  <input
                    type="text"
                    value={customWishInput}
                    onChange={(e) => setCustomWishInput(e.target.value)}
                    placeholder="例：心穏やかに、自分を大切に過ごせますように"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>

                {/* Quick Preset Wish Pills */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1.5">
                    またはおすすめの願いを選ぶ：
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {DEFAULT_MORNING_WISHES.map((w, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => handleSelectPresetWish(w, e)}
                        className="w-full text-left text-[11px] text-slate-300 hover:text-amber-200 bg-slate-900/60 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{w}</span>
                        <Star className="w-3 h-3 text-amber-400/60 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    この願いを込める
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingWish(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    戻る
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-sm sm:text-base font-serif font-medium text-amber-100/95 leading-relaxed py-1">
                  「{currentWish}」
                </p>

                {/* Blessing confirmation when tapped */}
                <div className="mt-2 text-[11px] text-amber-400/80 font-serif flex items-center justify-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>
                    {wishInscribed
                      ? 'この願いは夜空に届きました。明日、新しい光が微笑みます。'
                      : '上の月星をタップすると、願いの安らぎ音が響きます'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Affirmation if available */}
        {affirmationText && (
          <div className="mt-4 px-4 text-xs font-serif text-slate-400/80 italic max-w-md">
            お守りの言葉："{affirmationText}"
          </div>
        )}

        {/* Gentle rotating bedtime whisper */}
        <div className="mt-5 px-4 text-xs text-slate-500 font-serif leading-relaxed min-h-8 flex items-center justify-center">
          🌙 {SLEEP_WHISPERS[whisperIdx]}
        </div>
      </div>

      {/* Bottom hint to wake or return */}
      <div className="relative z-10 text-center py-2">
        <button
          type="button"
          onClick={onExit}
          className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer font-sans"
        >
          画面のどこかをタップすると元の画面に戻ります
        </button>
      </div>
    </div>
  );
};
