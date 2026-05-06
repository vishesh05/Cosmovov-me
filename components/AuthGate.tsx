
import React from 'react';
import { Icons } from './Icons';
import { CosmoVocAvatar } from './chat/CosmoVocAvatar';

interface AuthGateProps {
  onLogin: () => void;
  onSignUp: () => void;
  onBack: () => void;
  title?: string;
  message?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onLogin,
  onSignUp,
  onBack,
  title = "Access Restricted",
  message = "To sync your charts, manage your wallet, and receive personalized cosmic alerts, please join our community."
}) => (
  <div className="flex flex-col h-full bg-ivory-50 px-8 py-10 animate-fade-in relative z-[300]">
    {/* Navigation */}
    <div className="absolute top-8 left-8">
      <button
        onClick={onBack}
        className="p-2 text-stone-400 hover:text-charcoal-900 transition-colors active:scale-90"
      >
        <Icons.ChevronLeft />
      </button>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center text-center">
      {/* Visual Icon */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-gold-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-charcoal-900/30">
          <CosmoVocAvatar isTyping={false} className="w-24 h-24" />
        </div>
      </div>

      {/* Content */}
      <h2 className="text-3xl font-serif text-charcoal-900 mb-5 tracking-tight leading-tight uppercase px-4">
        {title}
      </h2>
      <p className="text-stone-400 text-sm leading-relaxed mb-16 max-w-[280px] mx-auto font-light">
        {message}
      </p>

      {/* Buttons & Labels */}
      <div className="w-full space-y-8 max-w-[300px]">
        <div>
          <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.25em] mb-4">
            Already have an account?
          </p>
          <button
            onClick={onLogin}
            className="w-full bg-charcoal-900 text-ivory-50 py-5 rounded-[20px] font-serif tracking-[0.25em] text-[11px] uppercase shadow-2xl shadow-charcoal-900/20 active:scale-95 transition-all border border-white/5"
          >
            Authorize Log In
          </button>
        </div>

        <div>
          <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.25em] mb-4">
            First time here?
          </p>
          <button
            onClick={onSignUp}
            className="w-full bg-white border border-stone-200 text-charcoal-900 py-5 rounded-[20px] font-serif tracking-[0.25em] text-[11px] uppercase active:scale-95 transition-all shadow-sm hover:border-gold-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>

    {/* Footer Branding */}
    <div className="mt-auto text-center opacity-30 pt-10">
      <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-charcoal-800">
        CosmoVoc Celestial Network
      </p>
    </div>
  </div>
);
