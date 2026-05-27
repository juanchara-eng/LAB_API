const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const tables = ['facultades', 'docentes', 'estudiantes', 'cursos', 'matriculas'];

async function checkTable(table) {
  const { data, error } = await supabase.from(table).select('id').limit(1);
  if (error) {
    return {
      table,
      ok: false,
      message: error.message || 'Error desconocido',
      code: error.code || 'UNKNOWN',
    };
  }
  return {
    table,
    ok: true,
    rows: Array.isArray(data) ? data.length : 0,
  };
}

async function main() {
  console.log('Validando conexión a Supabase...');
  console.log('SUPABASE_URL=', SUPABASE_URL);

  const results = [];
  for (const table of tables) {
    // eslint-disable-next-line no-await-in-loop
    const result = await checkTable(table);
    results.push(result);
  }

  console.log('Resultados:');
  results.forEach((result) => {
    if (result.ok) {
      console.log(`  [OK] ${result.table} (rows: ${result.rows})`);
    } else {
      console.log(`  [ERROR] ${result.table} - ${result.message} (${result.code})`);
    }
  });

  const allOk = results.every((r) => r.ok);
  if (!allOk) {
    console.log('\nAl menos una tabla falta o no es accesible.');
    console.log('Aplica el esquema SQL en Supabase usando laboratorio-universidad/schema.sql.');
    process.exit(1);
  }

  console.log('\nConexión a Supabase validada correctamente.');
}

main().catch((error) => {
  console.error('ERROR:', error.message || error);
  process.exit(1);
});
