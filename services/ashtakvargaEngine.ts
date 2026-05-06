import { PlanetDetails } from '../types';
import { ZODIAC_SIGNS } from './astrologyEngine';

export interface AshtakvargaResult {
    bav: {
        Sun: number[];
        Moon: number[];
        Mars: number[];
        Mercury: number[];
        Jupiter: number[];
        Venus: number[];
        Saturn: number[];
    };
    sav: number[];
    totalPoints: number;
}

// Bindu contribution tables (Auspicious places from each planet)
// Format: [planet][reference] = array of house numbers (1-12) where bindus are given
const BINDU_TABLES: { [planet: string]: { [reference: string]: number[] } } = {
    Sun: {
        Sun: [1, 2, 4, 7, 8, 9, 10, 11],
        Moon: [3, 6, 10, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [3, 5, 6, 9, 10, 11, 12],
        Jupiter: [5, 6, 9, 11],
        Venus: [6, 7, 12],
        Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
        Lagna: [3, 4, 6, 10, 11, 12]
    },
    Moon: {
        Sun: [3, 6, 7, 8, 10, 11],
        Moon: [1, 3, 6, 7, 10, 11],
        Mars: [2, 3, 5, 6, 10, 11],
        Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
        Jupiter: [1, 4, 7, 8, 10, 11, 12],
        Venus: [3, 4, 5, 7, 9, 10, 11],
        Saturn: [3, 5, 6, 11],
        Lagna: [3, 6, 7, 8, 10, 11]
    },
    Mars: {
        Sun: [3, 5, 6, 10, 11],
        Moon: [3, 6, 11],
        Mars: [1, 2, 4, 7, 8, 10, 11],
        Mercury: [3, 5, 6, 11],
        Jupiter: [6, 10, 11, 12],
        Venus: [6, 8, 11, 12],
        Saturn: [1, 4, 7, 8, 9, 10, 11],
        Lagna: [1, 3, 6, 10, 11]
    },
    Mercury: {
        Sun: [5, 6, 9, 11, 12],
        Moon: [2, 4, 6, 8, 10, 11],
        Mars: [1, 2, 4, 7, 8, 9, 10, 11],
        Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
        Jupiter: [6, 8, 11, 12],
        Venus: [1, 2, 3, 4, 5, 8, 9, 11],
        Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
        Lagna: [1, 2, 4, 6, 8, 10, 11]
    },
    Jupiter: {
        Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
        Moon: [2, 5, 7, 9, 11],
        Mars: [1, 2, 4, 7, 8, 10, 11],
        Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
        Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
        Venus: [2, 5, 6, 9, 10, 11],
        Saturn: [3, 5, 6, 12],
        Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    Venus: {
        Sun: [8, 11, 12],
        Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
        Mars: [3, 4, 6, 9, 11, 12],
        Mercury: [3, 5, 6, 9, 11],
        Jupiter: [5, 8, 9, 10, 11],
        Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
        Saturn: [3, 4, 5, 8, 9, 10, 11],
        Lagna: [1, 2, 3, 4, 5, 8, 9, 11, 12]
    },
    Saturn: {
        Sun: [1, 2, 4, 7, 8, 10, 11],
        Moon: [3, 6, 11],
        Mars: [3, 5, 6, 10, 11, 12],
        Mercury: [6, 8, 9, 10, 11, 12],
        Jupiter: [5, 6, 11, 12],
        Venus: [6, 11, 12],
        Saturn: [3, 5, 6, 11],
        Lagna: [1, 3, 4, 6, 10, 11, 12]
    }
};

/**
 * Calculate Ashtakvarga for all planets
 */
export function calculateAshtakvarga(
    planetaryDetails: PlanetDetails[],
    ascendant: string
): AshtakvargaResult {
    // Filter out outer planets before processing
    const filteredDetails = planetaryDetails.filter(p => !p.isOuterPlanet);
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    // Get sign indices for all planets and lagna
    const planetPositions: { [key: string]: number } = {};
    filteredDetails.forEach(p => {
        if (planets.includes(p.name)) {
            planetPositions[p.name] = ZODIAC_SIGNS.indexOf(p.rashi);
        }
    });
    planetPositions['Lagna'] = ZODIAC_SIGNS.indexOf(ascendant);

    // Initialize BAV arrays (12 houses for each planet)
    const bav: any = {};
    planets.forEach(planet => {
        bav[planet] = new Array(12).fill(0);
    });

    // Calculate bindus for each planet
    planets.forEach(targetPlanet => {
        const targetPos = planetPositions[targetPlanet];

        // Check contributions from all reference points (7 planets + Lagna)
        const references = [...planets, 'Lagna'];
        references.forEach(refPlanet => {
            const refPos = planetPositions[refPlanet];
            if (refPos === undefined) return;

            // Get the bindu table for this target planet from this reference
            const binduHouses = BINDU_TABLES[targetPlanet]?.[refPlanet] || [];

            // For each house where bindus are given
            binduHouses.forEach(houseNum => {
                // Calculate which sign this house falls in, relative to reference planet
                const signIndex = (refPos + houseNum - 1) % 12;
                // Add a bindu to that sign in the target planet's BAV
                bav[targetPlanet][signIndex]++;
            });
        });
    });

    // Calculate SAV (sum of all BAVs)
    const sav = new Array(12).fill(0);
    planets.forEach(planet => {
        for (let i = 0; i < 12; i++) {
            sav[i] += bav[planet][i];
        }
    });

    const totalPoints = sav.reduce((sum, val) => sum + val, 0);

    return {
        bav,
        sav,
        totalPoints
    };
}
