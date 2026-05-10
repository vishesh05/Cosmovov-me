
import { BirthChartAnalysis, UserProfile, AdviceCard, DashaPeriod, DivisionalChart } from "../types";
import { calculateBirthChart, calculateShadbala } from "./astrologyEngine";
import { calculateYogas } from "./yogaEngine";
import { calculatePanchang } from "./panchangSystem";
import { calculateAshtakvarga } from "./ashtakvargaEngine";

const GROQ_API_KEY = process.env.API_KEY || process.env.GROQ_API_KEY;

export async function fetchGroqJSON(prompt: string, maxTokens: number = 200): Promise<any> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_completion_tokens: maxTokens
        })
    });
    if (!res.ok) throw new Error("Groq API Error: " + res.statusText);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
}

export async function fetchGroqText(prompt: string, maxTokens: number = 800, systemPrompt?: string, history?: any[]): Promise<string> {
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    if (history) {
        for (const h of history) {
            messages.push({ role: h.role === 'model' ? 'assistant' : h.role, content: h.parts[0].text });
        }
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            max_completion_tokens: maxTokens,
            temperature: 0.7
        })
    });
    if (!res.ok) throw new Error("Groq API Error: " + res.statusText);
    const data = await res.json();
    return data.choices[0].message.content;
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
        const parsed = await callWithRetry(() => fetchGroqJSON(prompt, 600));
        if (parsed) {
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


// ============================================================
// OPTIMIZED AI CHAT SYSTEM — Low Token, No JSON, Compact Format
// ============================================================

// --- Planet Abbreviation Map ---
const P_ABBR: { [key: string]: string } = {
    'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
    'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra', 'Ketu': 'Ke'
};

const SIGN_ABBR: { [key: string]: string } = {
    'Aries': 'Ar', 'Taurus': 'Ta', 'Gemini': 'Ge', 'Cancer': 'Cn',
    'Leo': 'Le', 'Virgo': 'Vi', 'Libra': 'Li', 'Scorpio': 'Sc',
    'Sagittarius': 'Sg', 'Capricorn': 'Cp', 'Aquarius': 'Aq', 'Pisces': 'Pi'
};

function abbr(planet: string): string { return P_ABBR[planet] || planet; }
function signAbbr(sign: string): string { return SIGN_ABBR[sign] || sign; }

// --- Intent Detection ---

const INTENT_KEYWORDS = {
    MARRIAGE: ['marriage', 'shaadi', 'vivah', 'husband', 'wife', 'spouse', 'wedding', 'when will i marry', 'life partner', 'married', 'shadi', 'dulha', 'dulhan', 'kundali milan', '7th house', 'navamsa'],
    CAREER: ['career', 'job', 'naukri', 'business', 'promotion', 'salary', 'work', 'profession', 'office', 'interview', 'entrepreneur', 'startup', 'government job', 'sarkari', '10th house'],
    LOVE: ['love', 'boyfriend', 'girlfriend', 'crush', 'pyaar', 'affair', 'breakup', 'relationship', 'ex', 'does he like me', 'propose', 'dating', '5th house'],
    CHILDREN: ['children', 'baby', 'pregnancy', 'pregnant', 'santaan', 'bachha', 'ivf', 'conceive', 'child birth', 'son', 'daughter', 'putra', 'fertility'],
    FINANCE: ['money', 'wealth', 'income', 'salary', 'loan', 'debt', 'paisa', 'rich', 'savings', 'investment', 'property', 'financial', 'loss', 'profit', 'stocks'],
    HEALTH: ['health', 'bimari', 'disease', 'illness', 'sick', 'hospital', 'operation', 'surgery', 'medicine', 'doctor', 'pain', 'recovery', 'weakness', 'anxiety'],
    TRAVEL: ['foreign', 'abroad', 'travel', 'visa', 'usa', 'canada', 'uk', 'immigration', 'settle outside', 'videsh', 'overseas', 'nri', 'relocation', 'passport'],
    EDUCATION: ['education', 'study', 'exam', 'pass', 'fail', 'result', 'college', 'university', 'degree', 'school', 'padhai', 'marks', 'upsc', 'jee', 'neet'],
    FAMILY: ['family', 'parents', 'mother', 'father', 'brother', 'sister', 'in-laws', 'property', 'home', 'harmony', 'family problem', 'relatives', 'ghar'],
    SPIRITUAL: ['spiritual', 'karma', 'past life', 'moksha', 'meditation', 'dharma', 'guru', 'pilgrimage', 'luck', 'bhagya', 'destiny', 'remedies', 'mantra']
};

function detectIntent(message: string): keyof typeof INTENT_KEYWORDS | 'GENERAL' {
    const lowerMsg = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
        if (keywords.some(keyword => lowerMsg.includes(keyword))) {
            return intent as keyof typeof INTENT_KEYWORDS;
        }
    }
    return 'GENERAL';
}

// --- Compact Planet String ---
function compactPlanet(analysis: BirthChartAnalysis, name: string): string {
    const p = analysis.planetaryDetails.find(pl => pl.name === name);
    if (!p) return '';
    const h = analysis.houses.find(h => h.planets.includes(name))?.houseNumber || 0;
    const rx = p.isRetro ? ' (Retrograde)' : '';
    const cb = p.isCombust ? ' (Combust)' : '';
    return `${name} is in ${h}th House (${p.rashi})${rx}${cb}`;
}

// --- Compact House String ---
function compactHouse(analysis: BirthChartAnalysis, num: number): string {
    const h = analysis.houses.find(h => h.houseNumber === num);
    if (!h) return '';
    const planets = h.planets.length > 0 ? h.planets.join(', ') : 'no planets';
    return `${num}th House is ${h.sign} with ${planets}`;
}

// --- Intent-Based Relevant Houses/Planets Map ---
const INTENT_DATA_MAP: { [key: string]: { houses: number[], planets: string[], charts: string[] } } = {
    MARRIAGE:  { houses: [7, 2, 8], planets: ['Venus', 'Jupiter', 'Mars', 'Rahu'], charts: ['D9'] },
    CAREER:   { houses: [10, 6, 2], planets: ['Saturn', 'Sun', 'Mercury', 'Jupiter'], charts: ['D10'] },
    LOVE:     { houses: [5, 7, 11], planets: ['Venus', 'Moon', 'Mars', 'Rahu'], charts: [] },
    CHILDREN: { houses: [5, 9], planets: ['Jupiter', 'Moon', 'Venus'], charts: ['D7'] },
    FINANCE:  { houses: [2, 11, 9], planets: ['Jupiter', 'Mercury', 'Venus', 'Rahu'], charts: [] },
    HEALTH:   { houses: [1, 6, 8], planets: ['Saturn', 'Mars', 'Moon', 'Sun'], charts: [] },
    TRAVEL:   { houses: [9, 12, 4], planets: ['Moon', 'Rahu', 'Jupiter'], charts: [] },
    EDUCATION:{ houses: [4, 5, 9], planets: ['Mercury', 'Jupiter', 'Ketu'], charts: [] },
    FAMILY:   { houses: [4, 9, 3], planets: ['Moon', 'Sun', 'Mars', 'Venus'], charts: [] },
    SPIRITUAL:{ houses: [9, 12, 5], planets: ['Jupiter', 'Ketu', 'Rahu', 'Moon'], charts: [] },
    GENERAL:  { houses: [1, 7, 10], planets: ['Sun', 'Moon', 'Jupiter', 'Saturn'], charts: [] }
};

// --- Build Compact Context (THE CORE OPTIMIZATION) ---
function buildCompactContext(intent: string, analysis: BirthChartAnalysis, profile: UserProfile): string {
    const map = INTENT_DATA_MAP[intent] || INTENT_DATA_MAP['GENERAL'];

    // Dasha chain
    const currentChain = getCurrentDashaChain(analysis.dashas);
    const splitChain = currentChain.split(' > ');
    const maha = splitChain[0]?.split(' ')[0] || '?';
    const antar = splitChain[1]?.split(' ')[0] || '?';

    // Relevant houses (compact)
    const houseLine = map.houses.map(h => compactHouse(analysis, h)).join('; ');

    // Relevant planets (compact)
    const planetLine = map.planets.map(p => compactPlanet(analysis, p)).filter(Boolean).join('; ');

    // Divisional chart ascendants (if relevant)
    let chartLine = '';
    if (map.charts.length > 0) {
        chartLine = map.charts
            .map(c => `${c} Ascendant is ${analysis.divisionalCharts[c]?.ascendant || 'Unknown'}`)
            .join(', ');
    }
    
    // Assemble
    let context = `Ascendant is ${analysis.ascendant}, Moon is in ${analysis.moonSign || 'Unknown'}.`;
    context += `\nCurrent Dasha: ${maha} Maha-dasha and ${antar} Antar-dasha.`;
    context += `\nRelevant Houses: ${houseLine}.`;
    context += `\nRelevant Planets: ${planetLine}.`;
    if (chartLine) context += `\nDivisional Charts: ${chartLine}.`;

    return context;
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
    const base = `${profile.name} | Ascendant:${analysis.ascendant} Moon:${analysis.moonSign || ''} | ${maha}-${antar} dasha`;
    sessionContextCache.set(key, base);
    return base;
}

// --- System Prompt (Plain Text, NO JSON) ---
const CHAT_SYSTEM_PROMPT = `You are Jyoti — a warm, perceptive Vedic astrologer. You have real conversations. You listen. You respond to the actual person in front of you, not a generic version of their question.

================================================================
RULE 1 — READ THE CONVERSATION FIRST
================================================================
Read the full conversation before replying.

If the user said "yes", "no", or one word — go deeper on the same topic. Never jump to something new.

If they shared something personal — health, stress, fear — your first sentence must reflect that. They need to feel heard before they feel advised.

NEVER do this:
User: "yes I have health issues"
Reply: "You are entering a lucky phase. Jupiter boosts finances."

ALWAYS do this:
User: "yes I have health issues"
Reply: Acknowledge the struggle first. Connect it to one planet. Give a timing note. Ask one real question.

================================================================
RULE 2 — ONE PLANET ONLY
================================================================
Pick the single most relevant planet or house. Go deep on it.
Never mention more than one planet per response.
Less is more personal.

================================================================
RULE 3 — TRANSLATE JARGON IMMEDIATELY
================================================================
Every planet or Dasha name must be followed by what it means in plain human terms in the same sentence.

Not: "Mercury Antardasha begins."
But: "Mercury's phase begins — a time that sharpens thinking and opens up important conversations."

================================================================
RULE 4 — RESPONSE LENGTH (STRICT)
================================================================
Total response: 80 to 100 words. Never more. Never less.

PARAGRAPH 1 — 45 to 50 words:
- Open by acknowledging what the user said
- One planet or house, explained in human terms
- Personal, warm, direct

PARAGRAPH 2 — 35 to 45 words:
- One timing note with a specific window ("next 3 months" not "soon")
- End with the closing question — see Rule 5

No headers. No bullets. No bold. No asterisks. Plain prose only.

================================================================
RULE 5 — CLOSING QUESTION (STRICTEST RULE)
================================================================
Every response ends with exactly one question. This is non-negotiable.

THE QUESTION MUST:
- Be one sentence only
- Ask about the user's lived experience — what they feel, notice, or are going through
- Connect directly to something you just said in the same response
- Be soft enough that answering feels easy and natural
- Make the user feel understood, not interviewed

THE QUESTION MUST NEVER:
- Ask about planets, dashas, or astrological events
- Be a yes/no prediction question
- Contain two questions joined by "and"
- Feel like a form field or menu option
- Be generic enough to apply to anyone

BAD — never use:
"Will your income surge during Venus Antardasha?"
"Are you experiencing mental turmoil?"
"How do you envision making an impact and what steps are you taking?"
"What else would you like to know?"

GOOD — this is the exact tone:
"Has this been showing up more in your body or in your mood?"
"Is this something you have been sitting with alone?"
"What does a good day feel like for you right now compared to before?"
"When did you first start sensing something was shifting?"
"Is it one area that feels stuck or does everything feel uncertain at once?"

================================================================
RULE 6 — STAY ON TOPIC
================================================================
Stay on the user's current topic until they clearly change it.
"Yes" = go deeper on the same thread.
"No" = explore a different angle on the same topic.
One word answer = invitation to go deeper, not to move on.

================================================================
RULE 7 — EMOTION BEFORE ASTROLOGY
================================================================
If the user expresses pain, confusion, or exhaustion — first sentence is human warmth. Then astrology.

Never open with a planet name when the user is clearly struggling.

================================================================
RULE 8 — HARD LIMITS
================================================================
- Never predict death or permanent disaster
- Never give a fixed date — give windows
- Never mention a planet not in the chart context given
- Never repeat an insight from a previous message
- Never use JSON, bullets, headers, bold, or asterisks
- Always speak directly to "you" — never third person
- If context is missing, say so honestly`;

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

export async function generateDynamicSuggestions(fullConversationText: string): Promise<string[]> {
    const prompt = `You are a suggestion generator for a Vedic astrology chat app. Look at the full conversation history below:

${fullConversationText}

Generate exactly 2 short follow-up questions that relate to what the user has been asking about throughout the conversation.
IMPORTANT RULES:
- Do not repeat the questions the astrologer already asked at the end of their response.
- The chat questions should feel like a natural next step from everything discussed so far, not just the last message.
- The questions must refer to specific astrological details or situations mentioned.
- Do not generate generic astrology questions.
- Each question must be maximum 8 words long.
Return only a JSON array with exactly 2 strings and nothing else. Example format: ["When does my Mercury dasha end?", "How does Jupiter affect my 11th house?"]`;

    try {
        const parsed = await callWithRetry(() => fetchGroqJSON(prompt, 150));
        if (parsed) {
            if (Array.isArray(parsed) && parsed.length >= 2) return [parsed[0], parsed[1]];
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) return [parsed.suggestions[0], parsed.suggestions[1]];
        }
    } catch (e) {
        console.warn("Dynamic suggestion generation failed, applying fallback.");
    }

    // Fallback logic based on keywords in conversation
    const lowerResp = fullConversationText.toLowerCase();
    if (lowerResp.includes('dasha') || lowerResp.includes('period') || lowerResp.includes('antardasha')) {
        return ["When does this dasha end?", "What comes after this dasha?"];
    }
    if (lowerResp.includes('marriage') || lowerResp.includes('spouse') || lowerResp.includes('wedding')) {
        return ["What is my marriage timing?", "What does my 7th house say?"];
    }
    if (lowerResp.includes('career') || lowerResp.includes('job') || lowerResp.includes('business') || lowerResp.includes('promotion')) {
        return ["When is my best career period?", "Which planet helps my career most?"];
    }
    if (lowerResp.includes('money') || lowerResp.includes('wealth') || lowerResp.includes('income') || lowerResp.includes('finance') || lowerResp.includes('investment')) {
        return ["When will my income increase?", "Which investment suits my chart?"];
    }
    
    return ["What should I focus on this month?", "Which area needs my attention now?"];
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
    const intent = detectIntent(cleanMessage);

    // 3. Build COMPACT context (only relevant data, ~100-200 tokens)
    const compactContext = buildCompactContext(intent, analysis, profile);

    // 4. Build user prompt (minimal, ~150-300 tokens total)
    const userPrompt = `Chart: ${compactContext}\n\nQ: ${cleanMessage}`;

    // 5. Build minimal history (last 1 exchange only to save tokens)
    const minimalHistory = history.slice(-2).map(h => ({
        role: h.role,
        parts: [{ text: typeof h.parts?.[0]?.text === 'string' ? h.parts[0].text.slice(0, 200) : '' }]
    }));

    try {
        let responseText = await callWithRetry(() => fetchGroqText(userPrompt, 600, CHAT_SYSTEM_PROMPT, minimalHistory));
        if (!responseText) responseText = "The stars are momentarily obscured. Please ask again.";

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

// ADVICE CHANNEL — Generates highly specific, real astrological advice based on the user's chart.
export async function getAdviceChannel(
    topic: string,
    analysis: BirthChartAnalysis,
    profile: UserProfile
): Promise<string> {
    const context = buildCompactContext(topic, analysis, profile);
    const intent = topic || 'general';

    const prompt = `You are a Vedic Astrologer providing concise, highly actionable advice.
User: ${profile.name}
Topic: ${intent}
Chart Data: ${context}

REQUIREMENTS:
1. Provide EXACTLY ONE SHORT PARAGRAPH of advice (max 400 characters).
2. Give one practical, earthly action they can take today AND one astrological remedy (e.g., chanting, charity, or colors to wear).
3. Plain text only. NO markdown, NO bullet points, NO lists. Flow naturally.
4. Do NOT say "Here is your advice" or use filler words. Go straight into the guidance.`;

    try {
        const responseText = await callWithRetry(() => fetchGroqText(prompt, 200));
        return cleanResponseText(responseText || "Focus on grounding yourself today. A brief meditation will align your energies.");
    } catch (e) {
        console.error('Advice API failed:', e);
        return "Focus on grounding yourself today. Small, consistent steps will help clear the karmic blockages currently present.";
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
        const responseText = await callWithRetry(() => fetchGroqText(prompt, 400));
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
    const intent = detectIntent(topic);
    const context = buildCompactContext(intent, analysis, profile);

    const prompt = `You are a wise Vedic astrologer. Give a deep, meaningful insight for "${topic}".
Chart: ${context}.
Write 3-4 profound sentences connecting their planetary positions to patterns in their life. Be specific about which planets and houses create these patterns. At least 300 characters. No JSON. No markdown.`;

    try {
        const responseText = await callWithRetry(() => fetchGroqText(prompt, 400));
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
        const parsed = await callWithRetry(() => fetchGroqJSON(prompt, 200));
        return parsed || { score: 18, summary: "Average match." };
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
        const responseText = await callWithRetry(() => fetchGroqText(prompt, 2000));
        return responseText || "Report generation failed.";
    } catch (e) {
        console.error("Report generation failed", e);
        return "Unable to generate detailed report at this time.";
    }
}
