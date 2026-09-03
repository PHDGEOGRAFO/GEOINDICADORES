(() => {
  const manzanaFiles={
    '2025':{
      IAT_1:'2025-IAT_1.b64',
      IAT_3:'2025-IAT_3.b64',
      IUT_4:'2026-IUT_4.b64',
      IUT_5:'2025-IUT_5.b64',
      IUT_8:'2026-IUT_8.b64'
    },
    '2026':{
      IAT_5:'2026-IAT_5.b64',
      IAT_9:'2026-IAT_9.b64',
      IUT_4:'2026-IUT_4.b64',
      IUT_5:'2026-IUT_5.b64',
      IUT_8:'2026-IUT_8.b64'
    }
  };
  const manzanaCache=Object.create(null),manzanaPromises=Object.create(null);

  async function cargarBloqueManzana(year,code){
    const key=`${year}:${code}`;
    if(Object.prototype.hasOwnProperty.call(manzanaCache,key))return manzanaCache[key];
    if(manzanaPromises[key])return manzanaPromises[key];
    const file=manzanaFiles?.[String(year)]?.[code];
    if(!file){manzanaCache[key]=null;return null;}
    manzanaPromises[key]=(async()=>{
      const response=await fetch(`data/manzana-valores/${file}?v=1.0.2`);
      if(!response.ok)throw new Error(`${file} HTTP ${response.status}`);
      const base64=(await response.text()).trim();
      const raw=atob(base64),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const values=JSON.parse(await new Response(stream).text());
      manzanaCache[key]=values;
      delete manzanaPromises[key];
      return values;
    })().catch(error=>{delete manzanaPromises[key];throw error;});
    return manzanaPromises[key];
  }

  async function prepararManzanaSeleccionada(){
    if(typeof state==='undefined'||state.scale!=='manzana')return;
    const current=state.selectedIndicators.map(code=>cargarBloqueManzana(state.year,code));
    const compare=state.compareYear?state.selectedIndicators.map(code=>cargarBloqueManzana(state.compareYear,code)):[];
    await Promise.all([...current,...compare]);
  }

  function habilitarResultadosManzana(){
    if(typeof state==='undefined'||window.__geoIndicadoresManzanaInstalled)return;
    if(!('DecompressionStream' in window)){
      console.warn('Escala manzana no habilitada: navegador sin soporte de DecompressionStream');
      return;
    }
    window.__geoIndicadoresManzanaInstalled=true;
    state.manzanaDB={files:manzanaFiles,cache:manzanaCache};

    const featureValueOriginal=featureValue;
    featureValue=function(feature,scale=state.scale,year=state.year){
      if(scale!=='manzana')return featureValueOriginal(feature,scale,year);
      if(!state.selectedIndicators.length||!feature)return null;
      const cod=String(feature.properties?.COD_MZN??'');
      const vals=state.selectedIndicators.map(code=>{
        const block=manzanaCache[`${year}:${code}`],value=block?.[cod];
        return value===null||value===undefined||value===''?NaN:Number(value);
      }).filter(Number.isFinite);
      return vals.length===state.selectedIndicators.length&&vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
    };

    const codesAvailableOriginal=codesAvailable;
    codesAvailable=function(){
      if(state.scale!=='manzana')return codesAvailableOriginal();
      const current=manzanaFiles[String(state.year)]||{},compare=state.compareYear?manzanaFiles[String(state.compareYear)]||{}:{};
      return state.db.indicadores.filter(i=>state.selectedDimensions.some(p=>i.codigo.startsWith(p))&&Boolean(current[i.codigo]||compare[i.codigo]));
    };

    const analysisForOriginal=analysisFor;
    analysisFor=function(feature){
      if(state.scale!=='manzana')return analysisForOriginal(feature);
      if(!feature)return 'Seleccione una manzana censal para generar el análisis.';
      const name=feature.properties.COD_MZN,m=metrics(feature),range=rangeFor(m.value);
      if(!Number.isFinite(m.value))return `La manzana censal ${name} no dispone de un resultado completo para la selección actual.`;
      const relation=Math.abs(m.value-m.avg)<.005?'prácticamente igual al':m.value>m.avg?'sobre el':'bajo el';
      let text=`La manzana censal ${name} obtiene un resultado normalizado de ${fmt(m.value)}, correspondiente al rango ${range.name}. El resultado está ${relation} promedio de las manzanas con datos (${fmt(m.avg)}) y ocupa la posición ${m.rank} de ${m.values.length}.`;
      if(state.compareYear){const old=featureValue(feature,'manzana',state.compareYear);text+=Number.isFinite(old)?` Frente a ${state.compareYear}, la variación es ${m.value-old>=0?'+':''}${fmt(m.value-old)} puntos normalizados.`:` No existe un resultado completo para compararlo con ${state.compareYear}.`;}
      if(state.selectedIndicators.some(c=>inverseCodes.has(c)))text+=' La interpretación considera variables con normalización inversa, ya transformadas para que un mayor resultado normalizado exprese una condición más favorable.';
      return text;
    };

    const renderHierarchyOriginal=renderHierarchy;
    renderHierarchy=function(feature){
      if(state.scale!=='manzana')return renderHierarchyOriginal(feature);
      if(!feature){$('hierarchyValues').innerHTML='<span class="note">Haz clic en una manzana para ver su contexto territorial.</span>';return;}
      const p=feature.properties,territorio=territorioDePropiedades(p),items=[
        ['Manzana',p.COD_MZN,featureValue(feature,'manzana',state.year)],
        ['Barrio',p.BARRIO,aggregateFor('barrio',p.BARRIO,state.year)],
        ['Territorio',territorio,aggregateFor('territorio',territorio,state.year)],
        ['Comuna','SANTIAGO',aggregateFor('comuna','SANTIAGO',state.year)]
      ];
      $('hierarchyValues').innerHTML=items.map(([level,name,value])=>`<div class="context-pill"><span>${level}</span><strong>${esc(name??'Sin dato')}</strong><b>${fmt(value)}</b></div>`).join('');
    };

    const selectedTerritorialNamesOriginal=selectedTerritorialNames;
    selectedTerritorialNames=function(){
      if(state.scale==='manzana'&&state.selectedFeature)return[state.selectedFeature.properties.BARRIO];
      return selectedTerritorialNamesOriginal();
    };

    const openReportOriginal=openReport;
    openReport=function(){
      openReportOriginal();
      if(state.scale!=='manzana')return;
      [...document.querySelectorAll('#dialogContent tr')].forEach(row=>{
        if(row.querySelector('th')?.textContent.trim()==='Agregación'){
          row.querySelector('td').textContent=state.selectedIndicators.length>1?'Promedio simple de resultados normalizados disponibles en la manzana':'Indicador individual a nivel de manzana';
        }
      });
    };

    const refreshOriginal=refresh;let refreshToken=0;
    refresh=function(){
      if(state.scale!=='manzana'){refreshOriginal();return;}
      const token=++refreshToken;
      if($('mapStatus'))$('mapStatus').textContent='Cargando resultados de manzana…';
      prepararManzanaSeleccionada().then(()=>{if(token===refreshToken)refreshOriginal();}).catch(error=>{
        console.error('Error cargando resultados por manzana',error);
        if(token===refreshToken){if($('mapStatus'))$('mapStatus').textContent='No fue posible cargar el indicador por manzana';refreshOriginal();}
      });
    };

    const scaleSelect=document.getElementById('scaleSelect'),option=scaleSelect?.querySelector('option[value="manzana"]');
    if(option){option.disabled=false;option.textContent='Manzana censal';}
    scaleSelect?.addEventListener('change',()=>setTimeout(()=>{renderIndicators();refresh();},0));
  }

  async function install(){
    if(typeof map==='undefined'||!map||!map.isStyleLoaded()){setTimeout(install,300);return;}
    if(document.getElementById('gi-layer-box'))return;
    try{
      const [barrios,territorios,comuna]=await Promise.all([
        fetch('data/limite_barrios.geojson?v=0.9.10').then(r=>r.json()),
        fetch('data/limite_territorios_pladeco.geojson?v=0.9.10').then(r=>r.json()),
        fetch('data/limite_comuna.geojson?v=0.9.10').then(r=>r.json())
      ]);
      territorios.features.forEach(f=>{f.properties.TERRITORIO=f.properties.TERRITORIO||f.properties.SECTORES_T;});
      barrios.features.forEach(f=>{if(f.properties.BARRIO==='JUDICIAL')f.properties.BARRIO='RONDIZZONI';if(f.properties.BARRIO==='UNIVERSITARIO')f.properties.BARRIO='REPÚBLICA';if(f.properties.BARRIO==='CASCO HISTÓRICO')f.properties.BARRIO='CENTRO HISTÓRICO';});
      if(typeof state!=='undefined'&&state.layers){state.layers.barrio=barrios;state.layers.territorio=territorios;state.layers.comuna=comuna;}
      if(map.getLayer('territorial-line'))map.setLayoutProperty('territorial-line','visibility','none');
      const add=(id,data,paint,visible)=>{if(map.getLayer(id+'-line'))map.removeLayer(id+'-line');if(map.getSource(id))map.removeSource(id);map.addSource(id,{type:'geojson',data});map.addLayer({id:id+'-line',type:'line',source:id,layout:{visibility:visible?'visible':'none'},paint});};
      add('limites-barrios',barrios,{'line-color':'#17202a','line-width':2,'line-opacity':1},true);
      add('limites-territorios',territorios,{'line-color':'#ffffff','line-width':3.4,'line-opacity':1},false);
      add('limite-comunal',comuna,{'line-color':'#ffdf6c','line-width':3.6,'line-opacity':1},false);
      try{
        let mz;
        const canonical=await fetch('data/limite_manzana_censal.geojson?v=0.9.10');
        if(canonical.ok){mz=await canonical.json();}
        else{
          const files=['NORPONIENTE.geojson','SURPONIENTE.geojson','NORORIENTE.geojson','CENTRO_ORIENTE.geojson','CENTRO_PONIENTE.geojson','SURORIENTE.geojson'];
          const partes=await Promise.all(files.map(f=>fetch('data/manzanas/'+f+'?v=0.9.10').then(r=>{if(!r.ok)throw new Error(f+' HTTP '+r.status);return r.json();})));
          mz={type:'FeatureCollection',features:partes.flatMap(fc=>fc.features||[])};
        }
        add('limites-manzanas',mz,{'line-color':'#8ca0b3','line-width':0.65,'line-opacity':0.65},false);
      }catch(e){console.warn('No fue posible cargar límites de manzana',e);}
      habilitarResultadosManzana();
      const host=document.querySelector('.map-panel'),box=document.createElement('div');box.id='gi-layer-box';box.className='gi-layer-box';box.innerHTML='<strong>Capas permanentes del mapa</strong><label><input data-layer="limites-barrios-line" type="checkbox" checked> Barrios</label><label><input data-layer="limites-territorios-line" type="checkbox"> Territorios</label><label><input data-layer="limite-comunal-line" type="checkbox"> Comuna</label><label><input data-layer="limites-manzanas-line" type="checkbox"> Manzanas</label>';host.appendChild(box);
      box.querySelectorAll('input[data-layer]').forEach(input=>input.addEventListener('change',()=>{if(map.getLayer(input.dataset.layer))map.setLayoutProperty(input.dataset.layer,'visibility',input.checked?'visible':'none');else input.checked=false;}));
      if(typeof refresh==='function')refresh();else if(typeof refreshMap==='function')refreshMap();
    }catch(e){console.error('Error cargando límites oficiales:',e);setTimeout(install,1200);}
  }
  window.addEventListener('load',()=>setTimeout(install,400));
})();