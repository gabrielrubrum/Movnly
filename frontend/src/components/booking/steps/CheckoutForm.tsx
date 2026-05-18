"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { Loader2, ChevronRight, AlertCircle, User } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { translateStripeError } from "@/lib/stripe-errors";
import { formatCurrency } from "@/lib/utils";

/** Stripe Payment Element — só cartão; nome e país são enviados no confirmPayment */
const PAYMENT_ELEMENT_OPTIONS: StripePaymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ["card"],
    fields: {
        billingDetails: {
            name: "never",
            email: "never",
            phone: "never",
            address: "never",
        },
    },
};

interface Props {
    onConfirm: () => Promise<void>;
    loading: boolean;
    total: number;
    bookingId: string | null;
    customerName: string;
    customerEmail: string;
}

export function CheckoutForm({ loading: parentLoading, total, bookingId, customerName, customerEmail }: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useI18n();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cardholderName, setCardholderName] = useState(customerName);

    useEffect(() => {
        if (customerName) {
            setCardholderName((prev) => prev || customerName);
        }
    }, [customerName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        const name = cardholderName.trim();
        if (!name) {
            setErrorMessage(t("bookingFlow.payment.cardholderNameRequired"));
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(translateStripeError(submitError.message, submitError.code));
            setLoading(false);
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking/confirmation/${bookingId || "processing"}`,
                payment_method_data: {
                    billing_details: {
                        name,
                        email: customerEmail.trim() || undefined,
                        address: {
                            country: "PT",
                        },
                    },
                },
            },
        });

        if (error) {
            setErrorMessage(translateStripeError(error.message, error.code));
            setLoading(false);
            return;
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-luxury-reveal">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold/70 text-center">
                {t("bookingFlow.payment.currencyNotice", { amount: formatCurrency(total, "EUR") })}
            </p>

            <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-2 font-sans">
                    <User className="w-3.5 h-3.5 text-brand-gold/40" />
                    {t("bookingFlow.payment.cardholderName")}
                </label>
                <input
                    type="text"
                    required
                    autoComplete="cc-name"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] py-5 px-6 text-white focus:border-brand-gold/50 transition-all font-medium text-sm"
                    placeholder={t("bookingFlow.payment.cardholderNamePlaceholder")}
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                />
            </div>

            <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />

            {errorMessage && (
                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest font-sans">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {errorMessage}
                </div>
            )}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={!stripe || loading || parentLoading}
                    className="w-full py-5 md:py-6 bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 shadow-luxury-gold group disabled:opacity-50 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] group-hover:animate-shimmer" />

                    {loading || parentLoading ? (
                        <span className="flex items-center justify-center gap-3 relative z-10 text-center px-4">
                            <Loader2 className="w-5 h-5 animate-spin shrink-0" strokeWidth={3} />
                            <span className="truncate">{t("bookingFlow.payment.processing")}</span>
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-3 md:gap-6 relative z-10 text-center px-4">
                            <span className="truncate">{t("bookingFlow.payment.confirm")}</span>
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 group-hover:translate-x-4 transition-all duration-700 shadow-xl overflow-hidden relative">
                                <ChevronRight className="w-6 h-6 relative z-10" />
                            </div>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
}
