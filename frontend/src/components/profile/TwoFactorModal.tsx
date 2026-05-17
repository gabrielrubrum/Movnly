"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTwoFactorEnabled: boolean;
  onSuccess: () => void;
}

export function TwoFactorModal({ isOpen, onClose, isTwoFactorEnabled, onSuccess }: TwoFactorModalProps) {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ otpauthUrl: string; secret: string } | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (isOpen && !isTwoFactorEnabled) {
      loadSetup();
    }
  }, [isOpen]);

  const loadSetup = async () => {
    try {
      const res = await api.post('/auth/2fa/generate');
      setSetupData(res.data);
    } catch (err) {
      toast.error("Erro ao preparar 2FA.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/enable', { token });
      toast.success("Autenticação 2 Fatores ativada com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Código inválido. Tente novamente.");
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
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">Autenticação 2FA</h3>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-[0.2em]">Segurança Máxima</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isTwoFactorEnabled ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-brand-gold/10 border border-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-brand-gold" />
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-widest">Ativo e Seguro</h4>
              <p className="text-sm text-white/40 mt-2">A sua conta já está protegida por Autenticação de 2 Fatores.</p>
              <div className="mt-8">
                <button onClick={onClose} className="px-8 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-white/60">
                1. Instale o Google Authenticator ou Authy no seu telemóvel.<br/>
                2. Leia o QR Code abaixo com a aplicação.
              </p>

              {setupData ? (
                <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto">
                  <QRCodeSVG value={setupData.otpauthUrl} size={150} />
                </div>
              ) : (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2">
                    <QrCode className="w-4 h-4" /> Código da Aplicação
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={token}
                    onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:border-brand-gold outline-none transition-all"
                    placeholder="000000"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || token.length !== 6}
                    className="px-8 py-3 rounded-xl bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
                  >
                    {loading ? "A Validar..." : "Ativar 2FA"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
