import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { getCitySuggestions } from '../services/geminiService';
import { UserProfile } from '../types';
import { DatePickerWheel, TimePickerWheel } from '../components/ScrollWheelPicker';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = parseInt(parts[2]);
    const m = parseInt(parts[1]) - 1;
    const y = parts[0];
    return `${d} ${MONTH_NAMES[m]} ${y}`;
};

const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0]);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m} ${ampm}`;
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState<'forward' | 'backward'>('forward');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UserProfile>({ 
      name: '', gender: 'male' as const, date: '', 
      time: '', location: '', language: 'en' 
  });
  
  const [timeSkipped, setTimeSkipped] = useState(false);

  useEffect(() => {
     if (!formData.date) {
         setFormData(prev => ({ ...prev, date: '2000-06-15' }));
     }
  }, []);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<any>(null);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, location: val }));
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (val.length >= 3) {
      setLoading(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await getCitySuggestions(val);
          if (results?.length) {
            setSuggestions(results);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        } catch (err) { setShowSuggestions(false); }
        finally { setLoading(false); }
      }, 400);
    } else {
      setShowSuggestions(false);
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (city: string) => {
    setFormData(prev => ({ ...prev, location: city }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const nextStep = () => {
      setError(''); setSlideDir('forward');
      if (step === 1) {
          if (!formData.name) return setError('Please enter your name.'); setStep(2);
      } else if (step === 2) {
          if (!formData.gender) return setError('Please select a gender.'); setStep(3);
      } else if (step === 3) {
          if (!formData.date) return setError('Please select your birth date.'); setStep(4);
      } else if (step === 4) {
          if (!timeSkipped && !formData.time) {
              setFormData(prev => ({ ...prev, time: '12:00' }));
          }
          setStep(5);
      } else if (step === 5) {
          if (!formData.location) return setError('Please enter your birth place.');
          onComplete(formData);
      }
  };

  const prevStep = () => {
      setError(''); setSlideDir('backward');
      if (step > 1) setStep(step - 1); 
      else onBack();
  };

  const handleSkipTime = () => {
      setTimeSkipped(true);
      // Default to 12:00 noon rather than '' — an empty time string produces an
      // invalid ISO date that causes the engine to fall back to today's date.
      setFormData(prev => ({ ...prev, time: '12:00' }));
      setStep(5);
  };

  const getAnimationClass = () => slideDir === 'forward' ? 'animate-[slideInRight_0.3s_ease-out]' : 'animate-[slideInLeft_0.3s_ease-out]';
  
  const renderSubHeader = (title: string, subtitle: string) => (
      <div className="w-full flex flex-col items-center mb-10 relative">
          <button onClick={prevStep} className="absolute left-0 top-0 text-stone-400 hover:text-charcoal-900 transition-colors p-2 -ml-2 group z-20">
              <Icons.ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex gap-2 mb-8 h-2 items-center justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i < step ? 'w-8 bg-gradient-to-r from-gold-400 to-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'w-2 bg-stone-200'}`} />
              ))}
          </div>
          <h2 className="text-3xl font-serif text-charcoal-900 tracking-[0.05em] drop-shadow-sm text-center h-10 flex items-center justify-center">{title}</h2>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mt-3 h-3 flex items-center justify-center">{subtitle}</p>
      </div>
  );

  const inputClasses = "w-full bg-transparent border-0 border-b-[1px] border-stone-300 py-3 px-1 text-base font-medium text-charcoal-900 outline-none focus:border-gold-500 focus:ring-0 transition-all duration-300 placeholder:text-stone-400 hover:border-stone-400";
  const primaryBtnClasses = "relative overflow-hidden bg-charcoal-900 text-gold-400 py-4 rounded-[20px] font-bold tracking-[0.15em] uppercase text-[11px] shadow-2xl shadow-charcoal-900/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-charcoal-900/25 active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed group";

  return (
    <div className="flex flex-col h-full bg-[#fdfcfb] px-6 py-10 overflow-hidden relative w-full font-sans">
      <style>{`
          @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>

      <div className={`w-full max-w-sm mx-auto h-full flex flex-col justify-start pt-4 relative z-10 ${getAnimationClass()}`}>
          {renderSubHeader(
              step === 1 ? "What's your name?" : step === 2 ? "Select your gender" : step === 3 ? "Select birth date" : step === 4 ? "Select birth time" : "Enter birth place",
              `Step ${step} of 5`
          )}

          <div className="w-full space-y-6">
              {step === 1 && (
                  <div className="space-y-2">
                      <input type="text" autoFocus className={inputClasses} placeholder="Your full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && nextStep()} />
                  </div>
              )}

              {step === 2 && (
                  <div className="grid grid-cols-1 gap-3">
                      {['Male', 'Female', 'Other'].map(g => (
                          <button key={g} onClick={() => { setFormData({ ...formData, gender: g.toLowerCase() as any }); nextStep(); }} className={`py-4 rounded-[16px] border transition-all text-sm font-semibold tracking-wide ${formData.gender === g.toLowerCase() ? 'bg-charcoal-900 border-charcoal-900 text-gold-400 shadow-[0_8px_20px_rgba(0,0,0,0.15)] scale-[1.02]' : 'bg-white border-stone-200/60 text-charcoal-800 hover:border-stone-300 hover:bg-stone-50'}`}>
                              {g}
                          </button>
                      ))}
                  </div>
              )}

              {step === 3 && (
                  <div className="space-y-6 pt-0 animate-fade-in">
                      <div className="bg-white border border-stone-100 rounded-[28px] overflow-hidden shadow-sm">
                          <DatePickerWheel 
                              value={formData.date} 
                              onChange={(date) => setFormData(prev => ({ ...prev, date }))} 
                          />
                      </div>
                      <div className="flex justify-center flex-col items-center text-[10px] font-bold tracking-widest uppercase text-stone-400">
                          <div className="flex items-center">
                              <Icons.Calendar className="w-4 h-4 mr-2" />
                              {formatDisplayDate(formData.date || '2000-06-15')}
                          </div>
                      </div>
                  </div>
              )}

              {step === 4 && (
                  <div className="space-y-6 pt-0 animate-fade-in">
                      <div className="bg-white border border-stone-100 rounded-[28px] overflow-hidden shadow-sm flex justify-center">
                          <TimePickerWheel 
                              value={formData.time || '12:00'} 
                              onChange={(time) => { setFormData(prev => ({ ...prev, time })); setTimeSkipped(false); }} 
                          />
                      </div>
                      <div className="flex justify-center flex-col items-center text-[10px] font-bold tracking-widest uppercase text-stone-400">
                          <div className="flex items-center">
                              <Icons.Clock className="w-4 h-4 mr-2" />
                              {timeSkipped ? 'Time Skipped' : formatDisplayTime(formData.time || '12:00')}
                          </div>
                      </div>
                  </div>
              )}

              {step === 5 && (
                  <div className="space-y-2 relative pt-2">
                      <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none text-stone-400 z-10"><Icons.MapPin className="w-4 h-4" /></div>
                      <input type="text" autoFocus className={`${inputClasses} pl-8 pr-10`} placeholder="Search city..." value={formData.location} onChange={handleLocationChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onKeyDown={e => e.key === 'Enter' && !showSuggestions && nextStep()} />
                      {loading && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 mt-1">
                              <div className="w-4 h-4 border-2 border-stone-200 border-t-gold-500 rounded-full animate-spin"></div>
                          </div>
                      )}
                      {showSuggestions && suggestions.length > 0 && (
                          <ul className="absolute z-50 w-full bg-white border border-stone-200 rounded-[16px] mt-2 shadow-xl py-2 max-h-56 overflow-y-auto no-scrollbar">
                              {suggestions.map((city, idx) => (
                                  <li key={idx} onClick={() => handleSelectSuggestion(city)} className="px-5 py-3 text-charcoal-800 hover:bg-stone-50 hover:text-charcoal-900 cursor-pointer text-sm font-medium border-b border-stone-100 last:border-none flex items-center gap-3 transition-colors">
                                      {city}
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              )}

              {error && <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>}

              <div className="flex gap-3 pt-4 w-full">
                  {step === 4 && (
                      <button onClick={handleSkipTime} className="flex-[0.8] bg-transparent border border-stone-200/60 text-stone-400 hover:text-charcoal-800 py-4 rounded-[20px] text-[11px] uppercase font-bold tracking-wide transition-all hover:bg-stone-50 active:scale-[0.97]">
                          Skip
                      </button>
                  )}
                  <button onClick={nextStep} disabled={loading} className={`${primaryBtnClasses} flex-[2] w-full`}>
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      {loading ? <div className="w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin"></div> : <span>{step === 5 ? 'Generate Kundli' : 'Continue'}</span>}
                  </button>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Onboarding;
