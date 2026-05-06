
import React from 'react';
import { Icons } from './Icons';

export const InputField: React.FC<{ 
    label: string; 
    icon: React.ReactNode; 
    type?: string; 
    value: string; 
    onChange: (e: any) => void;
    placeholder?: string;
    onBlur?: () => void;
}> = ({ label, icon, type = "text", value, onChange, placeholder, onBlur }) => (
    <div className="group">
        <label className="block text-[10px] uppercase tracking-widest text-charcoal-800/50 mb-2 pl-1 font-serif">{label}</label>
        <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3.5 transition-all group-focus-within:border-gold-400 group-focus-within:shadow-[0_4px_20px_-4px_rgba(212,175,55,0.15)]">
            <span className="text-gold-500 opacity-70">{icon}</span>
            <input 
                type={type} 
                className="flex-1 bg-transparent outline-none text-charcoal-900 placeholder-stone-300 font-medium text-sm"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onBlur={onBlur}
            />
        </div>
    </div>
);

export const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white rounded-3xl p-6 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.03)] border border-stone-100 mb-5">
        <div className="flex items-center gap-2 mb-4">
            {icon && <span className="text-gold-500 opacity-80">{icon}</span>}
            <h3 className="font-serif text-charcoal-900 text-lg tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

export const PredictionItem: React.FC<{ title: string; text: string }> = ({ title, text }) => (
    <div className="border-b border-stone-100 last:border-none py-4 first:pt-0">
        <h4 className="text-xs font-bold text-gold-600 uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-charcoal-800/80 text-sm leading-relaxed font-light">{text}</p>
    </div>
);

export const InfoRow: React.FC<{ label: string; value: string; subValue?: string }> = ({ label, value, subValue }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-stone-50 last:border-none">
        <span className="text-xs text-charcoal-400 font-medium mt-0.5">{label}</span>
        <div className="text-right max-w-[65%]">
            <div className="text-sm text-charcoal-800 font-semibold">{value}</div>
            {subValue && <div className="text-[10px] text-charcoal-400 font-medium tracking-wide">upto {subValue}</div>}
        </div>
    </div>
);

export const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="leading-relaxed space-y-1">
      {text.split('\n').map((line, i) => {
         const parts = line.split(/(\*\*.*?\*\*)/g);
         return (
             <p key={i} className="min-h-[1em]">
                 {parts.map((part, j) => {
                     if (part.startsWith('**') && part.endsWith('**')) {
                         return <strong key={j} className="font-bold text-charcoal-900">{part.slice(2, -2)}</strong>;
                     }
                     return <span key={j}>{part}</span>;
                 })}
             </p>
         )
      })}
    </div>
  );
};

export const QuickPrompts: React.FC<{ onSelect: (t: string) => void }> = ({ onSelect }) => {
    const prompts = [
        "What are my career prospects?",
        "How is my love life looking?",
        "Any health precautions to take?",
        "Tell me about my wealth yoga."
    ];
    return (
        <div className="flex flex-col gap-2 w-full">
            {prompts.map((p, i) => (
                <button 
                    key={i} 
                    onClick={() => onSelect(p)}
                    className="w-full text-left px-4 py-3 bg-white border border-stone-100 rounded-xl text-xs text-charcoal-700 hover:bg-gold-50 hover:border-gold-200 transition-all shadow-sm font-medium"
                >
                    {p}
                </button>
            ))}
        </div>
    );
};
