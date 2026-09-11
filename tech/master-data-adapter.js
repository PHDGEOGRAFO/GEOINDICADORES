// Adaptador transitorio BBDD Maestra -> estructura esperada por app.js.
// Usa sintesis-visor.json únicamente como catálogo de metadatos de indicadores.
async function loadMasterVisorData(){
  const [catalog, barrioMaster, aggregatesMaster] = await Promise.all([
    fetch('./data/sintesis-visor.json').then(r=>r.json()),
    fetch('./data/master-barrio.json').then(r=>r.json()),
    fetch('./data/master-aggregates.json').then(r=>r.json())
  ]);

  const series=[];
  for(const year of [2025,2026]){
    const rows=barrioMaster?.anios?.[String(year)]||[];
    for(const row of rows){
      series.push({
        id:String(row.id ?? ''),
        nombre:row.nombre,
        anio:year,
        valores:row.valores||{}
      });
    }
  }

  if(series.filter(r=>r.anio===2025).length!==27 || series.filter(r=>r.anio===2026).length!==27){
    throw new Error('BBDD Maestra: se esperaban 27 barrios en cada año');
  }

  return {
    db:{
      fuente:{
        nombre:'BBDD_MAESTRA_Visor_Geoindicadores_2025_2026',
        nota:'JSON derivados. 0 es dato válido; sólo ausencia real es null.'
      },
      indicadores:catalog.indicadores||[],
      series
    },
    aggregates:aggregatesMaster
  };
}

window.loadMasterVisorData=loadMasterVisorData;
