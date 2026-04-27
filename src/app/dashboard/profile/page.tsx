"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, ShieldCheck, ChevronRight, Activity, Globe, Car, Bell } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-luxury-reveal">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full w-max">
            <User className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em]">Status de Membro</span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight leading-none">
            Perfil de <span className="text-brand-gold ml-3">Membro</span>
          </h1>
          <p className="text-white/30 text-lg font-light italic">Gerencie suas credenciais e preferências de serviço executivo.</p>
        </div>
        <button 
          onClick={() => setEditing(!editing)}
          className="h-14 px-8 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white hover:text-black transition-all flex items-center gap-4 group"
        >
          {editing ? "Guardar Alterações" : "Editar Credenciais"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12">
        
        {/* Profile Card & Avatar */}
        <div className="space-y-8">
          <div className="p-10 rounded-[48px] bg-[#0A0A0F] border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="w-32 h-32 rounded-[40px] bg-brand-gold flex items-center justify-center text-black font-black text-4xl mx-auto mb-8 shadow-[0_20px_60px_-10px_rgba(212,175,55,0.4)] relative z-10">
              {user.name.substring(0, 1).toUpperCase()}
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-light text-white italic tracking-tight">{user.name}</h3>
              <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mt-2 italic">Membro Platinum</p>
              
              <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-left space-y-1">
                  <p className="text-2xl font-light text-white italic tracking-tighter">12</p>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Viagens</p>
                </div>
                <div className="text-left space-y-1">
                  <p className="text-2xl font-light text-white italic tracking-tighter">4.9★</p>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Avaliação</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-2 flex items-center gap-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Segurança da Conta
            </h4>
            <div className="space-y-4">
              <button className="w-full p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-brand-gold/30 transition-all group">
                Alterar Palavra-passe <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-brand-gold" />
              </button>
              <button className="w-full p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-brand-gold/30 transition-all group">
                Autenticação de 2 Fatores <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-brand-gold" />
              </button>
            </div>
          </div>
        </div>

        {/* Details & Preferences Form */}
        <div className="space-y-10">
          <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 space-y-12">
            
            <section className="space-y-8">
              <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.5em] px-2">Informação Pessoal</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <ProfileInput icon={User} label="Nome Completo" value={user.name} editing={editing} />
                <ProfileInput icon={Mail} label="Endereço de E-mail" value={user.email} editing={editing} />
                <ProfileInput icon={Phone} label="Contacto Móvel" value="+351 912 000 000" editing={editing} />
                <ProfileInput icon={Globe} label="Idioma de Preferência" value="Português (PT)" editing={editing} />
              </div>
            </section>

            <section className="space-y-8 pt-10 border-t border-white/5">
              <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.5em] px-2">Preferências de Viagem</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <ProfileOption icon={Car} label="Categoria Padrão" value="Vip / Executive" />
                <ProfileOption icon={Bell} label="Notificações" value="SMS & Push" />
                <ProfileOption icon={Activity} label="Silêncio a Bordo" value="Ativado" />
                <ProfileOption icon={Lock} label="PIN de Segurança" value="••••" />
              </div>
            </section>

          </div>

          <div className="p-10 rounded-[48px] bg-red-500/[0.01] border border-red-500/10 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute inset-0 bg-red-500/[0.02] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000" />
            <div className="relative z-10">
              <h4 className="text-xl font-light text-white italic mb-2">Gestão de Conta</h4>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest font-sans">Encerramento definitivo e eliminação de registos NexRice.</p>
            </div>
            <button className="px-8 py-4 rounded-xl border border-red-500/20 text-red-500/40 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all relative z-10">
              Encerrar Conta
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

function ProfileInput({ icon: Icon, label, value, editing }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 px-4 font-sans flex items-center gap-2">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <div className={`h-16 w-full rounded-2xl border transition-all flex items-center px-6 ${
        editing ? "bg-white/5 border-brand-gold/40 text-white" : "bg-white/[0.01] border-white/5 text-white/40"
      }`}>
        {editing ? (
          <input className="bg-transparent border-none outline-none w-full text-sm font-light italic" defaultValue={value} />
        ) : (
          <span className="text-sm font-light italic">{value}</span>
        )}
      </div>
    </div>
  );
}

function ProfileOption({ icon: Icon, label, value }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-brand-gold/20 transition-all">
       <div className="flex items-center gap-5">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-gold transition-colors">
             <Icon className="w-4 h-4" />
          </div>
          <div>
             <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1">{label}</p>
             <p className="text-xs font-light text-white italic">{value}</p>
          </div>
       </div>
       <ChevronRight className="w-4 h-4 text-white/5 group-hover:text-brand-gold" />
    </div>
  );
}
