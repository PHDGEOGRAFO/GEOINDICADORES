# GEOINDICADORES

Prototipo 0.1 de visor territorial y dashboard para indicadores de Santiago.

## Estado

Esta primera versión utiliza geometrías y valores demostrativos. No corresponde a información oficial ni debe utilizarse para decisiones institucionales.

## Funciones iniciales

- Mapa web con MapLibre GL JS.
- Tarjetas de resumen.
- Filtro por territorio.
- Normalización min–max o percentil.
- Valoración inversa opcional.
- Clasificación en cuatro rangos.
- Ranking por barrio.
- Panel metodológico.

## Prueba local

Los navegadores restringen la lectura de GeoJSON cuando se abre `index.html` directamente. Servir la carpeta mediante un servidor local o GitHub Pages.

## Próximos pasos

1. Sustituir los datos demostrativos por capas validadas en EPSG:4326.
2. Incorporar Excel/CSV y asociación por identificadores territoriales.
3. Agregar escalas manzana, territorio y comuna.
4. Construir el generador portable para Windows.
