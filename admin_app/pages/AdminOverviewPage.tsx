import React from 'react';
import { Icons } from '../../components/Icons';

const StatCard: React.FC<{
    title: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendVal?: string;
    color?: string;
}> = ({ title, value, sub, icon, trend, trendVal, color = 'gold' }) => (
    <div className="bg-charcoal-900 rounded-2xl p-6 border border-charcoal-800 shadow-xl relative overflow-hidden group hover:border-charcoal-700 transition-colors">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-${color}-500/10 transition-colors`}></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-charcoal-800 text-${color}-400 border border-charcoal-700`}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendVal}
                    </div>
                )}
            </div>
            <div className="text-3xl font-serif text-ivory-50 mb-1">{value}</div>
            <div className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">{title}</div>
            <div className="mt-4 text-[10px] text-stone-500">{sub}</div>
        </div>
    </div>
);

const AdminOverviewPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value="₹1,24,500"
                    sub="Platform Fee (1.20%) collected"
                    icon={<Icons.Wallet />}
                    trend="up"
                    trendVal="12%"
                    color="gold"
                />
                <StatCard
                    title="Active Astrologers"
                    value="42"
                    sub="3 pending verification"
                    icon={<Icons.Star />}
                    trend="up"
                    trendVal="4"
                    color="indigo"
                />
                <StatCard
                    title="Active Users"
                    value="1,850"
                    sub="125 new this week"
                    icon={<Icons.Users />}
                    trend="up"
                    trendVal="8%"
                    color="cyan"
                />
                <StatCard
                    title="Completed Sessions"
                    value="3,402"
                    sub="Average rating 4.8/5"
                    icon={<Icons.Message />}
                    trend="up"
                    trendVal="15%"
                    color="green"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-charcoal-900 rounded-2xl border border-charcoal-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif font-bold text-ivory-50">Recent Transactions</h3>
                        <button className="text-xs text-gold-400 font-bold uppercase tracking-wider hover:text-gold-300">View All</button>
                    </div>
                    <div className="space-y-4">
                        {/* Mock Transaction Rows */}
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-charcoal-800/50 hover:bg-charcoal-800 transition-colors border border-charcoal-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-900/20 text-green-400 flex items-center justify-center">
                                        <Icons.Check className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-ivory-50">Payout to Astrologer #{100 + i}</div>
                                        <div className="text-[10px] text-stone-500">Today, 10:3{i} AM</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-ivory-50">₹{(i * 1250).toLocaleString()}</div>
                                    <div className="text-[10px] text-green-400 font-medium">Completed</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-charcoal-900 rounded-2xl border border-charcoal-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif font-bold text-ivory-50">Pending Actions</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.Activity className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs font-bold text-yellow-500 uppercase">Verification</span>
                            </div>
                            <p className="text-sm text-ivory-50 font-medium">3 New Astrologers waiting for approval</p>
                            <button className="mt-3 w-full py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold uppercase hover:bg-yellow-500/30 transition-colors">Review</button>
                        </div>

                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Icons.Message className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-500 uppercase">Support</span>
                            </div>
                            <p className="text-sm text-ivory-50 font-medium">5 Unresolved user tickets</p>
                            <button className="mt-3 w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-500/30 transition-colors">View Tickets</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
