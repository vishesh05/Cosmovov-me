import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Icons } from '../../components/Icons';

import { useAdminRetentionAnalytics } from '../services/adminAnalytics';

const cohortData = [
    { week: 'Feb 12 - 18', sizes: [100, 45, 32, 28, 25, 22, 20, 18] },
    { week: 'Feb 19 - 25', sizes: [100, 47, 34, 29, 26, 23, 21, null] },
    { week: 'Feb 26 - Mar 4', sizes: [100, 48, 35, 30, 28, 24, null, null] },
    { week: 'Mar 5 - 11', sizes: [100, 42, 31, 27, 24, null, null, null] },
    { week: 'Mar 12 - 18', sizes: [100, 46, 33, 29, null, null, null, null] },
    { week: 'Mar 19 - 25', sizes: [100, 49, 36, null, null, null, null, null] },
    { week: 'Mar 26 - Apr 1', sizes: [100, 51, null, null, null, null, null, null] },
    { week: 'Apr 2 - 8', sizes: [100, null, null, null, null, null, null, null] },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-charcoal-800 p-3 border border-stone-200 dark:border-charcoal-700 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-charcoal-500 dark:text-stone-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {payload[0].value.toLocaleString()} Users
                </p>
            </div>
        );
    }
    return null;
};

const AdminRetentionPage: React.FC = () => {
    const { dauData, kpis, streaks, loading } = useAdminRetentionAnalytics();

    if (loading) {
        return <div className="p-8 text-center text-stone-500 animate-pulse">Loading Retention Data...</div>;
    }

    const renderRetentionCard = (title: string, value: number, benchmark: number) => {
        const isGood = value >= benchmark;
        return (
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-widest mb-2">{title}</div>
                    <div className={`text-5xl font-serif font-bold mb-3 ${isGood ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {value}%
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium px-3 py-1.5 rounded-full bg-stone-50 dark:bg-[#2a2826] border border-stone-100 dark:border-[#33312e] text-charcoal-600 dark:text-stone-300">
                        <span>Industry Benchmark: {benchmark}%</span>
                        {isGood ? <Icons.Check className="w-3 h-3 text-green-500" /> : <Icons.Activity className="w-3 h-3 text-amber-500" />}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">User Retention Intelligence</h2>
                    <p className="text-sm text-charcoal-500 dark:text-stone-400">Track how effectively the app keeps users coming back.</p>
                </div>
            </div>

            {/* Retention Benchmarks */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Star className="w-4 h-4 text-gold-500" /> Key Milestones vs Benchmarks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderRetentionCard("Day 1 Return", kpis.day1, 35)}
                    {renderRetentionCard("Day 7 Return", kpis.day7, 15)}
                    {renderRetentionCard("Day 30 Return", kpis.day30, 8)}
                </div>
            </div>

            {/* Active User Trends (DAU) */}
            <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest flex items-center gap-2">
                        <Icons.Activity className="w-4 h-4 text-indigo-500" /> 30-Day Active Users (DAU)
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dauData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33312e" opacity={0.2} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dy={10} minTickGap={30} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} dx={-10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} shadow="0 4px 10px rgba(99, 102, 241, 0.2)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cohort Heatmap */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm overflow-x-auto">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Grid className="w-4 h-4 text-cyan-500" /> Cohort Retention Heatmap
                    </h3>
                    <div className="min-w-[600px]">
                        <div className="grid grid-cols-9 gap-1 mb-2">
                            <div className="text-[10px] font-bold text-charcoal-400 dark:text-stone-500 uppercase">Signup Week</div>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                                <div key={w} className="text-[10px] font-bold text-charcoal-400 dark:text-stone-500 uppercase text-center">Week {w}</div>
                            ))}
                        </div>
                        <div className="space-y-1">
                            {cohortData.map((row, i) => (
                                <div key={i} className="grid grid-cols-9 gap-1 items-center">
                                    <div className="text-xs font-medium text-charcoal-700 dark:text-stone-300 truncate pr-2">{row.week}</div>
                                    {row.sizes.map((val, colIdx) => {
                                        if (val === null) return <div key={colIdx} className="h-10 rounded-md bg-stone-50 dark:bg-[#141413] border border-dashed border-stone-200 dark:border-[#33312e]"></div>;
                                        // Calculate opacity based on value (Week 1 is always 100%)
                                        const opacity = colIdx === 0 ? 1 : Math.max(0.1, val / 100);
                                        return (
                                            <div 
                                                key={colIdx} 
                                                className="h-10 rounded-md flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105"
                                                style={{ backgroundColor: `rgba(14, 165, 233, ${opacity})` }} // Cyan-500 base
                                            >
                                                {val}%
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Streaks */}
                <div className="bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Icons.Sparkles className="w-4 h-4 text-gold-500" /> User Streaks
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={streaks} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#33312e" opacity={0.2} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                    {streaks.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#d6d3d1' : index === 1 ? '#fbbf24' : index === 2 ? '#f59e0b' : '#d97706'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-charcoal-500 dark:text-stone-400 text-center mt-4 bg-stone-50 dark:bg-[#2a2826] p-2 rounded-lg border border-stone-100 dark:border-[#33312e]">
                        Longer streaks directly correlate with higher LTV.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminRetentionPage;
