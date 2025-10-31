import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import snowflake from 'snowflake-sdk';

// -------------------- Supabase --------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// -------------------- Snowflake --------------------
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
      console.log('✅ Connected to Snowflake');
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
        if (err) return reject(err);
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

// -------------------- Manual Primary Keys --------------------
const primaryKeys = {
  raw_orders: 'raw_order_id',
  raw_menu: 'id',
  raw_receipt: 'id',
  customers: 'id',
  category: 'id',
  category_sizes: 'id',
  menu_items: 'id',
  menu_item_variants: 'id',
  medium: 'id',
  mop: 'id',
  mop_items: 'id',
  orders: 'id',
  order_items: 'id',
  receipt_totals: 'id',
  packed_meals: 'id',
  packed_meal_items: 'id',
};

// -------------------- Realtime Listener --------------------
async function setupRealtimeSync(tableName) {
  console.log(`🔍 Listening for changes on ${tableName}...`);

  const pk = primaryKeys[tableName] || 'id';

  supabase
    .channel(`realtime:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      async (payload) => {
        const eventType = payload.eventType || payload.type;
        const newRow = payload.new;
        const oldRow = payload.old;

        console.log(`🔔 [${tableName}] Event: ${eventType}`, payload);

        try {
          if (eventType === 'INSERT') {
            const columns = Object.keys(newRow);
            const values = columns.map(c => sqlValue(newRow[c])).join(', ');
            const sql = `INSERT INTO "${tableName.toUpperCase()}" (${columns.join(', ')}) VALUES (${values});`;
            await executeQuery(sql);
            console.log(`🟢 Inserted row into ${tableName}`);
          } else if (eventType === 'UPDATE') {
            const updates = Object.keys(newRow)
              .map(c => `${c} = ${sqlValue(newRow[c])}`)
              .join(', ');
            const sql = `UPDATE "${tableName.toUpperCase()}" SET ${updates} WHERE ${pk} = ${sqlValue(oldRow[pk])};`;
            await executeQuery(sql);
            console.log(`🟡 Updated row #${oldRow[pk]} in ${tableName}`);
          } else if (eventType === 'DELETE') {
            const sql = `DELETE FROM "${tableName.toUpperCase()}" WHERE ${pk} = ${sqlValue(oldRow[pk])};`;
            await executeQuery(sql);
            console.log(`🔴 Deleted row #${oldRow[pk]} from ${tableName}`);
          }
        } catch (err) {
          console.error(`❌ Error syncing ${tableName}:`, err.message);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to realtime updates for ${tableName} (PK: ${pk})`);
      }
    });
}

// -------------------- Main --------------------
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

  console.log('🚀 Realtime sync active');
}

// -------------------- Express Server --------------------
const app = express();

app.get('/', (req, res) => {
  res.send('Supabase → Snowflake Realtime Sync Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  main();
});
