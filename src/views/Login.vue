<script lang="ts" setup>
  import { ref, reactive, onMounted, nextTick, defineAsyncComponent, toRaw, getCurrentInstance } from 'vue'
  import * as THREE from 'three'
  // import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  import { useCounterStore } from '@/stores/counter'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { gsap } from "gsap";
  
  // 加入?raw使文件内容以字符串形式引入
  import shaderVertex from '../shaders/floor/vertex.glsl?raw'
  import shaderFragment from '../shaders/floor/fragment.glsl?raw'
  import testVertexShader from './testVertexShader.glsl?raw'
  import testFragmentShader from './testFragmentShader.glsl?raw'
  import { render } from 'node_modules/sass/types/index'
  
  import { MyResponseType, Http } from '@/type/index'
  
  const counter = useCounterStore()
  const router = useRouter()
  const userInfo = reactive({
    name: '',
    password: '',
  })
  
  const http: Http = getCurrentInstance()?.appContext.config.globalProperties.$http
  onMounted(() => {
    getDeviceType()
    // initThreejs()
    // setFloor()
    // setStartScreen()
  })
  
  const getDeviceType = () => {
    const user = navigator.userAgent.toLowerCase()
    if (/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(user)) {
      counter.deviceType = 'Mobile'
    } else {
      counter.deviceType = 'PC'
    }
  }
  const initThreejs = () => {
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1)
    const renderElement = renderer.domElement
    renderElement.style.position = 'absolute'
    renderElement.style.top = '0'
    renderElement.style.left = '0'
    document.querySelector('#app')!.appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    const controls = new OrbitControls( camera, renderer.domElement );
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(counter.scene, camera);
      controls.update();
    }
    animate();
  }
  const setFloor = () => {
    const uniforms = {
      tBackground: { value: null }
    }
    const planeGeometry = new THREE.PlaneGeometry(2, 2)
    const planeMaterial = new THREE.ShaderMaterial({
      wireframe: false,
      transparent: false,
      uniforms,
      vertexShader: shaderVertex,
      fragmentShader: shaderFragment
    })
    const colors = {
      topLeft: '#f5883c',
      topRight: '#ff9043',
      bottomRight: '#fccf92',
      bottomLeft: '#f5aa58',
    }
    const topLeft = new THREE.Color(colors.topLeft)
    const topRight = new THREE.Color(colors.topRight)
    const bottomRight = new THREE.Color(colors.bottomRight)
    const bottomLeft = new THREE.Color(colors.bottomLeft)
    const data = new Uint8Array([
      Math.round(bottomLeft.r * 255), Math.round(bottomLeft.g * 255), Math.round(bottomLeft.b * 255),
      Math.round(bottomRight.r * 255), Math.round(bottomRight.g * 255), Math.round(bottomRight.b * 255),
      Math.round(topLeft.r * 255), Math.round(topLeft.g * 255), Math.round(topLeft.b * 255),
      Math.round(topRight.r * 255), Math.round(topRight.g * 255), Math.round(topRight.b * 255)
    ])
    const backgroundTexture = new THREE.DataTexture(data, 2, 2, THREE.RGBFormat)
    backgroundTexture.magFilter = THREE.LinearFilter
    backgroundTexture.needsUpdate = true
    planeMaterial.uniforms.tBackground.value = backgroundTexture
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    counter.scene.add(plane)
  }
  const setStartScreen = () => {
    let startingScreen: Record<string, any> = {}
    startingScreen.loadingLabel = {}
    startingScreen.loadingLabel.geometry = new THREE.PlaneGeometry(2.5, 2.5 / 4)
    startingScreen.loadingLabel.image = new Image()
    startingScreen.loadingLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///9ra2ucnJzR0dH09PQmJiaNjY24uLjp6end3d1CQkLFxcVYWFiqqqp9fX3nQ5qrAAAEVUlEQVRo3u3YT08TQRQA8JEtW6CATGnDdvljaTwYE2IBI/HGRrwSetGTsZh4MPFQYiQe229gE++WePFY9Oqh1cRzieEDYIgXLxjPJu5M33vbZQszW+fgoS+B7ewO836znRl2lg1jGMP4P2Okw0yFvaKsklr3I99Tvl3iPPelGbQhKqxB4eN6N/7gVcsvbEAz1F4RLn67zzl/v6/oLvejGBQ9LsNphio4UFjmEAsVJuOK/zkDtc6w+gyTcZ3LyP6IAzjBDA+pj6LkEgAjW4kANsMAC6vmOvqAMU5RgVOTskQACicCmCcA9AXjkT5gj1MswqlxWcoTgKJ6HuAQAD5guNoAu8QpMnBul1ONMGD2PCBbRgDAKYq6AEtmXvtdj3S6GhRyW1t1DvkAgM0ggG7mu1t3xWFHFzAqv3wYCi0mY1UCGgiQPU+1oWIY8LoXcAA3qeYfr+kClvHW14PJ5OfCAgHYNAoDAORBQIrDvHjqH5c0ANTbORzBacbAQgUC2IAKAzI9gCSHlWEMLmgBPJxMvyARpIICALDm4nkAbwIA71EZx5UOgO48JnLoOhQIAN9sOgKoBoAE5r0aB8ARcNhtFzrg0VQmwCp8CAMeAADGc44S5GMBsF1aCEU2LcAcAPDCvwFytBDehCaUgJxRAKeF8BNUUQJ43iiAUlqwFKoBrTCAHjiagwEgU0YM5IYWYD4KoIgPwIXQwUbVgCXzgLpIBJNeDciWTQNskVsq1ADX/6kYBdCTjse5owbMiX+IpgGWOCPSuWpA2vN/TAMm5QTYg5IC4FdbMA0YF5Nb5s2rAaLyhzBgektGZWDArrgqi0U1QHxf38OABDwUDgTAjGfyPlTVgJT/67FBACbqyGYaaoBctQwD2vI4DecVAPkgZRhQlxPQks2rAePGAbZsRlaa1QBYEQBUHRCAmaXD0QDYxgFWdye05R9cDQCrmQYkeBA6gGXTgNEeQF4DMG4S4MLjOUZRA5A0CcjADgmjqgGwSwSg9wK1GIBS74KTgTxv/EHoiaVQsTOS5RoCJuiZyosB8EIrHpyowFiYofO0i4wCjhCQwL0hq2sCaFNM22S4JXloLk0AuLDTBzCBAAt3xykeA7CHe/mDbgdTvQ9GswSAwdbqA0giYASHjQUJnhQKhQ6z/d8rDA4hAG2Dsk042ejubHMM2nV6AMf93pCkaRjhh0WsWuz+6aasl2FwiAImReEts1/CSaFfwFouAJxC4RW+I4oCThBQE1X2WbKkBFDkqYDtJ0SHaYKq3pJJwCECjjiFPoC1w+2P0gumurgeBjT6AhIIGKOelGIAngWlFnRnMZjMIYBb7gtIIsAuYU+8GICpEhYyZVgIZ2g9rYYAX1lfAKvjnxzjnWrHALDn9K1h2k2aoI1ewGd2AWAVAVMHcKdW4wDYje739pNufJXhkJohgLu9zy4CHCKAJYUge4ddCojGyPrp9kaHmYjUi9N7+2wYwxjGZfEXMKxGE0GkkfIAAAAASUVORK5CYII='
    startingScreen.loadingLabel.texture = new THREE.Texture(startingScreen.loadingLabel.image)
    startingScreen.loadingLabel.texture.magFilter = THREE.NearestFilter
    startingScreen.loadingLabel.texture.minFilter = THREE.LinearFilter
    startingScreen.loadingLabel.texture.needsUpdate = true
    startingScreen.loadingLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: startingScreen.loadingLabel.texture })
    startingScreen.loadingLabel.mesh = new THREE.Mesh(startingScreen.loadingLabel.geometry, startingScreen.loadingLabel.material)
    startingScreen.loadingLabel.mesh.matrixAutoUpdate = false
    counter.scene.add(startingScreen.loadingLabel.mesh)
    
    startingScreen.startLabel = {}
    startingScreen.startLabel.geometry = new THREE.PlaneGeometry(2.5, 2.5 / 4)
    startingScreen.startLabel.image = new Image()
    startingScreen.startLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///+cnJxra2vR0dHd3d0mJib09PRYWFjp6em4uLhCQkKqqqqNjY19fX3FxcV3XeRgAAADsklEQVRo3u3YsU9TQRwH8KNgLSDQg9ZCAak1IdE4PKPu1NTEsSzOMDl3I3GpcXAxBhLjXFxNjJgQJ2ON0Rnj4uAAEyv8B/L7tV++5/VN+CM69Ldwfa+534d7d793VzeIQQzi/49c4v5lPF/1vvhFm++rjIpcyErrmrSCuz+cxng1iL/If8drPJD2Lc/Iy4VhaZWlFd4tLPfuMc6e/5LvRilJA2SkVSQA8c0OsI0uNtIAU9rsB8y1rAAZjyimAUa1mQDAeGwF+MA+9lIA69qs9AMKVoDP8vhf35A+NiMAc7YJKFSrX7tcI8BW9+k/O/kz6zSunjSnncMHiQYBcmdXrh3xCVbc2WO8N/YZZI0AxxwMArKivmwAwFKSPmV0UwBbCpj5E+C+yzUbQAaJVwUSA9SFjwFgHQ0jAMrBWgzAPCtHgFFbQAlpEwKC2zWUQgJGbAH+naSdu/fTxQAthPL5/ADD6OCpQwCAsb6LsbEGcBluOAYBmG2fkMIawHVWXEsDIGUGpZCAIRsAS93DPgDbhUmUQgKe2NUB90hfhK0YwEJYHkYpJGDbqBKiB86CGLAlzd6/S8CEvh8sACiBvrSXCshKblWEgNy2vkAMAHwGfjECcJHOu5qUQgDm6vXulshZAXJNL9GJAeg+LxeKPQBj1gzgdlnuCWAhbOi7LwaU9u0A2VWPpUgAC+GR5k0iwBtnB3Bj3qMaRYB17X0IOQhYcjYA7guxxyIAGfd1HNqchPfly7aACQUshAA2W1r5G1yG415YpgB3qIIkAHBH2D075QnQ10fHDsCl+CoGSKpiN8kMAVqIN00BsitnVgKyPIBMB4ADKU92AA5BKQIgszjKBGBLagpwB5xZBGS6pbcuizQAXMA6NAK86OCQ3okAI55BQPe7VoDxXzU/iwPASgS4GAASAiYxWgYAzvAa1loA2AkAFQIU2zEELCJtDDgIAG0CFLvp7LblC2kAtF6eTEJJ2CBAr88bAXKY4WkASbzXmwt5AvTvohHA4WSUBmj2Jt+IThQChrAOLQC13vPFMAOAQwuyTAeAKVQto3OBDOdESh2YxNZPbpYBQNbEAoBfod7e1i1BiwB0voSZWgwAOWgtAGPhD18E8ASIiRIAXNPwXJBtcqMbAFAIr5weIJMAcIx1aAAIqk0lAuycompyFwBMHAsAZlj/lgw0rsy2AkhbsgK4Q+70CUBjxeFXsUb0G1HJDJC9rketZRcCWCJwHM8DgJm7b7ch+XizXm25QQxiEOcXvwGCWOhbCZC0qAAAAABJRU5ErkJggg=='
    startingScreen.startLabel.texture = new THREE.Texture(startingScreen.startLabel.image)
    startingScreen.startLabel.texture.magFilter = THREE.NearestFilter
    startingScreen.startLabel.texture.minFilter = THREE.LinearFilter
    startingScreen.startLabel.texture.needsUpdate = true
    startingScreen.startLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: startingScreen.startLabel.texture })
    startingScreen.startLabel.material.opacity = 0
    startingScreen.startLabel.mesh = new THREE.Mesh(startingScreen.startLabel.geometry, startingScreen.startLabel.material)
    startingScreen.startLabel.mesh.matrixAutoUpdate = false
    counter.scene.add(startingScreen.startLabel.mesh)
    
    // setTimeout(() => {
    //   gsap.to(startingScreen.loadingLabel.material, { duration: 0.3, opacity: 0 })
    //   gsap.to(startingScreen.startLabel.material, { duration: 0.3, opacity: 1, delay: 0.3 })
    // }, 3000)
    
    const img = new Image()
    img.src = new URL('../models/konami/label.png', import.meta.url).href
    // img.src = '/konami/label.png'
    console.log('---------->meta', import.meta)
    img.addEventListener('load', (event) => {
      console.log('============>load', event, img.src)
    })
    img.addEventListener('error', (event) => {
      console.log('============>error', event, img.src)
    })
  }
  const loadResource = (resourceStr: string): Promise<string> | void => {
    let tempArr = resourceStr.split('.')
    let suffix = ''
    if (tempArr.length > 1) {
      suffix = tempArr[tempArr.length - 1]
    } else {
      return
    }
    console.log('----------->suffix', suffix)
    return new Promise((resolve, reject) => {
      if (suffix === 'glb' || suffix === 'gltf') {
        
      } else {
        
      }
    })
  }
  const handleClickLogin = () => {
    fetch('http://localhost:9123/login', {
      method: 'post',
      body: JSON.stringify(toRaw(userInfo)),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.text())
    .then(data => {
      const res = JSON.parse(data)
      if (res.status) {
        counter.uuid = res.uuid
        router.push('/hello')
      } else {
        ElMessage({
          message: res.message,
          type: 'error'
        })
      }
    })
    .catch(err => {
      console.log(`err:${JSON.parse(err)}`)
    })
  }
</script>

<template>
  <el-form
    label-position="left"
    label-width="auto"
    :model="userInfo"
    style="
      max-width: 600px;
      border: 1px solid #dcdfe6;
      position: relative;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 50px;
      z-index: 999;
    "
  >
    <el-form-item label="Name">
      <el-input @keydown.enter="handleClickLogin" v-model="userInfo.name"></el-input>
    </el-form-item>
    <el-form-item label="Password">
      <el-input @keydown.enter="handleClickLogin" v-model="userInfo.password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button @click="handleClickLogin">login</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
  
</style>