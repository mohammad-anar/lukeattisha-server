import { Client } from 'pg';
const client = new Client({
  user: 'postgres',
  password: '123456',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});
async function recreateDB() {
  await client.connect();
  try {
    await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'mydb' AND pid <> pg_backend_pid();`);
    await client.query('DROP DATABASE IF EXISTS mydb;');
    console.log("Database dropped");
    await client.query('CREATE DATABASE mydb;');
    console.log("Database created");
  } catch(e) { console.error(e.message) }
  await client.end();
}
recreateDB();
