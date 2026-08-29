import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Trees, Radio, Disc, Play, Pause, X, Music, Sliders } from 'lucide-react';

export type SoundscapeType = 'rain' | 'ocean' | 'forest' | 'noise' | 'drone' | 'none';

interface SoundscapePreset {
  id: SoundscapeType;
  name: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  color: string;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    icon: CloudRain,
    description: 'Calming pink noise with soft rain droplets',
    color: 'from-blue-500/20 to-sky-500/10 text-sky-400 border-sky-500/30',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: Waves,
    description: 'Rolling tides modulated by low frequency LFO',
    color: 'from-cyan-500/20 to-teal-500/10 text-teal-300 border-teal-500/30',
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    icon: Trees,
    description: 'Rustling leaves with subtle harmonic nature ambience',
    color: 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'noise',
    name: 'Focus Brown Noise',
    icon: Radio,
    description: 'Deep warm rumble for intense focus & cognitive ease',
    color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
  },
  {
    id: 'drone',
    name: 'Cosmic 432Hz Om',
    icon: Disc,
    description: 'Solfeggio frequency harmonic meditation drone',
    color: 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30',
  },
];

interface SoundscapeManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  compactMode?: boolean;
}

export const SoundscapeManager: React.FC<SoundscapeManagerProps> = ({ isOpen = false, onClose, compactMode = false }) => {
  const [selectedSoundscape, setSelectedSoundscape] = useState<SoundscapeType>('none');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);
  const [showPanel, setShowPanel] = useState<boolean>(isOpen);

  // Audio Context Ref & Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<Array<AudioNode>>([]);
  const timerIntervalsRef = useRef<Array<NodeJS.Timeout>>([]);
  const animFrameRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cleanup active audio nodes
  const stopAudio = () => {
    timerIntervalsRef.current.forEach((t) => clearInterval(t));
    timerIntervalsRef.current = [];

    sourceNodesRef.current.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    });
    sourceNodesRef.current = [];
  };

  // Web Audio Synthesizers for Soundscapes
  const startSoundscape = (type: SoundscapeType, vol: number) => {
    stopAudio();
    if (type === 'none') {
      setIsPlaying(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((vol / 100) * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Noise generator helper
      const createNoiseBuffer = (type: 'pink' | 'brown' | 'white') => {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'white') {
            data[i] = white;
          } else if (type === 'pink') {
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11;
            b6 = white * 0.115926;
          } else if (type === 'brown') {
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          }
        }
        return buffer;
      };

      if (type === 'rain') {
        // Continuous Rain Pink Noise with Filter
        const noiseBuf = createNoiseBuffer('pink');
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        sourceNodesRef.current.push(noiseSource, filter);

        // Random Raindrop Pops
        const raindropInterval = setInterval(() => {
          if (!isPlaying && selectedSoundscape !== 'rain') return;
          try {
            const dropOsc = ctx.createOscillator();
            const dropGain = ctx.createGain();
            const freq = 1200 + Math.random() * 1800;

            dropOsc.type = 'sine';
            dropOsc.frequency.setValueAtTime(freq, ctx.currentTime);
            dropOsc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

            dropGain.gain.setValueAtTime(0.015, ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

            dropOsc.connect(dropGain);
            dropGain.connect(masterGain);
            dropOsc.start();
            dropOsc.stop(ctx.currentTime + 0.05);
          } catch (e) {
            // ignore
          }
        }, 120);
        timerIntervalsRef.current.push(raindropInterval);

      } else if (type === 'ocean') {
        // Ocean Swell (Brown Noise + LFO modulating filter)
        const noiseBuf = createNoiseBuffer('brown');
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second wave swells

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(250, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(masterGain);

        noiseSource.start();
        lfo.start();
        sourceNodesRef.current.push(noiseSource, filter, lfo, lfoGain);

      } else if (type === 'forest') {
        // Forest Rustle + Soft Birds
        const noiseBuf = createNoiseBuffer('pink');
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        const rustleGain = ctx.createGain();
        rustleGain.gain.setValueAtTime(0.3, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(rustleGain);
        rustleGain.connect(masterGain);

        noiseSource.start();
        sourceNodesRef.current.push(noiseSource, filter, rustleGain);

        // Periodic Gentle Bird Chirp
        const birdInterval = setInterval(() => {
          try {
            const birdOsc = ctx.createOscillator();
            const birdGain = ctx.createGain();
            const baseFreq = 2400 + Math.random() * 800;

            birdOsc.type = 'sine';
            birdOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
            birdOsc.frequency.exponentialRampToValueAtTime(baseFreq + 600, ctx.currentTime + 0.08);
            birdOsc.frequency.exponentialRampToValueAtTime(baseFreq - 200, ctx.currentTime + 0.16);

            birdGain.gain.setValueAtTime(0.02, ctx.currentTime);
            birdGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

            birdOsc.connect(birdGain);
            birdGain.connect(masterGain);
            birdOsc.start();
            birdOsc.stop(ctx.currentTime + 0.2);
          } catch (e) {
            // ignore
          }
        }, 3500);
        timerIntervalsRef.current.push(birdInterval);

      } else if (type === 'noise') {
        // Pure Warm Brown Noise
        const noiseBuf = createNoiseBuffer('brown');
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        sourceNodesRef.current.push(noiseSource, filter);

      } else if (type === 'drone') {
        // 432Hz Solfeggio Harmonic Om Drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();

        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.4, ctx.currentTime);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime); // 432 / 4 = 108Hz sub base

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(216, ctx.currentTime); // 432 / 2

        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz Solfeggio

        osc1.connect(droneGain);
        osc2.connect(droneGain);
        osc3.connect(droneGain);
        droneGain.connect(masterGain);

        osc1.start();
        osc2.start();
        osc3.start();
        sourceNodesRef.current.push(osc1, osc2, osc3, droneGain);
      }

      setIsPlaying(true);
    } catch (err) {
      console.warn('Soundscape synth error:', err);
      setIsPlaying(false);
    }
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.4, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const handleSelectPreset = (presetId: SoundscapeType) => {
    if (selectedSoundscape === presetId && isPlaying) {
      stopAudio();
      setSelectedSoundscape('none');
      setIsPlaying(false);
    } else {
      setSelectedSoundscape(presetId);
      startSoundscape(presetId, volume);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      const target = selectedSoundscape === 'none' ? 'rain' : selectedSoundscape;
      setSelectedSoundscape(target);
      startSoundscape(target, volume);
    }
  };

  // Render Visualizer Wave Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        step += 0.08;
        const barWidth = 4;
        const gap = 3;
        const totalBars = Math.floor(canvas.width / (barWidth + gap));

        for (let i = 0; i < totalBars; i++) {
          const x = i * (barWidth + gap);
          const h = 6 + Math.sin(step + i * 0.4) * 14 + Math.cos(step * 0.5 + i * 0.2) * 8;

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(x, (canvas.height - h) / 2, barWidth, h, 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
      }

      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <>
      {/* Floating Quick Soundscape Trigger Bar (when closed) */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="fixed bottom-20 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white border border-slate-700/80 shadow-xl backdrop-blur-md hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 group-hover:scale-110 transition-transform">
            <Music className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Soundscapes</p>
            <p className="text-[10px] text-teal-400 font-medium">
              {isPlaying ? `Playing ${selectedSoundscape}` : 'Ambient Audio Engine'}
            </p>
          </div>
          {isPlaying && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      )}

      {/* Main Soundscape Manager Panel */}
      {showPanel && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm bg-slate-900/95 text-white rounded-3xl p-5 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-4">
          {/* Panel Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Somatic Soundscapes</h4>
                <p className="text-[10px] text-slate-400">Synthesizer ambient focus & relaxation</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPanel(false);
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Soundscape Presets List */}
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
            {SOUNDSCAPE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedSoundscape === preset.id && isPlaying;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-r ${preset.color} shadow-lg shadow-teal-500/10`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-white/10' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold animate-pulse">
                        Active
                      </span>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Audio Visualizer & Volume Controls */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={togglePlayPause}
                className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="flex-1 flex items-center justify-center">
                <canvas ref={canvasRef} width={140} height={24} className="rounded-lg" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume((v) => (v === 0 ? 50 : 0))}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


