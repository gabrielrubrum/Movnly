"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export function DatePicker({ value, onChange, minDate, variant = "default" }: { value: string; onChange: (v: string) => void; minDate?: string; variant?: "default" | "ghost" }) {
    const { t, tArray, locale } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [currentDate, setCurrentDate] = useState(() => value ? new Date(value) : new Date());

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const selectDate = (day: number) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const str = `${yyyy}-${mm}-${dd}`;
        onChange(str);
        setOpen(false);
    };

    const isBeforeMin = (day: number) => {
        if (!minDate) return false;
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const minD = new Date(minDate);
        minD.setHours(0, 0, 0, 0);
        return d < minD;
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

    // Format value to DD/MM/YYYY for display if it exists
    const displayValue = value
        ? (locale === "pt" ? value.split("-").reverse().join("/") : value.split("-").reverse().join("/"))
        : t("ui.datepicker.placeholder");

    const months = tArray("ui.datepicker.months");
    const dayNames = tArray("ui.datepicker.days");

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "w-full flex items-center justify-between transition-all h-[64px] px-4",
                    variant === "default" && "nx-input hover:border-white/20 text-sm font-bold",
                    variant === "ghost" && "bg-transparent text-sm md:text-base outline-none hover:text-white/80"
                )}
            >
                <div className="flex items-center gap-4">
                    {variant === "default" && <CalendarIcon className="w-5 h-5 text-brand-gold/40" />}
                    <span className={cn(
                        "text-sm tracking-wide transition-colors whitespace-nowrap truncate",
                        value ? "text-white font-bold" : "text-white/20 font-medium"
                    )}>{displayValue}</span>
                </div>
            </button>

            {open && (
                <div
                    data-nexrice-calendar
                    className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-[340px] !bg-[#07070A] !opacity-100 rounded-[32px] border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)] p-8 z-[100] animate-luxury-reveal"
                >
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white/[0.05] rounded transition-colors text-white/60 hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="font-semibold text-sm text-white">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </div>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/[0.05] rounded transition-colors text-white/60 hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {dayNames.map((d: string) => (
                            <div key={d} className="text-[0.65rem] font-bold text-white/30 uppercase">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map((b) => <div key={`blank-${b}`} />)}
                        {days.map((d) => {
                            const fullStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const selected = fullStr === value;
                            const disabled = isBeforeMin(d);
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => selectDate(d)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl text-xs flex items-center justify-center transition-all font-sans font-bold",
                                        selected ? "bg-brand-gold text-black shadow-luxury-gold" :
                                            disabled ? "text-white/10 cursor-not-allowed" :
                                                "text-white/40 hover:bg-white/[0.05] hover:text-white"
                                    )}
                                >
                                    {d}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
