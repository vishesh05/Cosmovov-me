import React, { useRef, useEffect, useState, useCallback } from 'react';

const generateArray = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => String(start + i).padStart(2, '0'));

export const DAYS = generateArray(1, 31);
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const YEARS = generateArray(1940, new Date().getFullYear()).reverse();
export const HOURS = generateArray(0, 23);
export const MINUTES = generateArray(0, 59);

interface WheelPickerProps {
    items: string[];
    value: string;
    onChange: (v: string) => void;
    label?: string;
    width?: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ items, value, onChange, label, width = "w-20" }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const itemHeight = 44;
    const isScrolling = useRef(false);
    const scrollTimeout = useRef<any>(null);

    useEffect(() => {
        const idx = items.indexOf(value);
        if (idx !== -1 && listRef.current) {
            // Check if already practically there to prevent jitter
            const currentScroll = listRef.current.scrollTop;
            const targetScroll = idx * itemHeight;
            if (Math.abs(currentScroll - targetScroll) > 2) {
                listRef.current.scrollTop = targetScroll;
            }
        }
    }, [items, value]);

    const handleScroll = () => {
        if (!listRef.current) return;

        clearTimeout(scrollTimeout.current);
        isScrolling.current = true;

        scrollTimeout.current = setTimeout(() => {
            isScrolling.current = false;
            const top = listRef.current!.scrollTop;
            const idx = Math.round(top / itemHeight);
            if (items[idx] && items[idx] !== value) {
                onChange(items[idx]);
            }
        }, 100);
    };

    return (
        <div className={`flex flex-col items-center ${width}`}>
            {label && <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{label}</span>}

            <div className="relative w-full h-[176px]">
                {/* Selection Highlight Bar */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[44px] bg-gold-50/20 border-y border-gold-200/50 pointer-events-none rounded-lg z-0" />

                <div
                    ref={listRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar w-full relative z-10"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <div style={{ height: itemHeight * 1.5 }} />
                    {items.map((item) => {
                        const isSelected = item === value;
                        return (
                            <div
                                key={item}
                                style={{ height: itemHeight }}
                                className={`flex items-center justify-center snap-center transition-all duration-300 cursor-pointer select-none ${
                                    isSelected 
                                    ? 'text-charcoal-900 font-bold text-2xl drop-shadow-sm scale-110' 
                                    : 'text-stone-300 text-sm hover:text-stone-400'
                                }`}
                                onClick={() => {
                                    const idx = items.indexOf(item);
                                    if (listRef.current) listRef.current.scrollTo({ top: idx * itemHeight, behavior: 'smooth' });
                                    onChange(item);
                                }}
                            >
                                {item}
                            </div>
                        );
                    })}
                    <div style={{ height: itemHeight * 1.5 }} />
                </div>

                {/* Fade Overlays */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-white/0 pointer-events-none z-20" />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-white/0 pointer-events-none z-20" />
            </div>
        </div>
    );
};

interface DatePickerWheelProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
}

export const DatePickerWheel: React.FC<DatePickerWheelProps> = ({ value, onChange }) => {
    // value format: YYYY-MM-DD
    const parts = value ? value.split('-') : ['2000', '06', '15'];
    const selectedYear = parts[0];
    const selectedMonthIndex = Math.max(0, parseInt(parts[1]) - 1);
    const selectedMonth = MONTHS[selectedMonthIndex] || 'Jun';
    const selectedDay = parts[2] || '15';

    const handleDayChange = (d: string) => onChange(`${selectedYear}-${(MONTHS.indexOf(selectedMonth) + 1).toString().padStart(2, '0')}-${d}`);
    const handleMonthChange = (m: string) => onChange(`${selectedYear}-${(MONTHS.indexOf(m) + 1).toString().padStart(2, '0')}-${selectedDay}`);
    const handleYearChange = (y: string) => onChange(`${y}-${(MONTHS.indexOf(selectedMonth) + 1).toString().padStart(2, '0')}-${selectedDay}`);

    return (
        <div className="flex items-center justify-center gap-2 py-4 px-2 w-full max-w-sm mx-auto">
            <WheelPicker items={DAYS} value={selectedDay} onChange={handleDayChange} label="Day" width="w-[70px]" />
            <WheelPicker items={MONTHS} value={selectedMonth} onChange={handleMonthChange} label="Month" width="w-[90px]" />
            <WheelPicker items={YEARS} value={selectedYear} onChange={handleYearChange} label="Year" width="w-[90px]" />
        </div>
    );
};

interface TimePickerWheelProps {
    value: string; // HH:MM
    onChange: (time: string) => void;
}

export const TimePickerWheel: React.FC<TimePickerWheelProps> = ({ value, onChange }) => {
    // value format: HH:MM
    const parts = value ? value.split(':') : ['12', '00'];
    const selectedHour = parts[0] || '12';
    const selectedMinute = parts[1] || '00';

    const handleHourChange = (h: string) => onChange(`${h}:${selectedMinute}`);
    const handleMinuteChange = (m: string) => onChange(`${selectedHour}:${m}`);

    return (
        <div className="flex items-center justify-center gap-4 py-4 px-4 w-full max-w-sm mx-auto">
            <WheelPicker items={HOURS} value={selectedHour} onChange={handleHourChange} label="Hour" width="w-[90px]" />
            <div className="text-xl font-bold text-stone-300 mt-6">:</div>
            <WheelPicker items={MINUTES} value={selectedMinute} onChange={handleMinuteChange} label="Minute" width="w-[90px]" />
        </div>
    );
};
