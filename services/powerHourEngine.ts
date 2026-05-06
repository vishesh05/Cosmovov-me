/**
 * Power Hour Engine — Comprehensive Vedic Astrology Auspicious Time Calculator
 *
 * This engine replicates the methodology of a real Jyotish (Vedic astrologer)
 * to determine the single most personally auspicious 1-hour window for the user
 * today, based on multiple layers of classical Vedic time science:
 *
 * LAYER 1: Hora System (Planetary Hours)
 *   - The day (sunrise-to-next-sunrise) is divided into 24 Horas (1 hour each)
 *   - Each Hora is ruled by a planet in the classical Chaldean sequence:
 *     Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars
 *   - The day lord's Hora starts at sunrise, and the sequence cycles forward
 *   - The Hora of the Lagna Lord is always most personally auspicious
 *   - The Hora of the Mahadasha/Antardasha lord is doubly powerful today
 *
 * LAYER 2: Choghadiya (Auspicious Time Periods for the Day)
 *   - The day is split into 8 equal portions from sunrise to sunset
 *   - Each portion is classified: Amrit, Shubh, Labh, Char (good) | Rog, Kaal, Udveg (bad)
 *   - Vaar Vela is mixed (depends on day of week)
 *   - A Choghadiya period reinforces or penalizes each hora window
 *
 * LAYER 3: Rahu Kaal, Yamaganda, Gulika Kaal (Inauspicious Windows to Avoid)
 *   - Fixed inauspicious time-blocks each day of the week
 *   - Calculated from sunrise as fractions of the day duration
 *   - Hours overlapping these windows are heavily penalized
 *
 * LAYER 4: Personal Benefic Alignment
 *   - Each Ascendant has specific benefic planets (Yogakarakas)
 *   - If the current Hora lord is one of the user's personal benefics → bonus
 *   - Cross-referenced with Dasha lords for extra weight
 *
 * LAYER 5: Tara Chakra (Moon Nakshatra Relationship)
 *   - If today's Moon nakshatra is in a friendly Tara to user's Janma nakshatra,
 *     all hours in that period get a quality boost
 *
 * FINAL OUTPUT:
 *   - Best single auspicious hour (with reason and planet)
 *   - Top 3 ranked windows for the day
 *   - Inauspicious windows to avoid (Rahu Kaal etc.)
 *   - Confidence level
 */

import { BirthChartAnalysis, DashaPeriod } from '../types';
import { ZODIAC_SIGNS, RASHI_LORDS } from './astrologyEngine';

// ─── Constants ───

const CLASSICIAL_HOURS_SEQUENCE = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];

// Day lord index: 0=Sun(Sunday), 1=Moon(Monday), 2=Mars(Tuesday),
// 3=Mercury(Wednesday), 4=Jupiter(Thursday), 5=Venus(Friday), 6=Saturn(Saturday)
const DAY_LORDS_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Where each day lord sits in the Chaldean sequence above
const DAY_LORD_HORA_START: { [key: string]: number } = {
    'Sun': 0, 'Venus': 1, 'Mercury': 2, 'Moon': 3, 'Saturn': 4, 'Jupiter': 5, 'Mars': 6
};

// Nakshatra list (27)
const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Tara Chakra: position 1-9,
// 1=Janma(enemy), 2=Sampat(friend), 3=Vipat(enemy), 4=Kshema(friend),
// 5=Pratyari(enemy), 6=Sadhaka(friend), 7=Vadha(enemy), 8=Mitra(friend), 9=Ati-Mitra(friend)
const TARA_QUALITY: { [key: number]: 'excellent' | 'good' | 'bad' } = {
    1: 'bad', 2: 'excellent', 3: 'bad', 4: 'good',
    5: 'bad', 6: 'good', 7: 'bad', 8: 'good', 9: 'excellent'
};

// Personal benefics per Ascendant (Yogakarakas and functional benefics)
const ASCENDANT_BENEFICS: { [key: string]: { primary: string[]; secondary: string[] } } = {
    'Aries':       { primary: ['Sun', 'Jupiter', 'Mars'],    secondary: ['Moon'] },
    'Taurus':      { primary: ['Saturn', 'Mercury', 'Venus'], secondary: ['Jupiter'] },
    'Gemini':      { primary: ['Venus', 'Saturn', 'Mercury'], secondary: ['Jupiter'] },
    'Cancer':      { primary: ['Jupiter', 'Mars', 'Moon'],   secondary: ['Sun'] },
    'Leo':         { primary: ['Sun', 'Mars', 'Jupiter'],    secondary: ['Moon'] },
    'Virgo':       { primary: ['Mercury', 'Venus', 'Saturn'], secondary: [] },
    'Libra':       { primary: ['Saturn', 'Mercury', 'Venus'], secondary: ['Moon'] },
    'Scorpio':     { primary: ['Jupiter', 'Moon', 'Mars'],   secondary: ['Sun'] },
    'Sagittarius': { primary: ['Sun', 'Mars', 'Jupiter'],    secondary: [] },
    'Capricorn':   { primary: ['Saturn', 'Venus', 'Mercury'], secondary: [] },
    'Aquarius':    { primary: ['Saturn', 'Venus', 'Mars'],   secondary: [] },
    'Pisces':      { primary: ['Jupiter', 'Mars', 'Moon'],   secondary: ['Saturn'] },
};

// Hora activity labels
const HORA_ACTIVITY: { [key: string]: { best: string; avoid: string } } = {
    'Sun':     { best: 'Leadership, govt work, authority decisions, health matters',  avoid: 'Speculation or risky financial moves' },
    'Moon':    { best: 'Family bonds, creativity, travel, emotional healing',          avoid: 'Confrontation or argumentative conversations' },
    'Mars':    { best: 'Physical work, sports, bold initiatives, technical tasks',     avoid: 'Hasty financial decisions or surgery (unless necessary)' },
    'Mercury': { best: 'Study, writing, contracts, business communication, learning',  avoid: 'Rashness — double-check every detail' },
    'Jupiter': { best: 'Financial transactions, education, spiritual practice, legal', avoid: 'Launching combative or deceptive plans' },
    'Venus':   { best: 'Romantic conversations, artistic work, luxury purchases',      avoid: 'Confrontation or disputes' },
    'Saturn':  { best: 'Focused discipline, long-term planning, service to others',   avoid: 'New beginnings requiring quick results' },
};

// Choghadiya types per day (Sunday=0) for day-time portions (8 slots sunrise→sunset)
// Order: Udveg, Amrit, Rog, Labh, Shubh, Char, Kaal, Udveg (classical)
const CHOGHADIYA_DAY: { [key: number]: string[] } = {
    0: ['Udveg', 'Amrit', 'Rog',   'Labh', 'Shubh', 'Char', 'Kaal',  'Udveg'],  // Sunday
    1: ['Amrit', 'Kaal',  'Shubh', 'Rog',  'Udveg', 'Char', 'Labh',  'Amrit'],  // Monday
    2: ['Rog',   'Udveg', 'Char',  'Kaal', 'Amrit', 'Labh', 'Shubh', 'Rog'],    // Tuesday
    3: ['Labh',  'Amrit', 'Udveg', 'Shubh','Char',  'Kaal', 'Rog',   'Labh'],   // Wednesday
    4: ['Shubh', 'Rog',   'Char',  'Udveg','Kaal',  'Amrit','Labh',  'Shubh'],  // Thursday
    5: ['Char',  'Labh',  'Kaal',  'Amrit','Rog',   'Udveg','Shubh', 'Char'],   // Friday
    6: ['Kaal',  'Shubh', 'Labh',  'Char', 'Udveg', 'Rog',  'Amrit', 'Kaal'],   // Saturday
};

// Choghadiya quality scoring
const CHOGHADIYA_SCORE: { [key: string]: number } = {
    'Amrit': 4,  // Excellent — highest nectar hour
    'Shubh': 3,  // Good — auspicious
    'Labh':  3,  // Good — profitable
    'Char':  2,  // Ok — movement/travel
    'Udveg': -2, // Bad — anxiety/stress
    'Rog':   -2, // Bad — disease/obstacles
    'Kaal':  -3, // Very bad — death-like obstructions
};

// Rahu Kaal fractions (as 1/8 of day segments from sunrise, 0-indexed)
// e.g., Sunday Rahu Kaal = segment 8 = the 8th slot (last 1.5 hours of 12-hour day)
// These are the classical slots: segment 1 = first 1.5 hr after sunrise etc.
const RAHU_KAAL_SLOT: { [key: number]: number } = {
    0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3   // Sunday→Saturday
};

// Yamaganda slot per weekday
const YAMAGANDA_SLOT: { [key: number]: number } = {
    0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6
};

// Gulika Kaal slot per weekday
const GULIKA_SLOT: { [key: number]: number } = {
    0: 6, 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 7
};

// ─── Interfaces ───

export interface HoraSlot {
    hourOfDay: number;       // 0-23
    startTime: string;       // "9:00 AM"
    endTime: string;         // "10:00 AM"
    planet: string;          // Ruling planet of this Hora
    score: number;           // Composite auspiciousness score
    choghadiya: string;      // Choghadiya classification
    isRahuKaal: boolean;
    isYamaganda: boolean;
    isGulikaKaal: boolean;
    reasons: string[];       // Why this hour is good/bad
    activity: string;        // Best activity for this hour
}

export interface PowerHourResult {
    bestHour: HoraSlot;
    top3Hours: HoraSlot[];
    avoidHours: HoraSlot[];                      // Rahu Kaal etc.
    lagnaLord: string;
    dashaLord: string;
    taraQuality: string;
    confidence: 'high' | 'medium' | 'low';
    todayMoonNakshatra: string;
    sunriseHour: number;
    sunsetHour: number;
}

// ─── Helper Functions ───

function formatHour(h: number): string {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:00 ${ampm}`;
}

function findActiveDashaLord(dashas: DashaPeriod[], now: Date): string {
    for (const md of dashas) {
        if (now >= new Date(md.startDate) && now <= new Date(md.endDate)) {
            for (const ad of md.subPeriods || []) {
                if (now >= new Date(ad.startDate) && now <= new Date(ad.endDate)) {
                    return ad.planet;
                }
            }
            return md.planet;
        }
    }
    return '';
}

function getMahadasha(dashas: DashaPeriod[], now: Date): string {
    for (const md of dashas) {
        if (now >= new Date(md.startDate) && now <= new Date(md.endDate)) {
            return md.planet;
        }
    }
    return '';
}

function getTaraNumber(janmaNakshatra: string, todayNakshatra: string): number {
    const janmaIdx = NAKSHATRAS.indexOf(janmaNakshatra);
    const todayIdx = NAKSHATRAS.indexOf(todayNakshatra);
    if (janmaIdx < 0 || todayIdx < 0) return 5; // neutral
    let tara = ((todayIdx - janmaIdx + 27) % 27) % 9;
    if (tara === 0) tara = 9;
    return tara;
}

// ─── Main Calculation ───

export function calculatePowerHour(
    analysis: BirthChartAnalysis,
    dayOfWeek: number,         // 0=Sunday
    sunriseHour: number,       // e.g. 6
    sunsetHour: number,        // e.g. 18
    todayMoonNakshatra: string
): PowerHourResult {

    const now = new Date();
    const currentHour = now.getHours();

    // ── Identify key planets ──
    const lagnaIdx = ZODIAC_SIGNS.indexOf(analysis.ascendant);
    const lagnaLord = lagnaIdx >= 0 ? RASHI_LORDS[lagnaIdx] : 'Mars';

    const dashaLord = findActiveDashaLord(analysis.dashas, now);
    const mahadasha = getMahadasha(analysis.dashas, now);

    const benefics = ASCENDANT_BENEFICS[analysis.ascendant] || { primary: ['Jupiter', 'Venus'], secondary: [] };

    // ── Tara quality for today ──
    const taraNum = getTaraNumber(analysis.nakshatra || '', todayMoonNakshatra);
    const taraQuality = TARA_QUALITY[taraNum] || 'good';
    const taraBonus = taraQuality === 'excellent' ? 3 : taraQuality === 'good' ? 1 : -1;

    // ── Day lord and hora start ──
    const dayLord = DAY_LORDS_ORDER[dayOfWeek];
    const dayLordStartIdx = DAY_LORD_HORA_START[dayLord] ?? 0;

    // ── Choghadiya slots ──
    const dayChoghadiyas = CHOGHADIYA_DAY[dayOfWeek] || CHOGHADIYA_DAY[0];
    const dayDurationHours = sunsetHour - sunriseHour; // e.g. 12
    const choghadiyaSlotSize = dayDurationHours / 8;   // e.g. 1.5 hours each

    // Rahu Kaal / Yamaganda / Gulika slot times
    function getInauspiciousRange(slotNum: number): { start: number; end: number } {
        const start = sunriseHour + (slotNum - 1) * choghadiyaSlotSize;
        const end = start + choghadiyaSlotSize;
        return { start, end };
    }

    const rahuKaalRange = getInauspiciousRange(RAHU_KAAL_SLOT[dayOfWeek]);
    const yamagandaRange = getInauspiciousRange(YAMAGANDA_SLOT[dayOfWeek]);
    const gulikaRange = getInauspiciousRange(GULIKA_SLOT[dayOfWeek]);

    // ── Score every hour of the waking day (sunrise to midnight) ──
    const allHours: HoraSlot[] = [];

    for (let i = 0; i < 24; i++) {
        const horaSequenceIdx = (dayLordStartIdx + i) % 7;
        const planet = CLASSICIAL_HOURS_SEQUENCE[horaSequenceIdx];
        const hourOfDay = (sunriseHour + i) % 24;

        let score = 0;
        const reasons: string[] = [];

        // 1. Hora lord scoring
        if (planet === lagnaLord) {
            score += 5;
            reasons.push(`Lagna Lord ${planet} hora — most personally auspicious`);
        } else if (benefics.primary.includes(planet)) {
            score += 4;
            reasons.push(`${planet} is a primary benefic for your ${analysis.ascendant} Ascendant`);
        } else if (benefics.secondary.includes(planet)) {
            score += 2;
            reasons.push(`${planet} is a secondary benefic for your ascendant`);
        }

        // 2. Dasha lord correlation
        if (planet === dashaLord) {
            score += 3;
            reasons.push(`${planet} is your current Antardasha lord`);
        }
        if (planet === mahadasha) {
            score += 2;
            reasons.push(`${planet} is your Mahadasha lord`);
        }

        // 3. Choghadiya scoring
        const choghadiyaIdx = hourOfDay >= sunriseHour
            ? Math.floor((hourOfDay - sunriseHour) / choghadiyaSlotSize)
            : 7; // Night Choghadiya (simplified: use last)
        const choghadiya = dayChoghadiyas[Math.min(choghadiyaIdx, 7)] || 'Char';
        const choghadiyaPoints = CHOGHADIYA_SCORE[choghadiya] || 0;
        score += choghadiyaPoints;
        if (choghadiyaPoints > 0) reasons.push(`${choghadiya} Choghadiya — ${choghadiya === 'Amrit' ? 'highest nectar period' : 'auspicious period'}`);

        // 4. Tara Chakra boost
        score += taraBonus;
        if (taraBonus > 0) reasons.push(`Moon nakshatra in ${taraQuality} Tara today`);

        // 5. Inauspicious windows — heavy penalty
        const isRahuKaal = hourOfDay >= rahuKaalRange.start && hourOfDay < rahuKaalRange.end;
        const isYamaganda = hourOfDay >= yamagandaRange.start && hourOfDay < yamagandaRange.end;
        const isGulikaKaal = hourOfDay >= gulikaRange.start && hourOfDay < gulikaRange.end;

        if (isRahuKaal)  { score -= 10; reasons.push('⚠ Rahu Kaal — universally inauspicious'); }
        if (isYamaganda) { score -= 8;  reasons.push('⚠ Yamaganda — avoid new starts'); }
        if (isGulikaKaal){ score -= 6;  reasons.push('⚠ Gulika Kaal — mildly inauspicious'); }

        // 6. Prefer daytime hours (stronger)
        if (hourOfDay >= sunriseHour && hourOfDay < sunsetHour) {
            score += 1;
        }

        allHours.push({
            hourOfDay,
            startTime: formatHour(hourOfDay),
            endTime: formatHour((hourOfDay + 1) % 24),
            planet,
            score,
            choghadiya,
            isRahuKaal,
            isYamaganda,
            isGulikaKaal,
            reasons: reasons.filter(Boolean),
            activity: HORA_ACTIVITY[planet]?.best || 'General auspicious activities'
        });
    }

    // Sort all hours by score descending
    allHours.sort((a, b) => b.score - a.score);

    // Best hours: top 3 that are NOT inauspicious AND ideally in the future
    const goodHours = allHours.filter(h => !h.isRahuKaal && !h.isYamaganda && !h.isGulikaKaal);

    // Prefer future hours, then fall back to any good hours
    const futureGoodHours = goodHours.filter(h => h.hourOfDay >= currentHour);
    const rankedGood = futureGoodHours.length >= 3 ? futureGoodHours : goodHours;

    const top3 = rankedGood.slice(0, 3);
    const bestHour = top3[0] || allHours[0];

    // Inauspicious hours to show user (Rahu Kaal first, then Yamaganda)
    const avoidHours = allHours
        .filter(h => h.isRahuKaal || h.isYamaganda || h.isGulikaKaal)
        .sort((a, b) => {
            // Sort by severity: Rahu first, then Yamaganda, then Gulika
            const weight = (h: HoraSlot) => h.isRahuKaal ? 3 : h.isYamaganda ? 2 : 1;
            return weight(b) - weight(a);
        })
        .slice(0, 2);

    // Confidence
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (bestHour.score >= 8 && (bestHour.planet === lagnaLord || benefics.primary.includes(bestHour.planet))) {
        confidence = 'high';
    } else if (bestHour.score >= 4) {
        confidence = 'medium';
    } else {
        confidence = 'low';
    }

    return {
        bestHour,
        top3Hours: top3,
        avoidHours,
        lagnaLord,
        dashaLord,
        taraQuality,
        confidence,
        todayMoonNakshatra,
        sunriseHour,
        sunsetHour,
    };
}
