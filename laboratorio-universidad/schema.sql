-- Clean schema for 'universidad' with proper FK ordering and cascading
DROP DATABASE IF EXISTS universidad;
CREATE DATABASE universidad;
USE universidad;

-- Drop tables if they exist (reverse order of dependencies)
DROP TABLE IF EXISTS matriculas;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS facultades;

-- Create base tables
CREATE TABLE facultades(
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE docentes(
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE estudiantes(
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  correo VARCHAR(100),
  semestre INT
) ENGINE=InnoDB;

CREATE TABLE cursos(
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  creditos INT,
  docente_id INT NULL,
  facultad_id INT NULL,
  CONSTRAINT fk_cursos_docente FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_cursos_facultad FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE matriculas(
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT,
  curso_id INT,
  fecha DATE,
  CONSTRAINT fk_matriculas_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_matriculas_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Seed data (insert in dependency order)
INSERT INTO facultades(nombre) VALUES ('Ingeniería'), ('Salud'), ('Administración');

INSERT INTO docentes(nombre, correo) VALUES
('Carlos Ruiz','carlos@univalle.edu'),
('Ana Gómez','ana@univalle.edu'),
('Pedro Díaz','pedro@univalle.edu');

INSERT INTO estudiantes(nombre, correo, semestre) VALUES
('Luis Fernando','luis@email.com',7),
('Juan Perez','juan@email.com',3),
('Maria Lopez','maria@email.com',5),
('Andres Castro','andres@email.com',2);

INSERT INTO cursos(nombre, creditos, docente_id, facultad_id) VALUES
('Servicios Web',4,1,1),
('Ciberseguridad',3,2,1),
('Inteligencia Negocios',3,3,1);

INSERT INTO matriculas(estudiante_id, curso_id, fecha) VALUES
(1,1,'2026-02-10'),
(1,2,'2026-02-11'),
(2,1,'2026-02-15'),
(3,3,'2026-02-17'),
(4,2,'2026-02-20');
