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

      {/* Main Concierge Bar - Optimized Grid */}
      <div className="w-full relative z-40 glass-concierge p-3 rounded-[32px] grid grid-cols-1 lg:grid-cols-12 gap-1 shadow-luxury border-white/[0.08] transition-all duration-700">

        <div ref={originRef} className={cn(
          "px-6 md:px-8 py-5 lg:py-4 relative group min-w-0 transition-all duration-500",
          tripType === "roundtrip" ? "lg:col-span-2" : "lg:col-span-4"
        )}>
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
            {t("booking.origin")}
          </label>
          <div className="flex items-center gap-3 h-10">
            <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
            <LocationInput
              placeholder={t("booking.originPlaceholder")}
              value={origin}
              onChange={(val) => setOrigin(val)}
              variant="embedded"
            />
          </div>
        </div>

        {/* Floating Swap Interaction */}
        <div className={cn(
          "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-[60] transition-all duration-500",
          tripType === "roundtrip" ? "left-[16%]" : "left-[32%]"
        )}>
          <button onClick={swap} className="w-9 h-9 rounded-full border border-white/[0.1] flex items-center justify-center hover:border-brand-gold transition-all bg-[#0A0A0F] shadow-xl group/swap">
            <ArrowLeftRight className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-gold transition-colors" />
          </button>
        </div>

        {/* Destination */}
        <div ref={destRef} className={cn(
          "px-6 md:px-8 py-5 lg:py-4 relative group min-w-0 border-t lg:border-t-0 lg:border-l border-white/[0.05] transition-all duration-500",
          tripType === "roundtrip" ? "lg:col-span-2" : "lg:col-span-4"
        )}>
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
            {t("booking.destination")}
          </label>
          <div className="flex items-center gap-3 h-10">
            <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
            <LocationInput
              placeholder={t("booking.destinationPlaceholder")}
              value={destination}
              onChange={(val) => setDestination(val)}
              variant="embedded"
            />
          </div>
        </div>

        {/* Date Field (Ida) */}
        <div className={cn(
          "px-6 md:px-8 py-5 lg:py-4 relative group border-t lg:border-t-0 lg:border-l border-white/[0.05] transition-all duration-500",
          tripType === "roundtrip" ? "lg:col-span-2" : "lg:col-span-2"
        )}>
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
            {tripType === "roundtrip" ? "Data" : t("booking.date")}
          </label>
          <div className="flex items-center gap-2 h-10 relative text-brand-gold">
            <Calendar className="w-4 h-4 opacity-40 shrink-0" />
            <div className="flex-1 min-w-0">
              <DatePicker variant="ghost" minDate={today} value={date} onChange={setDate} />
            </div>
          </div>
        </div>

        {/* Return Date (Volta) */}
        {tripType === "roundtrip" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 lg:col-span-2 px-6 md:px-8 py-5 lg:py-4 relative group border-t lg:border-t-0 lg:border-l border-white/[0.05] bg-brand-gold/[0.02]"
          >
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
              Volta
            </label>
            <div className="flex items-center gap-2 h-10 relative">
              <Calendar className="w-4 h-4 text-brand-gold shrink-0" />
              <div className="flex-1 min-w-0 text-brand-gold">
                <DatePicker variant="ghost" minDate={date || today} value={returnDate} onChange={setReturnDate} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Time Field (Ida) */}
        <div className={cn(
          "px-6 md:px-8 py-5 lg:py-4 relative group border-t lg:border-t-0 lg:border-l border-white/[0.05] transition-all duration-500",
          tripType === "roundtrip" ? "lg:col-span-2" : "lg:col-span-2"
        )}>
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
            {tripType === "roundtrip" ? "Hora" : t("booking.time")}
          </label>
          <div className="flex items-center gap-2 h-10 relative">
            <Clock className="w-4 h-4 text-brand-gold/40 shrink-0 text-brand-gold" />
            <div className="flex-1 min-w-0 text-brand-gold">
              <TimePicker variant="ghost" value={time} onChange={setTime} />
            </div>
          </div>
        </div>

        {/* Return Time (Volta) */}
        {tripType === "roundtrip" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1 lg:col-span-2 px-6 md:px-8 py-5 lg:py-4 relative group border-t lg:border-t-0 lg:border-l border-white/[0.05] bg-brand-gold/[0.02]"
          >
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold block mb-2 group-focus-within:text-white/60 transition-colors font-sans">
              Hora Volta
            </label>
            <div className="flex items-center gap-2 h-10 relative">
              <Clock className="w-4 h-4 text-brand-gold shrink-0" />
              <div className="flex-1 min-w-0 text-brand-gold">
                <TimePicker variant="ghost" value={returnTime} onChange={setReturnTime} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Action Button */}
      <div className="mt-12 w-full flex justify-center relative z-10">
        <button
          onClick={handleSearch}
          className="btn-editorial-primary h-16 px-16 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] relative overflow-hidden group/cta active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative z-10">{t("booking.viewPrices")}</span>
        </button>
      </div>

      {/* Sub-bar options */}
      <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full px-4">
        <div ref={paxRef} className="relative w-full sm:w-auto">
          <button onClick={() => setShowPax(!showPax)} className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-4 text-[10px] font-black uppercase tracking-[0.2rem] text-white hover:bg-white/5 transition-all bg-white/[0.03] px-8 md:px-10 py-5 rounded-full border border-white/[0.08] font-sans shadow-2xl backdrop-blur-xl">
            <Users className="w-4 h-4 text-white/40" />
            {passengers} {t("booking.passengersUpper")} <span className="text-white/10">•</span> <Briefcase className="w-4 h-4 text-white/40" /> {luggage} {t("booking.luggageUpper")}
          </button>
          {showPax && (
            <div className="absolute top-[calc(100%+16px)] left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 mx-auto w-[calc(100vw-32px)] sm:w-72 bg-surface-0/95 backdrop-blur-3xl border border-white/[0.08] p-8 z-50 shadow-luxury animate-luxury-reveal rounded-[24px]">
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

        <div className="flex items-center gap-4 group bg-white/[0.03] px-8 md:px-10 py-5 rounded-full border border-white/[0.08] focus-within:border-white/20 transition-all font-sans shadow-2xl backdrop-blur-xl w-full sm:w-64">
          <Plane className="w-4 h-4 text-white/20 transition-all group-focus-within:text-white/60" />
          <input
            placeholder={t("booking.flightPlaceholder")}
            className="bg-transparent outline-none text-[10px] font-black uppercase tracking-[0.2rem] text-white/30 focus:text-white transition-all w-full placeholder:text-white/20"
            value={flight}
            onChange={(e) => setFlight(e.target.value)}
          />
        </div>
      </div>
    </div >
  );
}
