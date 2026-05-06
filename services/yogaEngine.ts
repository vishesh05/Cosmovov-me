import { BirthChartAnalysis, ShadbalaResult, YogaResult } from "../types";
import { ZODIAC_SIGNS, RASHI_LORDS } from "./astrologyEngine";

// --- Helpers ---

const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon']; // Simplified natural benefics

function getLordOfSign(sign: string): string {
    const idx = ZODIAC_SIGNS.indexOf(sign);
    return idx >= 0 ? RASHI_LORDS[idx] : '';
}

function getPlanetDetails(analysis: BirthChartAnalysis, planetName: string) {
    return analysis.planetaryDetails.find(p => p.name === planetName);
}

function getHouseOfPlanet(analysis: BirthChartAnalysis, planetName: string) {
    return analysis.houses.find(h => h.planets.includes(planetName));
}

function getLordOfHouse(analysis: BirthChartAnalysis, houseNum: number): string {
    const house = analysis.houses.find(h => h.houseNumber === houseNum);
    return house ? getLordOfSign(house.sign) : '';
}

function getPlanetHouseNum(analysis: BirthChartAnalysis, planetName: string): number {
    const h = getHouseOfPlanet(analysis, planetName);
    return h ? h.houseNumber : 0;
}

function isInKendra(houseNum: number): boolean {
    return [1, 4, 7, 10].includes(houseNum);
}

function isInTrikona(houseNum: number): boolean {
    return [1, 5, 9].includes(houseNum);
}

function isInDusthana(houseNum: number): boolean {
    return [6, 8, 12].includes(houseNum);
}

// Classical Aspect Check (Source aspects Target)
function hasAspect(source: string, target: string, analysis: BirthChartAnalysis): boolean {
    const h1 = getPlanetHouseNum(analysis, source);
    const h2 = getPlanetHouseNum(analysis, target);
    if (!h1 || !h2) return false;

    // Count houses from source to target (inclusive)
    let dist = (h2 - h1 + 12) % 12;
    if (dist === 0) dist = 12;

    // Conjunction is not technically an aspect in some contexts, but for "connection" it is.
    // Here we strictly check 'drishti' (glance) usually 7th, plus specials.
    if (dist === 1) return false; // Conjunction handled separately usually

    if (dist === 7) return true; // All planets aspect 7th
    if (source === 'Mars' && (dist === 4 || dist === 8)) return true;
    if (source === 'Jupiter' && (dist === 5 || dist === 9)) return true;
    if (source === 'Saturn' && (dist === 3 || dist === 10)) return true;
    
    return false;
}

function areConjunct(p1: string, p2: string, analysis: BirthChartAnalysis): boolean {
    return getPlanetHouseNum(analysis, p1) === getPlanetHouseNum(analysis, p2);
}

// --- Main Engine ---

export function calculateYogas(analysis: BirthChartAnalysis, shadbala: ShadbalaResult[]): YogaResult[] {
    const yogas: YogaResult[] = [];
    
    const getStrength = (pName: string) => {
        const s = shadbala.find(s => s.planet === pName);
        return s ? s.total : 350;
    };

    const getDashaStr = (planets: string[]) => `Active during ${planets.join('/')} Dasha.`;

    // 1. PANCHAMAHAPURUSHA YOGAS
    // Planet in Own/Exalted sign AND in Kendra from Lagna
    const mahaMap = [
        { p: 'Mars', name: 'Ruchaka Yoga', effect: 'courage, wealth, and command' },
        { p: 'Mercury', name: 'Bhadra Yoga', effect: 'intellect, speech, and wit' },
        { p: 'Jupiter', name: 'Hamsa Yoga', effect: 'wisdom, virtue, and purity' },
        { p: 'Venus', name: 'Malavya Yoga', effect: 'luxury, arts, and happiness' },
        { p: 'Saturn', name: 'Sasa Yoga', effect: 'authority, discipline, and leadership' }
    ];

    mahaMap.forEach(m => {
        const planet = getPlanetDetails(analysis, m.p);
        if (!planet) return;
        const houseNum = getPlanetHouseNum(analysis, m.p);
        
        const isOwn = getLordOfSign(planet.rashi) === m.p;
        const isExalted = planet.dignity === 'exalted';
        
        if ((isOwn || isExalted) && isInKendra(houseNum)) {
            yogas.push({
                id: m.name.toLowerCase().replace(' ', '_'),
                name: m.name,
                category: 'Mahapurusha',
                description: `Formed by ${m.p} in ${isExalted ? 'exaltation' : 'own sign'} in a Kendra (House ${houseNum}). Gives ${m.effect}.`,
                planets: [m.p],
                strength: getStrength(m.p) > 400 ? 'Strong' : 'Moderate',
                formationReason: `${m.p} is strong in a Kendra.`,
                strengthReason: getDashaStr([m.p]),
                lifeAreas: ['Personality', 'Career', 'Reputation']
            });
        }
    });

    // 2. RAJA YOGAS (Parasari)
    // Lords of Kendra (1,4,7,10) associating with Lords of Trikona (1,5,9)
    // Note: 1 is both Kendra and Trikona.
    const kendraLords = [1, 4, 7, 10].map(h => ({ h, lord: getLordOfHouse(analysis, h) })).filter(x => x.lord);
    const trikonaLords = [1, 5, 9].map(h => ({ h, lord: getLordOfHouse(analysis, h) })).filter(x => x.lord);

    // Track processed pairs to avoid duplicates
    const processedPairs = new Set<string>();

    kendraLords.forEach(k => {
        trikonaLords.forEach(t => {
            if (k.lord === t.lord) return; // Same planet owning both (Yogakaraka handled separately below)
            
            const pairKey = [k.lord, t.lord].sort().join('-');
            if (processedPairs.has(pairKey)) return;

            const isConjunct = areConjunct(k.lord, t.lord, analysis);
            const isMutualAspect = hasAspect(k.lord, t.lord, analysis) && hasAspect(t.lord, k.lord, analysis);
            const isExchange = getLordOfSign(getPlanetDetails(analysis, k.lord)?.rashi || '') === t.lord &&
                               getLordOfSign(getPlanetDetails(analysis, t.lord)?.rashi || '') === k.lord;

            if (isConjunct || isMutualAspect || isExchange) {
                processedPairs.add(pairKey);
                const type = isExchange ? "Parivartana" : isConjunct ? "Conjunction" : "Mutual Aspect";
                yogas.push({
                    id: `rajayoga_${pairKey}`,
                    name: 'Parasari Raja Yoga',
                    category: 'Raja',
                    description: `Union of Kendra Lord (${k.lord}, House ${k.h}) and Trikona Lord (${t.lord}, House ${t.h}). Brings success and status.`,
                    planets: [k.lord, t.lord],
                    strength: 'Strong',
                    formationReason: `Formed via ${type} between ${k.lord} and ${t.lord}.`,
                    strengthReason: getDashaStr([k.lord, t.lord]),
                    lifeAreas: ['Career', 'Power', 'Status']
                });
            }
        });
    });

    // Yogakaraka (Planet owning both Kendra and Trikona)
    // Example: Saturn for Libra Asc (4th and 5th)
    const planetsMap: {[key: string]: number[]} = {};
    analysis.houses.forEach(h => {
        const l = getLordOfSign(h.sign);
        if (!planetsMap[l]) planetsMap[l] = [];
        planetsMap[l].push(h.houseNumber);
    });

    Object.entries(planetsMap).forEach(([planet, housesOwned]) => {
        const ownsKendra = housesOwned.some(h => [1,4,7,10].includes(h));
        const ownsTrikona = housesOwned.some(h => [1,5,9].includes(h));
        if (ownsKendra && ownsTrikona) {
             yogas.push({
                id: `yogakaraka_${planet}`,
                name: `Yogakaraka (${planet})`,
                category: 'Raja',
                description: `${planet} rules both a Kendra and Trikona, becoming a singular force for success.`,
                planets: [planet],
                strength: 'Very Strong',
                formationReason: `${planet} owns houses ${housesOwned.join(' & ')}.`,
                strengthReason: getDashaStr([planet]),
                lifeAreas: ['Success', 'Luck', 'Career']
            });
        }
    });

    // 3. DHANA YOGAS (Wealth)
    // Connections between Lords of 2, 5, 9, 11 (and 1)
    const wealthHouses = [1, 2, 5, 9, 11];
    const wealthLords = wealthHouses.map(h => ({ h, lord: getLordOfHouse(analysis, h) })).filter(x => x.lord);
    
    // Check connections
    for (let i = 0; i < wealthLords.length; i++) {
        for (let j = i + 1; j < wealthLords.length; j++) {
            const l1 = wealthLords[i];
            const l2 = wealthLords[j];
            if (l1.lord === l2.lord) continue;

            // Check if l1 is in l2's house (of wealth) or vice versa (Exchange or Placement)
            // Or Conjunction
            const p1House = getPlanetHouseNum(analysis, l1.lord);
            const p2House = getPlanetHouseNum(analysis, l2.lord);
            
            const l1InWealth = wealthHouses.includes(p1House);
            const l2InWealth = wealthHouses.includes(p2House);
            
            if (areConjunct(l1.lord, l2.lord, analysis) && l1InWealth) {
                 yogas.push({
                    id: `dhana_${l1.lord}_${l2.lord}`,
                    name: 'Dhana Yoga',
                    category: 'Dhana',
                    description: `Wealth generating combination between lords of House ${l1.h} and ${l2.h}.`,
                    planets: [l1.lord, l2.lord],
                    strength: 'Strong',
                    formationReason: `Conjunction of ${l1.lord} and ${l2.lord} in House ${p1House}.`,
                    strengthReason: getDashaStr([l1.lord, l2.lord]),
                    lifeAreas: ['Wealth', 'Finance', 'Assets']
                });
            }
        }
    }

    // 4. VIPREET RAJA YOGA
    // Lords of 6, 8, 12 in 6, 8, 12 (but not in their own house if possible, though classic def allows it)
    const dusthana = [6, 8, 12];
    const dusthanaLords = dusthana.map(h => ({ h, lord: getLordOfHouse(analysis, h) }));
    
    dusthanaLords.forEach(item => {
        if (!item.lord) return;
        const pHouse = getPlanetHouseNum(analysis, item.lord);
        if (dusthana.includes(pHouse)) {
            // Check it's not own house (Sarala/Vimala/Harsha strictly imply moving to another Dusthana usually, but own sign is also a safeguard)
            // Classical texts vary. We will flag it.
            let yogaName = "";
            if (item.h === 6) yogaName = "Harsha Yoga";
            if (item.h === 8) yogaName = "Sarala Yoga";
            if (item.h === 12) yogaName = "Vimala Yoga";

            yogas.push({
                id: yogaName.toLowerCase().replace(' ', '_'),
                name: `${yogaName} (Vipreet)`,
                category: 'Vipreet',
                description: `Lord of ${item.h} (${item.lord}) is in House ${pHouse}. Reverses adversity into gain.`,
                planets: [item.lord],
                strength: 'Moderate',
                formationReason: `Dusthana lord placed in Dusthana.`,
                strengthReason: getDashaStr([item.lord]),
                lifeAreas: ['Obstacles', 'Unexpected Gains', 'Victory']
            });
        }
    });

    // 5. NEECHA BHANGA RAJA YOGA
    // Cancellation of Debilitation
    const debilitatedPlanets = analysis.planetaryDetails.filter(p => p.dignity === 'debilitated');
    debilitatedPlanets.forEach(p => {
        let isCancelled = false;
        let method = "";

        // 1. Lord of the sign where planet is debilitated is in Kendra from Lagna or Moon
        const signLord = getLordOfSign(p.rashi);
        const slHouseLagna = getPlanetHouseNum(analysis, signLord);
        // Calc house from Moon
        const moonHouse = getPlanetHouseNum(analysis, 'Moon');
        const slHouseMoon = ((slHouseLagna - moonHouse + 12) % 12) + 1;

        if (isInKendra(slHouseLagna) || isInKendra(slHouseMoon)) {
            isCancelled = true;
            method = `Sign lord ${signLord} is in Kendra.`;
        }

        // 2. Planet that gets exalted in this sign is in Kendra from Lagna/Moon
        // Ex: Sun deb in Libra. Saturn ex in Libra. Is Saturn in Kendra?
        const exMap: {[key:string]: string} = { 
            "Aries": "Sun", "Taurus": "Moon", "Cancer": "Jupiter", "Virgo": "Mercury", 
            "Libra": "Saturn", "Capricorn": "Mars", "Pisces": "Venus" 
        };
        const exPlanet = exMap[p.rashi];
        if (!isCancelled && exPlanet) {
            const exHouseLagna = getPlanetHouseNum(analysis, exPlanet);
            const exHouseMoon = ((exHouseLagna - moonHouse + 12) % 12) + 1;
            if (isInKendra(exHouseLagna) || isInKendra(exHouseMoon)) {
                isCancelled = true;
                method = `Exaltation lord ${exPlanet} is in Kendra.`;
            }
        }

        if (isCancelled) {
            yogas.push({
                id: `neechabhanga_${p.name}`,
                name: 'Neecha Bhanga Raja Yoga',
                category: 'Raja',
                description: `Debilitation of ${p.name} is cancelled, converting weakness into strength after struggle.`,
                planets: [p.name, signLord],
                strength: 'Strong',
                formationReason: `${p.name} is debilitated but ${method}`,
                strengthReason: getDashaStr([p.name]),
                lifeAreas: ['Resilience', 'Success after Failure']
            });
        }
    });

    // 6. CHANDRA YOGAS
    const moon = getPlanetDetails(analysis, 'Moon');
    if (moon) {
        const moonH = getPlanetHouseNum(analysis, 'Moon');
        
        // Gajakesari
        const jupH = getPlanetHouseNum(analysis, 'Jupiter');
        const relJup = ((jupH - moonH + 12) % 12) + 1;
        if ([1,4,7,10].includes(relJup)) {
             yogas.push({
                id: 'gajakesari',
                name: 'Gajakesari Yoga',
                category: 'Raja',
                description: 'Jupiter in Kendra from Moon. Gives lasting fame and virtue.',
                planets: ['Moon', 'Jupiter'],
                strength: 'Strong',
                formationReason: 'Jupiter in Kendra from Moon.',
                strengthReason: getDashaStr(['Moon', 'Jupiter']),
                lifeAreas: ['Fame', 'Reputation']
            });
        }

        // Sunapha, Anapha, Durdhara (Exclude Sun, Rahu, Ketu)
        const getPlanetsInRelHouse = (offset: number) => {
            const targetH = ((moonH + offset - 1) % 12) + 1;
            const hData = analysis.houses.find(h => h.houseNumber === targetH);
            if (!hData) return [];
            return hData.planets.filter(p => !['Sun', 'Rahu', 'Ketu', 'Moon'].includes(p));
        };

        const in2nd = getPlanetsInRelHouse(2); // 2nd from Moon
        const in12th = getPlanetsInRelHouse(12); // 12th from Moon

        if (in2nd.length > 0 && in12th.length > 0) {
            yogas.push({ id: 'durdhara', name: 'Durdhara Yoga', category: 'Moon', description: 'Planets in 2nd and 12th from Moon.', planets: ['Moon', ...in2nd, ...in12th], strength: 'Strong', formationReason: 'Moon flanked by planets.', strengthReason: getDashaStr(['Moon']), lifeAreas: ['Wealth', 'Comfort'] });
        } else if (in2nd.length > 0) {
            yogas.push({ id: 'sunapha', name: 'Sunapha Yoga', category: 'Moon', description: 'Planets in 2nd from Moon. Self-made wealth.', planets: ['Moon', ...in2nd], strength: 'Strong', formationReason: 'Planets in 2nd from Moon.', strengthReason: getDashaStr(['Moon']), lifeAreas: ['Wealth'] });
        } else if (in12th.length > 0) {
            yogas.push({ id: 'anapha', name: 'Anapha Yoga', category: 'Moon', description: 'Planets in 12th from Moon. Spiritual nature and composure.', planets: ['Moon', ...in12th], strength: 'Strong', formationReason: 'Planets in 12th from Moon.', strengthReason: getDashaStr(['Moon']), lifeAreas: ['Health', 'Spirituality'] });
        } else {
            // Kemadruma Check (No planets in 2 or 12, check Kendra)
            // Cancellation: Planets in Kendra from Lagna or Moon?
            const planetsInKendraFromMoon = [1,4,7,10].some(offset => getPlanetsInRelHouse(offset).length > 0);
            const planetsInKendraFromLagna = analysis.houses.filter(h => [1,4,7,10].includes(h.houseNumber)).some(h => h.planets.some(p => !['Sun','Rahu','Ketu','Moon'].includes(p)));
            
            if (planetsInKendraFromMoon || planetsInKendraFromLagna) {
                yogas.push({ id: 'kemadruma_cancelled', name: 'Kemadruma Yoga (Cancelled)', category: 'Moon', description: 'Isolation of Moon is cancelled by support in Kendras.', planets: ['Moon'], strength: 'Neutral', formationReason: 'No planets in 2/12 from Moon, but Kendras are occupied.', strengthReason: 'Cancellation active.', lifeAreas: ['Stability'] });
            } else {
                yogas.push({ id: 'kemadruma', name: 'Kemadruma Yoga', category: 'Moon', description: 'Solitary Moon without support. Mental unrest.', planets: ['Moon'], strength: 'Weak', formationReason: 'No planets in 2nd or 12th from Moon, nor in Kendras.', strengthReason: getDashaStr(['Moon']), lifeAreas: ['Mental Health'] });
            }
        }
    }

    // 7. DOSHAS & SPECIAL
    
    // Manglik Dosha
    const mars = getPlanetDetails(analysis, 'Mars');
    if (mars) {
        const lagnaMars = getPlanetHouseNum(analysis, 'Mars');
        // Standard: 1, 4, 7, 8, 12
        if ([1, 4, 7, 8, 12].includes(lagnaMars)) {
             yogas.push({
                id: 'manglik',
                name: 'Manglik Dosha',
                category: 'Dosha',
                description: 'Mars placement suggests intensity in relationships. (Kuya Dosha).',
                planets: ['Mars'],
                strength: 'Strong',
                formationReason: `Mars in House ${lagnaMars}.`,
                strengthReason: 'Active throughout life, specifically Mars dasha.',
                lifeAreas: ['Marriage', 'Temperament']
            });
        }
    }

    // Kala Sarpa Yoga
    // All 7 planets between Rahu and Ketu
    // 1. Get Longitudes
    const getLon = (n: string) => analysis.planetaryDetails.find(p => p.name === n)?.longitude || 0;
    const rahuLon = getLon('Rahu');
    const ketuLon = getLon('Ketu');
    const others = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    let allBetween = true;
    let type = ""; // "Kala Sarpa" or "Kala Amrita" (reversed) or "Partial"
    
    // Define arc Rahu -> Ketu (counter-clockwise)
    // Rahu is always retrograde, but longitudes are 0-360 static. 
    // Arc 1: Rahu to Ketu. Arc 2: Ketu to Rahu.
    // Usually Rahu/Ketu are 180 apart.
    // Check if ALL others are in Arc 1 OR ALL in Arc 2.
    
    // Normalize to start at 0 relative to Rahu
    const normalize = (l: number) => (l - rahuLon + 360) % 360;
    const kRel = normalize(ketuLon); // Should be ~180
    
    let inArc1 = 0; // 0 to kRel
    let inArc2 = 0; // kRel to 360
    
    others.forEach(p => {
        const l = normalize(getLon(p));
        if (l > 0 && l < kRel) inArc1++;
        else inArc2++;
    });

    if (inArc1 === 7) {
        yogas.push({ id: 'kala_sarpa', name: 'Kala Sarpa Yoga', category: 'Dosha', description: 'All planets hemmed between Rahu and Ketu. Intensity and struggle followed by rise.', planets: ['Rahu', 'Ketu'], strength: 'Strong', formationReason: 'Planets enclosed in one half of zodiac.', strengthReason: 'Rahu/Ketu Dasha', lifeAreas: ['Life Struggle', 'Destiny'] });
    } else if (inArc2 === 7) {
        yogas.push({ id: 'kala_amrita', name: 'Kala Amrita Yoga', category: 'Dosha', description: 'All planets hemmed between Ketu and Rahu. Spiritual progress through struggle.', planets: ['Rahu', 'Ketu'], strength: 'Strong', formationReason: 'Planets enclosed.', strengthReason: 'Rahu/Ketu Dasha', lifeAreas: ['Spirituality'] });
    }

    // 8. NABHASA YOGAS (Simplified)
    // Sankhya (Number of signs occupied by 7 planets)
    const signsOccupied = new Set(others.map(p => getPlanetDetails(analysis, p)?.rashi));
    const count = signsOccupied.size;
    const sankhyaNames = ["", "Gola", "Yuga", "Shula", "Kedara", "Pasha", "Damini", "Veena"]; // 1 to 7
    if (sankhyaNames[count]) {
         yogas.push({
            id: `sankhya_${count}`,
            name: `${sankhyaNames[count]} Yoga (Sankhya)`,
            category: 'Nabhasa',
            description: `7 planets occupy exactly ${count} signs.`,
            planets: [],
            strength: 'Fixed',
            formationReason: `Distribution of planets in ${count} signs.`,
            strengthReason: 'Lifelong',
            lifeAreas: ['General Fortune']
        });
    }

    return yogas;
}