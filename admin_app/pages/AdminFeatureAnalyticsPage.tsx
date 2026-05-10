import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Icons } from '../../components/Icons';

import { useFeatureAnalytics } from '../services/adminAnalytics';

// --- MOCK DATA FOR SECONDARY METRICS ---
const commonPaths = [
    { path: 'Splash → Today → Chat', pct: 34 },
    { path: 'Splash → Today → Kundli → Tools', pct: 22 },
    { path: 'Splash → Today → Reports → ReportDetail', pct: 18 },
    { path: 'Splash → Today → Path', pct: 12 },
    { path: 'Splash → Today → Tools → Dashas', pct: 8 },
    { path: 'Splash → Today → Chat → Reports', pct: 6 },
];

const screenMetrics = [
    { screen: 'Today', bounce: '12%', scrollDepth: '85%', ctr: '42%', returnRate: '78%' },
    { screen: 'AI Chat', bounce: '5%', scrollDepth: '95%', ctr: '68%', returnRate: '82%' },
    { screen: 'Path', bounce: '25%', scrollDepth: '60%', ctr: '28%', returnRate: '45%' },
    { screen: 'Tools', bounce: '18%', scrollDepth: '70%', ctr: '55%', returnRate: '62%' },
    { screen: 'Reports', bounce: '15%', scrollDepth: '75%', ctr: '48%', returnRate: '58%' },
];



const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-charcoal-800 p-3 border border-stone-200 dark:border-charcoal-700 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-charcoal-500 dark:text-stone-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-indigo-500">{payload[0].value.toLocaleString()} visits</p>
            </div>
        );
    }
    return null;
};

const AdminFeatureAnalyticsPage: React.FC = () => {
    const { data: featureRanking, loading } = useFeatureAnalytics();
    const totalVisits = featureRanking?.reduce((s, f) => s + (f.visits || 0), 0) || 1;

    if (loading) {
        return <div className="p-8 text-center text-stone-500 animate-pulse">Loading Feature Analytics...</div>;
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">Screen & Feature Analytics</h2>
                <p className="text-sm text-charcoal-500 dark:text-stone-400">Understand which features drive engagement and how users navigate the app.</p>
            </div>

            {/* Feature Usage Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Chart className="w-4 h-4 text-indigo-500" /> Feature Popularity (Total Visits)
                    </h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={featureRanking} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#33312e" opacity={0.2} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} width={70} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="visits" radius={[0, 6, 6, 0]} barSize={20}>
                                    {featureRanking.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Adoption % */}
                <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Star className="w-4 h-4 text-gold-500" /> Adoption Rate
                    </h3>
                    <div className="space-y-4">
                        {featureRanking.map((f, i) => {
                            const pct = Math.round((f.visits / totalVisits) * 100);
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-charcoal-700 dark:text-stone-300">{f.name}</span>
                                        <span className="text-xs font-bold text-charcoal-900 dark:text-ivory-50">{pct}%</span>
                                    </div>
                                    <div className="h-2 bg-stone-100 dark:bg-[#2a2826] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: f.color }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Screen-level Metrics */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Icons.Grid className="w-4 h-4 text-cyan-500" /> Screen-Level Metrics
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-[#33312e]">
                                <th className="py-3 pr-4">Screen</th>
                                <th className="py-3 px-4 text-center">Bounce Rate</th>
                                <th className="py-3 px-4 text-center">Scroll Depth</th>
                                <th className="py-3 px-4 text-center">CTR</th>
                                <th className="py-3 px-4 text-center">Return Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-[#33312e]">
                            {screenMetrics.map((s, i) => (
                                <tr key={i} className="hover:bg-stone-50 dark:hover:bg-[#2a2826] transition-colors">
                                    <td className="py-3 pr-4 font-bold text-charcoal-900 dark:text-ivory-50">{s.screen}</td>
                                    <td className="py-3 px-4 text-center text-charcoal-500 dark:text-stone-400">{s.bounce}</td>
                                    <td className="py-3 px-4 text-center text-charcoal-500 dark:text-stone-400">{s.scrollDepth}</td>
                                    <td className="py-3 px-4 text-center text-charcoal-500 dark:text-stone-400">{s.ctr}</td>
                                    <td className="py-3 px-4 text-center text-charcoal-500 dark:text-stone-400">{s.returnRate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Common Paths */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Icons.Compass className="w-4 h-4 text-purple-500" /> Common Navigation Paths
                </h3>
                <div className="space-y-3">
                    {commonPaths.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-[#2a2826] rounded-xl border border-stone-100 dark:border-[#33312e]">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                                <span className="text-xs font-medium text-charcoal-700 dark:text-stone-300 font-mono">{p.path}</span>
                            </div>
                            <span className="text-xs font-bold text-charcoal-900 dark:text-ivory-50">{p.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Avg Time per Feature */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Icons.Clock className="w-4 h-4 text-amber-500" /> Avg Time Spent per Feature
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {featureRanking.map((f, i) => (
                        <div key={i} className="p-4 rounded-xl bg-stone-50 dark:bg-[#2a2826] border border-stone-100 dark:border-[#33312e] text-center">
                            <div className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">{Math.floor(f.avgTime / 60)}m {f.avgTime % 60}s</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: f.color }}>{f.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminFeatureAnalyticsPage;
