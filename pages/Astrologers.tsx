
import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Astrologer } from '../types';
import { AstrologerCard, CategoryChips } from '../components/AstrologerComponents';

import { supabase } from '../services/supabase';

interface AstrologersProps {
    isLoggedIn: boolean;
    onSelectAstrologer: (astrologer: Astrologer) => void;
    onInitiateChat: (astrologer: Astrologer) => void;
    onInitiateCall: (astrologer: Astrologer) => void;
}

const CATEGORIES = ['All', 'Vedic', 'Tarot', 'Numerology', 'Vastu', 'Love', 'Career'];

const Astrologers: React.FC<AstrologersProps> = ({
    isLoggedIn,
    onSelectAstrologer,
    onInitiateChat,
    onInitiateCall
}) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchAstrologers = async () => {
            try {
                const { data, error } = await supabase
                    .from('astrologers')
                    .select('*');

                if (data) {
                    // Map DB fields to Frontend fields if needed (assuming DB matches type for now, or minimal mapping)
                    // The dummy data had full objects. DB might need joins for expertise etc.
                    // For now, assume table structure matches or map basics.
                    // If 'expertise' in DB is array, cool.
                    const mapped = data.map((d: any) => ({
                        id: d.id,
                        name: d.name,
                        imageUrl: d.image_url || 'https://via.placeholder.com/300', // Fallback
                        expertise: d.expertise || [],
                        topExpertise: d.top_expertise || [],
                        topics: d.topics || [],
                        languages: d.languages || [],
                        experienceYears: d.experience_years || 0,
                        rating: d.rating || 5.0,
                        reviewCount: d.review_count || 0,
                        status: d.status || 'offline',
                        chatRatePerMin: d.chat_rate || 0,
                        callRatePerMin: d.call_rate || 0,
                        about: d.about || '',
                        totalConsultations: d.total_consultations || 0,
                        isVerified: d.is_verified || false,
                        education: [],
                        certifications: [],
                        consultationStyle: [],
                        reviews: [],
                        ratingBreakdown: {},
                        waitTimeMinutes: 0
                    })) as Astrologer[];
                    setAstrologers(mapped);
                }
            } catch (err) {
                console.error("Error fetching astrologers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAstrologers();
    }, []);

    const filteredAstrologers = astrologers.filter(astro => {
        const matchesCategory = activeCategory === 'All' || astro.expertise.map(e => e.toLowerCase()).includes(activeCategory.toLowerCase());
        const matchesSearch = astro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            astro.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-ivory-50 animate-fade-in relative">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-serif text-charcoal-900">Consult Astrologers</h1>
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Connect with Verified Experts</p>
                    </div>
                    <div className="w-10 h-10 bg-gold-50 rounded-full flex items-center justify-center text-gold-600 shadow-sm border border-gold-100">
                        <Icons.Sparkles className="w-5 h-5" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                        <Icons.Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or expertise..."
                        className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:border-gold-400 focus:outline-none shadow-sm placeholder:text-stone-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <CategoryChips
                    categories={CATEGORIES}
                    active={activeCategory}
                    onSelect={setActiveCategory}
                />
            </div>

            {/* Astrologer List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 pb-24">
                {filteredAstrologers.length > 0 ? (
                    filteredAstrologers.map(astro => (
                        <AstrologerCard
                            key={astro.id}
                            astrologer={astro}
                            onSelect={() => onSelectAstrologer(astro)}
                            onChat={(e) => { e.stopPropagation(); onInitiateChat(astro); }}
                            onCall={(e) => { e.stopPropagation(); onInitiateCall(astro); }}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-300 text-center">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                            <Icons.Search className="w-6 h-6 opacity-30" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">No Astrologers Found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Astrologers;
