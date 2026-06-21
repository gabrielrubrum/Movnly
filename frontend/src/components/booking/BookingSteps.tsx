"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import api from "@/lib/api";
import { cn, formatCurrency, getPricingMultiplier } from "@/lib/utils";
import { type VehicleCategory, type BookingExtra } from "@/lib/types";
import { VEHICLE_CATEGORIES, EXTRAS, TOURS, getBasePrice } from "@/lib/constants";
import { detectCountryFromBrowser } from "@/lib/country-helper";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load heavy components for better performance
const StepDetails = lazy(() => import("./steps/StepDetails").then(m => ({ default: m.StepDetails })));
const StepVehicle = lazy(() => import("./steps/StepVehicle").then(m => ({ default: m.StepVehicle })));
const StepExtras = lazy(() => import("./steps/StepExtras").then(m => ({ default: m.StepExtras })));
const StepCustomer = lazy(() => import("./steps/StepCustomer").then(m => ({ default: m.StepCustomer })));
const StepPayment = lazy(() => import("./steps/StepPayment").then(m => ({ default: m.StepPayment })));
const BookingSummaryPanel = lazy(() => import("./BookingSummaryPanel").then(m => ({ default: m.BookingSummaryPanel })));

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
  country?: string;
  distance?: number;
  duration?: string;
  differentPassenger?: boolean;
  passengerName?: string;
  passengerPhone?: string;
  specialRequest?: string;
};

export function BookingSteps() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [paymentInitError, setPaymentInitError] = useState<string | null>(null);

  const STEPS = [
    { id: 1, label: "Trajeto" },
    { id: 2, label: "Veículo" },
    { id: 3, label: "Opcionais" },
    { id: 4, label: "Dados" },
    { id: 5, label: "Pagamento" },
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
    country: detectCountryFromBrowser(),
  });

  const update = (patch: Partial<BookingFormData>) => {
    const paymentAffectingFields: Array<keyof BookingFormData> = [
      "tripType",
      "origin",
      "destination",
      "date",
      "time",
      "returnDate",
      "returnTime",
      "category",
      "extras",
      "passengers",
      "luggage",
    ];
    if (paymentAffectingFields.some((field) => field in patch)) {
      setClientSecret(null);
      setPaymentInitError(null);
    }
    setForm((f) => ({ ...f, ...patch }));
  };

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
          tripType: "oneway",
          category: tourId === "douro-valley" ? "executive" : (params.get("category") as VehicleCategory || "group")
        }));
      }
    }
  }, [user, params]);

  const cat = VEHICLE_CATEGORIES.find((c) => c.id === form.category)!;
  const ratePerKm = { smart: 1.0, comfort: 1.5, group: 1.8, executive: 2.5 }[form.category] || 1.2;

  const leg1Pricing = getPricingMultiplier(form.date, form.time);
  const baseRate = getBasePrice(form.category, form.origin, form.destination);
  const leg1Base = form.distance ? Math.round(baseRate + (form.distance * ratePerKm)) : baseRate;
  const leg1Final = Math.round(leg1Base * leg1Pricing.multiplier);

  let leg2Final = 0;
  if (form.tripType === "roundtrip" && form.returnDate && form.returnTime) {
    const leg2Pricing = getPricingMultiplier(form.returnDate, form.returnTime);
    leg2Final = Math.round(leg1Base * leg2Pricing.multiplier);
  }

  const isPathDefined = form.origin && form.destination && form.date && form.time;
  const calculatedBasePrice = (!isPathDefined) ? 0 : (isTour && tourData ? tourData.price : (form.tripType === "roundtrip" ? (leg1Final + leg2Final) : leg1Final));
  const roundTripDiscount = (isPathDefined && !isTour && form.tripType === "roundtrip" && leg2Final > 0) ? Math.round(calculatedBasePrice * 0.05) : 0;
  const finalBasePrice = calculatedBasePrice - roundTripDiscount;
  const extrasTotal = form.extras.reduce((sum, id) => {
    const e = EXTRAS.find((x) => x.id === id);
    return sum + (e?.price || 0);
  }, 0);
  const total = isPathDefined ? (finalBasePrice + extrasTotal) : 0;
  const paymentAttemptKey = JSON.stringify({
    bookingId: lastBookingId || "new",
    origin: form.origin,
    destination: form.destination,
    date: form.date,
    time: form.time,
    category: form.category,
    passengers: form.passengers,
    luggage: form.luggage,
    total,
  });

  const handleConfirm = async () => {};

  const { token } = useAuthStore();
  const initPaymentIntent = async (forceEmail?: string, forceName?: string) => {
    setPaymentInitError(null);
    setLoading(true);
    try {
      const { getFraudHeaders } = await import('@/lib/fraud-signals');
      const res = await api.post(`/payments/create-intent`, {
        ...form,
        email: forceEmail || form.email,
        name: forceName || form.name,
        amount: total,
        // Pass existing bookingId for idempotent retry — backend reuses existing PaymentIntent
        bookingId: lastBookingId || undefined,
        country: form.country,
      }, { headers: getFraudHeaders(), suppressGlobalToast: true } as any);

      if (res.data.clientSecret) {
        setClientSecret(res.data.clientSecret);
        if (res.data.bookingId) setLastBookingId(res.data.bookingId);
      }
    } catch (err: any) {
      console.error("Payment init failed:", err);
      const status = err?.response?.status;
      const backendMessage = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join(" ")
        : err?.response?.data?.message;
      
      // Improved error messages based on error type
      let errorMessage = backendMessage;
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. Verifique sua conexão e tente novamente.';
      } else if (err?.code === 'ERR_NETWORK' || !err?.response) {
        errorMessage = 'Não conseguimos conectar ao servidor. Verifique sua conexão ou tente novamente em alguns instantes.';
      } else if (status === 429 || String(backendMessage || "").toLowerCase().includes("too many")) {
        errorMessage = 'Recebemos muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.';
      } else if (status === 401 || status === 403) {
        errorMessage = 'Sessão expirada. Atualize a página e tente novamente.';
      } else if (status >= 500) {
        errorMessage = 'Erro no servidor de pagamentos. Tente novamente em alguns instantes.';
      }
      
      setPaymentInitError(errorMessage || backendMessage || "Não conseguimos preparar o pagamento agora. Verifique os dados da reserva ou tente novamente.");
      setClientSecret(null);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (step < 5) setStep(step + 1);
  };

  const selectedCategory = VEHICLE_CATEGORIES.find(c => c.id === form.category);

  if (!hasHydrated) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="relative">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" strokeWidth={1} />
        <div className="absolute inset-0 bg-brand-gold/10 blur-2xl rounded-full animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="nx-container max-w-[1440px] animate-luxury-reveal relative overflow-x-hidden">
      {/* Background atmosphere */}
      <div className="absolute -top-40 left-0 w-full h-[1000px] pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-gold/[0.04] blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-emerald-500/[0.04] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Progress indicator */}
        <div className="mb-20 relative px-4 md:px-8">
          <div className="absolute top-6 left-4 right-4 md:left-8 md:right-8 h-[1px] bg-white/[0.04] z-0" />

          <div className="flex items-start justify-between relative z-10">
            {STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;

              return (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => step > s.id && setStep(s.id)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 relative",
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-105"
                        : isActive
                        ? "bg-brand-gold text-black shadow-[0_0_36px_rgba(212,175,55,0.5)] scale-110 cursor-default"
                        : "bg-[#0A0A0F] text-white/15 border border-white/[0.08] cursor-default"
                    )}
                  >
                    {isActive && (
                      <div className="absolute -inset-2 bg-brand-gold/15 rounded-full blur-md animate-pulse" />
                    )}
                    {isCompleted ? (
                      <Check className="w-5 h-5 relative z-10" strokeWidth={3} />
                    ) : (
                      <span className="text-[11px] font-black font-sans relative z-10 tracking-tight">0{s.id}</span>
                    )}
                  </button>

                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.3em] font-sans transition-all duration-500 whitespace-nowrap hidden sm:block",
                    isActive ? "text-white" : isCompleted ? "text-emerald-500/60" : "text-white/15"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-20 items-start">
          {/* Step content */}
          <div className="relative min-h-[600px] pb-28 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 text-brand-gold animate-spin" strokeWidth={1} />
                  </div>
                }>
                  {step === 1 && <StepDetails form={form} update={update} onNext={() => setStep(2)} />}
                  {step === 2 && <StepVehicle form={form} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                  {step === 3 && <StepExtras form={form} update={update} onNext={nextStep} onBack={() => setStep(2)} />}
                  {step === 4 && <StepCustomer form={form} update={update} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
                  {step === 5 && <StepPayment form={form} update={update} onConfirm={handleConfirm} onBack={() => setStep(4)} loading={loading} total={total} clientSecret={clientSecret} initPaymentIntent={initPaymentIntent} bookingId={lastBookingId} paymentError={paymentInitError} paymentAttemptKey={paymentAttemptKey} />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="sticky top-24 hidden lg:block">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" strokeWidth={1} />
              </div>
            }>
              <BookingSummaryPanel
                form={form}
                total={total}
                extrasTotal={extrasTotal}
                calculatedBasePrice={calculatedBasePrice}
                step={step}
                isTour={isTour}
                tourData={tourData}
              />
            </Suspense>
          </div>
        </div>
      </div>

    </div>
  );
}
