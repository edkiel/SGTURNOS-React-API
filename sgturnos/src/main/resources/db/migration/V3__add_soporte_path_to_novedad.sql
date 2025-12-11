-- Agrega columna para ruta de soporte en PDF de las novedades
ALTER TABLE novedad ADD COLUMN IF NOT EXISTS soporte_path VARCHAR(500);
