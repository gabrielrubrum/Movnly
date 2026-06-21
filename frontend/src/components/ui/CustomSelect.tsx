"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Selecione...", className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-5 text-left",
          "focus:border-brand-gold/40 focus:bg-brand-gold/[0.02] transition-all",
          "font-medium text-sm outline-none",
          "flex items-center justify-between",
          "hover:border-white/[0.12]"
        )}
      >
        <span className={cn(!selectedOption && "text-white/15")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-white/40 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0B0B10] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-5 py-3.5 text-left transition-all",
                  "flex items-center justify-between",
                  "hover:bg-brand-gold/[0.08]",
                  "focus:bg-brand-gold/[0.08] focus:outline-none",
                  value === option.value ? "bg-brand-gold/[0.05]" : "bg-transparent"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  value === option.value ? "text-brand-gold" : "text-white/70 hover:text-white"
                )}>
                  {option.label}
                </span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-brand-gold" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
