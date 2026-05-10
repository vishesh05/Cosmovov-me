import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Icons } from '../../components/Icons';

import { useAIChatTopics } from '../services/adminAnalytics';

// --- MOCK DATA FOR SECONDARY METRICS ---
const generateDailyCostData = () =>
    Array.from({ length: 30 }).map((_, i) => ({
        day: `Day ${i + 1}`,
        cost: parseFloat((8 + Math.random() * 15).toFixed(2)),
        sessions: Math.floor(500 + Math.random() * 500)
    }));

const chatMetrics = {
    sessionsToday: 840,
    sessionsWeek: 5420,
    sessionsMonth: 22100,
    avgMessagesPerSession: 6.4,
    avgInputTokens: 850,
    avgOutputTokens: 1200,
    avgResponseTimeMs: 2400,
    retryRate: 4.2,
    satisfactionUp: 78,
    satisfactionDown: 8,
    satisfactionNeutral: 14,
    flaggedResponses: 3,
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-charcoal-800 p-3 border border-stone-200 dark:border-charcoal-700 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-charcoal-500 dark:text-stone-400 mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
                        {p.name}: {typeof p.value === 'number' && p.name.includes('cost') ? `$${p.value}` : p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminAIChatPage: React.FC = () => {
    const { topics: topicDistribution, loading } = useAIChatTopics();
    const [dailyCostData, setDailyCostData] = useState<any[]>([]);

    useEffect(() => {
        setDailyCostData(generateDailyCostData());
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-stone-500 animate-pulse">Loading AI Analytics...</div>;
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">AI Chat Intelligence</h2>
                <p className="text-sm text-charcoal-500 dark:text-stone-400">Monitor chat volume, token costs, user satisfaction, and topic trends.</p>
            </div>

            {/* Volume Stats */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Message className="w-4 h-4 text-purple-500" /> Chat Volume
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Sessions Today', value: chatMetrics.sessionsToday, color: 'purple' },
                        { label: 'This Week', value: chatMetrics.sessionsWeek.toLocaleString(), color: 'purple' },
                        { label: 'This Month', value: chatMetrics.sessionsMonth.toLocaleString(), color: 'purple' },
                        { label: 'Avg Msgs / Session', value: chatMetrics.avgMessagesPerSession, color: 'indigo' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-5 shadow-sm">
                            <div className="text-2xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">{m.value}</div>
                            <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider mt-1">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Token & Cost Stats */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Activity className="w-4 h-4 text-red-500" /> Token Usage & Cost
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-5 shadow-sm">
                        <div className="text-2xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">{chatMetrics.avgInputTokens.toLocaleString()}</div>
                        <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider mt-1">Avg Input Tokens / Session</div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-5 shadow-sm">
                        <div className="text-2xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">{chatMetrics.avgOutputTokens.toLocaleString()}</div>
                        <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider mt-1">Avg Output Tokens / Session</div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-5 shadow-sm">
                        <div className="text-2xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">{chatMetrics.avgResponseTimeMs}ms</div>
                        <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider mt-1">Avg Response Time</div>
                    </div>
                </div>
            </div>

            {/* Daily AI Cost Chart */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Icons.Wallet className="w-4 h-4 text-red-500" /> 30-Day AI Cost Trend (USD)
                </h3>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyCostData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33312e" opacity={0.2} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dy={10} minTickGap={30} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dx={-10} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="cost" name="AI cost" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Topic Distribution */}
                <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Compass className="w-4 h-4 text-cyan-500" /> Topic Categories
                    </h3>
                    <div className="flex items-center gap-6">
                        <div className="h-[200px] w-[200px] flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={topicDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                        {topicDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 flex-1">
                            {topicDistribution.map((t, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                                        <span className="text-xs font-medium text-charcoal-700 dark:text-stone-300">{t.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-charcoal-900 dark:text-ivory-50">{t.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quality & Satisfaction */}
                <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Star className="w-4 h-4 text-gold-500" /> Quality Signals
                    </h3>
                    <div className="space-y-5">
                        {/* Satisfaction Bar */}
                        <div>
                            <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-widest mb-3">User Satisfaction</div>
                            <div className="flex rounded-full overflow-hidden h-6 bg-stone-100 dark:bg-stone-900">
                                <div className="bg-green-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${chatMetrics.satisfactionUp}%` }}>
                                    👍 {chatMetrics.satisfactionUp}%
                                </div>
                                <div className="bg-stone-300 dark:bg-stone-700 flex items-center justify-center text-[10px] text-charcoal-700 dark:text-stone-300 font-bold" style={{ width: `${chatMetrics.satisfactionNeutral}%` }}>
                                    {chatMetrics.satisfactionNeutral}%
                                </div>
                                <div className="bg-red-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${chatMetrics.satisfactionDown}%` }}>
                                    👎 {chatMetrics.satisfactionDown}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-50 dark:bg-[#2a2826] rounded-xl p-4 border border-stone-100 dark:border-[#33312e]">
                                <div className="text-xl font-serif font-bold text-amber-600 dark:text-amber-400">{chatMetrics.retryRate}%</div>
                                <div className="text-[10px] font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Retry Rate</div>
                            </div>
                            <div className="bg-stone-50 dark:bg-[#2a2826] rounded-xl p-4 border border-stone-100 dark:border-[#33312e]">
                                <div className="text-xl font-serif font-bold text-red-600 dark:text-red-400">{chatMetrics.flaggedResponses}</div>
                                <div className="text-[10px] font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">Flagged Responses</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAIChatPage;
