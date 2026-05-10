import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Icons } from '../../components/Icons';

import { useAdminContentAnalytics } from '../services/adminAnalytics';

const SIGN_COLORS = ['#ef4444', '#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#0ea5e9', '#14b8a6', '#ec4899', '#a855f7', '#eab308', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-charcoal-800 p-3 border border-stone-200 dark:border-charcoal-700 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-charcoal-500 dark:text-stone-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-indigo-500">{payload[0].value.toLocaleString()} sessions</p>
            </div>
        );
    }
    return null;
};

const AdminContentAnalyticsPage: React.FC = () => {
    const { zodiacEngagement, contentPerformance, topPredictions, loading } = useAdminContentAnalytics();

    if (loading) {
        return <div className="p-8 text-center text-stone-500 animate-pulse">Loading Content Analytics...</div>;
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">Personalization & Content</h2>
                <p className="text-sm text-charcoal-500 dark:text-stone-400">Discover which zodiac signs engage most and which predictions perform best.</p>
            </div>

            {/* Zodiac Engagement Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Star className="w-4 h-4 text-gold-500" /> Engagement by Zodiac Sign
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={zodiacEngagement} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33312e" opacity={0.2} />
                                <XAxis dataKey="sign" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} angle={-30} textAnchor="end" height={50} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="sessions" radius={[4, 4, 0, 0]} barSize={24}>
                                    {zodiacEngagement.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={SIGN_COLORS[index % SIGN_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Signs Detail */}
                <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Icons.Sparkles className="w-4 h-4 text-purple-500" /> Top 5 Engaged Signs
                    </h3>
                    <div className="space-y-4">
                        {zodiacEngagement.slice(0, 5).map((z, i) => (
                            <div key={i} className="p-3 bg-stone-50 dark:bg-[#2a2826] rounded-xl border border-stone-100 dark:border-[#33312e]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">{z.sign}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-200 dark:border-indigo-500/20">#{i + 1}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-xs font-bold text-charcoal-900 dark:text-ivory-50">{z.sessions.toLocaleString()}</div>
                                        <div className="text-[9px] text-stone-400">Sessions</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-charcoal-900 dark:text-ivory-50">{z.avgDuration}m</div>
                                        <div className="text-[9px] text-stone-400">Avg Time</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-charcoal-900 dark:text-ivory-50">{z.chatsPerUser}</div>
                                        <div className="text-[9px] text-stone-400">Chats/User</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Performance Table */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Icons.Book className="w-4 h-4 text-cyan-500" /> Content Performance
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-[#33312e]">
                                <th className="py-3 pr-4">Content Type</th>
                                <th className="py-3 px-4 text-center">Total Reads</th>
                                <th className="py-3 px-4 text-center">Scroll Depth</th>
                                <th className="py-3 px-4 text-center">CTR</th>
                                <th className="py-3 px-4 text-center">Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-[#33312e]">
                            {contentPerformance.map((c, i) => (
                                <tr key={i} className="hover:bg-stone-50 dark:hover:bg-[#2a2826] transition-colors">
                                    <td className="py-3 pr-4 font-bold text-charcoal-900 dark:text-ivory-50">{c.type}</td>
                                    <td className="py-3 px-4 text-center text-charcoal-500 dark:text-stone-400">{c.reads.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-cyan-500" style={{ width: `${c.scrollDepth}%` }}></div>
                                            </div>
                                            <span className="text-charcoal-500 dark:text-stone-400">{c.scrollDepth}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-charcoal-500 dark:text-stone-400">{c.ctr}%</td>
                                    <td className="py-3 px-4 text-center font-bold text-gold-600 dark:text-gold-400">★ {c.rating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Predictions */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Icons.Eye className="w-4 h-4 text-amber-500" /> Top Performing Predictions
                </h3>
                <div className="space-y-3">
                    {topPredictions.map((p, i) => (
                        <div key={i} className="p-4 bg-stone-50 dark:bg-[#2a2826] rounded-xl border border-stone-100 dark:border-[#33312e]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-charcoal-900 dark:text-ivory-50 italic">{p.text}</p>
                                    <p className="text-[10px] text-stone-400 mt-1">{p.accuracy}</p>
                                </div>
                                <div className="flex-shrink-0 text-center">
                                    <div className="text-lg font-serif font-bold text-green-600 dark:text-green-400">{p.engagement}%</div>
                                    <div className="text-[9px] text-stone-400 uppercase">Engagement</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminContentAnalyticsPage;
