# GIS STGO · GIS CORE / DATA CORE

## Estándar transversal oficial

GIS STGO adopta una arquitectura común para todos sus visores y módulos.

### Fuente privada
La Unidad Compartida / Drive institucional conserva:
- BBDD Maestra.
- Cálculos.
- Respaldos.
- Archivos originales.
- Archivos de revisión manual.

Estos archivos no forman parte de la publicación web.

### Publicación web
El proceso de publicación:
1. Lee la fuente maestra privada.
2. Selecciona solamente campos autorizados.
3. Sanitiza atributos.
4. Simplifica geometrías cuando corresponda.
5. Genera una copia web reducida.
6. Publica solamente el derivado necesario para el navegador.

Todo archivo que llega al navegador debe considerarse técnicamente descargable.

## GIS CORE · referencia territorial única

Jerarquía territorial oficial:

`COMUNA SANTIAGO → TERRITORIO PLADECO → BARRIO → MANZANA CENSAL 2024`

Clave oficial de manzana:

`COD_MZN`

Fuente canónica web actual: `PHDGEOGRAFO/GEOINDICADORES`.

Capas oficiales:
- `data/comuna.geojson`
- `data/barrios.geojson`
- `data/limite_territorios_pladeco.geojson`
- `data/manzanas/NORORIENTE.geojson`
- `data/manzanas/NORPONIENTE.geojson`
- `data/manzanas/CENTRO_ORIENTE.geojson`
- `data/manzanas/CENTRO_PONIENTE.geojson`
- `data/manzanas/SURORIENTE.geojson`
- `data/manzanas/SURPONIENTE.geojson`

Los módulos no deben mantener geometrías paralelas de comuna, territorios, barrios o manzanas. Una corrección territorial se realiza primero en la fuente canónica y luego se consume/replica en los módulos dependientes.

## DATA CORE · regla de datos

- La BBDD Maestra permanece privada.
- GitHub aloja código y derivados web autorizados.
- GitHub Pages entrega solo los datos mínimos necesarios para la interfaz.
- `data-web/` es el destino lógico estándar para nuevos derivados web.
- Durante la transición pueden mantenerse rutas históricas para no romper visores existentes.
- No se publica Excel, GPKG, SHP, SQLite, cálculos ni respaldos internos salvo autorización explícita de publicación.

## Manzana Censal 2024

Para publicación web, la versión sanitizada debe conservar solo los campos necesarios para el visor. El contrato base es:
- `COD_MZN`
- `BARRIO`
- `TERRITORIO`
- `COMUNA`
- `n_per` cuando el módulo necesite cálculos poblacionales
- geometría

## Módulos adheridos

- GeoIndicadores.
- Visor Territorial / Biblioteca Digital Territorial.
- Maqueta 3D STGO.
- Visor de Suelos / Propiedades, en proceso de alineación completa.
- Futuros módulos GIS STGO.

## Estado de migración

Estado actual: `TRANSICIÓN CONTROLADA`.

La arquitectura y los controles de seguridad ya están adoptados. Todavía existen rutas históricas y coberturas temáticas publicadas que deben revisarse cobertura por cobertura para reducir campos y retirar archivos completos no necesarios sin romper los visores.
