import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  Droplets,
  Sparkles,
  Sun,
  Moon,
  CloudSun,
  Wind,
  Trophy,
  Award,
  RefreshCw,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  Sparkle,
  Zap,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sliders,
} from 'lucide-react';
import { UserProfile } from '../types';

interface GrowthGardenProps {
  userProfile: UserProfile;
  onUpdateXp?: (amount: number) => void;
}

type GardenTheme = 'sakura' | 'autumn' | 'emerald' | 'celestial';
type TimeOfDay = 'dawn' | 'noon' | 'twilight' | 'night';

interface GardenInsightData {
  treeTitle: string;
  growthStage: string;
  reflectionPoem: string;
  nextMilestoneHint: string;
  gardenEnergy: string;
}

export const GrowthGardenVisualizer: React.FC<GrowthGardenProps> = ({ userProfile, onUpdateXp }) => {
  const [theme, setTheme] = useState<GardenTheme>('sakura');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('twilight');
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [waterCount, setWaterCount] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [weedNodesCount, setWeedNodesCount] = useState<number>(3);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const [aiInsight, setAiInsight] = useState<GardenInsightData>({
    treeTitle: `Oak of ${userProfile.name}'s Clarity`,
    growthStage: `Stage ${Math.min(5, Math.floor(userProfile.streakDays / 5) + 1)}: Luminous Resilience`,
    reflectionPoem: `Rooted deep in ${userProfile.streakDays} days of mindful discipline, your tree stretches towards emotional clarity. With high metacognitive focus, its branches bear evidence of steady inner strength.`,
    nextMilestoneHint: 'Maintain a 14-day reframing streak to unlock the Reflection Koi Pond.',
    gardenEnergy: 'Serene Radiance',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Fetch AI Garden Analysis
  const fetchGardenAnalysis = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/cbt/garden-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userProfile.name,
          streakDays: userProfile.streakDays,
          totalXp: userProfile.totalXp,
          clarityScore: userProfile.clarityScore,
          totalSessions: userProfile.completedSessionsCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.treeTitle) setAiInsight(data);
      }
    } catch (e) {
      console.warn('Fallback to client garden insight:', e);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchGardenAnalysis();
  }, []);

  // Handle Speech Audio for Garden Reflection
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${aiInsight.treeTitle}. ${aiInsight.reflectionPoem}`);
      utterance.rate = 0.92;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const prefVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')));
      if (prefVoice) utterance.voice = prefVoice;

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Water Garden Action (+10 XP)
  const handleWaterGarden = () => {
    setIsWatering(true);
    setWaterCount((prev) => prev + 1);
    if (onUpdateXp) onUpdateXp(10);
    setTimeout(() => setIsWatering(false), 2500);
  };

  // Prune Weed Node
  const handlePruneWeed = () => {
    if (weedNodesCount > 0) {
      setWeedNodesCount((prev) => prev - 1);
      if (onUpdateXp) onUpdateXp(5);
    }
  };

  // Render Procedural 3D-styled Tree & Environment on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    // Background Gradient by Time of Day
    const getBgGradient = (width: number, height: number) => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (timeOfDay === 'dawn') {
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#4338ca');
        grad.addColorStop(1, '#fda4af');
      } else if (timeOfDay === 'noon') {
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.6, '#38bdf8');
        grad.addColorStop(1, '#bae6fd');
      } else if (timeOfDay === 'twilight') {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#818cf8');
      } else {
        // Night
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
      }
      return grad;
    };

    // Color Palettes by Theme
    const themeColors = {
      sakura: {
        trunk: '#451a03',
        branches: '#78350f',
        leaves: ['#f472b6', '#fb7185', '#f43f5e', '#fbcfe8'],
        blossom: '#ffffff',
      },
      autumn: {
        trunk: '#292524',
        branches: '#57534e',
        leaves: ['#f59e0b', '#d97706', '#b45309', '#fef08a'],
        blossom: '#fbbf24',
      },
      emerald: {
        trunk: '#1c1917',
        branches: '#44403c',
        leaves: ['#10b981', '#059669', '#047857', '#a7f3d0'],
        blossom: '#34d399',
      },
      celestial: {
        trunk: '#1e1b4b',
        branches: '#3730a3',
        leaves: ['#a855f7', '#8b5cf6', '#6366f1', '#e0e7ff'],
        blossom: '#c084fc',
      },
    };

    const currentColors = themeColors[theme];

    // Particle Array (Petals / Stars / Fireflies)
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }> = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.6 + 0.3,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        color: currentColors.leaves[Math.floor(Math.random() * currentColors.leaves.length)],
      });
    }

    // Rain particles for watering animation
    const rainDrops: Array<{ x: number; y: number; length: number; speed: number }> = [];
    for (let i = 0; i < 60; i++) {
      rainDrops.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        length: Math.random() * 15 + 10,
        speed: Math.random() * 10 + 12,
      });
    }

    // Recursive Branching Tree Function
    const drawTree = (
      x: number,
      y: number,
      len: number,
      angle: number,
      branchWidth: number,
      depth: number
    ) => {
      ctx.beginPath();
      ctx.save();

      const safeDepth = Math.max(0, depth);

      // Dynamic wind sway effect
      const windSway = Math.sin(tick * 0.03 + safeDepth) * (0.02 * (6 - safeDepth));
      const effectiveAngle = angle + windSway + (rotationAngle * 0.005);

      ctx.strokeStyle = safeDepth > 2 ? currentColors.branches : currentColors.trunk;
      ctx.lineWidth = Math.max(1, branchWidth * zoomLevel);
      ctx.lineCap = 'round';

      ctx.moveTo(x, y);
      const endX = x + Math.sin(effectiveAngle) * len * zoomLevel;
      const endY = y - Math.cos(effectiveAngle) * len * zoomLevel;
      ctx.lineTo(endX, endY);
      ctx.stroke();

      if (isNaN(depth) || depth <= 0) {
        // Draw Leaf Clusters & Blossoms
        const clusterCount = 4;
        const safeClarity = Number.isFinite(userProfile?.clarityScore) ? userProfile.clarityScore : 80;
        for (let i = 0; i < clusterCount; i++) {
          const lAngle = Math.random() * Math.PI * 2;
          const lDist = Math.random() * 16 * zoomLevel;
          const lx = endX + Math.cos(lAngle) * lDist;
          const ly = endY + Math.sin(lAngle) * lDist;

          ctx.beginPath();
          ctx.arc(lx, ly, (Math.random() * 7 + 5) * zoomLevel, 0, Math.PI * 2);
          ctx.fillStyle = currentColors.leaves[i % currentColors.leaves.length];
          ctx.globalAlpha = 0.85;
          ctx.fill();

          // Glowing Blossom Centers based on Clarity Score
          if (safeClarity > 60 && Math.random() > 0.4) {
            ctx.beginPath();
            ctx.arc(lx, ly, 2.5 * zoomLevel, 0, Math.PI * 2);
            ctx.fillStyle = currentColors.blossom;
            ctx.shadowColor = currentColors.blossom;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        ctx.restore();
        return;
      }

      ctx.restore();

      // Recurse Left and Right Branches with safe decrement
      const angleSpread = 0.42;
      const lenReduction = 0.74;
      drawTree(endX, endY, len * lenReduction, effectiveAngle - angleSpread, branchWidth * 0.7, depth - 1);
      drawTree(endX, endY, len * lenReduction, effectiveAngle + angleSpread, branchWidth * 0.7, depth - 1);
    };

    const renderCanvas = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Draw Sky & Sun/Moon
      ctx.fillStyle = getBgGradient(w, h);
      ctx.fillRect(0, 0, w, h);

      // Sun or Moon orb
      ctx.beginPath();
      const orbX = w * 0.8;
      const orbY = timeOfDay === 'noon' ? h * 0.2 : h * 0.3;
      ctx.arc(orbX, orbY, 32, 0, Math.PI * 2);
      ctx.fillStyle = timeOfDay === 'night' ? '#e2e8f0' : timeOfDay === 'noon' ? '#fde047' : '#fdba74';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Horizon Ground & Hill
      const groundY = h * 0.82;
      ctx.beginPath();
      ctx.ellipse(w / 2, groundY + 80, w * 0.6, 120, 0, 0, Math.PI * 2);
      ctx.fillStyle = timeOfDay === 'night' ? '#0f172a' : '#15803d';
      ctx.fill();

      // Base Zen Garden Platform
      ctx.beginPath();
      ctx.ellipse(w / 2, groundY, 180 * zoomLevel, 45 * zoomLevel, 0, 0, Math.PI * 2);
      ctx.fillStyle = timeOfDay === 'night' ? '#1e293b' : '#334155';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#64748b';
      ctx.stroke();

      // Safe Tree Dimensions derived from User XP and Streak Days
      const safeStreak = Number.isFinite(userProfile?.streakDays) ? userProfile.streakDays : 7;
      const safeXp = Number.isFinite(userProfile?.totalXp) ? userProfile.totalXp : 500;
      const maxDepth = Math.min(4, Math.max(3, Math.floor(safeStreak / 6) + 3));
      const initialLen = Math.min(85, 55 + safeXp * 0.01);
      const initialWidth = Math.min(16, 9 + safeXp * 0.003);

      // Render the Main Procedural Tree
      drawTree(w / 2, groundY, initialLen, 0, initialWidth, maxDepth);

      // Render Negative Cognitive Weed Nodes at base (if any remain)
      for (let i = 0; i < weedNodesCount; i++) {
        const weedX = w / 2 - 90 + i * 80;
        const weedY = groundY + 15;
        ctx.beginPath();
        ctx.arc(weedX, weedY, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText('⚡', weedX - 4, weedY + 3);
      }

      // Render Falling Petals / Floating Fireflies
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(tick * 0.02) * 0.5;

        if (p.y > h) {
          p.y = -10;
          p.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Render Water Droplet Animation if Active
      if (isWatering) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        rainDrops.forEach((d) => {
          d.y += d.speed;
          if (d.y > groundY) {
            d.y = 0;
            d.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);
          ctx.stroke();
        });
      }

      animFrameRef.current = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, timeOfDay, zoomLevel, rotationAngle, isWatering, weedNodesCount, userProfile]);

  return (
    <div className="space-y-6 pb-24 md:pb-12 pt-2 font-sans animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sprout className="w-4 h-4 animate-bounce" />
            <span>Procedural Mindful Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Virtual CBT Growth Garden
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Watch your inner calm manifest visually. Every thought reframed and mindfulness session completed nourishes your virtual tree's roots and blooms.
          </p>
        </div>

        {/* Quick Garden Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleWaterGarden}
            disabled={isWatering}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Droplets className={`w-4 h-4 ${isWatering ? 'animate-bounce text-amber-300' : ''}`} />
            <span>{isWatering ? 'Nurturing Canopy...' : 'Nurture Tree (+10 XP)'}</span>
          </button>

          {weedNodesCount > 0 && (
            <button
              onClick={handlePruneWeed}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Prune Weed ({weedNodesCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Canvas Stage Container */}
      <div className="relative overflow-hidden bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl group">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full h-[360px] sm:h-[480px] object-cover cursor-grab active:cursor-grabbing"
        />

        {/* Top Control Overlay: Theme & Time of Day */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-auto">
          {/* Season Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/90 p-1.5 rounded-2xl backdrop-blur-md">
            {[
              { id: 'sakura', label: '🌸 Sakura', color: 'text-pink-400' },
              { id: 'autumn', label: '🍁 Autumn', color: 'text-amber-400' },
              { id: 'emerald', label: '🌿 Emerald', color: 'text-emerald-400' },
              { id: 'celestial', label: '✨ Celestial', color: 'text-purple-400' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as GardenTheme)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === t.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Time of Day Pills */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/90 p-1.5 rounded-2xl backdrop-blur-md">
            {[
              { id: 'dawn', icon: CloudSun },
              { id: 'noon', icon: Sun },
              { id: 'twilight', icon: Wind },
              { id: 'night', icon: Moon },
            ].map((tod) => {
              const IconComp = tod.icon;
              return (
                <button
                  key={tod.id}
                  onClick={() => setTimeOfDay(tod.id as TimeOfDay)}
                  className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    timeOfDay === tod.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`Switch to ${tod.id}`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Overlay Info & Orbit Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 pointer-events-auto">
          {/* Current Tree Title & Stage Badge */}
          <div className="bg-slate-950/80 border border-slate-800/90 p-3.5 rounded-2xl backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                {aiInsight.growthStage}
              </span>
              <span className="text-xs font-bold text-teal-300 font-mono">
                {userProfile.streakDays}-Day Momentum
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{aiInsight.treeTitle}</h3>
          </div>

          {/* Interactive Zoom & Angle Adjuster */}
          <div className="bg-slate-950/80 border border-slate-800/90 p-3 rounded-2xl backdrop-blur-md flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[10px]">Zoom:</span>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[10px]">Angle:</span>
              <input
                type="range"
                min="-20"
                max="20"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Garden Reflection & Wisdom Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                AI Metacognitive Garden Reflection
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Garden Energy: {aiInsight.gardenEnergy}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeech}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Pause' : 'Listen'}</span>
            </button>

            <button
              onClick={fetchGardenAnalysis}
              disabled={loadingAi}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
              title="Refresh AI Garden Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAi ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Poem Quote Box */}
        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
          <p className="text-sm sm:text-base font-medium text-slate-100 italic leading-relaxed">
            "{aiInsight.reflectionPoem}"
          </p>
          <p className="text-xs text-teal-300 font-semibold pt-2 border-t border-slate-800/80">
            💡 <strong>Next Milestone Goal:</strong> {aiInsight.nextMilestoneHint}
          </p>
        </div>
      </div>

      {/* Garden Unlockable Milestones Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Ecosystem Garden Unlocks</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Zen Stone Lantern',
              req: 'Level 2 Practitioner (500+ XP)',
              unlocked: userProfile.totalXp >= 500,
              icon: '🏮',
              desc: 'Emits warm amber light during night garden mode.',
            },
            {
              title: 'Reflection Koi Pond',
              req: 'Level 3 Practitioner (1200+ XP)',
              unlocked: userProfile.totalXp >= 1200,
              icon: '🐟',
              desc: 'Calm water surface reflecting mind clarity score.',
            },
            {
              title: 'Golden Lotus Fountain',
              req: '14-Day Reframing Streak',
              unlocked: userProfile.streakDays >= 14,
              icon: '🪷',
              desc: 'Spouts continuous bio-luminescent water droplets.',
            },
            {
              title: 'Ancient Torii Arch',
              req: '30-Day Master Streak',
              unlocked: userProfile.streakDays >= 30,
              icon: '⛩️',
              desc: 'Sacred entrance symbolizing emotional sovereignty.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                item.unlocked
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.unlocked
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.unlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              <p className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                Requirement: {item.req}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

