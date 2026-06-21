"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { EXTRAS } from "@/lib/constants";
import { type BookingFormData } from "../BookingSteps";
import { ArrowLeft, ChevronRight, Plus, Check, Sparkles, Star, Package } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Categorize extras into 4 groups with new extras
const RECOMMENDED_IDS = ["meet_greet", "name_board", "water"];
const PREMIUM_IDS      = ["wifi", "extra_stop", "extra_wait", "return_transfer", "private_tour", "multilingual_driver"];
const CONVENIENCE_IDS  = ["baby_seat", "booster"];

const EXTRA_ICONS: Record<string, string> = {
  meet_greet: "🤝",
  name_board: "🪧",
  water: "💧",
  wifi: "📶",
  extra_stop: "📍",
  extra_wait: "⏱️",
  baby_seat: "👶",
  booster: "🪑",
  return_transfer: "🔄",
  private_tour: "🗺️",
  multilingual_driver: "🌍",
};

const getExtraPriceLabel = (price: number) => (price === 0 ? "Já incluído" : `+${formatCurrency(price)}`);

function ExtraCard({ extra, selected, onToggle }: { extra: typeof EXTRAS[0]; selected: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  const descKey = `bookingFlow.extrasDesc.${extra.id}`;
  const descText = t(descKey);
  const hasDesc = descText !== descKey && descText !== "";

  return (
    <motion.button
      layout
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "w-full p-6 text-left flex items-center gap-5 transition-all duration-500 rounded-[28px] border group",
        selected
          ? "bg-brand-gold/[0.04] border-brand-gold/30 shadow-[0_0_40px_-15px_rgba(212,175,55,0.25)]"
          : "bg-white/[0.02] border-white/[0.05] hover:border-brand-gold/20 hover:bg-white/[0.03]"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl transition-all duration-500",
        selected
          ? "bg-brand-gold shadow-[0_8px_24px_rgba(212,175,55,0.3)]"
          : "bg-white/[0.05] group-hover:bg-white/[0.08]"
      )}>
        {EXTRA_ICONS[extra.id] || "✨"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[11px] font-black uppercase tracking-[0.2em] font-sans transition-colors", selected ? "text-white" : "text-white/70 group-hover:text-white")}>
          {t(`bookingFlow.extras.${extra.id}`)}
        </p>
        {hasDesc && (
          <p className="text-[9px] tracking-[0.05em] text-white/30 mt-1.5 font-sans group-hover:text-white/45 transition-colors leading-relaxed">
            {descText}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={cn(
          "font-black font-sans tracking-tighter",
          extra.price === 0 ? "text-sm text-emerald-400/80 uppercase tracking-widest" : "text-xl text-brand-gold"
        )}>
          {getExtraPriceLabel(extra.price)}
        </span>
        <div className={cn(
          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-400",
          selected ? "border-brand-gold bg-brand-gold" : "border-white/15 group-hover:border-white/30"
        )}>
          {selected
            ? <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
            : <Plus className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70" />
          }
        </div>
      </div>
    </motion.button>
  );
}

function CategorySection({ title, icon, extras, selectedIds, onToggle }: {
  title: string; icon: React.ReactNode; extras: typeof EXTRAS;
  selectedIds: string[]; onToggle: (id: string) => void;
}) {
  if (extras.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40 font-sans">{title}</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {extras.map((extra) => (
          <ExtraCard
            key={extra.id}
            extra={extra}
            selected={selectedIds.includes(extra.id)}
            onToggle={() => onToggle(extra.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function StepExtras({ form, update, onNext, onBack }: Props) {
  const { t } = useI18n();

  const toggle = (id: string) => {
    const extras = form.extras.includes(id)
      ? form.extras.filter((e) => e !== id)
      : [...form.extras, id];
    update({ extras });
  };

  const extrasTotal = form.extras.reduce((sum, id) => {
    const e = EXTRAS.find((x) => x.id === id);
    return sum + (e?.price || 0);
  }, 0);

  const recommended = EXTRAS.filter(e => RECOMMENDED_IDS.includes(e.id));
  const premium     = EXTRAS.filter(e => PREMIUM_IDS.includes(e.id));
  const convenience = EXTRAS.filter(e => CONVENIENCE_IDS.includes(e.id));

  return (
    <div className="animate-luxury-reveal space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <span className="badge-editorial w-fit">Etapa 3 · Opcionais</span>
        <div className="flex items-center gap-6 mt-4">
          <button onClick={onBack} className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all border border-white/[0.05]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans uppercase tracking-tight leading-none">
              {t("bookingFlow.stepExtras.title")}
            </h2>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.25em] mt-2 font-sans">
              Personalize a experiência · Todos os extras são opcionais
            </p>
          </div>
        </div>
      </div>

      {/* Live total */}
      <AnimatePresence>
        {extrasTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-brand-gold/[0.05] border border-brand-gold/20"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                {form.extras.length} opcional{form.extras.length !== 1 ? "is" : ""} adicionado{form.extras.length !== 1 ? "s" : ""}
              </span>
            </div>
            <motion.span
              key={extrasTotal}
              initial={{ scale: 1.2, color: "#D4AF37" }}
              animate={{ scale: 1, color: "#D4AF37" }}
              className="text-xl font-black text-brand-gold tracking-tighter font-sans"
            >
              +{formatCurrency(extrasTotal)}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECOMENDADOS */}
      <CategorySection
        title="Recomendados"
        icon={<Sparkles className="w-4 h-4 text-brand-gold" />}
        extras={recommended}
        selectedIds={form.extras}
        onToggle={toggle}
      />

      {/* PREMIUM */}
      <CategorySection
        title="Premium"
        icon={<Star className="w-4 h-4 text-brand-gold/60" />}
        extras={premium}
        selectedIds={form.extras}
        onToggle={toggle}
      />

      {/* CONVENIÊNCIA */}
      <CategorySection
        title="Conveniência"
        icon={<Package className="w-4 h-4 text-white/30" />}
        extras={convenience}
        selectedIds={form.extras}
        onToggle={toggle}
      />

      {form.extras.length === 0 && (
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/15 pt-4 font-sans">
          Pode continuar sem opcionais
        </p>
      )}

      {/* CTAs */}
      <div className="pt-12 flex flex-col-reverse sm:flex-row gap-5">
        <button
          onClick={onBack}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-5 py-5 border border-white/10 text-white/35 rounded-[36px] hover:bg-white/[0.04] hover:text-white transition-all font-sans"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em]">Voltar</span>
        </button>
        <button
          onClick={onNext}
          className="w-full sm:w-auto flex-[2] flex items-center justify-center gap-6 py-6 sm:py-7 bg-brand-gold text-black rounded-[36px] shadow-[0_20px_60px_-15px_rgba(212,175,55,0.45)] hover:shadow-[0_30px_80px_-15px_rgba(212,175,55,0.6)] hover:scale-[1.01] transition-all group overflow-hidden font-sans relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms]" />
          <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.45em] relative z-10 text-center px-4">
            {extrasTotal > 0 ? `Continuar · +${formatCurrency(extrasTotal)}` : "Continuar sem opcionais"}
          </span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-2 transition-transform relative z-10 shrink-0">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </button>
      </div>
    </div>
  );
}
