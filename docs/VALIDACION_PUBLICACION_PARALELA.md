# Validación de publicación paralela

Estado de trabajo: 11-09-2026. Este documento aplica a la rama `parallel-v0.6.1-tech` y no autoriza publicación.

## GeoIndicadores

- Denominador barrial definitivo: **27 barrios**.
- `0` es dato válido cuando la fuente lo informa; sólo ausencia real se representa como `null`.
- IIT_1, IIT_2 e IIT_3 permanecen `Sin dato` hasta disponer de serie operativa validada.
- La fuente operativa objetivo son `master-barrio.json` y `master-aggregates.json` derivados de la BBDD Maestra.
- `sintesis-visor.json` puede mantenerse transitoriamente sólo como catálogo de nombres, unidades y descripciones.

## Rangos cualitativos de trabajo

Usar cinco clases en la versión paralela:

| Desde | Hasta | Clase |
|---:|---:|---|
| 0.000 | <0.125 | MUY BAJO |
| 0.125 | <0.375 | BAJO |
| 0.375 | <0.750 | MEDIO |
| 0.750 | <0.875 | ALTO |
| 0.875 | 1.000 | MUY ALTO |

No usar la simplificación visual de cuatro clases como clasificación metodológica del visor principal.

## Publicación de datos

Regla general: separar base interna de base pública.

### No publicar en visores públicos
- RUT de personas naturales.
- Nombre completo de personas naturales cuando no sea imprescindible para la finalidad pública del visor.
- Fecha de nacimiento.
- Teléfono, correo personal u otros datos de contacto individual.
- Estado de morosidad, deuda u otros antecedentes financieros individuales.
- Observaciones administrativas que contengan datos personales o antecedentes no necesarios para la consulta territorial.

### Publicables previa validación
- Identificador interno no personal.
- Tipo de bien/concesión.
- Dirección o localización del bien/permiso cuando corresponda al objeto del visor.
- Geometría territorial.
- Estado administrativo general no asociado a información financiera personal.
- Fechas de inicio/término de concesiones.
- Plazo, tipo de concesión y atributos contractuales públicos.
- Titular persona jurídica cuando el antecedente forme parte de un acto o contrato público, sujeto a revisión jurídica/institucional final.

## Concesiones STGO

Fuentes identificadas:
- DOM 2026.
- Rentas/Finanzas.
- Tránsito/estacionamientos.

La base DOM puede alimentar el piloto luego de homologar campos y georreferenciar. La base Rentas requiere generar una vista pública depurada antes de incorporarla al visor.

## STGO 3D

- Mantener separada la altura demostrativa de las alturas oficiales.
- Altura de referencia actual: 2,50 m por piso sólo cuando no existe dato directo validado.
- No presentar la altura estimada como altura oficial.

## Publicación final

Ningún cambio de esta rama se fusiona a `main` ni se publica hasta completar QA funcional, QA de datos, revisión de atributos publicables y autorización expresa.
