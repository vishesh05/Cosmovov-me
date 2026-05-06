import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Icons } from '../components/Icons';
import { UserProfile } from '../types';
import { getCitySuggestions } from '../services/geminiService';
import { normalizeDOB } from '../services/auth';


interface WelcomeFlowProps {
    onLogin: (profile: UserProfile, email: string, role: 'user' | 'admin') => void;
    onExploreAsGuest: () => void;
    hideGuestOption?: boolean;
    initialMode?: 'login' | 'signup' | 'landing';
}

type FlowState = 'landing' | 'login' | 'signup';

import { DatePickerWheel, TimePickerWheel } from '../components/ScrollWheelPicker';

const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onLogin, onExploreAsGuest, hideGuestOption, initialMode = 'landing' }) => {
    // Flow Management
    const [flow, setFlow] = useState<FlowState>(initialMode);
    const [loginStep, setLoginStep] = useState(1);
    const [signupStep, setSignupStep] = useState(1);

    // Animation Direction
    const [slideDir, setSlideDir] = useState<'forward' | 'backward'>('forward');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
    const [date, setDate] = useState('2000-06-15');
    const [time, setTime] = useState('12:00');
    const [location, setLocation] = useState('');

    const [timeSkipped, setTimeSkipped] = useState(false);

    const handleSkipTime = () => {
        setTimeSkipped(true);
        setTime('12:00'); // Default to noon — empty string causes engine to fall back to today's date
        setSignupStep(5);
    };

    // UI State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<any>(null);

    // Initial Splash Animation
    const [isAppearing, setIsAppearing] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setIsAppearing(false), 100);
        return () => clearTimeout(timer);
    }, []);

    const changeFlow = (newFlow: FlowState) => {
        setError('');
        setSlideDir('forward');
        setFlow(newFlow);
        if (newFlow === 'login') setLoginStep(1);
        if (newFlow === 'signup') setSignupStep(1);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocation(val);
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
        setLocation(city);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const executeLogin = async () => {
        if (!password || !email) { return setError('Please enter your password.'); }
        if (email.toLowerCase() === 'admin@admin.com' && password === 'admin') {
            onLogin({ name: 'Administrator', gender: 'other', date: '', time: '', location: 'Celestial HQ', language: 'en' }, email, 'admin');
            return;
        }
        setLoading(true); setError('');
        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            if (data.user) {
                onLogin({
                    name: data.user.user_metadata.name || data.user.user_metadata.full_name || 'User',
                    gender: data.user.user_metadata.gender || 'other',
                    date: normalizeDOB(data.user.user_metadata.dob),
                    time: data.user.user_metadata.tob || '',
                    location: data.user.user_metadata.place_of_birth || '',
                    language: 'en'
                }, email, 'user');
            }
        } catch (err: any) { setError(err.message || 'Authentication failed.'); }
        finally { setLoading(false); }
    };

    const executeSignUp = async () => {
        if (!email || !password || password.length < 6) return setError('Valid email and 6+ char password required.');
        setLoading(true); setError('');
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email, password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: { full_name: name, name: name, gender, dob: date, tob: time, place_of_birth: location }
                }
            });
            if (signUpError) throw signUpError;
            // If user skipped time selection, default to 12:00 noon so the engine
            // always receives a valid time string (empty string causes Invalid Date → today's chart).
            const safeTime = time && time.trim() ? time.trim() : '12:00';
            onLogin({ name, gender: gender as any || 'other', date, time: safeTime, location, language: 'en' }, email, 'user');
        } catch (err: any) { setError(err.message || "An unexpected error occurred."); }
        finally { setLoading(false); }
    };

    const nextLoginStep = () => {
        setError('');
        if (loginStep === 1) {
            if (!email || !email.includes('@')) return setError('Please enter a valid email.');
            setSlideDir('forward'); setLoginStep(2);
        } else if (loginStep === 2) { executeLogin(); }
    };

    const prevLoginStep = () => {
        setError(''); setSlideDir('backward');
        if (loginStep === 2) setLoginStep(1); else setFlow('landing');
    };

    const nextSignupStep = () => {
        setError(''); setSlideDir('forward');
        if (signupStep === 1) {
            if (!name) return setError('Please enter your name.'); setSignupStep(2);
        } else if (signupStep === 2) {
            if (!gender) return setError('Please select a gender.'); setSignupStep(3);
        } else if (signupStep === 3) {
            if (!date) return setError('Please select your birth date.'); setSignupStep(4);
        } else if (signupStep === 4) {
            setSignupStep(5);
        } else if (signupStep === 5) {
            if (!location) return setError('Please enter your birth place.'); setSignupStep(6);
        } else if (signupStep === 6) { executeSignUp(); }
    };

    const prevSignupStep = () => {
        setError(''); setSlideDir('backward');
        if (signupStep > 1) setSignupStep(signupStep - 1); else setFlow('landing');
    };

    const getAnimationClass = () => slideDir === 'forward' ? 'animate-[slideInRight_0.3s_ease-out]' : 'animate-[slideInLeft_0.3s_ease-out]';
    const renderSubHeader = (title: string, subtitle: string, progress: number, total: number, onBack: () => void) => (
        <div className="w-full flex flex-col items-center mb-10 relative">
            <button onClick={onBack} className="absolute left-0 top-0 text-stone-400 hover:text-charcoal-900 transition-colors p-2 -ml-2 group z-20">
                <Icons.ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-2 mb-8 h-2 items-center justify-center">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i < progress ? 'w-8 bg-gradient-to-r from-gold-400 to-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'w-2 bg-stone-200'}`} />
                ))}
            </div>
            <h2 className="text-3xl font-serif text-charcoal-900 tracking-[0.05em] drop-shadow-sm text-center h-10 flex items-center justify-center">{title}</h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mt-3 h-3 flex items-center justify-center">{subtitle}</p>
        </div>
    );

    const inputClasses = "w-full bg-transparent border-0 border-b-[1px] border-stone-300 py-3 px-1 text-base font-medium text-charcoal-900 outline-none focus:border-gold-500 focus:ring-0 transition-all duration-300 placeholder:text-stone-400 hover:border-stone-400";
    const primaryBtnClasses = "w-full relative overflow-hidden bg-charcoal-900 text-gold-400 py-4 rounded-[20px] font-bold tracking-[0.15em] uppercase text-[11px] shadow-2xl shadow-charcoal-900/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-charcoal-900/25 active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed group";

    return (
        <div className="flex flex-col h-full bg-transparent px-6 py-10 overflow-hidden relative w-full items-center justify-center font-sans">
            <style>{`
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                @keyframes float-medium { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
                @keyframes twinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.6; } }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
            `}</style>

            {/* Celestial Ambient Elements matches Splash Screen */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Floating Planets & Elements */}
                <div className="absolute top-16 left-12 opacity-40 animate-[float-slow_4s_ease-in-out_infinite]">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="12" fill="#D4AF37" fillOpacity="0.1" />
                        <circle cx="20" cy="20" r="11.5" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>
                </div>
                <div className="absolute top-24 right-10 opacity-30 animate-[float-medium_6s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                        <path d="M35 15C35 26.0457 26.0457 35 15 35C13.606 35 12.2541 34.8576 10.9546 34.5884C14.7709 38.5606 20.1009 41 26 41C37.0457 41 46 32.0457 46 21C46 13.626 42.0016 7.18561 36.0355 3.65476C35.3615 7.19934 35 10.8582 35 15Z" fill="#C5A059" />
                    </svg>
                </div>
                <div className="absolute bottom-32 left-8 opacity-40 animate-[float-medium_6s_ease-in-out_infinite]">
                    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                        <ellipse cx="40" cy="30" rx="35" ry="10" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6" />
                        <circle cx="40" cy="30" r="12" fill="#F2F0EB" stroke="#D4AF37" strokeWidth="0.5" />
                        <path d="M10 30C10 32.7614 23.4315 35 40 35C56.5685 35 70 32.7614 70 30" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="4 2" />
                    </svg>
                </div>
                <div className="absolute bottom-20 right-16 opacity-30 animate-[float-slow_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <circle cx="15" cy="15" r="4" fill="#4F5D75" fillOpacity="0.4" />
                        <circle cx="15" cy="15" r="8" stroke="#4F5D75" strokeWidth="0.3" />
                    </svg>
                </div>

                {/* Twinkling Stars */}
                <div className="absolute top-1/4 left-1/3 animate-twinkle" style={{ animationDelay: '0.5s' }}><Icons.Sparkles className="text-gold-400 opacity-50" /></div>
                <div className="absolute bottom-1/4 right-1/4 animate-twinkle scale-75" style={{ animationDelay: '1.2s' }}><Icons.Sparkles className="text-gold-400 opacity-50" /></div>
                <div className="absolute top-1/2 right-1/4 animate-twinkle scale-50" style={{ animationDelay: '2.5s' }}><Icons.Star className="text-gold-400 opacity-50" /></div>

                {/* Faint Constellation Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 800">
                    <path d="M50 100 L120 180 L80 250 L150 300" stroke="#2D2A26" strokeWidth="0.5" fill="none" />
                    <path d="M300 600 L350 520 L280 480 L320 400" stroke="#2D2A26" strokeWidth="0.5" fill="none" />
                    <path d="M100 700 L180 650 L140 580" stroke="#2D2A26" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            <div className={`w-full max-w-sm h-[500px] flex flex-col transition-all duration-700 ease-out z-10 ${isAppearing ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>

                {flow === 'landing' && (
                    <div className="w-full h-full flex flex-col items-center justify-center animate-[fadeInScale_0.6s_ease-out]">
                        <h1 className="text-[2.5rem] font-serif text-charcoal-900 tracking-[0.12em] uppercase text-center drop-shadow-sm mt-12 mb-3">Welcome</h1>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-14 text-center">Begin Journey</p>

                        <div className="w-full space-y-4 flex flex-col px-2">
                            <button onClick={() => changeFlow('login')} className={primaryBtnClasses}>
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                <span>Login</span>
                            </button>
                            <button onClick={() => changeFlow('signup')} className="w-full bg-white border border-stone-200/60 text-charcoal-900 py-4 rounded-[20px] font-bold tracking-[0.15em] uppercase text-[11px] shadow-sm transition-all hover:border-gold-400/50 hover:bg-stone-50 hover:scale-[1.02] active:scale-[0.98]">
                                Sign Up
                            </button>

                            {!hideGuestOption && (
                                <div className="flex flex-col items-center mt-8">
                                    <div className="flex items-center gap-4 py-4 w-full opacity-60">
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-stone-300"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Guest</span>
                                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-stone-300"></div>
                                    </div>
                                    <button
                                        onClick={onExploreAsGuest}
                                        className="w-14 h-14 rounded-full bg-white border border-stone-200/60 shadow-sm flex items-center justify-center text-stone-400 hover:text-charcoal-900 transition-all duration-300 hover:scale-[1.05] hover:shadow-md hover:border-stone-300 active:scale-[0.95] group"
                                        title="Continue as Guest"
                                    >
                                        <Icons.User className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {flow === 'login' && (
                    <div className={`w-full h-full flex flex-col justify-start pt-4 ${getAnimationClass()}`}>
                        {renderSubHeader('Welcome Back', 'Log in to your portal', loginStep, 2, prevLoginStep)}

                        <div className="w-full space-y-8">
                            {loginStep === 1 && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email</label>
                                    <input type="email" autoFocus className={inputClasses} placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && nextLoginStep()} />
                                </div>
                            )}

                            {loginStep === 2 && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} autoFocus className={`${inputClasses} tracking-widest pr-12`} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && executeLogin()} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-charcoal-900 transition-colors">
                                            <span className="text-[10px] uppercase font-bold tracking-wider">{showPassword ? 'Hide' : 'Show'}</span>
                                        </button>
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <button className="text-[10px] text-gold-500 hover:text-gold-400 font-bold uppercase tracking-wider transition-colors pt-2">Forgot password?</button>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>}

                            <button onClick={loginStep === 1 ? nextLoginStep : executeLogin} disabled={loading} className={`${primaryBtnClasses} mt-4`}>
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                {loading ? <div className="w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin"></div> : <span>{loginStep === 1 ? 'Continue' : 'Login'}</span>}
                            </button>
                        </div>
                    </div>
                )}

                {flow === 'signup' && (
                    <div className={`w-full h-full flex flex-col justify-start pt-4 ${getAnimationClass()}`}>
                        {renderSubHeader(
                            signupStep === 1 ? "What's your name?" : signupStep === 2 ? "Select your gender" : signupStep === 3 ? "Select birth date" : signupStep === 4 ? "Select birth time" : signupStep === 5 ? "Enter birth place" : "Final Step",
                            `Step ${signupStep} of 6`, signupStep, 6, prevSignupStep
                        )}

                        <div className="w-full space-y-6">
                            {signupStep === 1 && (
                                <div className="space-y-2">
                                    <input type="text" autoFocus className={inputClasses} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && nextSignupStep()} />
                                </div>
                            )}

                            {signupStep === 2 && (
                                <div className="grid grid-cols-1 gap-3">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button key={g} onClick={() => setGender(g.toLowerCase() as any)} className={`py-4 rounded-[16px] border transition-all text-sm font-semibold tracking-wide ${gender === g.toLowerCase() ? 'bg-charcoal-900 border-charcoal-900 text-gold-400 shadow-[0_8px_20px_rgba(0,0,0,0.15)] scale-[1.02]' : 'bg-white border-stone-200/60 text-charcoal-800 hover:border-stone-300 hover:bg-stone-50'}`}>
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {signupStep === 3 && (
                                <div className="space-y-6 pt-0 animate-fade-in">
                                    <div className="bg-white border border-stone-100 rounded-[28px] overflow-hidden shadow-sm pt-2">
                                        <DatePickerWheel value={date} onChange={setDate} />
                                    </div>
                                </div>
                            )}

                            {signupStep === 4 && (
                                <div className="space-y-6 pt-0 animate-fade-in">
                                    <div className="bg-white border border-stone-100 rounded-[28px] overflow-hidden shadow-sm flex justify-center pt-2">
                                        <TimePickerWheel value={time} onChange={(v) => { setTime(v); setTimeSkipped(false); }} />
                                    </div>
                                    <div className="flex justify-center flex-col items-center text-[10px] font-bold tracking-widest uppercase text-stone-400 mt-2">
                                        <div className="flex items-center">
                                            <Icons.Clock className="w-4 h-4 mr-2" />
                                            {timeSkipped ? 'Time Skipped' : time}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {signupStep === 5 && (
                                <div className="space-y-2 relative pt-2">
                                    <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none text-stone-400 z-10"><Icons.MapPin className="w-4 h-4" /></div>
                                    <input type="text" autoFocus className={`${inputClasses} pl-8 pr-10`} placeholder="Search city..." value={location} onChange={handleLocationChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} onKeyDown={e => e.key === 'Enter' && !showSuggestions && nextSignupStep()} />
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

                            {signupStep === 6 && (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email</label>
                                        <input type="email" autoFocus className={inputClasses} placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                    <div className="space-y-1 relative">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} className={`${inputClasses} pr-12`} placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && executeSignUp()} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-charcoal-900">
                                                <span className="text-[10px] uppercase font-bold tracking-wider">{showPassword ? 'Hide' : 'Show'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>}

                            <div className="flex gap-3 pt-4">
                                {signupStep === 4 && (
                                    <button onClick={handleSkipTime} className="flex-[0.8] bg-transparent border border-stone-200/60 text-stone-400 hover:text-charcoal-800 py-4 rounded-[20px] text-[11px] uppercase font-bold tracking-wide transition-all hover:bg-stone-50 active:scale-[0.97]">
                                        Skip
                                    </button>
                                )}
                                <button onClick={signupStep === 6 ? executeSignUp : nextSignupStep} disabled={loading} className={`${primaryBtnClasses} flex-[2]`}>
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                    {loading ? <div className="w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin"></div> : <span>{signupStep === 6 ? 'Create Account' : 'Continue'}</span>}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomeFlow;
