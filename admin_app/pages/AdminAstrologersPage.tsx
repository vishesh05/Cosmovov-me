import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Icons } from '../../components/Icons';

interface AdminAstrologer {
    id: string;
    name: string;
    specialties: string[];
    status: string;
    experience: number;
    is_verified: boolean;
}

const AdminAstrologersPage: React.FC = () => {
    const [astrologers, setAstrologers] = useState<AdminAstrologer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAstrologers();
    }, []);

    const fetchAstrologers = async () => {
        try {
            // Fetch astrologer details and joined profile name
            const { data, error } = await supabase
                .from('astrologers')
                .select(`
                    *,
                    profiles:id (name)
                `);

            if (error) throw error;

            const mapped = (data || []).map((a: any) => ({
                id: a.id,
                name: a.profiles?.name || 'Unknown',
                specialties: a.specialties || [],
                status: a.status,
                experience: a.experience_years,
                is_verified: a.is_verified
            }));
            setAstrologers(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-charcoal-900 font-serif">Astrologer Partners</h1>
            {loading ? (
                <div className="flex items-center justify-center p-12"><div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="space-y-4">
                    {astrologers.map((astro) => (
                        <div key={astro.id} className="bg-white p-4 rounded-xl border border-stone-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-400 flex items-center justify-center">
                                    <Icons.Sun className="scale-75" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal-900 text-sm">{astro.name}</h3>
                                    <p className="text-xs text-stone-400">{astro.specialties.join(', ')} • {astro.experience} Years</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${astro.is_verified ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {astro.is_verified ? 'Verified' : 'Pending'}
                                </span>
                                <button className="text-stone-300 hover:text-charcoal-900 transform rotate-180">
                                    <Icons.ChevronLeft />
                                </button>
                            </div>
                        </div>
                    ))}
                    {astrologers.length === 0 && <div className="text-center text-stone-400 py-10 text-sm">No astrologers registered.</div>}
                </div>
            )}
        </div>
    );
};

export default AdminAstrologersPage;
