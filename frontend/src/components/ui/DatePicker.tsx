"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { usePortalDropdown } from "@/hooks/usePortalDropdown";

// Approximate calendar height for collision detection
const CALENDAR_HEIGHT = 380;
const CALENDAR_WIDTH = 340;

export function DatePicker({ value, onChange, minDate, variant = "default" }: { value: string; onChange: (v: string) => void; minDate?: string; variant?: "default" | "ghost" }) {
    const { t, tArray, locale } = useI18n();
    const [currentDate, setCurrentDate] = useState(() => value ? new Date(value) : new Date());

    const { triggerRef, open, setOpen, popoverStyle, togglePortal } = usePortalDropdown({
        popoverHeight: CALENDAR_HEIGHT,
        popoverWidth: CALENDAR_WIDTH,
        gap: 16,
        portalDataAttribute: "data-movnly-calendar",
    });

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

    const calendar = open ? (
        <div
            data-movnly-calendar
            style={{
                position: "fixed",
                top: popoverStyle.top,
                left: popoverStyle.left,
                zIndex: 9999,
                width: CALENDAR_WIDTH,
            }}
            className="!bg-[#07070A] !opacity-100 rounded-[32px] border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)] p-8 animate-luxury-reveal"
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
                            data-testid={`day-${d}`}
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
    ) : null;

    return (
        <div className="relative w-full">
            <button
                ref={triggerRef}
                type="button"
                onClick={togglePortal}
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

            {typeof document !== "undefined" && calendar
                ? createPortal(calendar, document.body)
                : null}
        </div>
    );
}
