
import React, { useState } from 'react';
import { Icons } from '../Icons';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQAccordion: React.FC<{ items: FAQItem[] }> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="bg-white border border-stone-100 rounded-xl overflow-hidden transition-all duration-300">
            <button 
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <span className={`text-xs font-bold ${isOpen ? 'text-gold-600' : 'text-charcoal-900'}`}>{item.question}</span>
              <div className={`transition-transform duration-300 text-stone-300 ${isOpen ? 'rotate-180' : ''}`}>
                <Icons.ChevronRight className="w-4 h-4" />
              </div>
            </button>
            <div className={`px-4 text-xs text-stone-500 leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const QuickOptionSelector: React.FC<{ 
  options: { id: string; label: string; icon: React.ReactNode }[]; 
  onSelect: (id: string) => void;
}> = ({ options, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {options.map((opt) => (
        <button 
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className="flex flex-col items-center justify-center p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:border-gold-300 hover:shadow-md transition-all group active:scale-95"
        >
          <div className="text-stone-400 mb-2 group-hover:text-gold-500 transition-colors scale-110">
            {opt.icon}
          </div>
          <span className="text-[10px] font-bold text-charcoal-700 uppercase tracking-wide text-center">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
