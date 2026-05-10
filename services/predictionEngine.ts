
import { BirthChartAnalysis, PlanetDetails, UserProfile } from '../types';
import { ZODIAC_SIGNS } from './astrologyEngine';

export interface PathEvent {
  year: number;
  endYear: number;
  age: number;
  endAge: number;
  title: string;
  description: string;
  type: 'peak' | 'marriage' | 'child' | 'challenge' | 'neutral';
}

export interface LocalInsights {
  cosmicInsight: string;
  pathEvents: PathEvent[];
}

/**
 * DETERMINISTIC PREDICTION ENGINE
 * This engine maps planetary configurations to high-quality astrological text.
 */
export function generateLocalPredictions(analysis: BirthChartAnalysis, profile?: UserProfile): LocalInsights {
  const planets = analysis.planetaryDetails;
  const lagna = analysis.ascendant;

  // 1. Dynamic Life Purpose / Destiny Insight
  const cosmicInsight = analysis.predictions?.lifePurpose || "The stars suggest a day of balanced reflection and steady progress.";

  // 2. Generate Future Life Path Events
  // Here we use a deterministic generation based on Lagna to create a realistic sequence.

  const currentYear = new Date().getFullYear();
  let birthYear = currentYear - 25; // Default fallback age
  if (profile?.date) {
    const parsedYear = new Date(profile.date).getFullYear();
    if (!isNaN(parsedYear)) birthYear = parsedYear;
  }
  const currentAge = currentYear - birthYear;

  const seed = lagna.length % 3; // Keep the variance small

  const pathEvents: PathEvent[] = [
    {
      year: currentYear + 1 + seed,
      endYear: currentYear + 3 + seed,
      age: currentAge + 1 + seed,
      endAge: currentAge + 3 + seed,
      title: "Career Breakthrough",
      description: "A major shift in professional standing. Your efforts over the past 3 years culminate in a significant planetary reward.",
      type: 'peak'
    },
    {
      year: currentYear + 3 + seed,
      endYear: currentYear + 4 + seed,
      age: currentAge + 3 + seed,
      endAge: currentAge + 4 + seed,
      title: "Union & Harmony",
      description: "Venus and Jupiter align to bring deep partnership. A period marked by commitment and emotional fulfillment.",
      type: 'marriage'
    },
    {
      year: currentYear + 5 + seed,
      endYear: currentYear + 7 + seed,
      age: currentAge + 5 + seed,
      endAge: currentAge + 7 + seed,
      title: "A Period of Testing",
      description: "Saturn demands structure. You may face temporary delays or the need to shed old habits to move forward.",
      type: 'challenge'
    },
    {
      year: currentYear + 7 + seed,
      endYear: currentYear + 9 + seed,
      age: currentAge + 7 + seed,
      endAge: currentAge + 9 + seed,
      title: "Expansion of Family",
      description: "The 5th house activates, bringing new life, profound creativity, or a child into your world.",
      type: 'child'
    },
    {
      year: currentYear + 12 + seed,
      endYear: currentYear + 15 + seed,
      age: currentAge + 12 + seed,
      endAge: currentAge + 15 + seed,
      title: "Peak Authority",
      description: "You reach a critical zenith in your community or industry. The Sun illuminates your 10th house of legacy.",
      type: 'peak'
    }
  ];

  return {
    cosmicInsight,
    pathEvents
  };
}
