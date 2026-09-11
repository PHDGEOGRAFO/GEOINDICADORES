# Estado de los 14 puntos pendientes · 11-09-2026

Base de trabajo: rama `parallel-v0.6.1-tech`. Los visores públicos permanecen sin modificación.

| Nº | Trabajo | Estado actual |
|---:|---|---|
| 1 | Denominador barrial | **CERRADO: 27 barrios.** Cero = dato válido; ausencia real = null. |
| 2 | IIT_1, IIT_2, IIT_3 | **PENDIENTE DE DATOS.** Mantener `Sin dato`, nunca 0 por defecto. |
| 3 | Automatización BBDD Maestra -> JSON | **MUY AVANZADO.** Generador corregido, validaciones reforzadas y adaptador preparado. Falta conectar una entrada segura de la BBDD sin publicar el XLSX maestro. |
| 4 | Archivar `sintesis2-temporal.json` | **PRÁCTICAMENTE CERRADO.** No aparece como fuente operativa vigente. |
| 5 | Revisión visual GeoIndicadores | **EN CURSO.** Detectada simplificación incorrecta a 4 rangos; piloto de 5 rangos preparado. Falta QA de escritorio/móvil, fichas, comparación y evolución. |
| 6 | Biblioteca Digital | **EN CARGA PROGRESIVA.** Mantener catálogo, metadatos y enlaces oficiales. |
| 7 | Concesiones STGO | **FUENTES OFICIALES LOCALIZADAS.** DOM 2026, Rentas/Finanzas y Tránsito. Falta homologación, depuración de datos personales, georreferenciación y consolidación. |
| 8 | STGO 3D | **BASE DISPONIBLE / ALTURAS OFICIALES PENDIENTES.** 34.957 geometrías; altura 2,50 m/piso sólo referencial cuando falta altura directa. |
| 9 | PMTiles | **PILOTO PREPARADO.** Falta localizar/cargar `calles_santiago.geojson` y ejecutar conversión + hash + prueba comparativa. |
| 10 | Turf.js | **PILOTO CREADO** en rama tecnológica. Falta integrar en un visor de prueba y QA. |
| 11 | DuckDB Spatial/Wasm + GeoParquet | **PILOTO CREADO** con primera consulta local de solo lectura. Falta dataset GeoParquet operativo y QA. |
| 12 | Campos sensibles Visor de Suelos | **REVISIÓN INICIADA.** El visor de propiedades no muestra RUT/teléfono como campos de interfaz detectados, pero las fuentes de Concesiones/Rentas sí contienen RUT, nombres, morosidad y fechas de nacimiento; se documentó política de exclusión pública. |
| 13 | Repositorios GitHub definitivos | **PARCIAL.** Existen `GEOINDICADORES`, `VISOR-REPOSITORIO-DIGITAL` y `MAQUETA-3D-STGO`. Concesiones aún sin repositorio independiente. |
| 14 | Validación integral + autorización de publicación | **PENDIENTE FINAL.** No fusionar ni publicar rama paralela sin autorización expresa. |

## Próxima secuencia

1. Completar QA visual de GeoIndicadores con cinco rangos.
2. Conectar los JSON maestros al visor paralelo y comparar resultados con la BBDD Maestra.
3. Consolidar Concesiones DOM + Rentas + Tránsito en un modelo común interno y una vista pública depurada.
4. Localizar `calles_santiago.geojson` y ejecutar PMTiles.
5. Probar Turf y DuckDB/GeoParquet sobre datasets reales.
6. Revisar Biblioteca y STGO 3D.
7. Cerrar repositorios, URLs, QA final y autorización de publicación.
