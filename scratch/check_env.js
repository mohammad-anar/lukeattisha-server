import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
const passLine = lines.find(line => line.startsWith('EMAIL_PASS='));
if (passLine) {
  console.log(`'${passLine}'`);
  console.log([...passLine].map(c => c.charCodeAt(0).toString(16)).join(' '));
} else {
  console.log('EMAIL_PASS not found');
}
