/**
 * Centralized Type Definitions for NexRice Platform
 * Ensures consistency across Frontend components and Backend synchronization
 */

export type BookingStatus =
  | "pending"
  | "pending_payment"
  | "confirmed"
  | "driver_assigned"
  | "driver_en_route"
  | "driver_arrived"
  | "in_progress"
  | "on_route"
  | "completed"
  | "cancelled"
  | "no_show";

export type VehicleCategory = "smart" | "comfort" | "group" | "executive";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "card" | "mbway" | "invoice";

export interface BookingExtra {
  id: string;
  name: string;
  price: number;
}

export interface BookingPassenger {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingDriver {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  rating: number;
  totalTrips: number;
  vehicle: {
    make: string;
    model: string;
    plate: string;
    color: string;
    year: number;
  };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  category: VehicleCategory;
  origin: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  passengers: number;
  luggage: number;
  flightNumber?: string;
  airline?: string;
  extras: BookingExtra[];
  basePrice: number;
  extrasPrice: number;
  totalPrice: number;
  currency: string;
  passenger: BookingPassenger;
  driver?: BookingDriver;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  driverAmount?: number;
  platformFee?: number;
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: string;
  distance?: string;
  notes?: string;
  rating?: number;
  review?: string;
  tripType: "oneway" | "roundtrip";
  availableAt?: string;
  pin?: string;
  auditLogs?: AuditLogEntry[];
}
