"use client";

import React from "react";
import { Zap, Plus, Search, Tag, Calendar, Users, ArrowRight, Percent } from "lucide-react";

const COUPONS = [
    { code: "LISBON-EXPERIENCE", discount: "20%", used: 45, limit: 100, expiry: "30 Apr 2026", status: "Active" },
    { code: "INSTITUTIONAL-HSB", discount: "€50,00", used: 12, limit: 50, expiry: "15 May 2026", status: "Active" },
    { code: "SUMMER-PRESTIGE", discount: "15%", used: 0, limit: 500, expiry: "31 Aug 2026", status: "Scheduled" },
];

export default function CouponsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-400 mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <Zap className="w-3.5 h-3.5" />
                        Incentive Logistics
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Prestige Programs</h1>
                    <p className="text-white/40 text-sm mt-1">Management of bespoke promotional campaigns and corporate institutional honorariums.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-black text-xs hover:bg-brand-600 transition-all shadow-brand-sm">
                    <Plus className="w-3.5 h-3.5" />
                    Create Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {COUPONS.map((c) => (
                    <div key={c.code} className="relative group overflow-hidden bg-surface-1/50 border border-white/[0.05] p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                            <Percent className="w-32 h-32 rotate-12" />
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                                <span className="text-xs font-black text-brand-400 font-mono tracking-wider">{c.code}</span>
                            </div>
                            <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
                                }`}>{c.status}</span>
                        </div>

                        <div className="space-y-2 mb-8">
                            <p className="text-4xl font-black text-white">{c.discount} <span className="text-sm font-normal text-white/20">OFF</span></p>
                            <p className="text-xs text-white/40 font-medium">Expires on {c.expiry}</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[0.65rem] font-bold">
                                <span className="text-white/20 uppercase tracking-widest">Usage: {c.used}/{c.limit}</span>
                                <span className="text-brand-400">{Math.round((c.used / c.limit) * 100)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500),0.5)] transition-all duration-1000"
                                    style={{ width: `${(c.used / c.limit) * 100}%` }}
                                />
                            </div>
                        </div>

                        <button className="flex items-center gap-2 mt-8 text-[0.7rem] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-all">
                            Manage Rule <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
