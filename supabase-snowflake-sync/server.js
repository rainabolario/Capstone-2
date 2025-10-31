import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import snowflake from 'snowflake-sdk';

// 🧩 Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🧊 Connect to Snowflake
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

// Connect Snowflake
function connectSnowflake() {
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) return reject(err);
      console.log('✅ Connected to Snowflake (Realtime Listener Ready)');
      resolve(conn);
    });
  });
}

// Execute SQL safely
function executeQuery(sql) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('❌ Snowflake SQL Error:', err.message);
          return reject(err);
        }
        resolve(rows);
      },
    });
  });
}

// Escape SQL values safely
function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// 🎧 Setup realtime listener for a table
async function setupRealtimeSync(tableName) {
  console.log(`🔍 Listening for changes on ${tableName}...`);

  supabase
    .channel(`realtime:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        try {
          if (eventType === 'INSERT') {
            const columns = Object.keys(newRow);
            const values = columns.map((c) => sqlValue(newRow[c])).join(', ');
            const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});`;
            await executeQuery(sql);
            console.log(`🟢 Inserted new row into ${tableName}`);
          } else if (eventType === 'UPDATE') {
            const updates = Object.keys(newRow)
              .map((col) => `${col} = ${sqlValue(newRow[col])}`)
              .join(', ');
            const sql = `UPDATE ${tableName} SET ${updates} WHERE id = ${oldRow.id};`;
            await executeQuery(sql);
            console.log(`🟡 Updated row #${oldRow.id} in ${tableName}`);
          } else if (eventType === 'DELETE') {
            const sql = `DELETE FROM ${tableName} WHERE id = ${oldRow.id};`;
            await executeQuery(sql);
            console.log(`🔴 Deleted row #${oldRow.id} from ${tableName}`);
          }
        } catch (err) {
          console.error(`❌ Error syncing ${tableName}:`, err.message);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to realtime updates for ${tableName}`);
      }
    });
}

// 🏁 Main startup
async function main() {
  await connectSnowflake();

  const tables = [
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

  for (const table of tables) {
    setupRealtimeSync(table);
  }

  console.log('🚀 Realtime sync active. Listening for Supabase changes...');
}

// --- Express server just to bind a port ---
const app = express();
app.get('/', (req, res) => res.send('Supabase → Snowflake Realtime Sync Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server bound to port ${PORT} (required for web service deployment)`);
  // Start main realtime sync after server is up
  main();
});
