"use client";

import { useState } from "react";
import { X, Lock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success("Senha alterada com sucesso!");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao alterar a senha.");
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
          className="relative w-full max-w-md bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">Alterar Senha</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-[0.2em]">Segurança da Conta</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2">
                <Lock className="w-4 h-4" /> Senha Atual
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-gold outline-none transition-all"
                placeholder="Introduza a sua senha atual"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2">
                <KeyRound className="w-4 h-4" /> Nova Senha
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-gold outline-none transition-all"
                placeholder="Mínimo de 8 caracteres"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2">
                <KeyRound className="w-4 h-4" /> Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-gold outline-none transition-all"
                placeholder="Repita a nova senha"
              />
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? "A Guardar..." : "Atualizar Senha"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
