# Arquitectura estándar de publicación GIS STGO

## Regla general
La BBDD Maestra, cálculos, respaldos y archivos de revisión permanecen fuera del repositorio público, en la Unidad Compartida/Drive institucional.

El visor público solo consume una copia web derivada, preparada específicamente para visualización.

## Flujo estándar
1. BBDD Maestra privada en Unidad Compartida.
2. Proceso de publicación que selecciona únicamente campos autorizados.
3. Sanitización y, cuando corresponda, simplificación de geometrías.
4. Generación de JSON/GeoJSON u otros archivos web derivados.
5. Validación automática de archivos no publicables.
6. GitHub/GitHub Pages publica código y datos mínimos de visualización.

## Convención común
- `data-web/`: destino estándar de los datos derivados publicables.
- `.github/workflows/validar-publicacion-segura.yml`: bloquea nuevas incorporaciones de formatos maestros/de trabajo.
- `.gitignore`: evita incorporar por error BBDD Maestra, cálculos, respaldos y formatos de trabajo.

Durante la migración pueden mantenerse rutas históricas para no romper el visor. Se reemplazarán gradualmente después de validar equivalencia.

## No publicar
- BBDD maestras completas.
- Excel de cálculo o revisión.
- GeoPackage originales.
- Shapefiles originales.
- CSV completos de trabajo.
- SQLite u otras bases locales.
- Respaldos o archivos intermedios.
- Campos internos no visibles en el visor.

## Sí se puede publicar
- Límites territoriales necesarios para dibujar el mapa.
- Identificadores públicos.
- Nombre de unidad territorial.
- Año.
- Indicador.
- Valor final mostrado.
- Rango/categoría mostrada.
- Geometría simplificada o preparada para web.

## Regla de seguridad
Todo archivo que recibe el navegador debe considerarse técnicamente descargable. La protección de la BBDD Maestra se logra evitando que sea enviada al navegador y publicando únicamente una versión reducida.

## GeoIndicadores
Los datos de publicación deben ser derivados de la BBDD Maestra y contener solo resultados finales y campos necesarios para la interfaz. Los cálculos, datos fuente y hojas de respaldo permanecen en la Unidad Compartida.
