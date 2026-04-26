const fs = require('fs');
const path = require('path');
let c = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), 'utf8');

const oldBookings = `          <div className="p-4 space-y-2">
            {bookings.slice(0, 7).map((b) => (
              <Link key={b.id} href={\`/admin/bookings/\${b.id}\`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.04] hover:border-brand-gold/20 hover:bg-white/[0.03] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)", border: "1px solid rgba(212,175,55,0.15)" }}>
                  <span className="text-[8px] font-black text-brand-gold/70 group-hover:text-brand-gold transition-colors leading-none text-center">{b.reference}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                    {b.origin.split(",")[0]} <span className="text-white/20 mx-1">→</span> {b.destination.split(",")[0]}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-white/30">{b.passenger.name}</span>
                    <span className="text-white/10">·</span>
                    <span className="text-[9px] text-white/20">{b.pickupDate}</span>
                    <span className="text-white/10">·</span>
                    <span className="text-[9px] font-black text-brand-gold/50 uppercase">{b.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{formatCurrency(b.totalPrice)}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
              </Link>
            ))}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3">
                <Activity className="w-10 h-10 text-white/5" />
                <p className="text-white/15 text-sm italic">Sem reservas ainda.</p>
              </div>
            )}
          </div>`;

const newBookings = `          <div className="divide-y divide-white/[0.04]">
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

if (c.includes(oldBookings)) {
  c = c.replace(oldBookings, newBookings);
  console.log('Bookings section replaced');
} else {
  console.log('Pattern not found, trying partial match...');
  const idx = c.indexOf('p-4 space-y-2');
  console.log('p-4 space-y-2 at:', idx);
}

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), c, 'utf8');
console.log('Done, length:', c.length);
