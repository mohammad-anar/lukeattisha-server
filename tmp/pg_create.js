import { Client } from 'pg';
const client = new Client({
  user: 'postgres',
  password: '123456',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});
async function createDB() {
  await client.connect();
  try {
    await client.query('CREATE DATABASE mydb');
    console.log("Database created");
  } catch(e) { console.error(e.message) }
  await client.end();
}
createDB();
