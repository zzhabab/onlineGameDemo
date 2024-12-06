import { defineStore } from 'pinia'
// toRaw()根据传入的Proxy对象获得它没被代理时的target
// markRaw()使传入的值不会被代理成Proxy对象
import { ref, reactive, toRaw, markRaw } from 'vue'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Resources } from '@/typeScript/resource'
import CannonDebugger from 'cannon-es-debugger'

// defineStore里面的引用类型会被代理成Proxy对象
export const useCounterStore = defineStore('counter', () => {
  const deviceType = ref('')
  const uuid = ref('')
  const scene: THREE.Scene = markRaw(new THREE.Scene())
  const renderer: THREE.WebGLRenderer = markRaw(new THREE.WebGLRenderer({ alpha: true }))
  const camera: THREE.PerspectiveCamera = markRaw(new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000))
  const physicsWorld: CANNON.World = markRaw(new CANNON.World)
  physicsWorld.broadphase = new CANNON.NaiveBroadphase()// 碰撞检测
  physicsWorld.gravity.set(0, -9.82, 0)
  const controls = markRaw(new OrbitControls( camera, renderer.domElement ))
  const resources: Resources = markRaw(new Resources())
  const cannonDebugger = CannonDebugger(scene, physicsWorld)
  return {
    deviceType,
    uuid,
    scene,
    renderer,
    camera,
    physicsWorld,
    controls,
    resources,
    cannonDebugger
  }
})