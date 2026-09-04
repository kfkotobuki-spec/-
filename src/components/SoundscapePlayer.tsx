import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Sparkles,
  Trees,
  Flame,
  Music,
  Clock,
  ChevronUp,
  ChevronDown,
  Power,
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { SoundTrackConfig } from '../types';

const INITIAL_TRACKS: SoundTrackConfig[] = [
  { id: 'rain', name: '夜の雨音', icon: 'CloudRain', volume: 0.6, isPlaying: false, color: 'text-cyan-400' },
  { id: 'waves', name: '月夜の波', icon: 'Waves', volume: 0.6, isPlaying: false, color: 'text-blue-400' },
  { id: 'frequencies', name: '432Hz 癒やし波', icon: 'Sparkles', volume: 0.5, isPlaying: false, color: 'text-purple-400' },
  { id: 'crickets', name: '夜の森・虫の音', icon: 'Trees', volume: 0.5, isPlaying: false, color: 'text-emerald-400' },
  { id: 'fireplace', name: '暖かな焚き火', icon: 'Flame', volume: 0.5, isPlaying: false, color: 'text-amber-400' },
  { id: 'musicbox', name: '星のオルゴール', icon: 'Music', volume: 0.4, isPlaying: false, color: 'text-pink-400' },
];

export const SoundscapePlayer: React.FC = () => {
  const [tracks, setTracks] = useState<SoundTrackConfig[]>(INITIAL_TRACKS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number>(0); // minutes (0 = off)
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  // Monitor timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = audioSynth.getTimerRemaining();
      setTimerRemaining(remaining);
      if (remaining === null && selectedTimer > 0) {
        setSelectedTimer(0);
        // turn off playing states
        setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTimer]);

  const toggleTrack = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.isPlaying;
          audioSynth.toggleTrack(t.id, t.volume, nextState);
          return { ...t, isPlaying: nextState };
        }
        return t;
      })
    );
  };

  const handleVolumeChange = (id: string, newVolume: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          audioSynth.setTrackVolume(t.id, newVolume);
          return { ...t, volume: newVolume };
        }
        return t;
      })
    );
  };

  const handleMuteToggle = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  const handleSetTimer = (minutes: number) => {
    setSelectedTimer(minutes);
    audioSynth.setSleepTimer(minutes, () => {
      setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
    });
  };

  const activeTracksCount = tracks.filter((t) => t.isPlaying).length;

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className="w-4 h-4" />;
      case 'Waves':
        return <Waves className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Trees':
        return <Trees className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Music':
        return <Music className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Collapsed Bar Summary */}
        <div className="p-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2.5 text-left cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Music className={`w-4 h-4 ${activeTracksCount > 0 ? 'animate-pulse text-amber-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-200">安眠サウンドスケープ</span>
                {activeTracksCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-indigo-600/80 text-white rounded text-[10px] font-mono">
                    {activeTracksCount}曲再生中
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {timerRemaining !== null
                  ? `⏱️ おやすみタイマー: 残り ${formatTimer(timerRemaining)}`
                  : '自然音・432Hzソルフェジオ周波数で心を鎮める'}
              </span>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleMuteToggle}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isMuted ? 'ミュート解除' : '消音'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-slate-800/80 text-slate-300 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Sound Track Mixer */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 space-y-4 animate-fade-in">
            {/* Tracks grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`p-3 rounded-xl border transition-all ${
                    track.isPlaying
                      ? 'bg-indigo-950/50 border-indigo-600/70 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => toggleTrack(track.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                        track.isPlaying ? track.color : 'text-slate-400'
                      }`}
                    >
                      <span>{renderIcon(track.icon)}</span>
                      <span>{track.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTrack(track.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all cursor-pointer ${
                        track.isPlaying
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={track.volume}
                    onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                    disabled={!track.isPlaying}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
                  />
                </div>
              ))}
            </div>

            {/* Sleep Timer Preset Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div className="flex items-center text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                <span>スリープタイマー (徐々にフェードアウト):</span>
              </div>
              <div className="flex space-x-1.5">
                {[
                  { m: 0, label: 'OFF' },
                  { m: 15, label: '15分' },
                  { m: 30, label: '30分' },
                  { m: 45, label: '45分' },
                  { m: 60, label: '60分' },
                ].map((item) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => handleSetTimer(item.m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedTimer === item.m
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
