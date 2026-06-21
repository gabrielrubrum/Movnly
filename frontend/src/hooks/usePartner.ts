"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export interface PartnerDashboard {
  bookingsThisMonth: number;
  revenueGenerated: number;
  commissionsEarned: number;
  guestsServed: number;
  commissionRate: number;
  organization: string;
  type: string;
}

export interface PartnerBooking {
  id: string;
  from: string;
  to: string;
  pickupTime: string;
  category: string;
  status: string;
  price: number | null;
  partnerCommission: number | null;
  passengerData?: { name: string; email: string; phone?: string };
}

export function usePartner() {
  const token = useAuthStore((s) => s.token);
  const [dashboard, setDashboard] = useState<PartnerDashboard | null>(null);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get("/partners/dashboard");
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get("/partners/bookings");
    setBookings(data);
  }, [token]);

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token, fetchDashboard]);

  return { dashboard, bookings, loading, fetchDashboard, fetchBookings };
}
