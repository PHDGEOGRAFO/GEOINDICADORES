# Concesiones STGO · modelo común de campos

Objetivo: homologar DOM, Rentas/Finanzas y Tránsito en una base interna y derivar una vista pública segura.

## Base interna

| Campo | Uso |
|---|---|
| ID_CONCESION | Identificador estable no personal |
| FUENTE | DOM / RENTAS / TRANSITO |
| TIPO | Estacionamiento, BNUP, mobiliario, servicio, inmueble u otro |
| NOMBRE_CONCESION | Denominación administrativa |
| TITULAR_TIPO | PERSONA_JURIDICA / PERSONA_NATURAL |
| TITULAR_NOMBRE | Uso interno; publicar sólo cuando corresponda legal/institucionalmente |
| TITULAR_RUT | **INTERNO / NO PUBLICAR PERSONA NATURAL** |
| DIRECCION | Dirección administrativa |
| BARRIO | Barrio oficial |
| TERRITORIO | Territorio PLADECO |
| FECHA_INICIO | Inicio contractual/permiso |
| FECHA_TERMINO | Término contractual/permiso |
| PLAZO | Plazo informado |
| ESTADO_ADMIN | Vigente, terminado, revisión u homologación equivalente |
| ESTADO_FINANCIERO | **INTERNO**; no publicar para personas naturales |
| MONTO_INVERSION | Atributo contractual cuando corresponda |
| PAGO_FIJO | Atributo contractual cuando corresponda |
| PAGO_VARIABLE | Atributo contractual cuando corresponda |
| SUPERFICIE_M2 | Cuando exista respaldo |
| N_ESPACIOS | Cuando aplique, p. ej. estacionamientos |
| ACTO_ADMIN | Decreto, resolución, licitación o contrato de respaldo |
| OBS_INTERNA | **INTERNO**; puede contener datos personales |
| X | Coordenada WGS84 si se publica como punto |
| Y | Coordenada WGS84 si se publica como punto |
| GEOMETRIA | Punto/polígono/línea según fuente validada |
| QA_ESTADO | PENDIENTE / VALIDADO / PUBLICABLE |

## Vista pública derivada

Publicar sólo: `ID_CONCESION`, `FUENTE`, `TIPO`, `NOMBRE_CONCESION`, titular persona jurídica validado cuando corresponda, `DIRECCION`, `BARRIO`, `TERRITORIO`, fechas/plazo, estado administrativo general, atributos contractuales públicos, superficie/número de espacios, acto administrativo y geometría.

Excluir: RUT de personas naturales, fecha de nacimiento, teléfono/correo personal, estado de morosidad/deuda individual y observaciones internas con datos personales.

## Reglas territoriales

- Usar nombres oficiales: República, Rondizzoni y Parque O'Higgins.
- Georreferenciar contra límites oficiales de barrio/territorio.
- Si la dirección y la geometría discrepan, prevalece la validación espacial documentada y se registra la corrección.
- Conservar fuente original y fecha de actualización.
