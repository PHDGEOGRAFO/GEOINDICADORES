(() => {
  function decodePolyline(str,precision=5){
    let index=0,lat=0,lng=0,coords=[],factor=Math.pow(10,precision);
    while(index<str.length){
      let b,shift=0,result=0;
      do{b=str.charCodeAt(index++)-63;result|=(b&31)<<shift;shift+=5;}while(b>=32);
      lat+=(result&1)?~(result>>1):(result>>1);
      shift=0;result=0;
      do{b=str.charCodeAt(index++)-63;result|=(b&31)<<shift;shift+=5;}while(b>=32);
      lng+=(result&1)?~(result>>1):(result>>1);
      coords.push([lng/factor,lat/factor]);
    }
    return coords;
  }
  function toGeoJSON(items,property){
    return {type:'FeatureCollection',features:items.map(([name,rings])=>({type:'Feature',properties:{[property]:name},geometry:{type:'Polygon',coordinates:rings.map(decodePolyline)}}))};
  }
  function install(){
    if(typeof map==='undefined'||!map||!map.isStyleLoaded()||!window.GI_OFFICIAL_BOUNDARIES){setTimeout(install,300);return;}
    if(document.getElementById('gi-layer-box'))return;

    const official=window.GI_OFFICIAL_BOUNDARIES;
    const layers={
      barrios:toGeoJSON(official.barrios,'BARRIO'),
      territorios:toGeoJSON(official.territorios,'SECTORES_T'),
      comuna:toGeoJSON(official.comuna,'COMUNA')
    };
    if(map.getLayer('territorial-line'))map.setLayoutProperty('territorial-line','visibility','none');

    const add=(id,data,paint,visible)=>{
      if(map.getLayer(id+'-line'))map.removeLayer(id+'-line');
      if(map.getSource(id))map.removeSource(id);
      map.addSource(id,{type:'geojson',data});
      map.addLayer({id:id+'-line',type:'line',source:id,layout:{visibility:visible?'visible':'none'},paint});
    };
    add('limites-barrios',layers.barrios,{'line-color':'#15202b','line-width':1.8,'line-opacity':.95},true);
    add('limites-territorios',layers.territorios,{'line-color':'#ffffff','line-width':3.2,'line-opacity':.95},false);
    add('limite-comunal',layers.comuna,{'line-color':'#ffdf6c','line-width':3.5,'line-opacity':1},true);

    const host=document.querySelector('.map-panel');
    const box=document.createElement('div');box.id='gi-layer-box';box.className='gi-layer-box';
    box.innerHTML='<strong>Capas permanentes del mapa</strong><label><input data-layer="limites-barrios-line" type="checkbox" checked> Barrios</label><label><input data-layer="limites-territorios-line" type="checkbox"> Territorios</label><label><input data-layer="limite-comunal-line" type="checkbox" checked> Comuna</label>';
    host.appendChild(box);
    box.querySelectorAll('input[data-layer]').forEach(input=>input.addEventListener('change',()=>map.setLayoutProperty(input.dataset.layer,'visibility',input.checked?'visible':'none')));
  }
  window.addEventListener('load',()=>setTimeout(install,400));
})();
