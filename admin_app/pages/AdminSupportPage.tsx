import React from 'react';
import { Icons } from '../../components/Icons';

const AdminSupportPage: React.FC = () => {
    return (
        <div className="animate-fade-in bg-charcoal-900 rounded-2xl border border-charcoal-800 shadow-xl overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-charcoal-800 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-serif font-bold text-ivory-50">Support Tickets</h3>
                    <p className="text-xs text-stone-500 mt-1">Manage user and astrologer inquiries.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-charcoal-800 rounded-lg text-xs font-bold text-stone-400 border border-charcoal-700">Open: 5</span>
                    <span className="px-3 py-1 bg-charcoal-800 rounded-lg text-xs font-bold text-stone-400 border border-charcoal-700">Resolved: 124</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Ticket List Sidebar */}
                <div className="w-80 border-r border-charcoal-800 overflow-y-auto">
                    {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} className={`w-full text-left p-4 border-b border-charcoal-800 hover:bg-charcoal-800 transition-colors ${i === 1 ? 'bg-charcoal-800/50 border-l-4 border-l-gold-500' : 'border-l-4 border-l-transparent'}`}>
                            <div className="flex justify-between mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${i === 1 ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-400'}`}>High Priority</span>
                                <span className="text-[10px] text-stone-500">2m ago</span>
                            </div>
                            <div className="font-bold text-sm text-ivory-50 truncate">Issue with Wallet Recharge</div>
                            <div className="text-xs text-stone-400 mt-1 truncate">I added money but it's not showing...</div>
                        </button>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-charcoal-950/30">
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-xs font-bold">U</div>
                            <div className="bg-charcoal-800 p-3 rounded-2xl rounded-tl-none border border-charcoal-700 text-sm text-stone-300 max-w-md">
                                Hi, I am facing an issue with my recent recharge of 500rs. Transaction ID is #TX123.
                            </div>
                        </div>
                        <div className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-gold-600/20 text-gold-500 flex items-center justify-center text-xs font-bold">A</div>
                            <div className="bg-gold-600/10 p-3 rounded-2xl rounded-tr-none border border-gold-600/20 text-sm text-ivory-50 max-w-md">
                                Hello! I'm checking that for you right now. Please verify your email address.
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-charcoal-800 bg-charcoal-900">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type your reply..."
                                className="flex-1 bg-charcoal-950 border border-charcoal-700 rounded-xl px-4 py-3 text-sm text-ivory-50 focus:border-gold-500/50 outline-none"
                            />
                            <button className="p-3 bg-gold-600 hover:bg-gold-500 text-charcoal-950 rounded-xl shadow-lg transition-colors">
                                <Icons.Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSupportPage;
