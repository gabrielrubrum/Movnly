const fs = require('fs');
const path = require('path');
const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
};
const files = walk('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('NEXRICE')) {
        content = content.replace(/NEXRICE/g, 'MOVNLY');
        changed = true;
    }
    if (content.includes('/logo-mark2.svg')) {
        content = content.replace(/\/logo-mark2\.svg/g, '/logoMov.png');
        changed = true;
    }
    if (content.includes('/logoMov.png')) {
        content = content.replace(/<img[^>]+src="\/logoMov\.png"[^>]*>/g, match => {
            let newMatch = match.replace(/w-\d+\s+h-\d+/g, 'h-10 md:h-12 w-auto');
            newMatch = newMatch.replace(/w-\d+\s+md:w-\d+\s+h-\d+/g, 'h-10 md:h-12 w-auto');
            newMatch = newMatch.replace(/grayscale group-hover:grayscale-0/g, '');
            newMatch = newMatch.replace(/brightness-0 invert/g, '');
            return newMatch;
        });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
