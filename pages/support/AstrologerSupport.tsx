
import React, { useState } from 'react';
import { Icons } from '../../components/Icons';
import { FAQAccordion, QuickOptionSelector, FAQItem } from '../../components/support/SupportShared';
import SupportChatWindow from '../../components/support/SupportChatWindow';

interface Props {
  onBack: () => void;
}

const ASTRO_FAQS: FAQItem[] = [
  { id: '1', question: 'When are payouts processed?', answer: 'Payouts are processed weekly on Wednesdays. Ensure your bank details are verified by Monday EOD.' },
  { id: '2', question: 'How is the platform fee calculated?', answer: 'The platform fee is 20% on the gross session value. You receive 80% net earnings.' },
  { id: '3', question: 'A client was abusive/rude. What to do?', answer: 'End the session immediately and use the "Report Client" button in Session History. We take strict action against harassment.' },
  { id: '4', question: 'My "Online" status isn\'t updating.', answer: 'Check your internet connection. If the issue persists, try logging out and logging back in. Contact support if unresolved.' },
];

const ASTRO_OPTIONS = [
  { id: 'Payout Issue', label: 'Money Settlement', icon: <Icons.Wallet className="w-6 h-6" /> },
  { id: 'Client Dispute', label: 'Report Client', icon: <Icons.Users className="w-6 h-6" /> },
  { id: 'Tech Issue', label: 'App / Dashboard', icon: <Icons.Activity className="w-6 h-6" /> },
  { id: 'Profile Update', label: 'Update Data', icon: <Icons.Edit className="w-6 h-6" /> },
];

const AstrologerSupport: React.FC<Props> = ({ onBack }) => {
  const [view, setView] = useState<'HOME' | 'CHAT'>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<string>('General Support');

  const startChat = (category: string) => {
    setSelectedCategory(category);
    setView('CHAT');
  };

  if (view === 'CHAT') {
    return (
      <SupportChatWindow 
        initialCategory={selectedCategory} 
        userRole="astrologer" 
        onBack={() => setView('HOME')} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-ivory-50 animate-fade-in overflow-y-auto no-scrollbar">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-charcoal-900 transition-colors">
            <Icons.ChevronLeft />
          </button>
          <h2 className="text-xl font-serif text-charcoal-900">Scholar Support</h2>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm mb-8">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-charcoal-900 text-gold-400 rounded-full flex items-center justify-center">
                <Icons.Sparkles className="w-6 h-6" />
             </div>
             <div>
                <h3 className="font-bold text-charcoal-900">Priority Assistance</h3>
                <p className="text-xs text-stone-500">Dedicated line for our partners.</p>
             </div>
          </div>
          <button 
            onClick={() => startChat('General Support')}
            className="w-full bg-charcoal-900 text-ivory-50 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Icons.Message className="w-4 h-4" /> Chat with Agent
          </button>
        </div>

        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">Common Issues</h3>
        <QuickOptionSelector options={ASTRO_OPTIONS} onSelect={startChat} />

        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">Partner FAQs</h3>
        <FAQAccordion items={ASTRO_FAQS} />
      </div>
    </div>
  );
};

export default AstrologerSupport;
