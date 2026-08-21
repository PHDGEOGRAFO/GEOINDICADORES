(() => {
  function decodePolyline(str,precision=5){let index=0,lat=0,lng=0,coords=[],factor=10**precision;while(index<str.length){let b,shift=0,result=0;do{b=str.charCodeAt(index++)-63;result|=(b&31)<<shift;shift+=5;}while(b>=32);lat+=(result&1)?~(result>>1):(result>>1);shift=0;result=0;do{b=str.charCodeAt(index++)-63;result|=(b&31)<<shift;shift+=5;}while(b>=32);lng+=(result&1)?~(result>>1):(result>>1);coords.push([lng/factor,lat/factor]);}return coords;}
  function toGeoJSON(items){return {type:'FeatureCollection',features:items.flatMap(item=>item.g.map(poly=>({type:'Feature',properties:item.p,geometry:{type:'Polygon',coordinates:poly.map(r=>decodePolyline(r))}})))};}
  async function install(){
    if(typeof map==='undefined'||!map||!map.isStyleLoaded()||!window.GI_OFFICIAL_BOUNDARIES){setTimeout(install,300);return;}
    if(document.getElementById('gi-layer-box'))return;
    const o=window.GI_OFFICIAL_BOUNDARIES;
    const layers={barrios:toGeoJSON(o.barrios),territorios:toGeoJSON(o.territorios),comuna:toGeoJSON(o.comuna)};
    if(map.getLayer('territorial-line'))map.setLayoutProperty('territorial-line','visibility','none');
    const add=(id,data,paint,visible)=>{if(map.getLayer(id+'-line'))map.removeLayer(id+'-line');if(map.getSource(id))map.removeSource(id);map.addSource(id,{type:'geojson',data});map.addLayer({id:id+'-line',type:'line',source:id,layout:{visibility:visible?'visible':'none'},paint});};
    add('limites-barrios',layers.barrios,{'line-color':'#17202a','line-width':2,'line-opacity':1},true);
    add('limites-territorios',layers.territorios,{'line-color':'#ffffff','line-width':3.4,'line-opacity':1},false);
    add('limite-comunal',layers.comuna,{'line-color':'#ffdf6c','line-width':3.6,'line-opacity':1},false);
    try{const mz=await fetch('data/manzanas-limite.geojson?v=0.9.7').then(r=>r.ok?r.json():Promise.reject());add('limites-manzanas',mz,{'line-color':'#8ca0b3','line-width':0.65,'line-opacity':0.65},false);}catch(e){console.warn('Límite manzana aún no publicado');}
    const host=document.querySelector('.map-panel'),box=document.createElement('div');box.id='gi-layer-box';box.className='gi-layer-box';box.innerHTML='<strong>Capas permanentes del mapa</strong><label><input data-layer="limites-barrios-line" type="checkbox" checked> Barrios</label><label><input data-layer="limites-territorios-line" type="checkbox"> Territorios</label><label><input data-layer="limite-comunal-line" type="checkbox"> Comuna</label><label><input data-layer="limites-manzanas-line" type="checkbox"> Manzanas</label>';host.appendChild(box);
    box.querySelectorAll('input[data-layer]').forEach(input=>input.addEventListener('change',()=>{if(map.getLayer(input.dataset.layer))map.setLayoutProperty(input.dataset.layer,'visibility',input.checked?'visible':'none');else input.checked=false;}));
  }
  window.addEventListener('load',()=>setTimeout(install,400));
})();