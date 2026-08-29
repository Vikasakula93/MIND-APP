import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Mic, MicOff, Volume2, VolumeX, Sparkles, Activity, ShieldCheck, HeartPulse, X, Settings2 } from 'lucide-react';

interface BreathPacingVisualizerProps {
  onClose?: () => void;
  isOpenModal?: boolean;
}

export const BreathPacingVisualizer: React.FC<BreathPacingVisualizerProps> = ({ onClose, isOpenModal = false }) => {
  // Breathing Pattern States: '4-7-8' (Relaxation), '4-4-4-4' (Box/Focus), '5-5' (Coherence)
  const [pattern, setPattern] = useState<'4-7-8' | '4-4-4-4' | '5-5'>('4-7-8');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [stabilityScore, setStabilityScore] = useState<number>(94);

  // Phase tracking
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Define timings based on pattern
  const getTimings = () => {
    switch (pattern) {
      case '4-4-4-4':
        return { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 };
      case '5-5':
        return { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 };
      case '4-7-8':
      default:
        return { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 };
    }
  };

  // Web Audio synth chime for phase changes
  const playPhaseChime = (phaseType: 'Inhale' | 'Hold' | 'Exhale' | 'Rest') => {
    if (!audioFeedback) return;
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

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      let freq = 432; // Harmonic 432Hz tuning
      if (phaseType === 'Inhale') freq = 528; // Transformation
      if (phaseType === 'Hold') freq = 639; // Connection
      if (phaseType === 'Exhale') freq = 396; // Release

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Mic Volume Listener Setup
  const toggleMicrophone = async () => {
    if (micActive) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      setMicActive(false);
      setMicVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicActive(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);

        // Update stability score based on smooth volume transitions
        setStabilityScore((prev) => Math.min(100, Math.max(70, prev + (normalized > 10 && normalized < 60 ? 0.2 : -0.1))));

        if (micStreamRef.current) {
          requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      alert('Microphone access unavailable or denied. Operating in smooth simulation mode.');
      setMicActive(false);
    }
  };

  // Breathing Phase Timer Loop
  useEffect(() => {
    if (!isActive) return;

    const timings = getTimings();
    let currentPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Rest' = phase;
    let secondsLeft = phaseSecondsLeft;

    const timer = setInterval(() => {
      secondsLeft -= 1;

      if (secondsLeft <= 0) {
        // Transition to next phase
        if (currentPhase === 'Inhale') {
          if (timings.holdIn > 0) {
            currentPhase = 'Hold';
            secondsLeft = timings.holdIn;
          } else {
            currentPhase = 'Exhale';
            secondsLeft = timings.exhale;
          }
        } else if (currentPhase === 'Hold') {
          currentPhase = 'Exhale';
          secondsLeft = timings.exhale;
        } else if (currentPhase === 'Exhale') {
          if (timings.holdOut > 0) {
            currentPhase = 'Rest';
            secondsLeft = timings.holdOut;
          } else {
            currentPhase = 'Inhale';
            secondsLeft = timings.inhale;
            setCycleCount((c) => c + 1);
          }
        } else if (currentPhase === 'Rest') {
          currentPhase = 'Inhale';
          secondsLeft = timings.inhale;
          setCycleCount((c) => c + 1);
        }

        playPhaseChime(currentPhase);
      }

      setPhase(currentPhase);
      setPhaseSecondsLeft(secondsLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, phaseSecondsLeft, pattern, audioFeedback]);

  // Render Interactive 3D Animated Breathing Visualizer Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotX = 0;
    let rotY = 0;

    // Build 3D Sphere Particle Points
    const numParticles = 140;
    const particles: Array<{ x: number; y: number; z: number; origR: number }> = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < numParticles; i++) {
      const y = 1 - (i / (numParticles - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      particles.push({ x, y, z, origR: 1 });
    }

    const timings = getTimings();
    let phaseProgress = 0; // 0 to 1

    const render3DSphere = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      rotX += 0.008;
      rotY += 0.012;

      // Calculate smooth breathing scale factor (0.6 -> 1.4)
      let targetScale = 1.0;
      const totalPhaseTime =
        phase === 'Inhale'
          ? timings.inhale
          : phase === 'Hold'
          ? timings.holdIn
          : phase === 'Exhale'
          ? timings.exhale
          : timings.holdOut;

      const timeElapsed = totalPhaseTime - phaseSecondsLeft;
      phaseProgress = Math.max(0, Math.min(1, timeElapsed / (totalPhaseTime || 1)));

      if (phase === 'Inhale') {
        targetScale = 0.7 + phaseProgress * 0.7; // Expands 0.7 -> 1.4
      } else if (phase === 'Hold') {
        targetScale = 1.4 + Math.sin(Date.now() * 0.005) * 0.04; // Pulsing hold
      } else if (phase === 'Exhale') {
        targetScale = 1.4 - phaseProgress * 0.7; // Contracts 1.4 -> 0.7
      } else {
        targetScale = 0.7 + Math.sin(Date.now() * 0.003) * 0.02; // Rest state
      }

      // Mic volume reactivity boost
      if (micActive && micVolume > 5) {
        targetScale += (micVolume / 100) * 0.25;
      }

      const baseSphereRadius = 75 * targetScale;

      // Dynamic Color Palettes
      let strokeColor = '#38bdf8'; // Sky blue for Inhale
      let glowColor = 'rgba(56, 189, 248, 0.4)';
      if (phase === 'Hold') {
        strokeColor = '#c084fc'; // Purple for Hold
        glowColor = 'rgba(192, 132, 252, 0.5)';
      } else if (phase === 'Exhale') {
        strokeColor = '#34d399'; // Emerald for Exhale
        glowColor = 'rgba(52, 211, 153, 0.5)';
      } else if (phase === 'Rest') {
        strokeColor = '#fbbf24'; // Amber for Rest
        glowColor = 'rgba(251, 191, 36, 0.4)';
      }

      // Draw Outer Aura Ripple Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseSphereRadius + 30 + Math.sin(Date.now() * 0.004) * 8, 0, Math.PI * 2);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Project & Render 3D Particles & Connections
      const projectedPoints: Array<{ x: number; y: number; z: number; scale: number }> = [];

      particles.forEach((p) => {
        // Rotate around Y
        let x1 = p.x * Math.cos(rotY) + p.z * Math.sin(rotY);
        let z1 = -p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        let y1 = p.y;

        // Rotate around X
        let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);
        let x2 = x1;

        // Perspective Projection
        const distance = 3;
        const fov = 320;
        const scale = fov / (fov + z2 * baseSphereRadius * 0.5);
        const projX = centerX + x2 * baseSphereRadius * scale;
        const projY = centerY + y2 * baseSphereRadius * scale;

        projectedPoints.push({ x: projX, y: projY, z: z2, scale });
      });

      // Sort points by Z depth for proper rendering
      projectedPoints.sort((a, b) => a.z - b.z);

      // Draw 3D Connecting Latice Web Lines for closest nodes
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projectedPoints.length; i += 4) {
        const p1 = projectedPoints[i];
        for (let j = i + 1; j < Math.min(i + 5, projectedPoints.length); j++) {
          const p2 = projectedPoints[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 45) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = strokeColor;
            ctx.globalAlpha = Math.max(0.1, (1 - dist / 45) * 0.4);
            ctx.stroke();
          }
        }
      }

      // Draw 3D Glowing Nodes
      projectedPoints.forEach((pt) => {
        const nodeRadius = Math.max(1.2, 3.5 * pt.scale);
        const alpha = Math.max(0.2, Math.min(1.0, (pt.z + 1.5) / 3));

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // Draw Center Core Glowing Orb
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseSphereRadius * 0.45);
      coreGrad.addColorStop(0, strokeColor);
      coreGrad.addColorStop(0.6, glowColor);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseSphereRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render3DSphere);
    };

    render3DSphere();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [phase, phaseSecondsLeft, pattern, micActive, micVolume]);

  const containerContent = (
    <div className="bg-slate-900/95 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5 relative overflow-hidden">
      {/* Background Decorative Gradient Light */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">3D Somatic Breath Visualizer</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                Bio-Feedback Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Co-regulate nervous system with real-time audio reactivity</p>
          </div>
        </div>

        {isOpenModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Pattern & Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Settings2 className="w-4 h-4 text-slate-400 mr-1" />
          <span className="text-xs font-semibold text-slate-300 mr-1">Rhythm Pattern:</span>
          {(['4-7-8', '4-4-4-4', '5-5'] as const).map((pat) => (
            <button
              key={pat}
              onClick={() => {
                setPattern(pat);
                setPhase('Inhale');
                setPhaseSecondsLeft(pat === '4-7-8' ? 4 : pat === '4-4-4-4' ? 4 : 5);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pattern === pat
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {pat === '4-7-8' ? '4-7-8 Relax' : pat === '4-4-4-4' ? '4-4-4-4 Box' : '5-5 Coherence'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Mic Toggle Button */}
          <button
            onClick={toggleMicrophone}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              micActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title="Enable Microphone Audio Reactivity for live exhale tracking"
          >
            {micActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{micActive ? `Mic Active (${micVolume}%)` : 'Enable Mic Feedback'}</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              audioFeedback
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title="Solfeggio Harmonic Audio Cue"
          >
            {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 3D Interactive Visualizer Stage */}
      <div className="relative flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800 p-6 min-h-[320px]">
        {/* Live Canvas */}
        <canvas ref={canvasRef} width={420} height={280} className="max-w-full h-auto cursor-pointer" />

        {/* Dynamic Center HUD overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-white drop-shadow-lg tracking-wider font-mono">
            {phaseSecondsLeft}s
          </span>
          <span
            className={`text-sm font-bold uppercase tracking-widest mt-1 px-3 py-0.5 rounded-full border shadow-md backdrop-blur-md ${
              phase === 'Inhale'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : phase === 'Hold'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : phase === 'Exhale'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {phase === 'Inhale'
              ? 'Deep Inhale 🌬️'
              : phase === 'Hold'
              ? 'Hold & Observe 🧘'
              : phase === 'Exhale'
              ? 'Slow Release 🌊'
              : 'Rest & Center ✨'}
          </span>
        </div>

        {/* Top-Right Telemetry Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span className="text-slate-400">Stability:</span>
          <span className="font-bold font-mono text-teal-300">{stabilityScore}%</span>
        </div>

        {/* Bottom-Left Cycle Counter */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-slate-400">Completed Cycles:</span>
          <span className="font-bold font-mono text-pink-300">{cycleCount}</span>
        </div>
      </div>

      {/* Action Play / Pause / Reset Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isActive ? 'Pause Pacing' : 'Start Pacing'}</span>
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setPhase('Inhale');
              setPhaseSecondsLeft(pattern === '4-7-8' ? 4 : pattern === '4-4-4-4' ? 4 : 5);
              setCycleCount(0);
            }}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset Pacer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Vagus Nerve Stimulation Mode</span>
        </div>
      </div>
    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-2xl">{containerContent}</div>
      </div>
    );
  }

  return containerContent;
};


