import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { UserProfile } from '../../types';
import { Icons } from '../../components/Icons';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'user');

            if (error) throw error;

            const mappedUsers = (data || []).map(u => ({
                name: u.name,
                gender: u.gender || 'other',
                date: u.date_of_birth || '',
                time: u.time_of_birth || '',
                location: u.place_of_birth || '',
                language: 'en'
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-charcoal-900 font-serif">Users Directory</h1>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-gold-400 animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-500 font-serif uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Gender</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {users.map((user, i) => (
                                <tr key={i} className="hover:bg-ivory-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-charcoal-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                            <Icons.Users className="scale-75" />
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-stone-500">{user.location || '-'}</td>
                                    <td className="px-6 py-4 text-stone-500 capitalize">{user.gender}</td>
                                    <td className="px-6 py-4"><span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-100">Active</span></td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400 font-medium">No users found in database.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
