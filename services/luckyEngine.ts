/**
 * Lucky Engine — Vedic Astrology Lucky Color & Number Calculator
 * 
 * Implements a complete local backend for the Lucky tab using:
 * - User's birth chart (Lagna, Moon Sign, Dashas, D9)
 * - Today's Panchang (Tithi, Nakshatra, Vara, Hora)
 * 
 * Algorithm follows the 5-step Jyotish Shastra methodology:
 * 1. Identify Key Planets
 * 2. Score Each Planet by Weight
 * 3. Derive Lucky Color from Primary Planet
 * 4. Derive Lucky Number from Primary Planet
 * 5. Cross-validate with D9 (Navamsa) chart strength
 */

import { BirthChartAnalysis, DashaPeriod } from '../types';
import { RASHI_LORDS, ZODIAC_SIGNS } from './astrologyEngine';

// ─── Planet → Color Mapping (Classical Vedic) ───
const PLANET_COLORS: { [key: string]: { primary: string; alternate: string; hex: string; altHex: string } } = {
    Sun: { primary: 'Orange', alternate: 'Copper', hex: '#E8820C', altHex: '#B87333' },
    Moon: { primary: 'White', alternate: 'Silver', hex: '#F5F5F5', altHex: '#C0C0C0' },
    Mars: { primary: 'Red', alternate: 'Coral', hex: '#DC2626', altHex: '#FF6F61' },
    Mercury: { primary: 'Green', alternate: 'Emerald', hex: '#16A34A', altHex: '#50C878' },
    Jupiter: { primary: 'Yellow', alternate: 'Golden', hex: '#EAB308', altHex: '#DAA520' },
    Venus: { primary: 'Cream', alternate: 'Pink', hex: '#FFFDD0', altHex: '#F9A8D4' },
    Saturn: { primary: 'Dark Blue', alternate: 'Indigo', hex: '#1E3A5F', altHex: '#4B0082' },
    Rahu: { primary: 'Smoky Grey', alternate: 'Ultramarine', hex: '#708090', altHex: '#120A8F' },
    Ketu: { primary: 'Ash Grey', alternate: 'Brown', hex: '#B2BEB5', altHex: '#8B4513' },
};

// ─── Planet → Number Mapping (Classical Vedic Numerology) ───
const PLANET_NUMBERS: { [key: string]: number } = {
    Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5,
    Venus: 6, Ketu: 7, Saturn: 8, Mars: 9,
};

// ─── Weekday → Ruling Planet ───
const VARA_LORDS: { [key: string]: string } = {
    Sunday: 'Sun', Monday: 'Moon', Tuesday: 'Mars',
    Wednesday: 'Mercury', Thursday: 'Jupiter', Friday: 'Venus', Saturday: 'Saturn',
};

// ─── Tithi → Ruling Planet (Classical 15-cycle Mapping) ───
const TITHI_LORDS: { [key: number]: string } = {
    1: 'Sun', 2: 'Moon', 3: 'Mars', 4: 'Mercury', 5: 'Jupiter',
    6: 'Venus', 7: 'Saturn', 8: 'Rahu', 9: 'Sun', 10: 'Moon',
    11: 'Jupiter', 12: 'Venus', 13: 'Mars', 14: 'Saturn', 15: 'Moon',
    // Krishna Paksha repeats same pattern
    16: 'Sun', 17: 'Moon', 18: 'Mars', 19: 'Mercury', 20: 'Jupiter',
    21: 'Venus', 22: 'Saturn', 23: 'Rahu', 24: 'Sun', 25: 'Moon',
    26: 'Jupiter', 27: 'Venus', 28: 'Mars', 29: 'Saturn', 30: 'Moon',
};

// ─── Nakshatra → Lord (Vimshottari Cycle) ───
const NAKSHATRA_LORD_MAP: { [key: string]: string } = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
    'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu',
    'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Ashlesha': 'Mercury',
    'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
    'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury',
    'Mula': 'Ketu', 'Purva Ashadha': 'Venus', 'Uttara Ashadha': 'Sun',
    'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury',
};

// ─── Hora Sequence (from Sunrise, 1 hour each, repeating planetary days) ───
const HORA_SEQUENCE: { [key: string]: string[] } = {
    Sunday: ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'],
    Monday: ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'],
    Tuesday: ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'],
    Wednesday: ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'],
    Thursday: ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'],
    Friday: ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'],
    Saturday: ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
};

// ─── Interfaces ───

export interface LuckyResult {
    luckyColor: string;
    luckyColorHex: string;
    luckyNumber: number;
    rulingPlanet: string;
    rulingPlanetReason: string;
    confidence: 'high' | 'medium' | 'low';
    alternateColor: string;
    alternateColorHex: string;
    alternateNumber: number;
    alternatePlanet: string;
    planetScores: { planet: string; score: number; sources: string[] }[];
    horaLord: string;
    d9Validation: string;
}

// ─── Helper: Get Current Hora Lord ───
function getCurrentHoraLord(dayName: string, currentHour: number, sunriseHour: number): string {
    const hoursFromSunrise = Math.floor(((currentHour - sunriseHour) + 24) % 24);
    const horaSeq = HORA_SEQUENCE[dayName];
    if (!horaSeq) return 'Sun';
    return horaSeq[hoursFromSunrise % 24];
}

// ─── Helper: Find Active Dasha Lords ───
function findActiveDashaLords(dashas: DashaPeriod[], now: Date): { mahadasha: string; antardasha: string; pratyantardasha: string } {
    let mahadasha = '';
    let antardasha = '';
    let pratyantardasha = '';

    for (const md of dashas) {
        const mdStart = new Date(md.startDate);
        const mdEnd = new Date(md.endDate);
        if (now >= mdStart && now <= mdEnd) {
            mahadasha = md.planet;
            // Find Antardasha
            for (const ad of md.subPeriods || []) {
                const adStart = new Date(ad.startDate);
                const adEnd = new Date(ad.endDate);
                if (now >= adStart && now <= adEnd) {
                    antardasha = ad.planet;
                    // Find Pratyantardasha
                    for (const pd of ad.subPeriods || []) {
                        const pdStart = new Date(pd.startDate);
                        const pdEnd = new Date(pd.endDate);
                        if (now >= pdStart && now <= pdEnd) {
                            pratyantardasha = pd.planet;
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }

    return { mahadasha, antardasha, pratyantardasha };
}

// ─── Helper: Get Tithi Index from Panchang String ───
function getTithiIndex(tithiStr: string): number {
    const TITHI_NAMES = [
        'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashti',
        'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
        'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'
    ];
    const isKrishna = tithiStr.includes('Krishna');
    const baseName = tithiStr.replace(/\s*\(.*\)/, '').trim();
    let idx = TITHI_NAMES.indexOf(baseName);
    if (idx === -1) idx = 0;

    if (baseName === 'Purnima') return 15;
    if (baseName === 'Amavasya') return 30;

    return isKrishna ? idx + 16 : idx + 1;
}

// ─── Helper: Check D9 Strength ───
function checkD9Strength(analysis: BirthChartAnalysis, planet: string): { isStrong: boolean; reason: string } {
    const d9 = analysis.divisionalCharts?.['D9'] || analysis.divisionalCharts?.['Navamsa'];
    if (!d9) return { isStrong: false, reason: 'D9 chart unavailable' };

    const planetD9 = d9.planets?.[planet];
    if (!planetD9) return { isStrong: false, reason: `${planet} not found in D9` };

    const sign = planetD9.sign;
    const signIdx = ZODIAC_SIGNS.indexOf(sign);
    const signLord = signIdx >= 0 ? RASHI_LORDS[signIdx] : '';

    // Check Own Sign
    if (signLord === planet) {
        return { isStrong: true, reason: `${planet} is in own sign (${sign}) in Navamsa` };
    }

    // Check Exaltation
    const EXALTATION: { [key: string]: string } = {
        Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn', Mercury: 'Virgo',
        Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra', Rahu: 'Taurus', Ketu: 'Scorpio'
    };
    if (EXALTATION[planet] === sign) {
        return { isStrong: true, reason: `${planet} is exalted (${sign}) in Navamsa` };
    }

    // Check Kendra/Trikona placement
    const d9Asc = d9.ascendant;
    const d9AscIdx = ZODIAC_SIGNS.indexOf(d9Asc);
    if (d9AscIdx >= 0 && signIdx >= 0) {
        const houseNum = ((signIdx - d9AscIdx + 12) % 12) + 1;
        const kendraTrikonaHouses = [1, 4, 5, 7, 9, 10];
        if (kendraTrikonaHouses.includes(houseNum)) {
            return { isStrong: true, reason: `${planet} is in ${houseNum}th house (Kendra/Trikona) in Navamsa` };
        }
    }

    return { isStrong: false, reason: `${planet} is not strongly placed in Navamsa` };
}

// ═══════════════════════════════════════════════════════
// ─── MAIN FUNCTION: Calculate Lucky Data ───
// ═══════════════════════════════════════════════════════

export function calculateLucky(
    analysis: BirthChartAnalysis,
    panchangTithi: string,
    panchangNakshatra: string,
    panchangVaar: string,
    sunriseHourApprox: number // e.g. 6 for 6 AM
): LuckyResult {

    const now = new Date();
    const currentHour = now.getHours();

    // ─── STEP 1: Identify Key Planets ───

    // 1a. Dasha Lords
    const dashaLords = findActiveDashaLords(analysis.dashas, now);

    // 1b. Vara Lord (Weekday planet)
    const varaLord = VARA_LORDS[panchangVaar] || 'Sun';

    // 1c. Tithi Lord
    const tithiIdx = getTithiIndex(panchangTithi);
    const tithiLord = TITHI_LORDS[tithiIdx] || 'Sun';

    // 1d. Day Nakshatra Lord
    const nakshatraLord = NAKSHATRA_LORD_MAP[panchangNakshatra] || 'Ketu';

    // 1e. Hora Lord
    const horaLord = getCurrentHoraLord(panchangVaar, currentHour, sunriseHourApprox);

    // 1f. Lagna Lord
    const lagnaIdx = ZODIAC_SIGNS.indexOf(analysis.ascendant);
    const lagnaLord = lagnaIdx >= 0 ? RASHI_LORDS[lagnaIdx] : 'Mars';

    // 1g. Moon Sign Lord
    const moonIdx = ZODIAC_SIGNS.indexOf(analysis.moonSign);
    const moonSignLord = moonIdx >= 0 ? RASHI_LORDS[moonIdx] : 'Moon';

    // ─── STEP 2: Score Each Planet ───

    const scoreMap: { [planet: string]: { score: number; sources: string[] } } = {};

    const addScore = (planet: string, weight: number, source: string) => {
        if (!planet) return;
        if (!scoreMap[planet]) scoreMap[planet] = { score: 0, sources: [] };
        scoreMap[planet].score += weight;
        scoreMap[planet].sources.push(source);
    };

    addScore(dashaLords.mahadasha, 3, 'Mahadasha Lord');
    addScore(dashaLords.antardasha, 2, 'Antardasha Lord');
    addScore(varaLord, 2, `Vara Lord (${panchangVaar})`);
    addScore(tithiLord, 1, 'Tithi Lord');
    addScore(nakshatraLord, 1, 'Day Nakshatra Lord');
    addScore(horaLord, 1, 'Current Hora Lord');
    addScore(lagnaLord, 1, 'Lagna Lord');
    addScore(moonSignLord, 1, 'Moon Sign Lord');

    // Also add Pratyantardasha if available
    if (dashaLords.pratyantardasha) {
        addScore(dashaLords.pratyantardasha, 1, 'Pratyantardasha Lord');
    }

    // Sort planets by score (descending)
    const sortedPlanets = Object.entries(scoreMap)
        .map(([planet, data]) => ({ planet, ...data }))
        .sort((a, b) => b.score - a.score);

    const primaryPlanet = sortedPlanets[0];
    const secondaryPlanet = sortedPlanets[1] || sortedPlanets[0];

    // ─── STEP 5: Cross-Validate with D9 (Navamsa) ───

    let finalPrimary = primaryPlanet;
    let d9Validation = '';
    const d9Check = checkD9Strength(analysis, primaryPlanet.planet);

    if (d9Check.isStrong) {
        d9Validation = `Strongly favorable — ${d9Check.reason}`;
    } else {
        // Check if secondary planet is stronger in D9
        const d9CheckSecondary = checkD9Strength(analysis, secondaryPlanet.planet);
        if (d9CheckSecondary.isStrong && secondaryPlanet.score >= primaryPlanet.score - 1) {
            // Fall back to secondary only if it's close in score AND strong in D9
            finalPrimary = secondaryPlanet;
            d9Validation = `Adjusted to ${secondaryPlanet.planet} — ${d9CheckSecondary.reason}. ${primaryPlanet.planet} was not strong in Navamsa.`;
        } else {
            d9Validation = `${primaryPlanet.planet} selected by score dominance. ${d9Check.reason}.`;
        }
    }

    // ─── STEP 3 & 4: Derive Color & Number ───

    const primaryColors = PLANET_COLORS[finalPrimary.planet] || PLANET_COLORS['Sun'];
    const secondaryColors = PLANET_COLORS[secondaryPlanet.planet] || PLANET_COLORS['Moon'];
    const primaryNumber = PLANET_NUMBERS[finalPrimary.planet] || 1;
    const secondaryNumber = PLANET_NUMBERS[secondaryPlanet.planet] || 2;

    // Handle tie: sum and reduce
    let altNum = secondaryNumber;
    if (primaryPlanet.score === secondaryPlanet.score) {
        const summed = primaryNumber + secondaryNumber;
        altNum = summed > 9 ? (summed % 9) || 9 : summed;
    }

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (finalPrimary.score >= 5 && d9Check.isStrong) confidence = 'high';
    else if (finalPrimary.score >= 4) confidence = 'medium';
    else confidence = 'low';

    // Build reason string
    const reasonParts = finalPrimary.sources.slice(0, 3).join(', ');
    const rulingPlanetReason = `${finalPrimary.planet} is your ${reasonParts}` +
        (d9Check.isStrong ? `, and is strong in your D9 chart` : '');

    return {
        luckyColor: primaryColors.primary,
        luckyColorHex: primaryColors.hex,
        luckyNumber: primaryNumber,
        rulingPlanet: finalPrimary.planet,
        rulingPlanetReason,
        confidence,
        alternateColor: secondaryColors.primary,
        alternateColorHex: secondaryColors.hex,
        alternateNumber: altNum,
        alternatePlanet: secondaryPlanet.planet,
        planetScores: sortedPlanets,
        horaLord,
        d9Validation,
    };
}
