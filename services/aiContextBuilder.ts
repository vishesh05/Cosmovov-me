import { BirthChartAnalysis, UserProfile, DashaPeriod } from '../types';
import { CharaKarakaCalculator } from './charaKarakaEngine';

export interface AIContextOptions {
    shadbala?: any[];
    yogas?: any[];
    ashtakvarga?: any;
    transits?: any[];
}

const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const LORDSHIPS: { [key: string]: number[] } = { "Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5], "Jupiter": [8, 11], "Venus": [1, 6], "Saturn": [9, 10] };

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
    SPIRITUAL: ['spiritual', 'karma', 'past life', 'moksha', 'meditation', 'dharma', 'guru', 'pilgrimage', 'luck', 'bhagya', 'destiny', 'remedies', 'mantra'],
    POLITICS: ['politics', 'politician', 'election', 'minister', 'government', 'power', 'authority', 'leader', 'satta', 'party', 'public', 'votes', 'pm', 'cm', 'mla', 'mp'],
    ASSETS: ['property', 'house', 'land', 'car', 'vehicle', 'real estate', 'building', 'home', 'bungalow', 'plot', 'asset', 'wealth', 'physical asset', 'vahan', 'makaan', 'zameen']
};

const TOPIC_LIBRARY: { [key: string]: { houses: number[], charts: string[], planets: string[] } } = {
    MARRIAGE: { houses: [7, 5, 8, 2, 11], charts: ['D9'], planets: ['Venus', 'Jupiter', 'Mars'] },
    CAREER: { houses: [10, 6, 2, 11], charts: ['D10', 'D9'], planets: ['Saturn', 'Sun', 'Mercury'] },
    LOVE: { houses: [5, 7, 8, 11], charts: ['D9'], planets: ['Venus', 'Mars', 'Moon'] },
    CHILDREN: { houses: [5, 9, 2], charts: ['D7', 'D9'], planets: ['Jupiter'] },
    FINANCE: { houses: [2, 11, 4, 9], charts: ['D2', 'D4', 'D16'], planets: ['Jupiter', 'Venus'] },
    HEALTH: { houses: [6, 8, 12, 1], charts: ['D3', 'D6', 'D30'], planets: ['Sun', 'Mars', 'Saturn'] },
    TRAVEL: { houses: [9, 12, 3, 4], charts: ['D9', 'D4'], planets: ['Rahu', 'Moon', 'Jupiter'] },
    EDUCATION: { houses: [4, 5, 9], charts: ['D24', 'D9'], planets: ['Mercury', 'Jupiter'] },
    FAMILY: { houses: [2, 4], charts: ['D12', 'D9'], planets: ['Moon', 'Sun', 'Jupiter'] },
    SPIRITUAL: { houses: [9, 12, 5, 8], charts: ['D20', 'D9'], planets: ['Jupiter', 'Ketu'] },
    POLITICS: { houses: [10, 11, 9, 1], charts: ['D10', 'D9'], planets: ['Sun', 'Saturn', 'Rahu'] },
    ASSETS: { houses: [4, 2, 11], charts: ['D4', 'D16'], planets: ['Mars', 'Venus'] },
    GENERAL: { houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], charts: ['D9'], planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] }
};

export class AIContextBuilder {
    
    public static detectIntent(message: string): string {
        const lowerMsg = message.toLowerCase();
        for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
            if (keywords.some(keyword => lowerMsg.includes(keyword))) {
                return intent;
            }
        }
        return 'GENERAL';
    }

    public static compile(intent: string, analysis: BirthChartAnalysis, profile: UserProfile, opts: AIContextOptions): string {
        const now = new Date();
        
        let ctx = `NATIVE DETAILS:\nName: ${profile.name}\nGender: ${profile.gender}\nTopic of Interest: ${intent}\n\n`;

        const topicReq = TOPIC_LIBRARY[intent] || TOPIC_LIBRARY['GENERAL'];

        // Core Identity
        ctx += `CORE CHART:\nAscendant (Lagna): ${analysis.ascendant}\nMoon Sign: ${analysis.moonSign} (Nakshatra: ${analysis.nakshatra})\n\n`;

        // 1. Dasha Period Resolution
        ctx += `CURRENT DASHA (TIMING):\n`;
        const getDasha = (periods: DashaPeriod[], targetLevel: number, cl = 1): DashaPeriod | null => {
            for (const p of periods) {
                if (new Date(p.startDate) <= now && new Date(p.endDate) >= now) {
                    if (cl === targetLevel) return p;
                    if (p.subPeriods?.length) return getDasha(p.subPeriods, targetLevel, cl + 1) || p;
                    return p;
                }
            }
            return null;
        };
        const m = getDasha(analysis.dashas, 1), a = getDasha(analysis.dashas, 2), p = getDasha(analysis.dashas, 3);
        if (m) ctx += `Mahadasha: ${m.planet} (${m.startDate.split('T')[0]} to ${m.endDate.split('T')[0]})\n`;
        if (a) ctx += `Antardasha: ${a.planet} (${a.startDate.split('T')[0]} to ${a.endDate.split('T')[0]})\n`;
        if (p) ctx += `Pratyantardasha: ${p.planet}\n\n`;

        // Find Lagna Lord and Add Jaimini Karakas based on intent
        const lagnaIdx = ZODIAC.indexOf(analysis.ascendant);
        const lagnaLord = lagnaIdx >= 0 ? Object.keys(LORDSHIPS).find(lp => LORDSHIPS[lp].includes(lagnaIdx)) || '' : '';
        const relevantPlanets = new Set([...topicReq.planets]);
        if (lagnaLord) relevantPlanets.add(lagnaLord);
        relevantPlanets.add('Moon');
        if (m) relevantPlanets.add(m.planet);
        if (a) relevantPlanets.add(a.planet);

        const karakas = CharaKarakaCalculator.calculate(analysis.planetaryDetails, true);
        const amk = karakas.find(k => k.karakaName === 'AmK')?.planetName;
        const dk = karakas.find(k => k.karakaName === 'DK')?.planetName;
        const pk = karakas.find(k => k.karakaName === 'PK')?.planetName;
        if (intent === 'CAREER' && amk) relevantPlanets.add(amk);
        if ((intent === 'MARRIAGE' || intent === 'LOVE') && dk) relevantPlanets.add(dk);
        if (intent === 'CHILDREN' && pk) relevantPlanets.add(pk);

        // 2. Filtered Planetary Positions
        ctx += `RELEVANT PLANETARY POSITIONS:\n`;
        analysis.planetaryDetails.forEach(pl => {
            if (!relevantPlanets.has(pl.name) && intent !== 'GENERAL') return;
            const hNum = analysis.houses.find(ho => ho.planets.includes(pl.name))?.houseNumber || 0;
            const status = [pl.isRetro ? 'Retrograde' : '', pl.isCombust ? 'Combust' : '', pl.dignity !== 'normal' ? pl.dignity : ''].filter(Boolean).join(', ');
            let sb = '';
            if (opts.shadbala) {
                const s = opts.shadbala.find(sb => sb.planet === pl.name);
                if (s) sb = ` (Shadbala Strength: ${Math.round(s.total)})`;
            }
            ctx += `- ${pl.name}: House ${hNum}, in ${pl.rashi} at ${pl.formatted}, Nakshatra: ${pl.nakshatra}${status ? ` [${status}]` : ''}${sb}\n`;
        });
        ctx += `\n`;

        // 3. Filtered House Analysis
        ctx += `RELEVANT HOUSE SUMMARY:\n`;
        analysis.houses.forEach(h => {
            if (!topicReq.houses.includes(h.houseNumber) && intent !== 'GENERAL') return;
            const hNum = h.houseNumber;
            const sIdx = ZODIAC.indexOf(h.sign);
            const lord = sIdx >= 0 ? Object.keys(LORDSHIPS).find(lp => LORDSHIPS[lp].includes(sIdx)) || 'Unknown' : 'Unknown';
            const occs = h.planets.length > 0 ? h.planets.join(', ') : 'Empty';
            const aspects = this.getAspectors(hNum, analysis.houses).join(', ') || 'None';
            let av = '';
            if (opts.ashtakvarga && sIdx >= 0) av = ` (Ashtakvarga Points: ${opts.ashtakvarga.sav[sIdx]})`;
            
            ctx += `- House ${hNum} (${h.sign}): Ruled by ${lord}. Occupied by: ${occs}. Aspected by: ${aspects}.${av}\n`;
        });
        ctx += `\n`;

        // 4. Relevant Divisional Charts
        ctx += `RELEVANT DIVISIONAL CHARTS:\n`;
        topicReq.charts.forEach(c => {
            const chart = analysis.divisionalCharts[c];
            if (chart) {
                ctx += `${c} Ascendant: ${chart.ascendant}\n`;
                Object.entries(chart.planets).forEach(([pName, pd]) => {
                    if (relevantPlanets.has(pName) || intent === 'GENERAL') {
                        const dNum = chart.houses.find(ho => ho.planets.includes(pName))?.houseNumber || 0;
                        ctx += `- ${pName} is in House ${dNum} in ${pd.sign}\n`;
                    }
                });
                ctx += `\n`;
            }
        });

        // 5. Transits
        if (opts.transits) {
            ctx += `CURRENT TRANSITS (GOCHAR):\n`;
            ['Jupiter', 'Saturn', 'Rahu', 'Ketu'].forEach(pName => {
                const t = opts.transits!.find(tr => tr.name === pName);
                if (t && (relevantPlanets.has(pName) || topicReq.houses.includes(t.house) || intent === 'GENERAL')) {
                    ctx += `- Transit ${pName} is currently in House ${t.house} in ${t.sign}\n`;
                }
            });
            ctx += `\n`;
        }
        
        // 6. Yogas
        if (opts.yogas && opts.yogas.length > 0) {
            ctx += `KEY YOGAS DETECTED:\n`;
            opts.yogas.slice(0, 5).forEach(y => {
                ctx += `- ${y.name}: ${y.description}\n`;
            });
        }

        return ctx.trim();
    }

    private static getAspectors(targetHouse: number, houses: any[]): string[] {
        const aspectors: string[] = [];
        houses.forEach(h => {
            const hNum = h.houseNumber;
            h.planets.forEach((pName: string) => {
                if (['Uranus', 'Neptune', 'Pluto', 'Ascendant'].includes(pName)) return;
                const dist = ((targetHouse - hNum + 12) % 12) + 1;
                if (dist === 7) aspectors.push(pName);
                else if (pName === 'Mars' && (dist === 4 || dist === 8)) aspectors.push(pName);
                else if (pName === 'Jupiter' && (dist === 5 || dist === 9)) aspectors.push(pName);
                else if (pName === 'Saturn' && (dist === 3 || dist === 10)) aspectors.push(pName);
                else if (['Rahu', 'Ketu'].includes(pName) && (dist === 5 || dist === 9)) aspectors.push(pName);
            });
        });
        return aspectors;
    }
}
