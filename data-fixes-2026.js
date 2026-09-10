(()=>{
  const ist8Real2026={
    'NORORIENTE':0,
    'NORPONIENTE':1,
    'CENTRO ORIENTE':0.6363636363636364,
    'CENTRO PONIENTE':0.2727272727272727,
    'SURORIENTE':0.7272727272727273,
    'SURPONIENTE':0.2727272727272727
  };
  const territorioPromedio2026={
    'NORORIENTE':{IAT_2:0.1639347994354141,IST_8:0.08333333333333333},
    'NORPONIENTE':{IAT_2:0.41702522424076854,IST_8:0.41},
    'CENTRO ORIENTE':{IAT_2:0.3076822383098848,IST_8:0.226},
    'CENTRO PONIENTE':{IAT_2:0.03800330859475785,IST_8:0.21},
    'SURORIENTE':{IAT_2:0.21114081474687948,IST_8:0.18},
    'SURPONIENTE':{IAT_2:0.20269544233483586,IST_8:0.128}
  };
  const comunaPromedio2026={IAT_2:0.22814969957892142,IST_8:0.20555555555555555};
  window.GI_RELOAD_2026={
    IAT_2:{territorio_real:null,territorio_promedio:territorioPromedio2026,comuna_promedio:comunaPromedio2026.IAT_2,nota:'Sin territorio real validado en 2026; no distribuir ni imputar.'},
    IST_8:{territorio_real:ist8Real2026,territorio_promedio:territorioPromedio2026,comuna_promedio:comunaPromedio2026.IST_8}
  };
  if(typeof featureValue!=='function'||typeof state==='undefined') return;
  const prevFeatureValue=featureValue;
  featureValue=function(feature,scale=state.scale,year=state.year){
    if(!feature) return null;
    if(scale==='territorio'&&Number(year)===2026&&state.selectedIndicators?.length){
      const territorio=String(feature.properties?.TERRITORIO??'').trim();
      const vals=[];
      for(const code of state.selectedIndicators){
        if(code==='IAT_2') return null;
        if(code==='IST_8'){
          const v=ist8Real2026[territorio];
          if(!Number.isFinite(v)) return null;
          vals.push(v);
          continue;
        }
        const old=state.selectedIndicators;
        try{
          state.selectedIndicators=[code];
          const v=prevFeatureValue(feature,scale,year);
          if(!Number.isFinite(v)) return null;
          vals.push(v);
        }finally{state.selectedIndicators=old;}
      }
      return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
    }
    return prevFeatureValue(feature,scale,year);
  };
})();