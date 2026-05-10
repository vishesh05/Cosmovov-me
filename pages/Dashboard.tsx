
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { InfoRow } from '../components/UI';
import { getGeoLocation } from '../services/geminiService';
import { calculateCurrentPlanets, ZODIAC_SIGNS } from '../services/astrologyEngine';
import { calculatePanchang, PanchangDetailed } from '../services/panchangSystem';
import { calculateLucky, LuckyResult } from '../services/luckyEngine';
import { UserProfile, BirthChartAnalysis } from '../types';
import { ProfileIconButton } from '../components/UserDashboardComponents';
import { AuthState } from '../services/authManager';
import HomeInsights from '../components/HomeInsights';
import StrengthOverview from '../components/StrengthOverview';

import { getTerm } from '../services/astrologyTerminology';

interface DashboardProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onOpenDashboard: () => void;
    authState: AuthState;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, profile, onOpenDashboard, authState }) => {
    const [activeTab, setActiveTab] = useState('Transit');
    const [panchang, setPanchang] = useState<PanchangDetailed | null>(null);
    const [transitPlanets, setTransitPlanets] = useState<any[]>([]);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [luckyData, setLuckyData] = useState<LuckyResult | null>(null); // kept for type compatibility



    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCurrentLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                async () => {
                    try {
                        const coords = await getGeoLocation(profile.location, new Date().toISOString().split('T')[0]);
                        setCurrentLocation({ lat: coords.lat, lon: coords.lon });
                    } catch (e) { console.error("Loc fallback failed", e); }
                }
            );
        } else {
            getGeoLocation(profile.location, new Date().toISOString().split('T')[0])
                .then(coords => setCurrentLocation({ lat: coords.lat, lon: coords.lon }))
                .catch(e => console.error("Loc fallback failed", e));
        }
    }, [profile.location]);

    useEffect(() => {
        if (currentLocation) {
            const now = new Date();
            const pInfo = calculatePanchang(now, currentLocation.lat, currentLocation.lon);
            const cPlanets = calculateCurrentPlanets(now);
            setPanchang(pInfo);
            setTransitPlanets(cPlanets);
        }
    }, [currentLocation]);

    // Calculate Lucky data when panchang is ready
    useEffect(() => {
        if (panchang && analysis) {
            try {
                // Parse approximate sunrise hour from panchang sunrise string
                let sunriseHour = 6; // default fallback
                const sunriseMatch = panchang.sunrise.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (sunriseMatch) {
                    let h = parseInt(sunriseMatch[1]);
                    const ampm = sunriseMatch[3].toUpperCase();
                    if (ampm === 'PM' && h !== 12) h += 12;
                    if (ampm === 'AM' && h === 12) h = 0;
                    sunriseHour = h;
                }

                const result = calculateLucky(
                    analysis,
                    panchang.tithi,
                    panchang.nakshatra,
                    panchang.vaar,
                    sunriseHour
                );
                setLuckyData(result);
            } catch (e) {
                console.error('Lucky calculation error:', e);
            }
        }
    }, [panchang, analysis]);

    const getHouseFromLagna = (planetRashi: string) => {
        if (!analysis.ascendant) return 1;
        const lagnaIdx = ZODIAC_SIGNS.indexOf(analysis.ascendant);
        const planetIdx = ZODIAC_SIGNS.indexOf(planetRashi);
        return ((planetIdx - lagnaIdx + 12) % 12) + 1;
    };

    const renderTabContent = () => {
        if (!panchang || !transitPlanets.length) return <div className="p-4 text-center text-xs text-stone-400">Loading Daily Insights...</div>;

        switch (activeTab) {
            case 'Transit':
                const tMoon = transitPlanets.find(p => p.name === 'Moon');
                const tSaturn = transitPlanets.find(p => p.name === 'Saturn');
                const tJupiter = transitPlanets.find(p => p.name === 'Jupiter');

                return (
                    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[10px] text-charcoal-400 uppercase tracking-widest mb-1">Transit Moon</div>
                                <div className="text-lg font-serif text-charcoal-900">{tMoon?.rashi}</div>
                                <div className="text-xs text-gold-600 font-medium">{getHouseFromLagna(tMoon?.rashi)}th House</div>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[10px] text-charcoal-400 uppercase tracking-widest mb-1">Saturn Transit</div>
                                <div className="text-lg font-serif text-charcoal-900">{tSaturn?.rashi}</div>
                                <div className="text-xs text-gold-600 font-medium">{getHouseFromLagna(tSaturn?.rashi)}th House</div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div className="text-xs text-charcoal-600"><span className="font-bold">Jupiter</span> in {tJupiter?.rashi}</div>
                            {transitPlanets.some(p => p.isRetro && p.name !== 'Rahu' && p.name !== 'Ketu') && (
                                <div className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Retrograde Active</div>
                            )}
                        </div>
                    </div>
                );
            case 'Panchang':
                return (
                    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm animate-fade-in">
                        <div className="text-center mb-5 pb-3 border-b border-stone-50">
                            <span className="text-[10px] text-gold-600 font-bold uppercase tracking-widest">Panchang for</span>
                            <h3 className="font-serif text-charcoal-900 text-lg">{panchang.panchangDate}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-stone-50">
                            <div className="text-center">
                                <div className="text-[10px] text-gold-600 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Icons.Sun className="w-3 h-3" /> Sunrise</div>
                                <div className="text-charcoal-900 font-serif text-sm">{panchang.sunrise}</div>
                            </div>
                            <div className="text-center border-l border-stone-50">
                                <div className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Icons.Moon className="w-3 h-3" /> Sunset</div>
                                <div className="text-charcoal-900 font-serif text-sm">{panchang.sunset}</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <InfoRow label="Tithi" value={panchang.tithi} subValue={panchang.tithiUpto} />
                            <InfoRow label={getTerm('nakshatra', 'vedic')} value={panchang.nakshatra} subValue={panchang.nakshatraUpto} />
                            <InfoRow label="Yoga" value={panchang.yoga} subValue={panchang.yogaUpto} />
                            <InfoRow label="Karana" value={panchang.karana} subValue={panchang.karanaUpto} />
                            <div className="flex justify-between items-start py-2.5 border-b border-stone-50">
                                <span className="text-xs text-charcoal-400 font-medium mt-0.5">Next Karana</span>
                                <div className="text-right max-w-[65%]">
                                    <div className="text-sm text-charcoal-600 font-medium">{panchang.nextKarana}</div>
                                    <div className="text-[10px] text-charcoal-400 font-medium tracking-wide">upto {panchang.nextKaranaUpto}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Birth Details':
                return (
                    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm animate-fade-in">
                        <InfoRow label="Date" value={profile.date} />
                        <InfoRow label="Time" value={profile.time} />
                        <InfoRow label="Place" value={profile.location} />
                        <InfoRow label={getTerm('lagna', 'vedic')} value={analysis.ascendant} />
                        <InfoRow label="Moon Sign" value={analysis.moonSign} />
                        <InfoRow label={getTerm('nakshatra', 'vedic')} value={analysis.nakshatra} />
                    </div>
                );
            default: return null;
        }
    };

    const tabs = ['Transit', 'Panchang', 'Birth Details'];

    const isViewingOther = authState.isLoggedIn && authState.user && authState.user.name !== profile.name;

    return (
        <div className="p-6 pb-32 fade-enter-active">
            {authState.isLoggedIn && authState.user && (
                <div className="bg-gradient-to-r from-charcoal-900 to-charcoal-800 text-ivory-50 px-4 py-3 rounded-2xl shadow-lg mb-6 flex items-center justify-between border border-white/5 animate-fade-in">
                    <div>
                        <p className="text-[9px] uppercase tracking-widest text-gold-400 font-bold mb-0.5">
                            Hi, {authState.user.name}
                        </p>
                        <p className="text-xs font-medium">
                            {isViewingOther ? (
                                <>Viewing saved chart: <span className="font-bold text-white underline decoration-gold-500">{profile.name}</span></>
                            ) : (
                                <span className="opacity-80">Viewing your personal chart</span>
                            )}
                        </p>
                    </div>
                    {isViewingOther && (
                        <div className="bg-white/10 p-1.5 rounded-full">
                            <Icons.Users className="w-4 h-4 text-gold-400" />
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mb-8 mt-2">
                <div>
                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.2em]">{getTerm('ascendant', 'vedic')}</span>
                    <h2 className="text-3xl font-serif text-charcoal-900">{analysis.ascendant}</h2>
                </div>
                <ProfileIconButton
                    isLoggedIn={authState.isLoggedIn}
                    onClick={onOpenDashboard}
                />
            </div>

            {/* 
           NEW: CHART STRENGTH VISUALS
        */}
            <StrengthOverview analysis={analysis} />

            {/* 
           MODULAR LOCAL INSIGHTS COMPONENT
        */}
            <HomeInsights analysis={analysis} profile={profile} />

            <div className="mb-8">
                <div className="w-full overflow-x-auto no-scrollbar mb-4">
                    <div className="flex gap-2 w-max px-1">
                        {tabs.map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === t ? 'bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-lg shadow-charcoal-900/10' : 'bg-white text-charcoal-400 border-stone-200 hover:border-gold-300 hover:text-charcoal-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Dashboard;
