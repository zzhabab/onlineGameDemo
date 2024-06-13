import { defineStore } from 'pinia'
// toRaw()根据传入的Proxy对象获得它没被代理时的target
// markRaw()使传入的值不会被代理成Proxy对象
import { ref, reactive, toRaw, markRaw } from 'vue'
import * as THREE from 'three'

// defineStore里面的引用类型会被代理成Proxy对象
export const useCounterStore = defineStore('counter', () => {
  const deviceType = ref('')
  const uuid = ref('')
  const scene: THREE.Scene = markRaw(new THREE.Scene())
  return {
    deviceType,
    uuid,
    scene,
  }
})