import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    animate: boolean;
    speed?: number;
    className?: string;
    onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    animate,
    speed = 25, // 25ms per tick for a medium-slow pace
    className = '',
    onComplete
}) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);
    const [isTyping, setIsTyping] = useState(animate);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            setIsTyping(false);
            return;
        }

        let currentIndex = 0;
        setDisplayedText('');
        setIsTyping(true);

        // Smooth medium-slow chunking
        // Keep chunking small to ensure the "typing" feel rather than "block appearance"
        const charsPerTick = text.length > 500 ? 2 : 1;

        const intervalId = setInterval(() => {
            currentIndex += charsPerTick;

            if (currentIndex >= text.length) {
                setDisplayedText(text);
                setIsTyping(false);
                clearInterval(intervalId);
                if (onComplete) onComplete();
            } else {
                // Fast slice update
                setDisplayedText(text.slice(0, currentIndex));
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, animate, speed, onComplete]);

    return (
        <div className={`relative ${className}`}>
            {displayedText}
            {isTyping && (
                <span className="inline-block w-1.5 h-[1.15em] ml-0.5 align-text-bottom bg-gold-400 animate-pulse opacity-80 rounded-[1px]"></span>
            )}
        </div>
    );
};
