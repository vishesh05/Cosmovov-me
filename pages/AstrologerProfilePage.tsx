
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Astrologer } from '../types';
import queueManager from '../services/queueManager';
import {
  AstrologerHeaderCard,
  AstrologerBioSection,
  ExpertiseChipsGrid,
  EducationExperienceCard,
  RatingsSummaryWidget,
  ReviewTile
} from '../components/AstrologerProfileComponents';

interface AstrologerProfilePageProps {
  astrologer: Astrologer;
  onBack: () => void;
  onChat: () => void;
  onCall: () => void;
}

type ModalType = 'NONE' | 'REPORT' | 'BLOCK' | 'SHARE';

const AstrologerProfilePage: React.FC<AstrologerProfilePageProps> = ({ astrologer, onBack, onChat, onCall }) => {
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [isBlocked, setIsBlocked] = useState(false);

  // Queue State
  const [queueLength, setQueueLength] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [waitTimeString, setWaitTimeString] = useState('Available Now');

  // Review Pagination State
  // Start with 3 reviews visible
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);

  // Report Form State
  const [reportReason, setReportReason] = useState('Inappropriate Behavior');
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Update queue info every 10 seconds
  useEffect(() => {
    const updateQueueInfo = () => {
      const length = queueManager.getQueueLength(astrologer.id);
      const wait = queueManager.getEstimatedWaitTime(astrologer.id);
      const waitStr = queueManager.getWaitTimeString(astrologer.id);

      setQueueLength(length);
      setWaitTime(wait);
      setWaitTimeString(waitStr);
    };

    updateQueueInfo();
    const interval = setInterval(updateQueueInfo, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [astrologer.id]);

  // Share Options
  const shareLinks = [
    { name: 'WhatsApp', color: 'bg-green-500 text-white', icon: <Icons.Message className="w-5 h-5" /> },
    { name: 'Instagram', color: 'bg-gradient-to-tr from-yellow-400 to-purple-600 text-white', icon: <Icons.Grid className="w-5 h-5" /> },
    { name: 'Facebook', color: 'bg-blue-600 text-white', icon: <Icons.Users className="w-5 h-5" /> },
    { name: 'Twitter', color: 'bg-sky-500 text-white', icon: <Icons.Activity className="w-5 h-5" /> },
    { name: 'Email', color: 'bg-stone-500 text-white', icon: <Icons.Message className="w-5 h-5" /> },
    { name: 'Copy Link', color: 'bg-stone-100 text-charcoal-900', icon: <Icons.Grid className="w-5 h-5" /> },
  ];

  const handleBlock = () => {
    setIsBlocked(true);
    setActiveModal('NONE');
  };

  const handleReportSubmit = () => {
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setActiveModal('NONE');
      setReportText('');
    }, 2000);
  };

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}: https://cosmovoc.app/astro/${astrologer.id}`);
    setActiveModal('NONE');
  };

  // Logic to load next 10 reviews
  const handleLoadMoreReviews = () => {
    setVisibleReviewsCount(prev => prev + 10);
  };

  const visibleReviews = astrologer.reviews.slice(0, visibleReviewsCount);
  const hasMoreReviews = visibleReviewsCount < astrologer.reviews.length;

  return (
    <div className="flex flex-col h-full bg-ivory-50 no-scrollbar overflow-y-auto pb-40 animate-fade-in relative">

      {/* SECTION A: Header Area */}
      <AstrologerHeaderCard astrologer={astrologer} onBack={onBack} />

      {/* SECTION B: Charges */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-charcoal-900 rounded-[32px] p-5 shadow-2xl flex justify-between items-center text-ivory-50 border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest mb-1 pl-1">Consultation Rates</span>
            <div className="flex gap-5 items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-serif">₹{astrologer.chatRatePerMin}</span>
                <span className="text-[9px] opacity-50 uppercase font-bold tracking-tighter">/min chat</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-serif">₹{astrologer.callRatePerMin}</span>
                <span className="text-[9px] opacity-50 uppercase font-bold tracking-tighter">/min call</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Icons.Wallet className="text-gold-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION C: About Section */}
      <AstrologerBioSection text={astrologer.about} />

      <div className="h-[1px] mx-6 bg-stone-100"></div>

      {/* SECTION E: Expertise Section */}
      <ExpertiseChipsGrid
        title="Knowledge & Skills"
        chips={astrologer.expertise}
        highlighted={astrologer.topExpertise}
      />

      <ExpertiseChipsGrid
        title="Topics Covered"
        chips={astrologer.topics}
        variant="gold"
      />

      <div className="h-[1px] mx-6 bg-stone-100"></div>

      {/* SECTION D: Qualifications Section */}
      <EducationExperienceCard astrologer={astrologer} />

      {/* SECTION F: Session Style */}
      <section className="px-6 py-4">
        <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Consultation Style</h2>
        <div className="flex flex-wrap gap-2">
          {astrologer.consultationStyle.map(style => (
            <div key={style} className="flex items-center gap-2 bg-ivory-200 px-3 py-2 rounded-xl text-[11px] font-medium text-charcoal-700">
              <span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>
              {style}
            </div>
          ))}
        </div>
      </section>

      <div className="h-[1px] mx-6 bg-stone-100 mt-4"></div>

      {/* SECTION G: Reviews & Ratings */}
      <RatingsSummaryWidget
        breakdown={astrologer.ratingBreakdown}
        total={astrologer.reviewCount}
        average={astrologer.rating}
      />

      <div className="px-6 space-y-1">
        {visibleReviews.map(review => (
          <ReviewTile key={review.id} review={review} />
        ))}

        {hasMoreReviews && (
          <button
            onClick={handleLoadMoreReviews}
            className="w-full py-4 text-xs font-bold text-gold-600 uppercase tracking-[0.2em] hover:text-gold-700 transition-colors bg-white border border-stone-100 rounded-2xl shadow-sm mt-4 active:scale-[0.98]"
          >
            View All Reviews
          </button>
        )}

        {!hasMoreReviews && astrologer.reviews.length > 3 && (
          <p className="text-center text-[9px] text-stone-300 uppercase tracking-widest py-4">
            End of Reviews
          </p>
        )}
      </div>

      {/* Extra Actions Footer (Report / Block / Share) */}
      <div className="px-6 py-10 flex justify-center gap-8">
        <button
          onClick={() => setActiveModal('REPORT')}
          className="flex flex-col items-center gap-1.5 grayscale hover:grayscale-0 transition-all active:scale-95"
        >
          <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-sm"><Icons.X className="w-4 h-4 text-red-500" /></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400">Report</span>
        </button>
        <button
          onClick={() => isBlocked ? setIsBlocked(false) : setActiveModal('BLOCK')}
          className="flex flex-col items-center gap-1.5 transition-all active:scale-95"
        >
          <div className={`p-3 rounded-2xl border shadow-sm ${isBlocked ? 'bg-red-50 border-red-100' : 'bg-white border-stone-200 grayscale hover:grayscale-0'}`}>
            <Icons.Users className={`w-4 h-4 ${isBlocked ? 'text-red-500' : ''}`} />
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${isBlocked ? 'text-red-500' : 'text-stone-400'}`}>
            {isBlocked ? 'Unblock' : 'Block'}
          </span>
        </button>
        <button
          onClick={() => setActiveModal('SHARE')}
          className="flex flex-col items-center gap-1.5 grayscale hover:grayscale-0 transition-all active:scale-95"
        >
          <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-sm"><Icons.Send className="w-4 h-4 text-blue-500" /></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400">Share</span>
        </button>
      </div>

      {/* Sticky Primary Actions (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-6 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-20">
        {isBlocked ? (
          <div className="text-center">
            <p className="text-xs text-red-500 font-bold uppercase tracking-widest">You have blocked this Astrologer</p>
            <button onClick={() => setIsBlocked(false)} className="text-[10px] text-stone-400 underline mt-1">Tap to Unblock</button>
          </div>
        ) : (
          <div className="max-w-[430px] mx-auto">
            {/* Wait Time Indicator */}
            {astrologer.status !== 'offline' && (
              <div className={`mb-4 p-3 rounded-2xl border-2 flex items-center justify-between ${waitTime === 0
                ? 'bg-green-50 border-green-200'
                : waitTime < 15
                  ? 'bg-yellow-50 border-yellow-200'
                  : waitTime < 30
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center gap-2">
                  <Icons.Clock className={`w-4 h-4 ${waitTime === 0 ? 'text-green-600' : waitTime < 15 ? 'text-yellow-600' : waitTime < 30 ? 'text-orange-600' : 'text-red-600'
                    }`} />
                  <span className={`text-sm font-bold ${waitTime === 0 ? 'text-green-700' : waitTime < 15 ? 'text-yellow-700' : waitTime < 30 ? 'text-orange-700' : 'text-red-700'
                    }`}>
                    {waitTimeString}
                  </span>
                </div>
                {queueLength > 0 && (
                  <span className="text-xs font-bold text-stone-500">
                    {queueLength} in queue
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onChat}
                disabled={astrologer.status === 'offline'}
                className="flex-1 bg-white border-2 border-charcoal-900 text-charcoal-900 py-4 rounded-[24px] text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:border-stone-200 flex items-center justify-center gap-3"
              >
                <Icons.Message className="w-4 h-4" />
                Chat Live
              </button>
              <button
                onClick={onCall}
                disabled={astrologer.status === 'offline'}
                className="flex-1 bg-charcoal-900 text-ivory-50 py-4 rounded-[24px] text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-charcoal-900/10 flex items-center justify-center gap-3"
              >
                <Icons.Mic className="w-4 h-4" />
                Call Now
              </button>
            </div>
          </div>
        )}
        {!isBlocked && astrologer.status === 'offline' && (
          <p className="text-center text-[9px] font-bold text-red-400 uppercase tracking-widest mt-3">
            Astrologer is currently resting. Get notified when they return.
          </p>
        )}
      </div>

      {/* --- MODALS & SHEETS --- */}

      {/* Backdrop */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
      )}

      {/* 1. REPORT MODAL */}
      {activeModal === 'REPORT' && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 animate-fade-in pointer-events-none">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl pointer-events-auto">
            {reportSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                  <Icons.Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal-900 mb-2">Report Submitted</h3>
                <p className="text-xs text-stone-500">Thank you. We will investigate this promptly.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-serif font-bold text-charcoal-900 mb-1">Report Astrologer</h3>
                <p className="text-xs text-stone-400 mb-6">Select a reason for reporting.</p>
                <div className="space-y-3 mb-6">
                  {['Inappropriate Behavior', 'Scam / Spam', 'Wrong Prediction', 'Other'].map(reason => (
                    <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        className="accent-charcoal-900 w-4 h-4"
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                      />
                      <span className="text-xs font-bold text-charcoal-700">{reason}</span>
                    </label>
                  ))}
                  <textarea
                    placeholder="Describe the incident (optional)..."
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl p-3 text-xs outline-none focus:border-gold-400 h-24 resize-none"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveModal('NONE')} className="flex-1 py-3 text-xs font-bold text-stone-400 uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                  <button onClick={handleReportSubmit} className="flex-1 bg-red-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">Submit Report</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. BLOCK MODAL */}
      {activeModal === 'BLOCK' && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 animate-fade-in pointer-events-none">
          <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl text-center pointer-events-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Icons.Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-charcoal-900 mb-2">Block Astrologer?</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-8">
              They will not be able to message you, and you won't see their profile in listings.
            </p>
            <div className="space-y-3">
              <button onClick={handleBlock} className="w-full bg-red-500 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                Yes, Block
              </button>
              <button onClick={() => setActiveModal('NONE')} className="w-full text-stone-400 py-2 text-xs font-bold uppercase tracking-widest">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHARE BOTTOM SHEET */}
      <div className={`fixed bottom-0 left-0 right-0 z-[160] bg-white rounded-t-[32px] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out ${activeModal === 'SHARE' ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-6">
          <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6"></div>
          <h3 className="text-lg font-serif font-bold text-charcoal-900 mb-6 text-center">Share Profile</h3>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {shareLinks.map((link) => (
              <button key={link.name} onClick={() => handleShare(link.name)} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-90 ${link.color}`}>
                  {link.icon}
                </div>
                <span className="text-[10px] font-bold text-stone-500 group-hover:text-charcoal-900">{link.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setActiveModal('NONE')} className="w-full py-4 bg-stone-50 rounded-2xl text-xs font-bold uppercase tracking-widest text-stone-400 hover:bg-stone-100 hover:text-charcoal-800 transition-colors">
            Cancel
          </button>
        </div>
      </div>

    </div>
  );
};

export default AstrologerProfilePage;
