(() => {
  function install() {
    const m = window.map;
    const s = window.state;
    if (!m || !s || !s.layers || !s.layers.barrio || !s.layers.territorio || !m.isStyleLoaded()) {
      setTimeout(install, 300);
      return;
    }
    if (document.getElementById('gi-layer-box')) return;

    if (!m.getSource('limites-barrios')) m.addSource('limites-barrios', {type:'geojson', data:s.layers.barrio});
    if (!m.getLayer('limites-barrios-line')) m.addLayer({id:'limites-barrios-line',type:'line',source:'limites-barrios',layout:{visibility:'visible'},paint:{'line-color':'#101820','line-width':1.5,'line-opacity':0.95}});
    if (!m.getSource('limites-territorios')) m.addSource('limites-territorios', {type:'geojson', data:s.layers.territorio});
    if (!m.getLayer('limites-territorios-line')) m.addLayer({id:'limites-territorios-line',type:'line',source:'limites-territorios',layout:{visibility:'none'},paint:{'line-color':'#ffffff','line-width':3.5,'line-opacity':1}});

    const host = document.querySelector('.map-panel');
    if (!host) return;
    const box = document.createElement('div');
    box.id = 'gi-layer-box';
    box.className = 'gi-layer-box';
    box.innerHTML = '<strong>Capas</strong><label><input id="gi-barrios" type="checkbox" checked> Límites Barrios</label><label><input id="gi-territorios" type="checkbox"> Límites Territorios</label>';
    host.appendChild(box);
    box.querySelector('#gi-barrios').addEventListener('change', e => m.setLayoutProperty('limites-barrios-line','visibility',e.target.checked?'visible':'none'));
    box.querySelector('#gi-territorios').addEventListener('change', e => m.setLayoutProperty('limites-territorios-line','visibility',e.target.checked?'visible':'none'));
  }
  window.addEventListener('load', () => setTimeout(install, 300));
})();
