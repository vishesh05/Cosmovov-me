import React from 'react';
import { HouseData, PlanetDetails } from '../types';

interface WesternChartProps {
    houses: HouseData[];
    planetDetails: PlanetDetails[];
}

const ZODIAC_GLYPHS: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
    Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
    Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const PLANET_GLYPHS: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
    Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
    Uranus: '⛢', Neptune: '♆', Pluto: '♇'
};

const ZODIAC_COLORS: Record<string, string> = {
    Aries: '#ef4444', Taurus: '#22c55e', Gemini: '#eab308', Cancer: '#94a3b8',
    Leo: '#f97316', Virgo: '#84cc16', Libra: '#f472b6', Scorpio: '#8b5cf6',
    Sagittarius: '#a855f7', Capricorn: '#57534e', Aquarius: '#06b6d4', Pisces: '#3b82f6'
};

const WesternChart: React.FC<WesternChartProps> = ({ houses, planetDetails }) => {
    // Basic structural constants
    const size = 320;
    const center = size / 2;
    const outerRadius = 140;
    const innerRadius = outerRadius - 30; // Ring for zodiac signs
    const coreRadius = innerRadius - 40;  // Ring for houses/planets

    // We'll map the ascendant (1st house) to the left side (180 degrees)
    // In SVG, 0 is right (3 o'clock). 180 is left (9 o'clock)
    // House 1 starts at 180 and goes downwards (counter-clockwise in astrology, but SVG angle is clockwise)
    // We will compute absolute longitudes (0 to 360) and rotate the wheel so Ascendant is at 180.
    
    // Find Ascendant degree. If we don't have exact, assume 1st house is 0 to 30 of its sign.
    // For simplicity, we create equal houses starting from Ascendant sign.
    const ascSign = houses.find(h => h.houseNumber === 1)?.sign || 'Aries';
    
    // Ordered signs
    const signs = Object.keys(ZODIAC_GLYPHS);
    const ascIndex = signs.indexOf(ascSign);
    
    // Ordered relative to Ascendant
    const orderedSigns = [
        ...signs.slice(ascIndex),
        ...signs.slice(0, ascIndex)
    ];

    // SVG arc drawing function
    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
            "M", start.x, start.y, 
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
        return d;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    return (
        <div className="relative w-full h-full aspect-square flex items-center justify-center animate-fade-in select-none">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-sm drop-shadow-lg">
                <defs>
                    <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1a1918" />
                        <stop offset="100%" stopColor="#2a2826" />
                    </linearGradient>
                </defs>

                {/* Outer Wheel Background */}
                <circle cx={center} cy={center} r={outerRadius} fill="url(#wheelGrad)" stroke="#d4af37" strokeWidth="1" opacity="0.9" />
                
                {/* Inner White Wheel mapping House areas */}
                <circle cx={center} cy={center} r={innerRadius} fill="#FAF9F6" stroke="#d4af37" strokeWidth="1" />
                <circle cx={center} cy={center} r={coreRadius} fill="transparent" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="4 4" />

                {/* Draw 12 Houses / Zodiac Slices */}
                {orderedSigns.map((sign, index) => {
                    // Ascendant is on the left (9 o'clock), moving counter-clockwise.
                    // To do this in SVG cartesian (0 is up, 90 is right, 180 is down, 270 is left):
                    // Astrological 1st house starts at Left and goes Down. 
                    // So start angle is 270, end angle is 240 (each is 30 deg). Wait, 270 to 300?
                    // Let's use standard rotation. 0 degrees = top. 
                    // Let's shift it so House 1 starts at 270 (Left) and goes counter-clockwise to 240, 210, 180(Bottom).
                    
                    const angleStep = 30;
                    const startAngle = 270 - (index * angleStep);
                    const endAngle = startAngle - angleStep;
                    
                    // Center angle of this slice for text placement
                    const textAngle = startAngle - (angleStep / 2);
                    const textPosOuter = polarToCartesian(center, center, innerRadius + 15, textAngle);
                    const houseNumPos = polarToCartesian(center, center, innerRadius - 15, textAngle);

                    // Draw separator lines (cusps)
                    const lineEndOuter = polarToCartesian(center, center, outerRadius, startAngle);
                    const lineEndInner = polarToCartesian(center, center, 30, startAngle);

                    return (
                        <g key={sign}>
                            {/* Cusp Line */}
                            <line 
                                x1={center} y1={center} 
                                x2={lineEndOuter.x} y2={lineEndOuter.y} 
                                stroke="#d4af37" strokeWidth="1" opacity="0.3" 
                            />
                            
                            {/* Zodiac Sign Glyph */}
                            <text 
                                x={textPosOuter.x} 
                                y={textPosOuter.y + 5} 
                                fill={ZODIAC_COLORS[sign]} 
                                fontSize="14" 
                                fontFamily="sans-serif"
                                textAnchor="middle"
                            >
                                {ZODIAC_GLYPHS[sign]}
                            </text>

                            {/* House Number */}
                            <text 
                                x={houseNumPos.x} 
                                y={houseNumPos.y + 4} 
                                fill="#a8a29e" 
                                fontSize="10" 
                                fontFamily="serif"
                                fontStyle="italic"
                                textAnchor="middle"
                                opacity="0.6"
                            >
                                {index + 1}
                            </text>
                        </g>
                    );
                })}

                {/* Central Focus Circle */}
                <circle cx={center} cy={center} r={30} fill="#fcfcfb" stroke="#d4af37" strokeWidth="1" />
                <circle cx={center} cy={center} r={28} fill="transparent" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
                
                {/* Plot Planets */}
                {planetDetails.map((planet, i) => {
                    const houseIndex = orderedSigns.indexOf(planet.rashi);
                    if (houseIndex === -1) return null;

                    // Absolute position within the 30 degree slice based on its degree
                    const degreeOffset = (planet.degreeInRashi / 30) * 30;
                    
                    // From Asc (270), moving CCW => subtract degrees
                    const sliceStart = 270 - (houseIndex * 30);
                    const exactAngle = sliceStart - degreeOffset;
                    
                    // We stack planets if they are close. Simple trick: stagger radius based on index or just place them
                    // To prevent exact overlap, slight offset is needed if planets are in same degree, but for now simple ring.
                    const rOffset = coreRadius + 15 + ((i % 3) * -12);
                    const pos = polarToCartesian(center, center, rOffset, exactAngle);

                    return (
                        <g key={planet.name} className="group cursor-pointer">
                            <circle cx={pos.x} cy={pos.y} r={8} fill="white" stroke="#d4af37" strokeWidth="0.5" className="group-hover:fill-gold-50" />
                            <text 
                                x={pos.x} 
                                y={pos.y + 4} 
                                fill="#2a2826" 
                                fontSize="10" 
                                textAnchor="middle"
                                className="group-hover:fill-gold-600 transition-colors"
                            >
                                {PLANET_GLYPHS[planet.name] || planet.name[0]}
                            </text>
                            {planet.isRetro && (
                                <text x={pos.x + 8} y={pos.y + 8} fill="#ef4444" fontSize="6" fontWeight="bold">Rx</text>
                            )}
                        </g>
                    );
                })}

                {/* Aspect Lines (Optional - decorative for now) */}
                <g opacity="0.1" stroke="#d4af37" strokeWidth="0.5">
                    {/* Just some geometric connections in the center for Western feel */}
                    <polygon points={`${center},${center-coreRadius} ${center-(coreRadius*0.866)},${center+(coreRadius*0.5)} ${center+(coreRadius*0.866)},${center+(coreRadius*0.5)}`} fill="none" />
                    <polygon points={`${center},${center+coreRadius} ${center-(coreRadius*0.866)},${center-(coreRadius*0.5)} ${center+(coreRadius*0.866)},${center-(coreRadius*0.5)}`} fill="none" />
                </g>

            </svg>
        </div>
    );
};

export default WesternChart;
