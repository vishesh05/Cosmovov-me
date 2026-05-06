import { BirthChartAnalysis, PlanetDetails, UserProfile, DashaPeriod } from '../types';
import { ZODIAC_SIGNS, RASHI_LORDS, calculateShadbala } from './astrologyEngine';
import { calculateAshtakvarga } from './ashtakvargaEngine';

export interface PathEvent {
  year: number;
  endYear: number;
  age: number;
  endAge: number;
  title: string;
  description: string;
  type: 'peak' | 'marriage' | 'child' | 'challenge' | 'neutral' | 'career';
  isPast?: boolean;
}

export interface LocalInsights {
  cosmicInsight: string;
  pathEvents: PathEvent[];
}

// ─── Constants & Configuration ───

const THEMES = {
    CAREER: { title: 'The Rise of Authority', type: 'career' as const, planets: ['Sun', 'Mars', 'Saturn'], houses: [1, 10] },
    UNION: { title: 'The Great Union', type: 'marriage' as const, planets: ['Venus', 'Jupiter'], houses: [7] },
    PROSPERITY: { title: 'Golden Era of Growth', type: 'peak' as const, planets: ['Jupiter', 'Mercury'], houses: [2, 11, 9] },
    TRANSFORMATION: { title: 'Spiritual Awakening', type: 'challenge' as const, planets: ['Saturn', 'Rahu', 'Ketu'], houses: [8, 12] },
    LEGACY: { title: 'Dharma & Destiny', type: 'neutral' as const, planets: ['Jupiter', 'Sun'], houses: [5, 9] }
};

// ─── Helper Functions ───

function getHouseLord(ascendant: string, houseNumber: number): string {
    const ascIdx = ZODIAC_SIGNS.indexOf(ascendant);
    if (ascIdx === -1) return 'Sun';
    const houseSignIdx = (ascIdx + houseNumber - 1) % 12;
    return RASHI_LORDS[houseSignIdx];
}

function getActiveLords(dashas: DashaPeriod[], date: Date): { md: string; ad: string } {
    let mdLord = '';
    let adLord = '';
    for (const md of dashas) {
        if (date >= new Date(md.startDate) && date <= new Date(md.endDate)) {
            mdLord = md.planet;
            for (const ad of md.subPeriods || []) {
                if (date >= new Date(ad.startDate) && date <= new Date(ad.endDate)) {
                    adLord = ad.planet;
                    break;
                }
            }
            break;
        }
    }
    return { md: mdLord, ad: adLord };
}

function generateEvocativeDescription(
    analysis: BirthChartAnalysis,
    md: string,
    ad: string,
    area: keyof typeof THEMES,
    score: number,
    ashtakvarga: any,
    shadbala: any[]
): string {
    const planet = ad || md;
    const pDetails = analysis.planetaryDetails.find(p => p.name === planet);
    const house = analysis.houses.find(h => h.planets.includes(planet))?.houseNumber || 1;
    
    let text = `As ${planet} activates your ${house}th house, `;

    if (area === 'CAREER') {
        text += `your professional authority reaches a zenith. The alignment of ${planet} suggests a period where your expertise is recognized by those in power. `;
    } else if (area === 'UNION') {
        text += `the cosmic promise of partnership illuminates your path. This is a destined window for deep emotional integration and soul-contract fulfillment. `;
    } else if (area === 'PROSPERITY') {
        text += `a cycle of material and spiritual abundance unfolds. Opportunities for wealth creation are grounded in your previous karmic efforts. `;
    } else {
        text += `you undergo a profound inner alchemy. This period challenges you to shed old identities to make room for your highest self. `;
    }

    if (score > 15) {
        text += `The exceptional strength of this alignment ensures that the results will be both legendary and transformative. `;
    }

    const pSignIdx = ZODIAC_SIGNS.indexOf(pDetails?.rashi || '');
    const sav = pSignIdx >= 0 ? ashtakvarga.sav[pSignIdx] : 28;
    if (sav > 32) {
        text += `The environment offers overwhelming support, with a high Ashtakavarga score paving the way for effortless success.`;
    }

    return text.trim();
}

// ─── Main Engine ───

export function generateLocalPredictions(analysis: BirthChartAnalysis, profile?: UserProfile): LocalInsights {
  const lagna = analysis.ascendant;
  const currentYear = new Date().getFullYear();
  let birthDate = new Date(currentYear - 25, 0, 1);
  if (profile?.date) {
    const d = new Date(profile.date);
    if (!isNaN(d.getTime())) birthDate = d;
  }
  const birthYear = birthDate.getFullYear();

  // Calculate support engines
  const ashtakvarga = calculateAshtakvarga(analysis.planetaryDetails, analysis.ascendant);
  let shadbala: any[] = [];
  if (profile) {
      try { shadbala = calculateShadbala(analysis, profile); } catch(e){}
  }

  // 1. Scoring Engine
  const scoreLifeAreaForYear = (area: keyof typeof THEMES, year: number): number => {
      const date = new Date(year, 6, 1); // Mid-year
      const { md, ad } = getActiveLords(analysis.dashas, date);
      if (!md) return 0;

      const theme = THEMES[area];
      const lords = theme.houses.map(h => getHouseLord(lagna, h));
      
      let score = 0;

      // Rule 1: Dasha Match
      if (theme.planets.includes(md) || lords.includes(md)) score += 10;
      if (theme.planets.includes(ad) || lords.includes(ad)) score += 5;

      // Rule 2: Planet Strengths
      const pDetails = analysis.planetaryDetails.find(p => p.name === ad || p.name === md);
      if (pDetails) {
          if (pDetails.dignity === 'exalted') score += 5;
          if (pDetails.dignity === 'debilitated') score -= 3;
          
          const pSignIdx = ZODIAC_SIGNS.indexOf(pDetails.rashi);
          const sav = pSignIdx >= 0 ? ashtakvarga.sav[pSignIdx] : 28;
          score += (sav - 28) / 2;

          const sb = shadbala.find(s => s.planet === pDetails.name)?.total || 300;
          score += (sb - 300) / 50;
      }

      return score;
  };

  // 2. Scan Lifetime for Peaks
  const allMilestones: PathEvent[] = [];
  const scannedAreas: (keyof typeof THEMES)[] = ['CAREER', 'UNION', 'PROSPERITY', 'TRANSFORMATION'];

  scannedAreas.forEach(area => {
      let areaScores: { year: number; score: number }[] = [];
      for (let y = birthYear + 18; y <= birthYear + 80; y++) {
          areaScores.push({ year: y, score: scoreLifeAreaForYear(area, y) });
      }

      // Find local peaks
      for (let i = 1; i < areaScores.length - 1; i++) {
          if (areaScores[i].score > areaScores[i-1].score && 
              areaScores[i].score > areaScores[i+1].score && 
              areaScores[i].score > 8) { // Minimum threshold
              
              const peak = areaScores[i];
              const theme = THEMES[area];
              const { md, ad } = getActiveLords(analysis.dashas, new Date(peak.year, 6, 1));

              allMilestones.push({
                  year: peak.year,
                  endYear: peak.year + 2,
                  age: peak.year - birthYear,
                  endAge: peak.year - birthYear + 2,
                  title: theme.title,
                  type: theme.type,
                  description: generateEvocativeDescription(analysis, md, ad, area, peak.score, ashtakvarga, shadbala),
                  isPast: peak.year < currentYear
              });
          }
      }
  });

  // 3. Filter and Deduplicate
  allMilestones.sort((a, b) => b.year - a.year); // Latest first for deduplication check

  const filtered: PathEvent[] = [];
  const usedYears = new Set<number>();

  // Prioritize distinct types and ensure spacing
  allMilestones.sort((a, b) => {
      // Prioritize past events if they are high score (to show accuracy)
      if (a.isPast && !b.isPast) return -1;
      if (!a.isPast && b.isPast) return 1;
      return b.year - a.year;
  });

  for (const m of allMilestones) {
      if (filtered.length >= 6) break;
      
      const tooClose = Array.from(usedYears).some(y => Math.abs(y - m.year) < 5);
      const typeExists = filtered.some(f => f.type === m.type && Math.abs(f.year - m.year) < 10);

      if (!tooClose && !typeExists) {
          filtered.push(m);
          usedYears.add(m.year);
      }
  }

  filtered.sort((a, b) => a.year - b.year);

  return {
    cosmicInsight: analysis.predictions?.lifePurpose || "A journey of profound karmic unfolding and professional ascent.",
    pathEvents: filtered
  };
}
