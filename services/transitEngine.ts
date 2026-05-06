import { calculateCurrentPlanets, ZODIAC_SIGNS } from './astrologyEngine';
import { calculateOuterPlanetsSimple } from './outerPlanetCalculations';
import { HouseData } from '../types';

export interface TransitPlanet {
  name: string;
  sign: string;
  degree: number;
  formattedDegree: string;
  house: number;
  isRetro: boolean;
  nakshatra: string;
  pada: number;
  isCombust: boolean;
  dignity: 'exalted' | 'debilitated' | 'own' | 'normal';
  fullDegree: number;
  isOuterPlanet?: boolean;
}

// Combustion Limits (Degrees) from standard Vedic astronomy
const COMBUSTION_LIMITS: { [key: string]: number } = {
  "Mercury": 14, "Venus": 10, "Mars": 17, "Jupiter": 11, "Saturn": 15
};

// Exaltation and Debilitation Mapping (Sign Index)
const PLANET_RULES: { [key: string]: { ex: number, deb: number, own: number[] } } = {
    "Sun": { ex: 0, deb: 6, own: [4] },      
    "Moon": { ex: 1, deb: 7, own: [3] },     
    "Mars": { ex: 9, deb: 3, own: [0, 7] },  
    "Mercury": { ex: 5, deb: 11, own: [2, 5] }, 
    "Jupiter": { ex: 3, deb: 9, own: [8, 11] }, 
    "Venus": { ex: 11, deb: 5, own: [1, 6] },   
    "Saturn": { ex: 6, deb: 0, own: [9, 10] },  
    "Rahu": { ex: -1, deb: -1, own: [] },
    "Ketu": { ex: -1, deb: -1, own: [] }
};

export function calculateTransits(date: Date, natalLagna: string): TransitPlanet[] {
  // Use existing core astronomy engine for raw positions
  const currentPlanets = calculateCurrentPlanets(date);
  const allPlanets = [...currentPlanets];
  
  const lagnaIndex = ZODIAC_SIGNS.indexOf(natalLagna);
  
  // Find Sun for combustion check
  const currentSun = allPlanets.find(p => p.name === 'Sun');
  const sunLon = currentSun ? currentSun.longitude : 0;

  const sortOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];

  return allPlanets
    .filter(p => sortOrder.includes(p.name))
    .sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name))
    .map(p => {
      // Calculate House (Whole Sign relative to Natal Lagna)
      const house = ((p.rashiIndex - lagnaIndex + 12) % 12) + 1;

      // Calculate Pada (1-4)
      const pada = Math.floor((p.longitude % (360/27)) / (360/108)) + 1;

      // Calculate Combustion
      let isCombust = false;
      if (['Mars','Mercury','Jupiter','Venus','Saturn'].includes(p.name)) {
          let diff = Math.abs(sunLon - p.longitude);
          if (diff > 180) diff = 360 - diff;
          if (diff <= (COMBUSTION_LIMITS[p.name] || 0)) isCombust = true;
      }

      // Calculate Dignity
      let dignity: 'exalted' | 'debilitated' | 'own' | 'normal' = 'normal';
      const rules = PLANET_RULES[p.name];
      if (rules) {
          if (rules.ex === p.rashiIndex) dignity = 'exalted';
          else if (rules.deb === p.rashiIndex) dignity = 'debilitated';
          else if (rules.own.includes(p.rashiIndex)) dignity = 'own';
      }

      return {
        name: p.name,
        sign: p.rashi,
        degree: p.degree,
        formattedDegree: p.formatted,
        house: house,
        isRetro: p.isRetro,
        nakshatra: p.nakshatra,
        pada,
        isCombust,
        dignity,
        fullDegree: p.longitude,
        isOuterPlanet: p.isOuterPlanet
      };
    });
}

export function generateTransitHouseData(transits: TransitPlanet[], natalLagna: string): HouseData[] {
    const lagnaIndex = ZODIAC_SIGNS.indexOf(natalLagna);
    const houses: HouseData[] = [];
    
    for (let i = 0; i < 12; i++) {
        const signIndex = (lagnaIndex + i) % 12;
        const houseNum = i + 1;
        const planetsInHouse = transits
            .filter(t => t.house === houseNum)
            .map(t => t.name);
            
        houses.push({
            houseNumber: houseNum,
            sign: ZODIAC_SIGNS[signIndex],
            planets: planetsInHouse
        });
    }
    return houses;
}
