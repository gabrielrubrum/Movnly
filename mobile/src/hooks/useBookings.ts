import { useState, useCallback } from "react";
import api from "@/lib/api";
import type { Booking, BookingStatus } from "@/lib/types";

function mapBooking(db: any): Booking {
  const d = new Date(db.pickupTime);
  const ref = String(parseInt(db.id.replace(/-/g, "").slice(0, 8), 16) % 900000 + 100000);
  return {
    id: db.id,
    reference: ref,
    status: (db.status?.toLowerCase() || "pending") as BookingStatus,
    category: db.category || "smart",
    origin: db.from,
    destination: db.to,
    pickupDate: d.toISOString().split("T")[0],
    pickupTime: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    totalPrice: db.price || 0,
    currency: "EUR",
    passenger: db.passengerData || db.passenger,
    driver: db.driver,
    pin: db.pin,
  };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data.map(mapBooking));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDriverBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings");
      setBookings(data.map(mapBooking));
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptBooking = useCallback(async (id: string) => {
    await api.post(`/bookings/${id}/accept`);
  }, []);

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings");
      setBookings(data.map(mapBooking));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string, pin?: string) => {
    await api.patch(`/bookings/${id}/status`, { status, pin });
  }, []);

  return { bookings, loading, fetchMyBookings, fetchDriverBookings, fetchAllBookings, acceptBooking, updateStatus };
}
