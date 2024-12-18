import { Role } from '@/typeScript/Role'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { gsap } from "gsap";
import { mod } from 'three/examples/jsm/nodes/Nodes.js';

import brickBase from '@/models/brick/base.glb'
import brickCollision from '@/models/brick/collision.glb'

import lemonBase from '@/models/lemon/base.glb'
import lemonCollision from '@/models/lemon/collision.glb'

import soldierBase from '@/models/Soldier.glb'
import mapBase from '@/models/Map.glb'
import airplane from '@/models/airplane.glb'
import boxman from '@/models/boxman.glb'
import car from '@/models/car.glb'
import heli from '@/models/heli.glb'
import world from '@/models/world.glb'

import { ref } from 'vue'

interface Resource {
  name: string,
  sourcePath: string,
  type: 'texture' | 'model' | 'audio',
  gltf?: GLTF
  image?: HTMLImageElement
  audio?: HTMLAudioElement
}
export class Resources {
  data: {
    [key: string]: Resource
  } = {}
  fulfilledCount = ref(0)
  totalCount = ref(0)
  loadEvent: CustomEvent = new CustomEvent('resourcesLoadReady', {
    detail: {message: '资源已全部加载'}
  })
  constructor() {
    const tempList: Array<Resource> = [
      {name: 'brickBase', sourcePath: brickBase, type: 'model'},
      {name: 'brickCollision', sourcePath: brickCollision, type: 'model'},
      {name: 'lemonBase', sourcePath: lemonBase, type: 'model'},
      {name: 'lemonCollision', sourcePath: lemonCollision, type: 'model'},
      {name: 'soldierBase', sourcePath: soldierBase, type: 'model'},
      {name: 'mapBase', sourcePath: mapBase, type: 'model'},
      {name: 'airplane', sourcePath: airplane, type: 'model'},
      {name: 'boxman', sourcePath: boxman, type: 'model'},
      {name: 'car', sourcePath: car, type: 'model'},
      {name: 'heli', sourcePath: heli, type: 'model'},
      {name: 'world', sourcePath: world, type: 'model'},
    ]
    this.totalCount.value = tempList.length
    this.load(tempList)
  }
  load = (resourceList: Array<Resource>) => {
    resourceList.forEach(item => {
      if (item.type === 'model') {
        this.loadModel(item)
      }
      if (item.type === 'texture') {
        this.loadImage(item)
      }
      this.data[item.name] = item
    })
  }
  loadModel = (resource: Resource) => {
    const loader = new GLTFLoader();
    // DRACO 是一种用于压缩 3D 几何体数据（如网格）的技术，如果模型使用了就必须要提供DRACOLoader，如果模型没使用加上也没事，所以默认加上
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("../../../node_modules/three/examples/jsm/libs/draco/gltf/");
    dracoLoader.setDecoderConfig({type: 'js'});
    loader.setDRACOLoader(dracoLoader);
    loader.load( resource.sourcePath, ( gltf ) => {
      resource.gltf = gltf
      this.afterLoad()
    })
  }
  loadImage = (resource: Resource) => {
    const img = new Image()
    img.onload = (data) => {
      resource.image = img
      this.afterLoad()
    }
    img.src = resource.sourcePath
  }
  loadAudio = (resource: Resource) => {
    const audio = new Audio()
    audio.onload = (data) => {
      resource.audio = audio
      this.afterLoad()
    }
    audio.src = resource.sourcePath
  }
  afterLoad = () => {
    this.fulfilledCount.value = this.fulfilledCount.value + 1
    if (this.fulfilledCount.value === this.totalCount.value) {
      document.dispatchEvent(this.loadEvent)
    }
  }
}