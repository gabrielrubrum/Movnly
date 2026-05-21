"use client";

import { useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function BookingSuccessRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get("bookingId");

  useEffect(() => {
    router.replace(`/booking/confirmation/${bookingId || "processing"}?redirect_status=processing`);
  }, [bookingId, router]);

  return (
    <main className="min-h-screen bg-[#08080f] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
          A confirmar pagamento seguro...
        </p>
      </div>
    </main>
  );
}

export default function BookingSuccessRedirectPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#08080f] flex items-center justify-center px-6">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </main>
    }>
      <BookingSuccessRedirect />
    </Suspense>
  );
}
