import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OuterPlanetsContextType {
    showOuterPlanets: boolean;
    setShowOuterPlanets: (show: boolean) => void;
}

const OuterPlanetsContext = createContext<OuterPlanetsContextType | undefined>(undefined);

export const OuterPlanetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [showOuterPlanets, setShowOuterPlanets] = useState<boolean>(true);

    // Persist user preference to local storage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('astroveda_showOuterPlanets');
            if (saved !== null) {
                setShowOuterPlanets(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Failed to load outer planets preference', e);
        }
    }, []);

    const handleSetShowOuterPlanets = (show: boolean) => {
        setShowOuterPlanets(show);
        try {
            localStorage.setItem('astroveda_showOuterPlanets', JSON.stringify(show));
        } catch (e) {
            console.warn('Failed to save outer planets preference', e);
        }
    };

    return (
        <OuterPlanetsContext.Provider value={{ showOuterPlanets, setShowOuterPlanets: handleSetShowOuterPlanets }}>
            {children}
        </OuterPlanetsContext.Provider>
    );
};

export const useOuterPlanets = () => {
    const context = useContext(OuterPlanetsContext);
    if (!context) {
        throw new Error('useOuterPlanets must be used within an OuterPlanetsProvider');
    }
    return context;
};
