import React from 'react';

interface CosmoVocAvatarProps {
    isTyping?: boolean;
    className?: string;
}

export const CosmoVocAvatar: React.FC<CosmoVocAvatarProps> = ({ isTyping = false, className = "w-8 h-8" }) => {
    return (
        <div className={`relative flex-shrink-0 flex items-center justify-center rounded-full ${className}`}
             style={{
                 backgroundColor: '#1A1A2E',
                 border: '1px solid rgba(212, 168, 67, 0.4)',
                 // Use static glow if not typing, else animation takes over
                 boxShadow: isTyping ? 'none' : '0 0 8px rgba(212, 168, 67, 0.3)',
                 animation: isTyping ? 'cosmoVocPulse 1.5s infinite alternate ease-in-out' : 'none',
             }}
        >
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 3 L17.5 4.5 L19 5 L17.5 5.5 L17 7 L16.5 5.5 L15 5 L16.5 4.5 Z" fill="#D4A843" />
            </svg>
            <style>{`
                @keyframes cosmoVocPulse {
                    0% {
                        box-shadow: 0 0 4px rgba(212, 168, 67, 0.1);
                        border-color: rgba(212, 168, 67, 0.2);
                        transform: scale(0.98);
                    }
                    100% {
                        box-shadow: 0 0 12px rgba(212, 168, 67, 0.7);
                        border-color: rgba(212, 168, 67, 0.8);
                        transform: scale(1.02);
                    }
                }
            `}</style>
        </div>
    );
};
