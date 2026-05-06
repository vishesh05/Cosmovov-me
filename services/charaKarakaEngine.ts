import { PlanetDetails } from '../types';

export interface CharaKaraka {
  karakaPosition: number;
  karakaName: string;
  planetName: string;
  signDegree: number;
  effectiveDegree: number;
  planetSign: string;
  planetHouse: number;
  planetNakshatra: string;
}

export class CharaKarakaCalculator {
  static calculate(planets: PlanetDetails[], is8KarakaSystem: boolean = false): CharaKaraka[] {
    // Filter out outer planets immediately
    const filteredPlanets = planets.filter(p => !p.isOuterPlanet);

    // 7 Karakas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn.
    // 8 Karakas: Adds Rahu.
    const allowedPlanets = is8KarakaSystem 
        ? ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu']
        : ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    const candidates = filteredPlanets.filter(p => allowedPlanets.includes(p.name)).map(p => {
      const signDegree = p.longitude % 30;
      let effectiveDegree = signDegree;
      // If 8 Karaka system is selected add Rahu at its actual degree without adjustment"
      if (p.name === 'Rahu' && !is8KarakaSystem) {
        effectiveDegree = 30 - signDegree;
      }

      return {
        planetName: p.name,
        signDegree,
        effectiveDegree,
        planetSign: p.rashi,
        planetNakshatra: p.nakshatra,
        planetHouse: 0 
      };
    });

    candidates.sort((a, b) => b.effectiveDegree - a.effectiveDegree);

    const karakaNames7 = ['Atmakaraka', 'Amatyakaraka', 'Bhratrikaraka', 'Matrikaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka'];
    const karakaNames8 = ['Atmakaraka', 'Amatyakaraka', 'Bhratrikaraka', 'Matrikaraka', 'Pitrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka'];
    
    const names = is8KarakaSystem ? karakaNames8 : karakaNames7;

    const karakas: CharaKaraka[] = [];
    for (let i = 0; i < names.length; i++) {
        if (i < candidates.length) {
            karakas.push({
                karakaPosition: i + 1,
                karakaName: names[i],
                planetName: candidates[i].planetName,
                signDegree: candidates[i].signDegree,
                effectiveDegree: candidates[i].effectiveDegree,
                planetSign: candidates[i].planetSign,
                planetHouse: candidates[i].planetHouse,
                planetNakshatra: candidates[i].planetNakshatra
            });
        }
    }

    return karakas;
  }
}
