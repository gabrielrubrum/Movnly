"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n/context";

export function TimePicker({ value, onChange, variant = "default" }: { value: string; onChange: (v: string) => void; variant?: "default" | "ghost" }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const times = Array.from({ length: 24 * 4 }).map((_, i) => {
        const h = Math.floor(i / 4).toString().padStart(2, "0");
        const m = ((i % 4) * 15).toString().padStart(2, "0");
        return `${h}:${m}`;
    });

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "w-full flex items-center justify-between transition-all font-sans h-[64px] px-4",
                    variant === "default" && "nx-input hover:border-white/20 text-sm font-bold",
                    variant === "ghost" && "bg-transparent text-sm md:text-base outline-none hover:text-white/80"
                )}
            >
                <div className="flex items-center gap-4">
                    {variant === "default" && <Clock className="w-5 h-5 text-brand-gold/40" />}
                    <span className={cn(
                        "text-sm tracking-wide transition-colors whitespace-nowrap truncate",
                        value ? "text-white font-bold" : "text-white/20 font-medium"
                    )}>{value || t("ui.datepicker.placeholder_time")}</span>
                </div>
            </button>

            {open && (
                <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-64 max-h-72 overflow-y-auto !bg-[#07070A] !opacity-100 rounded-[32px] border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)] z-[100] animate-luxury-reveal p-4 scrollbar-hide">
                    {times.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { onChange(t); setOpen(false); }}
                            className={cn(
                                "w-full px-6 py-4 text-[11px] font-black uppercase tracking-widest text-left rounded-2xl transition-all font-sans",
                                value === t ? "bg-brand-gold text-black shadow-luxury-gold" : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
