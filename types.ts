
export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  time: string;
  location: string;
  language: 'en' | 'hi';
}

export enum AppView {
  Splash = 'SPLASH',
  Login = 'LOGIN',
  SignUp = 'SIGNUP',
  VerifyEmail = 'VERIFY_EMAIL',
  Onboarding = 'ONBOARDING',
  StyleSelection = 'STYLE_SELECTION',
  WelcomeScreens = 'WELCOME_SCREENS',
  Dashboard = 'DASHBOARD',
  Today = 'TODAY',
  Kundli = 'KUNDLI',
  Chat = 'CHAT',
  Compatibility = 'COMPATIBILITY',
  Dashas = 'DASHAS',
  Tools = 'TOOLS',
  Reports = 'REPORTS',
  ReportDetail = 'REPORT_DETAIL',
  AstrologerProfile = 'ASTROLOGER_PROFILE',
  LiveChat = 'LIVE_CHAT',
  LiveCall = 'LIVE_CALL',

  // Admin Views
  AdminDashboard = 'ADMIN_DASHBOARD',
  AdminUsers = 'ADMIN_USERS',
  AdminAstrologers = 'ADMIN_ASTROLOGERS',
  AdminFinance = 'ADMIN_FINANCE',
  AdminSupport = 'ADMIN_SUPPORT',
}

export interface PlanetName {
  Sun: string; Moon: string; Mars: string; Mercury: string; Jupiter: string; Venus: string; Saturn: string; Rahu: string; Ketu: string;
}

export interface PlanetDetails {
  name: string;
  longitude: number;
  rashi: string;
  degreeInRashi: number;
  formatted: string;
  rashiLord: string;
  nakshatra: string;
  nakshatraLord: string;
  nakshatraSubLord: string;
  pada: number;
  isRetro: boolean;
  isCombust: boolean;
  dignity: 'exalted' | 'debilitated' | 'normal';
  isOuterPlanet?: boolean;
  westernRuledSign?: string;
}

export interface HouseData {
  houseNumber: number;
  sign: string;
  planets: string[];
}

export interface DivisionalChart {
  name: string;
  ascendant: string;
  houses: HouseData[];
  planets: { [key: string]: { sign: string, longitude: number } };
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  level: number;
  subPeriods: DashaPeriod[];
}

export interface BirthChartAnalysis {
  ascendant: string;
  moonSign: string;
  nakshatra: string;
  houses: HouseData[];
  planetaryDetails: PlanetDetails[];
  divisionalCharts: { [key: string]: DivisionalChart };
  dashas: DashaPeriod[];
  predictions: {
    general: string;
    career: string;
    finance: string;
    health: string;
    love: string;
    lifePurpose?: string;
  };
  strengths: string[];
  challenges: string[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  tags?: string[];
}

export interface Education {
  degree: string;
  institute: string;
  year?: string;
}

export interface Astrologer {
  id: string;
  name: string;
  imageUrl: string;
  expertise: string[];
  topExpertise: string[];
  topics: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  status: 'online' | 'busy' | 'offline';
  chatRatePerMin: number;
  callRatePerMin: number;
  about: string;
  totalConsultations: number;
  waitTimeMinutes?: number;
  isVerified: boolean;
  education: Education[];
  certifications: string[];
  consultationStyle: string[];
  reviews: Review[];
  ratingBreakdown: { [key: number]: number };
}

// Added missing AdviceCard interface for geminiService
export interface AdviceCard {
  title: string;
  text: string;
  type: 'action' | 'caution' | 'timing' | 'remedy';
}

// Added missing ShadbalaResult interface for astrologyEngine and Shadbala tool
export interface ShadbalaResult {
  planet: string;
  total: number;
  components: {
    sthana: number;
    dig: number;
    kala: number;
    cheshta: number;
    naisargika: number;
    drik: number;
  };
  breakdowns: {
    sthana: string;
    dig: string;
    kala: string;
    cheshta: string;
    naisargika: string;
    drik: string;
  };
}

// Added missing YogaResult interface for yogaEngine and Yoga tool
export interface YogaResult {
  id: string;
  name: string;
  category: string;
  description: string;
  planets: string[];
  strength: string;
  formationReason: string;
  strengthReason: string;
  lifeAreas: string[];
}

// Added missing ChatMessage and ChatSession interfaces for ChatView
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'astrologer';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  adviceCards?: AdviceCard[];
  topicDetected?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
}

// ─── Today Engine Types ───

export interface EnergyScore {
  score: number;
  description: string;
}

export interface PowerHour {
  startTime: string;
  endTime: string;
  label: string;
}

export interface HoraSlot {
  hourOfDay: number;
  startTime: string;
  endTime: string;
  planet: string;
  score: number;
  choghadiya: string;
  isRahuKaal: boolean;
  isYamaganda: boolean;
  isGulikaKaal: boolean;
  reasons: string[];
  activity: string;
}

export interface PowerHourResult {
  bestHour: HoraSlot;
  top3Hours: HoraSlot[];
  avoidHours: HoraSlot[];
  lagnaLord: string;
  dashaLord: string;
  taraQuality: string;
  confidence: 'high' | 'medium' | 'low';
  todayMoonNakshatra: string;
  sunriseHour: number;
  sunsetHour: number;
}

export interface LuckyElements {
  color: string;
  colorHex: string;
  number: number;
}

export interface CoreGrowthItem {
  title: string;
  description: string;
}

export interface DailyRitual {
  title: string;
  description: string;
}

export interface TodayData {
  todaysFlow: string;
  energyLevels: {
    love: EnergyScore;
    career: EnergyScore;
    energy: EnergyScore;
    mindset: EnergyScore;
  };
  auspiciousFocus: {
    powerHour: PowerHour;
    luckyElements: LuckyElements;
  };
  coreAndGrowthPower: {
    coreFocus: CoreGrowthItem;
    growthArea: CoreGrowthItem;
  };
  dailyRitual: DailyRitual;
  computedDate: string; // YYYY-MM-DD for cache key
  fullLuckyData?: {
    luckyColor: string;
    luckyColorHex: string;
    luckyNumber: number;
    rulingPlanet: string;
    rulingPlanetReason: string;
    confidence: 'high' | 'medium' | 'low';
    alternateColor: string;
    alternateColorHex: string;
    alternateNumber: number;
    planetScores: { planet: string; score: number; sources: string[] }[];
    horaLord: string;
    d9Validation: string;
  };
  fullPowerHourData?: PowerHourResult;
}
