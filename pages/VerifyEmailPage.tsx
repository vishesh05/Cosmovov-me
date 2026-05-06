import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { supabase } from '../services/supabase';

interface Props {
    onBackToLogin: () => void;
    email: string;
}

const VerifyEmailPage: React.FC<Props> = ({ onBackToLogin, email }) => {
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        setResending(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                setMessage('Error: ' + error.message);
            } else {
                setMessage('Email resent successfully!');
            }
        } catch (e: any) {
            setMessage('Failed to resend email.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-ivory-50 px-8 py-12 animate-fade-in items-center justify-center text-center">
            <div className="w-20 h-20 bg-gold-50 rounded-full flex items-center justify-center text-gold-500 mb-6 shadow-sm border border-gold-100">
                <Icons.Message className="w-10 h-10" />
            </div>

            <h1 className="text-2xl font-serif text-charcoal-900 mb-2">Check Your Email</h1>
            <p className="text-xs text-stone-500 leading-relaxed max-w-[280px] mx-auto mb-8 font-medium">
                We have sent a confirmation link to <span className="font-bold text-charcoal-800">{email}</span>. Please verify your email to access your cosmic portal.
            </p>

            <button
                onClick={onBackToLogin}
                className="px-8 py-3 bg-charcoal-900 text-ivory-50 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-charcoal-900/10 active:scale-95 transition-all"
            >
                Verified? Log In
            </button>

            <div className="mt-8 flex flex-col items-center gap-2">
                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[10px] uppercase tracking-widest text-stone-400 font-bold hover:text-gold-600 transition-colors disabled:opacity-50"
                >
                    {resending ? 'Sending...' : 'Resend Email'}
                </button>
                {message && <p className={`text-[10px] font-bold ${message.includes('Error') ? 'text-red-400' : 'text-green-500'}`}>{message}</p>}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
