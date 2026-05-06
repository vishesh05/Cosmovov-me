
import React from 'react';
import { Icons } from './Icons';
import { UserProfile } from '../types';

interface GuestResumeDialogProps {
  profile: UserProfile;
  onContinue: () => void;
  onNew: () => void;
  onCancel: () => void;
}

const GuestResumeDialog: React.FC<GuestResumeDialogProps> = ({ profile, onContinue, onNew, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[700] flex items-end justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in">
      {/* Clickable backdrop area */}
      <div className="absolute inset-0" onClick={onCancel}></div>
      
      <div className="bg-white rounded-t-[40px] w-full max-w-[430px] p-8 shadow-2xl relative overflow-hidden animate-slide-up z-10 border-t border-white/20">
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-stone-100 rounded-full mx-auto mb-10"></div>
        
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gold-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-20 h-20 bg-charcoal-900 text-gold-400 rounded-[28px] flex items-center justify-center relative z-10 shadow-2xl shadow-charcoal-900/30">
               <div className="scale-125"><Icons.History /></div>
            </div>
          </div>
          
          <h3 className="text-2xl font-serif text-charcoal-900 mb-2 tracking-[0.05em] uppercase">Welcome Back</h3>
          <p className="text-stone-400 text-sm font-light mb-10 px-6 leading-relaxed italic opacity-80">
            "Your previous cosmic footprint was found. Shall we continue your journey?"
          </p>

          {/* Info Card */}
          <div className="bg-ivory-100/50 rounded-[24px] p-7 mb-10 border border-stone-100/80 shadow-inner">
             <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200/40">
                    <div className="text-left">
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Divine Soul</span>
                        <span className="text-sm font-bold text-charcoal-900 lowercase">{profile.name}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Gender</span>
                        <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.1em]">{profile.gender}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 text-left">
                    <div>
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Date of Birth</span>
                        <span className="text-xs font-bold text-charcoal-800">{profile.date}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1 text-right">Birth Time</span>
                        <span className="text-xs font-bold text-charcoal-800">{profile.time}</span>
                    </div>
                    <div className="col-span-2 pt-2">
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Sacred Place</span>
                        <span className="text-xs font-bold text-charcoal-800 truncate block lowercase">{profile.location}</span>
                    </div>
                </div>
             </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 px-2">
            <button 
              onClick={onContinue}
              className="w-full bg-charcoal-900 text-gold-400 py-5 rounded-[20px] font-serif tracking-[0.25em] text-[11px] uppercase shadow-2xl shadow-charcoal-900/40 active:scale-[0.98] transition-all border border-white/5"
            >
              Resume Journey
            </button>
            <button 
              onClick={onNew}
              className="w-full bg-white border border-stone-200 text-stone-400 py-5 rounded-[20px] font-serif tracking-[0.25em] text-[11px] uppercase active:scale-[0.98] transition-all hover:bg-stone-50"
            >
              Start New Chart
            </button>
          </div>

          <button 
            onClick={onCancel}
            className="mt-12 mb-4 w-full text-[11px] font-bold text-stone-300 uppercase tracking-[0.5em] hover:text-charcoal-900 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default GuestResumeDialog;
