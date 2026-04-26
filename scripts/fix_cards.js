const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Make booking rows card-style
c = c.split('className="divide-y divide-white/[0.04]">').join('className="p-3 space-y-2">');

c = c.split('className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.03] transition-all group"').join(
  'className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-brand-gold/20 hover:bg-white/[0.04] transition-all group"'
);

// Driver rows card-style
c = c.split('className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-white/[0.025] transition-all group"').join(
  'className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-brand-gold/20 hover:bg-white/[0.04] transition-all group"'
);

// Also try the divide-y on drivers
c = c.split('className="divide-y divide-white/[0.03]">').join('className="p-3 space-y-2">');

fs.writeFileSync('src/app/admin/page.tsx', c, 'utf8');

// Verify
console.log('divide-y removed:', !c.includes('divide-y divide-white/[0.04]'));
console.log('card style applied:', c.includes('p-3 space-y-2'));
