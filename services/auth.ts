
import { supabase } from './supabase';
import { UserProfile } from '../types';

export interface AuthState {
    isLoggedIn: boolean;
    user: UserProfile | null;
    role: 'user' | 'admin' | 'guest';
    email?: string;
    isLoading: boolean;
}

const STORAGE_KEY = 'astroveda_auth_state';
export const ANALYSIS_CACHE_VERSION = 'v4';

/**
 * Normalizes any date format to the ISO YYYY-MM-DD expected by the engine.
 * Handles: DD-MM-YYYY, DD/MM/YYYY, YYYY/MM/DD
 */
export function normalizeDOB(raw: string | undefined | null): string {
    if (!raw) return '';
    const s = raw.trim();
    // DD-MM-YYYY or DD/MM/YYYY
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(s)) {
        const parts = s.split(/[-/]/);
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    // YYYY/MM/DD (slash variant)
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s)) {
        return s.replace(/\//g, '-');
    }
    // Already YYYY-MM-DD or unknown — return as-is
    return s;
}

export const getAnalysisCacheKey = (profile: UserProfile) => {
    return `astroveda_analysis_${ANALYSIS_CACHE_VERSION}_${profile.name}_${profile.date}_${profile.location}`;
};

export const getAuthState = (): AuthState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        isLoggedIn: false,
        user: null,
        role: 'guest',
        isLoading: true
    };
};

export const setAuthState = (state: AuthState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    // Clear other related local storage items if necessary
    localStorage.removeItem('astroveda_intro_played');
    localStorage.removeItem('astroveda_toast_shown');
};

export const getUserProfile = async (userId: string): Promise<{ profile: UserProfile | null; role: AuthState['role'] | null }> => {
    try {
        // 1. Try to fetch from 'users' table
        console.log("getUserProfile: Fetching from users table for id:", userId);
        // Timeout Promise (Increased to 10s for slower connections)
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000));

        let userData = null;
        let userError = null;

        try {
            // Race the query against the timeout
            const result = await Promise.race([
                supabase.from('users').select('*').eq('id', userId).single(),
                timeout.then(() => { throw new Error('Timeout'); })
            ]) as { data: any, error: any };

            userData = result.data;
            userError = result.error;
        } catch (e: any) {
            console.error("getUserProfile exception or timeout:", e);
            // Return null to allow fallback to metadata
            return { profile: null, role: null };
        }

        console.log("getUserProfile: Result:", userData, "Error:", userError);

        if (userData && !userError) {
            return {
                profile: {
                    name: userData.full_name || 'User',
                    gender: userData.gender || 'other',
                    date: normalizeDOB(userData.dob),
                    time: userData.tob || '',
                    location: userData.place_of_birth || '',
                    language: 'en'
                },
                role: 'user'
            };
        }


        // 3. Check for Admin (using metadata or specific table if exists)
        // For now, assume if not in above, return null or check metadata in callee
        return { profile: null, role: null };

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { profile: null, role: null };
    }
};

export const updateUserProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                full_name: profile.name,
                gender: profile.gender,
                dob: profile.date,
                tob: profile.time,
                place_of_birth: profile.location,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error updating profile:', error);
            // If table doesn't exist or is different structure, this might fail.
            // But we assume the schema supports these fields.
            return false;
        }
        return true;
    } catch (e) {
        console.error('Exception updating profile:', e);
        return false;
    }
};
