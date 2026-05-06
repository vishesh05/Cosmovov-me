import React from 'react';

const StarryBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Cosmic Foundation */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-950 via-[#1a0b12] to-black opacity-40"></div>
      
      {/* Animated Stars Layer 1 */}
      <div className="stars-container absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div 
            key={`star-1-${i}`}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Animated Stars Layer 2 (Gold tinted) */}
      <div className="stars-container absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={`star-gold-${i}`}
            className="absolute rounded-full bg-gold-200/60 animate-pulse"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: Math.random() * 8 + 's',
              animationDuration: Math.random() * 4 + 4 + 's'
            }}
          />
        ))}
      </div>

      {/* Nebulous Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.03)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03)_0%,transparent_70%)] pointer-events-none"></div>
      
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default StarryBackground;
