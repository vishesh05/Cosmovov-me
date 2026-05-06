
import { MakeTime, Body, GeoVector, Ecliptic, SiderealTime, Observer, SearchRiseSet } from "astronomy-engine";
import { HouseData, PlanetDetails, DivisionalChart, BirthChartAnalysis, DashaPeriod, ShadbalaResult, UserProfile } from "../types";

// --- Constants ---

export const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const RASHI_LORDS = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];

const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
    "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

export const HINDU_MONTHS = [
    "Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

// Vimshottari Constants
const VIMSHOTTARI_PLANETS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const VIMSHOTTARI_YEARS: { [key: string]: number } = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
};

// Combustion Limits (Degrees)
const COMBUSTION_LIMITS: { [key: string]: number } = {
    "Mercury": 14,
    "Venus": 10,
    "Mars": 17,
    "Jupiter": 11,
    "Saturn": 15
    // Sun, Moon, Rahu, Ketu are never combust (or NA)
};

// Exaltation and Debilitation Mapping (Sign Index 0-11)
const PLANET_DIGNITY: { [key: string]: { ex: number, deb: number } } = {
    "Sun": { ex: 0, deb: 6 },      // Aries, Libra
    "Moon": { ex: 1, deb: 7 },     // Taurus, Scorpio
    "Mars": { ex: 9, deb: 3 },     // Capricorn, Cancer
    "Mercury": { ex: 5, deb: 11 }, // Virgo, Pisces
    "Jupiter": { ex: 3, deb: 9 },  // Cancer, Capricorn
    "Venus": { ex: 11, deb: 5 },   // Pisces, Virgo
    "Saturn": { ex: 6, deb: 0 },   // Libra, Aries
    "Rahu": { ex: -1, deb: -1 },   // None
    "Ketu": { ex: -1, deb: -1 }    // None
};

const TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Purnima", // Shukla 1-15
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Amavasya" // Krishna 16-30
];

const YOGA_NAMES = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata",
    "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANA_NAMES = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];

// Lahiri (Chitrapaksha) Ayanamsa Constants
// Standard J2000 epoch: 2000 Jan 1 12:00:00 TT
const LAHIRI_J2000 = 23.85709222;
const PRECESSION_RATE = 1.3962944;

const PLANET_BODIES = {
    "Sun": Body.Sun,
    "Moon": Body.Moon,
    "Mercury": Body.Mercury,
    "Venus": Body.Venus,
    "Mars": Body.Mars,
    "Jupiter": Body.Jupiter,
    "Saturn": Body.Saturn,
    "Uranus": Body.Uranus,
    "Neptune": Body.Neptune,
    "Pluto": Body.Pluto,
};

// --- Helper Functions ---

function normalizeDegrees(d: number): number {
    let res = d % 360;
    if (res < 0) res += 360;
    return res;
}

// Calculate Manual Nutation in Longitude (Degrees)
// Sufficient for astrological precision without importing 'Nutation'
function getNutationInLongitude(T: number): number {
    // Longitude of Moon's Ascending Node
    const Omega = 125.04452 - 1934.136261 * T;
    // Mean Longitude of Sun
    const L = 280.4665 + 36000.7698 * T;

    const omegaRad = (Omega * Math.PI) / 180;
    const l2Rad = (2 * L * Math.PI) / 180;

    // Major terms: -17.2" sin(Omega) - 1.3" sin(2L)
    const dPsiArcSec = -17.20 * Math.sin(omegaRad) - 1.32 * Math.sin(l2Rad);

    return dPsiArcSec / 3600.0;
}

// True Lahiri Ayanamsa: Mean Ayanamsa + Nutation
function getTrueAyanamsa(T: number): number {
    const meanAyanamsa = LAHIRI_J2000 + (PRECESSION_RATE * T);
    const nutationLon = getNutationInLongitude(T);
    return meanAyanamsa + nutationLon;
}

function getMeanNodeTropical(T: number): number {
    const L = 125.04452222 - (1934.1362608 * T) + (0.0020708 * T * T) + (T * T * T / 450000);
    return normalizeDegrees(L);
}

// Formatting to DD° MM'
function formatDMS(deg: number): string {
    const d = Math.floor(deg);
    const mFloat = (deg - d) * 60;
    const m = Math.floor(mFloat);
    return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}'`;
}

function getTrueObliquity(T: number): number {
    return 23.4392911 - (0.0130042 * T) - (0.00000016 * T * T);
}

function calculateSiderealAscendant(dateObj: Date, lat: number, lon: number, ayanamsa: number, T: number): number {
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
    const astroTime = MakeTime(validDate);
    const gmst = SiderealTime(astroTime);
    const lstHours = gmst + (lon / 15.0);
    const ramc = normalizeDegrees(lstHours * 15.0) * (Math.PI / 180);
    const eps = getTrueObliquity(T) * (Math.PI / 180);
    const latRad = lat * (Math.PI / 180);
    const num = Math.cos(ramc);
    const den = -(Math.sin(ramc) * Math.cos(eps)) - (Math.tan(latRad) * Math.sin(eps));
    let ascRad = Math.atan2(num, den);
    let ascDeg = normalizeDegrees(ascRad * (180 / Math.PI));
    return normalizeDegrees(ascDeg - ayanamsa);
}

function isPlanetRetrograde(body: Body, currentAstroTime: any): boolean {
    const prevDate = currentAstroTime.date;
    const prevTimeJs = new Date(prevDate.getTime() - (60 * 60 * 1000));
    const prevAstroTime = MakeTime(prevTimeJs);

    const vec1 = GeoVector(body, currentAstroTime, true);
    const ecl1 = Ecliptic(vec1);

    const vec2 = GeoVector(body, prevAstroTime, true);
    const ecl2 = Ecliptic(vec2);

    let diff = ecl1.elon - ecl2.elon;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    return diff < 0;
}

// --- Derived Attribute Functions ---

function calculateCombustion(planetName: string, planetLon: number, sunLon: number): boolean {
    if (["Sun", "Moon", "Rahu", "Ketu"].includes(planetName)) return false;

    const limit = COMBUSTION_LIMITS[planetName];
    if (!limit) return false;

    let diff = Math.abs(sunLon - planetLon);
    if (diff > 180) diff = 360 - diff;

    return diff <= limit;
}

function calculateNakshatraSubLord(longitude: number, nakshatraLord: string): string {
    const NAKSHATRA_SPAN = 360 / 27; // 13.3333...
    const degreeInNakshatra = longitude % NAKSHATRA_SPAN;

    // Vimshottari Cycle: Total 120 years
    // The sub-lord sequence starts from the Nakshatra Lord itself
    const startPlanetIdx = VIMSHOTTARI_PLANETS.indexOf(nakshatraLord);

    let accumulatedSpan = 0;
    let subLord = nakshatraLord;

    for (let i = 0; i < 9; i++) {
        const planetIdx = (startPlanetIdx + i) % 9;
        const planetName = VIMSHOTTARI_PLANETS[planetIdx];
        const planetYears = VIMSHOTTARI_YEARS[planetName];

        // Sub-period span in degrees = (PlanetYears / 120) * NakshatraSpan
        const subSpan = (planetYears / 120.0) * NAKSHATRA_SPAN;

        if (degreeInNakshatra < (accumulatedSpan + subSpan)) {
            subLord = planetName;
            break;
        }
        accumulatedSpan += subSpan;
    }

    return subLord;
}


// --- New Exported Helper Functions for Transits/Panchang ---

export interface SimplePlanet {
    name: string;
    rashi: string;
    rashiIndex: number;
    degree: number;
    formatted: string;
    isRetro: boolean;
    nakshatra: string;
    longitude: number;
    isOuterPlanet?: boolean;
    westernRuledSign?: string;
}

export interface PanchangInfo {
    sunrise: string;
    sunset: string;
    tithi: string;
    tithiIndex: number; // 1-30
    yoga: string;
    karana: string;
    dayLord: string;
    nakshatra: string;
    moonSign: string;
    sunSign: string;
    amantaMonth: string;
    purnimantaMonth: string;
    vikramSamvat: number;
    paksha: string;
}

export function calculateCurrentPlanets(date: Date): SimplePlanet[] {
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const astroTime = MakeTime(validDate);
    const T = astroTime.ut / 36525.0;
    const ayanamsa = getTrueAyanamsa(T);

    const results: SimplePlanet[] = [];

    for (const [pName, pBody] of Object.entries(PLANET_BODIES)) {
        const vec = GeoVector(pBody, astroTime, true);
        const ecl = Ecliptic(vec);
        const siderealLon = normalizeDegrees(ecl.elon - ayanamsa);

        const rashiIndex = Math.floor(siderealLon / 30);
        const nakshatraIndex = Math.floor(siderealLon / (360 / 27));
        const isRetro = isPlanetRetrograde(pBody, astroTime);
        const degree = siderealLon % 30;

        results.push({
            name: pName,
            rashi: ZODIAC_SIGNS[rashiIndex],
            rashiIndex,
            degree: degree,
            formatted: formatDMS(degree),
            isRetro,
            nakshatra: NAKSHATRAS[nakshatraIndex],
            longitude: siderealLon
        });
    }

    // Nodes (Mean)
    const meanNode = getMeanNodeTropical(T);
    const rahuLon = normalizeDegrees(meanNode - ayanamsa);
    const ketuLon = normalizeDegrees(rahuLon + 180);

    [{ name: "Rahu", lon: rahuLon }, { name: "Ketu", lon: ketuLon }].forEach(node => {
        const idx = Math.floor(node.lon / 30);
        const nIdx = Math.floor(node.lon / (360 / 27));
        const degree = node.lon % 30;
        results.push({
            name: node.name,
            rashi: ZODIAC_SIGNS[idx],
            rashiIndex: idx,
            degree: degree,
            formatted: formatDMS(degree),
            isRetro: true,
            nakshatra: NAKSHATRAS[nIdx],
            longitude: node.lon
        });
    });

    return results;
}

export function getPanchangInfo(date: Date, lat: number, lon: number): PanchangInfo {
    // 1. Planetary Positions
    const planets = calculateCurrentPlanets(date);
    const sun = planets.find(p => p.name === 'Sun')!;
    const moon = planets.find(p => p.name === 'Moon')!;

    // 2. Sunrise / Sunset (Local)
    const observer = new Observer(lat, lon, 0);
    const riseTime = SearchRiseSet(Body.Sun, observer, +1, date, 1);
    const setTime = SearchRiseSet(Body.Sun, observer, -1, date, 1);

    const formatTime = (d: any) => {
        if (!d) return "--:--";
        // Convert to JS Date. Astronomy Engine returns object with .date which is Date object
        const jsDate = (d instanceof Date) ? d : (d.date ? new Date(d.date) : new Date());
        return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // 3. Tithi
    let diff = moon.longitude - sun.longitude;
    if (diff < 0) diff += 360;
    const tithiVal = diff / 12;
    const tithiIndex = Math.floor(tithiVal) + 1; // 1 to 30
    const tithiName = TITHI_NAMES[tithiIndex - 1] || "Unknown";
    const paksha = tithiIndex <= 15 ? "Shukla" : "Krishna";

    // 4. Yoga
    const sum = moon.longitude + sun.longitude;
    const yogaVal = sum / (360 / 27);
    const yogaIndex = Math.floor(yogaVal) % 27;
    const yogaName = YOGA_NAMES[yogaIndex];

    // 5. Karana
    // Simplified mapping based on tithi half
    const kNum = Math.floor(tithiVal * 2) + 1; // 1 to 60
    let karanaName = "";
    if (kNum === 1) karanaName = "Kimstughna";
    else if (kNum >= 58) {
        if (kNum === 58) karanaName = "Shakuni";
        if (kNum === 59) karanaName = "Chatushpada";
        if (kNum === 60) karanaName = "Naga";
    } else {
        const cycleIdx = (kNum - 2) % 7;
        karanaName = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"][cycleIdx];
    }

    // 6. Day Lord (Vaar)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayLord = days[date.getDay()];

    // 7. Months & Samvat
    // Amanta Month: Defined by New Moon in Zodiac. 
    // Approx: If Sun is in Pisces, next New Moon starts Chaitra. 
    // Simplified logic: Sun Sign Index 11 (Pisces) -> Chaitra (0)
    const amantaIndex = (sun.rashiIndex + 1) % 12;
    const amantaMonth = HINDU_MONTHS[amantaIndex];

    // Purnimanta Month: 
    // If Shukla Paksha: Same as Amanta.
    // If Krishna Paksha: Next Month.
    const purnimantaIndex = paksha === "Krishna" ? (amantaIndex + 1) % 12 : amantaIndex;
    const purnimantaMonth = HINDU_MONTHS[purnimantaIndex];

    const vikramSamvat = date.getFullYear() + 57;

    return {
        sunrise: formatTime(riseTime),
        sunset: formatTime(setTime),
        tithi: `${tithiName}`,
        tithiIndex,
        yoga: yogaName,
        karana: karanaName,
        dayLord,
        nakshatra: moon.nakshatra,
        moonSign: moon.rashi,
        sunSign: sun.rashi,
        amantaMonth,
        purnimantaMonth,
        vikramSamvat,
        paksha
    };
}


// --- Divisional Chart Logic ---

function getDivisionalSignIndex(division: number, d1Longitude: number): number {
    const d1SignIndex = Math.floor(d1Longitude / 30);
    const degreeInSign = d1Longitude % 30;
    const partIndex = Math.floor((degreeInSign * division) / 30);

    const isOdd = d1SignIndex % 2 === 0;
    const isMoveable = d1SignIndex % 3 === 0;
    const isFixed = d1SignIndex % 3 === 1;
    const isDual = d1SignIndex % 3 === 2;
    const element = d1SignIndex % 4;

    switch (division) {
        case 1: return d1SignIndex;
        case 2: return isOdd ? (partIndex === 0 ? 4 : 3) : (partIndex === 0 ? 3 : 4);
        case 3: return (d1SignIndex + (partIndex * 4)) % 12;
        case 4: return (d1SignIndex + (partIndex * 3)) % 12;
        case 5: return isOdd ? (0 + partIndex) % 12 : (6 + partIndex) % 12;
        case 6: return isOdd ? (0 + partIndex) % 12 : (6 + partIndex) % 12;
        case 7: return isOdd ? (d1SignIndex + partIndex) % 12 : (d1SignIndex + 6 + partIndex) % 12;
        case 8: return isMoveable ? (0 + partIndex) % 12 : isFixed ? (8 + partIndex) % 12 : (4 + partIndex) % 12;
        case 9: return isMoveable ? (d1SignIndex + partIndex) % 12 : isFixed ? (d1SignIndex + 8 + partIndex) % 12 : (d1SignIndex + 4 + partIndex) % 12;
        case 10: return isOdd ? (d1SignIndex + partIndex) % 12 : (d1SignIndex + 8 + partIndex) % 12;
        case 11: return ((d1SignIndex * 11) + partIndex) % 12;
        case 12: return (d1SignIndex + partIndex) % 12;
        case 16: return isMoveable ? (0 + partIndex) % 12 : isFixed ? (4 + partIndex) % 12 : (8 + partIndex) % 12;
        case 20: return isMoveable ? (0 + partIndex) % 12 : isFixed ? (8 + partIndex) % 12 : (4 + partIndex) % 12;
        case 24: return isOdd ? (4 + partIndex) % 12 : (3 + partIndex) % 12;
        case 27: return element === 0 ? (0 + partIndex) % 12 : element === 1 ? (3 + partIndex) % 12 : element === 2 ? (6 + partIndex) % 12 : (9 + partIndex) % 12;
        case 30:
            if (isOdd) {
                if (degreeInSign < 5) return 0;
                if (degreeInSign < 10) return 10;
                if (degreeInSign < 18) return 8;
                if (degreeInSign < 25) return 2;
                return 6;
            } else {
                if (degreeInSign < 5) return 1;
                if (degreeInSign < 12) return 5;
                if (degreeInSign < 20) return 11;
                if (degreeInSign < 25) return 9;
                return 7;
            }
        case 40: return isOdd ? (0 + partIndex) % 12 : (6 + partIndex) % 12;
        case 45: return isMoveable ? (0 + partIndex) % 12 : isFixed ? (4 + partIndex) % 12 : (8 + partIndex) % 12;
        case 60: return (d1SignIndex + partIndex) % 12;
        default: return d1SignIndex;
    }
}

export function calculateDivisionalChart(
    dName: string,
    division: number,
    d1Planets: { name: string, longitude: number }[],
    d1Ascendant: number
): DivisionalChart {
    const ascSignIndex = getDivisionalSignIndex(division, d1Ascendant);
    const ascSign = ZODIAC_SIGNS[ascSignIndex];
    const dPlanets: { [key: string]: { sign: string, longitude: number } } = {};
    const planetPositionsInHouses: { name: string, signIndex: number }[] = [];

    d1Planets.forEach(p => {
        const signIdx = getDivisionalSignIndex(division, p.longitude);
        dPlanets[p.name] = {
            sign: ZODIAC_SIGNS[signIdx],
            longitude: 0
        };
        planetPositionsInHouses.push({ name: p.name, signIndex: signIdx });
    });

    const houses: HouseData[] = [];
    for (let i = 0; i < 12; i++) {
        const currentSignIndex = (ascSignIndex + i) % 12;
        const currentSign = ZODIAC_SIGNS[currentSignIndex];
        const houseNum = i + 1;
        const planetsInThisHouse = planetPositionsInHouses
            .filter(p => p.signIndex === currentSignIndex)
            .map(p => p.name);
        houses.push({ houseNumber: houseNum, sign: currentSign, planets: planetsInThisHouse });
    }

    return { name: dName, ascendant: ascSign, houses, planets: dPlanets };
}

/**
 * Surya Kundli / Chandra Kundli Generator
 * Creates a chart where a specific planet's rashi becomes the 1st house.
 * All D1 planet positions are preserved — only the house numbering shifts.
 */
export function calculatePlanetBasedChart(
    chartName: string,
    planetName: string,
    d1Planets: { name: string, longitude: number }[]
): DivisionalChart {
    const planet = d1Planets.find(p => p.name === planetName);
    if (!planet) {
        // Fallback: return Aries-based empty chart
        return { name: chartName, ascendant: 'Aries', houses: [], planets: {} };
    }

    const planetSignIndex = Math.floor(normalizeDegrees(planet.longitude) / 30);
    const ascSign = ZODIAC_SIGNS[planetSignIndex];

    const dPlanets: { [key: string]: { sign: string, longitude: number } } = {};
    const planetPositionsInHouses: { name: string, signIndex: number }[] = [];

    d1Planets.forEach(p => {
        const signIdx = Math.floor(normalizeDegrees(p.longitude) / 30);
        dPlanets[p.name] = {
            sign: ZODIAC_SIGNS[signIdx],
            longitude: p.longitude
        };
        planetPositionsInHouses.push({ name: p.name, signIndex: signIdx });
    });

    const houses: HouseData[] = [];
    for (let i = 0; i < 12; i++) {
        const currentSignIndex = (planetSignIndex + i) % 12;
        const currentSign = ZODIAC_SIGNS[currentSignIndex];
        const houseNum = i + 1;
        const planetsInThisHouse = planetPositionsInHouses
            .filter(p => p.signIndex === currentSignIndex)
            .map(p => p.name);
        houses.push({ houseNumber: houseNum, sign: currentSign, planets: planetsInThisHouse });
    }

    return { name: chartName, ascendant: ascSign, houses, planets: dPlanets };
}

// --- Vimshottari Dasha Logic ---

function addTime(date: Date, years: number): Date {
    const ms = years * 365.2425 * 24 * 60 * 60 * 1000;
    return new Date(date.getTime() + ms);
}

function generateSubPeriods(
    parentPlanet: string,
    startDate: Date,
    parentDurationYears: number,
    level: number
): DashaPeriod[] {
    if (level > 3) return [];

    const subPeriods: DashaPeriod[] = [];
    let currentStart = new Date(startDate);

    let planetIdx = VIMSHOTTARI_PLANETS.indexOf(parentPlanet);

    for (let i = 0; i < 9; i++) {
        const pName = VIMSHOTTARI_PLANETS[planetIdx];
        const pYears = VIMSHOTTARI_YEARS[pName];

        const duration = (parentDurationYears * pYears) / 120;
        const endDate = addTime(currentStart, duration);

        subPeriods.push({
            planet: pName,
            startDate: currentStart.toISOString(),
            endDate: endDate.toISOString(),
            level: level,
            subPeriods: level < 3 ? generateSubPeriods(pName, currentStart, duration, level + 1) : []
        });

        currentStart = endDate;
        planetIdx = (planetIdx + 1) % 9;
    }
    return subPeriods;
}

function calculateDashas(moonLon: number, birthDate: Date): DashaPeriod[] {
    const NAKSHATRA_SPAN = 360 / 27;
    const nakshatraPos = moonLon / NAKSHATRA_SPAN;
    const nakshatraIndex = Math.floor(nakshatraPos);
    const fractionTraversed = nakshatraPos - nakshatraIndex;
    const fractionRemaining = 1.0 - fractionTraversed;

    const lordIndex = nakshatraIndex % 9;

    const startPlanet = NAKSHATRA_LORDS[lordIndex];
    const totalYears = VIMSHOTTARI_YEARS[startPlanet];
    const balanceYears = totalYears * fractionRemaining;

    const yearsPassed = totalYears - balanceYears;
    const firstDashaStartDate = addTime(birthDate, -yearsPassed);

    const dashas: DashaPeriod[] = [];
    let currentStart = firstDashaStartDate;
    let planetIdx = VIMSHOTTARI_PLANETS.indexOf(startPlanet);

    for (let i = 0; i < 9; i++) {
        const pName = VIMSHOTTARI_PLANETS[planetIdx];
        const pYears = VIMSHOTTARI_YEARS[pName];
        const endDate = addTime(currentStart, pYears);

        dashas.push({
            planet: pName,
            startDate: currentStart.toISOString(),
            endDate: endDate.toISOString(),
            level: 1,
            subPeriods: generateSubPeriods(pName, currentStart, pYears, 2)
        });

        currentStart = endDate;
        planetIdx = (planetIdx + 1) % 9;
    }

    return dashas;
}

// --- Shadbala Calculation (Tool Exclusive) ---

const NAISARGIKA_SCORES: { [key: string]: number } = {
    "Sun": 100, "Moon": 90, "Venus": 80, "Jupiter": 70, "Mercury": 60, "Mars": 50, "Saturn": 40
};

const PLANET_FRIENDSHIP_TABLE: { [key: string]: { [key: string]: number } } = {
    "Sun": { "Moon": 1, "Mars": 1, "Jupiter": 1, "Mercury": 0, "Venus": -1, "Saturn": -1 },
    "Moon": { "Sun": 1, "Mercury": 1, "Mars": 0, "Jupiter": 0, "Venus": 0, "Saturn": 0 },
    "Mars": { "Sun": 1, "Moon": 1, "Jupiter": 1, "Venus": 0, "Saturn": 0, "Mercury": -1 },
    "Mercury": { "Sun": 1, "Venus": 1, "Mars": 0, "Jupiter": 0, "Saturn": 0, "Moon": -1 },
    "Jupiter": { "Sun": 1, "Moon": 1, "Mars": 1, "Saturn": 0, "Mercury": -1, "Venus": -1 },
    "Venus": { "Mercury": 1, "Saturn": 1, "Mars": 0, "Jupiter": 0, "Sun": -1, "Moon": -1 },
    "Saturn": { "Mercury": 1, "Venus": 1, "Jupiter": 0, "Sun": -1, "Moon": -1, "Mars": -1 }
};

export function calculateShadbala(analysis: BirthChartAnalysis, profile: UserProfile): ShadbalaResult[] {
    const results: ShadbalaResult[] = [];
    const planets = analysis.planetaryDetails.filter(p => !p.isOuterPlanet && !['Rahu', 'Ketu', 'Ascendant'].includes(p.name));

    // Astro Data for Day/Night calculation
    let rawDate = profile.date || '';
    if (rawDate && /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(rawDate)) {
        const parts = rawDate.split(/[-/]/);
        rawDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const dateObj = new Date(`${rawDate}T${profile.time || '12:00'}:00`);
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

    const ascSignIdx = ZODIAC_SIGNS.indexOf(analysis.ascendant);
    const sunPlanet = analysis.planetaryDetails.find(p => p.name === 'Sun');

    // Day/Night Logic (Astrological)
    let isDay = true;
    if (sunPlanet) {
        const sunSignIdx = ZODIAC_SIGNS.indexOf(sunPlanet.rashi);
        // Houses 1-6 are roughly Night (Asc to Dsc), 7-12 Day.
        // House index (1-based) = (SunSign - AscSign + 12) % 12 + 1
        const sunHouse = ((sunSignIdx - ascSignIdx + 12) % 12) + 1;
        isDay = (sunHouse >= 7 && sunHouse <= 12);
    }

    const moonPlanet = analysis.planetaryDetails.find(p => p.name === 'Moon');
    const isWaxing = moonPlanet && sunPlanet ?
        normalizeDegrees(moonPlanet.longitude - sunPlanet.longitude) <= 180 : true;

    const dayOfWeek = validDate.getDay(); // 0=Sun, 1=Mon...
    const dayLords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const currentDayLord = dayLords[dayOfWeek];

    planets.forEach(p => {
        let sthana = 0, dig = 0, kala = 0, cheshta = 0, naisargika = 0, drik = 0;
        let sthanaText = "", digText = "", kalaText = "", cheshtaText = "", naisargikaText = "", drikText = "";

        // 1. Sthana Bala (Position)
        let signScore = 55; // Neutral
        let signType = "Neutral Sign";

        if (p.dignity === 'exalted') { signScore = 100; signType = "Exalted Sign"; }
        else if (p.dignity === 'debilitated') { signScore = 25; signType = "Debilitated Sign"; }
        else {
            const signIdx = ZODIAC_SIGNS.indexOf(p.rashi);
            const signLord = RASHI_LORDS[signIdx];
            if (signLord === p.name) { signScore = 85; signType = "Own Sign"; }
            else {
                const rel = PLANET_FRIENDSHIP_TABLE[p.name]?.[signLord];
                if (rel === 1) { signScore = 70; signType = "Friendly Sign"; }
                else if (rel === -1) { signScore = 40; signType = "Enemy Sign"; }
            }
        }

        sthanaText = `${signType} (${signScore} pts)`;

        // House Modifier
        let houseBonus = 0;
        const houseObj = analysis.houses.find(h => h.planets.includes(p.name));
        const houseNum = houseObj ? houseObj.houseNumber : 0;
        let houseType = "";

        if ([1, 4, 7, 10].includes(houseNum)) { houseBonus = 20; houseType = "Kendra"; }
        else if ([5, 9].includes(houseNum)) { houseBonus = 15; houseType = "Trikona"; }
        else if ([3, 6, 10, 11].includes(houseNum)) { houseBonus = 10; houseType = "Upachaya"; }

        if ([6, 8, 12].includes(houseNum)) {
            houseBonus = -10;
            houseType = "Dusthana";
            if ([3, 6, 10, 11].includes(houseNum)) houseType += "/Upachaya"; // Overlap handled by score logic, strictly applied
        }

        if (houseType) {
            sthanaText += ` + ${houseType} House Placement (${houseBonus > 0 ? '+' : ''}${houseBonus} pts).`;
        } else {
            sthanaText += ` + Neutral House Placement.`;
        }

        sthana = Math.min(100, Math.max(0, signScore + houseBonus));

        // 2. Dig Bala (Directional)
        let peakHouse = 1;
        let directionName = "East";
        if (['Sun', 'Mars'].includes(p.name)) { peakHouse = 10; directionName = "South (10th)"; }
        else if (['Moon', 'Venus'].includes(p.name)) { peakHouse = 4; directionName = "North (4th)"; }
        else if (['Saturn'].includes(p.name)) { peakHouse = 7; directionName = "West (7th)"; }
        // Merc/Jup default 1 (East)

        let dist = Math.abs(houseNum - peakHouse);
        if (dist > 6) dist = 12 - dist;
        dig = Math.max(0, 100 - (dist * (100 / 6)));

        digText = `${p.name} gains strength in ${directionName}. Located in House ${houseNum}, it is ${dist} houses away from its source of power.`;

        // 3. Kala Bala (Time)
        let kalaRaw = 50;
        kalaText = "Base Score (50). ";

        if (isDay) {
            if (['Sun', 'Jupiter', 'Venus'].includes(p.name)) { kalaRaw += 15; kalaText += "Born during Day (+15). "; }
        } else {
            if (['Moon', 'Mars', 'Saturn'].includes(p.name)) { kalaRaw += 15; kalaText += "Born during Night (+15). "; }
        }
        if (p.name === 'Mercury') { kalaRaw += 15; kalaText += "Mercury represents adaptability (+15). "; }

        if (p.name === 'Moon' && isWaxing) { kalaRaw += 10; kalaText += "Waxing Moon (+10). "; }
        if (p.name === currentDayLord) { kalaRaw += 10; kalaText += `Lord of the Weekday (${currentDayLord}) (+10).`; }

        kala = Math.min(100, kalaRaw);

        // 4. Cheshta Bala (Motion)
        if (p.isRetro) {
            cheshta = 100;
            cheshtaText = "Retrograde Motion indicates high internalized energy (+100).";
        } else {
            cheshta = 65;
            cheshtaText = "Direct (Normal) Motion (+65).";
        }

        // 5. Naisargika Bala (Natural)
        naisargika = NAISARGIKA_SCORES[p.name] || 50;
        const ranks = ["Saturn", "Mars", "Mercury", "Jupiter", "Venus", "Moon", "Sun"]; // Weakest to Strongest
        const rankIdx = ranks.indexOf(p.name) + 1;
        naisargikaText = `Fixed natural brightness. ${p.name} is rank #${rankIdx} in luminosity among 7 planets.`;

        // 6. Drik Bala (Aspects)
        const oppHouseNum = ((houseNum + 5) % 12) + 1;
        const oppHouse = analysis.houses.find(h => h.houseNumber === oppHouseNum);
        let drikRaw = 50;
        drikText = "Base Score (50). ";

        if (oppHouse && oppHouse.planets.length > 0) {
            const aspectors = [];
            oppHouse.planets.forEach(opName => {
                if (['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(opName)) {
                    drikRaw += 15;
                    aspectors.push(`${opName} (+15)`);
                }
                if (['Saturn', 'Mars', 'Sun'].includes(opName)) {
                    drikRaw -= 15;
                    aspectors.push(`${opName} (-15)`);
                }
            });
            if (aspectors.length) {
                drikText += `Aspects from 7th House: ${aspectors.join(', ')}.`;
            } else {
                drikText += "No major planetary aspects from opposition.";
            }
        } else {
            drikText += "No planets in 7th house (Opposition).";
        }

        drik = Math.min(100, Math.max(0, drikRaw));

        results.push({
            planet: p.name,
            total: sthana + dig + kala + cheshta + naisargika + drik,
            components: { sthana, dig, kala, cheshta, naisargika, drik },
            breakdowns: {
                sthana: sthanaText,
                dig: digText,
                kala: kalaText,
                cheshta: cheshtaText,
                naisargika: naisargikaText,
                drik: drikText
            }
        });
    });

    return results;
}

// --- Main Engine ---

export function calculateBirthChart(date: string, time: string, lat: number, lon: number, timezoneOffset: string): BirthChartAnalysis {
    // --- Normalize legacy date formats ---
    // Handles DD-MM-YYYY, DD/MM/YYYY, or any non-ISO format stored in DB
    let normalizedDate = date;
    if (date && /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(date)) {
        const parts = date.split(/[-/]/);
        normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    // Safety: ensure YYYY-MM-DD order (if someone passed YYYY/MM/DD using slashes)
    if (date && /^\d{4}[/]\d{1,2}[/]\d{1,2}$/.test(date)) {
        normalizedDate = date.replace(/\//g, '-');
    }

    // --- Normalize time ---
    // If time is empty (e.g., user skipped time entry), default to 12:00 noon.
    // An empty string produces an unparseable ISO date like "2000-06-15T:00+05:30"
    // causing new Date() to return Invalid Date → engine silently falls back to today's date.
    const safeTime = time && /^\d{1,2}:\d{2}$/.test(time.trim()) ? time.trim() : '12:00';

    let isoString = `${normalizedDate}T${safeTime}:00${timezoneOffset}`;
    if (!/^[+-]\d{2}:\d{2}$/.test(timezoneOffset)) {
        isoString = `${normalizedDate}T${safeTime}:00Z`;
    }
    const dateObj = new Date(isoString);
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
    const astroTime = MakeTime(validDate);
    const T = astroTime.ut / 36525.0;

    // Calculate True Lahiri Ayanamsa (Mean + Nutation)
    const ayanamsa = getTrueAyanamsa(T);

    const planetPositions = [];
    for (const [pName, pBody] of Object.entries(PLANET_BODIES)) {
        const vec = GeoVector(pBody, astroTime, true);
        const ecl = Ecliptic(vec);
        const siderealLon = normalizeDegrees(ecl.elon - ayanamsa);

        // Calculate Retrograde
        const isRetro = isPlanetRetrograde(pBody, astroTime);

        planetPositions.push({ name: pName, longitude: siderealLon, isRetro });
    }

    const meanNode = getMeanNodeTropical(T);
    const rahuLon = normalizeDegrees(meanNode - ayanamsa);
    const ketuLon = normalizeDegrees(rahuLon + 180);
    // Mean Nodes are always retrograde
    planetPositions.push({ name: "Rahu", longitude: rahuLon, isRetro: true });
    planetPositions.push({ name: "Ketu", longitude: ketuLon, isRetro: true });

    // Identify Sun Longitude for Combustion Calc
    const sunLon = planetPositions.find(p => p.name === "Sun")?.longitude || 0;

    const ascendantLon = calculateSiderealAscendant(validDate, lat, lon, ayanamsa, T);

    const planetaryDetails: PlanetDetails[] = planetPositions.map(p => {
        const normalizedLon = normalizeDegrees(p.longitude);
        const rashiIndex = Math.floor(normalizedLon / 30);
        const degreeInRashi = normalizedLon % 30;
        const nakshatraIndex = Math.floor(normalizedLon / (360 / 27));

        // Calculate Dignity
        let dignity: 'exalted' | 'debilitated' | 'normal' = 'normal';
        const rules = PLANET_DIGNITY[p.name];
        if (rules) {
            if (rules.ex === rashiIndex) dignity = 'exalted';
            else if (rules.deb === rashiIndex) dignity = 'debilitated';
        }

        const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex % 9];

        return {
            name: p.name,
            longitude: normalizedLon,
            rashi: ZODIAC_SIGNS[rashiIndex],
            degreeInRashi,
            formatted: formatDMS(degreeInRashi),
            rashiLord: RASHI_LORDS[rashiIndex],
            nakshatra: NAKSHATRAS[nakshatraIndex],
            nakshatraLord: nakshatraLord,
            nakshatraSubLord: calculateNakshatraSubLord(normalizedLon, nakshatraLord),
            pada: Math.floor((normalizedLon % (360 / 27)) / (360 / 108)) + 1,
            isRetro: p.isRetro,
            isCombust: calculateCombustion(p.name, normalizedLon, sunLon),
            dignity,
            isOuterPlanet: ['Uranus', 'Neptune', 'Pluto'].includes(p.name),
            westernRuledSign: p.name === 'Uranus' ? 'Aquarius' : p.name === 'Neptune' ? 'Pisces' : p.name === 'Pluto' ? 'Scorpio' : undefined
        };
    });

    const ascSignIndex = Math.floor(ascendantLon / 30);
    const ascSign = ZODIAC_SIGNS[ascSignIndex];
    const ascDegree = ascendantLon % 30;
    const ascNakIndex = Math.floor(ascendantLon / (360 / 27));
    const ascNakLord = NAKSHATRA_LORDS[ascNakIndex % 9];

    const ascDetails: PlanetDetails = {
        name: "Ascendant",
        longitude: ascendantLon,
        rashi: ascSign,
        degreeInRashi: ascDegree,
        formatted: formatDMS(ascDegree),
        rashiLord: RASHI_LORDS[ascSignIndex],
        nakshatra: NAKSHATRAS[ascNakIndex],
        nakshatraLord: ascNakLord,
        nakshatraSubLord: calculateNakshatraSubLord(ascendantLon, ascNakLord),
        pada: Math.floor((ascendantLon % (360 / 27)) / (360 / 108)) + 1,
        isRetro: false,
        isCombust: false,
        dignity: 'normal',
        isOuterPlanet: false
    };
    planetaryDetails.unshift(ascDetails);

    const d1Houses: HouseData[] = [];
    for (let i = 0; i < 12; i++) {
        const currentSignIndex = (ascSignIndex + i) % 12;
        const currentSign = ZODIAC_SIGNS[currentSignIndex];
        const planetsInHouse = planetPositions
            .filter(p => Math.floor(p.longitude / 30) === currentSignIndex)
            .map(p => p.name);
        d1Houses.push({ houseNumber: i + 1, sign: currentSign, planets: planetsInHouse });
    }

    const divisions = [
        { id: 'D1', div: 1 }, { id: 'D2', div: 2 }, { id: 'D3', div: 3 }, { id: 'D4', div: 4 },
        { id: 'D5', div: 5 }, { id: 'D6', div: 6 }, { id: 'D7', div: 7 }, { id: 'D8', div: 8 },
        { id: 'D9', div: 9 }, { id: 'D10', div: 10 }, { id: 'D11', div: 11 }, { id: 'D12', div: 12 },
        { id: 'D16', div: 16 }, { id: 'D20', div: 20 }, { id: 'D24', div: 24 }, { id: 'D27', div: 27 },
        { id: 'D30', div: 30 }, { id: 'D40', div: 40 }, { id: 'D45', div: 45 }, { id: 'D60', div: 60 },
    ];

    const divisionalCharts: { [key: string]: DivisionalChart } = {};
    divisions.forEach(d => {
        divisionalCharts[d.id] = calculateDivisionalChart(d.id, d.div, planetPositions, ascendantLon);
    });

    // Generate Sun Chart (Surya Kundli) and Moon Chart (Chandra Kundli)
    divisionalCharts['SUN'] = calculatePlanetBasedChart('Surya Kundli', 'Sun', planetPositions);
    divisionalCharts['MOON'] = calculatePlanetBasedChart('Chandra Kundli', 'Moon', planetPositions);

    const moon = planetaryDetails.find(p => p.name === 'Moon');
    const dashas = moon ? calculateDashas(moon.longitude, validDate) : [];

    return {
        ascendant: ascSign,
        moonSign: moon ? moon.rashi : '',
        nakshatra: moon ? moon.nakshatra : '',
        houses: d1Houses,
        planetaryDetails,
        divisionalCharts,
        dashas,
        predictions: { general: "", career: "", finance: "", health: "", love: "" },
        strengths: [],
        challenges: []
    };
}
