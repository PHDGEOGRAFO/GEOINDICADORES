// Piloto metodológico: cinco rangos GeoIndicadores/PLADECO.
// Cargar después de app.js en la rama paralela cuando se ejecute QA visual.
(() => {
  if (typeof palette === 'undefined') return;
  palette.splice(0, palette.length,
    {name:'Muy bajo', label:'0–<12,5', color:'#285784'},
    {name:'Bajo', label:'12,5–<37,5', color:'#49a9a7'},
    {name:'Medio', label:'37,5–<75', color:'#d4aa3d'},
    {name:'Alto', label:'75–<87,5', color:'#e96c57'},
    {name:'Muy alto', label:'87,5–100', color:'#8f4cc8'}
  );
  rangeFor = function(v){
    if(!Number.isFinite(v)) return null;
    if(v < 0.125) return palette[0];
    if(v < 0.375) return palette[1];
    if(v < 0.75) return palette[2];
    if(v < 0.875) return palette[3];
    return palette[4];
  };
  if(typeof renderLegend === 'function') renderLegend();
  if(typeof refresh === 'function') refresh();
})();
