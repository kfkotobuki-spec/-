import React, { useState } from 'react';
import { MindPurificationResult, RitualType } from '../types';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ArrowRight,
  Wind,
  CheckCircle2,
} from 'lucide-react';

interface AIComfortModalProps {
  result: MindPurificationResult;
  ritualType: RitualType;
  onProceedToBreathe: () => void;
  onProceedToHope: () => void;
  onEnterSleepMode: () => void;
}

export const AIComfortModal: React.FC<AIComfortModalProps> = ({
  result,
  ritualType,
  onProceedToBreathe,
  onProceedToHope,
  onEnterSleepMode,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Web Speech API for gentle read-aloud if supported
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${result.empatheticValidation}。${result.boundaryReframing}。心のお守り言葉、${result.cleansingAffirmation}。明日の希望の種、${result.hopeSeedForTomorrow}。${result.bedtimeWhisper}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // Calming slow bedtime pace
    utterance.pitch = 0.95; // Gentle tone

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-indigo-900/60 p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in text-slate-100">
      {/* Soft atmospheric gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Read Aloud button */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase block">
              浄化と解放のメッセージ
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-100">
              {result.summaryTitle || '重荷は夜空へと還されました'}
            </h3>
          </div>
        </div>

        {'speechSynthesis' in window && (
          <button
            type="button"
            onClick={handleReadAloud}
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-indigo-600/80 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/60'
            }`}
            title={isSpeaking ? '読み上げを停止' : '優しい声で読み上げる'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 mr-1 text-rose-300 animate-pulse" />
                <span>停止</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-1 text-indigo-300" />
                <span className="hidden sm:inline">安らぎ朗読</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 4 Comfort Modules */}
      <div className="space-y-4 mb-8">
        {/* 1. Empathetic Validation */}
        <div className="bg-slate-950/60 rounded-xl p-4.5 border border-slate-800/70">
          <div className="flex items-center text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Heart className="w-4 h-4 mr-1.5 fill-rose-500/20" />
            <span>今日のあなたへの深い労い</span>
          </div>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {result.empatheticValidation}
          </p>
        </div>

        {/* 2. Boundary Reframing */}
        <div className="bg-slate-950/60 rounded-xl p-4.5 border border-indigo-900/40">
          <div className="flex items-center text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            <span>心を守る境界線（他人の課題の切り離し）</span>
          </div>
          <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed">
            {result.boundaryReframing}
          </p>
        </div>

        {/* 3. Cleansing Affirmation */}
        <div className="bg-gradient-to-r from-indigo-950/70 to-purple-950/70 rounded-xl p-4.5 border border-indigo-700/40">
          <div className="flex items-center text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>今夜唱える心のお守り言葉</span>
          </div>
          <p className="text-base md:text-lg font-medium text-amber-100 italic tracking-wide">
            {result.cleansingAffirmation}
          </p>
        </div>

        {/* 4. Hope Seed For Tomorrow */}
        <div className="bg-slate-950/60 rounded-xl p-4.5 border border-teal-900/40">
          <div className="flex items-center text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sun className="w-4 h-4 mr-1.5" />
            <span>明日のための小さな希望の種</span>
          </div>
          <p className="text-sm md:text-base text-teal-100/90 leading-relaxed">
            {result.hopeSeedForTomorrow}
          </p>
        </div>

        {/* 5. Bedtime Whisper */}
        <div className="text-center py-2 text-slate-400 text-xs sm:text-sm font-serif italic">
          🌙 {result.bedtimeWhisper}
        </div>
      </div>

      {/* Next Step Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          onClick={onProceedToBreathe}
          className="py-3 px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <Wind className="w-4 h-4" />
          <span>4-7-8 安眠呼吸へ</span>
        </button>

        <button
          type="button"
          onClick={onProceedToHope}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Sun className="w-4 h-4 text-amber-300" />
          <span>明日の希望を見る</span>
        </button>

        <button
          type="button"
          onClick={onEnterSleepMode}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 hover:bg-slate-900 text-amber-200 border border-amber-500/30 hover:border-amber-400 text-sm font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
          title="画面を暗転して、明日への願いを込めて休む"
        >
          <Moon className="w-4 h-4 text-amber-300" />
          <span>おやすみ暗転・明日への願い</span>
        </button>
      </div>
    </div>
  );
};
