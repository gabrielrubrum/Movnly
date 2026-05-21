"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { Loader2, ChevronRight, AlertCircle, Globe, RefreshCw, Shield } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { translateStripeError } from "@/lib/stripe-errors";
import { formatCurrency } from "@/lib/utils";

/**
 * All payment methods enabled: Card, Apple Pay, Google Pay, Link, MB Way, etc.
 * Stripe automatically shows what the customer's browser/device supports.
 */
const PAYMENT_ELEMENT_OPTIONS: StripePaymentElementOptions = {
  layout: { type: "tabs", defaultCollapsed: false },
  wallets: { applePay: "auto", googlePay: "auto" },
  fields: { billingDetails: { name: "never" } },
};

interface Props {
  onConfirm: () => Promise<void>;
  loading: boolean;
  total: number;
  bookingId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export function CheckoutForm({ loading: parentLoading, total, bookingId, customerName, customerEmail, customerPhone }: Props) {
  const stripe   = useStripe();
  const elements = useElements();
  const { t }    = useI18n();

  const [errorMessage,   setErrorMessage]   = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [cardholderName, setCardholderName] = useState(customerName);
  const [retryCount,     setRetryCount]     = useState(0);

  useEffect(() => {
    if (customerName) setCardholderName((prev) => prev || customerName);
  }, [customerName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const name = cardholderName.trim();
    if (!name) { setErrorMessage(t("bookingFlow.payment.cardholderNameRequired")); return; }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(translateStripeError(submitError.message, submitError.code, submitError.decline_code));
        setRetryCount((c) => c + 1);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation/${bookingId || "processing"}`,
          payment_method_data: {
            billing_details: { name, email: customerEmail || undefined, phone: customerPhone || undefined },
          },
        },
      });

      if (error) {
        setErrorMessage(translateStripeError(error.message, error.code, error.decline_code));
        setRetryCount((c) => c + 1);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro ao processar o pagamento.");
      setRetryCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = loading || parentLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-luxury-reveal">
      {/* Amount notice */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold/70 text-center">
          {t("bookingFlow.payment.currencyNotice", { amount: formatCurrency(total, "EUR") })}
        </p>
        <div className="p-4 rounded-2xl bg-black/40 border border-brand-gold/10 flex gap-3 text-white/70 text-[10px] max-w-xl mx-auto backdrop-blur-md hover:border-brand-gold/20 transition-all duration-500 text-left">
          <Globe className="w-4 h-4 text-brand-gold/70 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-gold/90 block text-[10px] tracking-wide">
              {t("bookingFlow.payment.securePaymentNoticeTitle")}
            </span>
            <p className="text-white/50 text-[9px] leading-relaxed mt-0.5">
              {t("bookingFlow.payment.securePaymentNotice")}
            </p>
          </div>
        </div>
      </div>

      {/* Cardholder name */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">
          <Shield className="w-3.5 h-3.5 text-brand-gold/40" />
          {t("bookingFlow.payment.cardholderName")}
        </label>
        <input
          type="text" required autoComplete="cc-name"
          className="w-full bg-white/[0.03] border border-white/10 rounded-[20px] py-5 px-6 text-white placeholder-white/20 focus:border-brand-gold/50 focus:outline-none transition-all font-medium text-sm"
          placeholder={t("bookingFlow.payment.cardholderNamePlaceholder")}
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
        />
      </div>

      {/* Stripe Payment Element — all methods */}
      <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.25)] overflow-hidden">
        <PaymentElement id="stripe-payment-element" options={PAYMENT_ELEMENT_OPTIONS} />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="p-5 rounded-[1.5rem] bg-[#2A0A10]/95 backdrop-blur-xl border border-red-500/30 flex flex-col gap-5 text-white/90 text-[10px] font-bold leading-relaxed shadow-[0_10px_40px_rgba(220,38,38,0.15)] animate-luxury-reveal">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-black uppercase tracking-widest mb-1 text-[9px] text-red-400">Pagamento não concluído</p>
              <p className="text-xs font-medium text-white/90">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="w-full py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] text-white transition-all shadow-sm"
          >
            Tentar outro método de pagamento
          </button>
        </div>
      )}

      {/* Retry hint */}
      {retryCount >= 2 && !errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15">
          <RefreshCw className="w-4 h-4 text-amber-400/60 flex-shrink-0" />
          <p className="text-[9px] font-bold text-amber-400/70 uppercase tracking-widest">
            Múltiplas tentativas — tente Apple Pay ou Google Pay para maior aprovação.
          </p>
        </div>
      )}

      {/* Submit */}
      <div className="pt-6 lg:pt-2 pb-safe lg:pb-0 fixed bottom-0 left-0 right-0 px-5 py-4 bg-[#08080f]/95 backdrop-blur-2xl border-t border-white/[0.06] z-50 lg:static lg:bg-transparent lg:border-none lg:p-0">
        <div className="flex items-center gap-4 lg:block">
          {/* Mobile total */}
          <div className="flex-1 lg:hidden">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Total</p>
            <p className="text-xl font-black text-brand-gold tracking-tighter leading-none mt-1">€{Math.round(total)}</p>
          </div>

          <button
            id="stripe-confirm-payment-btn"
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 lg:w-full py-4 md:py-6 bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-[10px] md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.3em] rounded-2xl md:rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 shadow-luxury-gold group disabled:opacity-50 relative overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] group-hover:animate-shimmer" />
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2 relative z-10 px-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={3} />
                <span className="truncate">A processar...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 md:gap-4 relative z-10 px-2">
                <span className="truncate">Pagar e confirmar reserva</span>
                <div className="hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/10 items-center justify-center group-hover:bg-black/20 group-hover:translate-x-3 transition-all duration-700 shadow-xl shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
