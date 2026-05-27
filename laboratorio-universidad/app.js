const express = require("express");
const path = require("path");
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
const handleCreateEstudiante = (req, res) => {
  const { nombre, correo, semestre = 1 } = req.body;
  const sql = `
    INSERT INTO estudiantes (nombre, correo, semestre)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [nombre, correo, semestre], (error, result) => {
    if (error) return res.status(500).json(error);
    res.status(201).json({ mensaje: 'Estudiante agregado', id: result.insertId });
  });
};

app.post('/estudiantes', handleCreateEstudiante);
app.post('/estudiante', handleCreateEstudiante);

// =====================================================
// READ TODOS
// =====================================================
const handleGetEstudiantes = (req, res) => {
  db.query('SELECT * FROM estudiantes', (error, results) => {
    if (error) return res.status(500).json(error);
    res.json(results);
  });
};

app.get('/estudiantes', handleGetEstudiantes);
app.get('/estudiante', handleGetEstudiantes);

// =====================================================
// READ POR ID
// =====================================================
const handleGetEstudianteById = (req, res) => {
  const sql = `SELECT * FROM estudiantes WHERE id = ?`;
  db.query(sql, [req.params.id], (error, results) => {
    if (error) return res.status(500).json(error);
    if (!results || results.length === 0) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(results[0]);
  });
};

app.get('/estudiantes/:id', handleGetEstudianteById);
app.get('/estudiante/:id', handleGetEstudianteById);

// =====================================================
// UPDATE
// =====================================================
const handleUpdateEstudiante = (req, res) => {
  const { nombre, correo, semestre = 1 } = req.body;
  const sql = `
    UPDATE estudiantes
    SET nombre = ?, correo = ?, semestre = ?
    WHERE id = ?
  `;
  db.query(sql, [nombre, correo, semestre, req.params.id], (error) => {
    if (error) return res.status(500).json(error);
    res.json({ mensaje: 'Actualizado' });
  });
};

app.put('/estudiantes/:id', handleUpdateEstudiante);
app.put('/estudiante/:id', handleUpdateEstudiante);

// =====================================================
// DELETE
// =====================================================
const handleDeleteEstudiante = (req, res) => {
  const sql = `DELETE FROM estudiantes WHERE id = ?`;
  db.query(sql, [req.params.id], (error) => {
    if (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          error: 'No se puede eliminar este estudiante',
          razon: 'El estudiante tiene matrículas asociadas. Elimina primero las matrículas.'
        });
      }
      return res.status(500).json(error);
    }
    res.json({ mensaje: 'Eliminado' });
  });
};

app.delete('/estudiantes/:id', handleDeleteEstudiante);
app.delete('/estudiante/:id', handleDeleteEstudiante);

// =====================================================
// CONSULTA JOIN
// =====================================================
const handleMatriculasCompletas = (req, res) => {
  const sql = `
    SELECT
      m.id,
      e.nombre AS estudiante,
      e.semestre,
      c.nombre AS curso,
      c.creditos,
      d.nombre AS docente,
      f.nombre AS facultad,
      m.fecha
    FROM matriculas m
    INNER JOIN estudiantes e ON m.estudiante_id = e.id
    INNER JOIN cursos c ON m.curso_id = c.id
    INNER JOIN docentes d ON c.docente_id = d.id
    INNER JOIN facultades f ON c.facultad_id = f.id
  `;
  db.query(sql, (error, results) => {
    if (error) return res.status(500).json(error);
    res.json(results);
  });
};

app.get('/matriculas-completas', handleMatriculasCompletas);
app.get('/matricula-completa', handleMatriculasCompletas);

// =====================================================
// LEVANTAR SERVIDOR
// =====================================================
if (!process.env.VERCEL) {
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
