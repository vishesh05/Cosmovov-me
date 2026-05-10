import React, { useState, useMemo } from 'react';
import { Icons } from '../../components/Icons';

import { useAdminUsersList } from '../services/adminAnalytics';

type SortKey = 'name' | 'signupDate' | 'lastActive' | 'sessions' | 'streak';

const AdminUsersPage: React.FC = () => {
    const { users: MOCK_USERS, loading } = useAdminUsersList();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('lastActive');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [filterDevice, setFilterDevice] = useState('All');
    const [filterPlan, setFilterPlan] = useState('All');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const handleSort = (key: SortKey) => {
        if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(key); setSortDir('desc'); }
    };

    const filtered = useMemo(() => {
        let list = [...MOCK_USERS];
        if (search) list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase()));
        if (filterDevice !== 'All') list = list.filter(u => u.device === filterDevice);
        if (filterPlan !== 'All') list = list.filter(u => u.plan === filterPlan);
        list.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortBy === 'sessions') cmp = a.sessions - b.sessions;
            else if (sortBy === 'streak') cmp = a.streak - b.streak;
            else if (sortBy === 'signupDate') cmp = a.signupDate.localeCompare(b.signupDate);
            else cmp = a.lastActive.localeCompare(b.lastActive);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [MOCK_USERS, search, sortBy, sortDir, filterDevice, filterPlan]);

    const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
        <th onClick={() => handleSort(field)} className="px-4 py-3 cursor-pointer hover:text-gold-500 transition-colors select-none whitespace-nowrap">
            <span className="flex items-center gap-1">{label} {sortBy === field && <span className="text-gold-500">{sortDir === 'asc' ? '↑' : '↓'}</span>}</span>
        </th>
    );

    const tagColors: Record<string, string> = {
        VIP: 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-200 dark:border-gold-500/20',
        Churned: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
        Flagged: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
    };

    if (loading) {
        return <div className="p-8 text-center text-stone-500 animate-pulse">Loading Users Data...</div>;
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">User Management</h2>
                    <p className="text-sm text-charcoal-500 dark:text-stone-400">{filtered.length} users found</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text" placeholder="Search name, email, ID..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-50 dark:bg-[#2a2826] border border-stone-200 dark:border-[#33312e] text-charcoal-900 dark:text-ivory-50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 w-56"
                        />
                    </div>
                    {/* Device Filter */}
                    <select value={filterDevice} onChange={e => setFilterDevice(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#2a2826] border border-stone-200 dark:border-[#33312e] text-charcoal-900 dark:text-ivory-50">
                        <option value="All">All Devices</option>
                        <option value="iOS">iOS</option>
                        <option value="Android">Android</option>
                        <option value="Web">Web</option>
                    </select>
                    {/* Plan Filter */}
                    <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#2a2826] border border-stone-200 dark:border-[#33312e] text-charcoal-900 dark:text-ivory-50">
                        <option value="All">All Plans</option>
                        <option value="Free">Free</option>
                        <option value="Basic">Basic</option>
                        <option value="Pro">Pro</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 dark:bg-[#2a2826] text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-[#33312e]">
                            <tr>
                                <SortHeader label="Name" field="name" />
                                <SortHeader label="Signup" field="signupDate" />
                                <SortHeader label="Last Active" field="lastActive" />
                                <SortHeader label="Sessions" field="sessions" />
                                <th className="px-4 py-3 whitespace-nowrap">Duration</th>
                                <SortHeader label="Streak" field="streak" />
                                <th className="px-4 py-3">Mode</th>
                                <th className="px-4 py-3">Sign</th>
                                <th className="px-4 py-3">Gender</th>
                                <th className="px-4 py-3">Device</th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-[#33312e]">
                            {filtered.map(user => (
                                <tr key={user.id} onClick={() => setSelectedUser(user)} className="hover:bg-stone-50 dark:hover:bg-[#2a2826] transition-colors cursor-pointer">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-charcoal-800 flex items-center justify-center text-stone-400 flex-shrink-0">
                                                <Icons.User className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-charcoal-900 dark:text-ivory-50 whitespace-nowrap">{user.name}</div>
                                                <div className="text-[9px] text-stone-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400 font-mono">{user.signupDate}</td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400 font-mono">{user.lastActive}</td>
                                    <td className="px-4 py-3 font-bold text-charcoal-900 dark:text-ivory-50">{user.sessions}</td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400">{user.avgDuration}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold ${user.streak >= 30 ? 'text-gold-600 dark:text-gold-400' : user.streak >= 7 ? 'text-green-600 dark:text-green-400' : 'text-charcoal-500 dark:text-stone-400'}`}>
                                            {user.streak}d
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400 capitalize">{user.mode}</td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400 whitespace-nowrap">{user.sunSign}</td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400">{user.region}</td>
                                    <td className="px-4 py-3 text-charcoal-500 dark:text-stone-400">{user.device}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            user.plan === 'Premium' ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-200 dark:border-gold-500/20' :
                                            user.plan === 'Pro' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' :
                                            user.plan === 'Basic' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                                            'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
                                        }`}>{user.plan}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {user.tags.map(tag => (
                                                <span key={tag} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tagColors[tag] || ''}`}>{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selected User Detail Drawer */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
                    <div className="w-full max-w-md bg-white dark:bg-[#1c1b19] h-full overflow-y-auto p-6 shadow-2xl border-l border-stone-200 dark:border-[#33312e] animate-slide-in-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-serif font-bold text-charcoal-900 dark:text-ivory-50">User Profile</h3>
                            <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-stone-100 dark:bg-charcoal-800 flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors">
                                <Icons.X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-[#2a2826] rounded-xl border border-stone-100 dark:border-[#33312e]">
                                <div className="w-14 h-14 rounded-full bg-gold-50 dark:bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-200 dark:border-gold-500/20">
                                    <Icons.User className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal-900 dark:text-ivory-50">{selectedUser.name}</div>
                                    <div className="text-xs text-stone-400">{selectedUser.email}</div>
                                    <div className="text-[10px] text-stone-500 font-mono">{selectedUser.id}</div>
                                </div>
                            </div>
                            {[
                                ['Signup', selectedUser.signupDate], ['Last Active', selectedUser.lastActive],
                                ['Total Sessions', selectedUser.sessions], ['Avg Duration', selectedUser.avgDuration],
                                ['Streak', `${selectedUser.streak} days`], ['Mode', selectedUser.mode],
                                ['Sun Sign', selectedUser.sunSign], ['Moon Sign', selectedUser.moonSign],
                                ['Region', selectedUser.region], ['Device', selectedUser.device], ['Plan', selectedUser.plan],
                            ].map(([label, value]) => (
                                <div key={label as string} className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-[#33312e]">
                                    <span className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">{label}</span>
                                    <span className="text-sm font-medium text-charcoal-900 dark:text-ivory-50 capitalize">{String(value)}</span>
                                </div>
                            ))}
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {selectedUser.tags.map(tag => (
                                    <span key={tag} className={`text-xs font-bold px-3 py-1 rounded-full border ${tagColors[tag]}`}>{tag}</span>
                                ))}
                            </div>
                            <div className="mt-6">
                                <label className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Internal Notes</label>
                                <textarea className="w-full mt-2 p-3 text-sm rounded-xl bg-stone-50 dark:bg-[#2a2826] border border-stone-200 dark:border-[#33312e] text-charcoal-900 dark:text-ivory-50 focus:outline-none focus:ring-2 focus:ring-gold-500/30 resize-none h-24" placeholder="Add notes about this user..." />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
