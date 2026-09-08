// Ajustes metodológicos 08-09-2026
// Regla común: 0 = condición más desfavorable; 1 = condición óptima/más favorable.
// Barrio: valor oficial único.
// Territorio: valor real territorial principal + promedio de barrios sólo como referencia secundaria.
// Comuna: valor comunal real/oficial; nunca se reemplaza por promedio de barrios o territorios.

inverseCodes.add('IST_7');
inverseCodes.add('IAT_6');
state.selectedDimensions=state.selectedDimensions.filter(d=>d!=='IIT');

let territorialRealDb={series:[]};
let comunalRealDb={series:[]};
fetch('./data/territorial-real.json?v=1.1.0').then(r=>r.ok?r.json():{series:[]}).then(db=>{territorialRealDb=db||{series:[]};if(typeof refresh==='function')refresh()}).catch(()=>{});
fetch('./data/comunal-real.json?v=1.0.0').then(r=>r.ok?r.json():{series:[]}).then(db=>{comunalRealDb=db||{series:[]};if(typeof refresh==='function')refresh()}).catch(()=>{});

const pressureCodesToFlip=new Set(['IAT_6']);
function adjustedIndicatorValue(code,raw){if(!Number.isFinite(raw))return NaN;return pressureCodesToFlip.has(code)?1-raw:raw;}
function uniformDirectionText(i){
  if(i.codigo==='IAT_6')return 'Normalización inversa de presión: una mayor presión animal expresa mayor déficit relativo de área verde. El resultado se transforma para mantener la regla general: 0 = condición más desfavorable y 1 = condición óptima o más favorable.';
  if(inverseCodes.has(i.codigo))return 'Normalización inversa: el fenómeno original representa una condición desfavorable cuando aumenta. El resultado ya está transformado para mantener la regla general: 0 = condición más desfavorable y 1 = condición óptima o más favorable.';
  return 'Normalización directa: un resultado mayor representa una condición más favorable. Regla general: 0 = condición más desfavorable y 1 = condición óptima o más favorable.';
}

barrioValue=function(name,year){
  const row=rowFor(name,year);
  const vals=state.selectedIndicators.map(c=>publishable(c,year)?adjustedIndicatorValue(c,Number(row?.valores?.[c])):NaN).filter(Number.isFinite);
  return vals.length===state.selectedIndicators.length&&vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
};

function territoryAverageValue(feature,year){
  if(!feature||!state.selectedIndicators.length)return null;
  const territory=territorioDePropiedades(feature.properties);
  const barrios=state.layers.barrio?.features?.filter(b=>norm(territorioDePropiedades(b.properties))===norm(territory))||[];
  const vals=barrios.map(b=>barrioValue(b.properties.BARRIO,year)).filter(Number.isFinite);
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
function territorialRealValue(feature,year){
  if(!feature||!state.selectedIndicators.length)return null;
  const territory=territorioDePropiedades(feature.properties);
  const row=(territorialRealDb.series||[]).find(r=>Number(r.anio)===Number(year)&&norm(r.territorio)===norm(territory));
  if(!row)return null;
  const vals=state.selectedIndicators.map(code=>adjustedIndicatorValue(code,Number(row.valores?.[code]))).filter(Number.isFinite);
  return vals.length===state.selectedIndicators.length&&vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
function comunalRealValue(year){
  if(!state.selectedIndicators.length)return null;
  const row=(comunalRealDb.series||[]).find(r=>Number(r.anio)===Number(year));
  if(!row)return null;
  const vals=state.selectedIndicators.map(code=>adjustedIndicatorValue(code,Number(row.valores?.[code]))).filter(Number.isFinite);
  return vals.length===state.selectedIndicators.length&&vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}

featureValue=function(feature,scale=state.scale,year=state.year){
  if(!state.selectedIndicators.length||!feature)return null;
  if(scale==='barrio')return barrioValue(feature.properties.BARRIO,year);
  if(scale==='manzana')return null;
  if(scale==='territorio')return territorialRealValue(feature,year);
  if(scale==='comuna')return comunalRealValue(year);
  return null;
};

const sourceRenderFormula=renderFormula;
renderFormula=function(){sourceRenderFormula();const f=$('groupFormula');if(f&&state.selectedIndicators.includes('IAT_6'))f.insertAdjacentHTML('beforeend','<br><span>Para IAT_6 la presión original se invierte para conservar la regla común 0 desfavorable / 1 óptimo.</span>');};
const sourceRefreshMap=refreshMap;
refreshMap=function(){sourceRefreshMap();if(state.scale==='territorio'&&$('mapStatus'))$('mapStatus').textContent+=' · valor real territorial; promedio barrial sólo como referencia';if(state.scale==='comuna'&&$('mapStatus'))$('mapStatus').textContent+=' · valor comunal oficial/real; sin promedios sustitutivos';};

renderCards=function(){
  const selected=selectedComputed();
  const baseMetrics=metrics(selected);
  const name=selected?.properties[levelFields[state.scale]]??'Haz clic en una unidad del mapa';
  const unitPlural={barrio:'barrios',territorio:'territorios',comuna:'comuna'}[state.scale]||'unidades';
  let primary=baseMetrics.value,secondary=baseMetrics.avg,secondaryLabel=`Promedio de ${unitPlural} con datos`,validText=`${baseMetrics.values.length} de ${baseMetrics.features.length} ${unitPlural}`;
  if(state.scale==='territorio'&&selected){const real=territorialRealValue(selected,state.year),avgBarrio=territoryAverageValue(selected,state.year);primary=real;secondary=avgBarrio;secondaryLabel='Promedio de barrios del territorio';validText=Number.isFinite(real)?'Valor real territorial oficial · promedio barrial sólo referencial':'Valor real territorial pendiente · el promedio barrial no lo reemplaza';}
  if(state.scale==='comuna'){primary=comunalRealValue(state.year);secondary=null;secondaryLabel='Referencia secundaria';validText=Number.isFinite(primary)?'Valor comunal oficial/real':'Valor comunal pendiente de respaldo · no se calcula como promedio de barrios o territorios';}
  $('selectedValue').textContent=Number.isFinite(primary)?fmt(primary):'Sin dato';
  $('selectedName').textContent=name;
  $('valueLabel').textContent=state.scale==='territorio'?'Valor real territorial':state.scale==='comuna'?'Valor comunal oficial':(state.selectedIndicators.length>1?'Promedio agrupado':'Valor normalizado');
  $('averageLabel').textContent=secondaryLabel;
  $('scaleAverage').textContent=Number.isFinite(secondary)?fmt(secondary):'–';
  $('validCount').textContent=validText;
  $('rankValue').textContent=state.scale==='comuna'?'–':baseMetrics.rank?`${baseMetrics.rank}°`:'–';
  $('rankDetail').textContent=state.scale==='comuna'?'La comuna no requiere ranking interno':baseMetrics.rank?`de ${baseMetrics.values.length} ${unitPlural} con datos`:`Selecciona un ${state.scale} en el mapa`;
  $('rangeValue').textContent=rangeFor(primary)?.name??'Sin datos';
  const v25=selected?(state.scale==='territorio'?territorialRealValue(selected,2025):state.scale==='comuna'?comunalRealValue(2025):featureValue(selected,state.scale,2025)):null;
  const v26=selected?(state.scale==='territorio'?territorialRealValue(selected,2026):state.scale==='comuna'?comunalRealValue(2026):featureValue(selected,state.scale,2026)):null;
  $('changeValue').textContent=!state.compareYear?'Comparación desactivada':Number.isFinite(v25)&&Number.isFinite(v26)?`Cambio real 2025→2026: ${v26-v25>=0?'+':''}${fmt(v26-v25)}`:'Comparación real aún no disponible';
  $('contextUnit').textContent=selected?name:'Seleccione una unidad';renderHierarchy(selected);
};

const sourceAnalysisFor=analysisFor;
analysisFor=function(feature){
  if(state.scale==='territorio'){
    if(!feature)return 'Seleccione un territorio para generar el análisis.';
    const name=feature.properties[levelFields.territorio],real=territorialRealValue(feature,state.year),avg=territoryAverageValue(feature,state.year);
    if(Number.isFinite(real)){const dif=Number.isFinite(avg)?real-avg:null;return `El territorio ${name} presenta un Valor real territorial de ${fmt(real)}. Como referencia secundaria, el promedio de sus barrios es ${fmt(avg)}${Number.isFinite(dif)?`; diferencia ${dif>=0?'+':''}${fmt(dif)}`:''}. El promedio barrial no sustituye el cálculo territorial real.`;}
    return `El territorio ${name} no dispone todavía de Valor real territorial incorporado. El promedio barrial ${fmt(avg)} se conserva únicamente como referencia y no se usa como sustituto.`;
  }
  if(state.scale==='comuna'){
    const v=comunalRealValue(state.year);return Number.isFinite(v)?`La comuna de Santiago presenta un Valor comunal oficial de ${fmt(v)} para la selección actual.`:'El Valor comunal oficial de la selección actual está pendiente de respaldo. El visor no lo sustituye por promedios de barrios o territorios.';
  }
  return sourceAnalysisFor(feature);
};

const sourceOpenMethod=openMethod;
openMethod=function(){
  const selected=state.selectedIndicators.map(indicatorByCode).filter(Boolean),f=state.selectedFeature;
  $('dialogContent').innerHTML=`<h2>Ficha de indicador${selected.length===1?'':'es'}</h2><p class="note">Regla común del visor: 0 = condición más desfavorable y 1 = condición óptima o más favorable.</p>${selected.map(i=>`<section class="indicator-sheet"><h3>${esc(i.codigo)} · ${esc(i.indicador)}</h3><p>${esc(indicatorDescription(i))}</p><dl class="dialog-grid"><dt>Unidad de referencia</dt><dd>${esc(i.unidad??'–')}</dd><dt>Sentido</dt><dd>${esc(uniformDirectionText(i))}</dd><dt>Disponibilidad</dt><dd>2025: ${i.publicado_2025?'sí':'no'} · 2026: ${i.publicado_2026?'sí':'no'}</dd></dl></section>`).join('')}<h3>Regla por escala</h3><p>Barrio: valor oficial único. Territorio: valor real territorial principal y promedio de barrios sólo como referencia. Comuna: valor comunal oficial/real; nunca promedio sustitutivo.</p><h3>Análisis</h3><p>${esc(analysisFor(f))}</p>${reportActions()}`;
  $('infoDialog').showModal();
};

document.addEventListener('DOMContentLoaded',()=>{const institutional=document.querySelector('#dimensionList input[value="IIT"]')?.closest('label');if(institutional)institutional.remove();});
