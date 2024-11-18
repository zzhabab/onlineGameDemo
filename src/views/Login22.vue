<template>
  <div id="map">
    <input id="speed" type="range" min="1" max="100" step="1" value="60">
    <button id='controllerButton'>start</button>
    <select id="mode">
      <option value="modify">select a feature to modify</option>
      <option value="draw">draw new features</option>
    </select>
  </div>
</template>

<script setup lang="ts">
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import XYZ from 'ol/source/XYZ';
  import Feature from 'ol/Feature';
  import { Style, Circle, Fill, Text, Stroke } from 'ol/style'
  import VectorSource from 'ol/source/Vector'
  import VectorLayer from 'ol/layer/Vector'
  import Point from 'ol/geom/Point'
  import LineString from 'ol/geom/LineString'
  import geometry from 'ol/geom/Geometry'
  
  import Polyline from 'ol/format/Polyline.js';
  import {getVectorContext} from 'ol/render.js';
  import {Cluster} from 'ol/source.js';
  
  import GeoJSON from 'ol/format/GeoJSON.js';
  import {Draw, Modify, Select, Snap} from 'ol/interaction.js';
  import {useGeographic} from 'ol/proj.js';
  
  import { ref, reactive, onMounted, nextTick, defineAsyncComponent, toRaw } from 'vue'
  
  let map: any = null
  let source: any = null
  let firstLayer: any = null
  
  onMounted(() => {
    source = new VectorSource()
    firstLayer = new VectorLayer()
    map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
          })
        })
      ],
      view: new View({
        center: [104.065742,30.657441],
        zoom: 6,
        projection: 'EPSG:4326',
      })
    });
    
    // useGeographic();
    // const source = new VectorSource({
    //   url: 'https://openlayers.org/data/vector/us-states.json',
    //   format: new GeoJSON(),
    // });
    // const map = new Map({
    //   target: 'map',
    //   layers: [
    //     new VectorLayer({
    //       background: 'white',
    //       source: source,
    //     }),
    //   ],
    //   view: new View({
    //     center: [-100, 38.5],
    //     zoom: 4,
    //   }),
    // });
    
    source.on('change', function() {
      if (source.getFeatures().length === 0) {
          console.log('没有加载任何要素');
      } else {
          console.log('加载了 ' + source.getFeatures().length + ' 个要素');
      }
    });
    
    const select = new Select();
    const modify = new Modify({
      features: select.getFeatures(),
    });
    const draw = new Draw({
      type: 'Polygon',
      source: source,
    });
    const snap = new Snap({
      source: source,
    });
    function removeInteractions() {
      map.removeInteraction(modify);
      map.removeInteraction(select);
      map.removeInteraction(draw);
      map.removeInteraction(select);
    }
    const mode = document.getElementById('mode') as HTMLSelectElement
    function onChange() {
      removeInteractions();
      switch (mode.value) {
        case 'draw': {
          map.addInteraction(draw);
          map.addInteraction(snap);
          break;
        }
        case 'modify': {
          map.addInteraction(select);
          map.addInteraction(modify);
          map.addInteraction(snap);
          break;
        }
        default: {
          // pass
        }
      }
    }
    mode.addEventListener('change', onChange);
    onChange();
    
    // function addRandomFeature() {
    //   const x = 104.065742 + parseInt(Math.random() * 10);
    //   const y = 30.657441 + parseInt(Math.random() * 10);
    //   const feature = new Feature({
    //     geometry: new Point([x, y]),
    //     style: new Style({
    //       image: new Circle({
    //         fill: new Fill({
    //           color: '#3399CC'
    //         }),
    //         radius: 15,
    //       }),
    //     })
    //   })
      
    //   const lineFeature = new Feature({
    //     geometry: new LineString([
    //       [x, y],
    //       [x+1, y+1]
    //     ]),
    //     style: new Style({
    //       stroke: new Stroke({
    //         color: 'red',
    //         width: 2,
    //         lineDash: [15, 20]
    //       })
    //     })
    //   })
    //   source.addFeature(lineFeature);
      
    //   source.addFeature(feature);
    //   firstLayer.setSource(source)
    //   map.addLayer(firstLayer)
    // }
    // addRandomFeature()
  })
</script>

<style>
  #map{
    width: 100%;
    height: 100%;
  }
</style>