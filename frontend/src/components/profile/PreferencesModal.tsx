"use client";

import { useState } from "react";
import { X, Check, Bell, VolumeX, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreferences: {
    defaultCategory: string;
    notificationsPref: string;
    silentRide: boolean;
  };
  onSuccess: () => void;
}

export function PreferencesModal({ isOpen, onClose, currentPreferences, onSuccess }: PreferencesModalProps) {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    defaultCategory: currentPreferences?.defaultCategory || "smart",
    notificationsPref: currentPreferences?.notificationsPref || "email",
    silentRide: currentPreferences?.silentRide || false,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/preferences', prefs);
      toast.success("Preferências atualizadas com sucesso!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Erro ao atualizar preferências.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">Preferências</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-[0.2em]">Personalize a sua viagem</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Categoria */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-4">
                <Car className="w-4 h-4" /> Categoria Padrão
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['smart', 'comfort', 'group', 'executive'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPrefs({ ...prefs, defaultCategory: cat })}
                    className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all ${
                      prefs.defaultCategory === cat 
                        ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificações */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-4">
                <Bell className="w-4 h-4" /> Notificações
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['email', 'sms'].map(type => (
                  <button
                    key={type}
                    onClick={() => setPrefs({ ...prefs, notificationsPref: type })}
                    className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all ${
                      prefs.notificationsPref === type 
                        ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Silêncio */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-4">
                <VolumeX className="w-4 h-4" /> Silêncio a Bordo
              </label>
              <button
                onClick={() => setPrefs({ ...prefs, silentRide: !prefs.silentRide })}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  prefs.silentRide 
                    ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold' 
                    : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">
                  {prefs.silentRide ? 'Ativado' : 'Desativado'}
                </span>
                {prefs.silentRide && <Check className="w-4 h-4" />}
              </button>
              <p className="text-[10px] text-white/30 mt-2 ml-1">Se ativado, o motorista fará a viagem em silêncio.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
            >
              {loading ? "A Guardar..." : "Guardar Opções"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
