import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Icons } from '../../components/Icons';
import { useAdminAnalytics } from '../services/adminAnalytics';





const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-charcoal-800 p-3 border border-stone-200 dark:border-charcoal-700 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-charcoal-500 dark:text-stone-400 mb-1">Day {label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
                        {p.name}: ₹{p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminFinancePage: React.FC = () => {
    const { data: analytics, loading } = useAdminAnalytics();

    if (loading) {
        return <div className="p-8 text-center text-stone-500 animate-pulse">Loading Finance Data...</div>;
    }

    // Reference live analytics strictly
    const stats = analytics?.revenue || {
        today: 0, thisWeek: 0, thisMonth: 0, lifetime: 0,
        arpu: 0, arpuPaid: 0, freeToPaid: 0, churnRate: 0, renewalRate: 0,
        activeSubs: 0, cancelledSubs: 0, plans: []
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">Monetization & Revenue</h2>
                <p className="text-sm text-charcoal-500 dark:text-stone-400">Track revenue, subscriptions, churn, and profit margins.</p>
            </div>

            {/* Revenue KPIs */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Wallet className="w-4 h-4 text-green-500" /> Revenue Hub
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Today', value: `₹${stats.today.toLocaleString()}`, accent: 'text-green-600 dark:text-green-400' },
                        { label: 'This Week', value: `₹${stats.thisWeek.toLocaleString()}`, accent: 'text-green-600 dark:text-green-400' },
                        { label: 'This Month', value: `₹${stats.thisMonth.toLocaleString()}`, accent: 'text-green-600 dark:text-green-400' },
                        { label: 'Lifetime', value: `₹${(stats.lifetime / 1000).toFixed(1)}K`, accent: 'text-indigo-600 dark:text-indigo-400' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-5 shadow-sm">
                            <div className={`text-2xl font-serif font-bold ${m.accent}`}>{m.value}</div>
                            <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider mt-1">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan Split */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Icons.Grid className="w-4 h-4 text-purple-500" /> Revenue by Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.plans.map((p, i) => (
                        <div key={i} className="rounded-xl p-4 border border-stone-100 dark:border-[#33312e] bg-stone-50 dark:bg-[#2a2826]">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                                <span className="text-xs font-bold text-charcoal-700 dark:text-stone-300">{p.name}</span>
                            </div>
                            <div className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">{p.users.toLocaleString()}</div>
                            <div className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase">Users</div>
                            {p.revenue > 0 && (
                                <div className="mt-2 text-sm font-bold text-green-600 dark:text-green-400">₹{p.revenue.toLocaleString()}</div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-6 p-3 bg-stone-50 dark:bg-[#2a2826] rounded-xl border border-stone-100 dark:border-[#33312e]">
                    <div className="text-xs"><span className="font-bold text-charcoal-900 dark:text-ivory-50">ARPU:</span> <span className="text-charcoal-500 dark:text-stone-400">₹{stats.arpu}</span></div>
                    <div className="text-xs"><span className="font-bold text-charcoal-900 dark:text-ivory-50">ARPU (Paid):</span> <span className="text-charcoal-500 dark:text-stone-400">₹{stats.arpuPaid}</span></div>
                </div>
            </div>

            {/* Funnel & Subscriptions */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Activity className="w-4 h-4 text-amber-500" /> Subscription Funnel
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Free→Paid', value: `${stats.freeToPaid}%`, color: 'text-indigo-600 dark:text-indigo-400' },
                        { label: 'Churn Rate', value: `${stats.churnRate}%`, color: 'text-red-600 dark:text-red-400' },
                        { label: 'Renewal Rate', value: `${stats.renewalRate}%`, color: 'text-green-600 dark:text-green-400' },
                        { label: 'Active Subs', value: stats.activeSubs.toLocaleString(), color: 'text-green-600 dark:text-green-400' },
                        { label: 'Cancelled', value: stats.cancelledSubs.toString(), color: 'text-red-600 dark:text-red-400' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-4 shadow-sm text-center">
                            <div className={`text-xl font-serif font-bold ${m.color}`}>{m.value}</div>
                            <div className="text-[10px] font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider mt-1">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profit Margin Chart */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Icons.Chart className="w-4 h-4 text-green-500" /> 30-Day: Revenue vs AI Cost (₹)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.profitMargin || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33312e" opacity={0.2} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dx={-10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="aiCost" name="AI Cost" stroke="#ef4444" strokeWidth={2} fill="url(#colorCost)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminFinancePage;
