const fs = require('fs');
const path = require('path');
let c = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), 'utf8');

const oldSection = `          <div className="divide-y divide-white/[0.04]">
            {bookings.slice(0, 8).map((b) => (
              <Link key={b.id} href={\`/admin/bookings/\${b.id}\`}
                className="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.025] transition-all group"
              >
                {/* Número da reserva */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.12)" }}>
                  <span className="text-[8px] font-black text-brand-gold/60 group-hover:text-brand-gold transition-colors">{b.reference}</span>
                </div>

                {/* Rota + info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/75 truncate group-hover:text-white transition-colors">
                    {b.origin.split(",")[0]}
                    <span className="text-white/20 mx-2 font-light">→</span>
                    {b.destination.split(",")[0]}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-white/30">{b.passenger.name}</span>
                    <span className="text-white/10 text-[8px]">•</span>
                    <span className="text-[9px] text-white/20">{b.pickupDate}</span>
                    <span className="text-white/10 text-[8px]">•</span>
                    <span className="text-[9px] font-black text-brand-gold/40 uppercase tracking-wider">{b.category}</span>
                  </div>
                </div>

                {/* Preço + status */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors tabular-nums">{formatCurrency(b.totalPrice)}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
              </Link>
            ))}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <Activity className="w-10 h-10 text-white/5" />
                <p className="text-white/15 text-sm italic">Sem reservas ainda.</p>
              </div>
            )}
          </div>`;

const newSection = `          <div className="p-4 space-y-2">
            {bookings.slice(0, 8).map((b) => {
              const statusColor = b.status === 'confirmed' || b.status === 'on_route' ? '#D4AF37' : b.status === 'completed' ? '#34D399' : b.status === 'cancelled' ? '#F87171' : '#6B7280';
              return (
                <Link key={b.id} href={\`/admin/bookings/\${b.id}\`}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {/* Barra de status lateral */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: statusColor, opacity: 0.6 }} />

                  {/* Ref */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
                    style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.12)" }}>
                    <span className="text-[7px] font-black text-brand-gold/60 group-hover:text-brand-gold transition-colors leading-none">{b.reference}</span>
                  </div>

                  {/* Rota */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                      {b.origin.split(",")[0]}
                      <span className="text-white/20 mx-1.5 text-xs">→</span>
                      {b.destination.split(",")[0]}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[9px] text-white/30">{b.passenger.name}</span>
                      <span className="text-white/10">·</span>
                      <span className="text-[9px] text-white/20">{b.pickupDate}</span>
                      <span className="text-white/10">·</span>
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.6)" }}>{b.category}</span>
                    </div>
                  </div>

                  {/* Preço + status */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums" style={{ color: statusColor }}>{formatCurrency(b.totalPrice)}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </Link>
              );
            })}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3">
                <Activity className="w-10 h-10 text-white/5" />
                <p className="text-white/15 text-sm italic">Sem reservas ainda.</p>
              </div>
            )}
          </div>`;

if (c.includes(oldSection)) {
  c = c.replace(oldSection, newSection);
  console.log('Replaced successfully');
} else {
  console.log('Not found, checking...');
  console.log('Has divide-y:', c.includes('divide-y divide-white/[0.04]'));
  console.log('Has slice(0, 8):', c.includes('slice(0, 8)'));
}

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), c, 'utf8');
console.log('Done, length:', c.length);
