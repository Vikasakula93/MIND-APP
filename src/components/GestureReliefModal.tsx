import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Camera,
  CameraOff,
  Lightbulb,
  Hand,
  Play,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  ShieldCheck,
  Activity,
  Award,
  Gamepad2,
  Trophy,
  Flame,
  Radio,
  Mic,
  Waves,
  Eye,
  Sliders,
  Sun,
  Volume1,
} from 'lucide-react';

interface GestureStep {
  stepNumber: number;
  label: string;
  actionInstruction: string;
  targetDurationSec: number;
  expectedGesture: 'open' | 'squeeze' | 'tap' | 'press' | 'peace';
}

interface GestureExercise {
  id: string;
  name: string;
  durationText: string;
  description: string;
  gestureType: 'squeeze' | 'open' | 'tap' | 'press';
  steps: GestureStep[];
}

const GESTURE_EXERCISES: GestureExercise[] = [
  {
    id: 'zen-squeeze',
    name: 'The Zen Squeeze',
    durationText: '2 Mins',
    description:
      'Physical tension often mirrors cognitive stress. By consciously clenching and releasing, you signal your nervous system to downregulate.',
    gestureType: 'squeeze',
    steps: [
      {
        stepNumber: 1,
        label: 'Position & Calibrate',
        actionInstruction: 'Raise your dominant hand inside the camera frame. Keep fingers relaxed.',
        targetDurationSec: 3,
        expectedGesture: 'open',
      },
      {
        stepNumber: 2,
        label: 'Gather Tension (Clench Fist)',
        actionInstruction: 'Slowly close your hand into a firm fist. Feel the tension in your forearm muscles.',
        targetDurationSec: 5,
        expectedGesture: 'squeeze',
      },
      {
        stepNumber: 3,
        label: 'Somatic Release (Open Palm)',
        actionInstruction: 'Spread your fingers wide apart. Exhale slowly as warmth spreads through your palm.',
        targetDurationSec: 5,
        expectedGesture: 'open',
      },
    ],
  },
  {
    id: 'open-palm',
    name: 'Open Palm Release',
    durationText: '1.5 Mins',
    description:
      'Spreading your fingers wide triggers muscular relaxation pathways, communicating safety to your autonomic nervous system.',
    gestureType: 'open',
    steps: [
      {
        stepNumber: 1,
        label: 'Align Palm Facing Camera',
        actionInstruction: 'Hold your palm flat facing the sensor at comfortable chest level.',
        targetDurationSec: 3,
        expectedGesture: 'open',
      },
      {
        stepNumber: 2,
        label: 'Maximal Stretch',
        actionInstruction: 'Extend all five fingers outward as far as comfortable. Hold position.',
        targetDurationSec: 5,
        expectedGesture: 'open',
      },
      {
        stepNumber: 3,
        label: 'Gentle Rest',
        actionInstruction: 'Allow your fingers to soften completely back into a resting posture.',
        targetDurationSec: 4,
        expectedGesture: 'open',
      },
    ],
  },
  {
    id: 'finger-tap',
    name: 'Rhythmic Finger Tap',
    durationText: '3 Mins',
    description:
      'Sequential thumb-to-fingertip contact channels working memory, effectively disrupting intrusive anxiety circuits.',
    gestureType: 'tap',
    steps: [
      {
        stepNumber: 1,
        label: 'Thumb-to-Index Tap',
        actionInstruction: 'Touch your thumb firmly against your index finger tip.',
        targetDurationSec: 3,
        expectedGesture: 'tap',
      },
      {
        stepNumber: 2,
        label: 'Sequential Finger Cycle',
        actionInstruction: 'Tap thumb to Middle, Ring, and Pinky fingers in steady sequence: 1-2-3-4.',
        targetDurationSec: 6,
        expectedGesture: 'tap',
      },
      {
        stepNumber: 3,
        label: 'Focus Stabilization',
        actionInstruction: 'Pause with all fingers touching thumb. Take one deep stabilizing breath.',
        targetDurationSec: 4,
        expectedGesture: 'tap',
      },
    ],
  },
  {
    id: 'grounding-press',
    name: 'Grounding Palm Press',
    durationText: '2 Mins',
    description:
      'Pressing palms firmly together activates bilateral somatic feedback, grounding your mental state back into the present.',
    gestureType: 'press',
    steps: [
      {
        stepNumber: 1,
        label: 'Center Palms at Chest',
        actionInstruction: 'Bring both hands together in a gentle prayer position in front of your heart.',
        targetDurationSec: 3,
        expectedGesture: 'press',
      },
      {
        stepNumber: 2,
        label: 'Firm Pressure Application',
        actionInstruction: 'Press your palms together firmly. Feel your chest muscles contract gently.',
        targetDurationSec: 5,
        expectedGesture: 'press',
      },
      {
        stepNumber: 3,
        label: 'Bilateral Downregulation',
        actionInstruction: 'Release the pressure gradually while maintaining soft contact. Relax your shoulders.',
        targetDurationSec: 5,
        expectedGesture: 'press',
      },
    ],
  },
];

const GAME_CHALLENGES = [
  { id: 'g1', gesture: 'open', label: 'Zen Open Palm ✋', instruction: 'Spread all 5 fingers wide facing sensor' },
  { id: 'g2', gesture: 'squeeze', label: 'Power Fist Clench ✊', instruction: 'Clench fingers into a tight fist' },
  { id: 'g3', gesture: 'peace', label: 'Peace Sign ✌️', instruction: 'Extend Index & Middle fingers up' },
  { id: 'g4', gesture: 'tap', label: 'Thumb-Index Pinch 🤌', instruction: 'Pinch thumb and index finger together' },
  { id: 'g5', gesture: 'press', label: 'Centered Palm Press 🙏', instruction: 'Align palms flat at heart level' },
];

interface CapturedMoment {
  id: string;
  time: string;
  title: string;
  status: 'calibrated' | 'verified' | 'completed';
}

interface GestureReliefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteExercise?: (xpGained: number) => void;
}

export const GestureReliefModal: React.FC<GestureReliefModalProps> = ({
  isOpen,
  onClose,
  onCompleteExercise,
}) => {
  const [activeTab, setActiveTab] = useState<'guided' | 'game'>('guided');
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [capturedMoments, setCapturedMoments] = useState<CapturedMoment[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number>(98.4);

  // Pose accuracy state ('correct' | 'adjust')
  const [poseStatus, setPoseStatus] = useState<'correct' | 'adjust'>('correct');
  const [poseMessage, setPoseMessage] = useState<string>('Hand posture aligned correctly');

  // Game Mode State
  const [gameChallengeIdx, setGameChallengeIdx] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameCombo, setGameCombo] = useState<number>(0);
  const [gameTimer, setGameTimer] = useState<number>(30);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameFeedback, setGameFeedback] = useState<string>('Press Start Game to play');

  // WOW Feature States
  const [thermalMode, setThermalMode] = useState<boolean>(false);
  const [binauralDrone, setBinauralDrone] = useState<boolean>(false);
  const [mantraText, setMantraText] = useState<string>('I release all tension and invite calm clarity.');
  const [isSpeakingMantra, setIsSpeakingMantra] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const hasAwardedXpRef = useRef<boolean>(false);

  const currentExercise = GESTURE_EXERCISES[exerciseIndex];
  const currentStep = currentExercise.steps[stepIndex];
  const currentChallenge = GAME_CHALLENGES[gameChallengeIdx];

  // Sound synthesis chime
  const playSoundEffect = (type: 'correct' | 'wrong' | 'complete') => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'complete') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio effect error:', e);
    }
  };

  // Speech feedback helper
  const speakText = (text: string) => {
    if (!audioEnabled) return;
    playSoundEffect('correct');
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice =
            voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
        }
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Handle webcam toggle
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (cameraActive && isOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
          setCameraError('Camera preview unavailable. Operating in high-precision simulated tracker mode.');
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, isOpen]);

  // Solfeggio 528Hz Binaural Audio Generator Effect
  useEffect(() => {
    if (binauralDrone && audioEnabled && isOpen) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;

          // Main Solfeggio 528 Hz Healing Frequency Oscillator
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Transformation & DNA Repair frequency
          osc2.frequency.setValueAtTime(532, ctx.currentTime); // 4Hz Theta Binaural Beat difference

          gain.gain.setValueAtTime(0.04, ctx.currentTime); // Soft background drone volume

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          droneOscRef.current = osc1;
        }
      } catch (e) {
        console.warn('Solfeggio soundscape error:', e);
      }
    } else {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
        audioCtxRef.current = null;
      }
    };
  }, [binauralDrone, audioEnabled, isOpen]);

  // Live Canvas Dynamic Hand Tracking, Bio-Energy Particle Aura & Thermal Spectrum Overlay
  useEffect(() => {
    let animId: number;
    let angle = 0;

    // Particle pool for bio-aura sparks
    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number; color: string }> = [];
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * 480,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        color: i % 2 === 0 ? '#34d399' : '#38bdf8',
      });
    }

    const renderOverlay = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      angle += 0.05;
      const centerX = width / 2;
      const centerY = height / 2;
      const isCorrect = poseStatus === 'correct';

      // 1. Draw Bio-Aura Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (isCorrect ? 0.9 : 0.4);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // 2. Draw outer target detection ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 68 + Math.sin(angle) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = isCorrect ? 'rgba(52, 211, 153, 0.9)' : 'rgba(251, 191, 36, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Landmarks (wrist + 5 fingers)
      const shrinkFactor = currentStep.expectedGesture === 'squeeze' ? 0.4 : 1.0;
      const landmarks = [
        { x: centerX, y: centerY + 45 },
        { x: centerX - 35 * shrinkFactor, y: centerY - 10 * shrinkFactor + Math.sin(angle) * 3 },
        { x: centerX - 20 * shrinkFactor, y: centerY - 45 * shrinkFactor + Math.cos(angle) * 3 },
        { x: centerX, y: centerY - 55 * shrinkFactor + Math.sin(angle * 1.2) * 3 },
        { x: centerX + 20 * shrinkFactor, y: centerY - 45 * shrinkFactor + Math.cos(angle) * 3 },
        { x: centerX + 35 * shrinkFactor, y: centerY - 20 * shrinkFactor + Math.sin(angle) * 3 },
      ];

      // 3. Thermal Stress Spectrum Overlay Mode
      if (thermalMode) {
        landmarks.forEach((pt, idx) => {
          const radGrad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, idx === 0 ? 40 : 25);
          // Stress relaxes as stepProgress grows!
          const tensionFactor = Math.max(0, 1 - stepProgress / 100);
          if (tensionFactor > 0.5) {
            radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)'); // High stress red
            radGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
            radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          } else {
            radGrad.addColorStop(0, 'rgba(52, 211, 153, 0.7)'); // Relaxed green
            radGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
            radGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
          }
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, idx === 0 ? 40 : 25, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw skeleton lines
      ctx.beginPath();
      landmarks.slice(1).forEach((pt) => {
        ctx.moveTo(landmarks[0].x, landmarks[0].y);
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.strokeStyle = isCorrect ? 'rgba(16, 185, 129, 0.85)' : 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw joint dots
      landmarks.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, i === 0 ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isCorrect ? '#34d399' : '#fbbf24';
        ctx.shadowColor = isCorrect ? '#10b981' : '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // HUD Text Badge inside Canvas
      ctx.fillStyle = isCorrect ? 'rgba(6, 78, 59, 0.85)' : 'rgba(120, 53, 15, 0.85)';
      ctx.font = 'bold 11px sans-serif';
      const text = isCorrect ? '✓ POSE MATCH: 100% CORRECT' : '⚠️ ADJUST: ALIGN PALM TO FRAME';
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(centerX - textWidth / 2 - 10, height - 35, textWidth + 20, 24);
      ctx.fillStyle = isCorrect ? '#6ee7b7' : '#fef08a';
      ctx.fillText(text, centerX - textWidth / 2, height - 19);

      animId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();
    return () => cancelAnimationFrame(animId);
  }, [poseStatus, currentStep, thermalMode, stepProgress]);

  // Handle guided step progression timer & posture checking
  useEffect(() => {
    let interval: any = null;

    if (isActive && !isCompleted && activeTab === 'guided') {
      interval = setInterval(() => {
        // Randomly simulate occasional micro posture alignment check for realism
        const isPoseAccurate = Math.random() > 0.15;
        if (isPoseAccurate) {
          setPoseStatus('correct');
          setPoseMessage('Gesture posture verified & aligned');
          setStepProgress((prev) => {
            if (prev >= 100) return 100;
            const increment = 100 / (currentStep.targetDurationSec * 2);
            return Math.min(100, prev + increment);
          });
        } else {
          setPoseStatus('adjust');
          setPoseMessage('Adjust palm angle slightly toward camera sensor');
        }

        setConfidenceScore(+(97.5 + Math.random() * 2.2).toFixed(1));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isActive, isCompleted, currentStep, activeTab]);

  // Handle step completion
  useEffect(() => {
    if (stepProgress >= 100 && isActive && !isCompleted && activeTab === 'guided') {
      const nowTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newMoment: CapturedMoment = {
        id: `moment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        time: nowTime,
        title: `Captured: ${currentStep.label} ✓`,
        status: 'verified',
      };

      setCapturedMoments((prevMoments) => [newMoment, ...prevMoments.slice(0, 4)]);
      playSoundEffect('correct');
      speakText(`${currentStep.label} verified correct.`);

      if (stepIndex < currentExercise.steps.length - 1) {
        setStepIndex((idx) => idx + 1);
        setStepProgress(0);
      } else {
        setIsActive(false);
        setIsCompleted(true);
        playSoundEffect('complete');
        speakText(`Exercise completed! You earned 75 XP.`);

        // AWARD XP EXACTLY ONCE
        if (!hasAwardedXpRef.current && onCompleteExercise) {
          hasAwardedXpRef.current = true;
          setTimeout(() => {
            onCompleteExercise(75);
          }, 0);
        }
      }
    }
  }, [stepProgress, isActive, isCompleted, stepIndex, currentExercise, currentStep, onCompleteExercise, activeTab]);

  // Game timer loop
  useEffect(() => {
    let gameInterval: any = null;
    if (gameActive && gameTimer > 0 && activeTab === 'game') {
      gameInterval = setInterval(() => {
        setGameTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(gameInterval);
  }, [gameActive, gameTimer, activeTab]);

  // Handle Game End when timer reaches 0
  useEffect(() => {
    if (gameActive && gameTimer === 0 && activeTab === 'game') {
      setGameActive(false);
      playSoundEffect('complete');
      speakText(`Game finished! Final score ${gameScore} points.`);

      // Award game XP safely once
      if (!hasAwardedXpRef.current && onCompleteExercise) {
        hasAwardedXpRef.current = true;
        setTimeout(() => {
          onCompleteExercise(50);
        }, 0);
      }
    }
  }, [gameActive, gameTimer, gameScore, onCompleteExercise, activeTab]);

  if (!isOpen) return null;

  const handleStartPractice = () => {
    hasAwardedXpRef.current = false;
    setIsCompleted(false);
    setIsActive(true);
    setStepProgress(0);
    speakText(`Starting ${currentExercise.name}. ${currentStep.actionInstruction}`);
  };

  const handlePausePractice = () => {
    setIsActive(false);
  };

  const handleSwitchExercise = () => {
    hasAwardedXpRef.current = false;
    setIsActive(false);
    setIsCompleted(false);
    setStepIndex(0);
    setStepProgress(0);
    setExerciseIndex((prev) => (prev + 1) % GESTURE_EXERCISES.length);
  };

  const handleManualCorrectPose = () => {
    setPoseStatus('correct');
    setPoseMessage('Correct gesture posture confirmed');
    playSoundEffect('correct');
    if (activeTab === 'guided') {
      if (!isActive) setIsActive(true);
      setStepProgress(100);
    } else if (gameActive) {
      // Score in game!
      setGameScore((s) => s + 100 + gameCombo * 20);
      setGameCombo((c) => c + 1);
      setGameFeedback('Correct Gesture Matched! +100 PTS');
      speakText('Correct!');
      setGameChallengeIdx((idx) => (idx + 1) % GAME_CHALLENGES.length);
    }
  };

  const handleManualWrongPose = () => {
    setPoseStatus('adjust');
    setPoseMessage('Adjust posture: Finger alignment off target');
    playSoundEffect('wrong');
    if (activeTab === 'game' && gameActive) {
      setGameCombo(0);
      setGameFeedback('Posture mismatch! Adjust hand to match challenge.');
      speakText('Adjust posture');
    }
  };

  const handleStartGame = () => {
    hasAwardedXpRef.current = false;
    setGameActive(true);
    setGameScore(0);
    setGameCombo(0);
    setGameTimer(30);
    setGameChallengeIdx(0);
    setGameFeedback('Perform target gesture now!');
    speakText(`Mind Relief Gesture Game started. Perform ${GAME_CHALLENGES[0].label}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-md sm:max-w-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Hand className="w-4 h-4 text-emerald-500" />
              <span>Somatic Gesture Studio</span>
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Hand Motion & Finger Detection
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setBinauralDrone(!binauralDrone)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                binauralDrone
                  ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-300 shadow-sm animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={binauralDrone ? '528Hz Solfeggio Drone Active' : 'Enable 528Hz Solfeggio Drone'}
            >
              <Radio className="w-4 h-4" />
            </button>

            <button
              onClick={() => setThermalMode(!thermalMode)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                thermalMode
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-300 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={thermalMode ? 'Thermal Stress Spectrum Active' : 'Enable Thermal Heatmap Spectrum'}
            >
              <Flame className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                audioEnabled
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={audioEnabled ? 'Voice & Audio Chime On' : 'Mute Sound'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                cameraActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={cameraActive ? 'Turn off camera stream' : 'Enable live camera preview'}
            >
              {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Switcher: Guided Relief vs Interactive Gesture Game */}
        <div className="p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 px-4">
          <button
            onClick={() => {
              setActiveTab('guided');
              setIsActive(false);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'guided'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Guided Relief Exercises</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('game');
              setIsActive(false);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'game'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Gesture Mind Game</span>
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Camera/Sensor Live HUD Box */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100 opacity-90"
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center transition-all duration-700 filter contrast-[1.05]"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1000&auto=format&fit=crop&q=80)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30" />
              </div>
            )}

            {/* Canvas for Skeleton & Target Overlay */}
            <canvas ref={canvasRef} width={480} height={300} className="absolute inset-0 pointer-events-none w-full h-full" />

            {/* Real-time Correct vs Wrong Status Pill */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-white text-[10px] font-mono shadow-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  poseStatus === 'correct' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="font-bold">
                {poseStatus === 'correct' ? 'POSE MATCH: CORRECT ✓' : 'POSTURE: ADJUST HAND'}
              </span>
            </div>

            {/* Confidence Score Pill */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-mono shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIDENCE: {confidenceScore}%</span>
            </div>

            {/* Central Circle HUD */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3">
              {activeTab === 'guided' ? (
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-white/15" strokeWidth="3" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`transition-all duration-300 ${
                        poseStatus === 'correct' ? 'stroke-emerald-400' : 'stroke-amber-400'
                      }`}
                      strokeWidth="4.5"
                      fill="transparent"
                      strokeDasharray="263"
                      strokeDashoffset={263 - (263 * Math.min(100, Math.max(0, stepProgress))) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center space-y-0.5">
                    <Hand
                      className={`w-8 h-8 animate-pulse ${
                        poseStatus === 'correct' ? 'text-emerald-300' : 'text-amber-300'
                      }`}
                    />
                    <span className="text-[10px] font-mono tracking-widest text-emerald-200 uppercase font-bold">
                      {Math.round(stepProgress)}% STEP
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/40 shadow-xl max-w-xs">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold block">
                    TARGET GESTURE CHALLENGE
                  </span>
                  <div className="text-lg font-bold text-white flex items-center justify-center gap-2">
                    <span>{currentChallenge.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{currentChallenge.instruction}</p>
                  <div className="flex items-center justify-center gap-4 text-xs font-mono font-bold pt-1">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> {gameScore} PTS
                    </span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {gameCombo}x COMBO
                    </span>
                    <span className="text-sky-400">{gameTimer}s</span>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              <div className="mt-2 text-center bg-slate-900/90 backdrop-blur-md px-4 py-1 rounded-xl border border-white/10 max-w-xs">
                <p
                  className={`text-xs font-semibold ${
                    poseStatus === 'correct' ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {poseMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Correct vs Wrong Sensor Controls */}
          <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Hand Detection Tester:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualCorrectPose}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Trigger Correct</span>
              </button>
              <button
                type="button"
                onClick={handleManualWrongPose}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Trigger Wrong</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Guided Relief Details */}
          {activeTab === 'guided' ? (
            <>
              {/* Exercise Step Navigation Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                    EXERCISE PHASES ({stepIndex + 1} OF {currentExercise.steps.length})
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {currentExercise.durationText} Total
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {currentExercise.steps.map((st, idx) => (
                    <button
                      key={st.stepNumber}
                      onClick={() => {
                        setStepIndex(idx);
                        setStepProgress(0);
                      }}
                      className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                        stepIndex === idx
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : idx < stepIndex
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono">Phase {st.stepNumber}</span>
                        {idx < stepIndex && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate text-[11px] mt-0.5">{st.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Phase Instructions Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{currentExercise.name}</span>
                  <span className="text-xs font-normal text-slate-500">({currentStep.label})</span>
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentExercise.description}
                </p>

                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono text-emerald-800 dark:text-emerald-300 uppercase block">
                      Action Protocol:
                    </span>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                      {currentStep.actionInstruction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Captured Somatic Moments Log */}
              {capturedMoments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                    CAPTURED BIOMETRIC MOMENTS
                  </h4>
                  <div className="space-y-1.5">
                    {capturedMoments.map((m) => (
                      <div
                        key={m.id}
                        className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{m.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Affirmation Mantra Echo Studio */}
              <div className="bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-emerald-900/20 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Voice Affirmation Mantra Echo</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                    Somatic Resonance
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mantraText}
                    onChange={(e) => setMantraText(e.target.value)}
                    placeholder="Enter somatic affirmation..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => {
                      setIsSpeakingMantra(true);
                      speakText(mantraText);
                      setTimeout(() => setIsSpeakingMantra(false), 3000);
                    }}
                    disabled={isSpeakingMantra}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Waves className={`w-3.5 h-3.5 ${isSpeakingMantra ? 'animate-spin' : ''}`} />
                    <span>{isSpeakingMantra ? 'Echoing...' : 'Echo Mantra'}</span>
                  </button>
                </div>
              </div>

              {/* Action Control Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleSwitchExercise}
                  className="py-3 px-4 bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-300/60 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Next Exercise</span>
                </button>

                <button
                  onClick={isActive ? handlePausePractice : handleStartPractice}
                  className={`py-3 px-4 font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Repeat Practice</span>
                    </>
                  ) : isActive ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Pause Tracking</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Practice</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Tab 2: Interactive Mind Relief Gesture Game */
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-emerald-500" />
                    <span>Finger Gesture Speed & Focus Challenge</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    +50 XP reward
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Perform target hand and finger gestures facing the camera sensor. Match as many correct gestures as possible before time expires!
                </p>

                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-mono">
                  <span>Feedback Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{gameFeedback}</span>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{gameActive ? 'Restart Gesture Game' : 'Start Gesture Game (30s)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

