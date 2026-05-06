import { MakeTime, Body, GeoVector, Ecliptic } from "astronomy-engine";
import { PlanetDetails } from "../types";
import { SimplePlanet, ZODIAC_SIGNS, RASHI_LORDS } from "./astrologyEngine";

// --- Duplicated Helper Constants / Functions to avoid modifying astrologyEngine.ts ---
const PRECESSION_RATE = 1.3962944;
const LAHIRI_J2000 = 23.85709222;

const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
    "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const VIMSHOTTARI_PLANETS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const VIMSHOTTARI_YEARS: { [key: string]: number } = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
};

function normalizeDegrees(d: number): number {
    let res = d % 360;
    if (res < 0) res += 360;
    return res;
}

function getNutationInLongitude(T: number): number {
    const Omega = 125.04452 - 1934.136261 * T;
    const L = 280.4665 + 36000.7698 * T;
    const omegaRad = (Omega * Math.PI) / 180;
    const l2Rad = (2 * L * Math.PI) / 180;
    const dPsiArcSec = -17.20 * Math.sin(omegaRad) - 1.32 * Math.sin(l2Rad);
    return dPsiArcSec / 3600.0;
}

function getTrueAyanamsa(T: number): number {
    const meanAyanamsa = LAHIRI_J2000 + (PRECESSION_RATE * T);
    return meanAyanamsa + getNutationInLongitude(T);
}

function formatDMS(deg: number): string {
    const d = Math.floor(deg);
    const mFloat = (deg - d) * 60;
    const m = Math.floor(mFloat);
    return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}'`;
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

function calculateNakshatraSubLord(longitude: number, nakshatraLord: string): string {
    const NAKSHATRA_SPAN = 360 / 27;
    const degreeInNakshatra = longitude % NAKSHATRA_SPAN;
    const startPlanetIdx = VIMSHOTTARI_PLANETS.indexOf(nakshatraLord);
    let accumulatedSpan = 0;
    let subLord = nakshatraLord;

    for (let i = 0; i < 9; i++) {
        const planetIdx = (startPlanetIdx + i) % 9;
        const planetName = VIMSHOTTARI_PLANETS[planetIdx];
        const planetYears = VIMSHOTTARI_YEARS[planetName];
        const subSpan = (planetYears / 120.0) * NAKSHATRA_SPAN;

        if (degreeInNakshatra < (accumulatedSpan + subSpan)) {
            subLord = planetName;
            break;
        }
        accumulatedSpan += subSpan;
    }
    return subLord;
}

const OUTER_PLANETS = [
    { name: "Neptune", body: Body.Neptune, ruler: "Pisces" },
    { name: "Uranus", body: Body.Uranus, ruler: "Aquarius" },
    { name: "Pluto", body: Body.Pluto, ruler: "Scorpio" }
];

export function calculateOuterPlanetsDetails(date: Date): PlanetDetails[] {
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const astroTime = MakeTime(validDate);
    const T = astroTime.ut / 36525.0;
    const ayanamsa = getTrueAyanamsa(T);

    return OUTER_PLANETS.map(op => {
        const vec = GeoVector(op.body, astroTime, true);
        const ecl = Ecliptic(vec);
        const siderealLon = normalizeDegrees(ecl.elon - ayanamsa);
        
        const isRetro = isPlanetRetrograde(op.body, astroTime);
        const rashiIndex = Math.floor(siderealLon / 30);
        const degreeInRashi = siderealLon % 30;
        const nakshatraIndex = Math.floor(siderealLon / (360 / 27));
        const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex % 9];

        return {
            name: op.name,
            longitude: siderealLon,
            rashi: ZODIAC_SIGNS[rashiIndex],
            degreeInRashi,
            formatted: formatDMS(degreeInRashi),
            rashiLord: RASHI_LORDS[rashiIndex],
            nakshatra: NAKSHATRAS[nakshatraIndex],
            nakshatraLord: nakshatraLord,
            nakshatraSubLord: calculateNakshatraSubLord(siderealLon, nakshatraLord),
            pada: Math.floor((siderealLon % (360 / 27)) / (360 / 108)) + 1,
            isRetro,
            isCombust: false,
            dignity: 'normal',
            isOuterPlanet: true,
            westernRuledSign: op.ruler
        };
    });
}

export function calculateOuterPlanetsSimple(date: Date): SimplePlanet[] {
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const astroTime = MakeTime(validDate);
    const T = astroTime.ut / 36525.0;
    const ayanamsa = getTrueAyanamsa(T);

    return OUTER_PLANETS.map(op => {
        const vec = GeoVector(op.body, astroTime, true);
        const ecl = Ecliptic(vec);
        const siderealLon = normalizeDegrees(ecl.elon - ayanamsa);
        
        const isRetro = isPlanetRetrograde(op.body, astroTime);
        const rashiIndex = Math.floor(siderealLon / 30);
        const degree = siderealLon % 30;
        const nakshatraIndex = Math.floor(siderealLon / (360 / 27));

        return {
            name: op.name,
            rashi: ZODIAC_SIGNS[rashiIndex],
            rashiIndex,
            degree,
            formatted: formatDMS(degree),
            isRetro,
            nakshatra: NAKSHATRAS[nakshatraIndex],
            longitude: siderealLon,
            isOuterPlanet: true,
            westernRuledSign: op.ruler
        };
    });
}
