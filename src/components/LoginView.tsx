import React, { useState } from 'react';
import { Brain, ArrowRight, ShieldCheck, Sparkles, User, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (name: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [nameInput, setNameInput] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('Anxiety & Stress');

  const focusOptions = [
    { id: 'anxiety', label: 'Anxiety & Stress Reduction', desc: 'Break panic loops and reframe irrational worries.' },
    { id: 'perfectionism', label: 'Overcoming Perfectionism', desc: 'Shift from all-or-nothing thinking to iterative progress.' },
    { id: 'stoic', label: 'Stoic Mindset & Resilience', desc: 'Focus strictly on what is in your control.' },
    { id: 'imposter', label: 'Imposter Syndrome Relief', desc: 'Neutralize self-doubt with objective evidence testing.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = nameInput.trim() ? nameInput.trim() : 'Guest User';
    onLogin(finalName);
  };

  const handleGuestClick = () => {
    onLogin('Guest User');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Subtle glowing background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6 animate-fade-in">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2 shadow-inner">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">AI MindSelf</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            AI-Powered Cognitive Behavioral Therapy (CBT), Thought Reframing, & Philosophical Wisdom Console.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Your Name <span className="text-slate-500 font-normal lowercase">(optional)</span></span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name (or leave empty for Guest User)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Focus Area Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Primary Metacognitive Focus</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {focusOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedFocus(option.label)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    selectedFocus === option.label
                      ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{option.label}</span>
                    {selectedFocus === option.label && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-2">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{nameInput.trim() ? `Enter AI MindSelf as ${nameInput.trim()}` : 'Enter AI MindSelf'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleGuestClick}
              className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Continue as Guest User</span>
            </button>
          </div>
        </form>

        {/* Footer Guarantee */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>100% Private & Encrypted Client-Side Session. No Registration Required.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
