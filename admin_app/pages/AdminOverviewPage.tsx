import React from 'react';
import { Icons } from '../../components/Icons';
import { useAdminAnalytics } from '../services/adminAnalytics';

const MetricCard: React.FC<{
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendVal?: string;
    color?: string;
    highlight?: boolean;
}> = ({ title, value, sub, icon, trend, trendVal, color = 'gold', highlight = false }) => (
    <div className={`rounded-2xl p-6 border transition-all relative overflow-hidden group 
        ${highlight 
            ? `bg-gradient-to-br from-${color}-50 dark:from-${color}-900/20 to-white dark:to-[#1c1b19] border-${color}-200 dark:border-${color}-800/50 shadow-md shadow-${color}-100 dark:shadow-none` 
            : 'bg-white dark:bg-[#1c1b19] border-stone-200 dark:border-[#33312e] shadow-sm hover:border-stone-300 dark:hover:border-stone-600'}`}>
        
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 dark:bg-${color}-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-${color}-500/20 transition-colors`}></div>
        
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 border border-${color}-100 dark:border-${color}-800/30`}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
                </div>
                {trend && trend !== 'neutral' && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full 
                        ${trend === 'up' 
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50' 
                            : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendVal}
                    </div>
                )}
            </div>
            
            <div className="flex-1">
                <div className="text-3xl font-serif text-charcoal-900 dark:text-ivory-50 mb-1 tracking-tight">{value}</div>
                <div className="text-xs font-bold text-charcoal-500 dark:text-stone-400 uppercase tracking-wider">{title}</div>
            </div>
            
            {sub && (
                <div className="mt-4 text-[11px] font-medium text-charcoal-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-900/40 px-3 py-2 rounded-lg border border-stone-100 dark:border-stone-800/50">
                    {sub}
                </div>
            )}
        </div>
    </div>
);

const AdminOverviewPage: React.FC = () => {
    // Poll every 60 seconds as requested
    const { data, loading } = useAdminAnalytics(60000);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1c1b19] p-5 rounded-2xl border border-stone-200 dark:border-[#33312e] shadow-sm">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-ivory-50">App Real-Time Summary</h2>
                    <p className="text-sm text-charcoal-500 dark:text-stone-400">Live aggregated metrics updating automatically.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-stone-500 bg-stone-50 dark:bg-stone-900 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-800">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Updated: {data.lastUpdated.toLocaleTimeString()}
                </div>
            </div>

            {/* Core User Metrics */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Users className="w-4 h-4 text-indigo-500" /> User Engine
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Registered Users"
                        value={data.users.totalRegistered.toLocaleString()}
                        sub={`Vs Guests: ${data.users.guestTotal.toLocaleString()}`}
                        icon={<Icons.User />}
                        trend="up"
                        trendVal={`${data.users.registeredChangePct}% vs yday`}
                        color="indigo"
                        highlight={true}
                    />
                    <MetricCard
                        title="DAU (Today)"
                        value={data.users.dau.toLocaleString()}
                        icon={<Icons.Activity />}
                        color="indigo"
                    />
                    <MetricCard
                        title="WAU / MAU"
                        value={`${(data.users.wau / 1000).toFixed(1)}k / ${(data.users.mau / 1000).toFixed(1)}k`}
                        icon={<Icons.Grid />}
                        color="indigo"
                    />
                    <MetricCard
                        title="Signups Today"
                        value={data.users.signupsToday}
                        sub={`Vs Yesterday: ${data.users.signupsYesterday}`}
                        icon={<Icons.Check />}
                        trend={data.users.signupsToday >= data.users.signupsYesterday ? 'up' : 'down'}
                        trendVal={`${Math.abs(Math.round(((data.users.signupsToday - data.users.signupsYesterday)/Math.max(1, data.users.signupsYesterday))*100))}%`}
                        color="indigo"
                    />
                </div>
            </div>

            {/* Live Engagement & AI Cost */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                        <Icons.Sparkles className="w-4 h-4 text-emerald-500" /> Live Engagement
                    </h3>
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[200px] shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
                        <div className="relative z-10">
                            <div className="text-6xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mb-2 animate-pulse">{data.users.liveOnline}</div>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Users Online Right Now</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                        <Icons.Message className="w-4 h-4 text-purple-500" /> AI Consumption (Today)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 h-[200px]">
                        <MetricCard
                            title="Chats Sent"
                            value={data.aiCost.chatsToday}
                            sub={`${(data.aiCost.tokensToday / 1000000).toFixed(2)}M Tokens`}
                            icon={<Icons.Message />}
                            color="purple"
                        />
                        <MetricCard
                            title="AI Cost Est."
                            value={`$${data.aiCost.costUsd.toFixed(2)}`}
                            sub={`₹${data.aiCost.costInr.toFixed(2)}`}
                            icon={<Icons.Activity />}
                            color="red"
                        />
                    </div>
                </div>
            </div>

            {/* Financial Overview */}
            <div>
                <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                    <Icons.Wallet className="w-4 h-4 text-gold-500" /> Revenue & Profit
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <MetricCard
                        title="Revenue Today"
                        value={`₹${data.revenue.today.toLocaleString()}`}
                        icon={<Icons.Wallet />}
                        color="gold"
                        highlight={true}
                    />
                    <MetricCard
                        title="Week / Month Revenue"
                        value={`₹${(data.revenue.thisWeek / 1000).toFixed(1)}k`}
                        sub={`Month: ₹${(data.revenue.thisMonth / 1000).toFixed(1)}k`}
                        icon={<Icons.Star />}
                        color="gold"
                    />
                    <MetricCard
                        title="Est. Profit Today"
                        value={`₹${Math.round(data.revenue.profitEstimateToday).toLocaleString()}`}
                        sub="Revenue minus AI Cost"
                        icon={<Icons.Check />}
                        color="green"
                        highlight={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
