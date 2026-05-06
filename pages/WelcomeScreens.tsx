import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, BirthChartAnalysis } from '../types';

import { Icons } from '../components/Icons';

interface WelcomeScreensProps {
  onComplete: () => void;
  profile: UserProfile;
  analysis: BirthChartAnalysis;
}

// --- Screen 1 Animations ---

const KundliDrawer: React.FC = () => (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <style>{`
            @keyframes drawLine { to { stroke-dashoffset: 0; } }
            @keyframes fadeInDot { to { opacity: 1; transform: scale(1); } }
            @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
            .path-anim { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawLine 2s ease-out forwards; }
            .delay-1 { animation-delay: 0.2s; } .delay-2 { animation-delay: 0.4s; }
            .delay-3 { animation-delay: 0.6s; } .delay-4 { animation-delay: 0.8s; }
            .dot-anim { opacity: 0; transform: scale(0); animation: fadeInDot 0.5s ease-out forwards; }
        `}</style>
        {/* Twinkling stars */}
        {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-20" 
                 style={{ 
                     top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, 
                     animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s` 
                 }} 
            />
        ))}
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400 overflow-visible drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" className="path-anim" />
            <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="1" className="path-anim delay-1" />
            <line x1="90" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="1" className="path-anim delay-1" />
            <line x1="50" y1="10" x2="90" y2="50" stroke="currentColor" strokeWidth="1" className="path-anim delay-2" />
            <line x1="90" y1="50" x2="50" y2="90" stroke="currentColor" strokeWidth="1" className="path-anim delay-2" />
            <line x1="50" y1="90" x2="10" y2="50" stroke="currentColor" strokeWidth="1" className="path-anim delay-3" />
            <line x1="10" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="1" className="path-anim delay-3" />
            
            {/* Dots */}
            <circle cx="50" cy="25" r="2" fill="currentColor" className="dot-anim" style={{ animationDelay: '1.2s' }} />
            <circle cx="25" cy="50" r="2" fill="currentColor" className="dot-anim" style={{ animationDelay: '1.4s' }} />
            <circle cx="50" cy="75" r="2" fill="currentColor" className="dot-anim" style={{ animationDelay: '1.6s' }} />
            <circle cx="75" cy="50" r="2" fill="currentColor" className="dot-anim" style={{ animationDelay: '1.8s' }} />
        </svg>
    </div>
);

const WheelDrawer: React.FC = () => (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <style>{`
            @keyframes drawWheel { to { stroke-dashoffset: 0; } }
            @keyframes scaleInPlanet { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
            .wheel-anim { stroke-dasharray: 300; stroke-dashoffset: 300; animation: drawWheel 2s ease-out forwards; }
            .wheel-inner { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawWheel 2s ease-out 0.5s forwards; }
            .planet-dot { opacity: 0; animation: scaleInPlanet 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        `}</style>
        {/* Twinkling stars */}
        {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-20" 
                 style={{ 
                     top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, 
                     animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s` 
                 }} 
            />
        ))}
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold-400 overflow-visible drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" className="wheel-anim" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="wheel-inner" />
            {/* Spokan lines */}
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" className="wheel-anim" style={{ animationDelay: '0.2s' }} />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" className="wheel-anim" style={{ animationDelay: '0.4s' }} />
            <line x1="18.1" y1="18.1" x2="81.9" y2="81.9" stroke="currentColor" strokeWidth="0.5" className="wheel-anim" style={{ animationDelay: '0.6s' }} />
            <line x1="18.1" y1="81.9" x2="81.9" y2="18.1" stroke="currentColor" strokeWidth="0.5" className="wheel-anim" style={{ animationDelay: '0.8s' }} />
            
            {/* Planets */}
            <circle cx="25" cy="35" r="3" fill="currentColor" className="planet-dot" style={{ animationDelay: '1.2s' }} />
            <circle cx="65" cy="20" r="2.5" fill="currentColor" className="planet-dot" style={{ animationDelay: '1.35s' }} />
            <circle cx="80" cy="60" r="3.5" fill="currentColor" className="planet-dot" style={{ animationDelay: '1.5s' }} />
            <circle cx="45" cy="80" r="2" fill="currentColor" className="planet-dot" style={{ animationDelay: '1.65s' }} />
            <circle cx="35" cy="65" r="3" fill="currentColor" className="planet-dot" style={{ animationDelay: '1.80s' }} />
        </svg>
    </div>
);

// --- Screen 2 Animation ---

const OrbitingPlanets: React.FC = () => (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
        <style>{`
            @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes driftUp { from { transform: translateY(100px); opacity: 0; } 50% { opacity: 0.6; } to { transform: translateY(-100px); opacity: 0; } }
        `}</style>
        {/* Central Sun/Point */}
        <div className="absolute w-4 h-4 bg-gold-400 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10"></div>
        
        {/* Orbital rings and planets */}
        {[
            { r: 40, s: 12, size: 2 },
            { r: 60, s: 18, size: 3 },
            { r: 80, s: 24, size: 2.5 },
            { r: 100, s: 30, size: 4 },
            { r: 120, s: 40, size: 5 },
            { r: 150, s: 50, size: 3 },
            { r: 180, s: 65, size: 2.5 },
            { r: 210, s: 80, size: 2 },
            { r: 240, s: 95, size: 2 }
        ].map((orbit, i) => (
            <div key={i} className="absolute rounded-full border border-gold-400/10 flex items-center justify-center" 
                 style={{ width: `${orbit.r * 2}px`, height: `${orbit.r * 2}px`, animation: `orbit ${orbit.s}s linear infinite` }}>
                 <div className="absolute bg-gold-300 rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]" 
                      style={{ top: `-1px`, left: '50%', transform: 'translateX(-50%)', width: `${orbit.size * 2}px`, height: `${orbit.size * 2}px` }} />
            </div>
        ))}
        
        {/* Drifting particles */}
        {Array.from({ length: 20 }).map((_, i) => (
            <div key={`p-${i}`} className="absolute w-1 h-1 bg-white rounded-full opacity-0"
                 style={{ 
                     left: `${Math.random() * 100}%`,
                     animation: `driftUp ${5 + Math.random() * 5}s linear infinite ${Math.random() * 5}s`
                 }}
            />
        ))}
    </div>
);

// --- Screen 3 Animation ---

const NightSkyScene: React.FC = () => (
    <div className="relative w-full h-64 mx-auto overflow-hidden rounded-[32px] bg-charcoal-900 shadow-inner">
        <style>{`
            @keyframes pulseMoon { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 40px rgba(255,255,255,0.4); } }
            @keyframes shootStar { 0% { transform: translate(200px, -50px) rotate(-45deg); opacity: 0; } 10% { opacity: 1; } 20% { transform: translate(-100px, 250px) rotate(-45deg); opacity: 0; } 100% { opacity: 0; } }
            @keyframes starAppear { from { opacity: 0; } to { opacity: 0.6; } }
            @keyframes auroraShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        `}</style>
        
        {/* Aurora Horizon */}
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-30" 
             style={{ 
                 background: 'linear-gradient(to top, rgba(212,175,55,0.4), rgba(100,150,200,0.1), transparent)',
                 backgroundSize: '200% 200%',
                 animation: 'auroraShift 15s ease infinite'
             }}>
        </div>

        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-0" 
                 style={{ 
                     top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%`, 
                     animation: `starAppear 1s ease-out forwards ${0.5 + Math.random() * 2}s` 
                 }} 
            />
        ))}

        {/* Floating Moon */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-white to-stone-200 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
             style={{ animation: 'pulseMoon 4s ease-in-out infinite' }}>
            <div className="absolute top-4 left-4 w-6 h-6 bg-stone-300 rounded-full opacity-30 blur-[2px]"></div>
            <div className="absolute bottom-6 right-8 w-8 h-8 bg-stone-300 rounded-full opacity-20 blur-[3px]"></div>
        </div>

        {/* Shooting Star */}
        <div className="absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
             style={{ animation: 'shootStar 4s linear infinite 2s' }}>
             <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>
        </div>

        {/* Landscape Silhouette */}
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-16 text-charcoal-950">
            <path d="M0 20 V10 Q10 5 20 12 T40 8 T60 15 T80 5 T100 12 V20 Z" fill="currentColor" />
        </svg>
    </div>
);


const WelcomeScreens: React.FC<WelcomeScreensProps> = ({ onComplete, profile, analysis }) => {
    const [currentScreen, setCurrentScreen] = useState(0);

    const firstName = profile?.name ? profile.name.split(' ')[0] : 'Explorer';
    const ascendant = analysis?.ascendant || 'Unknown';
    const moonSign = analysis?.moonSign || 'Unknown';
    const sunSign = analysis?.planetaryDetails?.find(p => p.name === 'Sun')?.rashi || 'Unknown';
    const nakshatra = analysis?.nakshatra || 'Unknown';

    if (!profile || !analysis) {
        return (
            <div className="flex flex-col h-full bg-[#fdfcfb] px-6 py-10 items-center justify-center font-sans">
                <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest animate-pulse">Consulting the Stars...</p>
            </div>
        );
    }

    const nextScreen = () => {
        if (currentScreen < 2) setCurrentScreen(s => s + 1);
        else onComplete();
    };

    const prevScreen = () => {
        if (currentScreen > 0) setCurrentScreen(s => s - 1);
    };

    // Touch swipe support
    const touchStartX = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextScreen();   // swipe left → next
            else prevScreen();            // swipe right → previous
        }
        touchStartX.current = null;
    };

    const screens = [
        // SCREEN 1
        {
            illustration: () => (
                <div className="w-full flex justify-center py-6">
                    <KundliDrawer />
                </div>
            ),
            title: "Your Cosmic Blueprint is Ready",
            subtitle: `Personalized for ${firstName} — ${ascendant} Lagna, ${moonSign} Moon`,
            body: "Your Kundli has been calculated with precision using your exact birth details. Every insight in this app is unique to you and no one else in the world has the same cosmic blueprint."
        },
        // SCREEN 2
        {
            illustration: () => <div className="py-6"><OrbitingPlanets /></div>,
            title: "The Planets Speak Your Language",
            subtitle: "9 Grahas, infinite wisdom",
            body: "From your rising sign down to the precise degrees of your planetary placements, the ancient wisdom tells the story of your life purpose."
        },
        // SCREEN 3
        {
            illustration: () => <div className="py-6 w-full max-w-sm mx-auto"><NightSkyScene /></div>,
            title: "Your Journey Begins Now",
            subtitle: "Everything is prepared.",
            body: "The stars have aligned. Your personalized dashboard is ready to reveal your daily insights, compatibility, and core powers."
        }
    ];

    const current = screens[currentScreen];

    return (
        <div className="flex flex-col min-h-full bg-[#fdfcfb] overflow-hidden relative w-full font-sans">
            {/* Header / Skip */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <div className="w-10"></div>
                <button onClick={onComplete} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    Skip
                </button>
            </div>

            {/* Slider Content */}
            <div 
                className="flex-1 flex flex-col justify-center items-center px-8 relative pt-12 pb-24"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {screens.map((screen, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 px-8 flex flex-col items-center justify-center transition-all duration-700 ease-in-out pb-16
                            ${currentScreen === idx ? 'opacity-100 translate-x-0 pointer-events-auto' : 
                              currentScreen > idx ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-0 translate-x-full pointer-events-none'}
                        `}
                    >
                        <div className="w-full mb-8">
                            {screen.illustration()}
                        </div>
                        
                        <div className="text-center max-w-md w-full">
                            <h2 className="text-3xl font-serif text-charcoal-900 tracking-tight mb-3 drop-shadow-sm leading-tight">
                                {screen.title}
                            </h2>
                            <p className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.2em] mb-4">
                                {screen.subtitle}
                            </p>
                            <p className="text-sm text-stone-500 leading-relaxed font-medium">
                                {screen.body}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Navigation */}
            <div className="absolute bottom-0 w-full p-8 flex justify-between items-center z-50">
                {/* Dots */}
                <div className="flex gap-2">
                    {screens.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${currentScreen === idx ? 'w-6 bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'w-1.5 bg-stone-200'}`} />
                    ))}
                </div>

                {/* Main Button */}
                <button onClick={nextScreen} className="relative group overflow-hidden bg-charcoal-900 text-gold-400 px-8 py-3.5 rounded-[20px] font-bold tracking-[0.15em] uppercase text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {currentScreen === 2 && (
                         <style>{`
                             @keyframes pulseBtn { 0%, 100% { box-shadow: 0 0 0 0 rgba(38,38,38,0); } 50% { box-shadow: 0 0 20px 0 rgba(38,38,38,0.3); } }
                         `}</style>
                    )}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:duration-1000 group-hover:translate-x-full ease-out transition-transform"></div>
                    <span className="relative z-10 flex items-center gap-2" style={currentScreen === 2 ? { animation: 'pulseBtn 2s infinite' } : {}}>
                        {currentScreen === 2 ? "Let's Begin" : "Next"}
                        {currentScreen < 2 && <Icons.ChevronRight className="w-4 h-4" />}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreens;
