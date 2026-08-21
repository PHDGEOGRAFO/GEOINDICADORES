(() => {
  const loadTurf = () => new Promise((resolve,reject)=>{
    if (window.turf) return resolve();
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js';
    s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });

  function dissolved(fc, propertyName, fallbackValue){
    const flat=turf.flatten(fc);
    flat.features.forEach(f=>{f.properties={...f.properties}; if(fallbackValue) f.properties[propertyName]=fallbackValue;});
    return turf.dissolve(flat,{propertyName});
  }

  async function install(){
    try{
      if(typeof map==='undefined'||!map||typeof state==='undefined'||!state?.layers?.barrio||!state?.layers?.territorio||!state?.layers?.comuna||!map.isStyleLoaded()){
        setTimeout(install,300); return;
      }
      if(document.getElementById('gi-layer-box')) return;
      await loadTurf();

      const barrios=dissolved(state.layers.barrio,'BARRIO');
      const territorios=dissolved(state.layers.territorio,'TERRITORIO');
      const comuna=dissolved(state.layers.comuna,'COMUNA','SANTIAGO');

      if(map.getLayer('territorial-line')) map.setLayoutProperty('territorial-line','visibility','none');

      const add=(id,data,paint,visible)=>{
        if(!map.getSource(id)) map.addSource(id,{type:'geojson',data});
        if(!map.getLayer(id+'-line')) map.addLayer({id:id+'-line',type:'line',source:id,layout:{visibility:visible?'visible':'none'},paint});
      };
      add('limites-barrios',barrios,{'line-color':'#15202b','line-width':1.7,'line-opacity':0.95},true);
      add('limites-territorios',territorios,{'line-color':'#ffffff','line-width':3.2,'line-opacity':0.95},false);
      add('limite-comunal',comuna,{'line-color':'#ffdf6c','line-width':3.4,'line-opacity':1},true);

      const host=document.querySelector('.map-panel');
      const box=document.createElement('div');
      box.id='gi-layer-box'; box.className='gi-layer-box';
      box.innerHTML='<strong>Capas permanentes del mapa</strong><label><input data-layer="limites-barrios-line" type="checkbox" checked> Barrios</label><label><input data-layer="limites-territorios-line" type="checkbox"> Territorios</label><label><input data-layer="limite-comunal-line" type="checkbox" checked> Comuna</label>';
      host.appendChild(box);
      box.querySelectorAll('input[data-layer]').forEach(input=>input.addEventListener('change',()=>map.setLayoutProperty(input.dataset.layer,'visibility',input.checked?'visible':'none')));
    }catch(e){console.error('Capas permanentes:',e); setTimeout(install,1200);}
  }
  window.addEventListener('load',()=>setTimeout(install,500));
})();
