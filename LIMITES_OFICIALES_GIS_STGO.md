# Límites Oficiales GIS STGO

Desde 2026-09-15 se establece una única referencia territorial común para los visores GIS STGO.

## Capas canónicas
- Comuna: `data/comuna.geojson`
- Barrios: `data/barrios.geojson`
- Territorios PLADECO: `data/limite_territorios_pladeco.geojson`

CRS web: EPSG:4326.

## Regla
Estas geometrías son la fuente canónica de publicación para GeoIndicadores, Maqueta 3D STGO, Visor Territorial/Biblioteca Digital y futuros GIS STGO/Visor Propiedades. Ningún visor debe mantener una geometría alternativa independiente de comuna, barrios o territorios. Si se corrige un límite, se modifica primero la fuente canónica y luego se valida el cambio en los visores dependientes.

## Nombres controlados
Se mantienen, entre otros, los nombres oficiales de trabajo `REPÚBLICA`, `RONDIZZONI` y `PARQUE O'HIGGINS`.

Los datos maestros y capas fuente de edición continúan resguardados en la Unidad Compartida. Los GeoJSON aquí definidos son copias web de referencia territorial.
