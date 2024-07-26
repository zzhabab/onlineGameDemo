<template>
  <div id="map">
    <input id="speed" type="range" min="1" max="100" step="1" value="60">
    <button id='controllerButton'>start</button>
  </div>
</template>

<script setup lang="ts">
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import XYZ from 'ol/source/XYZ';
  import Feature from 'ol/Feature';
  import { Style, Circle, Fill, Text } from 'ol/style'
  import VectorSource from 'ol/source/Vector'
  import VectorLayer from 'ol/layer/Vector'
  import Point from 'ol/geom/Point'
  import LineString from 'ol/geom/LineString'
  import geometry from 'ol/geom/Geometry'
  
  import Polyline from 'ol/format/Polyline.js';
  import {getVectorContext} from 'ol/render.js';
  import {Cluster} from 'ol/source.js';
  
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
        projection: 'EPSG:4326'
      })
    });
    const count = 200;
    const features = new Array(count);
    for (let i = 0; i < count; i++) {
      let tempFeature = new Feature({
        geometry: new Point([109.065742 + Math.random() * 10,33.657441 + Math.random() * 10])
      })
      features[i] = tempFeature
    }
    source = new VectorSource({
      features: features,
    });
    const clusterSource = new Cluster({
      source: source,
    });
    firstLayer = new VectorLayer({
      source: clusterSource,
      style: function(feature) {
        let style = new Style({
          image: new Circle({
            fill: new Fill({
              color: '#3399CC'
            }),
            radius: 15,
          }),
          text: new Text({
            text: feature.get('features').length.toString(),
            font: '12px',
            fill: new Fill({color: 'white'})
          })
        })
        return style
      }
    })
    map.addLayer(firstLayer)
  })
</script>

<style>
  #map{
    width: 100%;
    height: 100%;
  }
</style>