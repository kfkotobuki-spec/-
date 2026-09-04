/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wind,
  Sun,
  Moon,
  Star,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import {
  RitualType,
  MindPurificationResult,
  ReleasedMemory,
  HopeItem,
  AppTab,
  NightStreakData,
} from './types';
import { ReleaseRitualCanvas } from './components/ReleaseRitualCanvas';
import { MindDetoxForm } from './components/MindDetoxForm';
import { AIComfortModal } from './components/AIComfortModal';
import { BreathingPacer } from './components/BreathingPacer';
import { HopeCapsuleSection } from './components/HopeCapsuleSection';
import { SoundscapePlayer } from './components/SoundscapePlayer';
import { StarGardenModal } from './components/StarGardenModal';
import { BedtimeSleepMode } from './components/BedtimeSleepMode';
import { audioSynth } from './utils/audioSynth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('ritual');
  const [selectedRitual, setSelectedRitual] = useState<RitualType>('stardust');
  const [isRitualAnimating, setIsRitualAnimating] = useState(false);
  const [isPurifyingLoading, setIsPurifyingLoading] = useState(false);
  const [activePurificationResult, setActivePurificationResult] =
    useState<MindPurificationResult | null>(null);
  const [currentBurdenSnippet, setCurrentBurdenSnippet] = useState('');
  const [sessionKey, setSessionKey] = useState<number>(() => Date.now());
  const [showResetNotification, setShowResetNotification] = useState<boolean>(false);

  // Modals & Sleep mode
  const [isStarGardenOpen, setIsStarGardenOpen] = useState(false);
  const [isSleepModeOpen, setIsSleepModeOpen] = useState(false);

  // Persistent States for Garden & Habit Streaks (Star Garden starts reset for each fresh night)
  const [releasedMemories, setReleasedMemories] = useState<ReleasedMemory[]>([]);

  // Tomorrow's Hope: Always begins completely reset on startup/open
  const [savedHopes, setSavedHopes] = useState<HopeItem[]>([]);

  // Habit Streak Data
  const [streakData, setStreakData] = useState<NightStreakData>(() => {
    try {
      const saved = localStorage.getItem('night_streak_data');
      return saved
        ? JSON.parse(saved)
        : { streakDays: 1, totalNights: 0, lastDateStr: '' };
    } catch {
      return { streakDays: 1, totalNights: 0, lastDateStr: '' };
    }
  });

  // Format today's Japanese night date
  const todayFormatted = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  // Ensure on load / mount that app ALWAYS starts in clean reset state (including Tomorrow's Hope)
  useEffect(() => {
    handleResetToFreshSession(false);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('night_release_memories', JSON.stringify(releasedMemories));
    } catch {}
  }, [releasedMemories]);

  useEffect(() => {
    try {
      localStorage.setItem('night_streak_data', JSON.stringify(streakData));
    } catch {}
  }, [streakData]);

  // Full Reset to Fresh Session (resets tab, burden text, AI results, Tomorrow's Hope, and Star Garden)
  const handleResetToFreshSession = (notify = true) => {
    setCurrentTab('ritual');
    setActivePurificationResult(null);
    setIsRitualAnimating(false);
    setCurrentBurdenSnippet('');
    setSavedHopes([]); // Reset Tomorrow's Hope
    setReleasedMemories([]); // Reset Star Garden memories as requested
    setIsSleepModeOpen(false);
    setIsStarGardenOpen(false);
    setSessionKey(Date.now());

    try {
      localStorage.removeItem('night_saved_hopes');
      localStorage.removeItem('night_release_memories');
    } catch {}

    if (notify) {
      setShowResetNotification(true);
      setTimeout(() => setShowResetNotification(false), 3000);
    }
  };

  // Update streak upon completing release
  const recordCompletionStreak = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStreakData((prev) => {
      if (prev.lastDateStr === todayStr) {
        return { ...prev, totalNights: prev.totalNights + 1 };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const nextStreak = prev.lastDateStr === yesterdayStr ? prev.streakDays + 1 : 1;
      return {
        streakDays: nextStreak,
        totalNights: prev.totalNights + 1,
        lastDateStr: todayStr,
      };
    });
  };

  // Handle Purify Submission
  const handleStartPurification = async (
    burdenText: string,
    tags: string[],
    ritual: RitualType
  ) => {
    setSelectedRitual(ritual);
    setCurrentBurdenSnippet(burdenText);
    setIsPurifyingLoading(true);

    try {
      const response = await fetch('/api/purify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          burdenText,
          emotionTags: tags,
          ritualType: ritual,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        recordCompletionStreak();
        audioSynth.playReleaseBell(ritual);
        setIsRitualAnimating(true);
        setActivePurificationResult(data.data);

        // Save memory to the Star Garden
        const newMemory: ReleasedMemory = {
          id: `mem-${Date.now()}`,
          timestamp: Date.now(),
          dateStr: new Date().toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          ritualType: ritual,
          burdenSnippet: burdenText.slice(0, 40) + (burdenText.length > 40 ? '…' : ''),
          summaryTitle: data.data.summaryTitle || '手放された夜の記憶',
          hopeSeed: data.data.hopeSeedForTomorrow,
          cleansingAffirmation: data.data.cleansingAffirmation,
          starsGenerated: Math.floor(12 + Math.random() * 18),
        };

        setReleasedMemories((prev) => [newMemory, ...prev]);
      }
    } catch (err) {
      console.error('Failed to purify burden:', err);
    } finally {
      setIsPurifyingLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setIsRitualAnimating(false);
  };

  const handleSaveHope = (hope: HopeItem) => {
    if (!savedHopes.some((h) => h.title === hope.title)) {
      setSavedHopes((prev) => [hope, ...prev]);
    }
  };

  const handleClearHopes = () => {
    setSavedHopes([]);
    try {
      localStorage.removeItem('night_saved_hopes');
    } catch {}
  };

  const handleRemoveHope = (id: string) => {
    setSavedHopes((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('これまでの手放し履歴を消去しますか？')) {
      setReleasedMemories([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
      {/* Background Interactive Ritual Canvas */}
      <ReleaseRitualCanvas
        ritualType={selectedRitual}
        isAnimating={isRitualAnimating}
        onAnimationComplete={handleAnimationComplete}
        burdenSnippet={currentBurdenSnippet}
      />

      {/* Top Header Bar */}
      <header className="relative z-30 w-full max-w-5xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
        {/* App Title & Moon Icon */}
        <div
          onClick={() => handleResetToFreshSession(true)}
          className="flex items-center space-x-3 cursor-pointer group"
          title="クリックで最初からリセット"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-purple-600 flex items-center justify-center text-amber-300 shadow-lg shadow-indigo-950/60 border border-indigo-500/30 group-hover:scale-105 transition-transform">
            <Moon className="w-5 h-5 fill-amber-300/20" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center">
              <span>おやすみ浄化</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono font-normal">
                Night Release
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-serif">
              今日の重荷を手放し、安らかな眠りと明日の希望へ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Reset to Fresh Session Button */}
          <button
            type="button"
            id="header-reset-btn"
            onClick={() => handleResetToFreshSession(true)}
            className="py-2 px-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer hover:text-indigo-300 shadow-sm"
            title="今夜のセッション（明日の希望も含む）をリセットして最初から始める"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">リセットして最初から</span>
            <span className="sm:hidden">リセット</span>
          </button>

          {/* Star Garden Button */}
          <button
            type="button"
            id="open-star-garden-btn"
            onClick={() => setIsStarGardenOpen(true)}
            className="py-2 px-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="hidden sm:inline">手放した星の庭</span>
            <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 rounded-full text-[10px] font-mono font-bold">
              {releasedMemories.length}
            </span>
          </button>

          {/* Sleep Screen Mode with Wish for Tomorrow */}
          <button
            type="button"
            id="open-sleep-mode-btn"
            onClick={() => setIsSleepModeOpen(true)}
            className="py-2 px-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 hover:from-indigo-900 hover:to-purple-900 text-amber-300 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-950"
            title="画面を暗転して、明日への願いを込める"
          >
            <Moon className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">おやすみ暗転・明日への願い</span>
            <span className="md:hidden">暗転・願い</span>
          </button>
        </div>
      </header>

      {/* Reset toast notice */}
      {showResetNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/90 border border-indigo-500/60 text-indigo-200 px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-2xl animate-fade-in backdrop-blur-md">
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>まっさらな初期状態（手放した星の庭・明日の希望もリセット）にしました。</span>
        </div>
      )}

      {/* Main Navigation Step Tabs */}
      <nav className="relative z-30 w-full max-w-xl mx-auto px-4 mb-4">
        <div className="flex bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-lg">
          <button
            type="button"
            id="tab-ritual-btn"
            onClick={() => {
              setCurrentTab('ritual');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              currentTab === 'ritual'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1. 手放し・浄化</span>
          </button>

          <button
            type="button"
            id="tab-breathe-btn"
            onClick={() => setCurrentTab('breathe')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              currentTab === 'breathe'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>2. 4-7-8 安眠呼吸</span>
          </button>

          <button
            type="button"
            id="tab-hope-btn"
            onClick={() => setCurrentTab('hope')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              currentTab === 'hope'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>3. 明日の希望</span>
            {savedHopes.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Dynamic Workflow Container */}
      <main className="relative z-20 w-full max-w-4xl mx-auto px-4 py-4 flex-1 flex flex-col justify-center pb-24">
        {currentTab === 'ritual' && (
          <>
            {activePurificationResult ? (
              <AIComfortModal
                result={activePurificationResult}
                ritualType={selectedRitual}
                onProceedToBreathe={() => setCurrentTab('breathe')}
                onProceedToHope={() => setCurrentTab('hope')}
                onEnterSleepMode={() => setIsSleepModeOpen(true)}
                onResetToNewSession={() => handleResetToFreshSession(true)}
              />
            ) : (
              <MindDetoxForm
                key={sessionKey}
                onStartPurification={handleStartPurification}
                isLoading={isPurifyingLoading}
                streakDays={streakData.streakDays}
                dateDisplay={todayFormatted}
              />
            )}
          </>
        )}

        {currentTab === 'breathe' && (
          <BreathingPacer onFinish={() => setCurrentTab('hope')} />
        )}

        {currentTab === 'hope' && (
          <HopeCapsuleSection
            key={sessionKey}
            onSaveHope={handleSaveHope}
            onClearHopes={handleClearHopes}
            onRemoveHope={handleRemoveHope}
            onEnterSleepMode={() => setIsSleepModeOpen(true)}
            savedHopes={savedHopes}
          />
        )}
      </main>

      {/* Floating Soundscape Audio Synthesizer Player */}
      <SoundscapePlayer />

      {/* Star Garden Modal */}
      <StarGardenModal
        isOpen={isStarGardenOpen}
        onClose={() => setIsStarGardenOpen(false)}
        releasedMemories={releasedMemories}
        onClearHistory={handleClearHistory}
        streakDays={streakData.streakDays}
      />

      {/* Fullscreen Dim Sleep Mode */}
      {isSleepModeOpen && (
        <BedtimeSleepMode
          onExit={() => setIsSleepModeOpen(false)}
          hopeText={
            activePurificationResult?.hopeSeedForTomorrow ||
            (savedHopes.length > 0 ? savedHopes[0].title : undefined)
          }
          affirmationText={activePurificationResult?.cleansingAffirmation}
        />
      )}
    </div>
  );
}
