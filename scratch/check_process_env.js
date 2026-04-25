import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), ".env") });

const pass = process.env.EMAIL_PASS;
if (pass) {
  console.log(`'${pass}'`);
  console.log([...pass].map(c => c.charCodeAt(0).toString(16)).join(' '));
} else {
  console.log('EMAIL_PASS not found in process.env');
}
