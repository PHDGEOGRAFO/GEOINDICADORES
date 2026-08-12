const state={data:null,method:'minmax',inverse:false,territory:'all'};
const palette=[{name:'Muy bajo',max:.249,color:'#274c77'},{name:'Bajo',max:.499,color:'#4aa3a2'},{name:'Medio',max:.749,color:'#f2c14e'},{name:'Alto',max:1,color:'#ef6351'}];
let map;
const $=id=>document.getElementById(id);
const round=n=>Number(n).toLocaleString('es-CL',{maximumFractionDigits:2});
const numericValue=value=>value===null||value===undefined||value===''?null:Number(value);

function normalize(features){
  const values=features.map(f=>numericValue(f.properties.valor)).filter(Number.isFinite);
  if(!values.length){features.forEach(f=>{f.properties.normalizado=null;f.properties.rango='Sin datos'});return}
  const sorted=[...values].sort((a,b)=>a-b),min=Math.min(...values),max=Math.max(...values);
  features.forEach(f=>{
    const v=numericValue(f.properties.valor);
    if(!Number.isFinite(v)){f.properties.normalizado=null;f.properties.rango='Sin datos';return}
    let n=0;
    if(state.method==='percentile') n=values.length===1?1:sorted.lastIndexOf(v)/(values.length-1);
    else n=max===min?.5:(v-min)/(max-min);
    f.properties.normalizado=state.inverse?1-n:n;
    f.properties.rango=palette.find(p=>f.properties.normalizado<=p.max)?.name||'Alto';
  });
}
function visibleFeatures(){return state.data.features.filter(f=>state.territory==='all'||f.properties.territorio===state.territory)}
function colorExpression(){return ['step',['get','normalizado'],palette[0].color,.25,palette[1].color,.5,palette[2].color,.75,palette[3].color]}
function renderLegend(){$('legendItems').innerHTML=palette.map((p,i)=>`<div class="legend-row"><i class="swatch" style="background:${p.color}"></i><span>${p.name}</span><b>${i?palette[i-1].max.toFixed(2):'0.00'}–${p.max.toFixed(2)}</b></div>`).join('')}
function renderSummary(features){const vals=features.map(f=>numericValue(f.properties.valor)).filter(Number.isFinite);$('unitCount').textContent=features.length;$('averageValue').textContent=vals.length?round(vals.reduce((a,b)=>a+b,0)/vals.length):'–';$('maxValue').textContent=vals.length?round(Math.max(...vals)):'–';const counts={};features.filter(f=>f.properties.rango!=='Sin datos').forEach(f=>counts[f.properties.rango]=(counts[f.properties.rango]||0)+1);$('mainRange').textContent=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'–'}
function renderRanking(features){const rows=features.filter(f=>Number.isFinite(numericValue(f.properties.valor))).sort((a,b)=>numericValue(b.properties.valor)-numericValue(a.properties.valor)).slice(0,10),max=Math.max(...rows.map(f=>numericValue(f.properties.valor)),1);$('ranking').innerHTML=rows.map((f,i)=>`<div class="rank-row"><span>${i+1}. ${f.properties.barrio}</span><strong>${round(f.properties.valor)}</strong><div class="rank-track"><div class="rank-bar" style="width:${numericValue(f.properties.valor)/max*100}%"></div></div></div>`).join('')}
function refresh(){normalize(state.data.features);const visible=visibleFeatures();renderSummary(visible);renderRanking(visible);if(map?.getSource('barrios')){map.getSource('barrios').setData({type:'FeatureCollection',features:visible});map.setPaintProperty('barrios-fill','fill-color',colorExpression())}}
function setupFilters(){const territories=[...new Set(state.data.features.map(f=>f.properties.territorio))].sort();$('territorySelect').innerHTML='<option value="all">Todos</option>'+territories.map(t=>`<option>${t}</option>`).join('');$('territorySelect').addEventListener('change',e=>{state.territory=e.target.value;refresh()});$('methodSelect').addEventListener('change',e=>{state.method=e.target.value;refresh()});$('inverseCheck').addEventListener('change',e=>{state.inverse=e.target.checked;refresh()});$('resetButton').addEventListener('click',()=>{state.method='minmax';state.inverse=false;state.territory='all';$('territorySelect').value='all';$('methodSelect').value='minmax';$('inverseCheck').checked=false;refresh()})}
async function init(){renderLegend();try{state.data=await fetch('./data/barrios-demo.geojson').then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()});normalize(state.data.features);setupFilters();map=new maplibregl.Map({container:'map',style:'https://demotiles.maplibre.org/style.json',center:[-70.65,-33.45],zoom:12});map.addControl(new maplibregl.NavigationControl(),'top-right');map.on('load',()=>{map.addSource('barrios',{type:'geojson',data:state.data});map.addLayer({id:'barrios-fill',type:'fill',source:'barrios',paint:{'fill-color':colorExpression(),'fill-opacity':.7}});map.addLayer({id:'barrios-line',type:'line',source:'barrios',paint:{'line-color':'#e6f7ff','line-width':1.4}});map.on('click','barrios-fill',e=>{const p=e.features[0].properties;new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<strong>${p.barrio}</strong><br>${p.territorio}<br>Valor: ${round(p.valor)} m²/hab<br>Normalizado: ${round(p.normalizado)}<br>Rango: ${p.rango}`).addTo(map)});map.on('mouseenter','barrios-fill',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','barrios-fill',()=>map.getCanvas().style.cursor='');$('mapStatus').textContent='Datos demostrativos · EPSG:4326';refresh()});}catch(error){console.error(error);$('mapStatus').textContent='No fue posible cargar los datos demostrativos';}}
init();
