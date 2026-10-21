import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  try {
    const colsRes = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);
    
    const tables = {};
    for (const row of colsRes.rows) {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push({
        col: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable,
        def: row.column_default
      });
    }

    const idxRes = await pool.query(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    
    const indexes = {};
    for (const row of idxRes.rows) {
      if (!indexes[row.tablename]) indexes[row.tablename] = [];
      indexes[row.tablename].push(row.indexname);
    }
    
    console.log(JSON.stringify({ tables, indexes }, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
inspect();
