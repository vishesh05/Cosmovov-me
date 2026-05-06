import React, { createContext, useContext, useState, useEffect } from 'react';
import { AstrologyStyle } from '../services/astrologyTerminology';

interface AstrologyStyleContextType {
  astrologyStyle: AstrologyStyle; // Global style chosen by user ('vedic', 'western', 'both')
  setAstrologyStyle: (style: AstrologyStyle) => void;
}

const AstrologyStyleContext = createContext<AstrologyStyleContextType | undefined>(undefined);

export const AstrologyStyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalStyle, setGlobalStyle] = useState<AstrologyStyle>('vedic');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('astrologyStyle') as AstrologyStyle;
    if (saved && ['vedic', 'western', 'both'].includes(saved)) {
      setGlobalStyle(saved);
    }
    setIsLoaded(true);
  }, []);

  const updateGlobalStyle = (style: AstrologyStyle) => {
    setGlobalStyle(style);
    localStorage.setItem('astrologyStyle', style);
  };

  // Do not render children until style is loaded from localStorage to prevent terminology flashes
  if (!isLoaded) return null;

  return (
    <AstrologyStyleContext.Provider 
      value={{ 
        astrologyStyle: globalStyle, 
        setAstrologyStyle: updateGlobalStyle
      }}
    >
      {children}
    </AstrologyStyleContext.Provider>
  );
};

export const useAstrologyStyle = () => {
  const context = useContext(AstrologyStyleContext);
  if (context === undefined) {
    console.warn("useAstrologyStyle used outside of AstrologyStyleProvider, defaulting to 'vedic'");
    return { 
        astrologyStyle: 'vedic' as AstrologyStyle, 
        setAstrologyStyle: () => {}
    };
  }
  return context;
};

// Hook for components to manage page-level toggles when in 'both' mode
export const usePageStylePreference = (pageId: string) => {
    const { astrologyStyle } = useAstrologyStyle();
    
    // Default to resolving 'both' as 'vedic' initially on a page, or what the user saved
    const [pageStyle, setPageStyle] = useState<'vedic' | 'western'>('vedic');

    useEffect(() => {
        if (astrologyStyle === 'both') {
            const saved = localStorage.getItem(`astrologyStyle_page_${pageId}`);
            if (saved === 'western' || saved === 'vedic') {
                setPageStyle(saved);
            }
        }
    }, [astrologyStyle, pageId]);

    const togglePageStyle = (style: 'vedic' | 'western') => {
        setPageStyle(style);
        localStorage.setItem(`astrologyStyle_page_${pageId}`, style);
    };

    // The resolved style this page should use for `getTerm()`
    const currentStyle = astrologyStyle === 'both' ? pageStyle : astrologyStyle as 'vedic' | 'western';

    return {
        isBothMode: astrologyStyle === 'both',
        currentStyle,
        togglePageStyle
    };
};
