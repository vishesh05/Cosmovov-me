import React from 'react';
import { Icons } from '../components/Icons';

const reportsList = [
    {
        id: 'life',
        title: 'Life Report',
        description: 'Comprehensive analysis of your entire life path, strengths, and destiny.',
        icon: <Icons.Scroll />,
        color: 'from-gold-400/20 to-gold-600/5'
    },
    {
        id: 'yearly',
        title: 'Yearly Forecast',
        description: 'Detailed month-by-month predictions for the current and upcoming year.',
        icon: <Icons.Calendar />,
        color: 'from-orange-400/20 to-orange-600/5'
    },
    {
        id: 'kundli',
        title: 'Birth Chart (Kundli)',
        description: 'Your fundamental astrological blueprint and planetary placements.',
        icon: <Icons.Grid />,
        color: 'from-cosmic-500/20 to-cosmic-100/5'
    },
    {
        id: 'love',
        title: 'Love & Compatibility',
        description: 'Deep dive into your relationship dynamics and marriage prospects.',
        icon: <Icons.Heart />,
        color: 'from-rose-400/20 to-rose-600/5'
    },
    {
        id: 'career',
        title: 'Career & Wealth',
        description: 'Astrological guidance for professional growth and financial success.',
        icon: <Icons.Briefcase />,
        color: 'from-emerald-400/20 to-emerald-600/5'
    },
    {
        id: 'health',
        title: 'Health & Wellness',
        description: 'Vedic insights into your physical vitality and potential health patterns.',
        icon: <Icons.Activity />,
        color: 'from-blue-400/20 to-blue-600/5'
    }
];

interface ReportsProps {
    onGetReport: (reportId: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ onGetReport }) => {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-6 pt-8 bg-[#FDFCFB] dark:bg-[#141413] animate-[fadeInScale_0.6s_ease-out]">

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-charcoal-900 mb-2">Premium Reports</h1>
                <p className="text-stone-500 text-sm font-medium leading-relaxed">
                    Unlock profound Vedic insights tailored specifically to your cosmic blueprint.
                </p>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-4">
                {reportsList.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => onGetReport(report.id as string)}
                        className="group relative bg-white border border-stone-200/60 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-gold-300 transition-all duration-300 cursor-pointer overflow-hidden active:scale-95"
                    >
                        {/* Background Gradient Effect */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${report.color} rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

                        <div className="relative z-10 mb-6">
                            <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-gold-500 shadow-sm mb-3 group-hover:scale-110 group-hover:bg-gold-50 transition-all duration-300">
                                <div className="scale-75">
                                    {report.icon}
                                </div>
                            </div>
                            <h3 className="font-bold text-charcoal-900 text-sm leading-tight mb-1.5">{report.title}</h3>
                            <p className="text-[10px] text-stone-400 leading-snug line-clamp-3">
                                {report.description}
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center justify-between mt-auto">
                            <span className="text-[9px] font-bold text-gold-500 uppercase tracking-widest">Get Report</span>
                            <Icons.ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-gold-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Trust Badge */}
            <div className="mt-10 mb-6 flex flex-col items-center justify-center opacity-60">
                <Icons.Sparkles className="w-6 h-6 text-gold-500 mb-2" />
                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold text-center">
                    Calculated with precision <br /> by Advanced Vedic AI
                </p>
            </div>

        </div>
    );
};

export default Reports;
