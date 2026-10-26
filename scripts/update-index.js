// Builds public/index.html from the page template and the bundled script:
//   node scripts/update-index.js <template> <bundle> <output>
// public/index.html is generated and must not be edited by hand (PRs that
// touch it are rejected); edit the template instead.
const fs = require('fs');

const [templatePath, minifiedCodePath, outputPath] = process.argv.slice(2);
if (!templatePath || !minifiedCodePath || !outputPath) {
  console.error('Usage: node scripts/update-index.js <template> <bundle> <output>');
  process.exit(1);
}

const PLACEHOLDER = '"__INSTAGRAM_SCRIPT__"';

const template = fs.readFileSync(templatePath, 'utf8');
if (template.split(PLACEHOLDER).length !== 2) {
  console.error(`${templatePath} must contain ${PLACEHOLDER} exactly once.`);
  process.exit(1);
}

const minifiedCode = fs.readFileSync(minifiedCodePath, 'utf8').trim();

// JSON.stringify escapes quotes, backslashes and control characters. "<"
// is escaped too, so a "</script>" inside the bundle can't end the
// page's <script> tag, along with the two line separators JSON allows but
// older JavaScript engines don't.
const literal = JSON.stringify(minifiedCode)
  .replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

// A function replacer, so "$" sequences in the bundle are kept as they are.
fs.writeFileSync(outputPath, template.replace(PLACEHOLDER, () => literal));
console.log(`Wrote ${outputPath} (${Math.round(literal.length / 1024)} KB of script).`);
