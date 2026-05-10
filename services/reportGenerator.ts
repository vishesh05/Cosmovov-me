import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- TOONS Parser ---
// Format:
// key: value
// key: value
// ---
// key: value
// key: value

export function parseToons(text: string): any[] {
  try {
    if (!text) return [];
    
    // Remove markdown code blocks if AI wrapped the output
    let cleanText = text.replace(/```[a-z]*\n/gi, '').replace(/```/g, '').trim();
    
    const blocks = cleanText.split(/---|\*\*\*/); // Support both --- and *** separators
    
    return blocks.map(block => {
      const lines = block.split('\n');
      const obj: any = {};
      let hasData = false;
      
      lines.forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim().replace(/['"]/g, '');
          const value = line.substring(colonIdx + 1).trim().replace(/['"]/g, '');
          if (key && value) {
            obj[key] = value;
            hasData = true;
          }
        }
      });
      
      return hasData ? obj : null;
    }).filter(obj => obj !== null);
  } catch (e) {
    console.error("Failed to parse TOONS format", e);
    return [];
  }
}

// --- Common API Wrapper ---
const SYSTEM_PREFIX = `You are a highly revered, profoundly insightful Vedic Astrologer possessing deep mastery of ancient Jyotish shastras (BPHS, Jaimini, Tajika). Your tone must be authoritative yet intensely spiritual, empowering, deeply mystical, and explicitly Indian/Vedic in nature.
You NEVER use markdown formatting (no bold **, no italics, no bullet points).
You must provide EXTREMELY DETAILED, premium-tier insights. Users have paid for this deeply profound reading, so you must justify that value with multi-layered analysis, using Sanskrit astrological terminology (like Karma, Dharma, Graha, Yoga, Dosha, Nakshatra) naturally but interwoven with profound modern clarity.

CRITICAL REQUIREMENT: You MUST ONLY return data in the strict TOONS format exactly as requested.`;

async function generateToonsBlock(prompt: string, maxTokens: number = 150): Promise<string> {
  const fullPrompt = `${SYSTEM_PREFIX}\n\n${prompt}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        maxOutputTokens: maxTokens,
        temperature: 0.7
      }
    });
    return response.text || '';
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    throw error;
  }
}

// ==========================================
// LIFE REPORT
// ==========================================

export async function generateLifeSectionCosmicIdentity(ascendant: string, moonSign: string, sunSign: string, atmakaraka: string): Promise<string> {
    const prompt = `
Data:
Ascendant: ${ascendant}
Moon Sign: ${moonSign}
Sun Sign: ${sunSign}
Atmakaraka (Soul Planet): ${atmakaraka}

Task: In 3 short sentences describe this person's core identity, inner emotional world, outer personality, and soul purpose based on these four pillars. Keep under 70 words. Do NOT use TOONS format for this one, just return normal paragraph text.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateLifeSectionLifePath(ascendantLordHouse: string, ninthHouseSign: string, ninthLordHouse: string, atmakaraka: string): Promise<string> {
    const prompt = `
Data:
Ascendant Lord is in the ${ascendantLordHouse} house.
9th House Sign is ${ninthHouseSign} and its Lord is in the ${ninthLordHouse} house.
Atmakaraka: ${atmakaraka}

Task: In 75 words describe this person's life purpose, dharmic path, and what they are here to achieve in this lifetime. Do NOT use TOONS format, just return normal paragraph text.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateLifeSectionStrengths(topPlanets: any[]): Promise<any[]> {
    const planetsStr = topPlanets.map(p => `${p.name} (Score: ${p.score})`).join(', ');
    const prompt = `
Data:
Top 3 planets by Ashtakvarga score: ${planetsStr}

Task:
Return in TOONS format with 3 blocks separated by ---.
Each block must include exactly:
planetName: (Name of planet)
strengthTitle: (max 3 words)
description: (max 15 words describing one life strength)`;
    
    const text = await generateToonsBlock(prompt, 150);
    return parseToons(text);
}

export async function generateLifeSectionChallenges(bottomPlanets: any[]): Promise<any[]> {
    const planetsStr = bottomPlanets.map(p => `${p.name} (Score: ${p.score})`).join(', ');
    const prompt = `
Data:
Bottom 2 planets by Ashtakvarga score: ${planetsStr}

Task:
Return in TOONS format with 2 blocks separated by ---.
Each block must include exactly:
planetName: (Name of planet)
challengeTitle: (max 3 words)
description: (max 15 words framed as a growth opportunity)`;
    
    const text = await generateToonsBlock(prompt, 150);
    return parseToons(text);
}

export async function generateLifeSectionDasha(mahadasha: string, antardasha: string, endDate: string): Promise<string> {
    const prompt = `
Data:
Current Mahadasha: ${mahadasha}
Current Antardasha: ${antardasha}
Ends on: ${endDate}

Task: In 60 words describe what this current Dasha period means for this person's life right now and what area of life it is activating. Do NOT use TOONS format, simple text only.`;
    return await generateToonsBlock(prompt, 100);
}

export async function generateLifeSectionKarmic(rahuSign: string, rahuHouse: number, ketuSign: string, ketuHouse: number): Promise<string> {
    const prompt = `
Data:
Rahu is in ${rahuSign} in the ${rahuHouse} house.
Ketu is in ${ketuSign} in the ${ketuHouse} house.

Task: In 70 words describe the karmic lessons this soul is working through based on the Rahu Ketu axis. Do NOT use TOONS format, simple text only.`;
    return await generateToonsBlock(prompt, 100);
}

export async function generateLifeSectionAdvice(ascendant: string, mahadasha: string, highHouse: string, lowHouse: string): Promise<string> {
    const prompt = `
Data:
Ascendant: ${ascendant}
Current Mahadasha: ${mahadasha}
Strongest House: ${highHouse}
Weakest House: ${lowHouse}

Task: In 70 words give one powerful practical life advice personalized to this chart. Do NOT use TOONS format, simple text only.`;
    return await generateToonsBlock(prompt, 100);
}

// ==========================================
// YEARLY FORECAST
// ==========================================

export async function generateYearlySectionOverview(year: number, mahadasha: string, jupTransitHouse: number, satTransitHouse: number): Promise<string> {
    const prompt = `
Data:
Year: ${year}
Current Mahadasha: ${mahadasha}
Jupiter Transit House (from Moon): ${jupTransitHouse}
Saturn Transit House (from Moon): ${satTransitHouse}

Task: In 80 words describe the overall theme and dominant energy of this year for this person. Do NOT use TOONS format, simple text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateYearlySectionTransits(jupMoonHouse: number, jupAscHouse: number, satMoonHouse: number, satAscHouse: number): Promise<any[]> {
    const prompt = `
Data:
Jupiter transit: ${jupMoonHouse}th from Moon, ${jupAscHouse}th from Ascendant
Saturn transit: ${satMoonHouse}th from Moon, ${satAscHouse}th from Ascendant

Task: Return in TOONS format with exactly 2 blocks separated by ---.
Block 1 exact keys:
planet: Jupiter
impact: (max 40 words)
Block 2 exact keys:
planet: Saturn
impact: (max 40 words)`;
    
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}

export async function generateYearlySectionMonths(year: number, moonSign: string, mahadasha: string, dashaChanges: string): Promise<any[]> {
    const prompt = `
Data:
Year: ${year}
Natal Moon Sign: ${moonSign}
Current Mahadasha: ${mahadasha}
Dasha Changes this year: ${dashaChanges}

Task: Return in TOONS format with EXACTLY 12 blocks separated by ---.
Each block must include exactly:
month: (full month name)
rating: (integer 1 to 5)
theme: (max 3 words)
forecast: (max 40 words)
Vary the ratings. Return nothing else.`;
    
    // Using a slightly higher token limit because of 12 blocks, but Gemini 2.5 flash is cheap
    const text = await generateToonsBlock(prompt, 800);
    return parseToons(text);
}

export async function generateYearlySectionAuspiciousDates(year: number, moonSign: string, ascSign: string, mahadasha: string): Promise<any[]> {
    const prompt = `
Data:
Year: ${year}
Moon Sign: ${moonSign}
Ascendant: ${ascSign}
Mahadasha: ${mahadasha}

Task: Return in TOONS format with EXACTLY 6 blocks separated by ---.
Each block must include exactly:
date: (DD Month format)
activity: (max 4 words)
reason: (max 15 words)
Return nothing else.`;
    
    const text = await generateToonsBlock(prompt, 300);
    return parseToons(text);
}

export async function generateYearlySectionRemedies(jupHouse: number, satHouse: number, mahadasha: string): Promise<any[]> {
    const prompt = `
Data:
Jupiter Transit House: ${jupHouse}
Saturn Transit House: ${satHouse}
Mahadasha: ${mahadasha}

Task: Return in TOONS format with 3 blocks separated by ---.
Each block must include exactly:
remedy: (max 4-5 words)
instruction: (max 20 words)
Return nothing else.`;
    
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}

// ==========================================
// BIRTH CHART KUNDLI
// ==========================================

export async function generateKundliSectionHouses(housesData: any[]): Promise<any[]> {
    const str = housesData.map(h => `House ${h.houseNumber}: ${h.sign}, Lord: ${h.lord}, Planets: ${h.planets.join(', ')}`).join('\n');
    const prompt = `
Data:
${str}

Task: Return in TOONS format with EXACTLY 12 blocks separated by ---.
Each block must include exactly:
house: (integer)
sign: (sign name)
lord: (lord name)
insight: (max 35 words describing this house's impact on this person's life)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 800);
    return parseToons(text);
}

export async function generateKundliSectionPlanets(planetsData: any[]): Promise<any[]> {
    const str = planetsData.map(p => `${p.name}: ${p.sign}, House ${p.house}, Status: ${p.status}`).join('\n');
    const prompt = `
Data:
${str}

Task: Return in TOONS format with exactly ${planetsData.length} blocks separated by ---.
Each block must include exactly:
planet: (planet name)
sign: (sign name)
house: (house number)
status: (status string)
insight: (max 35 words)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 800);
    return parseToons(text);
}

export async function generateKundliSectionYogas(yogas: any[]): Promise<any[]> {
    if (!yogas || yogas.length === 0) return [];
    const str = yogas.map(y => `${y.name} formed by ${y.planets.join(', ')}`).join('\n');
    const prompt = `
Data:
${str}

Task: Return in TOONS format with exactly ${yogas.length} blocks separated by ---.
Each block must include exactly:
yogaName: (yoga name)
formingPlanets: (planets comma separated string)
meaning: (max 30 words about what this Yoga brings)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 400);
    return parseToons(text);
}

export async function generateKundliSectionNavamsa(asc: string, seventh: string, moon: string): Promise<string> {
    const prompt = `
Data:
D9 Ascendant: ${asc}
D9 7th House: ${seventh}
D9 Moon: ${moon}

Task: In 60 words describe what the D9 Navamsa chart reveals about this person's inner self and relationship destiny. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 100);
}

export async function generateKundliSectionAshtakvarga(top3: string, bottom3: string): Promise<string> {
    const prompt = `
Data:
Top 3 strongest houses: ${top3}
Bottom 3 weakest houses: ${bottom3}

Task: In 70 words explain what the strongest and weakest houses in the Ashtakvarga mean for this person's life journey. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 100);
}

// ==========================================
// LOVE AND COMPATIBILITY
// ==========================================

export async function generateLoveSectionNature(venusSign: string, venusHouse: number, moonSign: string, fifthSign: string): Promise<string> {
    const prompt = `
Data:
Venus: ${venusSign} in House ${venusHouse}
Moon Sign: ${moonSign}
5th House Sign: ${fifthSign}

Task: In 75 words describe how this person loves, what they need emotionally in a relationship, and what romantic energy they naturally bring to partnerships. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateLoveSectionMarriage(seventhSign: string, seventhLordHouse: number, venusSign: string, venusHouse: number, navamsaSeventh: string): Promise<string> {
    const prompt = `
Data:
7th House Sign: ${seventhSign}, Lord in House ${seventhLordHouse}
Venus: ${venusSign} in House ${venusHouse}
D9 Navamsa 7th House: ${navamsaSeventh}

Task: In 75 words describe what kind of spouse and relationship dynamic is indicated for this person. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateLoveSectionTiming(age: number, mahadasha: string, nextMahadasha: string, jupTransit: number): Promise<any[]> {
    const prompt = `
Data:
Current age: ${age}
Current Mahadasha: ${mahadasha}
Next Mahadasha: ${nextMahadasha}
Jupiter transit from natal 7th house: ${jupTransit}

Task: Return in TOONS format with EXACTLY 1 block.
The block must include exactly:
earlyWindow: (age range string)
primaryWindow: (age range string)
explanation: (max 50 words approx. framing never certainty)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 150);
    return parseToons(text);
}

export async function generateLoveSectionChallenges(seventhSign: string, venusSign: string, afflictingPlanets: string): Promise<string> {
    const prompt = `
Data:
7th House Sign: ${seventhSign}
Venus Sign: ${venusSign}
Afflicting planets in 7th: ${afflictingPlanets}

Task: In 60 words describe one key relationship growth area for this person and give one specific practical piece of advice framed positively. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 100);
}

export async function generateLoveSectionCompatibility(score: number, maxFactor: string, lowFactor: string): Promise<string> {
    const prompt = `
Data:
Total Ashtakoot score: ${score}/36
Strongest factor: ${maxFactor}
Weakest factor: ${lowFactor}

Task: In 80 words give an overall compatibility interpretation focusing on the strongest aspect of this match and one area that benefits from conscious effort. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateLoveSectionRemedies(venusSign: string, seventhLord: string, mahadasha: string): Promise<any[]> {
    const prompt = `
Data:
Venus Sign: ${venusSign}
7th Lord: ${seventhLord}
Mahadasha: ${mahadasha}

Task: Return in TOONS format with exactly 3 blocks separated by ---.
Each block must include exactly:
remedy: (max 4 words)
instruction: (max 20 words)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}

// ==========================================
// CAREER AND WEALTH
// ==========================================

export async function generateCareerSectionNature(tenthSign: string, tenthLord: string, sunSign: string, amatyakaraka: string): Promise<any[]> {
    const prompt = `
Data:
10th House Sign: ${tenthSign}, Lord: ${tenthLord}
Sun Sign: ${sunSign}
Amatyakaraka: ${amatyakaraka}

Task: Return in TOONS format with EXACTLY 1 block.
The block must include exactly:
careerNature: (max 75 words)
careerFields: (comma separated list of 4 career fields)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 150);
    return parseToons(text);
}

export async function generateCareerSectionWealth(secondSign: string, eleventhSign: string, jupiterSign: string, dhanaYogas: string): Promise<string> {
    const prompt = `
Data:
2nd House Sign: ${secondSign}
11th House Sign: ${eleventhSign}
Jupiter Sign: ${jupiterSign}
Dhana Yogas: ${dhanaYogas}

Task: In 70 words describe this person's natural wealth potential, earning style, and relationship with money. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateCareerSectionBusiness(tenthLordHouse: number, seventhLordHouse: number, saturnHouse: number, sunHouse: number): Promise<any[]> {
    const prompt = `
Data:
10th Lord House: ${tenthLordHouse}
7th Lord House: ${seventhLordHouse}
Saturn House: ${saturnHouse}
Sun House: ${sunHouse}

Task: Return in TOONS format with EXACTLY 1 block.
The block must include exactly:
recommendation: (Business or Service or Both)
confidence: (percentage integer)
reasoning: (max 40 words)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 150);
    return parseToons(text);
}

export async function generateCareerSectionCurrentPeriod(mahadasha: string, antardasha: string, satTransit: number, jupTransit: number): Promise<string> {
    const prompt = `
Data:
Current Mahadasha: ${mahadasha}
Current Antardasha: ${antardasha}
Saturn transit from 10th: ${satTransit}
Jupiter transit from 10th: ${jupTransit}

Task: In 75 words describe what this current period means for career and what specific actions will help the most right now. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateCareerSectionOpportunities(nextDashas: string, jupTransits: string): Promise<any[]> {
    const prompt = `
Data:
Next Dashas: ${nextDashas}
Upcoming Jupiter transits: ${jupTransits}

Task: Return in TOONS format with EXACTLY 3 blocks separated by ---.
Each block must include exactly:
period: (year range string)
theme: (max 4 words)
opportunity: (max 30 words)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}

export async function generateCareerSectionRemedies(sunSign: string, saturnSign: string, tenthLord: string): Promise<any[]> {
    const prompt = `
Data:
Sun Sign: ${sunSign}
Saturn Sign: ${saturnSign}
10th Lord: ${tenthLord}

Task: Return in TOONS format with exactly 3 blocks separated by ---.
Each block must include exactly:
remedy: (max 4 words)
instruction: (max 20 words)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}

// ==========================================
// HEALTH AND WELLNESS
// ==========================================

export async function generateHealthSectionVitality(ascSign: string, ascLord: string, sunSign: string, dosha: string): Promise<string> {
    const prompt = `
Data:
Ascendant: ${ascSign}, Lord: ${ascLord}
Sun Sign: ${sunSign}
Dosha type: ${dosha}

Task: In 70 words describe this person's natural constitution, energy style, and overall vitality. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateHealthSectionStrengths(topPlanets: string): Promise<any[]> {
    const prompt = `
Data:
Strongest Planets: ${topPlanets}

Task: Return in TOONS format with exactly 3 blocks separated by ---.
Each block must include exactly:
area: (max 3 words)
description: (max 15 words explaining why naturally strong)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}

export async function generateHealthSectionChallenges(sixthSign: string, sixthLord: string, saturnPos: string, weakestPlanet: string): Promise<any[]> {
    const prompt = `
Data:
6th House: ${sixthSign}, Lord: ${sixthLord}
Saturn: ${saturnPos}
Weakest planet: ${weakestPlanet}

Task: Return in TOONS format with exactly 2 blocks separated by ---.
Each block must include exactly:
area: (max 3 words)
advice: (max 20 words proactive self care NEVER use disease sick illness problem)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 150);
    return parseToons(text);
}

export async function generateHealthSectionCurrentPeriod(mahadasha: string, antardasha: string, satTransit: number): Promise<string> {
    const prompt = `
Data:
Current Mahadasha: ${mahadasha}
Current Antardasha: ${antardasha}
Saturn transit from Ascendant: ${satTransit}

Task: In 60 words describe the current period's energy level and what this person should prioritize for their health right now. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 100);
}

export async function generateHealthSectionMind(moonSign: string, moonNak: string, fourthHouseInfo: string): Promise<string> {
    const prompt = `
Data:
Moon: ${moonSign} in ${moonNak} nakshatra
4th House: ${fourthHouseInfo}

Task: In 70 words describe this person's mental and emotional health tendencies, what restores their peace, and one key emotional growth area. Do NOT use TOONS format, text only.`;
    return await generateToonsBlock(prompt, 120);
}

export async function generateHealthSectionLifestyle(ascElement: string, moonSign: string, dominantPlanet: string): Promise<any[]> {
    const prompt = `
Data:
Ascendant Element: ${ascElement}
Moon Sign: ${moonSign}
Dominant Planet: ${dominantPlanet}

Task: Return in TOONS format with exactly 4 blocks separated by ---.
Each block must include exactly:
category: (one of: Exercise, Sleep, Diet, Daily Routine)
recommendation: (max 5 words title)
detail: (max 20 words specific practical guidance)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 300);
    return parseToons(text);
}

export async function generateHealthSectionRemedies(moonNak: string, ascElement: string, weakestPlanet: string): Promise<any[]> {
    const prompt = `
Data:
Moon Nakshatra: ${moonNak}
Ascendant Element: ${ascElement}
Weakest Planet: ${weakestPlanet}

Task: Return in TOONS format with exactly 3 blocks separated by ---.
Each block must include exactly:
remedy: (max 4 words)
instruction: (max 20 words)
Return nothing else.`;
    const text = await generateToonsBlock(prompt, 200);
    return parseToons(text);
}
