"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Plus, Trash2, Building2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
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
        <div className="max-w-5xl mx-auto space-y-12 animate-luxury-reveal">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full w-max">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em]">Pagamentos Seguros</span>
                    </div>
                    <h1 className="text-5xl font-extralight text-white italic tracking-tighter leading-none">
                        Gestão de <span className="not-italic font-light text-brand-gold ml-3">Faturação</span>
                    </h1>
                    <p className="text-white/30 text-lg font-light italic">Seus métodos de pagamento são encriptados e processados com segurança máxima.</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="h-14 px-8 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all flex items-center gap-4 group"
                    >
                        <Plus className="w-4 h-4" /> Novo Cartão
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
                                className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-brand-gold/30 transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-gold transition-colors">
                                        <CreditCard className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <p className="text-2xl font-light text-white italic tracking-tight uppercase">
                                                {method.brand} •••• {method.last4}
                                            </p>
                                            {method.isDefault && (
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 rounded-full flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3" /> Principal
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 font-sans">Válido até {method.expiry}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!method.isDefault && (
                                        <button 
                                            onClick={() => setAsDefault(method.id)}
                                            className="px-6 py-3 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                        >
                                            Tornar Padrão
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => removeMethod(method.id)}
                                        className="w-12 h-12 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {methods.length === 0 && !isAdding && (
                        <div className="p-20 text-center rounded-[48px] bg-white/[0.01] border border-dashed border-white/5">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 uppercase">Nenhum meio de pagamento registado</p>
                        </div>
                    )}
                </div>

                {/* Addition Form Widget */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {isAdding ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-10 rounded-[48px] bg-[#0A0A0F] border border-brand-gold/20 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[80px] rounded-full" />
                                <h3 className="text-2xl font-light text-white italic mb-10 relative z-10">Adicionar Novo Método</h3>
                                
                                <form onSubmit={handleAddCard} className="space-y-8 relative z-10">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 px-2 font-sans">Número do Cartão</label>
                                        <input
                                            className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-lg font-light tracking-widest focus:outline-none focus:border-brand-gold focus:bg-brand-gold/5 transition-all"
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
                                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 px-2 font-sans">Expiração</label>
                                            <input
                                                className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-center font-light focus:outline-none focus:border-brand-gold transition-all"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={newCard.expiry}
                                                onChange={e => {
                                                    const v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2");
                                                    setNewCard({ ...newCard, expiry: v });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 px-2 font-sans">CVC</label>
                                            <input
                                                className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-center font-light focus:outline-none focus:border-brand-gold transition-all"
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
                                            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={!newCard.number || !newCard.expiry || !newCard.cvv}
                                            className="flex-1 h-16 bg-brand-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-white transition-all shadow-xl disabled:opacity-30"
                                        >
                                            Guardar Método
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="p-10 rounded-[48px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 space-y-8">
                                <div className="w-16 h-16 rounded-3xl bg-brand-gold/10 flex items-center justify-center group overflow-hidden relative">
                                    <Building2 className="w-8 h-8 text-brand-gold relative z-10" />
                                    <div className="absolute inset-0 bg-brand-gold/20 scale-0 group-hover:scale-150 transition-transform duration-1000" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-light text-white italic mb-4">Conta Corporativa</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed font-sans">
                                        Necessita de faturação empresarial e gestão de múltiplos passageiros? Eleve a sua conta para o estatuto Corporate.
                                    </p>
                                </div>
                                <button className="w-full py-5 rounded-2xl border border-brand-gold text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-gold hover:text-black transition-all">
                                    Solicitar Updgrade <Zap className="w-3 h-3 inline-block ml-2 mb-1" />
                                </button>
                            </div>
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
