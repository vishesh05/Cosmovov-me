import React from 'react';
import { Icons } from '../../components/Icons';

const AdminFinancePage: React.FC = () => {
    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payout Requests */}
            <div className="bg-charcoal-900 rounded-2xl border border-charcoal-800 p-6 shadow-xl flex flex-col h-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif font-bold text-ivory-50 flex items-center gap-2">
                        <Icons.Wallet className="w-5 h-5 text-gold-500" /> Pending Payouts
                    </h3>
                    <span className="bg-gold-500/10 text-gold-500 text-xs font-bold px-2 py-1 rounded-lg">3 Requests</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-charcoal-800/50 p-4 rounded-xl border border-charcoal-700 hover:border-gold-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-sm font-bold text-ivory-50">Dr. Sharma</div>
                                    <div className="text-[10px] text-stone-500">ID: #AST_10{i} • Bank Transfer</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-ivory-50">₹{8000 * i}</div>
                                    <div className="text-[10px] text-stone-400">Requested 2h ago</div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                <button className="flex-1 bg-green-600 hover:bg-green-500 text-charcoal-950 py-2 rounded-lg text-xs font-bold uppercase transition-colors">
                                    Approve Transfer
                                </button>
                                <button className="px-4 bg-charcoal-700 hover:bg-charcoal-600 text-stone-300 rounded-lg text-xs font-bold uppercase transition-colors">
                                    Deny
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Platform Revenue Ledger */}
            <div className="bg-charcoal-900 rounded-2xl border border-charcoal-800 p-6 shadow-xl flex flex-col h-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif font-bold text-ivory-50 flex items-center gap-2">
                        <Icons.Chart className="w-5 h-5 text-green-500" /> Revenue Ledger (1.20%)
                    </h3>
                    <button className="text-xs text-stone-400 hover:text-ivory-50">Download Report</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-charcoal-900 z-10">
                            <tr className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-charcoal-800">
                                <th className="pb-3 pl-2">Date</th>
                                <th className="pb-3">Transaction</th>
                                <th className="pb-3 text-right pr-2">Platform Cut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-800">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                <tr key={i} className="hover:bg-charcoal-800/30 transition-colors text-xs text-stone-300">
                                    <td className="py-3 pl-2 text-stone-500 font-mono">22/01 14:{30 + i}</td>
                                    <td className="py-3">
                                        <div className="font-bold text-stone-300">Session #883{i}</div>
                                        <span className="text-[9px] text-stone-500">Total: ₹500.00</span>
                                    </td>
                                    <td className="py-3 text-right pr-2 font-bold text-green-400">+₹6.00</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFinancePage;
