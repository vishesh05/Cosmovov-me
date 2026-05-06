import React from 'react';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#F2F0EB] flex justify-center items-center sm:p-6 font-sans text-charcoal-800">
      {/* Outer container shadow for premium feel on desktop */}
      <div className="w-full max-w-[430px] bg-ivory-100 sm:rounded-[40px] h-[100dvh] sm:h-[90vh] shadow-[0_20px_40px_-10px_rgba(45,42,38,0.1)] overflow-hidden relative flex flex-col border border-white/60">
        
        {/* Ambient Background Elements */}
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none z-0"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-cosmic-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
           {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutWrapper;