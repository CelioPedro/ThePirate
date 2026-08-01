const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_RsHtO4yeNVQ3@ep-restless-thunder-apaw57jb-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("DELETE FROM flyway_schema_history WHERE version = '18'");
    console.log(`Deleted ${res.rowCount} row(s) from flyway_schema_history.`);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

run();
