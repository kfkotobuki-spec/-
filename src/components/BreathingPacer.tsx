import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface BreathingPacerProps {
  onFinish?: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

const PHASE_CONFIG = {
  idle: {
    duration: 0,
    label: '4-7-8 安眠呼吸法',
    subLabel: '副交感神経を優位にし、心のざわつきを鎮めて深い眠りへ導きます',
    instruction: '「開始」を押して、楽な姿勢で目を閉じたり画面を見つめてください',
    scale: 1,
    color: 'from-indigo-600 to-purple-600',
    ringColor: 'border-indigo-500/40',
  },
  inhale: {
    duration: 4,
    label: '息を静かに吸う',
    subLabel: '鼻から静かに新鮮な夜の空気を吸い込みます (4秒)',
    instruction: 'お腹をふくらませるように、ゆっくりと…',
    scale: 1.45,
    color: 'from-cyan-500 to-blue-600',
    ringColor: 'border-cyan-400/80 shadow-cyan-500/50',
  },
  hold: {
    duration: 7,
    label: '息を止めて静止',
    subLabel: '全身の力を抜いて静寂を味わいます (7秒)',
    instruction: '肩の力を抜き、奥歯の噛み締めを解きましょう…',
    scale: 1.45,
    color: 'from-indigo-600 to-violet-700',
    ringColor: 'border-indigo-400/80 shadow-indigo-500/50',
  },
  exhale: {
    duration: 8,
    label: '細く長く息を吐ききる',
    subLabel: '口から残った不安や重荷をすべて外へ出します (8秒)',
    instruction: '今日一日の嫌なことがすべて体から抜けていきます…',
    scale: 0.85,
    color: 'from-amber-600 to-rose-600',
    ringColor: 'border-amber-400/80 shadow-amber-500/50',
  },
};

const BODY_RELAX_TIPS = [
  '💡 眉間のシワを緩め、額の力をふわっと抜きましょう。',
  '💡 奥歯の噛み締めを解き、舌を上あごから楽に離します。',
  '💡 肩をストンと落とし、ベッドに体が沈み込む重みを感じてください。',
  '💡 今日の嫌な出来事はもう終わり。あなたの明日は守られています。',
];

export const BreathingPacer: React.FC<BreathingPacerProps> = ({ onFinish }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setCountdown(4);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Start cycle with Inhale
    let currentPhase: BreathPhase = 'inhale';
    let timeLeft = PHASE_CONFIG.inhale.duration;
    setPhase('inhale');
    setCountdown(timeLeft);
    if (soundEnabled) audioSynth.playBreathCue('inhale');

    timerRef.current = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          timeLeft = PHASE_CONFIG.hold.duration;
          setPhase('hold');
          setCountdown(timeLeft);
          if (soundEnabled) audioSynth.playBreathCue('hold');
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timeLeft = PHASE_CONFIG.exhale.duration;
          setPhase('exhale');
          setCountdown(timeLeft);
          if (soundEnabled) audioSynth.playBreathCue('exhale');
        } else if (currentPhase === 'exhale') {
          currentPhase = 'inhale';
          timeLeft = PHASE_CONFIG.inhale.duration;
          setPhase('inhale');
          setCountdown(timeLeft);
          setCycleCount((c) => c + 1);
          setTipIndex((prev) => (prev + 1) % BODY_RELAX_TIPS.length);
          if (soundEnabled) audioSynth.playBreathCue('inhale');
        }
      } else {
        setCountdown(timeLeft);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, soundEnabled]);

  const toggleActive = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setCycleCount(0);
    setPhase('idle');
  };

  const currentConfig = PHASE_CONFIG[phase];

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 text-center text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-800/60 rounded-full text-xs font-semibold text-indigo-300">
            呼吸サイクル: {cycleCount} 回完了
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border text-xs flex items-center transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50'
              : 'bg-slate-800/60 text-slate-400 border-slate-700'
          }`}
          title={soundEnabled ? '呼吸音ガイドON' : '呼吸音ガイドOFF'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Breathing Visualizer Circle */}
      <div className="my-8 relative flex items-center justify-center h-64">
        {/* Outer glowing pulsing ripples */}
        <div
          className={`absolute w-52 h-52 rounded-full border-2 transition-all duration-1000 ease-in-out pointer-events-none ${
            currentConfig.ringColor
          } ${isActive ? 'scale-125 opacity-70' : 'opacity-20'}`}
        />

        <div
          className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out shadow-2xl relative z-10 bg-gradient-to-br ${
            currentConfig.color
          } ${
            phase === 'inhale'
              ? 'scale-120 duration-4000'
              : phase === 'hold'
              ? 'scale-120 duration-500'
              : phase === 'exhale'
              ? 'scale-90 duration-8000'
              : 'scale-100 duration-500'
          }`}
        >
          <span className="text-sm font-semibold tracking-wider text-slate-100 drop-shadow mb-1">
            {currentConfig.label}
          </span>
          {isActive && (
            <span className="text-4xl font-bold font-mono text-white drop-shadow-md">
              {countdown}
            </span>
          )}
          {!isActive && (
            <span className="text-xs text-indigo-200 mt-1">
              4秒吸う / 7秒止める / 8秒吐く
            </span>
          )}
        </div>
      </div>

      {/* Instruction & Relaxation Tip */}
      <div className="min-h-16 mb-6">
        <p className="text-sm md:text-base font-medium text-slate-200 mb-1">
          {currentConfig.instruction}
        </p>
        <p className="text-xs text-slate-400">
          {isActive ? BODY_RELAX_TIPS[tipIndex] : currentConfig.subLabel}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-3">
        <button
          type="button"
          id="breathing-toggle-btn"
          onClick={toggleActive}
          className={`py-3 px-8 rounded-xl font-semibold text-sm flex items-center space-x-2 transition-all shadow-lg cursor-pointer ${
            isActive
              ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-rose-900/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" />
              <span>一時停止</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>安眠呼吸を始める</span>
            </>
          )}
        </button>

        {isActive && (
          <button
            type="button"
            onClick={handleReset}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
