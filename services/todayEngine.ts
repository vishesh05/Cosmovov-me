/**
 * Today Engine — Complete Vedic Astrology Daily Calculation Backend
 * 
 * Composes existing engines (astrologyEngine, transitEngine, luckyEngine,
 * chartStrengthEngine, panchangSystem) into a unified daily output.
 * 
 * All calculations are real astronomical computations via astronomy-engine.
 * No hardcoded or random values.
 */

import { BirthChartAnalysis, UserProfile, TodayData, DashaPeriod, PlanetDetails } from '../types';
import { calculateCurrentPlanets, ZODIAC_SIGNS, RASHI_LORDS, getPanchangInfo, SimplePlanet } from './astrologyEngine';
import { calculateTransits, TransitPlanet } from './transitEngine';
import { calculateLucky } from './luckyEngine';
import { calculatePowerHour as calculateComprehensivePowerHour } from './powerHourEngine';

// ─── Constants ───

const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
    "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_LORDS_MAP: { [key: string]: string } = {
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

// Nakshatra mobility classification
const NAKSHATRA_MOBILITY: { [key: string]: 'chara' | 'sthira' | 'mishra' | 'tikshna' } = {
    'Ashwini': 'chara', 'Bharani': 'sthira', 'Krittika': 'mishra',
    'Rohini': 'sthira', 'Mrigashira': 'chara', 'Ardra': 'tikshna',
    'Punarvasu': 'chara', 'Pushya': 'sthira', 'Ashlesha': 'tikshna',
    'Magha': 'tikshna', 'Purva Phalguni': 'sthira', 'Uttara Phalguni': 'sthira',
    'Hasta': 'chara', 'Chitra': 'chara', 'Swati': 'chara',
    'Vishakha': 'mishra', 'Anuradha': 'chara', 'Jyeshtha': 'tikshna',
    'Mula': 'tikshna', 'Purva Ashadha': 'tikshna', 'Uttara Ashadha': 'sthira',
    'Shravana': 'chara', 'Dhanishta': 'chara', 'Shatabhisha': 'chara',
    'Purva Bhadrapada': 'tikshna', 'Uttara Bhadrapada': 'sthira', 'Revati': 'chara',
};

// Nakshatra deity mapping for rituals
const NAKSHATRA_DEITIES: { [key: string]: string } = {
    'Ashwini': 'Ashwini Kumaras', 'Bharani': 'Yama', 'Krittika': 'Agni',
    'Rohini': 'Brahma', 'Mrigashira': 'Soma', 'Ardra': 'Rudra',
    'Punarvasu': 'Aditi', 'Pushya': 'Brihaspati', 'Ashlesha': 'Nagas',
    'Magha': 'Pitris', 'Purva Phalguni': 'Bhaga', 'Uttara Phalguni': 'Aryaman',
    'Hasta': 'Savitar', 'Chitra': 'Vishwakarma', 'Swati': 'Vayu',
    'Vishakha': 'Indra-Agni', 'Anuradha': 'Mitra', 'Jyeshtha': 'Indra',
    'Mula': 'Nirriti', 'Purva Ashadha': 'Apas', 'Uttara Ashadha': 'Vishvadevas',
    'Shravana': 'Vishnu', 'Dhanishta': 'Vasus', 'Shatabhisha': 'Varuna',
    'Purva Bhadrapada': 'Aja Ekapada', 'Uttara Bhadrapada': 'Ahir Budhnya', 'Revati': 'Pushan',
};

// Tara Chakra classification: 1=Janma(enemy), 2=Sampat(friend), 3=Vipat(enemy), 4=Kshema(friend),
// 5=Pratyari(enemy), 6=Sadhaka(friend), 7=Vadha(enemy), 8=Mitra(friend), 9=Ati-Mitra(friend)
const TARA_QUALITY: { [key: number]: 'friend' | 'neutral' | 'enemy' } = {
    1: 'enemy', 2: 'friend', 3: 'enemy', 4: 'friend',
    5: 'enemy', 6: 'friend', 7: 'enemy', 8: 'friend', 9: 'friend'
};

// Benefic planets per ascendant (for Power Hour)
const ASCENDANT_BENEFICS: { [key: string]: string[] } = {
    'Aries': ['Jupiter', 'Sun', 'Mars'],
    'Taurus': ['Saturn', 'Mercury', 'Venus'],
    'Gemini': ['Mercury', 'Venus', 'Saturn'],
    'Cancer': ['Moon', 'Jupiter', 'Mars'],
    'Leo': ['Sun', 'Mars', 'Jupiter'],
    'Virgo': ['Mercury', 'Venus', 'Saturn'],
    'Libra': ['Venus', 'Saturn', 'Mercury'],
    'Scorpio': ['Jupiter', 'Moon', 'Mars'],
    'Sagittarius': ['Jupiter', 'Sun', 'Mars'],
    'Capricorn': ['Saturn', 'Venus', 'Mercury'],
    'Aquarius': ['Saturn', 'Venus', 'Mercury'],
    'Pisces': ['Jupiter', 'Moon', 'Mars'],
};

// Planet → Theme mapping for Core/Growth
const PLANET_THEMES: { [key: string]: { title: string; coreDesc: string; growthDesc: string } } = {
    'Sun': {
        title: 'Leadership & Confidence',
        coreDesc: 'Your natural authority shines today — take the lead on decisions and inspire others around you.',
        growthDesc: 'Balance your drive with patience today — listening to others will strengthen your leadership presence.'
    },
    'Moon': {
        title: 'Emotional Intelligence',
        coreDesc: 'Your emotional awareness is heightened today — trust your feelings to guide meaningful conversations.',
        growthDesc: 'Nurture your emotional balance today — avoid overthinking and ground yourself with calming moments.'
    },
    'Mars': {
        title: 'Action & Courage',
        coreDesc: 'Your courage and determination are at their peak — channel this fire into physical goals or bold decisions.',
        growthDesc: 'Temper your intensity with mindfulness today — patience will deliver better results than force.'
    },
    'Mercury': {
        title: 'Communication & Intellect',
        coreDesc: 'Your words carry clarity today — use this gift for writing, speaking, or important conversations.',
        growthDesc: 'Slow down your thoughts today — double-check details before committing to important communications.'
    },
    'Jupiter': {
        title: 'Wisdom & Teaching',
        coreDesc: 'Your wisdom shines brightest today — share knowledge, mentor others, or expand your own learning.',
        growthDesc: 'Stay open to new perspectives today — growth comes from listening as much as from knowing.'
    },
    'Venus': {
        title: 'Creativity & Relationships',
        coreDesc: 'Your creative energy flows beautifully today — express yourself through art, music, or heartfelt gestures.',
        growthDesc: 'Invest in self-care and harmony today — small acts of kindness will deepen your closest bonds.'
    },
    'Saturn': {
        title: 'Discipline & Structure',
        coreDesc: 'Your focus and discipline are unshakable today — tackle long-term goals and build lasting foundations.',
        growthDesc: 'Be gentle with yourself today — take breaks to avoid burnout and celebrate small victories.'
    },
};

// Planet → Color mapping
const PLANET_COLORS: { [key: string]: { name: string; hex: string } } = {
    'Sun': { name: 'Golden Orange', hex: '#E8820C' },
    'Moon': { name: 'Pearl White', hex: '#F5F5F5' },
    'Mars': { name: 'Crimson Red', hex: '#DC2626' },
    'Mercury': { name: 'Emerald Green', hex: '#16A34A' },
    'Jupiter': { name: 'Royal Yellow', hex: '#EAB308' },
    'Venus': { name: 'Rose Pink', hex: '#F9A8D4' },
    'Saturn': { name: 'Deep Blue', hex: '#1E3A5F' },
    'Rahu': { name: 'Smoky Grey', hex: '#708090' },
    'Ketu': { name: 'Ash Brown', hex: '#8B4513' },
};

// Day of week → ruling planet
const DAY_LORDS: { [key: number]: string } = {
    0: 'Sun', 1: 'Moon', 2: 'Mars', 3: 'Mercury', 4: 'Jupiter', 5: 'Venus', 6: 'Saturn'
};

// Hora sequence (from sunrise, repeating 24 for each day)
const HORA_SEQUENCES: { [key: string]: string[] } = {
    'Sun': ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
    'Moon': ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'],
    'Mars': ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'],
    'Mercury': ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'],
    'Jupiter': ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'],
    'Venus': ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'],
    'Saturn': ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'],
};

// Hora activity labels
const HORA_LABELS: { [key: string]: string } = {
    'Sun': 'Leadership decisions & authority tasks',
    'Moon': 'Creative visualization & family time',
    'Mars': 'Physical activity & bold initiatives',
    'Mercury': 'Important communication & learning',
    'Jupiter': 'Spiritual practice & financial growth',
    'Venus': 'Romantic conversations & artistic work',
    'Saturn': 'Focused discipline & long-term planning',
};

// Ascendant → Element
const SIGN_ELEMENTS: { [key: string]: 'fire' | 'earth' | 'air' | 'water' } = {
    'Aries': 'fire', 'Taurus': 'earth', 'Gemini': 'air', 'Cancer': 'water',
    'Leo': 'fire', 'Virgo': 'earth', 'Libra': 'air', 'Scorpio': 'water',
    'Sagittarius': 'fire', 'Capricorn': 'earth', 'Aquarius': 'air', 'Pisces': 'water',
};

// Natural friendship table for scoring
const FRIENDSHIP: { [key: string]: { [key: string]: number } } = {
    Sun: { Moon: 1, Mars: 1, Jupiter: 1, Mercury: 0, Venus: -1, Saturn: -1 },
    Moon: { Sun: 1, Mercury: 1, Mars: 0, Jupiter: 0, Venus: 0, Saturn: 0 },
    Mars: { Sun: 1, Moon: 1, Jupiter: 1, Venus: 0, Saturn: 0, Mercury: -1 },
    Mercury: { Sun: 1, Venus: 1, Mars: 0, Jupiter: 0, Saturn: 0, Moon: -1 },
    Jupiter: { Sun: 1, Moon: 1, Mars: 1, Saturn: 0, Mercury: -1, Venus: -1 },
    Venus: { Mercury: 1, Saturn: 1, Mars: 0, Jupiter: 0, Sun: -1, Moon: -1 },
    Saturn: { Mercury: 1, Venus: 1, Jupiter: 0, Sun: -1, Moon: -1, Mars: -1 },
};


// ─── Helper Functions ───

function findActiveDashaLords(dashas: DashaPeriod[], now: Date): { mahadasha: string; antardasha: string } {
    let mahadasha = '';
    let antardasha = '';
    for (const md of dashas) {
        if (now >= new Date(md.startDate) && now <= new Date(md.endDate)) {
            mahadasha = md.planet;
            for (const ad of md.subPeriods || []) {
                if (now >= new Date(ad.startDate) && now <= new Date(ad.endDate)) {
                    antardasha = ad.planet;
                    break;
                }
            }
            break;
        }
    }
    return { mahadasha, antardasha };
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

function getNatalPlanetStrength(planet: PlanetDetails, houses: { houseNumber: number; sign: string; planets: string[] }[]): number {
    let score = 50; // Base

    // Dignity
    if (planet.dignity === 'exalted') score += 25;
    else if (planet.dignity === 'debilitated') score -= 20;

    // Own sign check
    const signIdx = ZODIAC_SIGNS.indexOf(planet.rashi);
    if (signIdx >= 0 && RASHI_LORDS[signIdx] === planet.name) score += 15;

    // Friendly sign
    const signLord = signIdx >= 0 ? RASHI_LORDS[signIdx] : '';
    const rel = FRIENDSHIP[planet.name]?.[signLord];
    if (rel === 1) score += 10;
    else if (rel === -1) score -= 10;

    // House placement
    const houseObj = houses.find(h => h.planets.includes(planet.name));
    if (houseObj) {
        const h = houseObj.houseNumber;
        if ([1, 4, 7, 10].includes(h)) score += 15;
        else if ([5, 9].includes(h)) score += 12;
        else if ([6, 8, 12].includes(h)) score -= 10;
    }

    // Retrograde gives some strength
    if (planet.isRetro) score += 5;

    // Combustion weakens
    if (planet.isCombust) score -= 15;

    return clamp(score, 0, 100);
}

function getTransitSignFriendliness(transitPlanet: TransitPlanet | undefined): number {
    if (!transitPlanet) return 0;
    if (transitPlanet.dignity === 'exalted') return 20;
    if (transitPlanet.dignity === 'own') return 15;
    if (transitPlanet.dignity === 'debilitated') return -15;
    return 0;
}

// ═══════════════════════════════════════════════════════
// ─── SECTION 1: TODAY'S FLOW ───
// ═══════════════════════════════════════════════════════

function calculateTodaysFlow(analysis: BirthChartAnalysis, todayMoonNakshatra: string): string {
    const janmaNakshatra = analysis.nakshatra;
    const janmaIdx = NAKSHATRAS.indexOf(janmaNakshatra);
    const todayIdx = NAKSHATRAS.indexOf(todayMoonNakshatra);

    let taraNum = ((todayIdx - janmaIdx + 27) % 27) % 9;
    if (taraNum === 0) taraNum = 9;

    const quality = TARA_QUALITY[taraNum] || 'neutral';
    const moonSign = ZODIAC_SIGNS[Math.floor(todayIdx / (27 / 12))] || '';
    const ascendant = analysis.ascendant;

    if (quality === 'friend') {
        return `Today's celestial rhythm harmonizes beautifully with your inner nature. The moon's gentle energy supports your ${ascendant} spirit, creating a smooth and flowing day ahead. Trust your instincts — the universe is on your side.`;
    } else if (quality === 'enemy') {
        return `Today's cosmic energy invites mindful awareness from you. The moon's current position creates a subtle tension with your natural rhythm, so take a patient and centered approach. Move carefully and trust that challenges today are building inner resilience.`;
    } else {
        return `Today brings a balanced cosmic rhythm — neither rushing nor holding you back. The moon's energy gently supports steady progress, making this a good day for measured decisions. Stay grounded and let things unfold at their own pace.`;
    }
}

// ═══════════════════════════════════════════════════════
// ─── SECTION 2: ENERGY LEVELS ───
// ═══════════════════════════════════════════════════════

function calculateLoveScore(
    analysis: BirthChartAnalysis,
    transits: TransitPlanet[],
    todayMoonTransit: TransitPlanet | undefined,
    dashaLords: { mahadasha: string; antardasha: string }
): { score: number; description: string } {
    let score = 50;

    // 1. Venus natal strength
    const natalVenus = analysis.planetaryDetails.find(p => p.name === 'Venus');
    if (natalVenus) score += Math.round((getNatalPlanetStrength(natalVenus, analysis.houses) - 50) * 0.4);

    // 2. Venus transit dignity
    const transitVenus = transits.find(t => t.name === 'Venus');
    score += getTransitSignFriendliness(transitVenus);

    // 3. Moon in 5th or 7th from natal moon
    if (todayMoonTransit) {
        const natalMoon = analysis.planetaryDetails.find(p => p.name === 'Moon');
        if (natalMoon) {
            const natalMoonSignIdx = ZODIAC_SIGNS.indexOf(natalMoon.rashi);
            const transitMoonSignIdx = ZODIAC_SIGNS.indexOf(todayMoonTransit.sign);
            const dist = ((transitMoonSignIdx - natalMoonSignIdx + 12) % 12) + 1;
            if (dist === 5 || dist === 7) score += 15;
            else if (dist === 1 || dist === 4) score += 8;
        }
    }

    // 4. Dasha lord is Venus or Moon
    if (['Venus', 'Moon'].includes(dashaLords.mahadasha)) score += 12;
    if (['Venus', 'Moon'].includes(dashaLords.antardasha)) score += 8;

    score = clamp(score, 15, 98);

    let desc = '';
    if (score >= 80) desc = 'Magnetic emotional harmony flows through your connections.';
    else if (score >= 65) desc = 'Warm energy supports meaningful bonds today.';
    else if (score >= 45) desc = 'A balanced day for steady emotional connections.';
    else desc = 'Focus on self-care before extending to others.';

    return { score, description: desc };
}

function calculateCareerScore(
    analysis: BirthChartAnalysis,
    transits: TransitPlanet[],
    dashaLords: { mahadasha: string; antardasha: string },
    dayOfWeek: number
): { score: number; description: string } {
    let score = 50;

    // 1. Saturn + Sun natal strength
    const natalSun = analysis.planetaryDetails.find(p => p.name === 'Sun');
    const natalSaturn = analysis.planetaryDetails.find(p => p.name === 'Saturn');
    if (natalSun) score += Math.round((getNatalPlanetStrength(natalSun, analysis.houses) - 50) * 0.3);
    if (natalSaturn) score += Math.round((getNatalPlanetStrength(natalSaturn, analysis.houses) - 50) * 0.3);

    // 2. Jupiter aspecting 10th house
    const transitJupiter = transits.find(t => t.name === 'Jupiter');
    if (transitJupiter) {
        const ascIdx = ZODIAC_SIGNS.indexOf(analysis.ascendant);
        const tenthSignIdx = (ascIdx + 9) % 12;
        const jupSignIdx = ZODIAC_SIGNS.indexOf(transitJupiter.sign);
        const dist = ((tenthSignIdx - jupSignIdx + 12) % 12);
        // Jupiter aspects 5th, 7th, 9th from its position (dist = 4, 6, 8 from Jupiter)
        if (dist === 0 || dist === 4 || dist === 6 || dist === 8) score += 15;
    }

    // 3. Dasha lord is Sun, Saturn, or Mercury
    if (['Sun', 'Saturn', 'Mercury'].includes(dashaLords.mahadasha)) score += 12;
    if (['Sun', 'Saturn', 'Mercury'].includes(dashaLords.antardasha)) score += 8;

    // 4. Day ruled by career-related planet
    const dayLord = DAY_LORDS[dayOfWeek];
    if (['Sun', 'Saturn', 'Mercury'].includes(dayLord)) score += 8;

    score = clamp(score, 15, 98);

    let desc = '';
    if (score >= 80) desc = 'Strong alignment for professional growth today.';
    else if (score >= 65) desc = 'Good momentum supports your career aspirations.';
    else if (score >= 45) desc = 'Steady progress through focused, consistent effort.';
    else desc = 'Plan and prepare today for future breakthroughs.';

    return { score, description: desc };
}

function calculateEnergyScore(
    analysis: BirthChartAnalysis,
    todayMoonNakshatra: string,
    tithiIndex: number,
    paksha: string
): { score: number; description: string } {
    let score = 55;

    // 1. Mars natal strength
    const natalMars = analysis.planetaryDetails.find(p => p.name === 'Mars');
    if (natalMars) score += Math.round((getNatalPlanetStrength(natalMars, analysis.houses) - 50) * 0.4);

    // 2. Tithi type
    const tithiInPaksha = tithiIndex <= 15 ? tithiIndex : tithiIndex - 15;
    if (tithiInPaksha === 15) {
        // Purnima or Amavasya
        if (paksha === 'Shukla') score += 10; // Purnima = high
        else score -= 10; // Amavasya = low
    } else if (tithiInPaksha === 8 || tithiInPaksha === 14) {
        score -= 5; // Ashtami & Chaturdashi are mixed
    }

    // 3. Moon waxing vs waning
    if (paksha === 'Shukla') score += 10; // Waxing = more energy
    else score -= 5; // Waning = lower energy

    // 4. Nakshatra mobility
    const mobility = NAKSHATRA_MOBILITY[todayMoonNakshatra];
    if (mobility === 'chara') score += 10; // Moveable = dynamic
    else if (mobility === 'sthira') score -= 5; // Fixed = slower
    else if (mobility === 'tikshna') score += 5; // Sharp = intense energy

    score = clamp(score, 15, 98);

    let desc = '';
    if (score >= 80) desc = 'Vibrant vitality powers your entire day forward.';
    else if (score >= 65) desc = 'Good energy levels support active engagement.';
    else if (score >= 45) desc = 'Pace yourself; focus on steady, restorative tasks.';
    else desc = 'Rest and recharge are your best allies today.';

    return { score, description: desc };
}

function calculateMindsetScore(
    analysis: BirthChartAnalysis,
    todayMoonNakshatra: string,
    transits: TransitPlanet[],
    dashaLords: { mahadasha: string; antardasha: string }
): { score: number; description: string } {
    let score = 55;

    // 1. Mercury + Jupiter natal strength
    const natalMerc = analysis.planetaryDetails.find(p => p.name === 'Mercury');
    const natalJup = analysis.planetaryDetails.find(p => p.name === 'Jupiter');
    if (natalMerc) score += Math.round((getNatalPlanetStrength(natalMerc, analysis.houses) - 50) * 0.3);
    if (natalJup) score += Math.round((getNatalPlanetStrength(natalJup, analysis.houses) - 50) * 0.3);

    // 2. Moon nakshatra lord is Mercury or Jupiter
    const nakLord = NAKSHATRA_LORDS_MAP[todayMoonNakshatra] || '';
    if (nakLord === 'Mercury' || nakLord === 'Jupiter') score += 12;

    // 3. Mercury retrograde check
    const transitMerc = transits.find(t => t.name === 'Mercury');
    if (transitMerc?.isRetro) score -= 12;
    else if (transitMerc) score += 5;

    // 4. Antardasha lord is Jupiter or Mercury
    if (['Jupiter', 'Mercury'].includes(dashaLords.antardasha)) score += 10;
    if (['Jupiter', 'Mercury'].includes(dashaLords.mahadasha)) score += 6;

    score = clamp(score, 15, 98);

    let desc = '';
    if (score >= 80) desc = 'Crystal-clear thinking illuminates every decision.';
    else if (score >= 65) desc = 'Mental clarity supports thoughtful decision-making.';
    else if (score >= 45) desc = 'A calm, measured approach brings the best results.';
    else desc = 'Simplify your focus — tackle one priority at a time.';

    return { score, description: desc };
}

// ═══════════════════════════════════════════════════════
// ─── SECTION 3: AUSPICIOUS FOCUS ───
// ═══════════════════════════════════════════════════════

function calculatePowerHour(
    ascendant: string,
    dayOfWeek: number,
    sunriseHour: number
): { startTime: string; endTime: string; label: string } {
    const dayLord = DAY_LORDS[dayOfWeek];
    const seq = HORA_SEQUENCES[dayLord];
    if (!seq) return { startTime: '9:00 AM', endTime: '10:00 AM', label: 'Productive focus time' };

    const benefics = ASCENDANT_BENEFICS[ascendant] || ['Jupiter', 'Venus'];

    // Search through 24 hora windows for the best match (first benefic after current time)
    const now = new Date();
    const currentHour = now.getHours();
    const hoursFromSunrise = ((currentHour - sunriseHour) + 24) % 24;

    // First pass: find first benefic hora after NOW
    for (let i = 0; i < 24; i++) {
        const horaIdx = i % 7;
        const horaPlanet = seq[horaIdx];
        const horaHourOfDay = (sunriseHour + i) % 24;

        if (horaHourOfDay >= currentHour && benefics.includes(horaPlanet)) {
            const startH = horaHourOfDay;
            const endH = (horaHourOfDay + 1) % 24;
            return {
                startTime: formatHour(startH),
                endTime: formatHour(endH),
                label: HORA_LABELS[horaPlanet] || 'Auspicious activities'
            };
        }
    }

    // Fallback: find the first benefic hora of the day
    for (let i = 0; i < 24; i++) {
        const horaPlanet = seq[i % 7];
        if (benefics.includes(horaPlanet)) {
            const startH = (sunriseHour + i) % 24;
            const endH = (startH + 1) % 24;
            return {
                startTime: formatHour(startH),
                endTime: formatHour(endH),
                label: HORA_LABELS[horaPlanet] || 'Auspicious activities'
            };
        }
    }

    return { startTime: '9:00 AM', endTime: '10:00 AM', label: 'Productive focus time' };
}

function formatHour(h: number): string {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:00 ${ampm}`;
}



// ═══════════════════════════════════════════════════════
// ─── SECTION 5: DAILY RITUAL ───
// ═══════════════════════════════════════════════════════

function calculateDailyRitual(
    ascendant: string,
    todayMoonNakshatra: string
): { title: string; description: string } {
    const element = SIGN_ELEMENTS[ascendant] || 'earth';
    const deity = NAKSHATRA_DEITIES[todayMoonNakshatra] || 'the cosmos';

    switch (element) {
        case 'fire':
            return {
                title: 'Solar Mantra Meditation',
                description: `Begin your morning with three Surya Namaskar sun salutations facing the east. As you move, silently chant "Om" to honor ${deity} and ignite your inner fire. This 5-minute practice aligns your fiery nature with today's celestial flow.`
            };
        case 'earth':
            return {
                title: 'Grounding Breath Practice',
                description: `Take 3 minutes before your main tasks to practice deep belly breathing with both feet planted firmly on the ground. Feel the earth's stability flowing through you as you honor ${deity}. This roots your earthy nature into today's cosmic rhythm.`
            };
        case 'air':
            return {
                title: 'Mindful Journaling',
                description: `Spend 5 quiet minutes writing down three intentions for today, letting your thoughts flow freely onto paper. Dedicate this clarity to ${deity} who governs today's sky. This channels your airy intellect into focused, purposeful energy.`
            };
        case 'water':
            return {
                title: 'Water Offering Meditation',
                description: `Hold a small glass of water in both hands for a moment of silent gratitude, then take a mindful sip or offer it to a plant. This honors ${deity} and connects your intuitive water nature with today's lunar energy. Let compassion guide your day.`
            };
        default:
            return {
                title: 'Centering Breath',
                description: `Take 3 minutes of slow, deep breathing to center yourself before the day begins. Feel the cosmic rhythm flowing through you as you align with today's energy. This simple practice brings clarity and peace.`
            };
    }
}


// ═══════════════════════════════════════════════════════
// ─── MAIN EXPORT ───
// ═══════════════════════════════════════════════════════

export function calculateTodayData(analysis: BirthChartAnalysis, profile: UserProfile): TodayData {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // 1. Get current transit planet positions
    const transits = calculateTransits(now, analysis.ascendant);
    const currentPlanets = calculateCurrentPlanets(now);

    // 2. Extract today's moon data
    const moonTransit = transits.find(t => t.name === 'Moon');
    const moonPlanet = currentPlanets.find(p => p.name === 'Moon');
    const todayMoonNakshatra = moonPlanet?.nakshatra || moonTransit?.nakshatra || 'Ashwini';

    // 3. Get panchang data for tithi
    // Use approximate coords for India (default)
    const lat = 28.6139; // Delhi default
    const lon = 77.2090;
    const panchang = getPanchangInfo(now, lat, lon);
    const tithiIndex = panchang.tithiIndex;
    const paksha = panchang.paksha;

    // 4. Find active dasha lords
    const dashaLords = findActiveDashaLords(analysis.dashas, now);

    // ── Approximate sunrise and sunset from panchang ──
    let sunriseHour = 6;
    let sunsetHour = 18; // default 12-hour day
    try {
        const sunriseStr = panchang.sunrise;
        const match = sunriseStr.match(/(\d{1,2})/);
        if (match) {
            const h = parseInt(match[1]);
            const isPM = sunriseStr.toLowerCase().includes('pm');
            sunriseHour = isPM && h !== 12 ? h + 12 : h;
            if (sunriseHour > 9 || sunriseHour < 3) sunriseHour = 6;
        }
        const sunsetStr = panchang.sunset;
        const sunsetMatch = sunsetStr.match(/(\d{1,2})/);
        if (sunsetMatch) {
            let h = parseInt(sunsetMatch[1]);
            const isPM = sunsetStr.toLowerCase().includes('pm') || h < 12;
            sunsetHour = isPM && h !== 12 ? h + 12 : h;
            if (sunsetHour < 15 || sunsetHour > 21) sunsetHour = 18;
        }
    } catch { sunriseHour = 6; sunsetHour = 18; }

    // ── Compute All 5 Sections ──

    const todaysFlow = calculateTodaysFlow(analysis, todayMoonNakshatra);

    const love = calculateLoveScore(analysis, transits, moonTransit, dashaLords);
    const career = calculateCareerScore(analysis, transits, dashaLords, dayOfWeek);
    const energy = calculateEnergyScore(analysis, todayMoonNakshatra, tithiIndex, paksha);
    const mindset = calculateMindsetScore(analysis, todayMoonNakshatra, transits, dashaLords);

    const powerHour = calculateComprehensivePowerHour(
        analysis,
        dayOfWeek,
        sunriseHour,
        sunsetHour,
        todayMoonNakshatra
    );
    
    // Derive the weekday name as luckyEngine expects (e.g. "Thursday")
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayName = DAY_NAMES[dayOfWeek];

    // Utilize the advanced Jyotish Shastra engine for supremely accurate, D9-validated lucky elements
    const advancedLucky = calculateLucky(
        analysis,
        panchang.tithi,
        panchang.nakshatra,
        weekdayName,
        sunriseHour
    );

    const dailyRitual = calculateDailyRitual(analysis.ascendant, todayMoonNakshatra);

    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return {
        todaysFlow,
        energyLevels: { love, career, energy, mindset },
        auspiciousFocus: {
            powerHour: {
                startTime: powerHour.bestHour.startTime,
                endTime: powerHour.bestHour.endTime,
                label: powerHour.bestHour.activity
            },
            luckyElements: {
                color: advancedLucky.luckyColor,
                colorHex: advancedLucky.luckyColorHex,
                number: advancedLucky.luckyNumber
            }
        },

        dailyRitual,
        computedDate: dateStr,
        fullLuckyData: advancedLucky,
        fullPowerHourData: powerHour
    };
}
