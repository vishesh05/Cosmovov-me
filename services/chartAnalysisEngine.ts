
import { calculateBirthChart } from './astrologyEngine';
import { BirthChartAnalysis } from '../types';

export interface GeneratedPerson {
  name: string;
  gender: 'male' | 'female';
  dob: string;
  time: string;
  place: string;
  timezone: string;
  lat: number;
  lon: number;
}

export interface ChartTestRound {
  person: GeneratedPerson;
  charts: BirthChartAnalysis;
  question: string;
  category: string;
}

const NAMES = ["Aravind Sharma", "Priya Deshmukh", "Vikram Malhotra", "Ananya Iyer", "Siddharth Goel", "Megha Kapoor"];
const CITIES = [
  { name: "New Delhi, India", lat: 28.6139, lon: 77.2090, tz: "+05:30" },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, tz: "+05:30" },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: "+05:30" },
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: "+00:00" },
  { name: "New York, USA", lat: 40.7128, lon: -74.0060, tz: "-05:00" }
];

const QUESTIONS = [
  { category: "Love / Marriage", text: "I have been looking for a partner for 3 years but face constant delays. Based on my D1 and D9, when is the strongest period for my marriage?" },
  { category: "Career / Job", text: "I am feeling extremely stuck in my current corporate role. Looking at my D10, should I continue here or switch jobs in the next 6 months?" },
  { category: "Money / Finance", text: "I am planning a major financial investment in property. Do my planetary strengths suggest a stable gain or should I wait for a different dasha?" },
  { category: "Business / Growth", text: "I want to start a new partnership business in the exports sector. Is my chart supportive of independent business or should I stick to service?" },
  { category: "Family / Health", text: "There is recurring stress in my family life regarding my parents' well-being. What do my charts indicate about peace at home in the coming year?" }
];

export const generateRoundData = (roundIndex: number): ChartTestRound => {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  
  // Random DOB between 1970 and 2000
  const year = 1970 + Math.floor(Math.random() * 31);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  const dob = `${year}-${month}-${day}`;
  
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const time = `${hour}:${min}`;

  const charts = calculateBirthChart(dob, time, city.lat, city.lon, city.tz);
  
  // Ensure we don't repeat the same question category if possible
  const question = QUESTIONS[(roundIndex + Math.floor(Math.random() * 2)) % QUESTIONS.length];

  return {
    person: {
      name,
      gender,
      dob,
      time,
      place: city.name,
      timezone: city.tz,
      lat: city.lat,
      lon: city.lon
    },
    charts,
    question: question.text,
    category: question.category
  };
};
