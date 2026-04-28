"use client";

import React from "react";
import { Settings, Shield, Bell, User, Monitor, Globe, Sliders } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <div className="flex items-center gap-2 text-brand-400 mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                    <Settings className="w-3.5 h-3.5" />
                    Core Configuration
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter italic">System Management</h1>
                <p className="text-white/40 text-sm mt-1">Oversee global platform parameters, corporate security, and elite branding.</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <aside className="space-y-1">
                    {[
                        { label: "General", icon: Monitor, active: true },
                        { label: "Security", icon: Shield },
                        { label: "Notifications", icon: Bell },
                        { label: "Branding", icon: palette },
                        { label: "Database", icon: database },
                        { label: "Localization", icon: Globe },
                    ].map((item) => (
                        <button key={item.label} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                            item.active ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" : "text-white/30 hover:text-white hover:bg-white/5"
                        )}>
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </aside>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-surface-1/50 border border-white/[0.05] p-8 rounded-[2rem] shadow-2xl space-y-8">
                        <section>
                            <h3 className="text-lg font-black text-white mb-6">Platform Identity</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[0.6rem] text-white/30 font-black uppercase tracking-widest mb-2 block">System Name</label>
                                    <input type="text" defaultValue="NexRice Concierge" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500" />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] text-white/30 font-black uppercase tracking-widest mb-2 block">Support Email</label>
                                    <input type="email" defaultValue="support@nexrice.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500" />
                                </div>
                            </div>
                        </section>

                        <section className="pt-8 border-t border-white/[0.05]">
                            <h3 className="text-lg font-black text-white mb-6">Horário de Operação</h3>
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-white">24/7 Availability</p>
                                    <p className="text-xs text-white/30">Enable bookings at any time of the day.</p>
                                </div>
                                <div className="w-12 h-6 bg-brand-500 rounded-full relative shadow-[0_0_15px_rgba(var(--brand-500),0.4)]">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                                </div>
                            </div>
                        </section>

                        <section className="pt-8 border-t border-white/[0.05]">
                            <h3 className="text-lg font-black text-white mb-6">Security & Auth</h3>
                            <div className="space-y-4">
                                {[
                                    { title: "MFA Enforcement", desc: "Require 2FA for all admin accounts", active: true },
                                    { title: "Session Timeout", desc: "Auto logout after 30 mins of inactivity", active: false },
                                ].map((opt) => (
                                    <div key={opt.title} className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{opt.title}</p>
                                            <p className="text-xs text-white/30">{opt.desc}</p>
                                        </div>
                                        <div className={cn("w-10 h-5 rounded-full relative transition-all", opt.active ? "bg-brand-500" : "bg-white/10")}>
                                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", opt.active ? "right-1" : "left-1")} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="pt-8 flex justify-end gap-3">
                            <button className="px-6 py-2.5 rounded-xl border border-white/10 text-white/40 font-bold text-xs hover:bg-white/5 transition-all">Reset Default</button>
                            <button className="px-8 py-2.5 rounded-xl bg-brand-500 text-white font-black text-xs shadow-brand-sm hover:bg-brand-600 transition-all">Save Config</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

const database = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

const palette = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M9.707 3.293l-3.328 3.328a4 4 0 01-5.657 5.657l3.328-3.328a4 4 0 005.657-5.657z" />
    </svg>
);
