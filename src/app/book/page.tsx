"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingSteps } from "@/components/booking/BookingSteps";

function BookContent() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#08080f] pt-24 pb-20">
        <BookingSteps />
      </main>
      <Footer />
    </>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080f]" />}>
      <BookContent />
    </Suspense>
  );
}
