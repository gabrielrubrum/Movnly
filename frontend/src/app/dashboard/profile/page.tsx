"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, ShieldCheck, ChevronRight, Activity, Globe, Car, Bell, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-luxury-reveal pb-10">
      
      {/* Cabeçalho */}
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
        
        {/* Left Column: Profile Card & Security */}
        <div className="space-y-8">
          {/* Profile Card */}
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
                  <p className="text-3xl font-light text-white tracking-tight">12</p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Viagens</p>
                </div>
                <div className="text-center space-y-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-3xl font-light text-brand-gold tracking-tight">4.9<span className="text-lg">★</span></p>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Avaliação</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Box */}
          <div className="p-8 rounded-[32px] bg-[#07070A] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none" />
            
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] px-2 flex items-center gap-3 relative z-10">
              <ShieldCheck className="w-4 h-4 text-brand-gold" /> Segurança da Conta
            </h4>
            <div className="space-y-4 relative z-10">
              <button className="w-full p-5 rounded-[20px] bg-[#0A0A0C] border border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group shadow-inner">
                Alterar Senha <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-brand-gold" />
              </button>
              <button className="w-full p-5 rounded-[20px] bg-[#0A0A0C] border border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group shadow-inner">
                Autenticação 2FA <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-brand-gold" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Preferences Form */}
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
              <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] px-2 flex items-center gap-3 mb-8">
                  <Car className="w-3 h-3" /> Preferências de Viagem
              </h4>
              <div className="grid md:grid-cols-2 gap-8">
                <ProfileOption icon={Car} label="Categoria Padrão" value="Vip / Executive" />
                <ProfileOption icon={Bell} label="Notificações" value="SMS & Push" />
                <ProfileOption icon={Activity} label="Silêncio a Bordo" value="Ativado" />
                <ProfileOption icon={Lock} label="PIN de Segurança" value="••••" />
              </div>
            </section>

          </div>

          {/* Danger Zone */}
          <div className="p-8 md:p-10 rounded-[32px] bg-red-500/[0.02] border border-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 group overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-red-500/[0.05] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000" />
            <div className="relative z-10">
              <h4 className="text-xl font-bold text-white tracking-wide mb-2">Encerrar Conta</h4>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">Exclusão definitiva de registros e faturas NexRice.</p>
            </div>
            <button className="px-8 py-4 rounded-[16px] bg-[#07070A] border border-red-500/20 text-red-500/60 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all relative z-10 shadow-lg">
              Encerrar Agora
            </button>
          </div>
        </div>

      </div>

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

function ProfileOption({ icon: Icon, label, value }: any) {
  return (
    <div className="p-6 rounded-[24px] bg-[#0A0A0C] border border-white/5 flex items-center justify-between group hover:border-brand-gold/30 hover:bg-white/[0.03] transition-all duration-300 shadow-inner">
       <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-brand-gold group-hover:border-brand-gold/20 transition-colors">
             <Icon className="w-5 h-5" />
          </div>
          <div>
             <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">{label}</p>
             <p className="text-sm font-light text-white tracking-wide">{value}</p>
          </div>
       </div>
       <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-brand-gold transition-colors" />
    </div>
  );
}
