"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface EarningsChartProps {
  data: { day: string; amount: number }[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  const maxAmount = Math.max(...data.map(d => d.amount), 100);
  
  return (
    <div className="h-64 w-full flex items-end gap-3 px-2">
      {data.map((d, i) => {
        const height = (d.amount / maxAmount) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
            <div className="relative w-full flex justify-center">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  {formatCurrency(d.amount)}
                </div>
                <div className="w-2 h-2 bg-white rotate-45 mx-auto -mt-1" />
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[40px] bg-brand-gold/10 border-t border-brand-gold/40 group-hover:bg-brand-gold group-hover:border-brand-gold transition-all duration-500 rounded-t-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
              </motion.div>
            </div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest group-hover:text-brand-gold transition-all">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}
