"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingSteps } from "@/components/booking/BookingSteps";

function ReservarContent() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 overflow-x-hidden" style={{ background: "#08080f" }}>
        <BookingSteps />
      </main>
      <Footer />
    </>
  );
}

export default function ReservarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#08080f" }} />}>
      <ReservarContent />
    </Suspense>
  );
}
