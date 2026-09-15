# data-web

Carpeta estándar para datos derivados destinados al visor público.

## Regla
Todo archivo aquí debe poder ser descargado públicamente sin exponer la BBDD Maestra ni información de trabajo.

## Origen
Unidad Compartida / BBDD Maestra -> proceso de publicación -> `data-web/`.

## Contenido permitido
- JSON/GeoJSON derivados.
- Geometrías simplificadas.
- Identificadores públicos.
- Nombre de unidad territorial.
- Año, indicador, valor final, rango/categoría y otros campos visibles.

## Contenido prohibido
- BBDD Maestra.
- Archivos de cálculo o respaldo.
- Excel, GeoPackage, Shapefile, SQLite.
- Campos internos no utilizados por el visor.

## Estado de migración
TRANSICIÓN. El visor aún consume archivos desde rutas históricas. Los archivos actuales no se moverán hasta validar la equivalencia y evitar romper GitHub Pages.
