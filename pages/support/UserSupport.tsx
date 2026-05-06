
import React, { useState } from 'react';
import { Icons } from '../../components/Icons';
import { FAQAccordion, QuickOptionSelector, FAQItem } from '../../components/support/SupportShared';
import SupportChatWindow from '../../components/support/SupportChatWindow';

interface Props {
  onBack: () => void;
}

const USER_FAQS: FAQItem[] = [
  { id: '1', question: 'How do I request a refund?', answer: 'Refunds can be requested within 24 hours of a failed or unsatisfactory session. Go to Transaction History > Select Transaction > Report Issue.' },
  { id: '2', question: 'My wallet recharge failed but money was deducted.', answer: 'Please wait for 15 minutes as payment gateways sometimes have delays. If the balance is not updated, start a chat with the Transaction ID.' },
  { id: '3', question: 'Are the astrologers verified?', answer: 'Yes, all our astrologers undergo a 10-step verification process including knowledge tests and interview panels.' },
  { id: '4', question: 'How accurate are the predictions?', answer: 'Astrology provides guidance based on planetary positions. While our experts strive for high accuracy, free will also plays a role in life events.' },
];

const USER_OPTIONS = [
  { id: 'Transaction Issue', label: 'Payment / Refund', icon: <Icons.Wallet className="w-6 h-6" /> },
  { id: 'Astrology Feedback', label: 'Session Issue', icon: <Icons.Star className="w-6 h-6" /> },
  { id: 'App Bug', label: 'App Glitch', icon: <Icons.Activity className="w-6 h-6" /> },
  { id: 'General Inquiry', label: 'Other', icon: <Icons.Message className="w-6 h-6" /> },
];

const UserSupport: React.FC<Props> = ({ onBack }) => {
  const [view, setView] = useState<'HOME' | 'CHAT'>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<string>('General Inquiry');

  const startChat = (category: string) => {
    setSelectedCategory(category);
    setView('CHAT');
  };

  if (view === 'CHAT') {
    return (
      <SupportChatWindow 
        initialCategory={selectedCategory} 
        userRole="user" 
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
          <h2 className="text-xl font-serif text-charcoal-900">Help & Support</h2>
        </div>

        <div className="bg-charcoal-900 rounded-[32px] p-6 text-ivory-50 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-400">
              <Icons.Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif mb-2">How can we help?</h3>
            <p className="text-xs text-stone-400 mb-6 max-w-[200px] mx-auto leading-relaxed">
              Select a topic below to chat with our support team instantly.
            </p>
            <button 
              onClick={() => startChat('General Inquiry')}
              className="bg-white text-charcoal-900 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Start Live Chat
            </button>
          </div>
        </div>

        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">Quick Select Issue</h3>
        <QuickOptionSelector options={USER_OPTIONS} onSelect={startChat} />

        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">Frequently Asked Questions</h3>
        <FAQAccordion items={USER_FAQS} />
      </div>
    </div>
  );
};

export default UserSupport;
