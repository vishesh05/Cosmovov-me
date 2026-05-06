
import { supabase } from './supabase';

export interface SavedChart {
    id: string;
    user_id: string;
    name: string;
    gender: string;
    date: string;
    time: string;
    location: string;
    relation: string;
    created_at: string;
}

export const getSavedCharts = async (userId: string): Promise<SavedChart[]> => {
    const { data, error } = await supabase
        .from('saved_charts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved charts:', error);
        return [];
    }
    return data || [];
};

export const saveNewChart = async (userId: string, chartData: Omit<SavedChart, 'id' | 'user_id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('saved_charts')
        .insert([{
            ...chartData,
            user_id: userId
        }])
        .select()
        .single();

    if (error) {
        console.error('Error saving chart:', error);
        throw error;
    }
    return data;
};

export const deleteSavedChart = async (chartId: string) => {
    const { error } = await supabase
        .from('saved_charts')
        .delete()
        .eq('id', chartId);

    if (error) {
        console.error('Error deleting chart:', error);
        throw error;
    }
};
