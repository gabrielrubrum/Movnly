"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface Props {
    onConfirm: () => Promise<void>;
    loading: boolean;
    total: number;
    bookingId: string | null;
}

export function CheckoutForm({ onConfirm, loading: parentLoading, total, bookingId }: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useI18n();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking/confirmation/${bookingId || 'processing'}`,
            },
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            setLoading(false);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12 animate-luxury-reveal">
            <PaymentElement options={{ layout: "tabs" }} />

            {errorMessage && (
                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 text-sm font-sans italic">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {errorMessage}
                </div>
            )}

            <div className="pt-8">
                <button
                    type="submit"
                    disabled={!stripe || loading || parentLoading}
                    className="w-full py-8 md:py-10 bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-[14px] md:text-[16px] font-black uppercase tracking-[0.6em] rounded-[32px] md:rounded-[48px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.4)] group disabled:opacity-50 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] group-hover:animate-shimmer" />
                    
                    {loading || parentLoading ? (
                        <span className="flex items-center justify-center gap-4 relative z-10">
                            <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} /> {t("bookingFlow.payment.processing")}
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-8 relative z-10">
                            {t("bookingFlow.payment.confirm")}
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 group-hover:translate-x-4 transition-all duration-700 shadow-xl overflow-hidden relative">
                                <ChevronRight className="w-6 h-6 relative z-10" />
                                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
}
