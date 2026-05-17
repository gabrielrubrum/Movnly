"use client";

import { useState, useEffect } from "react";
import { LogOut, Settings, ShieldCheck, CreditCard, Clock, Star, Car, Bell, KeyRound, ChevronRight, VolumeX, Lock, User, Mail, Phone, Globe } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useBookings } from "@/hooks/useBookings";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PasswordModal } from "@/components/profile/PasswordModal";
import { TwoFactorModal } from "@/components/profile/TwoFactorModal";
import { PreferencesModal } from "@/components/profile/PreferencesModal";
import api from "@/lib/api";

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const { bookings, completed } = useBookings();
  const [editing, setEditing] = useState(false);
  const is2faEnabled = !!user?.isTwoFactorEnabled;
  const [preferences, setPreferences] = useState({
      defaultCategory: "smart",
      notificationsPref: "email",
      silentRide: false,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2faModal, setShow2faModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const totalTrips = bookings.length;
  const avgRating = completed.filter((b) => b.rating).length > 0
    ? completed.filter((b) => b.rating).reduce((s, b) => s + (b.rating || 0), 0) / completed.filter((b) => b.rating).length
    : 0;

  // Fetch user preferences on mount
  useEffect(() => {
      if (!user) return;
      const fetchPreferences = async () => {
          try {
              const res = await api.get('/auth/me');
              if (res.data?.defaultCategory) {
                  setPreferences({
                      defaultCategory: res.data.defaultCategory,
                      notificationsPref: res.data.notificationsPref,
                      silentRide: res.data.silentRide,
                  });
              }
          } catch (err) {
              console.log("No preferences found, using defaults");
          }
      };
      fetchPreferences();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-luxury-reveal pb-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10 relative">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-3 flex items-center gap-2">
            <Settings className="w-3 h-3" /> Configurações de Perfil
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            Minha <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-[#a6862c]">Conta</span>
          </h1>
          <p className="text-white/40 text-sm font-light italic mt-4 tracking-wide">
            Gerencie suas credenciais e preferências.
          </p>
        </div>
        <button 
          onClick={() => setEditing(!editing)}
          className={cn(
              "h-14 px-8 text-[11px] font-black uppercase tracking-[0.2em] rounded-[20px] transition-all flex items-center justify-center gap-3 relative z-10 shadow-lg",
              editing 
                ? "bg-gradient-to-br from-brand-gold to-[#a6862c] text-black shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95"
                : "bg-[#07070A] border border-brand-gold/30 text-brand-gold hover:bg-gradient-to-r hover:from-brand-gold hover:to-[#a6862c] hover:text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          )}
        >
          {editing ? "Salvar Alterações" : "Editar Credenciais"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12">
        
        <div className="space-y-8">
          <div className="p-10 rounded-[32px] bg-[#07070A] border border-white/5 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-gold/5 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="w-32 h-32 rounded-[28px] bg-gradient-to-br from-brand-gold to-[#a6862c] flex items-center justify-center text-black font-black text-5xl mx-auto mb-8 shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)] relative z-10 border border-brand-gold/50">
              {user.name.substring(0, 1).toUpperCase()}
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white tracking-wide">{user.name}</h3>
              <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mt-3">Membro Ativo</p>
              
              <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center space-y-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-3xl font-light text-white tracking-tight">{totalTrips}</p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Viagens</p>
                </div>
                <div className="text-center space-y-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-3xl font-light text-brand-gold tracking-tight">{avgRating ? avgRating.toFixed(1) : "—"}<span className="text-lg">★</span></p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Avaliação</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0F]/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
            
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-brand-gold mb-8 relative z-10">
                <ShieldCheck className="w-5 h-5" /> Segurança da Conta
            </h2>

            <div className="space-y-4 relative z-10">
                <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group/btn">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover/btn:text-brand-gold group-hover/btn:scale-110 transition-all">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/80 group-hover/btn:text-white transition-colors">Alterar Senha</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:text-brand-gold transition-colors group-hover/btn:translate-x-1" />
                </button>

                <button onClick={() => setShow2faModal(true)} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group/btn">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover/btn:text-brand-gold group-hover/btn:scale-110 transition-all">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/80 group-hover/btn:text-white transition-colors block">Autenticação 2FA</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 block ${is2faEnabled ? "text-brand-gold" : "text-white/30"}`}>
                                {is2faEnabled ? "Ativado" : "Desativado"}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:text-brand-gold transition-colors group-hover/btn:translate-x-1" />
                </button>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="p-8 md:p-12 rounded-[40px] bg-[#07070A] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
            
            <section className="space-y-8 relative z-10">
              <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] px-2 flex items-center gap-3 mb-8">
                  <User className="w-3 h-3" /> Informações Pessoais
              </h4>
              <div className="grid md:grid-cols-2 gap-8">
                <ProfileInput icon={User} label="Nome Completo" value={user.name} editing={editing} />
                <ProfileInput icon={Mail} label="E-mail" value={user.email} editing={editing} />
                <ProfileInput icon={Phone} label="Celular" value="+351 912 000 000" editing={editing} />
                <ProfileInput icon={Globe} label="Idioma" value="Português (PT)" editing={editing} />
              </div>
            </section>

            <section className="space-y-8 pt-12 mt-12 border-t border-white/5 relative z-10">
                <div className="bg-[#0A0A0F]/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-brand-gold">
                            <Car className="w-5 h-5" /> Preferências de Viagem
                        </h2>
                        <button onClick={() => setShowPreferencesModal(true)} className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-brand-gold transition-colors">
                            Editar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/pref hover:bg-white/[0.04] transition-all">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Categoria Padrão</span>
                                <span className="text-sm font-medium text-white">{preferences.defaultCategory.toUpperCase()}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/10 group-hover/pref:text-brand-gold transition-all group-hover/pref:translate-x-1" />
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/pref hover:bg-white/[0.04] transition-all">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Notificações</span>
                                <span className="text-sm font-medium text-white">{preferences.notificationsPref.toUpperCase()}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/10 group-hover/pref:text-brand-gold transition-all group-hover/pref:translate-x-1" />
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/pref hover:bg-white/[0.04] transition-all">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">Silêncio a Bordo</span>
                                <span className="text-sm font-medium text-white">{preferences.silentRide ? "Ativado" : "Desativado"}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/10 group-hover/pref:text-brand-gold transition-all group-hover/pref:translate-x-1" />
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/pref hover:bg-white/[0.04] transition-all">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 block mb-1">PIN de Segurança</span>
                                <span className="text-sm font-medium text-white tracking-[0.2em]">Dinâmico</span>
                            </div>
                            <ShieldCheck className="w-4 h-4 text-brand-gold/50" />
                        </div>
                    </div>
                </div>
            </section>
          </div>

          <div className="p-8 md:p-10 rounded-[32px] bg-red-500/[0.02] border border-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 group overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-red-500/[0.05] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000" />
            <div className="relative z-10">
              <h4 className="text-xl font-bold text-white tracking-wide mb-2">Encerrar Conta</h4>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">Exclusão definitiva de registros e faturas MOVNLY.</p>
            </div>
            <button className="px-8 py-4 rounded-[16px] bg-[#07070A] border border-red-500/20 text-red-500/60 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all relative z-10 shadow-lg">
              Encerrar Agora
            </button>
          </div>
        </div>
      </div>

      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <TwoFactorModal isOpen={show2faModal} onClose={() => setShow2faModal(false)} isTwoFactorEnabled={is2faEnabled} onSuccess={() => window.location.reload()} />
      <PreferencesModal isOpen={showPreferencesModal} onClose={() => setShowPreferencesModal(false)} currentPreferences={preferences} onSuccess={() => window.location.reload()} />
    </div>
  );
}

function ProfileInput({ icon: Icon, label, value, editing }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 px-2 font-sans flex items-center gap-2">
        {label}
      </label>
      <div className={cn(
          "h-16 w-full rounded-[20px] transition-all flex items-center px-6 relative overflow-hidden",
          editing ? "bg-[#0A0A0C] border border-brand-gold/40 text-white shadow-inner" : "bg-white/[0.02] border border-white/5 text-white/60"
      )}>
        {editing ? (
          <input className="bg-transparent border-none outline-none w-full text-sm font-light tracking-wide relative z-10" defaultValue={value} />
        ) : (
          <span className="text-sm font-light tracking-wide">{value}</span>
        )}
      </div>
    </div>
  );
}
