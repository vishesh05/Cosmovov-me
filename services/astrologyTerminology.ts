export type AstrologyStyle = 'vedic' | 'western' | 'both';

const terminologyMap: Record<string, Record<AstrologyStyle, string>> = {
  ascendant: { vedic: 'Lagna', western: 'Rising Sign', both: 'Rising Sign' },
  nakshatra: { vedic: 'Nakshatra', western: 'Birth Star', both: 'Birth Star / Nakshatra' },
  rahu: { vedic: 'Rahu', western: 'North Node', both: 'North Node' },
  ketu: { vedic: 'Ketu', western: 'South Node', both: 'South Node' },
  mahadasha: { vedic: 'Mahadasha', western: 'Life Chapter', both: 'Life Chapter' },
  antardasha: { vedic: 'Antardasha', western: 'Sub Chapter', both: 'Sub Chapter' },
  tithi: { vedic: 'Tithi', western: 'Lunar Day', both: 'Lunar Day' },
  kundli: { vedic: 'Kundli', western: 'Birth Chart', both: 'Birth Chart' },
  graha: { vedic: 'Graha', western: 'Planet', both: 'Planet' },
  atmakaraka: { vedic: 'Atmakaraka', western: 'Soul Planet', both: 'Soul Planet' },
  darakaraka: { vedic: 'Darakaraka', western: 'Partner Planet', both: 'Partner Planet' },
  lagna: { vedic: 'Lagna', western: 'Rising Sign', both: 'Rising Sign' },
  bhava: { vedic: 'Bhava', western: 'House', both: 'House' },
  dasha: { vedic: 'Dasha', western: 'Life Period', both: 'Life Period' }
};

export const getTerm = (key: string, style: AstrologyStyle): string => {
  const mapping = terminologyMap[key.toLowerCase()];
  if (!mapping) return key; // Return original if not found
  return mapping[style];
};
