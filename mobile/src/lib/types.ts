export type UserRole = "PASSENGER" | "DRIVER" | "PARTNER" | "ADMIN";

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  category: string;
  origin: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  totalPrice: number;
  currency: string;
  passenger?: { name: string; email: string; phone?: string };
  driver?: { id: string; name: string; phone?: string };
  pin?: string;
}

export interface PartnerDashboard {
  bookingsThisMonth: number;
  revenueGenerated: number;
  commissionsEarned: number;
  guestsServed: number;
  commissionRate: number;
  organization: string;
  type: string;
}
