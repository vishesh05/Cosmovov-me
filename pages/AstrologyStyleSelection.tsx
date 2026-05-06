import React, { useState, useEffect } from 'react';
import { useAstrologyStyle } from '../contexts/AstrologyStyleContext';
import { AstrologyStyle } from '../services/astrologyTerminology';
import { Icons } from '../components/Icons';

interface AstrologyStyleSelectionProps {
  onComplete: () => void;
}

const detectRegionStyle = (): AstrologyStyle | null => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!tz) return null;
        
        // Typical Asian / Indian zones
        if (
            tz.includes('Asia/Calcutta') || 
            tz.includes('Asia/Kolkata') || 
            tz.includes('Asia/Colombo') || 
            tz.includes('Asia/Dhaka') || 
            tz.includes('Asia/Kathmandu') || 
            tz.includes('Asia/Karachi') || 
            tz.includes('Indian/Mauritius')
        ) {
            return 'vedic';
        }
        
        // Typical Western zones
        if (
            tz.includes('America/') || 
            tz.includes('Europe/') || 
            tz.includes('Australia/') || 
            tz.includes('Pacific/Auckland')
        ) {
            return 'western';
        }
    } catch {
        return null;
    }
    return null;
};

// --- Illustrations ---

const CosmicHeader: React.FC = () => (
    <div className="relative w-full h-32 overflow-hidden flex items-center justify-center mb-6">
        <style>{`
            @keyframes spin-slow { 100% { transform: rotate(360deg); } }
            @keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; transform: scale(1.05); } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold-50 to-transparent opacity-50 z-0"></div>
        <div className="absolute w-40 h-40 bg-gold-400 rounded-full blur-[60px] opacity-20 animate-[pulse-glow_4s_ease-in-out_infinite] z-0"></div>

        {/* Outer Orbit */}
        <div className="absolute w-80 h-80 rounded-full border border-gold-200/40 opacity-50 animate-[spin-slow_60s_linear_infinite] z-0 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-gold-400 rounded-full absolute top-[10%] left-[10%] shadow-[0_0_8px_rgba(212,175,55,1)]"></div>
             <div className="w-1 h-1 bg-charcoal-400 rounded-full absolute bottom-[10%] right-[10%] opacity-50"></div>
        </div>

        {/* Inner Orbit */}
        <div className="absolute w-48 h-48 rounded-full border border-gold-300/30 animate-[spin-slow_40s_linear_infinite_reverse] z-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-charcoal-900 rounded-full absolute top-0 shadow-[0_0_10px_rgba(38,38,38,0.3)]"></div>
        </div>

        {/* Central Star */}
        <div className="relative z-10 w-12 h-12 flex items-center justify-center animate-[float_4s_ease-in-out_infinite]">
            <Icons.Sparkles className="w-8 h-8 text-gold-500 drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
        </div>
    </div>
);

const KundliIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="3" />
        <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="2" />
        <line x1="90" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="10" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
        <line x1="90" y1="50" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="90" x2="10" y2="50" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const WheelIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1.5" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1.5" />
        <line x1="21.7" y1="21.7" x2="78.3" y2="78.3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="21.7" y1="78.3" x2="78.3" y2="21.7" stroke="currentColor" strokeWidth="1.5" />
        {/* Tiny planet dots */}
        <circle cx="28" cy="40" r="2.5" fill="currentColor" />
        <circle cx="65" cy="22" r="3" fill="currentColor" />
        <circle cx="75" cy="65" r="2" fill="currentColor" />
    </svg>
);


const AstrologyStyleSelection: React.FC<AstrologyStyleSelectionProps> = ({ onComplete }) => {
    const { setAstrologyStyle } = useAstrologyStyle();
    const [selected, setSelected] = useState<AstrologyStyle | null>(null);
    const [autoSelected, setAutoSelected] = useState<boolean>(false);

    useEffect(() => {
        const detected = detectRegionStyle();
        if (detected) {
            setSelected(detected);
            setAutoSelected(true);
        }
    }, []);

    const handleSelect = (style: AstrologyStyle) => {
        setSelected(style);
        setAutoSelected(false);
    };

    const handleContinue = () => {
        if (!selected) return;
        setAstrologyStyle(selected);
        onComplete();
    };

    const isCardSelected = (style: AstrologyStyle) => selected === style || (selected === 'both' && style === 'both');
    const hasSelection = selected !== null;

    const baseCardClass = "relative w-full text-left bg-white rounded-[24px] p-5 shadow-sm border transition-all duration-300 ease-out cursor-pointer group";
    const selectedClass = "border-gold-400 bg-gold-50/20 shadow-[0_8px_30px_-12px_rgba(212,175,55,0.4)] scale-[1.02] ring-1 ring-gold-400";
    const unselectedClass = hasSelection ? "border-stone-100 opacity-60 hover:opacity-100 hover:border-stone-300" : "border-stone-200 hover:border-stone-300 hover:shadow-md hover:-translate-y-1";

    const getCardClass = (style: AstrologyStyle) => `${baseCardClass} ${(selected === style || selected === 'both') ? selectedClass : unselectedClass}`;

    return (
        <div className="flex flex-col min-h-full bg-[#fdfcfb] px-6 py-10 overflow-x-hidden relative w-full font-sans pb-24">
            <style>{`
                @keyframes elastic-scale {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .check-animate {
                    animation: elastic-scale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
            
            <CosmicHeader />

            <div className="text-center mb-8 px-2 z-10 relative">
                <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight mb-2 drop-shadow-sm">
                    How do you experience the cosmos?
                </h1>
                <p className="text-[13px] font-medium text-stone-500 leading-relaxed max-w-xs mx-auto">
                    Choose your astrology style.<br/>We will personalize everything for you.
                </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto w-full z-10 relative flex-1">
                {/* VEDIC CARD */}
                <button onClick={() => handleSelect('vedic')} className={getCardClass('vedic')}>
                    {(selected === 'vedic' || selected === 'both') && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gold-400 rounded-full flex items-center justify-center check-animate shadow-md">
                            <Icons.Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                    )}
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-[16px] transition-colors duration-300 ${(selected === 'vedic' || selected === 'both') ? 'bg-gold-50 text-gold-600' : 'bg-stone-50 text-stone-400'}`}>
                            <KundliIcon />
                        </div>
                        <div className="flex-1 pr-6">
                            <h3 className="text-lg font-bold text-charcoal-900 tracking-wide mb-0.5">Vedic Astrology</h3>
                            <p className="text-[11px] font-serif italic text-gold-600 mb-2">Ancient Indian wisdom</p>
                            <p className="text-xs text-stone-500 leading-relaxed mb-3">
                                Kundli, Nakshatra, Dasha periods, Lagna, and the complete Jaimini and Parashari systems.
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {['Birth Chart', 'Dasha System', 'Nakshatra'].map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-stone-100 text-[9px] font-bold uppercase tracking-wider text-stone-500 rounded-md">{tag}</span>
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mt-2">
                                <Icons.Star className="w-3 h-3 text-gold-400" /> Trusted for 5000+ years
                            </p>
                            {autoSelected && selected === 'vedic' && (
                                <p className="text-[10px] font-semibold text-green-600 mt-2 bg-green-50 inline-block px-2 py-0.5 rounded-full">Auto-selected based on your region</p>
                            )}
                        </div>
                    </div>
                </button>

                {/* WESTERN CARD */}
                <button onClick={() => handleSelect('western')} className={getCardClass('western')}>
                    {(selected === 'western' || selected === 'both') && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gold-400 rounded-full flex items-center justify-center check-animate shadow-md">
                            <Icons.Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                    )}
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-[16px] transition-colors duration-300 ${(selected === 'western' || selected === 'both') ? 'bg-gold-50 text-gold-600' : 'bg-stone-50 text-stone-400'}`}>
                            <WheelIcon />
                        </div>
                        <div className="flex-1 pr-6">
                            <h3 className="text-lg font-bold text-charcoal-900 tracking-wide mb-0.5">Western Astrology</h3>
                            <p className="text-[11px] font-serif italic text-gold-600 mb-2">Modern cosmic guidance</p>
                            <p className="text-xs text-stone-500 leading-relaxed mb-3">
                                Sun signs, Rising sign, Moon sign, Aspects, Mercury Retrograde, and planetary transits.
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {['Big Three', 'Aspects', 'Retrograde Dates'].map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-stone-100 text-[9px] font-bold uppercase tracking-wider text-stone-500 rounded-md">{tag}</span>
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mt-2">
                                <Icons.Chart className="w-3 h-3 text-gold-400" /> Used by millions worldwide
                            </p>
                            {autoSelected && selected === 'western' && (
                                <p className="text-[10px] font-semibold text-green-600 mt-2 bg-green-50 inline-block px-2 py-0.5 rounded-full">Auto-selected based on your region</p>
                            )}
                        </div>
                    </div>
                </button>

                {/* BOTH BUTTON */}
                <div className="pt-2 text-center w-full">
                    <button 
                        onClick={() => handleSelect('both')}
                        className={`inline-flex items-center justify-center gap-2 group transition-all duration-300 ${selected === 'both' ? 'text-gold-500 font-bold scale-105' : 'text-stone-400 hover:text-charcoal-700'}`}
                    >
                        <Icons.Sparkles className={`w-4 h-4 transition-colors ${selected === 'both' ? 'text-gold-500' : 'text-stone-300 group-hover:text-gold-400'}`} />
                        <span className="text-[11px] uppercase tracking-[0.15em] border-b border-dashed border-transparent hover:border-charcoal-900">
                            I want both — Show me everything
                        </span>
                    </button>
                    {autoSelected && selected === 'both' && (
                         <p className="text-[10px] font-semibold text-green-600 mt-2 bg-green-50 inline-block px-2 py-0.5 rounded-full">Auto-selected based on your region</p>
                    )}
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#fdfcfb] via-[#fdfcfb] to-transparent z-20 flex flex-col items-center pb-8 border-t border-stone-100/50">
                <button 
                    onClick={handleContinue}
                    disabled={!selected}
                    className={`w-full max-w-sm relative overflow-hidden bg-charcoal-900 text-gold-400 py-4 rounded-[20px] font-bold tracking-[0.15em] uppercase text-[11px] shadow-2xl transition-all duration-300 flex justify-center items-center group
                        ${selected ? 'opacity-100 hover:scale-[1.02] hover:shadow-charcoal-900/25 active:scale-[0.98]' : 'opacity-40 pointer-events-none'}
                    `}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span>Continue</span>
                </button>
                <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mt-4">
                    You can always change this in Settings
                </p>
            </div>

        </div>
    );
};

export default AstrologyStyleSelection;
