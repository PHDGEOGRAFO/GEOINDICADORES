(() => {
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
      const host=document.querySelector('.map-panel'),box=document.createElement('div');box.id='gi-layer-box';box.className='gi-layer-box';box.innerHTML='<strong>Capas permanentes del mapa</strong><label><input data-layer="limites-barrios-line" type="checkbox" checked> Barrios</label><label><input data-layer="limites-territorios-line" type="checkbox"> Territorios</label><label><input data-layer="limite-comunal-line" type="checkbox"> Comuna</label><label><input data-layer="limites-manzanas-line" type="checkbox"> Manzanas</label>';host.appendChild(box);
      box.querySelectorAll('input[data-layer]').forEach(input=>input.addEventListener('change',()=>{if(map.getLayer(input.dataset.layer))map.setLayoutProperty(input.dataset.layer,'visibility',input.checked?'visible':'none');else input.checked=false;}));
      if(typeof refresh==='function')refresh();else if(typeof refreshMap==='function')refreshMap();
    }catch(e){console.error('Error cargando límites oficiales:',e);setTimeout(install,1200);}
  }
  window.addEventListener('load',()=>setTimeout(install,400));
})();