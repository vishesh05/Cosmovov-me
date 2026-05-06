
import React from 'react';
import { HouseData, PlanetDetails } from '../types';

const ZODIAC_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

interface ChartProps {
  houses: HouseData[];
  planetDetails?: PlanetDetails[];
  variant?: 'default' | 'plain';
  showSignNumbers?: boolean;
}

const NorthIndianChart: React.FC<ChartProps> = ({ houses, planetDetails, variant = 'default', showSignNumbers = false }) => {
  const getHouseContent = (houseNum: number) => {
    const house = houses.find(h => h.houseNumber === houseNum);
    if (!house) return { sign: '', planets: [] };

    const enrichedPlanets = house.planets
      .filter(pName => {
        const details = planetDetails?.find(pd => pd.name === pName);
        if (['Neptune', 'Uranus', 'Pluto'].includes(pName) && !details) return false;
        return true;
      })
      .map(pName => {
      const details = planetDetails?.find(pd => pd.name === pName);
      if (details) {
        return {
          name: pName.substring(0, 2),
          fullName: pName,
          isRetro: details.isRetro,
          dignity: details.dignity,
          isCombust: details.isCombust,
          isOuterPlanet: details.isOuterPlanet
        };
      }
      return { name: pName.substring(0, 2), fullName: pName, isRetro: false, dignity: 'normal', isCombust: false, isOuterPlanet: false };
    });

    let signLabel = house.sign.substring(0, 3).toUpperCase();
    if (showSignNumbers) {
      const index = ZODIAC_ORDER.indexOf(house.sign);
      if (index !== -1) {
        signLabel = (index + 1).toString();
      }
    }

    return {
      sign: signLabel,
      planets: enrichedPlanets
    };
  };

  const renderHouse = (houseNum: number, x: number, y: number) => {
    const content = getHouseContent(houseNum);
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* Sign Name - Using standard Vedic colors - Large Size */}
        <text x="0" y="-14" fontSize="7" fill="#C5A059" textAnchor="middle" fontWeight="600" letterSpacing="0.5" className="font-serif opacity-90">{content.sign}</text>
        {/* Planets */}
        {content.planets.map((p, i) => {
          const totalPlanets = content.planets.length;
          
          // Layout dynamically in columns if there are many planets
          // Maximum 3 rows per column to avoid overflowing into neighboring houses
          const maxRows = 3;
          const col = Math.floor(i / maxRows);
          const row = i % maxRows;
          const numCols = Math.ceil(totalPlanets / maxRows);
          
          // Calculate X position (centered columns)
          const colWidth = 16;
          const startX = -((numCols - 1) * colWidth) / 2;
          const xPos = startX + col * colWidth;

          // Calculate Y position (centered rows within the column)
          const rowsInThisCol = (col === numCols - 1 && totalPlanets % maxRows !== 0) ? (totalPlanets % maxRows) : maxRows;
          const rowHeight = 9;
          // Offset startY slightly positive so it doesn't overlap the Sign text (which is at y=-14)
          const startY = -((rowsInThisCol - 1) * rowHeight) / 2 + 2; 
          const yPos = startY + row * rowHeight;

          return (
            <g key={i}>
              {/* Planet Text - Size 8 */}
              <text x={xPos} y={yPos} fontSize="8" fill={p.isOuterPlanet ? "#7dd3fc" : "#1A1816"} fontWeight={p.isOuterPlanet ? "600" : "500"} textAnchor="middle" className="font-sans">
                {p.name}
                {p.isRetro && <tspan fontSize="8" fill="#dc2626" dy="-2" dx="0.5">ᴿ</tspan>}
              </text>

              {/* Combust Icon (Flame) */}
              {p.isCombust && (
                <g transform={`translate(${xPos + 5}, ${yPos - 8}) scale(0.20)`}>
                  <path d="M12 1c-4 5-9 9-9 15a9 9 0 1 0 18 0c0-6-5-10-9-15z" fill="#f97316" />
                </g>
              )}

              {/* Dignity Indicators */}
              {p.dignity === 'exalted' && (
                <text x={xPos + 7} y={yPos} fontSize="8" fill="#16a34a" fontWeight="bold">↑</text>
              )}
              {p.dignity === 'debilitated' && (
                <text x={xPos + 7} y={yPos} fontSize="8" fill="#dc2626" fontWeight="bold">↓</text>
              )}
            </g>
          );
        })}
      </g>

    );
  };

  const containerStyles = variant === 'plain'
    ? "w-full aspect-square relative p-2"
    : "w-full aspect-square relative bg-ivory-50 rounded-full border border-gold-500/20 shadow-xl shadow-gold-500/5 p-6";

  return (
    <div className={containerStyles}>
      <svg viewBox="-2 -2 204 204" className="w-full h-full">
        {/* Chart Lines - Precise and Geometric */}
        <g stroke="#D4AF37" strokeWidth="0.6" fill="none" opacity="1">
          <rect x="0" y="0" width="200" height="200" />
          <line x1="0" y1="0" x2="200" y2="200" />
          <line x1="200" y1="0" x2="0" y2="200" />
          <line x1="100" y1="0" x2="200" y2="100" />
          <line x1="200" y1="100" x2="100" y2="200" />
          <line x1="100" y1="200" x2="0" y2="100" />
          <line x1="0" y1="100" x2="100" y2="0" />
        </g>

        {/* House Content Mapping */}
        {renderHouse(1, 100, 45)}
        {renderHouse(2, 50, 25)}
        {renderHouse(3, 25, 50)}
        {renderHouse(4, 45, 100)}
        {renderHouse(5, 25, 150)}
        {renderHouse(6, 50, 175)}
        {renderHouse(7, 100, 155)}
        {renderHouse(8, 150, 175)}
        {renderHouse(9, 175, 150)}
        {renderHouse(10, 155, 100)}
        {renderHouse(11, 175, 50)}
        {renderHouse(12, 150, 25)}
      </svg>
    </div>
  );
};

export default NorthIndianChart;
