"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { cn, formatCurrency, getPricingMultiplier } from "@/lib/utils";
import { type VehicleCategory, type BookingExtra } from "@/lib/types";
import { VEHICLE_CATEGORIES, EXTRAS, TOURS, getBasePrice } from "@/lib/constants";
import { StepDetails } from "./steps/StepDetails";
import { StepVehicle } from "./steps/StepVehicle";
import { StepExtras } from "./steps/StepExtras";
import { StepPayment } from "./steps/StepPayment";
import { BookingSummaryPanel } from "./BookingSummaryPanel";
import { Check } from "lucide-react";
import { useI18n } from "@/i18n/context";

export type BookingFormData = {
  tripType: "oneway" | "roundtrip";
  origin: string;
  destination: string;
  date: string;
  time: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  luggage: number;
  flightNumber: string;
  airline: string;
  category: VehicleCategory;
  extras: string[];
  name: string;
  email: string;
  phone: string;
  notes: string;
  paymentMethod: "card" | "mbway" | "invoice";
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  distance?: number;
  duration?: string;
};

export function BookingSteps() {
  const { t } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);

  const STEPS = [
    { id: 1, label: t("bookingFlow.steps.details") },
    { id: 2, label: t("bookingFlow.steps.vehicle") },
    { id: 3, label: t("bookingFlow.steps.extras") },
    { id: 4, label: t("bookingFlow.steps.payment") },
  ];

  const { user } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isTour, setIsTour] = useState(false);
  const [tourData, setTourData] = useState<any>(null);

  const [form, setForm] = useState<BookingFormData>({
    tripType: (params.get("tripType") as "oneway" | "roundtrip") || "oneway",
    origin: params.get("origin") || "",
    destination: params.get("destination") || "",
    date: params.get("date") || "",
    time: params.get("time") || "",
    returnDate: "",
    returnTime: "",
    passengers: Number(params.get("passengers")) || 2,
    luggage: Number(params.get("luggage")) || 2,
    flightNumber: params.get("flight") || "",
    airline: params.get("airline") || "",
    category: (params.get("category") as VehicleCategory) || "comfort",
    extras: [],
    name: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "card",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const update = (patch: Partial<BookingFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  // Handle Hydration and Initial Sync
  useEffect(() => {
    setHasHydrated(true);
    if (user) {
      setForm(f => ({ ...f, name: user.name || "", email: user.email || "" }));
    }

    const tourId = params.get("tour");
    if (tourId) {
      const tour = TOURS.find(t => t.id === tourId);
      if (tour) {
        setIsTour(true);
        setTourData(tour);
        setForm(f => ({
          ...f,
          destination: tour.title,
          tripType: "oneway", // Tours are managed as full packages
          category: tourId === "douro-valley" ? "executive" : (params.get("category") as VehicleCategory || "group")
        }));
      }
    }
  }, [user, params]);

  const cat = VEHICLE_CATEGORIES.find((c) => c.id === form.category)!;
  const ratePerKm = { smart: 1.0, comfort: 1.5, group: 1.8, executive: 2.5 }[form.category] || 1.2;

  // Calculate pricing multiplier for leg 1
  const leg1Pricing = getPricingMultiplier(form.date, form.time);
  const baseRate = getBasePrice(form.category, form.origin, form.destination);
  const leg1Base = form.distance ? Math.round(baseRate + (form.distance * ratePerKm)) : baseRate;
  const leg1Final = Math.round(leg1Base * leg1Pricing.multiplier);

  // Calculate leg 2 if roundtrip
  let leg2Final = 0;
  let leg2Pricing = { multiplier: 1, reasons: [] as string[] };
  if (form.tripType === "roundtrip" && form.returnDate && form.returnTime) {
    leg2Pricing = getPricingMultiplier(form.returnDate, form.returnTime);
    leg2Final = Math.round(leg1Base * leg2Pricing.multiplier);
  }

  const isPathDefined = form.origin && form.destination && form.date && form.time;
  
  const calculatedBasePrice = (!isPathDefined) ? 0 : (isTour && tourData ? tourData.price : (form.tripType === "roundtrip" ? (leg1Final + leg2Final) : leg1Final));

  // Apply a small round-trip discount if applicable (e.g. 5% off base)
  const roundTripDiscount = (isPathDefined && !isTour && form.tripType === "roundtrip" && leg2Final > 0) ? Math.round(calculatedBasePrice * 0.05) : 0;
  const finalBasePrice = calculatedBasePrice - roundTripDiscount;

  const extrasTotal = form.extras.reduce((sum, id) => {
    const e = EXTRAS.find((x) => x.id === id);
    return sum + (e?.price || 0);
  }, 0);

  const total = isPathDefined ? (finalBasePrice + extrasTotal) : 0;

  const handleConfirm = async () => {
    // This is now handled by the Stripe completion flow
  };

  const { token } = useAuthStore();
  const initPaymentIntent = async (forceEmail?: string, forceName?: string) => {
    setLoading(true);
    try {
      const { getFraudHeaders } = await import('@/lib/fraud-signals');
      const res = await api.post(`/payments/create-intent`, {
        ...form,
        email: forceEmail || form.email,
        name: forceName || form.name,
        amount: total,
      }, { headers: getFraudHeaders() });

      if (res.data.mock) {
        console.error("Stripe is in mock mode — configure live keys on the server.");
        return;
      }

      if (res.data.clientSecret) {
        setClientSecret(res.data.clientSecret);
        setLastBookingId(res.data.bookingId);
      }
    } catch (err: any) {
      console.error("Payment init failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (step === 3) {
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  if (!hasHydrated) return <div className="min-h-[400px] flex items-center justify-center"><Check className="w-8 h-8 animate-spin text-brand-gold" /></div>;

  return (
    <div className="nx-container max-w-[1440px] animate-luxury-reveal relative">
      {/* Background Atmosphere */}
      <div className="absolute -top-40 left-0 w-full h-[1000px] pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-gold/5 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Cinematic Progress Bar */}
        <div className="mb-24 relative px-4 md:px-12">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
          
          <div className="flex items-center justify-between relative z-10">
            {STEPS.map((s, i) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              
              return (
                <div key={s.id} className="flex flex-col items-center group">
                  <button
                    onClick={() => step > s.id && setStep(s.id)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 relative",
                      isCompleted ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" :
                        isActive ? "bg-brand-gold text-black shadow-[0_0_40px_rgba(212,175,55,0.6)] scale-110" :
                          "bg-[#0A0A0F] text-white/20 border border-white/10 group-hover:border-white/30"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -inset-2 bg-brand-gold/20 rounded-full blur-md animate-pulse" />
                    )}
                    {isCompleted ? (
                      <Check className="w-5 h-5 relative z-10" />
                    ) : (
                      <span className="text-[11px] font-black font-sans relative z-10 tracking-tighter">0{s.id}</span>
                    )}
                  </button>
                  
                  <div className="absolute -bottom-10 flex flex-col items-center">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] font-sans transition-all duration-700 whitespace-nowrap",
                      isActive ? "text-white opacity-100 translate-y-0" : "text-white/20 opacity-0 translate-y-2 group-hover:opacity-60 group-hover:translate-y-0"
                    )}>
                      {s.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 rounded-full bg-brand-gold mt-2 animate-bounce" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12 lg:gap-24 items-start">
          {/* Step content */}
          <div className="relative min-h-[600px]">
            {step === 1 && <StepDetails form={form} update={update} onNext={() => setStep(2)} />}
            {step === 2 && <StepVehicle form={form} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <StepExtras form={form} update={update} onNext={nextStep} onBack={() => setStep(2)} />}
            {step === 4 && <StepPayment form={form} update={update} onConfirm={handleConfirm} onBack={() => setStep(3)} loading={loading} total={total} clientSecret={clientSecret} initPaymentIntent={initPaymentIntent} bookingId={lastBookingId} />}
          </div>

          {/* Summary - shows below content on mobile, on the right on lg */}
          <div className="sticky top-24">
            <BookingSummaryPanel
              form={form}
              total={total}
              extrasTotal={extrasTotal}
              calculatedBasePrice={calculatedBasePrice}
              step={step}
              isTour={isTour}
              tourData={tourData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
