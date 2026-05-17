"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { usePortalDropdown } from "@/hooks/usePortalDropdown";

// Approximate time menu height for collision detection
const MENU_HEIGHT = 288; // max-h-72 = 288px
const MENU_WIDTH = 256;  // w-64 = 256px

export function TimePicker({ value, onChange, variant = "default" }: { value: string; onChange: (v: string) => void; variant?: "default" | "ghost" }) {
    const { t } = useI18n();

    const { triggerRef, open, setOpen, popoverStyle, togglePortal } = usePortalDropdown({
        popoverHeight: MENU_HEIGHT,
        popoverWidth: MENU_WIDTH,
        gap: 16,
        portalDataAttribute: "data-movnly-timepicker",
    });

    const times = Array.from({ length: 24 * 4 }).map((_, i) => {
        const h = Math.floor(i / 4).toString().padStart(2, "0");
        const m = ((i % 4) * 15).toString().padStart(2, "0");
        return `${h}:${m}`;
    });

    const menu = open ? (
        <div
            data-movnly-timepicker
            style={{
                position: "fixed",
                top: popoverStyle.top,
                left: popoverStyle.left,
                zIndex: 9999,
                width: MENU_WIDTH,
            }}
            className="max-h-72 overflow-y-auto !bg-[#07070A] !opacity-100 rounded-[32px] border border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.9)] animate-luxury-reveal p-4 scrollbar-hide"
        >
            {times.map((t) => (
                <button
                    key={t}
                    type="button"
                    data-testid={`time-${t}`}
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
    ) : null;

    return (
        <div className="relative w-full overflow-hidden">
            <button
                ref={triggerRef}
                type="button"
                onClick={togglePortal}
                className={cn(
                    "w-full flex items-center transition-all font-sans h-[64px] px-4 overflow-hidden",
                    variant === "default" && "nx-input hover:border-white/20 text-sm font-bold",
                    variant === "ghost" && "bg-transparent text-sm md:text-base outline-none hover:text-white/80"
                )}
            >
                <div className="flex items-center gap-3 min-w-0 w-full overflow-hidden">
                    {variant === "default" && <Clock className="w-5 h-5 text-brand-gold/40 shrink-0" />}
                    <span className={cn(
                        "text-sm tracking-wide transition-colors truncate block",
                        value ? "text-white font-bold" : "text-white/30 font-medium"
                    )}>{value || t("ui.datepicker.placeholder_time")}</span>
                </div>
            </button>

            {typeof document !== "undefined" && menu
                ? createPortal(menu, document.body)
                : null}
        </div>
    );
}
