
import { MakeTime, Body, GeoVector, Ecliptic, SearchRiseSet, Observer } from "astronomy-engine";

// --- Constants ---
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const HINDU_MONTHS = [
  "Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", 
  "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", 
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", 
  "Trayodashi", "Chaturdashi", "Purnima", // Shukla
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", 
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", 
  "Trayodashi", "Chaturdashi", "Amavasya" // Krishna
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", 
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGA_NAMES = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", 
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", 
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", 
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANA_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];

// Constants for Lahiri Ayanamsa (J2000)
const LAHIRI_J2000 = 23.85709222;
const PRECESSION_RATE = 1.3962944; 

// --- Types ---

export interface PanchangDetailed {
    panchangDate: string;
    sunrise: string;
    sunset: string;
    tithi: string;
    tithiUpto: string;
    nakshatra: string;
    nakshatraUpto: string;
    yoga: string;
    yogaUpto: string;
    karana: string;
    karanaUpto: string;
    nextKarana: string;
    nextKaranaUpto: string;
    vaar: string;
    moonSign: string;
    moonSignUpto: string;
    sunSign: string;
    amantaMonth: string;
    purnimantaMonth: string;
    vikramSamvat: number;
    shakaSamvat: number;
    samvatName: string;
    pravishte: number;
    paksha: string;
}

// --- Math Helpers ---

function normalizeDegrees(d: number): number {
  let res = d % 360;
  if (res < 0) res += 360;
  return res;
}

function getAyanamsa(T: number): number {
  return LAHIRI_J2000 + (PRECESSION_RATE * T);
}

function getSiderealLongitude(body: Body, time: any): number {
    const T = time.ut / 36525.0;
    const ayanamsa = getAyanamsa(T);
    const vec = GeoVector(body, time, true);
    const ecl = Ecliptic(vec);
    return normalizeDegrees(ecl.elon - ayanamsa);
}

// Binary Search for Event Time
function findEventTime(
    startTime: Date, 
    endTime: Date, 
    measureFn: (t: any) => number,
    targetValue: number
): Date {
    let t1 = startTime.getTime();
    let t2 = endTime.getTime();
    let iter = 0;
    
    // Ensure startTime is a valid Date object for MakeTime
    const startAstro = MakeTime(new Date(startTime));
    const startVal = measureFn(startAstro);
    
    while (Math.abs(t2 - t1) > 1000 && iter < 25) { // ~1 sec precision
        const mid = (t1 + t2) / 2;
        const midDate = new Date(mid);
        const midAstro = MakeTime(midDate);
        let val = measureFn(midAstro);
        
        let adjustedVal = val;
        let adjustedTarget = targetValue;
        
        if (adjustedVal < startVal) adjustedVal += 360;
        if (adjustedTarget < startVal) adjustedTarget += 360;

        if (adjustedVal < adjustedTarget) {
            t1 = mid;
        } else {
            t2 = mid;
        }
        iter++;
    }
    return new Date(t2);
}

// --- Main Calculation ---

export function calculatePanchang(date: Date, lat: number, lon: number): PanchangDetailed {
    // Ensure input date is valid Date object
    const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    const astroTime = MakeTime(validDate);
    const next24h = new Date(validDate.getTime() + 1.2 * 24 * 60 * 60 * 1000); 
    
    // --- 1. Longitudes (Current Time - Preserved) ---
    const sunLon = getSiderealLongitude(Body.Sun, astroTime);
    const moonLon = getSiderealLongitude(Body.Moon, astroTime);

    // --- 2. Tithi (Current Time - Preserved) ---
    const diff = normalizeDegrees(moonLon - sunLon);
    const tithiVal = diff / 12;
    const tithiIndex = Math.floor(tithiVal) + 1; // 1-30
    const tithiName = TITHI_NAMES[tithiIndex - 1];
    const paksha = tithiIndex <= 15 ? "Shukla" : "Krishna";
    
    const tithiTarget = tithiIndex * 12;
    const tithiEnd = findEventTime(validDate, next24h, (t) => {
        const s = getSiderealLongitude(Body.Sun, t);
        const m = getSiderealLongitude(Body.Moon, t);
        return normalizeDegrees(m - s);
    }, tithiTarget);

    // --- 3. Nakshatra (Current Time - Preserved) ---
    const nakVal = moonLon / (360/27);
    const nakIndex = Math.floor(nakVal);
    const nakName = NAKSHATRAS[nakIndex];
    
    const nakTarget = (nakIndex + 1) * (360/27);
    const nakEnd = findEventTime(validDate, next24h, (t) => {
        return getSiderealLongitude(Body.Moon, t);
    }, nakTarget);

    // --- NEW: Calculate Local Sunrise for Yoga & Samvat ---
    const noonDate = new Date(validDate);
    noonDate.setHours(12, 0, 0, 0);
    const obs = new Observer(lat, lon, 0);
    // Find sunrise before noon (today's sunrise)
    const riseEvt = SearchRiseSet(Body.Sun, obs, -1, noonDate, 0);
    
    // Ensure we pass a proper Date object to MakeTime even if SearchRiseSet result format varies
    const sunriseDate = riseEvt ? new Date(riseEvt.date) : noonDate;
    const sunriseAstro = MakeTime(sunriseDate);
    
    // Calculate Positions at Sunrise
    const sunLonRise = getSiderealLongitude(Body.Sun, sunriseAstro);
    const moonLonRise = getSiderealLongitude(Body.Moon, sunriseAstro);

    // --- 4. Yoga (UPDATED to Sunrise Basis) ---
    // Calculated at Sunrise, End time scanned from Sunrise
    const sumRise = normalizeDegrees(sunLonRise + moonLonRise);
    const yogaVal = sumRise / (360/27);
    const yogaIndex = Math.floor(yogaVal);
    const yogaName = YOGA_NAMES[yogaIndex % 27];
    
    const yogaTarget = (yogaIndex + 1) * (360/27);
    const yogaEnd = findEventTime(sunriseDate, next24h, (t) => {
        const s = getSiderealLongitude(Body.Sun, t);
        const m = getSiderealLongitude(Body.Moon, t);
        return normalizeDegrees(s + m);
    }, yogaTarget);

    // --- 5. Karana (Current Time - Preserved) ---
    const karanaVal = diff / 6;
    const currentKIndex = Math.floor(karanaVal) + 1; // 1-60
    
    const getKaranaName = (k: number) => {
        if (k === 1) return "Kimstughna";
        if (k >= 58) {
            if (k === 58) return "Shakuni";
            if (k === 59) return "Chatushpada";
            if (k === 60) return "Naga";
        }
        return KARANA_MOVABLE[(k - 2) % 7];
    };
    
    const karanaName = getKaranaName(currentKIndex);
    const nextKaranaName = getKaranaName(currentKIndex + 1 > 60 ? 1 : currentKIndex + 1);
    
    const k1Target = currentKIndex * 6;
    const k1End = findEventTime(validDate, next24h, (t) => {
        const s = getSiderealLongitude(Body.Sun, t);
        const m = getSiderealLongitude(Body.Moon, t);
        return normalizeDegrees(m - s);
    }, k1Target);
    
    const k2Target = (currentKIndex + 1) * 6;
    const k2End = findEventTime(validDate, next24h, (t) => {
        const s = getSiderealLongitude(Body.Sun, t);
        const m = getSiderealLongitude(Body.Moon, t);
        return normalizeDegrees(m - s);
    }, k2Target);

    // --- 6. Samvat Logic (Drik Standard - Chaitra Shukla Pratipada) ---
    // Vikram Samvat increments at Chaitra Shukla Pratipada (Sunrise).
    // Shaka Samvat increments at same time.
    
    const gregorianYear = validDate.getFullYear();
    const monthIndex = validDate.getMonth(); // 0 = Jan, 11 = Dec

    // Default: Assume we are in the "main" part of the Gregorian year (Apr-Dec)
    // where Vikram = Greg + 57 and Shaka = Greg - 78
    let vikramSamvat = gregorianYear + 57;
    let shakaSamvat = gregorianYear - 78;

    let isBeforeNewYear = false;

    // 1. Jan & Feb are ALWAYS before Chaitra (New Year)
    if (monthIndex < 2) {
        isBeforeNewYear = true;
    } 
    // 2. May onwards are ALWAYS after Chaitra
    else if (monthIndex > 3) {
        isBeforeNewYear = false;
    }
    // 3. March & April: Transition Period (Check Sun & Moon)
    else {
        // New Year starts when Sun is in Pisces (330-360°) and Moon is Waxing (Shukla)
        // OR Sun has moved into Aries (0°+)
        
        // If Sun is in Aquarius (300-330°), we are definitely before Chaitra
        if (sunLonRise >= 300 && sunLonRise < 330) {
            isBeforeNewYear = true;
        } 
        // If Sun is in Pisces (330-360°), check Paksha
        else if (sunLonRise >= 330) {
            // If Moon is behind Sun or ahead by >180 (Krishna Paksha), 
            // we are in Phalguna (Old Year) or Chaitra Krishna (Old Year purnimanta)
            const diffRise = normalizeDegrees(moonLonRise - sunLonRise);
            if (diffRise > 180) { 
                isBeforeNewYear = true; 
            }
        }
        // If Sun is in Aries (0-30°), we are definitely in New Year (isBeforeNewYear = false)
    }

    if (isBeforeNewYear) {
        vikramSamvat -= 1;
        shakaSamvat -= 1;
    }
    
    const samvatNames = [
        "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri",
        "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrishapraj", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
        "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
        "Hemalamba", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava",
        "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala",
        "Pingala", "Kalayukta", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Kshaya"
    ];
    
    // Standard linear mapping (approximate for North/South consistency in apps)
    const samvatName = samvatNames[(vikramSamvat + 56) % 60] || "";

    // --- 7. Month & Signs (Current Time - Preserved) ---
    const sunSignIdx = Math.floor(sunLon / 30);
    const sunSign = ZODIAC_SIGNS[sunSignIdx];
    const moonSignIdx = Math.floor(moonLon / 30);
    const moonSign = ZODIAC_SIGNS[moonSignIdx];
    
    const moonSignTarget = (moonSignIdx + 1) * 30;
    const moonSignEnd = findEventTime(validDate, next24h, (t) => {
        return getSiderealLongitude(Body.Moon, t);
    }, moonSignTarget);

    const amantaIdx = (sunSignIdx + 1) % 12;
    const amantaMonth = HINDU_MONTHS[amantaIdx];
    const purnimantaIdx = paksha === "Krishna" ? (amantaIdx + 1) % 12 : amantaIdx;
    const purnimantaMonth = HINDU_MONTHS[purnimantaIdx];
    const pravishte = Math.floor(sunLon % 30) + 1;

    // --- 8. Sunrise/Sunset (Display only - Preserved) ---
    // Using original logic to preserve display consistency
    const rise = SearchRiseSet(Body.Sun, obs, +1, validDate, 1);
    const set = SearchRiseSet(Body.Sun, obs, -1, validDate, 1);

    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    
    const fmtTime = (d: any) => {
        if (!d) return "--:--";
        // Ensure d is treated as an object with date or a date itself
        const dt = (d instanceof Date) ? d : (d.date ? new Date(d.date) : new Date(d));
        if (isNaN(dt.getTime())) return "--:--";
        return dt.toLocaleTimeString('en-US', timeOpts);
    };

    return {
        panchangDate: validDate.toLocaleDateString('en-GB', dateOpts),
        sunrise: fmtTime(rise),
        sunset: fmtTime(set),
        tithi: `${tithiName} (${paksha})`,
        tithiUpto: fmtTime(tithiEnd),
        nakshatra: nakName,
        nakshatraUpto: fmtTime(nakEnd),
        yoga: yogaName,
        yogaUpto: fmtTime(yogaEnd),
        karana: karanaName,
        karanaUpto: fmtTime(k1End),
        nextKarana: nextKaranaName,
        nextKaranaUpto: fmtTime(k2End),
        vaar: validDate.toLocaleDateString('en-US', { weekday: 'long' }),
        moonSign: moonSign,
        moonSignUpto: fmtTime(moonSignEnd),
        sunSign: sunSign,
        amantaMonth,
        purnimantaMonth,
        vikramSamvat,
        shakaSamvat,
        samvatName,
        pravishte,
        paksha
    };
}
