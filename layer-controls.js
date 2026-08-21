(() => {
  const waitForMap = () => {
    if (typeof map === 'undefined' || !map || typeof state === 'undefined' || !state?.layers?.barrio || !state?.layers?.territorio) {
      setTimeout(waitForMap, 250);
      return;
    }

    const addReferenceLayers = () => {
      if (!map.getSource('limites-barrios')) {
        map.addSource('limites-barrios', { type: 'geojson', data: state.layers.barrio });
        map.addLayer({
          id: 'limites-barrios-line',
          type: 'line',
          source: 'limites-barrios',
          layout: { visibility: 'visible' },
          paint: {
            'line-color': '#111827',
            'line-width': 1.35,
            'line-opacity': 0.95
          }
        });
      }

      if (!map.getSource('limites-territorios')) {
        map.addSource('limites-territorios', { type: 'geojson', data: state.layers.territorio });
        map.addLayer({
          id: 'limites-territorios-line',
          type: 'line',
          source: 'limites-territorios',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#ffffff',
            'line-width': 3,
            'line-opacity': 0.95
          }
        });
      }
    };

    class ReferenceLayerControl {
      onAdd() {
        const container = document.createElement('div');
        container.className = 'maplibregl-ctrl maplibregl-ctrl-group gi-layer-control';
        container.innerHTML = `
          <div class="gi-layer-title">Límites</div>
          <label><input type="checkbox" data-layer="limites-barrios-line" checked> Barrios</label>
          <label><input type="checkbox" data-layer="limites-territorios-line"> Territorios</label>
        `;
        container.querySelectorAll('input[data-layer]').forEach(input => {
          input.addEventListener('change', () => {
            const layerId = input.dataset.layer;
            if (map.getLayer(layerId)) {
              map.setLayoutProperty(layerId, 'visibility', input.checked ? 'visible' : 'none');
            }
          });
        });
        return container;
      }
      onRemove() {}
    }

    if (map.loaded()) {
      addReferenceLayers();
      map.addControl(new ReferenceLayerControl(), 'top-left');
    } else {
      map.once('load', () => {
        addReferenceLayers();
        map.addControl(new ReferenceLayerControl(), 'top-left');
      });
    }
  };

  waitForMap();
})();
