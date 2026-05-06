import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { chatWithAstrologer, getAdviceChannel, generateDynamicSuggestions } from '../services/geminiService';
import { ChatSession, ChatMessage, BirthChartAnalysis, UserProfile } from '../types';
import { getSessions, saveSession, createNewSession, getLastActiveSessionId, deleteSession, updateSessionTitle } from '../services/chatStorage';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { TypewriterText } from '../components/chat/TypewriterText';
import { CosmoVocAvatar } from '../components/chat/CosmoVocAvatar';
import { useTheme } from '../contexts/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ChatViewProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ analysis, profile, onBack }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const { isDark: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
    const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);

    // Voice Input State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loaded = getSessions(profile);
        setSessions(loaded);
        const lastActive = getLastActiveSessionId(profile);
        if (lastActive && loaded.find(s => s.id === lastActive)) {
            setCurrentSessionId(lastActive);
        } else if (loaded.length > 0) {
            setCurrentSessionId(loaded[0].id);
        } else {
            handleNewSession();
        }

        // Cleanup speech recognition on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = async () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        if (Capacitor.isNativePlatform()) {
            try {
                const { VoiceRecorder } = await import('capacitor-voice-recorder');
                const permission = await VoiceRecorder.hasAudioRecordingPermission();
                if (!permission.value) {
                    const request = await VoiceRecorder.requestAudioRecordingPermission();
                    if (!request.value) {
                        alert("Microphone permission is required for voice input.");
                        return;
                    }
                }
            } catch (e) {
                console.error("VoiceRecorder permission error:", e);
            }
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = profile.language === 'hi' ? 'hi-IN' : 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setInput(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleNewSession = () => {
        const newSession = createNewSession();
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        saveSession(newSession, profile);
        setSidebarOpen(false);
    };

    const handleDeleteSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = deleteSession(id, profile);
        setSessions(updated);
        if (currentSessionId === id) {
            if (updated.length > 0) setCurrentSessionId(updated[0].id);
            else handleNewSession();
        }
    };

    const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSessionId(session.id);
        setEditTitle(session.title);
    };

    const handleSaveRename = () => {
        if (editingSessionId && editTitle.trim()) {
            updateSessionTitle(editingSessionId, editTitle, profile);
            setSessions(getSessions(profile));
            setEditingSessionId(null);
        }
    };

    const currentSession = sessions.find(s => s.id === currentSessionId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages, isTyping]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !currentSessionId || !currentSession) return;

        if (Capacitor.isNativePlatform()) {
            Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        }

        // Stop listening if sending
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        const updatedSession = {
            ...currentSession,
            messages: [...currentSession.messages, userMsg],
            lastModified: Date.now()
        };

        setSessions(prev => prev.map(s => s.id === currentSessionId ? updatedSession : s));
        saveSession(updatedSession, profile);
        if (!textOverride) setInput('');
        setIsTyping(true);

        const history = updatedSession.messages.map(m => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        try {
            const { response, suggestions, topic } = await chatWithAstrologer(history, userMsg.text, profile, analysis);
            const aiMsgId = (Date.now() + 1).toString();
            const aiMsg: ChatMessage = {
                id: aiMsgId,
                sender: 'ai',
                text: response,
                timestamp: new Date(),
                suggestions: [], // Start empty for shimmer
                topicDetected: topic
            };
            const finalSession = {
                ...updatedSession,
                messages: [...updatedSession.messages, aiMsg],
                lastModified: Date.now()
            };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? finalSession : s));
            saveSession(finalSession, profile);
            setAnimatingMessageId(aiMsg.id);

            // Silent secondary call for dynamic suggestions
            generateDynamicSuggestions(userMsg.text, response).then(dynamicSuggestions => {
                setSessions(prevSessions => {
                    return prevSessions.map(s => {
                        if (s.id !== currentSessionId) return s;
                        
                        const updatedMessages = s.messages.map(m => {
                            if (m.id === aiMsgId) {
                                return { ...m, suggestions: dynamicSuggestions };
                            }
                            return m;
                        });
                        
                        const newSessionObj = { ...s, messages: updatedMessages };
                        saveSession(newSessionObj, profile);
                        return newSessionObj;
                    });
                });
            }).catch(e => console.error("Dynamic suggestions failed", e));

        } catch (e) {
            console.error(e);
        } finally {
            setIsTyping(false);
        }
    };

    // --- Separated Channel Handlers (On-Demand, No Full Chat) ---

    const handleAdviceRemedies = async (parentMsg: ChatMessage) => {
        if (!currentSessionId || !currentSession) return;
        setIsTyping(true);
        try {
            const topic = parentMsg.topicDetected || 'general';
            const adviceText = await getAdviceChannel(topic, analysis, profile, parentMsg.text);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 4).toString(),
                sender: 'ai',
                text: adviceText,
                timestamp: new Date(),
                suggestions: [],
                topicDetected: topic
            };
            const updatedSession = {
                ...currentSession,
                messages: [...currentSession.messages, aiMsg],
                lastModified: Date.now()
            };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? updatedSession : s));
            saveSession(updatedSession, profile);
            setAnimatingMessageId(aiMsg.id);

            // Generate follow-ups for the advice too
            generateDynamicSuggestions(parentMsg.text || "advice and remedies", adviceText).then(dynamicSuggestions => {
                setSessions(prevSessions => {
                    return prevSessions.map(s => {
                        if (s.id !== currentSessionId) return s;
                        const msgArr = s.messages.map(m => m.id === aiMsg.id ? { ...m, suggestions: dynamicSuggestions } : m);
                        const newS = { ...s, messages: msgArr };
                        saveSession(newS, profile);
                        return newS;
                    });
                });
            });

        } catch (e) {
            console.error('Advice & Remedies error:', e);
        } finally {
            setIsTyping(false);
        }
    };

    const quickCategories = [
        { label: 'Career', icon: <Icons.Briefcase />, questions: ["How is my career outlook this year?", "Will I get a promotion soon?", "Should I switch jobs?"] },
        { label: 'Love', icon: <Icons.Heart />, questions: ["When will I find a partner?", "How is my marriage house looking?", "Compatibility advice?"] },
        { label: 'Wealth', icon: <Icons.Wallet />, questions: ["Tell me about my wealth yoga.", "Any financial risks to avoid?", "Investment tips for me?"] },
        { label: 'Health', icon: <Icons.Activity />, questions: ["General health precautions?", "My mental well-being in chart?", "Vitality and energy levels?"] },
    ];

    const getAdviceIcon = (type: string) => {
        switch (type) {
            case 'action': return <Icons.Plus />;
            case 'caution': return <Icons.X />;
            case 'timing': return <Icons.Clock />;
            case 'remedy': return <Icons.Sparkles />;
            default: return <Icons.Star />;
        }
    };

    // High Contrast Dark Mode Colors
    const colors = {
        bg: isDarkMode ? 'bg-stone-950' : 'bg-ivory-100',
        header: isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white/95 border-stone-200',
        headerText: isDarkMode ? 'text-white' : 'text-charcoal-900',
        subText: isDarkMode ? 'text-stone-400' : 'text-stone-500',

        bubbleAi: isDarkMode ? 'bg-stone-800 border border-stone-700 text-stone-100' : 'bg-white border border-stone-200 text-charcoal-800',
        bubbleUser: isDarkMode ? 'bg-stone-700 border border-stone-600 text-white' : 'bg-charcoal-900 text-ivory-50 shadow-xl shadow-charcoal-900/10',

        inputBar: isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white/90 border-stone-200',
        inputField: isDarkMode ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-200 text-charcoal-900',

        iconButton: isDarkMode ? 'text-stone-400 hover:text-white' : 'text-stone-400 hover:text-charcoal-800',
        chip: isDarkMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white hover:border-stone-500' : 'bg-white border-stone-200 text-charcoal-600 hover:bg-gold-50 hover:border-gold-300'
    };

    return (
        <div className={`flex flex-col h-full relative fade-enter-active overflow-hidden font-sans transition-colors duration-300 ${colors.bg}`}>
            <ChatSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={(id) => { setCurrentSessionId(id); setSidebarOpen(false); }}
                onNewChat={handleNewSession}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleStartRename}
                editingSessionId={editingSessionId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                onSaveRename={handleSaveRename}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />

            {/* Header */}
            <div className={`px-4 py-3 border-b flex justify-between items-center backdrop-blur-xl z-10 shrink-0 transition-colors ${colors.header}`}>
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className={`p-2 -ml-2 transition-colors ${colors.iconButton}`}>
                        <Icons.Menu />
                    </button>
                    <div>
                        <h2 className={`font-serif text-lg leading-none truncate max-w-[180px] ${colors.headerText}`}>
                            {currentSession?.title || 'Astro Chat'}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <p className={`text-[10px] uppercase tracking-widest font-bold ${isDarkMode ? 'text-[#666460]' : 'text-stone-400'}`}>CosmoVoc AI</p>
                        </div>
                    </div>
                </div>
                <button onClick={onBack} className={`p-2 transition-colors ${colors.iconButton}`}>
                    <Icons.X />
                </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 no-scrollbar bg-noise relative">
                {(!currentSession?.messages || currentSession.messages.length === 0) && (
                    <div className="flex flex-col items-center justify-center pt-8 pb-4 animate-fade-in overflow-hidden">
                        {/* Breathing Glow Avatar */}
                        <div className="relative mb-6">
                            <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${isDarkMode ? 'bg-[#c5a059]/20' : 'bg-gold-400/15'}`} style={{ animation: 'breathe 4s ease-in-out infinite' }} />
                            <div className="relative">
                                <CosmoVocAvatar isTyping={false} className="w-16 h-16" />
                            </div>
                        </div>

                        {/* Calming Greeting */}
                        <h3 className={`font-serif text-2xl mb-1 text-center ${colors.headerText}`}>
                            Namaste, {profile.name.split(/[@\s]/)[0]}
                        </h3>
                        <p className={`text-center text-[11px] max-w-[260px] mb-2 leading-relaxed font-light italic ${colors.subText}`}>
                            "The cosmos is within us. We are made of star-stuff."
                        </p>
                        <div className={`flex items-center gap-2 mb-8 ${isDarkMode ? 'text-[#666460]' : 'text-stone-300'}`}>
                            <div className="w-8 h-px bg-current"></div>
                            <Icons.Sparkles className="w-3 h-3" />
                            <div className="w-8 h-px bg-current"></div>
                        </div>

                        {/* Floating Question Rows */}
                        <div className="w-full space-y-3 overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
                            {[
                                { direction: 'left', questions: ["How is my career outlook?", "Will I find love soon?", "Tell me about my wealth yoga", "When should I start a business?", "My mental well-being in chart?"] },
                                { direction: 'right', questions: ["What is my life purpose?", "Compatibility with partner?", "Best time for investment?", "Health precautions for me?", "Should I switch careers?"] },
                                { direction: 'left', questions: ["Marriage timing prediction", "Financial risks to avoid?", "My strongest planet?", "Energy levels & vitality?", "Promotion prospects this year?"] }
                            ].map((row, rowIdx) => (
                                <div key={rowIdx} className="relative overflow-hidden h-[38px]">
                                    <div
                                        className="flex gap-2 absolute whitespace-nowrap"
                                        style={{
                                            animation: `scroll-${row.direction} ${28 + rowIdx * 4}s linear infinite`,
                                            animationDelay: `${rowIdx * 0.5}s`
                                        }}
                                    >
                                        {/* Double the items for seamless loop */}
                                        {[...row.questions, ...row.questions].map((q, qIdx) => (
                                            <button
                                                key={qIdx}
                                                onClick={() => handleSend(q)}
                                                className={`px-4 py-2 rounded-full text-[11px] font-medium transition-all active:scale-95 whitespace-nowrap border ${
                                                    isDarkMode
                                                        ? 'bg-stone-900 border-stone-800 text-stone-400 hover:border-gold-500/40 hover:text-gold-500'
                                                        : 'bg-white/80 border-stone-200 text-charcoal-600 hover:border-gold-400 hover:text-gold-600 shadow-sm'
                                                }`}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Subtle category label chips below */}
                        <div className="flex gap-2 mt-6">
                            {quickCategories.map((cat, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(cat.questions[0])}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                                        isDarkMode
                                            ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-gold-500 hover:border-gold-900'
                                            : 'bg-white border-stone-200 text-stone-400 hover:text-gold-600 hover:border-gold-300 shadow-sm'
                                    }`}
                                >
                                    <span className={`opacity-60 ${isDarkMode ? 'text-[#c5a059]' : 'text-gold-500'}`}>{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Your Cosmic Energy Card */}
                        <div className={`w-full mt-8 rounded-2xl p-[1px] ${isDarkMode ? 'bg-gradient-to-br from-[#c5a059]/40 via-[#33312e] to-[#c5a059]/20' : 'bg-gradient-to-br from-gold-400/40 via-stone-200 to-gold-400/20'}`}>
                            <div className={`rounded-2xl p-5 ${isDarkMode ? 'bg-[#1c1b19]' : 'bg-white'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Icons.MoonStar className={`w-4 h-4 ${isDarkMode ? 'text-[#c5a059]' : 'text-gold-500'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#666460]' : 'text-stone-400'}`}>Your Cosmic Energy</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Ascendant', value: analysis.ascendant, icon: <Icons.Sun className="w-3.5 h-3.5" /> },
                                        { label: 'Moon Sign', value: analysis.moonSign || analysis.planetaryDetails?.find(p => p.planet === 'Moon')?.sign || '—', icon: <Icons.Moon className="w-3.5 h-3.5" /> },
                                        { label: 'Dasha Lord', value: analysis.dashas?.[0]?.planet || '—', icon: <Icons.Star className="w-3.5 h-3.5" /> },
                                    ].map((item, i) => (
                                        <div key={i} className="text-center">
                                            <div className={`w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center ${isDarkMode ? 'bg-[#332b1e] text-[#c5a059]' : 'bg-gold-50 text-gold-500'}`}>
                                                {item.icon}
                                            </div>
                                            <div className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${isDarkMode ? 'text-[#666460]' : 'text-stone-400'}`}>{item.label}</div>
                                            <div className={`text-xs font-bold ${isDarkMode ? 'text-[#e6e4df]' : 'text-charcoal-900'}`}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* What I can help with */}
                        <div className="w-full mt-6 mb-2">
                            <div className={`flex items-center justify-center gap-2 mb-4 ${isDarkMode ? 'text-[#555250]' : 'text-stone-300'}`}>
                                <div className="flex-1 h-px bg-current"></div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#555250]' : 'text-stone-300'}`}>What I can help with</span>
                                <div className="flex-1 h-px bg-current"></div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { icon: <Icons.Eye className="w-4 h-4" />, label: 'Chart Reading' },
                                    { icon: <Icons.Clock className="w-4 h-4" />, label: 'Timing' },
                                    { icon: <Icons.Wand className="w-4 h-4" />, label: 'Remedies' },
                                    { icon: <Icons.Sparkles className="w-4 h-4" />, label: 'Predictions' },
                                ].map((feat, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 py-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-[#2a2826] text-[#888682]' : 'bg-stone-50 text-stone-400'}`} style={{ animation: `float ${3 + i * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                                            {feat.icon}
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#666460]' : 'text-stone-400'}`}>{feat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Keyframe Animations */}
                        <style>{`
                            @keyframes breathe {
                                0%, 100% { transform: scale(1); opacity: 0.4; }
                                50% { transform: scale(1.3); opacity: 0.8; }
                            }
                            @keyframes scroll-left {
                                0% { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                            }
                            @keyframes scroll-right {
                                0% { transform: translateX(-50%); }
                                100% { transform: translateX(0); }
                            }
                            @keyframes float {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-4px); }
                            }
                        `}</style>
                    </div>
                )}

                {currentSession?.messages.map((msg, idx) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in relative z-10`}>
                        <div className={`flex items-end gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.sender === 'ai' && (
                                <CosmoVocAvatar isTyping={animatingMessageId === msg.id && isTyping} className="w-8 h-8" />
                            )}
                            <div className={`flex-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${msg.sender === 'user'
                                    ? `${colors.bubbleUser} rounded-[20px] rounded-tr-none shadow-sm`
                                    : `${colors.bubbleAi} rounded-[20px] rounded-tl-none shadow-sm min-h-[44px]`
                                    }`}>
                                    {msg.sender === 'ai' ? (
                                        <TypewriterText text={msg.text} animate={msg.id === animatingMessageId} />
                                    ) : (
                                        msg.text
                                    )}
                                </div>

                                {msg.sender === 'ai' && (
                                    <div className="mt-2.5">
                                        <div className={`rounded-full p-[1px] inline-block transition-colors group ${isDarkMode ? 'bg-gradient-to-br from-[#c5a059]/30 via-[#c5a059]/10 to-[#c5a059]/30 hover:from-[#c5a059]/60 hover:to-[#c5a059]/80' : 'bg-gradient-to-br from-gold-400/30 via-gold-200/10 to-gold-400/30 hover:from-gold-300 hover:to-gold-500'}`}>
                                            <button
                                                onClick={() => handleAdviceRemedies(msg)}
                                                className={`px-3 py-[5px] rounded-full text-[10px] font-bold flex items-center gap-2 transition-colors ${
                                                    isDarkMode 
                                                        ? 'bg-stone-900 text-stone-400 group-hover:text-gold-400' 
                                                        : 'bg-stone-50 text-stone-500 group-hover:text-gold-700'
                                                }`}
                                            >
                                                <span>💊</span> <span className="pt-[1px]">Advice & Remedies</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {msg.sender === 'ai' && idx === currentSession.messages.length - 1 && (
                            <div className="mt-4 ml-10 flex flex-col gap-1.5 min-h-[82px] justify-start self-stretch pr-4 transition-all">
                                {(!msg.suggestions || msg.suggestions.length === 0) ? (
                                    <>
                                        <div className={`w-[85%] max-w-[280px] h-[35px] rounded-2xl animate-pulse ${isDarkMode ? 'bg-[#1c1b19] border border-[#33312e]' : 'bg-white border border-stone-100 shadow-sm'}`}></div>
                                        <div className={`w-[70%] max-w-[240px] h-[35px] rounded-2xl animate-pulse ${isDarkMode ? 'bg-[#1c1b19] border border-[#33312e]' : 'bg-white border border-stone-100 shadow-sm'}`}></div>
                                    </>
                                ) : (
                                    msg.suggestions.map((s, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSend(s)} 
                                            className={`px-4 py-2.5 text-[11px] leading-tight text-left rounded-2xl border transition-colors active:scale-[0.99] max-w-[90%]
                                            ${isDarkMode 
                                                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-gold-400' 
                                                : 'bg-white border-stone-200 text-charcoal-700 hover:border-gold-300 hover:text-gold-700 shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold ${isDarkMode ? 'bg-[#33312e] text-[#a8a6a1]' : 'bg-stone-100 text-stone-500'}`}>{i + 1}</span>
                                                <span className="font-medium">{s}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        <div className={`text-[9px] mt-1.5 opacity-40 px-1 font-bold tracking-widest uppercase ${msg.sender === 'user' ? 'text-right' : 'text-left ml-10'} ${isDarkMode ? 'text-[#666460]' : ''}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start items-end gap-2 relative z-10">
                        <CosmoVocAvatar isTyping={true} className="w-8 h-8" />
                        <div className={`border px-4 py-3 rounded-[20px] rounded-tl-none flex gap-2 items-center ${isDarkMode ? 'bg-[#1c1b19] border-[#33312e]' : 'bg-white border-stone-100'}`}>
                            <div className="flex items-center gap-1">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#c5a059]' : 'bg-gold-400'}`} style={{ animation: 'softPulse 1.6s ease-in-out infinite' }}></span>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#c5a059]' : 'bg-gold-400'}`} style={{ animation: 'softPulse 1.6s ease-in-out 0.3s infinite' }}></span>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#c5a059]' : 'bg-gold-400'}`} style={{ animation: 'softPulse 1.6s ease-in-out 0.6s infinite' }}></span>
                            </div>
                            <span className={`text-[10px] font-medium tracking-wider uppercase ml-1 opacity-50 ${isDarkMode ? 'text-[#a8a6a1]' : 'text-stone-400'}`}>Reading the stars</span>
                        </div>
                        <style>{`
                            @keyframes softPulse {
                                0%, 100% { opacity: 0.3; }
                                50% { opacity: 1; }
                            }
                        `}</style>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className={`p-4 border-t backdrop-blur-xl z-20 shrink-0 transition-colors ${colors.inputBar}`}>
                <div className={`border rounded-2xl px-2 py-2 flex items-center shadow-inner transition-all ${colors.inputField}`}>
                    <input
                        className={`flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium ${isDarkMode ? 'text-[#e6e4df] placeholder-[#666460]' : 'text-charcoal-900 placeholder-stone-400'}`}
                        placeholder="Ask about your chart..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />

                    {/* Mic Button */}
                    <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all mr-1 ${isListening ? 'bg-red-50 text-red-500 animate-pulse border border-red-100' : colors.iconButton}`}
                    >
                        <Icons.Mic />
                    </button>

                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className={`p-3 rounded-xl transition-all shadow-lg active:scale-90 ${isDarkMode ? 'bg-[#332b1e] text-[#e0c080] shadow-[#332b1e]/20 hover:bg-[#3d3423] disabled:opacity-30 disabled:grayscale' : 'bg-gold-500 text-white hover:bg-gold-600 shadow-gold-500/20 disabled:opacity-30 disabled:grayscale'}`}
                    >
                        <Icons.Send />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;
