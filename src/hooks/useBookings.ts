"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { type Booking, type BookingStatus } from "@/lib/types"; // Updated to use centralized types
import { toast } from "sonner";

// Helper to map backend Prisma Booking to frontend Booking
const mapBackendToFrontend = (dbBooking: any): Booking => {
  const d = new Date(dbBooking.pickupTime);
  const dateStr = d.toISOString().split("T")[0];
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate a mock reference derived from ID to preserve UI aesthetic
  const ref = String(parseInt(dbBooking.id.replace(/-/g, '').slice(0, 8), 16) % 900000 + 100000);

  return {
    id: dbBooking.id,
    reference: ref,
    status: (dbBooking.status?.toLowerCase() || 'pending_payment') as BookingStatus,
    category: (dbBooking.category?.toLowerCase() || 'smart') as any,
    origin: dbBooking.from,
    destination: dbBooking.to,
    pickupDate: dateStr,
    pickupTime: timeStr,
    passengers: dbBooking.passengers || 1,
    luggage: dbBooking.luggage || 0,
    flightNumber: dbBooking.flightNumber,
    extras: [],
    basePrice: dbBooking.price || 0,
    extrasPrice: 0,
    totalPrice: dbBooking.price || 0,
    currency: "EUR",
    passenger: {
      name: dbBooking.passenger?.name || "Cliente NexRice",
      email: dbBooking.passenger?.email || "",
      phone: dbBooking.passenger?.phone || "+351 --- --- ---"
    },
    driver: dbBooking.driver,
    paymentStatus: (dbBooking.paymentStatus?.toLowerCase() || 'pending') as any,
    tripType: "oneway",
    driverAmount: dbBooking.driverAmount || 0,
    platformFee: dbBooking.platformFee || 0,
    availableAt: dbBooking.availableAt,
    auditLogs: dbBooking.auditLogs || [],
    createdAt: dbBooking.createdAt,
    updatedAt: dbBooking.updatedAt,
  };
};

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        setLoading(false);
        return;
      }

      // Role-Aware Data Fetching: Passengers only see their own bookings
      if (user.role === 'PASSENGER') {
        const res = await api.get(`/bookings/my`);
        const mapped = res.data.map(mapBackendToFrontend).sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(mapped);
        setDrivers([]); // Passengers don't need driver list
      } else {
        // Admins and Drivers see the wider portfolio
        const [bookingsRes, driversRes] = await Promise.all([
          api.get(`/bookings`),
          api.get(`/bookings/drivers`)
        ]);

        const mapped = bookingsRes.data.map(mapBackendToFrontend).sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setBookings(mapped);
        setDrivers(driversRes.data);
      }
    } catch (err: any) {
      console.error("Failed to load backend bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Auto-refresh every 30 seconds for demo "live" effect
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    bookings,
    loading,
    upcoming: bookings.filter((b) => {
      if (["cancelled", "completed", "no_show"].includes(b.status)) return false;
      const dt = new Date(`${b.pickupDate}T${b.pickupTime}`);
      return dt >= new Date();
    }),
    completed: bookings.filter((b) => b.status === "completed"),
    live: bookings.filter((b) =>
      ["driver_assigned", "driver_en_route", "driver_arrived", "in_progress", "on_route"].includes(b.status.toLowerCase()) && b.driver
    ),
    marketplace: bookings.filter((b) =>
      b.status.toLowerCase() === "confirmed" && !b.driver
    ),
    drivers,
    acceptBooking: async (bookingId: string) => {
      try {
        await api.post(`/bookings/${bookingId}/accept`);
        refresh();
        toast.success("Missão Aceite", { description: "A viagem foi atribuída ao seu perfil." });
      } catch (err: any) {
        console.error("Failed to accept booking:", err);
      }
    },
    assignDriver: async (bookingId: string, driverId: string) => {
      try {
        await api.post(`/bookings/${bookingId}/assign`, { driverId });
        refresh();
        toast.success("Motorista Atribuído");
      } catch (err: any) {
        console.error("Failed to load backend bookings:", err);
      }
    },
    cancel: async (id: string) => {
      try {
        await api.post(`/bookings/${id}/cancel`);
        refresh();
        toast.success("Operação Concluída", { description: "A reserva foi cancelada no sistema." });
      } catch (err: any) {
        console.error("Failed to cancel booking:", err);
      }
    },
    updateStatus: async (id: string, status: BookingStatus, pin?: string) => {
      try {
        await api.patch(`/bookings/${id}/status`, { status: status.toUpperCase(), pin });
        refresh();
      } catch (err: any) {
        console.error(err);
      }
    },
    refresh,
  };
}

export function useBooking(id: string) {
  const [booking, setBooking] = useState<Booking | undefined>(undefined);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${id}`);
        setBooking(mapBackendToFrontend(data));
      } catch (err: any) {
        console.error("Failed to load booking details");
      }
    };
    if (id) fetchBooking();
  }, [id]);

  return booking;
}
