import { BirthChartAnalysis, PlanetDetails } from '../types';
import { ZODIAC_SIGNS, RASHI_LORDS } from './astrologyEngine';

export interface ChartStrengthResult {
  chartKey: string;
  score: number;
  label: string;
  description: string;
  topPlanets: Array<{
    name: string;
    score: number;
    reason: string;
  }>;
}

// Basic Friendship (Naisargika Maitri) 
// 1=Friend, 0=Neutral, -1=Enemy
const FRIENDSHIP: { [key: string]: { [key: string]: number } } = {
  Sun: { Moon: 1, Mars: 1, Jupiter: 1, Mercury: 0, Venus: -1, Saturn: -1 },
  Moon: { Sun: 1, Mercury: 1, Mars: 0, Jupiter: 0, Venus: 0, Saturn: 0 },
  Mars: { Sun: 1, Moon: 1, Jupiter: 1, Venus: 0, Saturn: 0, Mercury: -1 },
  Mercury: { Sun: 1, Venus: 1, Mars: 0, Jupiter: 0, Saturn: 0, Moon: -1 },
  Jupiter: { Sun: 1, Moon: 1, Mars: 1, Saturn: 0, Mercury: -1, Venus: -1 },
  Venus: { Mercury: 1, Saturn: 1, Mars: 0, Jupiter: 0, Sun: -1, Moon: -1 },
  Saturn: { Mercury: 1, Venus: 1, Jupiter: 0, Sun: -1, Moon: -1, Mars: -1 }
};

const PLANET_EXALTATION: { [key: string]: { ex: string, deb: string } } = {
  Sun: { ex: 'Aries', deb: 'Libra' },
  Moon: { ex: 'Taurus', deb: 'Scorpio' },
  Mars: { ex: 'Capricorn', deb: 'Cancer' },
  Mercury: { ex: 'Virgo', deb: 'Pisces' },
  Jupiter: { ex: 'Cancer', deb: 'Capricorn' },
  Venus: { ex: 'Pisces', deb: 'Virgo' },
  Saturn: { ex: 'Libra', deb: 'Aries' }
};

// Interpretation Helper
function getStrengthLabel(score: number): { label: string, desc: string } {
  if (score >= 80) return { label: "Sovereign Power", desc: "Extraordinary strength capable of world-changing impact." };
  if (score >= 65) return { label: "Elite Potency", desc: "Highly auspicious alignment indicating great success." };
  if (score >= 50) return { label: "Strong & Stable", desc: "Well-positioned with solid capacity to deliver results." };
  if (score >= 35) return { label: "Moderate", desc: "Balanced influence requiring some effort to activate." };
  return { label: "Developing", desc: "Areas requiring remedy and conscious strengthening." };
}

/**
 * Calculates detailed strength for ANY divisional chart (D1, D9, D10 etc)
 * Includes: Dignity, Friendship, House, Aspects, Conjunctions (via D1 proxy), Degree Avastha.
 */
export function calculateDivisionalStrength(analysis: BirthChartAnalysis, chartKey: string = 'D1'): ChartStrengthResult {
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  let totalScore = 0;
  const planetScores: { [key: string]: { score: number, reasons: string[] } } = {};

  // 1. Get Chart Data
  let chartPlanets: { [key: string]: { sign: string, longitude?: number } } = {}; // Longitude needed for Aspects
  let chartAscendant = '';

  // Helper to parse longitude if available (D1 has it, D-charts might not have explicit longitude in `divisionalCharts` object without update)
  // For now, we simulate aspect logic based on Signs (Whole Sign Aspects) which is standard for D-Charts.

  if (chartKey === 'D1') {
    chartAscendant = analysis.ascendant;
    analysis.planetaryDetails.forEach(p => {
      chartPlanets[p.name] = { sign: p.rashi, longitude: p.degreeInRashi }; // Use degree in rashi
    });
  } else {
    const dChart = analysis.divisionalCharts[chartKey];
    if (!dChart) return { chartKey, score: 0, label: "Unknown", description: "No Data", topPlanets: [] };
    chartAscendant = dChart.ascendant;
    Object.entries(dChart.planets).forEach(([name, data]) => {
      chartPlanets[name] = { sign: data.sign, longitude: 15 }; // Default to mid-sign if no exact lon for D-charts
    });
  }

  const ascIndex = ZODIAC_SIGNS.indexOf(chartAscendant);

  // 2. Iterate Planets
  planets.forEach(pName => {
    const pData = chartPlanets[pName];
    if (!pData) return;

    const sign = pData.sign;
    const signIndex = ZODIAC_SIGNS.indexOf(sign);
    const signLord = RASHI_LORDS[signIndex];

    let score = 0;
    const reasons: string[] = [];

    // A. Dignity (Positional)
    const dignityRules = PLANET_EXALTATION[pName];
    if (dignityRules.ex === sign) {
      score += 100;
      reasons.push('Exalted (Ucca)');
    } else if (dignityRules.deb === sign) {
      score += 0;
      reasons.push('Debilitated (Neecha)');
    } else if (signLord === pName) {
      score += 80;
      reasons.push('Own Sign (Swakshetra)');
    } else {
      // B. Friendship (Maitri)
      const relation = FRIENDSHIP[pName][signLord];
      if (relation === 1) {
        score += 60;
        reasons.push('Friendly Sign (Mitra)');
      } else if (relation === -1) {
        score += 20;
        reasons.push('Enemy Sign (Shatru)');
      } else {
        score += 40;
        reasons.push('Neutral Sign (Sama)');
      }
    }

    // C. House Placement (Bhava)
    const houseNum = ((signIndex - ascIndex + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(houseNum)) {
      score += 20;
      reasons.push('Kendra (Center)');
    } else if ([5, 9].includes(houseNum)) {
      score += 15;
      reasons.push('Trikona (Trine)');
    } else if ([6, 8, 12].includes(houseNum)) {
      score -= 10;
      reasons.push('Dusthana (Difficult)');
    } else if ([3, 11].includes(houseNum)) {
      score += 10;
      reasons.push('Upachaya (Growing)');
    }

    // D. Aspects (Drishti) - Simplified Whole Sign Logic
    // Check if any malefic (Saturn/Mars) aspects this sign
    planets.forEach(otherPlanet => {
      if (otherPlanet === pName) return;
      const otherSign = chartPlanets[otherPlanet]?.sign;
      if (!otherSign) return;
      const otherSignIndex = ZODIAC_SIGNS.indexOf(otherSign);
      const dist = (signIndex - otherSignIndex + 12) % 12; // 0=Same, 6=Opposite

      // Conjunction
      if (dist === 0) {
        // Sun Conjunction = Combustion (Unless Sun is the planet)
        if (otherPlanet === 'Sun') {
          score -= 15;
          reasons.push('Combust (Sun Yuti)');
        } else {
          // Check friendship
          const rel = FRIENDSHIP[pName][otherPlanet] || 0;
          if (rel === -1) score -= 5;
          if (rel === 1) score += 5;
        }
      }

      // Opposition (7th aspect - All planets)
      if (dist === 6) {
        if (['Saturn', 'Mars', 'Sun'].includes(otherPlanet)) {
          score -= 10; // Malefic Aspect
        } else if (['Jupiter', 'Venus'].includes(otherPlanet)) {
          score += 10; // Benefic Aspect
          reasons.push(`Aspect of ${otherPlanet}`);
        }
      }

      // Special Aspects
      // Mars: 4, 8
      if (otherPlanet === 'Mars' && (dist === 3 || dist === 7)) { // 4th house is dist 3
        score -= 10;
      }
      // Saturn: 3, 10
      if (otherPlanet === 'Saturn' && (dist === 2 || dist === 9)) {
        score -= 15; // Saturn aspect is harsh
      }
      // Jupiter: 5, 9
      if (otherPlanet === 'Jupiter' && (dist === 4 || dist === 8)) {
        score += 15; // Jupiter grace
        reasons.push('Jupiter Aspect');
      }
    });

    // E. Physical Modifiers (D1 Only Proxy)
    const d1Info = analysis.planetaryDetails.find(pd => pd.name === pName);
    if (d1Info) {
      if (d1Info.isRetro) {
        score += 15;
        reasons.push('Retrograde (Chesta)');
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(150, score));

    totalScore += score;
    planetScores[pName] = { score, reasons };
  });

  // 3. Normalize Total
  // 100% = 7 planets * 100 pts approx (Average 'Good' planet is 60-70)
  // Max potential is closer to 900. 
  // We want 50% to be "Average". 
  // Let's normalize against 750 (so 375 is 50%).
  const finalPercent = Math.min(100, Math.round((totalScore / 750) * 100));

  const interpretation = getStrengthLabel(finalPercent);

  // 4. Sort Top Planets
  const topPlanets = Object.entries(planetScores)
    .map(([name, data]) => ({
      name,
      score: data.score,
      reason: data.reasons[0] || 'Stable Position'
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    chartKey,
    score: finalPercent,
    label: interpretation.label,
    description: interpretation.desc,
    topPlanets
  };
}
