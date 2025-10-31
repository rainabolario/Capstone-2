// supabaseToSnowflake.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import snowflake from 'snowflake-sdk';

// 🧩 Connect to Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ❄️ Connect to Snowflake
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

// Escape values safely for SQL
function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Connect to Snowflake
function connectSnowflake() {
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) return reject(err);
      console.log('✅ Connected to Snowflake.');
      resolve(conn);
    });
  });
}

// Execute any SQL query
function executeQuery(sql) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    });
  });
}

// Ensure Snowflake table exists (creates simple schema)
async function ensureTableExists(tableName, data) {
  if (!data || data.length === 0) return;

  const columns = Object.keys(data[0]);
  const sampleRow = data[0];
  const columnDefs = columns
    .map((col) => {
      const val = sampleRow[col];
      if (typeof val === 'number') return `${col} FLOAT`;
      if (typeof val === 'boolean') return `${col} BOOLEAN`;
      if (val instanceof Date) return `${col} TIMESTAMP`;
      return `${col} STRING`;
    })
    .join(', ');

  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs});`;
  await executeQuery(sql);
  console.log(`🧩 Ensured table exists: ${tableName}`);
}

// 🧠 Fetch all rows from Supabase (no 1k limit)
async function fetchAllFromSupabase(table) {
  const allRows = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allRows.push(...data);
    console.log(`📥 Fetched ${allRows.length}/${count || '?'} rows from ${table}...`);

    if (data.length < batchSize) break;
    from += batchSize;
  }

  return allRows;
}

// Insert rows into Snowflake in batches
async function bulkInsert(tableName, data, batchSize = 500) {
  if (!data || data.length === 0) {
    console.log(`⚠️ No data to insert for ${tableName}`);
    return;
  }

  await ensureTableExists(tableName, data);
  await executeQuery(`TRUNCATE TABLE IF EXISTS ${tableName};`);

  const columns = Object.keys(data[0]);
  console.log(`🧱 Inserting ${data.length} rows into ${tableName} in batches of ${batchSize}...`);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map((row) => `(${columns.map((c) => sqlValue(row[c])).join(', ')})`)
      .join(',\n');

    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values};`;
    await executeQuery(sql);
  }

  console.log(`✅ Finished inserting ${data.length} rows into ${tableName}.`);
}

// Table sync order
const tablesOrder = [
  'raw_orders',
  'raw_menu',
  'raw_receipt',
  'customers',
  'category',
  'category_sizes',
  'menu_items',
  'menu_item_variants',
  'medium',
  'mop',
  'mop_items',
  'orders',
  'order_items',
  'receipt_totals',
  'packed_meals',
  'packed_meal_items',
];

// Main sync
async function syncAllSupabaseToSnowflake() {
  try {
    await connectSnowflake();
    console.log(`📦 Syncing ${tablesOrder.length} tables...`);

    for (const table of tablesOrder) {
      console.log(`\n📥 Fetching data from Supabase: ${table}`);
      const data = await fetchAllFromSupabase(table);
      await bulkInsert(table, data);
    }

    console.log('\n✅ All Supabase tables successfully mirrored to Snowflake.');
  } catch (err) {
    console.error('❌ Error during sync:', err);
  } finally {
    connection.destroy();
  }
}

// 🚀 Run
syncAllSupabaseToSnowflake();
