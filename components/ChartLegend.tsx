import React, { useState } from 'react';
import { Icons } from './Icons';

export const ChartLegend: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mx-auto flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-charcoal-500 hover:text-gold-600 hover:border-gold-300 transition-all mb-6"
            >
                <Icons.Sparkles className="w-3 h-3" />
                <span>Chart Guide</span>
            </button>
        );
    }

    return (
        <div className="max-w-[340px] mx-auto mb-6 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-stone-50 flex items-center justify-between bg-auth-cream/30">
                <h3 className="text-xs font-serif font-bold text-charcoal-900 flex items-center gap-2">
                    <Icons.Sparkles className="w-3 h-3 text-gold-500" />
                    Symbol Guide
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-charcoal-600">
                    <Icons.X className="w-3 h-3" />
                </button>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                        <span className="text-[10px] font-bold text-green-600">↑</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-charcoal-900 uppercase tracking-wide">Exalted (Uchcha)</div>
                        <p className="text-[9px] text-charcoal-500 leading-relaxed">Planet is at its highest strength and gives excellent results.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                        <span className="text-[10px] font-bold text-red-600">↓</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-charcoal-900 uppercase tracking-wide">Debilitated (Neecha)</div>
                        <p className="text-[9px] text-charcoal-500 leading-relaxed">Planet is at its weakest point; may cause struggles.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">
                        <span className="text-[8px] font-bold text-red-600">ᴿ</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-charcoal-900 uppercase tracking-wide">Retrograde (Vakri)</div>
                        <p className="text-[9px] text-charcoal-500 leading-relaxed">Moving backward. Indicates strong internal energy and karmic lessons.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                        <span className="text-[8px] font-bold text-purple-600">V</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-charcoal-900 uppercase tracking-wide">Vargottam</div>
                        <p className="text-[9px] text-charcoal-500 leading-relaxed">Planet occupies the same sign in D1 (Birth) and D9 (Navamsa). Very auspicious strengh.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0 text-orange-600">
                        <Icons.Flame className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-charcoal-900 uppercase tracking-wide">Combust (Asta)</div>
                        <p className="text-[9px] text-charcoal-500 leading-relaxed">Too close to the Sun. The planet's external ability to act is burned up.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
