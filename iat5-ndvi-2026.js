(()=>{
  const valores2026={
    'SANTA LUCÍA FORESTAL':0.5290586765760601,
    'CENTRO HISTÓRICO':0.07585531975258693,
    'SANTA ANA':0.20434763437983458,
    'PANAMÁ':0.1866942195696279,
    'BRASIL':0.1917639087895715,
    'BALMACEDA':0.37104067706449617,
    'YUNGAY':0.40548790268200546,
    'SAN BORJA':0.30745046451528835,
    'SANTA ISABEL':0.1544381023602131,
    'DIEZ DE JULIO':0.06579695989109792,
    'PARQUE ALMAGRO':0.234259364352714,
    'MATTA NORTE':0.07786392811044777,
    'EJÉRCITO':0.21776890118858316,
    'REPÚBLICA':0.17574078689552025,
    'MEIGGS':0,
    'SANTA ELENA':0.04598262214693571,
    'SIERRA BELLA':0.07312630280203071,
    'MATTA SUR':0.10791199526676117,
    'BOGOTÁ':0.07017868319837572,
    'FRANKLIN':0.03772524606864821,
    'VIEL':0.08391866328407827,
    'HUEMUL':0.20465920061983134,
    'CLUB HÍPICO':0.918530334827277,
    'SAN EUGENIO':0.2608978177741018,
    'SAN VICENTE':0.07370343752859722,
    'RONDIZZONI':0.22803331245422867,
    "PARQUE O'HIGGINS":1
  };
  const normaliza=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const tabla=new Map(Object.entries(valores2026).map(([k,v])=>[normaliza(k),v]));
  let intentos=0;
  const aplicar=()=>{
    intentos++;
    if(typeof state==='undefined'||!state.db?.series||!state.db?.indicadores){if(intentos<80)setTimeout(aplicar,100);return;}
    const indicador=state.db.indicadores.find(i=>i.codigo==='IAT_5');
    if(indicador){
      indicador.indicador='Índice NDVI promedio ponderado';
      indicador.unidad='Índice normalizado 0–1';
      indicador.descripcion='Para 2026 utiliza NDVI promedio ponderado por píxeles a partir de 1.711 manzanas, fuente septiembre 2025. Agregación: SUM(NDVI_MZsum) / SUM(NDVI_MZcount), con normalización Min–Max directa. La medición 2025 conserva la metodología histórica publicada.';
    }
    let actualizados=0;
    for(const fila of state.db.series){
      if(Number(fila.anio)!==2026)continue;
      const v=tabla.get(normaliza(fila.nombre));
      if(v!==undefined){fila.valores=fila.valores||{};fila.valores.IAT_5=v;actualizados++;}
    }
    if(state.db.fuente){state.db.fuente.actualizado='2026-09-10';state.db.fuente.nota='IAT_5 2026 recalculado con NDVI promedio ponderado, fuente septiembre 2025; 2025 conserva la medición histórica.';}
    const status=document.getElementById('sourceStatus');
    if(status)status.textContent='Resultados normalizados: BBDD maestra · IAT_5 NDVI sep-2025 actualizado';
    if(typeof renderIndicators==='function')renderIndicators();
    if(typeof refresh==='function')refresh();
    console.info(`[GeoIndicadores] IAT_5 NDVI 2026 actualizado en ${actualizados} barrios.`);
  };
  aplicar();
})();
