
import React, { useEffect } from 'react';
import { Icons } from '../components/Icons';
import { CosmoVocAvatar } from '../components/chat/CosmoVocAvatar';

interface SplashProps {
    onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(onFinish, 1500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#FDFCFB] relative overflow-hidden">
            {/* Custom Styles for Splash Animations */}
            <style>
                {`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.6; }
                }
                @keyframes text-reveal {
                    0% { opacity: 0; transform: translateY(20px); filter: blur(10px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes logo-in {
                    0% { opacity: 0; transform: scale(0.85); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes glow-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 0.5; }
                }
                .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
                .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
                .animate-text-reveal { animation: text-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .animate-logo-in { animation: logo-in 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-glow-pulse { animation: glow-pulse 5s ease-in-out infinite; }
                `}
            </style>

            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold-400/10 rounded-full blur-[100px] animate-glow-pulse pointer-events-none"></div>

            {/* Floating Planets & Elements */}

            {/* Top-Left: Small Planet */}
            <div className="absolute top-16 left-12 opacity-40 animate-float-slow">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="12" fill="#D4AF37" fillOpacity="0.2" />
                    <circle cx="20" cy="20" r="11.5" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
            </div>

            {/* Top-Right: Crescent Moon */}
            <div className="absolute top-24 right-10 opacity-30 animate-float-medium" style={{ animationDelay: '1s' }}>
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                    <path d="M35 15C35 26.0457 26.0457 35 15 35C13.606 35 12.2541 34.8576 10.9546 34.5884C14.7709 38.5606 20.1009 41 26 41C37.0457 41 46 32.0457 46 21C46 13.626 42.0016 7.18561 36.0355 3.65476C35.3615 7.19934 35 10.8582 35 15Z" fill="#C5A059" />
                </svg>
            </div>

            {/* Bottom-Left: Saturn Ring */}
            <div className="absolute bottom-32 left-8 opacity-40 animate-float-medium">
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                    <ellipse cx="40" cy="30" rx="35" ry="10" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6" />
                    <circle cx="40" cy="30" r="12" fill="#F2F0EB" stroke="#D4AF37" strokeWidth="0.5" />
                    <path d="M10 30C10 32.7614 23.4315 35 40 35C56.5685 35 70 32.7614 70 30" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="4 2" />
                </svg>
            </div>

            {/* Bottom-Right: Floating Dots/Planet */}
            <div className="absolute bottom-20 right-16 opacity-30 animate-float-slow" style={{ animationDelay: '2s' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <circle cx="15" cy="15" r="4" fill="#4F5D75" fillOpacity="0.4" />
                    <circle cx="15" cy="15" r="8" stroke="#4F5D75" strokeWidth="0.3" />
                </svg>
            </div>

            {/* Twinkling Stars / Sparkles */}
            <div className="absolute top-1/4 left-1/3 animate-twinkle" style={{ animationDelay: '0.5s' }}><Icons.Sparkles /></div>
            <div className="absolute bottom-1/4 right-1/4 animate-twinkle scale-75" style={{ animationDelay: '1.2s' }}><Icons.Sparkles /></div>
            <div className="absolute top-1/2 right-1/4 animate-twinkle scale-50" style={{ animationDelay: '2.5s' }}><Icons.Star /></div>
            <div className="absolute top-1/3 right-10 animate-twinkle scale-50" style={{ animationDelay: '0.8s' }}><Icons.Star /></div>

            {/* Faint Constellation Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 400 800">
                <path d="M50 100 L120 180 L80 250 L150 300" stroke="#2D2A26" strokeWidth="0.5" fill="none" />
                <path d="M300 600 L350 520 L280 480 L320 400" stroke="#2D2A26" strokeWidth="0.5" fill="none" />
                <path d="M100 700 L180 650 L140 580" stroke="#2D2A26" strokeWidth="0.5" fill="none" />
            </svg>

            {/* Main Logo & Text Content */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="animate-logo-in mb-8 shadow-2xl shadow-charcoal-900/20 rounded-full">
                        <CosmoVocAvatar isTyping={false} className="w-20 h-20" />
                    </div>

                <h1 className="text-4xl font-serif text-charcoal-900 tracking-tight animate-text-reveal opacity-0" style={{ animationDelay: '0.4s' }}>
                    CosmoVoc
                </h1>

                <div className="flex items-center gap-2 mt-4 animate-text-reveal opacity-0" style={{ animationDelay: '0.7s' }}>
                    <div className="h-[1px] w-8 bg-gold-400 opacity-40"></div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-gold-600 font-bold">Divine Wisdom</span>
                    <div className="h-[1px] w-8 bg-gold-400 opacity-40"></div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-12 animate-text-reveal opacity-0" style={{ animationDelay: '1.2s' }}>
                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-medium">Powered by Shatavo</p>
            </div>
        </div>
    );
};

export default Splash;
