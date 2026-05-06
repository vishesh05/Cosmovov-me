import { BirthChartAnalysis, UserProfile, AdviceCard, DashaPeriod, DivisionalChart } from "../types";
import { calculateBirthChart, calculateShadbala } from "./astrologyEngine";
import { calculateYogas } from "./yogaEngine";
import { calculatePanchang } from "./panchangSystem";
import { calculateAshtakvarga } from "./ashtakvargaEngine";
import { calculateTransits } from "./transitEngine";
import { AIContextBuilder } from "./aiContextBuilder";
import { supabase } from "./supabase";

// No API keys in client code — all AI calls go through server-side Edge Function

async function generateContent(prompt: string, isJson: boolean = false, maxTokens: number = 800, temperature: number = 0.8): Promise<string> {
    const messages = [{ role: "user", content: prompt }];
    const body: any = {
        messages,
        temperature,
        max_tokens: maxTokens,
    };
    if (isJson) body.response_format = { type: "json_object" };
    
    const { data, error } = await supabase.functions.invoke('chat-proxy', {
        body,
    });

    if (error) {
        throw new Error(`AI Service Error: ${error.message}`);
    }
    return data.content;
}

async function chatContent(systemPrompt: string, history: any[], userPrompt: string, maxTokens: number = 800, temperature: number = 0.8): Promise<string> {
    const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userPrompt }
    ];
    const body: any = {
        messages,
        temperature,
        max_tokens: maxTokens,
    };

    const { data, error } = await supabase.functions.invoke('chat-proxy', {
        body,
    });

    if (error) {
        throw new Error(`AI Service Error: ${error.message}`);
    }
    return data.content;
}

function signAbbr(sign: string): string {
    return sign ? sign.substring(0, 3) : '';
}
function abbr(str: string): string {
    return str ? str.substring(0, 3) : '';
}

// --- Helper Functions ---

async function callWithRetry<T>(operation: () => Promise<T>, retries = 1, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        const isQuotaError = error.status === 429 ||
            (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')));
        const isServerError = error.status >= 500;

        if (retries > 0 && (isQuotaError || isServerError)) {
            console.warn(`API Error (${error.message}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callWithRetry(operation, retries - 1, delay * 2);
        }
        throw error;
    }
}

// --- Geolocation ---

function getOffsetForTimezone(ianaTimezone: string, dateStr: string): string {
    try {
        const targetDate = new Date(`${dateStr}T12:00:00Z`);
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: ianaTimezone,
            timeZoneName: 'longOffset'
        });
        const parts = formatter.formatToParts(targetDate);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart && tzPart.value) {
            const val = tzPart.value.replace('GMT', '');
            if (!val) return '+00:00';
            if (!val.includes(':')) {
                const num = parseInt(val);
                const sign = num >= 0 ? '+' : '-';
                const abs = Math.abs(num);
                return `${sign}${String(abs).padStart(2, '0')}:00`;
            }
            return val;
        }
    } catch (e) {
        console.warn("Timezone offset calculation failed", e);
    }
    return '+00:00';
}

export async function getGeoLocation(locationQuery: string, date: string): Promise<{ lat: number, lon: number, timezoneOffset: string }> {
    let cleanQuery = locationQuery;
    if (locationQuery.includes(',')) {
        cleanQuery = locationQuery.split(',')[0].trim();
    }

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=en&format=json`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const timezone = result.timezone;
            const offset = getOffsetForTimezone(timezone, date);

            return {
                lat: result.latitude,
                lon: result.longitude,
                timezoneOffset: offset,
            };
        }
    } catch (e) {
        console.error("Geocoding failed:", e);
    }

    return { lat: 28.6139, lon: 77.2090, timezoneOffset: "+05:30" };
}

export async function getCitySuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 3) return [];
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results) {
            return data.results.map((item: any) => {
                const parts = [item.name, item.admin1, item.country].filter(Boolean);
                return parts.join(", ");
            });
        }
    } catch (e) {
        console.warn("Autocomplete failed", e);
    }
    return [];
}

// --- Main Service Functions ---

export async function generateBirthChartAnalysis(profile: UserProfile): Promise<BirthChartAnalysis> {
    const location = await getGeoLocation(profile.location, profile.date);
    const analysis = calculateBirthChart(profile.date, profile.time, location.lat, location.lon, location.timezoneOffset);



    const chartSummary = `
      Ascendant: ${analysis.ascendant}
      Planets: ${analysis.planetaryDetails.map(p => {
        const combust = p.isCombust ? '(Combust)' : '';
        return `${p.name} in ${p.rashi} (${p.formatted}) ${combust} - Nakshatra: ${p.nakshatra} (Sub: ${p.nakshatraSubLord})`;
    }).join(', ')}
      Navamsa (D9) Ascendant: ${analysis.divisionalCharts['D9'].ascendant}
    `;

    const prompt = `
      Act as an expert Vedic Astrologer. Analyze this chart data:
      ${chartSummary}
      User: ${profile.name}, Gender: ${profile.gender}, Lang: ${profile.language}.
      Provide output in JSON:
      {
        "general": "General prediction (50 words)",
        "career": "Career prediction (30 words)",
        "finance": "Finance prediction (30 words)",
        "health": "Health prediction (30 words)",
        "love": "Love prediction (30 words)",
        "lifePurpose": "An engaging, deep 2-sentence summary of the user's ultimate life purpose and destiny based on their Ascendant, Moon, and dominant planets. Write as a direct predictive statement.",
        "strengths": ["string", "string", "string"],
        "challenges": ["string", "string", "string"]
      }
    `;

    let predictions: any = {
        general: "Chart calculated successfully based on your precise birth location. AI insights are momentarily unavailable.",
        career: "A period of steady effort is indicated. Focus on skill development.",
        finance: "Financial stability comes through prudent planning.",
        health: "Maintain a balanced lifestyle for optimal vitality.",
        love: "Relationships benefit from clear communication.",
        lifePurpose: "Your life path is one of steady growth and finding harmony between your inner world and outer actions.",
        strengths: ["Resilience", "Analytical Mind", "Patience"],
        challenges: ["Adaptability", "Letting Go"]
    };

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, true));
        if (responseText) {
            const parsed = JSON.parse(responseText);
            predictions = { ...predictions, ...parsed };
        }
    } catch (e) {
        console.warn("AI Prediction failed (Quota/Network), using fallback.", e);
    }

    analysis.predictions = predictions;
    analysis.strengths = predictions.strengths;
    analysis.challenges = predictions.challenges;

    return analysis;
}

// --- Context Helpers ---

function getCurrentDashaChain(dashas: DashaPeriod[]): string {
    const now = new Date();
    const findCurrent = (periods: DashaPeriod[]): string[] => {
        for (const p of periods) {
            if (new Date(p.startDate) <= now && new Date(p.endDate) >= now) {
                const child = p.subPeriods && p.subPeriods.length > 0 ? findCurrent(p.subPeriods) : [];
                return [`${p.planet} (${p.startDate.split('T')[0]} to ${p.endDate.split('T')[0]})`, ...child];
            }
        }
        return [];
    };
    return findCurrent(dashas).join(" > ");
}


// --- Build Compact Context using AIContextBuilder ---
function buildCompactContext(
    intent: string,
    analysis: BirthChartAnalysis,
    profile: UserProfile,
    shadbala?: any[],
    yogas?: any[],
    ashtakvarga?: any,
    transits?: any[]
): string {
    return AIContextBuilder.compile(intent, analysis, profile, {
        shadbala,
        yogas,
        ashtakvarga,
        transits
    });
}

// --- Session Context Cache ---
const sessionContextCache = new Map<string, string>();

function getSessionContextKey(profile: UserProfile): string {
    return `ctx_${profile.name}_${profile.date}_${profile.location}`;
}

function getCachedBaseContext(analysis: BirthChartAnalysis, profile: UserProfile): string {
    const key = getSessionContextKey(profile);
    if (sessionContextCache.has(key)) return sessionContextCache.get(key)!;

    // Build and cache the static base context (ascendant, moon, dasha)
    const currentChain = getCurrentDashaChain(analysis.dashas);
    const splitChain = currentChain.split(' > ');
    const maha = splitChain[0]?.split(' ')[0] || '?';
    const antar = splitChain[1]?.split(' ')[0] || '?';
    const base = `${profile.name} | Asc:${signAbbr(analysis.ascendant)} Mo:${signAbbr(analysis.moonSign || '')} | ${abbr(maha)}-${abbr(antar)} dasha`;
    sessionContextCache.set(key, base);
    return base;
}

// --- System Prompt (Plain Text, NO JSON) ---
const CHAT_SYSTEM_PROMPT = `You are an incredibly wise, authentic, and profoundly analytical Vedic Astrologer. You are directly speaking with the native. You have been provided with a highly targeted astrological dossier that ONLY includes the houses, planets, and divisional charts highly relevant to the user's specific query topic.

CRITICAL INSTRUCTIONS:
1. Speak Naturally: DO NOT use rigid lists, markdown formatting, or numbered sections. Weave your analysis into a continuous, flowing, and engaging narrative. Talk directly to the user like a real guru sitting across from them.
2. Show Your Work: Always cite the astrological reasons for your statements. Explain how the targeted data (e.g., specific divisional charts like D10 or D9, specific houses, and current Dashas) leads to your conclusion.
3. Analyze Holistically: The context has been pre-filtered for relevance. Combine the Lagna Lord, the relevant houses, the specific Divisional charts, the Dashas, and the Transits to form a hyper-focused and highly accurate answer to their query.
4. Precision & Timeframes: When giving predictions, mention the exact Dasha periods and their dates as provided in the context.
5. Compassionate Tone: Be highly empathetic. Even when pointing out difficult placements, frame them as karmic lessons or opportunities for growth.

Never invent planetary positions. Only use what is in the provided context block. Give a complete, deeply analyzed reading of about 3 to 4 paragraphs.`;

// --- Parse Suggestions from Plain Text Response ---
function parseSuggestionsFromText(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split('\n');
    let inSuggestions = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().includes('want me to') || trimmed.toLowerCase().includes('explore:') || trimmed.toLowerCase().includes('check:')) {
            inSuggestions = true;
            continue;
        }
        if (inSuggestions && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
            const suggestion = trimmed.replace(/^[-•]\s*/, '').trim();
            if (suggestion.length > 3 && suggestion.length < 80) {
                suggestions.push(suggestion);
            }
        }
    }
    return suggestions.slice(0, 3);
}

// --- Clean Response Text (strip any accidental JSON/markdown) ---
function cleanResponseText(text: string): string {
    // Remove any JSON blocks
    let cleaned = text.replace(/```(?:json)?[\s\S]*?```/g, '').trim();
    // Remove any raw JSON objects
    cleaned = cleaned.replace(/\{[\s\S]*?"answer"[\s\S]*?\}/g, '').trim();
    // Remove markdown headers
    cleaned = cleaned.replace(/#{1,6}\s/g, '').trim();
    // Remove bold/italic markers
    cleaned = cleaned.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
    // If response starts with a quote or bracket, something went wrong
    if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
        cleaned = "Your chart reveals interesting patterns for this period. Let me share some insights based on your planetary positions and current dasha period.";
    }
    return cleaned;
}

// ============================================================
// DYNAMIC SUGGESTIONS (Silent Second Call)
// ============================================================

export async function generateDynamicSuggestions(lastUserMsg: string, lastAiMsg: string): Promise<string[]> {
    // Extract key entities from the AI answer for hyper-relevant follow-ups
    const answerSnippet = lastAiMsg.slice(0, 400);
    const prompt = `You generate follow-up questions for a Vedic astrology chat. Read this exchange carefully.

USER ASKED: "${lastUserMsg}"
ASTROLOGER ANSWERED: "${answerSnippet}"

Generate exactly 3 follow-up questions. STRICT RULES:
1. Each question MUST reference a specific entity from the answer (a planet name like Saturn/Venus, a house number like 7th/10th, a dasha name, a yoga, or a specific prediction the astrologer made).
2. Each question must go DEEPER into the same topic — not sideways to a different topic.
3. Maximum 8 words per question. Short and punchy.
4. Questions must progressively deepen: first about the current situation, second about timing, third about what to do.
5. NEVER use generic questions like "Tell me more" or "What else should I know".

Return ONLY a JSON array of exactly 3 strings. Nothing else.`;

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, true, 200, 0.7));
        if (responseText) {
            const parsed = JSON.parse(responseText);
            if (Array.isArray(parsed) && parsed.length >= 3) {
                return parsed.slice(0, 3);
            }
            if (Array.isArray(parsed) && parsed.length >= 2) {
                return parsed.slice(0, parsed.length);
            }
        }
    } catch (e) {
        console.warn("Dynamic suggestion generation failed, applying fallback.", e);
    }

    // Smart fallback: extract planet names and house numbers from the AI response
    const lowerResp = lastAiMsg.toLowerCase();
    const planets = ['jupiter', 'saturn', 'venus', 'mars', 'mercury', 'sun', 'moon', 'rahu', 'ketu'];
    const foundPlanet = planets.find(p => lowerResp.includes(p));
    const houseMatch = lowerResp.match(/(\d+)(?:st|nd|rd|th)\s*house/);
    const foundHouse = houseMatch ? houseMatch[1] : null;
    const pName = foundPlanet ? foundPlanet.charAt(0).toUpperCase() + foundPlanet.slice(1) : null;

    if (pName && foundHouse) {
        return [
            `How strong is ${pName} in my chart?`,
            `When does my ${pName} period activate?`,
            `Any remedy to strengthen my ${foundHouse}th house?`
        ];
    }
    if (pName) {
        return [
            `What is ${pName} doing in my chart?`,
            `When is ${pName} dasha coming?`,
            `How can I strengthen ${pName}?`
        ];
    }
    if (lowerResp.includes('marriage') || lowerResp.includes('spouse')) {
        return ["What will my spouse be like?", "Love or arranged marriage?", "Best year for marriage?"];
    }
    if (lowerResp.includes('career') || lowerResp.includes('job')) {
        return ["Should I start a business?", "When will I get promoted?", "Which field suits me best?"];
    }
    if (lowerResp.includes('money') || lowerResp.includes('wealth')) {
        return ["When will income increase?", "Any Dhana Yoga in my chart?", "Best time for investments?"];
    }
    return ["What should I focus on now?", "Which planet is strongest for me?", "Any important dasha change soon?"];
}

// ============================================================
// MAIN CHAT FUNCTION (Optimized, No JSON, Plain Text)
// ============================================================

export async function chatWithAstrologer(
    history: any[],
    message: string,
    profile: UserProfile,
    analysis: BirthChartAnalysis
): Promise<{ response: string, suggestions: string[], topic: string }> {

    // 1. Sanitize input (200 char limit)
    const cleanMessage = message.trim().slice(0, 200);

    // 2. Detect intent
    const intent = AIContextBuilder.detectIntent(cleanMessage);

    // 3. Perform Deep Vedic Calculations for context
    const shadbala = calculateShadbala(analysis, profile);
    const yogas = calculateYogas(analysis, shadbala);
    const ashtakvarga = calculateAshtakvarga(analysis.planetaryDetails, analysis.ascendant);
    const now = new Date();
    const transits = calculateTransits(now, analysis.ascendant);

    // 4. Build COMPACT context (only relevant data)
    const compactContext = buildCompactContext(intent, analysis, profile, shadbala, yogas, ashtakvarga, transits);

    // 5. Build user prompt
    const userPrompt = `CONTEXT BLOCK:\n${compactContext}\n\nUSER_QUESTION: ${cleanMessage}`;

    // 5. Build minimal history (last 1 exchange only to save tokens)
    const minimalHistory = history.slice(-2).map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: typeof h.parts?.[0]?.text === 'string' ? h.parts[0].text.slice(0, 200) : ''
    }));

    try {
        const responseTextRaw = await callWithRetry<string>(() => chatContent(CHAT_SYSTEM_PROMPT, minimalHistory, userPrompt, 1500, 0.75));
        let responseText = responseTextRaw || "The stars are momentarily obscured. Please ask again.";

        // 6. Clean the response (strip any accidental JSON/markdown)
        responseText = cleanResponseText(responseText);

        // 7. Base suggestions left empty, to be fetched dynamically by the frontend
        const baseSuggestions: string[] = [];

        return {
            response: responseText,
            suggestions: baseSuggestions,
            topic: intent.toLowerCase()
        };

    } catch (e) {
        console.error("Chat failed:", e);
        return {
            response: "I'm experiencing a brief cosmic interference. Please try your question again in a moment.",
            suggestions: ['Career outlook?', 'Health advice?', 'Love life this year?'],
            topic: 'general'
        };
    }
}

// ============================================================
// SEPARATE CHANNEL FUNCTIONS (On-Demand, Button-Triggered)
// ============================================================

// ADVICE & REMEDIES CHANNEL — Generates Do's, Don'ts, and Vedic Remedies specific to the chart and topic.
export async function getAdviceChannel(
    topic: string,
    analysis: BirthChartAnalysis,
    profile: UserProfile,
    lastAiResponse?: string
): Promise<string> {
    const context = buildCompactContext(topic, analysis, profile);
    const intent = topic || 'general';
    const answerContext = lastAiResponse ? `\nPrevious Answer Context: ${lastAiResponse.slice(0, 300)}` : '';

    const prompt = `You are a Vedic Astrologer giving specific advice and remedies.
User: ${profile.name}, Gender: ${profile.gender}
Topic: ${intent}
Chart Data: ${context}${answerContext}

Provide advice in this EXACT format (plain text, no markdown):

✅ DO: [One specific, practical action the user should take based on their chart — mention the planet or house involved. Max 2 sentences.]

❌ DON'T: [One specific thing to avoid during this planetary period — mention the planet or dasha. Max 2 sentences.]

🙏 REMEDY: [One Vedic remedy specific to the weak or afflicted planet in their chart — specify the exact mantra, day, gemstone, charity, or color. Be precise. Max 2 sentences.]

RULES:
- Every point must reference an actual planet, house, or dasha from the chart data.
- Never give generic advice like "stay positive" or "be patient".
- The remedy MUST name the specific planet it's for.
- Keep total response under 150 words.`;

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, false, 300, 0.6));
        return responseText?.trim() || "✅ DO: Focus on strengthening your Lagna lord through morning discipline.\n\n❌ DON'T: Avoid major commitments during the current malefic transit.\n\n🙏 REMEDY: Chant the Maha Mrityunjaya Mantra 11 times daily to strengthen your overall vitality.";
    } catch (e) {
        console.error('Advice API failed:', e);
        return "✅ DO: Focus on grounding practices today — morning walks and structured routines support your Lagna lord.\n\n❌ DON'T: Avoid impulsive financial decisions during this transit.\n\n🙏 REMEDY: Light a mustard oil lamp on Saturdays to appease Saturn's influence on your chart.";
    }
}

// TIMING INSIGHT — Small focused API call (~100 token input, ~150 token output)
export async function getTimingInsight(
    topic: string,
    analysis: BirthChartAnalysis,
    profile: UserProfile
): Promise<string> {
    const currentChain = getCurrentDashaChain(analysis.dashas);
    const splitChain = currentChain.split(' > ');
    const maha = splitChain[0]?.split(' ')[0] || '?';
    const antar = splitChain[1]?.split(' ')[0] || '?';

    const prompt = `You are a Vedic astrologer. Give a warm, specific timing insight for "${topic}".
Dasha: ${abbr(maha)}-${abbr(antar)}, Ascendant: ${signAbbr(analysis.ascendant)}.
Write 3-4 sentences about what the current dasha period means for this topic and what to expect in the coming months. Be specific and warm. At least 300 characters. No JSON. No markdown.`;

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, false, 400, 0.8));
        return cleanResponseText(responseText || 'Current period brings gradual progress. Stay patient and focused.');
    } catch {
        return 'Your current dasha period supports steady growth. Major shifts are expected in the coming months.';
    }
}

// DEEP INSIGHT — Small focused API call
export async function getDeepInsight(
    topic: string,
    analysis: BirthChartAnalysis,
    profile: UserProfile
): Promise<string> {
    const intent = AIContextBuilder.detectIntent(topic);
    const context = buildCompactContext(intent, analysis, profile);

    const prompt = `You are a wise Vedic astrologer. Give a deep, meaningful insight for "${topic}".
Chart: ${context}.
Write 3-4 profound sentences connecting their planetary positions to patterns in their life. Be specific about which planets and houses create these patterns. At least 300 characters. No JSON. No markdown.`;

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, false, 400, 0.8));
        return cleanResponseText(responseText || 'Your chart reveals a deep pattern of growth through experience.');
    } catch {
        return 'Your planetary alignment suggests a journey of inner transformation leading to outer success.';
    }
}

// Deterministic advice cards channel removed

export async function checkCompatibility(p1: UserProfile, p2Name: string, p2Date: string, p2Time: string, p2Loc: string) {
    const prompt = `
      Analyze compatibility between:
      1. ${p1.name} (${p1.date}, ${p1.location})
      2. ${p2Name} (${p2Date}, ${p2Loc})
      Return JSON:
      {
        "score": number (0-36),
        "summary": "Short verdict (30 words)"
      }
    `;

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, true));
        return JSON.parse(responseText || '{ "score": 18, "summary": "Average match." }');
    } catch (e) {
        return { score: 18, summary: "Unable to calculate detailed compatibility at this time." };
    }
}

export async function generateDetailedKundliReport(profile: UserProfile, analysis: BirthChartAnalysis): Promise<string> {
    const prompt = `
    Generate a detailed Vedic Astrology Kundli Report for:
    Name: ${profile.name}
    Date: ${profile.date}
    Time: ${profile.time}
    Location: ${profile.location}

    Ascendant: ${analysis.ascendant}
    Moon Sign: ${analysis.moonSign}
    Nakshatra: ${analysis.nakshatra}

    Planetary Positions:
    ${analysis.planetaryDetails.map(p => `${p.name}: ${p.rashi} (${p.formatted}) in ${p.nakshatra} (Sub: ${p.nakshatraSubLord})${p.isCombust ? ' [COMBUST]' : ''}`).join('\n')}

    Please provide a comprehensive analysis covering:
    1. Personality & Temperament
    2. Career & Finance Outlook
    3. Relationships & Marriage
    4. Health & Vitality
    5. Key Planetary Influences (Yogas)
    6. Current Dasha Analysis

    Format the output as a clean, readable text report with sections.
    `;

    try {
        const responseText = await callWithRetry<string>(() => generateContent(prompt, false));
        return responseText || "Report generation failed.";
    } catch (e) {
        console.error("Report generation failed", e);
        return "Unable to generate detailed report at this time.";
    }
}
