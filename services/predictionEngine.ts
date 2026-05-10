
import { BirthChartAnalysis, PlanetDetails, UserProfile, DashaPeriod, ShadbalaResult } from '../types';
import { calculateShadbala, ZODIAC_SIGNS, RASHI_LORDS } from './astrologyEngine';
import { fetchGroqJSON, fetchGroqText, getCurrentDashaChain } from './geminiService';

export interface PathEvent {
  year: number;
  endYear: number;
  age: number;
  endAge: number;
  title: string;
  description: string;
  type: 'peak' | 'marriage' | 'child' | 'challenge' | 'spiritual' | 'neutral';
  dashaActive?: string;
  cosmicFocus?: string;
  years?: string;
}

export interface LocalInsights {
  cosmicInsight: string;
  pathEvents: PathEvent[];
}

// --- Helper: Extract upcoming Dasha sequence ---

function getUpcomingDashaLords(dashas: DashaPeriod[], count: number = 3): string[] {
    const now = new Date();
    const lords: string[] = [];
    let foundCurrent = false;

    for (const d of dashas) {
        if (new Date(d.endDate) >= now) {
            if (!foundCurrent) {
                foundCurrent = true;
                // Skip the current one, we want the NEXT ones
                continue;
            }
            lords.push(d.planet);
            if (lords.length >= count) break;
        }
    }
    return lords;
}

function getCurrentMahaDasha(dashas: DashaPeriod[]): { lord: string, endDate: string } {
    const now = new Date();
    for (const d of dashas) {
        if (new Date(d.startDate) <= now && new Date(d.endDate) >= now) {
            return { lord: d.planet, endDate: d.endDate.split('T')[0] };
        }
    }
    return { lord: '?', endDate: '?' };
}

// --- Helper: Build planet strength summary ---

function buildPlanetStrengthSummary(analysis: BirthChartAnalysis, profile: UserProfile): string {
    try {
        const shadbala = calculateShadbala(analysis, profile);
        if (!shadbala || shadbala.length === 0) return 'Shadbala data unavailable';

        const sorted = [...shadbala].sort((a, b) => b.total - a.total);
        const strongest = sorted.slice(0, 3).map(s => `${s.planet}(${s.total})`).join(', ');
        const weakest = sorted.slice(-2).map(s => `${s.planet}(${s.total})`).join(', ');
        return `Strongest: ${strongest}. Weakest: ${weakest}`;
    } catch {
        return 'Shadbala data unavailable';
    }
}

// --- Helper: Build house summary ---

function buildHouseSummary(analysis: BirthChartAnalysis): string {
    const keyHouses = [1, 5, 7, 9, 10, 12];
    return keyHouses.map(num => {
        const h = analysis.houses.find(h => h.houseNumber === num);
        if (!h) return '';
        const planets = h.planets.length > 0 ? h.planets.join(',') : 'empty';
        return `H${num}(${h.sign}): ${planets}`;
    }).filter(Boolean).join('; ');
}

// --- Helper: Get Sun sign from analysis ---

function getSunSign(analysis: BirthChartAnalysis): string {
    const sun = analysis.planetaryDetails.find(p => p.name === 'Sun');
    return sun?.rashi || 'Unknown';
}

// --- Helper: Find the relevant planet for a given milestone ---

export function getRelevantPlanetForMilestone(
    event: PathEvent,
    analysis: BirthChartAnalysis
): { planet: string, sign: string, house: number, strength: string } {
    const typeMap: { [key: string]: string[] } = {
        peak: ['Sun', 'Saturn', 'Jupiter'],
        marriage: ['Venus', 'Jupiter', 'Mars'],
        child: ['Jupiter', 'Moon', 'Venus'],
        challenge: ['Saturn', 'Rahu', 'Mars'],
        spiritual: ['Ketu', 'Jupiter', 'Moon'],
        neutral: ['Moon', 'Jupiter', 'Sun']
    };

    const candidates = typeMap[event.type] || ['Moon'];
    for (const pName of candidates) {
        const p = analysis.planetaryDetails.find(pl => pl.name === pName);
        if (p) {
            const h = analysis.houses.find(h => h.planets.includes(pName));
            return {
                planet: pName,
                sign: p.rashi,
                house: h?.houseNumber || 0,
                strength: p.dignity === 'exalted' ? 'Strong (Exalted)' :
                          p.dignity === 'debilitated' ? 'Weak (Debilitated)' : 'Moderate'
            };
        }
    }
    return { planet: 'Moon', sign: 'Unknown', house: 0, strength: 'Moderate' };
}


// ============================================================
// PROMPT 1 — AI MILESTONE GENERATION
// Called once during chart load. Generates 5 karmic milestones.
// ============================================================

export async function generateAIPathMilestones(
    analysis: BirthChartAnalysis,
    profile: UserProfile
): Promise<LocalInsights> {

    const cosmicInsight = analysis.predictions?.lifePurpose ||
        "The stars suggest a day of balanced reflection and steady progress.";

    const currentYear = new Date().getFullYear();
    let birthYear = currentYear - 25;
    if (profile?.date) {
        const parsedYear = new Date(profile.date).getFullYear();
        if (!isNaN(parsedYear)) birthYear = parsedYear;
    }
    const currentAge = currentYear - birthYear;

    // Extract chart data for the prompt
    const mahaDasha = getCurrentMahaDasha(analysis.dashas);
    const nextDashaLords = getUpcomingDashaLords(analysis.dashas, 3);
    const planetStrength = buildPlanetStrengthSummary(analysis, profile);
    const houseSummary = buildHouseSummary(analysis);
    const sunSign = getSunSign(analysis);

    const systemPrompt = `You are a Vedic astrology prediction engine. Your only job is to output a JSON array of exactly 5 life milestones for this person's Path timeline. No preamble. No explanation. JSON only.`;

    const userPrompt = `Generate a personalized karmic timeline for this person based on their Vedic birth chart.

CHART DATA:
Ascendant: ${analysis.ascendant}
Moon Sign: ${analysis.moonSign || 'Unknown'}
Sun Sign: ${sunSign}
Active Maha Dasha: ${mahaDasha.lord} (ends ${mahaDasha.endDate})
Upcoming Dasha Sequence: ${nextDashaLords.join(', ') || 'Unknown'}
Planet Strengths (Shadbala): ${planetStrength}
Key Houses: ${houseSummary}
Current Age: ${currentAge}
Life Purpose (AI generated): ${cosmicInsight}

MILESTONE RULES:
- Generate exactly 5 milestones in chronological order
- Each milestone must be one of these types: peak | marriage | child | challenge | spiritual
- The TYPE must be chosen based on actual chart data:
  * peak → only if 10th house is strong or current/next Dasha lord rules 10th
  * marriage → only if Venus is strong OR 7th house is occupied OR Dasha lord rules 7th
  * child → only if 5th house has planets OR Jupiter is strong. If 5th house is empty and Jupiter is weak, replace with spiritual
  * challenge → always include one. Place it where Dasha lord is debilitated or Saturn/Rahu period is active
  * spiritual → include if Ketu Dasha is upcoming or 12th house is strong
- Timing must use actual Dasha periods — not hardcoded offsets
- Age ranges must be realistic based on current age ${currentAge}
- Title must be 2-3 words maximum
- Description must be exactly 2 sentences. Warm, personal, specific to their chart. No jargon without explanation.

OUTPUT FORMAT (strict JSON array, nothing else):
[
  {
    "type": "peak",
    "title": "Career Ascent",
    "ageRange": "29-31",
    "years": "2026-2028",
    "dashaActive": "Jupiter-Mercury",
    "cosmicFocus": "Professional recognition and authority",
    "description": "Jupiter opening your 10th house during this period creates a genuine window for leadership and public recognition. This is the time to step forward, not wait."
  }
]`;

    try {
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY || process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                response_format: { type: "json_object" },
                max_completion_tokens: 500
            })
        });

        if (!res.ok) throw new Error("Groq API Error: " + res.statusText);
        const data = await res.json();
        const raw = JSON.parse(data.choices[0].message.content);

        // Handle both { milestones: [...] } and direct array
        const milestones: any[] = Array.isArray(raw) ? raw : (raw.milestones || raw.events || raw.timeline || []);

        if (milestones.length >= 5) {
            const pathEvents: PathEvent[] = milestones.slice(0, 5).map((m: any) => {
                const ageRange = (m.ageRange || '').split('-').map(Number);
                const yearRange = (m.years || '').split('-').map(Number);
                return {
                    year: yearRange[0] || currentYear + 1,
                    endYear: yearRange[1] || currentYear + 3,
                    age: ageRange[0] || currentAge + 1,
                    endAge: ageRange[1] || currentAge + 3,
                    title: m.title || 'Cosmic Shift',
                    description: m.description || 'A significant period of transformation approaches.',
                    type: (['peak', 'marriage', 'child', 'challenge', 'spiritual'].includes(m.type) ? m.type : 'neutral') as PathEvent['type'],
                    dashaActive: m.dashaActive || '',
                    cosmicFocus: m.cosmicFocus || '',
                    years: m.years || ''
                };
            });

            return { cosmicInsight, pathEvents };
        }
    } catch (e) {
        console.warn("AI Path milestone generation failed, using fallback.", e);
    }

    // Fallback to deterministic milestones
    return generateFallbackMilestones(analysis, profile, cosmicInsight, currentAge, currentYear);
}


// ============================================================
// PROMPT 2 — COSMIC INSIGHT MODAL
// Called when user taps a node on the timeline.
// ============================================================

export async function generateModalInsight(
    event: PathEvent,
    analysis: BirthChartAnalysis,
    profile: UserProfile
): Promise<string> {

    const relevant = getRelevantPlanetForMilestone(event, analysis);
    const cosmicInsight = analysis.predictions?.lifePurpose || '';

    const systemPrompt = `You are Jyoti, a warm Vedic astrologer. The user just tapped on a milestone in their life Path timeline. Write a short, personal, emotionally resonant description of what this phase of their life means. Plain prose only. No bullet points. No headers. No markdown. Maximum 80 words.`;

    const userPrompt = `The user tapped on this milestone in their Path:

Milestone Type: ${event.type}
Title: ${event.title}
Age Range: ${event.age}-${event.endAge}
Years: ${event.years || `${event.year}-${event.endYear}`}
Active Dasha: ${event.dashaActive || 'Unknown'}
Cosmic Focus: ${event.cosmicFocus || 'General growth'}

Their chart context:
Ascendant: ${analysis.ascendant}
Relevant planet for this milestone: ${relevant.planet} in ${relevant.sign} (${relevant.house}th house)
Planet strength: ${relevant.strength}
Life Purpose: ${cosmicInsight}

Write 2 short paragraphs:
Paragraph 1 — What this phase actually feels like from the inside. What shifts. What becomes possible. Make it personal to their chart — not generic.
Paragraph 2 — One practical thing to lean into during this period and one thing to be patient about. End with one soft question that makes them want to reflect.

Maximum 80 words total. Warm. Direct. No jargon without translation.`;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY || process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_completion_tokens: 200,
                temperature: 0.7
            })
        });

        if (!res.ok) throw new Error("Groq API Error: " + res.statusText);
        const data = await res.json();
        const text = data.choices[0].message.content;
        if (text && text.length > 20) return text.trim();
    } catch (e) {
        console.warn("Modal insight generation failed.", e);
    }

    return event.description; // Fallback to the static description
}


// ============================================================
// FALLBACK — Deterministic milestones (original logic)
// ============================================================

function generateFallbackMilestones(
    analysis: BirthChartAnalysis,
    profile: UserProfile | undefined,
    cosmicInsight: string,
    currentAge: number,
    currentYear: number
): LocalInsights {
    const seed = analysis.ascendant.length % 3;

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

    return { cosmicInsight, pathEvents };
}


// Keep legacy sync function for backward compat (no longer primary)
export function generateLocalPredictions(analysis: BirthChartAnalysis, profile?: UserProfile): LocalInsights {
    const cosmicInsight = analysis.predictions?.lifePurpose || "The stars suggest a day of balanced reflection and steady progress.";
    const currentYear = new Date().getFullYear();
    let birthYear = currentYear - 25;
    if (profile?.date) {
        const parsedYear = new Date(profile.date).getFullYear();
        if (!isNaN(parsedYear)) birthYear = parsedYear;
    }
    const currentAge = currentYear - birthYear;

    return generateFallbackMilestones(analysis, profile, cosmicInsight, currentAge, currentYear);
}
