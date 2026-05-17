"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MapPin, Calendar, Clock, Users, Briefcase,
  Plane, Search, ArrowLeftRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TimePicker } from "@/components/ui/TimePicker";
import { DatePicker } from "@/components/ui/DatePicker";
import { useI18n } from "@/i18n/context";
import { LocationInput } from "./LocationInput";


export function BookingEngine() {
  const router = useRouter();
  const { t, tArray } = useI18n();
  const locations = tArray("booking.locations");
  const ORIGINS = locations.length > 0 ? locations : ["Lisbon Airport (LIS)", "Lisbon City Centre", "Cascais", "Sintra", "Belém", "Parque das Nações", "Setúbal"];
  const DESTINATIONS = locations.length > 0 ? locations : ["Lisbon Airport (LIS)", "Lisbon City Centre", "Cascais", "Sintra", "Setúbal", "Algarve", "Porto", "Óbidos"];
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [flight, setFlight] = useState("");
  const [showPax, setShowPax] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const paxRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) setShowPax(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    const e: Record<string, boolean> = {};
    if (!origin) e.origin = true;
    if (!destination) e.destination = true;
    if (!date) e.date = true;
    if (!time) e.time = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSearch = () => {
    if (!validate()) return;
    const p = new URLSearchParams({
      origin,
      destination,
      date,
      time,
      passengers: String(passengers),
      luggage: String(luggage),
      tripType
    });

    if (tripType === "roundtrip") {
      if (returnDate) p.set("returnDate", returnDate);
      if (returnTime) p.set("returnTime", returnTime);
    }

    if (flight) p.set("flight", flight);
    router.push(`/book?${p}`);
  };

  const swap = () => { setOrigin(destination); setDestination(origin); };

  return (
    <div className="w-full relative mx-auto max-w-[1100px] flex flex-col items-center">

      {/* Trip Type Selector */}
      <div className="mb-8 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-1 backdrop-blur-xl animate-luxury-reveal self-start md:self-center ml-4 md:ml-0">
        <button
          onClick={() => setTripType("oneway")}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
            tripType === "oneway"
              ? "bg-brand-gold text-black shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)]"
              : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          {t("booking.oneWay")}
        </button>
        <button
          onClick={() => setTripType("roundtrip")}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
            tripType === "roundtrip"
              ? "bg-brand-gold text-black shadow-[0_10px_20px_-5px_rgba(212,175,55,0.4)]"
              : "text-white/40 hover:text-white hover:bg-white/5"
          )}
        >
          {t("booking.roundTrip")}
        </button>
      </div>

      {/* Main Concierge Bar - Modern Stacked Layout */}
      <div className="w-full relative z-40 bg-surface-0/60 backdrop-blur-3xl rounded-[32px] grid grid-cols-1 lg:grid-cols-12 shadow-luxury border border-white/[0.08] transition-all duration-700">

        {/* Left Side: Locations */}
        <div className={cn(
          "flex flex-col relative py-2 transition-all duration-500",
          tripType === "roundtrip" ? "lg:col-span-6" : "lg:col-span-7"
        )}>
          {/* Continuous Vertical Line */}
          <div className="absolute left-[30px] md:left-[38px] top-[50px] bottom-[50px] w-[2px] bg-gradient-to-b from-white/10 via-white/10 to-brand-gold/40 z-0" />

          {/* Swap Button */}
          <button
            onClick={swap}
            className="absolute left-[31px] md:left-[39px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#0A0A0F] border border-white/10 rounded-full flex items-center justify-center z-20 hover:border-brand-gold transition-all shadow-lg group/swap"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-white/40 group-hover:text-brand-gold lg:rotate-90 transition-colors" />
          </button>

          {/* Origin */}
          <div ref={originRef} className={cn(
            "px-6 md:px-8 py-4 relative group flex-1 flex flex-col justify-center transition-all duration-300",
            errors.origin && "bg-red-500/5"
          )}>
            <label className={cn(
              "text-[9px] font-black uppercase tracking-[0.3em] block mb-1 transition-colors font-sans ml-9",
              errors.origin ? "text-red-400" : "text-white/30 group-focus-within:text-white/60"
            )}>
              {t("booking.origin")}
            </label>
            <div className="flex items-center gap-4 h-12">
              <div className={cn(
                "w-3.5 h-3.5 rounded-full border-[2px] relative z-10 bg-[#0A0A0F] shrink-0 transition-colors",
                errors.origin ? "border-red-500" : "border-white/40"
              )} />
              <div className="flex-1 min-w-0">
                <LocationInput
                  placeholder={t("booking.originPlaceholder")}
                  value={origin}
                  onChange={(val) => {
                    setOrigin(val);
                    if (val) setErrors(prev => ({ ...prev, origin: false }));
                  }}
                  variant="embedded"
                />
              </div>
            </div>
          </div>

          <div className="h-[1px] w-[calc(100%-60px)] ml-[60px] bg-white/[0.04]" />

          {/* Destination */}
          <div ref={destRef} className={cn(
            "px-6 md:px-8 py-4 relative group flex-1 flex flex-col justify-center transition-all duration-300",
            errors.destination && "bg-red-500/5"
          )}>
            <label className={cn(
              "text-[9px] font-black uppercase tracking-[0.3em] block mb-1 transition-colors font-sans ml-9",
              errors.destination ? "text-red-400" : "text-white/30 group-focus-within:text-white/60"
            )}>
              {t("booking.destination")}
            </label>
            <div className="flex items-center gap-4 h-12">
              <div className={cn(
                "w-3 h-3 rounded-sm relative z-10 shrink-0 ml-[1px] transition-all",
                errors.destination ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              )} />
              <div className="flex-1 min-w-0">
                <LocationInput
                  placeholder={t("booking.destinationPlaceholder")}
                  value={destination}
                  onChange={(val) => {
                    setDestination(val);
                    if (val) setErrors(prev => ({ ...prev, destination: false }));
                  }}
                  variant="embedded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Date & Time */}
        <div className={cn(
          "flex flex-col border-t lg:border-t-0 lg:border-l border-white/[0.05] transition-all duration-500",
          tripType === "roundtrip" ? "lg:col-span-6" : "lg:col-span-5"
        )}>
          <div className={cn(
            "grid grid-cols-2 flex-1",
            tripType === "roundtrip" ? "border-b border-white/[0.05]" : ""
          )}>
            {/* Date Ida */}
            <div className={cn(
              "px-6 md:px-8 py-6 relative group border-r border-white/[0.05] flex flex-col justify-center transition-all",
              errors.date && "bg-red-500/5"
            )}>
              <label className={cn(
                "text-[9px] font-black uppercase tracking-[0.3em] block mb-2 transition-colors font-sans",
                errors.date ? "text-red-400" : "text-white/30 group-focus-within:text-white/60"
              )}>
                {tripType === "roundtrip" ? "Data Ida" : t("booking.date")}
              </label>
              <div className="flex items-center gap-3 h-8 relative">
                <Calendar className={cn("w-4 h-4 shrink-0 transition-colors", errors.date ? "text-red-500" : "text-brand-gold")} />
                <div className="flex-1 min-w-0">
                  <DatePicker 
                    variant="ghost" 
                    minDate={today} 
                    value={date} 
                    onChange={(val) => {
                      setDate(val);
                      if (val) setErrors(prev => ({ ...prev, date: false }));
                    }} 
                  />
                </div>
              </div>
            </div>
            {/* Time Ida */}
            <div className={cn(
              "px-6 md:px-8 py-6 relative group flex flex-col justify-center transition-all",
              errors.time && "bg-red-500/5"
            )}>
              <label className={cn(
                "text-[9px] font-black uppercase tracking-[0.3em] block mb-2 transition-colors font-sans",
                errors.time ? "text-red-400" : "text-white/30 group-focus-within:text-white/60"
              )}>
                {tripType === "roundtrip" ? "Hora Ida" : t("booking.time")}
              </label>
              <div className="flex items-center gap-3 h-8 relative">
                <Clock className={cn("w-4 h-4 shrink-0 transition-colors", errors.time ? "text-red-500" : "text-brand-gold")} />
                <div className="flex-1 min-w-0">
                  <TimePicker 
                    variant="ghost" 
                    value={time} 
                    onChange={(val) => {
                      setTime(val);
                      if (val) setErrors(prev => ({ ...prev, time: false }));
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {tripType === "roundtrip" && (
            <div className="grid grid-cols-2 flex-1">
              {/* Date Volta */}
              <div className="px-6 md:px-8 py-6 relative group border-r border-white/[0.05] flex flex-col justify-center bg-brand-gold/[0.02] rounded-bl-[32px] lg:rounded-bl-none">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
                  Data Volta
                </label>
                <div className="flex items-center gap-3 h-8 relative">
                  <Calendar className="w-4 h-4 text-brand-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <DatePicker variant="ghost" minDate={date || today} value={returnDate} onChange={setReturnDate} />
                  </div>
                </div>
              </div>
              {/* Time Volta */}
              <div className="px-6 md:px-8 py-6 relative group flex flex-col justify-center bg-brand-gold/[0.02] rounded-br-[32px]">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
                  Hora Volta
                </label>
                <div className="flex items-center gap-3 h-8 relative">
                  <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <TimePicker variant="ghost" value={returnTime} onChange={setReturnTime} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-bar options & CTA */}
      <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-4 w-full relative z-30">
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div ref={paxRef} className="relative w-full sm:w-auto">
            <button onClick={() => setShowPax(!showPax)} className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-4 text-[10px] font-black uppercase tracking-[0.2rem] text-white hover:bg-white/5 transition-all bg-white/[0.02] px-8 py-4 rounded-full border border-white/[0.06] font-sans shadow-lg backdrop-blur-md">
              <Users className="w-4 h-4 text-white/40" />
              {passengers} {t("booking.passengersUpper")} <span className="text-white/10">•</span> <Briefcase className="w-4 h-4 text-white/40" /> {luggage} {t("booking.luggageUpper")}
            </button>
            {showPax && (
              <div className="absolute top-[calc(100%+16px)] left-0 right-0 sm:left-0 w-[calc(100vw-32px)] sm:w-72 bg-[#0A0A0F] border border-white/[0.08] p-8 z-50 shadow-2xl animate-in fade-in zoom-in-95 rounded-[24px]">
                {[
                  { label: t("booking.passengers"), val: passengers, set: setPassengers, min: 1, max: 8 },
                  { label: t("booking.luggage"), val: luggage, set: setLuggage, min: 0, max: 10 },
                ].map((item) => (
                  <div key={item.label} className="flex flex-row items-center justify-between py-5 first:pt-0 last:pb-0 border-b border-white/[0.08] last:border-0 font-sans">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}</span>
                    <div className="flex items-center gap-6">
                      <button onClick={() => item.set(Math.max(item.min, item.val - 1))} className="text-white w-8 h-8 flex items-center justify-center border border-white/20 rounded-full hover:bg-white hover:text-black transition-all font-bold">–</button>
                      <span className="text-white font-black w-4 text-center text-sm">{item.val}</span>
                      <button onClick={() => item.set(Math.min(item.max, item.val + 1))} className="text-white w-8 h-8 flex items-center justify-center border border-white/20 rounded-full hover:bg-white hover:text-black transition-all font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-4 group bg-white/[0.02] px-8 py-4 rounded-full border border-white/[0.06] focus-within:border-white/20 transition-all font-sans shadow-lg backdrop-blur-md w-full sm:w-64 cursor-text">
            <Plane className="w-4 h-4 text-white/20 transition-all group-focus-within:text-white/60 shrink-0" />
            <input
              placeholder={t("booking.flightPlaceholder")}
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-[0.2rem] text-white focus:text-white transition-all w-full placeholder:text-white/30"
              value={flight}
              onChange={(e) => setFlight(e.target.value)}
            />
          </label>
        </div>

        {/* Sleek Action Button */}
        <button
          onClick={handleSearch}
          className="group/cta relative isolate w-full lg:w-auto"
        >
          {/* Ambient Glow behind button */}
          <div className="absolute -inset-4 bg-brand-gold/20 rounded-full blur-[20px] opacity-0 group-hover/cta:opacity-100 transition-opacity duration-700" />
          
          <div className={cn(
            "px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all duration-500 overflow-hidden relative group-hover/cta:scale-105",
            (origin && destination && date && time) 
              ? "bg-brand-gold hover:bg-[#F0D680] text-black shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)]" 
              : "bg-white/5 text-white/20 border border-white/10"
          )}>
            <span className="relative z-10">{t("booking.viewPrices")}</span>
            <Search className="w-4 h-4 relative z-10 group-hover/cta:translate-x-2 transition-transform duration-500" />
            
            {/* Animated Shimmer */}
            {(origin && destination && date && time) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover/cta:translate-x-[200%] transition-transform duration-[1000ms] ease-in-out" />
            )}
          </div>
        </button>
      </div>
    </div >
  );
}
