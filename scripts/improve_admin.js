const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Improve booking rows - make them card-style instead of flat rows
c = c.replace(
  /className="flex items-center gap-4 px-7 py-4 hover:bg-white\/\[0\.025\] transition-all group border-b border-white\/\[0\.03\] last:border-0"/g,
  'className="flex items-center gap-4 px-5 py-4 mx-3 my-1.5 rounded-2xl hover:bg-white/[0.04] border border-white/[0.04] hover:border-brand-gold/15 transition-all group"'
);

// Make booking ref badge bigger and more visible
c = c.replace(
  /className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"/g,
  'className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"'
);

// Make live trip cards more premium
c = c.replace(
  /className="flex items-center gap-3 p-3\.5 rounded-2xl transition-all"/g,
  'className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01]"'
);

// Make driver rows card-style
c = c.replace(
  /className="flex items-center gap-4 px-5 py-4 hover:bg-white\/\[0\.025\] transition-all group"/g,
  'className="flex items-center gap-4 px-4 py-3.5 mx-3 my-1.5 rounded-2xl hover:bg-white/[0.04] border border-white/[0.03] hover:border-brand-gold/15 transition-all group"'
);

// Remove divide-y from drivers since we're using cards now
c = c.replace(
  'className="divide-y divide-white/[0.03]">',
  'className="py-2">'
);

fs.writeFileSync('src/app/admin/page.tsx', c, 'utf8');
console.log('Done, length:', c.length);
