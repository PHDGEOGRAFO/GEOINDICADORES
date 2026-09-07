// Ajustes metodológicos 07-09-2026
// Regla común: 0 = condición más desfavorable; 1 = condición óptima/más favorable.
// Territorio: valor real recalculado desde datos brutos como principal; promedio barrial como referencia secundaria.

inverseCodes.add('IST_7');
inverseCodes.add('IAT_6');
state.selectedDimensions=state.selectedDimensions.filter(d=>d!=='IIT');

let territorialRealDb={series:[]};
fetch('./data/territorial-real.json?v=1.0.1').then(r=>r.ok?r.json():{series:[]}).then(db=>{territorialRealDb=db||{series:[]};if(typeof refresh==='function')refresh()}).catch(()=>{});

const pressureCodesToFlip=new Set(['IAT_6']);

function adjustedIndicatorValue(code,raw){
  if(!Number.isFinite(raw))return NaN;
  return pressureCodesToFlip.has(code)?1-raw:raw;
}

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

featureValue=function(feature,scale=state.scale,year=state.year){
  if(!state.selectedIndicators.length||!feature)return null;
  if(scale==='barrio')return barrioValue(feature.properties.BARRIO,year);
  if(scale==='manzana')return null;
  if(scale==='territorio'){
    const real=territorialRealValue(feature,year);
    return Number.isFinite(real)?real:territoryAverageValue(feature,year);
  }
  const barrios=state.layers.barrio?.features||[];
  const vals=barrios.map(b=>barrioValue(b.properties.BARRIO,year)).filter(Number.isFinite);
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
};

const sourceRenderFormula=renderFormula;
renderFormula=function(){
  sourceRenderFormula();
  const f=$('groupFormula');
  if(f&&state.selectedIndicators.includes('IAT_6'))f.insertAdjacentHTML('beforeend','<br><span>Para IAT_6 la presión original se invierte para conservar la regla común 0 desfavorable / 1 óptimo.</span>');
};

const sourceRefreshMap=refreshMap;
refreshMap=function(){
  sourceRefreshMap();
  if(state.scale==='territorio'&&$('mapStatus'))$('mapStatus').textContent+=' · valor real cuando está respaldado; promedio barrial como referencia';
};

renderCards=function(){
  const selected=selectedComputed();
  const baseMetrics=metrics(selected);
  const name=selected?.properties[levelFields[state.scale]]??'Haz clic en una unidad del mapa';
  const unitPlural={barrio:'barrios',territorio:'territorios',comuna:'comuna'}[state.scale]||'unidades';
  let primary=baseMetrics.value,secondary=baseMetrics.avg,secondaryLabel=state.scale==='comuna'?'Resultado comunal':`Promedio de ${unitPlural} con datos`,validText=state.scale==='comuna'?'Promedio de barrios con resultados':`${baseMetrics.values.length} de ${baseMetrics.features.length} ${unitPlural} · incluye la unidad seleccionada`;
  if(state.scale==='territorio'&&selected){
    const real=territorialRealValue(selected,state.year),avgBarrio=territoryAverageValue(selected,state.year);
    primary=real;
    secondary=avgBarrio;
    secondaryLabel='Promedio de barrios del territorio';
    validText=Number.isFinite(real)?'Referencia secundaria para contrastar con el cálculo territorial real':'Valor real territorial pendiente de respaldo · promedio barrial disponible como referencia';
  }
  $('selectedValue').textContent=Number.isFinite(primary)?fmt(primary):'Pendiente';
  $('selectedName').textContent=name;
  $('valueLabel').textContent=state.scale==='territorio'?'Valor real territorial':(state.selectedIndicators.length>1?'Promedio agrupado':'Valor normalizado');
  $('averageLabel').textContent=secondaryLabel;
  $('scaleAverage').textContent=fmt(secondary);
  $('validCount').textContent=validText;
  $('rankValue').textContent=baseMetrics.rank?`${baseMetrics.rank}°`:'–';
  $('rankDetail').textContent=state.scale==='territorio'&&!Number.isFinite(primary)?'Ranking referencial basado en promedio barrial':baseMetrics.rank?`de ${baseMetrics.values.length} ${unitPlural} con datos`:`Selecciona un ${state.scale} en el mapa`;
  $('rangeValue').textContent=rangeFor(Number.isFinite(primary)?primary:secondary)?.name??'Sin datos';
  const v25=selected?(state.scale==='territorio'?territorialRealValue(selected,2025):featureValue(selected,state.scale,2025)):null;
  const v26=selected?(state.scale==='territorio'?territorialRealValue(selected,2026):featureValue(selected,state.scale,2026)):null;
  $('changeValue').textContent=!state.compareYear?'Comparación desactivada':Number.isFinite(v25)&&Number.isFinite(v26)?`Cambio real 2025→2026: ${v26-v25>=0?'+':''}${fmt(v26-v25)}`:'Comparación real aún no disponible';
  $('contextUnit').textContent=selected?name:'Seleccione una unidad';
  renderHierarchy(selected);
};

const sourceAnalysisFor=analysisFor;
analysisFor=function(feature){
  if(state.scale!=='territorio')return sourceAnalysisFor(feature);
  if(!feature)return 'Seleccione un territorio para generar el análisis.';
  const name=feature.properties[levelFields.territorio];
  const real=territorialRealValue(feature,state.year),avg=territoryAverageValue(feature,state.year);
  if(Number.isFinite(real)){
    const dif=Number.isFinite(avg)?real-avg:null;
    return `El territorio ${name} presenta un Valor real territorial de ${fmt(real)}, calculado a partir de los datos brutos agregados y normalizado a escala territorio. Como referencia secundaria, el promedio de los barrios que lo componen es ${fmt(avg)}${Number.isFinite(dif)?`; la diferencia entre ambas lecturas es ${dif>=0?'+':''}${fmt(dif)}`:''}. En todos los indicadores se mantiene la regla común 0 = condición más desfavorable y 1 = condición óptima o más favorable.`;
  }
  return `El territorio ${name} todavía no dispone de un Valor real territorial incorporado al visor. El promedio normalizado de sus barrios es ${fmt(avg)} y se muestra únicamente como referencia secundaria. No debe interpretarse como sustituto del cálculo territorial real.`;
};

const sourceOpenMethod=openMethod;
openMethod=function(){
  const selected=state.selectedIndicators.map(indicatorByCode).filter(Boolean),f=state.selectedFeature;
  $('dialogContent').innerHTML=`<h2>Ficha de indicador${selected.length===1?'':'es'}</h2><p class="note">Regla común del visor: 0 = condición más desfavorable y 1 = condición óptima o más favorable.</p>${selected.map(i=>`<section class="indicator-sheet"><h3>${esc(i.codigo)} · ${esc(i.indicador)}</h3><p>${esc(indicatorDescription(i))}</p><dl class="dialog-grid"><dt>Unidad de referencia</dt><dd>${esc(i.unidad??'–')}</dd><dt>Sentido</dt><dd>${esc(uniformDirectionText(i))}</dd><dt>Disponibilidad</dt><dd>2025: ${i.publicado_2025?'sí':'no'} · 2026: ${i.publicado_2026?'sí':'no'}</dd></dl></section>`).join('')}${selected.length>1?`<h3>Resultado agrupado</h3><p>Promedio simple de ${selected.length} resultados normalizados: ${esc(selectedNames().join('; '))}. Si falta un componente, la unidad queda sin resultado.</p>`:''}<h3>Análisis de la selección territorial</h3><p>${esc(analysisFor(f))}</p>${reportActions()}`;
  $('infoDialog').showModal();
};

const sourceOpenReport=openReport;
openReport=function(){
  if(state.scale!=='territorio')return sourceOpenReport();
  const f=state.selectedFeature,name=f?.properties[levelFields.territorio]??'Sin territorio seleccionado',real=f?territorialRealValue(f,state.year):null,avg=f?territoryAverageValue(f,state.year):null,descriptions=state.selectedIndicators.map(indicatorByCode).filter(Boolean);
  $('dialogContent').innerHTML=`<h2>Reporte territorial</h2><p><b>${esc(name)}</b> · territorio · ${state.year}</p><table class="report-table"><tr><th>Indicadores seleccionados</th><td>${esc(selectedNames().join('; ')||'Sin selección')}</td></tr><tr><th>Descripción breve</th><td>${descriptions.map(i=>esc(indicatorDescription(i))).join('<br>')}</td></tr><tr><th>Valor real territorial</th><td>${Number.isFinite(real)?fmt(real):'Pendiente de respaldo'}</td></tr><tr><th>Promedio de barrios</th><td>${fmt(avg)}</td></tr><tr><th>Jerarquía</th><td>El Valor real territorial es la referencia principal. El promedio de barrios es un dato secundario de contraste.</td></tr><tr><th>Regla de valoración</th><td>0 = condición más desfavorable · 1 = condición óptima o más favorable.</td></tr><tr><th>Rango PLADECO</th><td>${rangeFor(Number.isFinite(real)?real:avg)?.name??'Sin datos'}</td></tr></table><h3>Análisis</h3><p>${esc(analysisFor(f))}</p><p class="note">Los resultados territoriales reales se incorporan únicamente cuando existe cálculo desde valores brutos y respaldo metodológico.</p>${reportActions()}`;
  $('infoDialog').showModal();
};

document.addEventListener('DOMContentLoaded',()=>{
  const institutional=document.querySelector('#dimensionList input[value="IIT"]')?.closest('label');
  if(institutional)institutional.remove();
});
