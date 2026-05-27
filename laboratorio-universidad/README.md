# Laboratorio Universidad

Proyecto: API REST con Node.js, Express y MySQL

Requisitos:
- Node.js
- MySQL (ejecutando)

Instalación:

```bash
cd "C:/Users/PC-20/Saved Games/laboratorio-universidad"
npm install
```

Crear la base de datos y tablas en MySQL (usar `schema.sql`):

1. Abrir MySQL Workbench o cliente MySQL
2. Ejecutar el script `schema.sql` o copiar su contenido y ejecutarlo

Ejecutar servidor:

```bash
npm start
```

Validar conexión a Supabase:

- Asegúrate de tener `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` en `.env`.
- Ejecuta `npm run check:supabase` desde la raíz del proyecto.
- También puedes consultar `GET /supabase-status` una vez que la API esté en marcha.

Crear el esquema en Supabase:

1. Abre el editor SQL de tu proyecto Supabase.
2. Copia y ejecuta el contenido de `laboratorio-universidad/schema.sql`.
3. Después de aplicar el esquema, revisa `GET /supabase-status` nuevamente.

Endpoints principales:

- `GET /usuarios-externos` - consume JSONPlaceholder
- `POST /estudiantes` - crear estudiante
- `GET /estudiantes` - listar estudiantes
- `GET /estudiantes/:id` - obtener estudiante por id
- `PUT /estudiantes/:id` - actualizar estudiante
- `DELETE /estudiantes/:id` - eliminar estudiante
- `GET /matriculas-completas` - consulta JOIN con información completa

Notas:
- Ajusta las credenciales de `db.js` si usas contraseña en MySQL.
- Si obtienes errores de FK al eliminar, considera usar `ON DELETE CASCADE` en la tabla `matriculas` o eliminar las matrículas antes.
