import React from "react";
import { Car, Battery, Map, Settings2, ShieldCheck, Activity } from "lucide-react";

const DEMO_FLEET = [
    { id: "V-001", model: "Mercedes S-Class 580e", type: "PHEV", status: "Active", battery: 85, plate: "AA-11-BB", mileage: "12.450 km" },
    { id: "V-002", model: "Mercedes V-Class 300d", type: "Diesel", status: "Active", battery: 100, plate: "XX-99-ZZ", mileage: "45.210 km" },
    { id: "V-003", model: "Tesla Model S Plaid", type: "Electric", status: "Charging", battery: 20, plate: "TS-LA-01", mileage: "8.900 km" },
    { id: "V-004", model: "BMW 745e", type: "PHEV", status: "Maintenance", battery: 0, plate: "BM-WW-07", mileage: "62.100 km" },
    { id: "V-005", model: "Range Rover SV", type: "Petrol", status: "Active", battery: 100, plate: "RR-SV-99", mileage: "3.400 km" },
];

export default function FleetPage() {
    return (
        <div className="relative px-6 md:px-8 xl:px-12 py-8 max-w-[2000px] mx-auto w-full space-y-10 min-h-screen">
            {/* Ambient Premium Glows */}
            <div className="absolute top-40 left-1/4 w-[600px] h-[300px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Gestão da Frota</h1>
                    <p className="text-white/40 text-sm mt-1">Controlo de veículos, manutenção e estado da frota em tempo real.</p>
                </div>
                <button className="nx-btn nx-btn-primary">Registar Viatura</button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Fleet KPI */}
                <div className="relative overflow-hidden p-6 rounded-[24px] bg-gradient-to-br from-surface-1/80 to-black border border-white/[0.05] shadow-2xl backdrop-blur-xl">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/20 blur-[40px] rounded-full pointer-events-none" />
                    <h2 className="text-white/50 text-[0.65rem] font-black uppercase tracking-[0.2em] mb-6">Estado da Frota</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full border-4 border-brand-gold/20 flex items-center justify-center relative">
                            <span className="text-2xl font-black text-white">98<span className="text-sm text-brand-gold">%</span></span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="36" cy="36" r="32" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-brand-gold" strokeDasharray="200" strokeDashoffset="4" />
                            </svg>
                        </div>
                        <div className="space-y-2 flex-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold">Ativos</span>
                                <span className="text-emerald-400 font-black">24</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold">Manutenção</span>
                                <span className="text-amber-400 font-black">2</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold">Carga</span>
                                <span className="text-brand-gold font-black">1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Telemetry Card spanning 2 cols */}
                <div className="xl:col-span-2 relative overflow-hidden p-6 rounded-[24px] bg-gradient-to-r from-surface-1/80 to-surface-0/50 border border-white/[0.05] shadow-2xl backdrop-blur-xl flex flex-col justify-center gap-4">
                    <h2 className="text-white/50 text-[0.65rem] font-black uppercase tracking-[0.2em]">Telemetria Global</h2>
                    <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
                        <div className="px-6 flex flex-col items-center justify-center text-center">
                            <Activity className="w-5 h-5 text-emerald-400 mb-2 opacity-50" />
                            <span className="text-2xl font-black text-white">1.2M</span>
                            <span className="text-[0.6rem] text-white/40 uppercase tracking-widest font-bold mt-1">KMs Totais</span>
                        </div>
                        <div className="px-6 flex flex-col items-center justify-center text-center">
                            <ShieldCheck className="w-5 h-5 text-brand-gold mb-2 opacity-50" />
                            <span className="text-2xl font-black text-white">100%</span>
                            <span className="text-[0.6rem] text-white/40 uppercase tracking-widest font-bold mt-1">Seguros Ativos</span>
                        </div>
                        <div className="px-6 flex flex-col items-center justify-center text-center">
                            <Battery className="w-5 h-5 text-brand-gold mb-2 opacity-50" />
                            <span className="text-2xl font-black text-white">48%</span>
                            <span className="text-[0.6rem] text-white/40 uppercase tracking-widest font-bold mt-1">Carga Média</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface-1/50 border border-white/[0.05] rounded-[2rem] shadow-2xl overflow-hidden mt-8 backdrop-blur-lg">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-white/[0.08] bg-black/60">
                            {["ID Viatura", "Modelo", "Estado Bateria", "Matrícula", "Quilometragem", "Estado", ""].map((h) => (
                                <th key={h} className="text-left text-xs font-black text-white/30 uppercase px-6 py-5 first:pl-8 last:pr-8 tracking-[0.15em]">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        {DEMO_FLEET.map((v) => (
                            <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-5 pl-8 whitespace-nowrap">
                                    <span className="text-xs font-mono font-bold text-white/50 bg-white/5 px-2 py-1 rounded-md">{v.id}</span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white/90">{v.model}</span>
                                        <span className="text-[0.65rem] text-brand-gold font-black uppercase tracking-widest mt-0.5">{v.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <Battery className={`w-4 h-4 ${v.battery > 50 ? "text-emerald-500" : v.battery > 20 ? "text-amber-500" : "text-red-500"}`} />
                                        <div className="w-24 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                            <div className={`h-full ${v.battery > 50 ? "bg-emerald-500" : v.battery > 20 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${v.battery}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-white/50">{v.battery}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-xs font-mono font-bold text-white/80 border border-white/10 px-2 py-1 rounded bg-black/40">{v.plate}</span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-white/60">{v.mileage}</span>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    {v.status === "Active" ? (
                                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20">Em Serviço</span>
                                    ) : v.status === "Charging" ? (
                                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1.5 rounded-md border border-brand-gold/20">A Carregar</span>
                                    ) : (
                                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/20">Manutenção</span>
                                    )}
                                </td>
                                <td className="px-6 py-5 pr-8 whitespace-nowrap text-right">
                                    <button className="text-white/30 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
                                        <Settings2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
