"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Plus, Trash2, Building2, CheckCircle2, ShieldCheck, Zap, Wallet } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useI18n } from "@/i18n/context";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentMethodsPage() {
    const { t } = useI18n();
    const user = useAuthStore(s => s.user);

    const [methods, setMethods] = useState([
        { id: "1", type: "card", brand: "Visa", last4: "4242", expiry: "12/28", isDefault: true },
        { id: "2", type: "card", brand: "Mastercard", last4: "5555", expiry: "08/26", isDefault: false },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "" });

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCard.number || !newCard.expiry || !newCard.cvv) return;

        setMethods(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                type: "card",
                brand: newCard.number.startsWith("4") ? "Visa" : "Mastercard",
                last4: newCard.number.slice(-4) || "0000",
                expiry: newCard.expiry,
                isDefault: prev.length === 0,
            }
        ]);
        setIsAdding(false);
        setNewCard({ number: "", expiry: "", cvv: "" });
    };

    const setAsDefault = (id: string) => {
        setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
    };

    const removeMethod = (id: string) => {
        setMethods(methods.filter(m => m.id !== id));
    };

    if (!user) return null; // Handled by layout/auth guard if exists

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-luxury-reveal pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10 relative">
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="flex flex-col relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-3 flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> Pagamentos
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                        Faturas & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-[#a6862c]">Pagamentos</span>
                    </h1>
                    <p className="text-white/40 text-sm font-light italic mt-4 tracking-wide flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-brand-gold/50" /> Suas transações são protegidas com segurança máxima.
                    </p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="h-14 px-8 bg-[#07070A] border border-brand-gold/30 text-brand-gold text-[11px] font-black uppercase tracking-[0.2em] rounded-[20px] hover:bg-gradient-to-r hover:from-brand-gold hover:to-[#a6862c] hover:text-black transition-all flex items-center justify-center gap-3 group relative z-10 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Adicionar Cartão
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
                
                {/* Methods List */}
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {methods.map((method, idx) => (
                            <motion.div
                                key={method.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 md:p-10 rounded-[32px] bg-[#07070A] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-brand-gold/30 transition-all duration-500 overflow-hidden relative shadow-xl"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="flex items-center gap-6 relative z-10">
                                    {/* Card Visual Representation */}
                                    <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-[#1a1a24] to-black border border-white/10 flex flex-col justify-between p-3 relative overflow-hidden shadow-inner shrink-0 group-hover:border-brand-gold/40 transition-colors">
                                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="w-6 h-4 bg-brand-gold/30 rounded-sm" /> {/* Chip */}
                                            <CreditCard className="w-4 h-4 text-white/20" />
                                        </div>
                                        <div className="text-[8px] font-mono text-white/50 tracking-[0.2em] relative z-10">
                                            •••• {method.last4}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <p className="text-xl font-bold text-white tracking-wide uppercase">
                                                {method.brand} <span className="text-white/30 font-light mx-2">•</span> <span className="font-light">{method.last4}</span>
                                            </p>
                                            {method.isDefault && (
                                                <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase tracking-widest border border-brand-gold/20 rounded-lg flex items-center gap-2 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                                                    <CheckCircle2 className="w-3 h-3" /> Principal
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-sans flex items-center gap-2">
                                            Validade: <span className="text-white/60 font-medium">{method.expiry}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 relative z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    {!method.isDefault && (
                                        <button 
                                            onClick={() => setAsDefault(method.id)}
                                            className="px-6 py-3 rounded-[16px] bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            Tornar Principal
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => removeMethod(method.id)}
                                        className="w-12 h-12 rounded-[16px] bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center"
                                        title="Remover Cartão"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {methods.length === 0 && !isAdding && (
                        <div className="p-20 text-center rounded-[32px] bg-[#07070A] border border-dashed border-white/10 shadow-inner">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Nenhum cartão cadastrado</p>
                        </div>
                    )}
                </div>

                {/* Addition Form / Promo Widget */}
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        {isAdding ? (
                            <motion.div 
                                key="add-form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-10 rounded-[32px] bg-[#07070A] border border-brand-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.05)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />
                                <h3 className="text-xl font-bold text-white tracking-wide mb-8 relative z-10 flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-brand-gold" /> Novo Cartão
                                </h3>
                                
                                <form onSubmit={handleAddCard} className="space-y-8 relative z-10">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 px-2 font-sans">Número do Cartão</label>
                                        <input
                                            className="w-full h-16 bg-[#030303] border border-white/10 rounded-[20px] px-6 text-white text-lg font-mono tracking-widest focus:outline-none focus:border-brand-gold focus:bg-brand-gold/5 transition-all shadow-inner"
                                            placeholder="•••• •••• •••• ••••"
                                            maxLength={19}
                                            value={newCard.number}
                                            onChange={e => {
                                                const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$2 ").trim();
                                                setNewCard({ ...newCard, number: v });
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 px-2 font-sans">Validade</label>
                                            <input
                                                className="w-full h-16 bg-[#030303] border border-white/10 rounded-[20px] px-6 text-white text-center font-mono focus:outline-none focus:border-brand-gold transition-all shadow-inner"
                                                placeholder="MM/AA"
                                                maxLength={5}
                                                value={newCard.expiry}
                                                onChange={e => {
                                                    const v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2");
                                                    setNewCard({ ...newCard, expiry: v });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 px-2 font-sans">CVC</label>
                                            <input
                                                className="w-full h-16 bg-[#030303] border border-white/10 rounded-[20px] px-6 text-white text-center font-mono focus:outline-none focus:border-brand-gold transition-all shadow-inner"
                                                type="password"
                                                placeholder="•••"
                                                maxLength={4}
                                                value={newCard.cvv}
                                                onChange={e => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "") })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsAdding(false)} 
                                            className="w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={!newCard.number || !newCard.expiry || !newCard.cvv}
                                            className="flex-1 h-16 bg-gradient-to-br from-brand-gold to-[#a6862c] text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-[20px] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] disabled:opacity-30 disabled:hover:scale-100"
                                        >
                                            Salvar Cartão
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="promo-widget"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-10 rounded-[32px] bg-gradient-to-br from-[#0A0A0C] to-black border border-white/5 space-y-8 relative overflow-hidden group shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                <div className="w-16 h-16 rounded-[20px] bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors relative z-10 border border-brand-gold/20">
                                    <Building2 className="w-8 h-8 text-brand-gold" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-2xl font-bold text-white tracking-wide mb-3">Conta Corporativa</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 leading-relaxed font-sans">
                                        Necessita de faturamento empresarial consolidado e gestão de múltiplos executivos? Eleve a sua conta para o estatuto Corporate.
                                    </p>
                                </div>
                                <button className="w-full py-5 rounded-[20px] border border-brand-gold/50 text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all relative z-10">
                                    Solicitar Upgrade <Zap className="w-3 h-3 inline-block ml-2 mb-0.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
