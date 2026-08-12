const $=id=>document.getElementById(id);
const palette=[
  {name:'Muy bajo',min:0,max:.249999,color:'#285784'},
  {name:'Bajo',min:.25,max:.499999,color:'#49a9a7'},
  {name:'Medio',min:.5,max:.749999,color:'#d4aa3d'},
  {name:'Alto',min:.75,max:1,color:'#e96c57'}
];
const layerFiles={
  manzana:['manzanas/NORPONIENTE.geojson','manzanas/SURPONIENTE.geojson','manzanas/NORORIENTE.geojson','manzanas/CENTRO_ORIENTE.geojson','manzanas/CENTRO_PONIENTE.geojson','manzanas/SURORIENTE.geojson'],
  barrio:['barrios.geojson'],territorio:['territorios.geojson'],comuna:['comuna.geojson']
};
const levelFields={manzana:'COD_MZN',barrio:'BARRIO',territorio:'TERRITORIO',comuna:'COMUNA'};
const state={db:null,layers:{},scale:'barrio',year:2026,compareYear:2025,selectedIndicators:[],selectedFeature:null,view:'ranking'};
let map;

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const fmt=v=>Number.isFinite(v)?v.toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2}):'–';
const indicatorByCode=code=>state.db.indicadores.find(i=>i.codigo===code);
const rangeFor=v=>Number.isFinite(v)?palette.find(p=>v>=p.min&&v<=p.max)??palette.at(-1):null;
const rowFor=(name,year)=>state.db.series.find(r=>r.anio===year&&norm(r.nombre)===norm(name));

function publishable(code,year){
  const m=indicatorByCode(code);
  return Boolean(m?.[`publicado_${year}`]);
}
function codesAvailable(){
  const prefixes=$('dimensionSelect').value;
  return state.db.indicadores.filter(i=>(prefixes==='all'||i.codigo.startsWith(prefixes))&&(publishable(i.codigo,state.year)||publishable(i.codigo,state.compareYear)));
}
function barrioValue(name,year){
  const row=rowFor(name,year),vals=state.selectedIndicators.map(c=>publishable(c,year)?Number(row?.valores?.[c]):NaN).filter(Number.isFinite);
  return vals.length===state.selectedIndicators.length&&vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
function featureValue(feature,scale=state.scale,year=state.year){
  if(!state.selectedIndicators.length)return null;
  if(scale==='barrio')return barrioValue(feature.properties.BARRIO,year);
  if(scale==='manzana')return null;
  const barrios=state.layers.barrio.features.filter(b=>scale==='comuna'||norm(b.properties.TERRITORIO)===norm(feature.properties.TERRITORIO));
  const vals=barrios.map(b=>barrioValue(b.properties.BARRIO,year)).filter(Number.isFinite);
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
function currentFeatures(){return state.layers[state.scale]?.features??[]}
function computedFeatures(){return currentFeatures().map(f=>({...f,properties:{...f.properties,GI_VAL:featureValue(f),GI_RANGO:rangeFor(featureValue(f))?.name??'Sin datos'}}))}

function renderIndicators(){
  const options=codesAvailable();
  state.selectedIndicators=state.selectedIndicators.filter(c=>options.some(i=>i.codigo===c));
  if(!state.selectedIndicators.length&&options.length)state.selectedIndicators=[options[0].codigo];
  $('indicatorList').innerHTML=options.map(i=>`<label class="indicator-option"><input type="checkbox" value="${i.codigo}" ${state.selectedIndicators.includes(i.codigo)?'checked':''}><span><b>${i.codigo}</b> · ${i.indicador}<small>${i.unidad??'Unidad no especificada'}</small></span></label>`).join('')||'<p class="note">No hay indicadores publicables en esta dimensión.</p>';
  $('indicatorList').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{
    state.selectedIndicators=[...$('indicatorList').querySelectorAll('input:checked')].map(x=>x.value);
    refresh();
  }));
  renderFormula();
}
function renderFormula(){
  const n=state.selectedIndicators.length;
  $('groupFormula').textContent=n>1?`Resultado agrupado: promedio simple de ${n} indicadores normalizados.`:n===1?'Resultado individual normalizado.':'Seleccione uno o varios indicadores.';
  $('valueLabel').textContent=n>1?'Promedio agrupado':'Valor normalizado';
}
function renderLegend(){$('legendItems').innerHTML=palette.map(p=>`<div class="legend-row"><i class="swatch" style="background:${p.color}"></i><span>${p.name}</span><b>${p.min.toFixed(2)}–${p.max.toFixed(2)}</b></div>`).join('')}

function refreshMap(){
  const fc={type:'FeatureCollection',features:computedFeatures()};
  if(!map){$('mapStatus').textContent=`${fc.features.length.toLocaleString('es-CL')} unidades cargadas · mapa no disponible`;return}
  if(map.getSource('territorial'))map.getSource('territorial').setData(fc);
  $('mapStatus').textContent=`${fc.features.length.toLocaleString('es-CL')} ${state.scale}${fc.features.length===1?'':'s'} · WGS84`;
}
function renderCards(){
  const features=computedFeatures(),valid=features.map(f=>f.properties.GI_VAL).filter(Number.isFinite),avg=valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null;
  const selected=state.selectedFeature?features.find(f=>norm(f.properties[levelFields[state.scale]])===norm(state.selectedFeature.properties[levelFields[state.scale]])):null;
  const value=selected?.properties.GI_VAL,sorted=[...valid].sort((a,b)=>b-a),rank=Number.isFinite(value)?sorted.findIndex(v=>v===value)+1:null;
  const name=selected?.properties[levelFields[state.scale]]??'Seleccione una unidad';
  $('selectedValue').textContent=fmt(value);$('selectedName').textContent=name;
  $('scaleAverage').textContent=fmt(avg);$('validCount').textContent=`${valid.length} de ${features.length} unidades con resultado`;
  $('rankValue').textContent=rank?`${rank}°`:'–';$('rankDetail').textContent=rank?`de ${valid.length} unidades válidas`:'Dentro de la escala';
  $('rangeValue').textContent=rangeFor(value)?.name??'Sin datos';
  const old=selected?featureValue(selected,state.scale,state.compareYear):null;
  $('changeValue').textContent=Number.isFinite(value)&&Number.isFinite(old)?`Variación ${state.compareYear}–${state.year}: ${value-old>=0?'+':''}${fmt(value-old)}`:'Variación anual: no disponible';
  $('contextUnit').textContent=name;
  renderHierarchy(selected);
}
function aggregateFor(level,name,year){
  if(level==='barrio'){const f=state.layers.barrio.features.find(x=>norm(x.properties.BARRIO)===norm(name));return f?featureValue(f,'barrio',year):null}
  if(level==='territorio'){const f=state.layers.territorio.features.find(x=>norm(x.properties.TERRITORIO)===norm(name));return f?featureValue(f,'territorio',year):null}
  const f=state.layers.comuna.features[0];return f?featureValue(f,'comuna',year):null;
}
function renderHierarchy(feature){
  if(!feature){$('hierarchyValues').innerHTML='<span class="note">Haz clic en el mapa para ver el contexto jerárquico.</span>';return}
  const p=feature.properties,items=[];
  if(state.scale==='manzana')items.push(['Manzana',p.COD_MZN,null]);
  if(['manzana','barrio'].includes(state.scale))items.push(['Barrio',p.BARRIO,aggregateFor('barrio',p.BARRIO,state.year)]);
  if(state.scale!=='comuna')items.push(['Territorio',p.TERRITORIO,aggregateFor('territorio',p.TERRITORIO,state.year)]);
  items.push(['Comuna','SANTIAGO',aggregateFor('comuna','SANTIAGO',state.year)]);
  $('hierarchyValues').innerHTML=items.map(([level,name,value])=>`<div class="context-pill"><span>${level}</span><strong>${name}</strong><b>${fmt(value)}</b></div>`).join('');
}

function renderChart(){
  const title={ranking:'Ranking territorial',ranges:'Distribución por rangos',trend:'Comparación temporal',hierarchy:'Comparación jerárquica'}[state.view];$('chartTitle').textContent=title;
  ({ranking:renderRanking,ranges:renderRanges,trend:renderTrend,hierarchy:renderHierarchyChart}[state.view])();
}
function renderRanking(){
  const rows=computedFeatures().filter(f=>Number.isFinite(f.properties.GI_VAL)).sort((a,b)=>b.properties.GI_VAL-a.properties.GI_VAL);
  const shown=state.scale==='manzana'?rows.slice(0,10):rows;
  $('chart').innerHTML=shown.map((f,i)=>`<div class="bar-row"><span>${i+1}. ${f.properties[levelFields[state.scale]]}</span><b>${fmt(f.properties.GI_VAL)}</b><div class="bar-track"><div class="bar-fill" style="width:${f.properties.GI_VAL*100}%"></div></div></div>`).join('')||'<p class="note">No existen resultados para esta escala.</p>';
}
function renderRanges(){
  const vals=computedFeatures().map(f=>f.properties.GI_VAL).filter(Number.isFinite),counts=palette.map(p=>vals.filter(v=>rangeFor(v)?.name===p.name).length),total=vals.length;
  $('chart').innerHTML=total?`<div class="range-stack">${palette.map((p,i)=>`<div class="range-segment" title="${p.name}: ${counts[i]}" style="width:${counts[i]/total*100}%;background:${p.color}">${counts[i]||''}</div>`).join('')}</div><div class="range-detail">${palette.map((p,i)=>`<div class="legend-row"><i class="swatch" style="background:${p.color}"></i><span>${p.name}</span><b>${counts[i]} · ${fmt(counts[i]/total*100)}%</b></div>`).join('')}</div>`:'<p class="note">No existen resultados para distribuir.</p>';
}
function renderTrend(){
  const feature=state.selectedFeature;if(!feature){$('chart').innerHTML='<p class="note">Seleccione una unidad en el mapa.</p>';return}
  const a=featureValue(feature,state.scale,2025),b=featureValue(feature,state.scale,2026);
  if(!Number.isFinite(a)||!Number.isFinite(b)){$('chart').innerHTML='<p class="note">La comparación exige resultados válidos en ambos años.</p>';return}
  const y=v=>205-v*165;$('chart').innerHTML=`<svg class="trend-svg" viewBox="0 0 300 240"><line x1="45" y1="205" x2="270" y2="205" stroke="#36506a"/><line x1="85" y1="${y(a)}" x2="230" y2="${y(b)}" stroke="#20c6c7" stroke-width="4"/><circle cx="85" cy="${y(a)}" r="7" fill="#337ce5"/><circle cx="230" cy="${y(b)}" r="7" fill="#20c6c7"/><text x="70" y="225" class="trend-label">2025</text><text x="215" y="225" class="trend-label">2026</text><text x="68" y="${y(a)-12}" class="trend-label">${fmt(a)}</text><text x="213" y="${y(b)-12}" class="trend-label">${fmt(b)}</text></svg>`;
}
function renderHierarchyChart(){
  const f=state.selectedFeature;if(!f){$('chart').innerHTML='<p class="note">Seleccione una unidad en el mapa.</p>';return}
  const p=f.properties,items=[];
  if(['manzana','barrio'].includes(state.scale))items.push(['Barrio',aggregateFor('barrio',p.BARRIO,state.year)]);
  if(state.scale!=='comuna')items.push(['Territorio',aggregateFor('territorio',p.TERRITORIO,state.year)]);
  items.push(['Comuna',aggregateFor('comuna','SANTIAGO',state.year)]);
  $('chart').innerHTML=items.map(([n,v])=>`<div class="hierarchy-row"><span>${n}</span><div class="bar-track"><div class="bar-fill" style="width:${Number.isFinite(v)?v*100:0}%"></div></div><b>${fmt(v)}</b></div>`).join('');
}

function openMethod(){
  const selected=state.selectedIndicators.map(indicatorByCode).filter(Boolean);
  $('dialogContent').innerHTML=`<h2>Ficha resumida</h2><p class="note">Información publicada exclusivamente desde las hojas 2025 y 2026 de Síntesis 2.</p>${selected.map(i=>`<h3>${i.codigo} · ${i.indicador}</h3><dl class="dialog-grid"><dt>Unidad</dt><dd>${i.unidad??'–'}</dd><dt>Resultado 2025</dt><dd>${i.publicado_2025?'Disponible':'No disponible'}</dd><dt>Resultado 2026</dt><dd>${i.publicado_2026?'Disponible':'No disponible'}</dd></dl>`).join('')}${selected.length>1?`<h3>Resultado agrupado</h3><p>Promedio simple de ${selected.length} resultados normalizados. Si falta uno de los componentes, el promedio queda sin datos.</p>`:''}`;$('infoDialog').showModal();
}
function openReport(){
  const f=state.selectedFeature,name=f?.properties[levelFields[state.scale]]??'Sin unidad seleccionada',value=f?featureValue(f):null,old=f?featureValue(f,state.scale,state.compareYear):null;
  $('dialogContent').innerHTML=`<h2>Reporte comparativo</h2><p><b>${name}</b> · ${state.scale} · ${state.year}</p><table class="report-table"><tr><th>Indicadores</th><td>${state.selectedIndicators.join(', ')||'Sin selección'}</td></tr><tr><th>Resultado actual</th><td>${fmt(value)}</td></tr><tr><th>Resultado ${state.compareYear}</th><td>${fmt(old)}</td></tr><tr><th>Variación</th><td>${Number.isFinite(value)&&Number.isFinite(old)?fmt(value-old):'No comparable'}</td></tr><tr><th>Rango actual</th><td>${rangeFor(value)?.name??'Sin datos'}</td></tr><tr><th>Método agrupado</th><td>${state.selectedIndicators.length>1?'Promedio simple de resultados normalizados':'Indicador individual'}</td></tr></table><p class="note">Fuente pública: resultados normalizados de las hojas 2025 y 2026 de Síntesis 2. No se publican cálculos ni capas específicas de indicadores.</p>`;$('infoDialog').showModal();
}

function bind(){
  $('scaleSelect').addEventListener('change',e=>{state.scale=e.target.value;state.selectedFeature=null;refresh()});
  $('yearSelect').addEventListener('change',e=>{state.year=Number(e.target.value);renderIndicators();refresh()});
  $('compareYearSelect').addEventListener('change',e=>{state.compareYear=Number(e.target.value);refresh()});
  $('dimensionSelect').addEventListener('change',renderIndicators);
  $('clearIndicators').addEventListener('click',()=>{state.selectedIndicators=[];renderIndicators();refresh()});
  document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.view=b.dataset.view;renderChart()}));
  $('methodButton').addEventListener('click',openMethod);$('reportButton').addEventListener('click',openReport);
  document.querySelector('.close-dialog').addEventListener('click',()=>$('infoDialog').close());
}
function refresh(){renderFormula();refreshMap();renderCards();renderChart()}

async function init(){
  renderLegend();bind();
  const db=await fetch('./data/sintesis-visor.json').then(r=>r.json());state.db=db;
  for(const [level,files] of Object.entries(layerFiles)){
    const parts=await Promise.all(files.map(f=>fetch(`./data/${f}`).then(r=>r.json())));
    state.layers[level]={type:'FeatureCollection',features:parts.flatMap(p=>p.features)};
  }
  $('sourceStatus').textContent='Resultados: Síntesis 2 · 2025 y 2026';renderIndicators();
  try{map=new maplibregl.Map({container:'map',style:{version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap'}},layers:[{id:'osm',type:'raster',source:'osm',paint:{'raster-saturation':-0.75,'raster-brightness-max':0.55}}]},center:[-70.653,-33.451],zoom:12.5});
  map.addControl(new maplibregl.NavigationControl(),'top-right');
  map.on('load',()=>{map.addSource('territorial',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'territorial-fill',type:'fill',source:'territorial',paint:{'fill-color':['match',['get','GI_RANGO'],'Muy bajo',palette[0].color,'Bajo',palette[1].color,'Medio',palette[2].color,'Alto',palette[3].color,'#607486'],'fill-opacity':.72}});map.addLayer({id:'territorial-line',type:'line',source:'territorial',paint:{'line-color':'#e8f7ff','line-width':['case',['boolean',['feature-state','selected'],false],3,1]}});map.on('click','territorial-fill',e=>{state.selectedFeature=e.features[0];renderCards();renderChart();const p=e.features[0].properties,name=p[levelFields[state.scale]],v=featureValue(state.selectedFeature);new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<strong>${name}</strong><br>${state.scale}<br>Resultado: ${fmt(v)}<br>Rango: ${rangeFor(v)?.name??'Sin datos'}`).addTo(map)});map.on('mouseenter','territorial-fill',()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave','territorial-fill',()=>map.getCanvas().style.cursor='');refresh()});}
  catch(error){console.error(error);map=null;$('mapStatus').textContent='Mapa no disponible en este navegador';renderCards();renderChart()}
}
init().catch(error=>{console.error(error);$('sourceStatus').textContent='Error al cargar la base';$('mapStatus').textContent='No fue posible iniciar el visor';});
