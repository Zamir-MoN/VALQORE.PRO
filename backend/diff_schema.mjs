import fs from 'fs';
import pg from 'pg';
import 'dotenv/config';

async function run() {
  const schemaFile = fs.readFileSync('prisma/schema.prisma', 'utf-8');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  // parse models from schema
  const models = {};
  let currentModel = null;
  for (const line of schemaFile.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('model ')) {
      currentModel = trimmed.split(' ')[1];
      models[currentModel] = [];
    } else if (trimmed === '}') {
      currentModel = null;
    } else if (currentModel && trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@')) {
      const parts = trimmed.split(/\s+/);
      const colName = parts[0];
      const typeStr = parts[1];
      if (colName && typeStr && !['User', 'Game', 'Order', 'Transaction', 'Coupon', 'CreatorApplication', 'CartItem', 'WishlistItem', 'GameReaction', 'OrderItem'].includes(typeStr.replace('?', '').replace('[]', ''))) {
        models[currentModel].push(colName);
      }
    }
  }

  const res = await pool.query(`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`);
  const dbModels = {};
  for (const row of res.rows) {
    if (!dbModels[row.table_name]) dbModels[row.table_name] = [];
    dbModels[row.table_name].push(row.column_name);
  }

  for (const [model, cols] of Object.entries(models)) {
    if (!dbModels[model]) {
      console.log(`Missing table: ${model}`);
      continue;
    }
    const dbCols = dbModels[model];
    for (const col of cols) {
      if (!dbCols.includes(col)) {
        console.log(`Missing column in ${model}: ${col}`);
      }
    }
    for (const dbCol of dbCols) {
      if (!cols.includes(dbCol)) {
        console.log(`Extra column in ${model}: ${dbCol}`);
      }
    }
  }
  
  await pool.end();
}
run();
