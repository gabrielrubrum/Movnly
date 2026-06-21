import { create } from "zustand";
import { EXTRAS, getBasePrice } from "./constants";
import { getPricingMultiplier } from "./pricing";

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
  category: string;
  extras: string[];
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const defaultForm = (): BookingFormData => ({
  tripType: "oneway",
  origin: "",
  destination: "",
  date: "",
  time: "10:00",
  returnDate: "",
  returnTime: "",
  passengers: 2,
  luggage: 2,
  flightNumber: "",
  category: "comfort",
  extras: [],
  name: "",
  email: "",
  phone: "",
  notes: "",
});

function computeTotal(form: BookingFormData) {
  const isPathDefined = !!(form.origin && form.destination && form.date && form.time);
  if (!isPathDefined) return { total: 0, basePrice: 0, extrasTotal: 0, surcharges: [] as string[] };

  const leg1Pricing = getPricingMultiplier(form.date, form.time);
  const baseRate = getBasePrice(form.category, form.origin, form.destination);
  const leg1Final = Math.round(baseRate * leg1Pricing.multiplier);

  let leg2Final = 0;
  if (form.tripType === "roundtrip" && form.returnDate && form.returnTime) {
    const leg2Pricing = getPricingMultiplier(form.returnDate, form.returnTime);
    leg2Final = Math.round(baseRate * leg2Pricing.multiplier);
  }

  const calculatedBase = form.tripType === "roundtrip" ? leg1Final + leg2Final : leg1Final;
  const roundTripDiscount =
    form.tripType === "roundtrip" && leg2Final > 0 ? Math.round(calculatedBase * 0.05) : 0;
  const finalBase = calculatedBase - roundTripDiscount;
  const extrasTotal = form.extras.reduce((sum, id) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra?.price || 0);
  }, 0);

  return {
    total: finalBase + extrasTotal,
    basePrice: finalBase,
    extrasTotal,
    surcharges: leg1Pricing.reasons,
  };
}

interface BookingState {
  step: number;
  form: BookingFormData;
  clientSecret: string | null;
  bookingId: string | null;
  paymentError: string | null;
  setStep: (step: number) => void;
  updateForm: (patch: Partial<BookingFormData>) => void;
  reset: () => void;
  prefillRoute: (origin: string, destination: string, category?: string) => void;
  setPayment: (data: { clientSecret?: string | null; bookingId?: string | null; paymentError?: string | null }) => void;
  getTotals: () => ReturnType<typeof computeTotal>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  step: 1,
  form: defaultForm(),
  clientSecret: null,
  bookingId: null,
  paymentError: null,

  setStep: (step) => set({ step }),

  updateForm: (patch) =>
    set((state) => {
      const paymentFields = ["origin", "destination", "date", "time", "category", "extras", "tripType"];
      const affectsPayment = Object.keys(patch).some((k) => paymentFields.includes(k));
      return {
        form: { ...state.form, ...patch },
        ...(affectsPayment ? { clientSecret: null, paymentError: null } : {}),
      };
    }),

  reset: () =>
    set({
      step: 1,
      form: defaultForm(),
      clientSecret: null,
      bookingId: null,
      paymentError: null,
    }),

  prefillRoute: (origin, destination, category = "comfort") =>
    set((state) => ({
      form: { ...state.form, origin, destination, category },
      step: 1,
      clientSecret: null,
      bookingId: null,
      paymentError: null,
    })),

  setPayment: (data) => set(data),

  getTotals: () => computeTotal(get().form),
}));
