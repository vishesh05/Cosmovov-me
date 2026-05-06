import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { BirthChartAnalysis, UserProfile, TodayData } from '../types';
import { ProfileIconButton } from '../components/UserDashboardComponents';
import { AuthState } from '../services/auth';
import { calculateTodayData } from '../services/todayEngine';
import BigThreeBanner from '../components/BigThreeBanner';


interface TodayProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onOpenDashboard: () => void;
    authState: AuthState;
}

// Helper to get a unique cache key per profile per day
function getTodayCacheKey(profile: UserProfile): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return `astroveda_today_${profile.name}_${profile.date}_${dateStr}`;
}

// Helper to get a time-based greeting message
function getTimeGreeting(firstName: string): string {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return `Good morning ${firstName}, here is what the stars have for you today.`;
    if (hour >= 12 && hour < 17) return `Good afternoon ${firstName}, your power hour is coming up.`;
    if (hour >= 17 && hour < 19) return `Good evening ${firstName}, the stars are shifting in your favour.`;
    return `Evening ${firstName}, how did your cosmic day go?`;
}

const Today: React.FC<TodayProps> = ({ analysis, profile, onOpenDashboard, authState }) => {


    // Dynamic greeting that updates across time boundaries
    const parsedName = (profile.name || '').split('@')[0].split(' ')[0];
    const firstName = parsedName ? parsedName.charAt(0).toUpperCase() + parsedName.slice(1).toLowerCase() : 'Friend';
    const [greeting, setGreeting] = useState(() => getTimeGreeting(firstName));

    useEffect(() => {
        setGreeting(getTimeGreeting(firstName));
        const interval = setInterval(() => {
            setGreeting(getTimeGreeting(firstName));
        }, 60_000); // Re-check every minute
        return () => clearInterval(interval);
    }, [firstName]);

    // ── Compute or load cached TodayData ──
    const todayData: TodayData = useMemo(() => {
        const cacheKey = getTodayCacheKey(profile);
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached) as TodayData;
                // Validate it's today's data
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                if (parsed.computedDate === todayStr && parsed.fullLuckyData && parsed.fullPowerHourData) {
                    console.log('Today Engine: Loaded from cache');
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Today Engine: Cache read error', e);
        }

        // Compute fresh
        console.log('Today Engine: Computing fresh data...');
        const result = calculateTodayData(analysis, profile);

        // Cache the result
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); }
        catch (e) { console.error('Today Engine: Cache write error', e); }

        return result;
    }, [analysis, profile]);


    const lifeAreas = [
        { name: 'Love', icon: <Icons.Heart className="w-3 h-3" />, score: todayData.energyLevels.love.score, reason: todayData.energyLevels.love.description },
        { name: 'Career', icon: <Icons.Briefcase className="w-3 h-3" />, score: todayData.energyLevels.career.score, reason: todayData.energyLevels.career.description },
        { name: 'Energy', icon: <Icons.Sun className="w-3 h-3" />, score: todayData.energyLevels.energy.score, reason: todayData.energyLevels.energy.description },
        { name: 'Mindset', icon: <Icons.Sparkles className="w-3 h-3" />, score: todayData.energyLevels.mindset.score, reason: todayData.energyLevels.mindset.description },
    ];

    const isViewingOther = authState.isLoggedIn && authState.user && authState.user.name !== profile.name;

    return (
        <div className="w-full relative px-6 pt-10 pb-32 text-charcoal-900 overflow-x-hidden">            {/* Header Mirroring Dashboard - MOVED TO TOP */}
            <div className="flex items-center justify-between mb-8 mt-2">
                <div>
                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.2em]">Ascendant</span>
                    <h2 className="text-3xl font-serif text-charcoal-900">{analysis.ascendant}</h2>
                </div>
                <ProfileIconButton
                    isLoggedIn={authState.isLoggedIn}
                    onClick={onOpenDashboard}
                />
            </div>

            {/* Dynamic Time-Based Greeting */}
            <div className="relative mb-8 group animate-fade-in">
                <div className="absolute inset-0 bg-gold-400/5 rounded-[24px] blur-xl transition-all duration-500 group-hover:bg-gold-400/10"></div>
                <div className="relative bg-gradient-to-br from-[#1a1918] to-[#2a2826] text-ivory-50 p-6 rounded-[24px] shadow-xl border border-[#33312e] overflow-hidden">
                    
                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gold-400">
                                {new Date().getHours() < 12 ? <Icons.Sun className="w-[14px] h-[14px]" /> : 
                                 new Date().getHours() < 17 ? <Icons.Sun className="w-[14px] h-[14px]" /> : 
                                 new Date().getHours() < 19 ? <Icons.Sun className="w-[14px] h-[14px]" /> : 
                                 <Icons.MoonStar className="w-[14px] h-[14px]" />}
                            </span>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-gold-400/90 font-bold">
                                Divine Guidance
                            </p>
                        </div>
                        <h3 className="text-2xl font-serif text-ivory-50 leading-tight">
                            {greeting.split(',')[0]},
                        </h3>
                        <p className="text-xs font-light text-stone-300 leading-relaxed font-sans max-w-[85%]">
                            {greeting.split(',').slice(1).join(',').trim()}
                        </p>
                        {isViewingOther && (
                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-[#33312e]/50 rounded-full border border-gold-500/20 backdrop-blur-sm">
                                <p className="text-[9px] text-gold-400 uppercase tracking-widest font-bold">Viewing: {profile.name}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>



            {/* Daily Overview */}
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Icons.Sun className="w-5 h-5 text-gold-500" />
                    <h2 className="text-xl font-serif text-charcoal-900">Today's Flow</h2>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed font-medium">
                    {todayData.todaysFlow}
                </p>
            </div>

            {/* Life Areas Circular Rings */}
            <h3 className="text-[10px] font-bold text-gold-600 uppercase tracking-widest mb-3 ml-2">Energy Levels & Alignment</h3>
            <div className="grid grid-cols-2 gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {lifeAreas.map((area, i) => {
                    const radius = 28;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (area.score / 100) * circumference;

                    return (
                        <div key={i} className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-3xl p-5 border border-white/5 shadow-lg flex flex-col items-center text-center">
                            <div className="relative mb-4 w-20 h-20 flex items-center justify-center">
                                {/* Background circle */}
                                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={radius}
                                        className="stroke-white/10 block"
                                        strokeWidth="6"
                                        fill="none"
                                    />
                                    {/* Foreground progress circle */}
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={radius}
                                        className="origin-center block transition-all duration-1000 ease-out fill-none stroke-gold-400"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                    />
                                </svg>
                                <div className="absolute z-10 text-gold-400">
                                    {area.icon}
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-1">{area.name}</span>
                            <span className="text-xl font-serif text-ivory-50 leading-none mb-2">{area.score}%</span>
                            <p className="text-[10px] text-stone-400 leading-relaxed font-medium line-clamp-3">{area.reason}</p>
                        </div>
                    );
                })}
            </div>

            {/* Auspicious Focus - Elegantly refined side-by-side cards */}
            <div className="flex items-center justify-between mb-4 ml-2 pr-4">
                <h3 className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Auspicious Focus</h3>
                <Icons.Sparkles className="w-3 h-3 text-gold-400 opacity-70" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in text-center" style={{ animationDelay: '0.3s' }}>
                {/* Power Hour - basic fallback still shown for compatibility */}
                <div className="col-span-2 hidden"></div>
            </div>

            {/* Auspicious Power Hour - Premium dark card matching Lucky Insight style */}
            {todayData.fullPowerHourData && (() => {
                const ph = todayData.fullPowerHourData!;
                const best = ph.bestHour;
                return (
                    <div className="mb-8 animate-fade-in space-y-3" style={{ animationDelay: '0.3s' }}>
                        {/* Main Power Hour Card */}
                        <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-3xl p-6 border border-white/5 shadow-lg">
                            <div className="flex items-center justify-between mb-5">
                                <div className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em]">Your Power Hour</div>
                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                    ph.confidence === 'high'   ? 'bg-emerald-500/20 text-emerald-400' :
                                    ph.confidence === 'medium' ? 'bg-gold-500/20 text-gold-400' :
                                    'bg-stone-500/20 text-stone-400'
                                }`}>{ph.confidence} confidence</div>
                            </div>

                            {/* Best Hour Display */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0">
                                    <Icons.Clock className="w-6 h-6 text-gold-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-serif text-ivory-50 font-bold leading-tight">{best.startTime}</div>
                                    <div className="text-xs text-stone-400 font-medium">to {best.endTime}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-gold-400 uppercase tracking-widest font-bold">{best.planet} Hora</span>
                                        <span className="text-[9px] text-stone-500">·</span>
                                        <span className="text-[9px] text-stone-400 uppercase tracking-widest">{best.choghadiya}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Why this hour */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                                <div className="text-[9px] text-stone-400 uppercase tracking-widest mb-2">Why This Hour</div>
                                <ul className="space-y-1">
                                    {best.reasons.slice(0, 3).map((r, i) => (
                                        <li key={i} className="text-[11px] text-stone-300 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-gold-400 mt-0.5 flex-shrink-0">›</span>{r}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Best Activity */}
                            <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                                <span className="text-[10px] text-stone-400 font-medium">Best For</span>
                                <span className="text-[10px] font-medium text-gold-400 text-right max-w-[60%]">{best.activity.split(',')[0]}</span>
                            </div>
                        </div>

                        {/* Top 3 Auspicious Windows */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm">
                            <div className="text-[10px] text-gold-600 font-bold uppercase tracking-[0.2em] mb-4">Top Auspicious Windows</div>
                            <div className="space-y-3">
                                {ph.top3Hours.map((slot, idx) => (
                                    <div key={slot.hourOfDay} className={`flex items-center gap-3 p-3 rounded-xl ${idx === 0 ? 'bg-gold-50 border border-gold-100' : 'bg-stone-50'}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 ${idx === 0 ? 'bg-gold-400 text-white' : 'bg-stone-200 text-charcoal-600'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-serif font-bold text-charcoal-900">{slot.startTime} – {slot.endTime}</div>
                                            <div className="text-[9px] text-stone-500">{slot.planet} Hora · {slot.choghadiya}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-charcoal-700">{slot.score}</div>
                                            <div className="text-[8px] text-stone-400 uppercase tracking-wide">score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Times to Avoid */}
                        {ph.avoidHours.length > 0 && (
                            <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm">
                                <div className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] mb-3">Times to Avoid</div>
                                <div className="space-y-2">
                                    {ph.avoidHours.map((slot) => (
                                        <div key={slot.hourOfDay} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                                            <div>
                                                <div className="text-xs font-serif font-bold text-charcoal-900">{slot.startTime} – {slot.endTime}</div>
                                                <div className="text-[9px] text-red-400 font-medium">{slot.isRahuKaal ? 'Rahu Kaal' : slot.isYamaganda ? 'Yamaganda' : 'Gulika Kaal'}</div>
                                            </div>
                                            <div className="text-[9px] text-red-400 font-bold uppercase tracking-wide">Avoid</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Today's Lucky Insight - Full premium card identical to Path page */}
            {todayData.fullLuckyData && (() => {
                const lucky = todayData.fullLuckyData!;
                const topScores = lucky.planetScores.slice(0, 4);
                const maxScore = topScores[0]?.score || 1;
                return (
                    <div className="mb-8 animate-fade-in space-y-3" style={{ animationDelay: '0.3s' }}>
                        {/* Main Lucky Card */}
                        <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-3xl p-6 border border-white/5 shadow-lg">
                            <div className="flex items-center justify-between mb-5">
                                <div className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em]">Today's Lucky Insight</div>
                                <div className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                    lucky.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                                    lucky.confidence === 'medium' ? 'bg-gold-500/20 text-gold-400' :
                                    'bg-stone-500/20 text-stone-400'
                                }`}>{lucky.confidence} confidence</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5">
                                {/* Color */}
                                <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                                    <div className="w-10 h-10 rounded-full mx-auto mb-3 border-2 border-white/20 shadow-lg" style={{ backgroundColor: lucky.luckyColorHex }}></div>
                                    <div className="text-[9px] text-stone-400 uppercase tracking-widest mb-1">Lucky Color</div>
                                    <div className="text-lg font-serif text-ivory-50 font-bold">{lucky.luckyColor}</div>
                                </div>
                                {/* Number */}
                                <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                                    <div className="w-10 h-10 rounded-full mx-auto mb-3 bg-gold-400/20 flex items-center justify-center">
                                        <span className="text-xl font-serif text-gold-400 font-bold">{lucky.luckyNumber}</span>
                                    </div>
                                    <div className="text-[9px] text-stone-400 uppercase tracking-widest mb-1">Lucky Number</div>
                                    <div className="text-lg font-serif text-ivory-50 font-bold">#{lucky.luckyNumber}</div>
                                </div>
                            </div>

                            {/* Ruling Planet */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center">
                                        <Icons.Star className="w-4 h-4 text-gold-400" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-stone-400 uppercase tracking-widest">Ruling Planet</div>
                                        <div className="text-sm font-serif text-ivory-50 font-bold">{lucky.rulingPlanet}</div>
                                    </div>
                                </div>
                                <p className="text-[11px] text-stone-400 leading-relaxed">{lucky.rulingPlanetReason}</p>
                            </div>

                            {/* Current Hora */}
                            <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                                <span className="text-[10px] text-stone-400 font-medium">Current Hora Lord</span>
                                <span className="text-sm font-serif text-gold-400 font-bold">{lucky.horaLord}</span>
                            </div>
                        </div>

                        {/* Planet Score Breakdown */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm">
                            <div className="text-[10px] text-gold-600 font-bold uppercase tracking-[0.2em] mb-4">Planet Influence Scores</div>
                            <div className="space-y-3">
                                {topScores.map((ps, idx) => (
                                    <div key={ps.planet} className="flex items-center gap-3">
                                        <div className="w-16 text-xs font-serif text-charcoal-900 font-bold">{ps.planet}</div>
                                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${idx === 0 ? 'bg-gradient-to-r from-gold-400 to-gold-600' : 'bg-stone-300'}`}
                                                style={{ width: `${(ps.score / maxScore) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-6 text-right text-xs font-bold text-charcoal-600">{ps.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alternate Insights */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm">
                            <div className="text-[10px] text-gold-600 font-bold uppercase tracking-[0.2em] mb-3">Alternate Insights</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-stone-50 rounded-xl p-3 text-center">
                                    <div className="text-[9px] text-charcoal-400 uppercase tracking-wider mb-1">Alt. Color</div>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: lucky.alternateColorHex }}></div>
                                        <span className="text-sm font-serif text-charcoal-900 font-bold">{lucky.alternateColor}</span>
                                    </div>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-3 text-center">
                                    <div className="text-[9px] text-charcoal-400 uppercase tracking-wider mb-1">Alt. Number</div>
                                    <div className="text-sm font-serif text-charcoal-900 font-bold">#{lucky.alternateNumber}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}



            {/* Daily Advice/Ritual */}
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-[10px] font-bold text-gold-600 uppercase tracking-widest mb-3">Daily Ritual</h3>
                <div>
                    <h4 className="font-serif text-charcoal-900 text-lg mb-1">{todayData.dailyRitual.title}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed font-medium">
                        {todayData.dailyRitual.description}
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Today;
