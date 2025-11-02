import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import snowflake from 'snowflake-sdk';
import express from 'express';

// -------------------- Supabase Realtime --------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// -------------------- Snowflake Connection --------------------
const sfConnection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

await new Promise((resolve, reject) => {
  sfConnection.connect((err) => {
    if (err) return reject(err);
    console.log('✅ Connected to Snowflake');
    resolve();
  });
});

// -------------------- Helper Functions --------------------
function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function columnsList(row) {
  return Object.keys(row).map(c => `"${c.toUpperCase()}"`).join(',');
}

function valuesList(row) {
  return Object.values(row).map(sqlValue).join(',');
}

function updatesList(row) {
  return Object.entries(row)
    .map(([c, v]) => `"${c.toUpperCase()}" = ${sqlValue(v)}`)
    .join(',');
}

function executeSnowflake(sql) {
  return new Promise((resolve, reject) => {
    sfConnection.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => (err ? reject(err) : resolve(rows)),
    });
  });
}

// -------------------- Snowflake Table Columns --------------------
const snowflakeColumns = {
  raw_orders: ['RAW_ORDER_ID','NAME','DATE','TIME','DAY','ITEM','ITEM_SIZE','ORDER_TYPE','QUANTITY','MEDIUM','MOP'],
  customers: ['ID','NAME'],
  medium: ['ID','NAME'],
  mop: ['ID','NAME','IS_COMBO'],
  mop_items: ['ID','MOP_ID','ITEM_ID'],
  category: ['ID','NAME'],
  category_sizes: ['ID','CATEGORY_ID','SIZE'],
  menu_items: ['ID','NAME','CATEGORY_ID'],
  menu_item_variants: ['ID','MENU_ITEM_ID','SIZE_ID','PRICE'],
  orders: ['ID','CUSTOMER_ID','ORDER_DATE','ORDER_TIME','MOP_ID','MEDIUM_ID','ORDER_MODE','TOTAL_AMOUNT'],
  order_items: ['ID','ORDER_ID','VARIANT_ID','QUANTITY','SUBTOTAL'],
  receipt_totals: ['ID','ORDER_ID','RECEIPT_DATE','RECEIPT_TOTAL'],
  packed_meals: ['ID','NAME'],
  packed_meal_items: ['ID','PACKED_MEAL_ID','MENU_ITEM_ID']
};

// -------------------- Filter Row --------------------
function filterRow(row, table) {
  if (!row) return {};
  const allowed = snowflakeColumns[table];
  if (!allowed) return {};
  return Object.fromEntries(
    Object.entries(row).filter(([k]) => allowed.includes(k.toUpperCase()))
  );
}

// -------------------- Mirror Function --------------------
async function mirrorChange(event, table, newRow, oldRow) {
  const tablePK = {
    raw_orders: 'raw_order_id', customers: 'id', medium: 'id', mop: 'id',
    mop_items: 'id', category: 'id', category_sizes: 'id',
    menu_items: 'id', menu_item_variants: 'id', orders: 'id',
    order_items: 'id', receipt_totals: 'id', packed_meals: 'id',
    packed_meal_items: 'id'
  };
  const pk = tablePK[table];
  if (!pk) return;

  const filteredNew = filterRow(newRow, table);
  const filteredOld = filterRow(oldRow, table);

  // -------------------- Auto-fill DAY for raw_orders --------------------
  if (table === 'raw_orders' && filteredNew?.DATE && !filteredNew?.DAY) {
    const daySql = `TO_CHAR(${sqlValue(filteredNew.DATE)}, 'FMDay')`;
    filteredNew.DAY = `(${daySql})`; // Snowflake expression
  }

  let sql = '';
  if (event === 'INSERT' && filteredNew) {
    sql = `INSERT INTO "${table.toUpperCase()}" (${columnsList(filteredNew)}) VALUES (${valuesList(filteredNew)});`;
  } else if (event === 'UPDATE' && filteredNew && filteredOld) {
    sql = `UPDATE "${table.toUpperCase()}" SET ${updatesList(filteredNew)} WHERE "${pk.toUpperCase()}" = ${sqlValue(filteredOld[pk])};`;
  } else if (event === 'DELETE' && filteredOld) {
    sql = `DELETE FROM "${table.toUpperCase()}" WHERE "${pk.toUpperCase()}" = ${sqlValue(filteredOld[pk])};`;
  }

  if (sql) {
    try {
      await executeSnowflake(sql);
      console.log(`✅ Mirrored ${event} on ${table} to Snowflake`);
    } catch (err) {
      console.error(`❌ Error mirroring ${table}:`, err.message);
    }
  }

  // -------------------- Recalculate total_amount for orders --------------------
  if (table === 'order_items') {
    const orderId = filteredNew?.ORDER_ID ?? filteredOld?.ORDER_ID;
    if (orderId) {
      const updateTotal = `
        UPDATE ORDERS o
        SET TOTAL_AMOUNT = (
          SELECT COALESCE(SUM(subtotal),0)
          FROM ORDER_ITEMS
          WHERE order_id = ${sqlValue(orderId)}
        )
        WHERE o.ID = ${sqlValue(orderId)};
      `;
      try {
        await executeSnowflake(updateTotal);
        console.log(`🔄 Recalculated TOTAL_AMOUNT for order ${orderId}`);
      } catch (err) {
        console.error(`❌ Error updating TOTAL_AMOUNT for order ${orderId}:`, err.message);
      }
    }
  }
}

// -------------------- Realtime Subscription --------------------
const tables = Object.keys(snowflakeColumns);

tables.forEach(table => {
  supabase
    .channel(`realtime-${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        await mirrorChange(eventType.toUpperCase(), table, newRow, oldRow);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') console.log(`🔔 Listening to Realtime on ${table}`);
    });
});

console.log('🌐 Supabase → Snowflake mirror running...');

// -------------------- Express Server for Render --------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Supabase → Snowflake mirror is running ✅');
});

app.listen(PORT, () => {
  console.log(`🟢 Server listening on port ${PORT}`);
});