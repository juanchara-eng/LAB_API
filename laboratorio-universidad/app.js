const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require("express");
const axios = require("axios");
const db = require("./db");
const app = express();
const PORT = process.env.PORT || 3000;

// CORS simple
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================================================
// API EXTERNA
// =====================================================
const handleUsuariosExternos = async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error consumiendo API' });
  }
};

app.get('/usuarios-externos', handleUsuariosExternos);
app.get('/usuario-externo', handleUsuariosExternos);

// =====================================================
// CREATE ESTUDIANTE
// =====================================================
const handleCreateEstudiante = async (req, res) => {
  const { nombre, correo, semestre = 1 } = req.body;
  const { data, error } = await db
    .from('estudiantes')
    .insert({ nombre, correo, semestre })
    .select('id')
    .single();

  if (error) return res.status(500).json(error);
  res.status(201).json({ mensaje: 'Estudiante agregado', id: data.id });
};

app.post('/estudiantes', handleCreateEstudiante);
app.post('/estudiante', handleCreateEstudiante);

// =====================================================
// READ TODOS
// =====================================================
const handleGetEstudiantes = async (req, res) => {
  const { data, error } = await db
    .from('estudiantes')
    .select('*')
    .order('id');

  if (error) return res.status(500).json(error);
  res.json(data);
};

app.get('/estudiantes', handleGetEstudiantes);
app.get('/estudiante', handleGetEstudiantes);

// =====================================================
// READ POR ID
// =====================================================
const handleGetEstudianteById = async (req, res) => {
  const { data, error } = await db
    .from('estudiantes')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ mensaje: 'No encontrado' });
    return res.status(500).json(error);
  }
  res.json(data);
};

app.get('/estudiantes/:id', handleGetEstudianteById);
app.get('/estudiante/:id', handleGetEstudianteById);

// =====================================================
// UPDATE
// =====================================================
const handleUpdateEstudiante = async (req, res) => {
  const { nombre, correo, semestre = 1 } = req.body;
  const { error } = await db
    .from('estudiantes')
    .update({ nombre, correo, semestre })
    .eq('id', req.params.id);

  if (error) return res.status(500).json(error);
  res.json({ mensaje: 'Actualizado' });
};

app.put('/estudiantes/:id', handleUpdateEstudiante);
app.put('/estudiante/:id', handleUpdateEstudiante);

// =====================================================
// DELETE
// =====================================================
const handleDeleteEstudiante = async (req, res) => {
  const { error } = await db
    .from('estudiantes')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'No se puede eliminar este estudiante',
        razon: 'El estudiante tiene matrículas asociadas. Elimina primero las matrículas.'
      });
    }
    return res.status(500).json(error);
  }
  res.json({ mensaje: 'Eliminado' });
};

app.delete('/estudiantes/:id', handleDeleteEstudiante);
app.delete('/estudiante/:id', handleDeleteEstudiante);

// =====================================================
// CONSULTA JOIN
// =====================================================
const handleMatriculasCompletas = async (req, res) => {
  const { data, error } = await db
    .from('matriculas')
    .select(`
      id,
      fecha,
      estudiante:estudiante_id(id,nombre,semestre),
      curso:curso_id(
        id,
        nombre,
        creditos,
        docente:docente_id(id,nombre),
        facultad:facultad_id(id,nombre)
      )
    `)
    .order('id');

  if (error) return res.status(500).json(error);
  const normalized = data.map((row) => ({
    id: row.id,
    estudiante: row.estudiante?.nombre,
    semestre: row.estudiante?.semestre,
    curso: row.curso?.nombre,
    creditos: row.curso?.creditos,
    docente: row.curso?.docente?.nombre,
    facultad: row.curso?.facultad?.nombre,
    fecha: row.fecha,
  }));
  res.json(normalized);
};

app.get('/matriculas-completas', handleMatriculasCompletas);
app.get('/matricula-completa', handleMatriculasCompletas);

// =====================================================
// SUPABASE STATUS
// =====================================================
const handleSupabaseStatus = async (req, res) => {
  const tables = ['facultades', 'docentes', 'estudiantes', 'cursos', 'matriculas'];
  const results = {};
  let allOk = true;

  for (const table of tables) {
    const { data, error } = await db.from(table).select('id').limit(1);
    if (error) {
      results[table] = {
        ok: false,
        message: error.message || 'Error desconocido',
        code: error.code || 'UNKNOWN',
      };
      allOk = false;
    } else {
      results[table] = {
        ok: true,
        rows: Array.isArray(data) ? data.length : 0,
      };
    }
  }

  res.json({
    connected: true,
    supabaseUrl: process.env.SUPABASE_URL,
    ready: allOk,
    tables: results,
    note: allOk
      ? 'Conexión y tablas disponibles.'
      : 'Al menos una tabla no existe. Aplica el esquema SQL en Supabase.'
  });
};

app.get('/supabase-status', handleSupabaseStatus);

// =====================================================
// LEVANTAR SERVIDOR
// =====================================================
const isVercel = process.env.VERCEL || process.env.NOW_REGION || process.env.NOW;
if (!isVercel) {
  const server = app.listen(PORT, () => {
    console.log('Servidor ejecutándose puerto', PORT);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Error: puerto ${PORT} en uso. Cambia PORT o detén el proceso que lo está usando.`);
      process.exit(1);
    }
    throw error;
  });
}

module.exports = app;
