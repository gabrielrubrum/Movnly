"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar, DollarSign, Users, TrendingUp,
  ArrowRight, Plus, Star, Building2,
} from "lucide-react";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";

const BOOKINGS = [
  { id: "NX-P-001", guest: "Sarah Mitchell",  route: "Airport → Hotel",  date: "2026-03-27", category: "Executive", price: 95,  commission: 9.5,  status: "completed" as const },
  { id: "NX-P-002", guest: "Marco Fernández", route: "Hotel → Sintra",   date: "2026-03-27", category: "Comfort",   price: 55,  commission: 5.5,  status: "confirmed" as const },
  { id: "NX-P-003", guest: "Familie Müller",  route: "Airport → Hotel",  date: "2026-03-28", category: "Group",     price: 75,  commission: 7.5,  status: "confirmed" as const },
];

export default function ParceiroDashboard() {
  return (
    <div className="min-h-screen bg-surface-0 p-5 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-sm">
                <span className="text-white font-black text-xs">NX</span>
              </div>
              <span className="text-white font-black" style={{ letterSpacing: "-0.05em" }}>
                NEX<span className="text-grad-gold">RIDE</span>
              </span>
              <span className="nx-badge nx-badge-purple">Partner</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Partner Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Bairro Alto Hotel · March 2026</p>
          </div>
          <Link href="/book" className="nx-btn nx-btn-primary nx-btn-sm flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New booking
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Bookings this month", value: "34",              icon: Calendar,   color: "brand" },
            { label: "Revenue generated",   value: formatCurrency(2840), icon: TrendingUp, color: "emerald" },
            { label: "Commissions earned",  value: formatCurrency(284),  icon: DollarSign, color: "amber" },
            { label: "Guests served",       value: "41",              icon: Users,      color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => {
            const cls = {
              brand:   "bg-brand-500/10 text-brand-400 border-brand-500/15",
              emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
              amber:   "bg-amber-500/10 text-amber-400 border-amber-500/15",
              purple:  "bg-purple-500/10 text-purple-400 border-purple-500/15",
            }[color]!.split(" ");
            return (
              <div key={label} className="nx-card p-5">
                <div className={`w-9 h-9 rounded-xl ${cls[0]} border ${cls[2]} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${cls[1]}`} />
                </div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs text-white/35 mt-0.5">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Commission highlight */}
        <div className="p-5 rounded-2xl border border-yellow-500/15"
          style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.02) 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Monthly commission</p>
              <p className="text-xs text-white/40 mt-0.5">Rate: 10% per booking · Payment: 1 April</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">{formatCurrency(284)}</p>
              <span className="nx-badge nx-badge-amber mt-1 inline-flex">Processing</span>
            </div>
          </div>
        </div>

        {/* Recent bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent bookings</h2>
            <Link href="/partners/bookings" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="nx-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Guest", "Route", "Date", "Category", "Value", "Commission", "Status"].map((h) => (
                    <th key={h} className="text-left text-[0.65rem] font-bold text-white/25 uppercase px-4 py-3 first:pl-5 last:pr-5" style={{ letterSpacing: "0.08em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {BOOKINGS.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 pl-5">
                      <p className="text-sm font-medium text-white">{b.guest}</p>
                      <p className="text-xs text-white/30 font-mono">{b.id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white/60">{b.route}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50">{formatDate(b.date)}</td>
                    <td className="px-4 py-3.5">
                      <span className="nx-badge nx-badge-brand capitalize">{b.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-white">{formatCurrency(b.price)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-yellow-400">{formatCurrency(b.commission)}</td>
                    <td className="px-4 py-3.5 pr-5">
                      <BookingStatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick booking */}
        <div className="nx-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Book for a guest</h3>
              <p className="text-sm text-white/40">Create a booking quickly for a hotel guest.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input className="nx-input" placeholder="Guest name" />
            <input className="nx-input" placeholder="Destination" />
            <Link href="/book" className="nx-btn nx-btn-primary flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Create booking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
