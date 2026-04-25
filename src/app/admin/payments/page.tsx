"use client";

import React from "react";
import { CreditCard, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const TRANSACTIONS = [
    { id: "TRX-LXP662", type: "Reserva", customer: "Sr. Bernardo Silva", amount: 185.00, method: "Visa Infinite •••• 1102", date: "Agora mesmo", status: "Confirmado" },
    { id: "TRX-LXP661", type: "Pagamento Motorista", customer: "Tiago Mendes", amount: -74.00, method: "Stripe Connect", date: "Há 14 mins", status: "A Transferir" },
    { id: "TRX-LXP660", type: "Reserva", customer: "Dra. Helena Rocha", amount: 95.00, method: "AMEX Platinum •••• 8003", date: "Há 1 hora", status: "Confirmado" },
    { id: "TRX-LXP659", type: "Depósito Empresa", customer: "Four Seasons Ritz", amount: 1200.00, method: "Transferência Bancária", date: "Há 3 horas", status: "Confirmado" },
];

export default function PaymentsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <CreditCard className="w-3.5 h-3.5" />
                        Fluxo de Caixa e Tesouraria
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Gestão Financeira</h1>
                    <p className="text-white/40 text-sm mt-1">Auditoria e controlo de todas as transações e pagamentos automáticos a motoristas.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all shadow-inner">
                    <Download className="w-3.5 h-3.5" />
                    Exportar Relatório
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Volume de Faturação", value: "€14.820,00", delta: "+8.2%", color: "brand" },
                    { label: "Pendente de Atribuição", value: "€2.450,00", delta: "12 Reservas", color: "amber" },
                    { label: "Receita Líquida (60%)", value: "€8.892,00", delta: "Plataforma", color: "emerald" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-surface-1/50 border border-white/[0.05] p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
                        <p className="text-[0.6rem] uppercase tracking-widest font-black text-white/30 mb-2">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-white">{stat.value}</span>
                            <span className={cn("text-[0.65rem] font-bold px-2 py-0.5 rounded-md mb-1.5",
                                stat.color === 'brand' ? 'bg-brand-gold/10 text-brand-gold' :
                                    stat.color === 'amber' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                            )}>
                                {stat.delta}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-surface-1/50 border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/[0.05] bg-white/[0.02]">
                    <h2 className="text-sm font-bold text-white">Transações Recentes</h2>
                </div>
                <table className="w-full text-left font-medium">
                    <tbody className="divide-y divide-white/[0.03]">
                        {TRANSACTIONS.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border",
                                            tx.amount > 0 ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : "bg-red-500/5 border-red-500/10 text-red-400"
                                        )}>
                                            {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{tx.type} • {tx.id}</p>
                                            <p className="text-[0.7rem] text-white/30">{tx.customer}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs text-white/40">{tx.method}</td>
                                <td className="px-8 py-6 text-xs text-white/30">{tx.date}</td>
                                <td className="px-8 py-6">
                                    <span className={cn("text-[0.65rem] font-bold uppercase tracking-widest",
                                        tx.status === 'Confirmado' ? 'text-emerald-400' : 'text-amber-400'
                                    )}>{tx.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right pr-12">
                                    <span className={cn("text-lg font-black", tx.amount > 0 ? "text-white" : "text-white/40")}>
                                        {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
