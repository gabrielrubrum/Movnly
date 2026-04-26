const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
c = c.replace('ease: [0.16, 1, 0.3, 1]', 'ease: "easeOut"');
fs.writeFileSync('src/app/admin/page.tsx', c, 'utf8');
console.log('fixed');
