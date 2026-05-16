const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Find and replace the KPI section using regex
const result = c.replace(
  /(\s*\{\/\* KPIs \*\/\}\s*<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">[\s\S]*?<\/div>\s*\n\s*\{\/\* Main grid)/,
  `
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: "Receita Total", value: formatCurrency(revenue), icon: DollarSign, accent: "gold", trend: "+12%", sub: "todas as viagens" },
          { label: "Lucro MOVNLY", value: formatCurrency(profit), icon: TrendingUp, accent: "emerald", trend: "+8%", sub: "após motoristas" },
          { label: "Viagens Hoje", value: String(today), icon: Activity, accent: "gold", trend: null, sub: "agendadas" },
          { label: "Motoristas", value: String(drivers?.length || 0), icon: Car, accent: "neutral", trend: null, sub: "registados" },
        ] as const).map(({ label, value, icon: Icon, accent, trend, sub }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5 }}
            className="relative rounded-3xl p-6 overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-1"
            style={{
              background: accent === "gold" ? "linear-gradient(145deg, #110E05 0%, #0A0A0F 100%)" : accent === "emerald" ? "linear-gradient(145deg, #051108 0%, #0A0A0F 100%)" : "linear-gradient(145deg, #0D0D12 0%, #0A0A0F 100%)",
              border: accent === "gold" ? "1px solid rgba(212,175,55,0.18)" : accent === "emerald" ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: accent === "gold" ? "0 4px 24px rgba(212,175,55,0.06)" : accent === "emerald" ? "0 4px 24px rgba(52,211,153,0.05)" : "none",
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ background: accent === "gold" ? "#D4AF37" : accent === "emerald" ? "#34D399" : "transparent" }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center",
                  accent === "gold" ? "bg-brand-gold/10 text-brand-gold" :
                  accent === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                {trend && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />{trend}
                  </span>
                )}
              </div>
              <p className={cn("text-3xl font-light tracking-tight leading-none",
                accent === "gold" ? "text-brand-gold" : accent === "emerald" ? "text-emerald-400" : "text-white"
              )}>{value}</p>
              <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mt-2">{label}</p>
              <p className="text-[9px] text-white/20 mt-0.5">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid`
);

if (result !== c) {
  fs.writeFileSync('src/app/admin/page.tsx', result, 'utf8');
  console.log('Updated successfully');
} else {
  console.log('No change made - trying line-by-line approach');
  // Find the KPI grid start and end
  const start = c.indexOf('{/* KPIs */}');
  const end = c.indexOf('{/* Main grid */}');
  if (start > -1 && end > -1) {
    const before = c.substring(0, start);
    const after = c.substring(end);
    const newSection = `{/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: "Receita Total", value: formatCurrency(revenue), icon: DollarSign, accent: "gold", trend: "+12%", sub: "todas as viagens" },
          { label: "Lucro MOVNLY", value: formatCurrency(profit), icon: TrendingUp, accent: "emerald", trend: "+8%", sub: "após motoristas" },
          { label: "Viagens Hoje", value: String(today), icon: Activity, accent: "gold", trend: null, sub: "agendadas" },
          { label: "Motoristas", value: String(drivers?.length || 0), icon: Car, accent: "neutral", trend: null, sub: "registados" },
        ] as const).map(({ label, value, icon: Icon, accent, trend, sub }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5 }}
            className="relative rounded-3xl p-6 overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-1"
            style={{
              background: accent === "gold" ? "linear-gradient(145deg, #110E05 0%, #0A0A0F 100%)" : accent === "emerald" ? "linear-gradient(145deg, #051108 0%, #0A0A0F 100%)" : "linear-gradient(145deg, #0D0D12 0%, #0A0A0F 100%)",
              border: accent === "gold" ? "1px solid rgba(212,175,55,0.18)" : accent === "emerald" ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: accent === "gold" ? "0 4px 24px rgba(212,175,55,0.06)" : accent === "emerald" ? "0 4px 24px rgba(52,211,153,0.05)" : "none",
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ background: accent === "gold" ? "#D4AF37" : accent === "emerald" ? "#34D399" : "transparent" }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center",
                  accent === "gold" ? "bg-brand-gold/10 text-brand-gold" :
                  accent === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                {trend && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />{trend}
                  </span>
                )}
              </div>
              <p className={cn("text-3xl font-light tracking-tight leading-none",
                accent === "gold" ? "text-brand-gold" : accent === "emerald" ? "text-emerald-400" : "text-white"
              )}>{value}</p>
              <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mt-2">{label}</p>
              <p className="text-[9px] text-white/20 mt-0.5">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      `;
    fs.writeFileSync('src/app/admin/page.tsx', before + newSection + after, 'utf8');
    console.log('Updated via section replacement');
  }
}
