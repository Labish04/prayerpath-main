const fs = require('fs');
const content = fs.readFileSync('app/onboarding.tsx', 'utf8');

let openTags = (content.match(/<View/g) || []).length;
let closeTags = (content.match(/<\/View>/g) || []).length;
let selfClosingTags = (content.match(/<View[^>]*\/>/g) || []).length;

console.log(`Open Views: ${openTags}`);
console.log(`Close Views: ${closeTags}`);
console.log(`Self-closing Views: ${selfClosingTags}`);
console.log(`Calculated Balance: ${openTags - closeTags - selfClosingTags}`);
