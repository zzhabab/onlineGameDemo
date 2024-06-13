<template>
  <canvas id="canvas" style="border: 1px solid" width="200" height="200"></canvas>
  <video id="video" controls="true" width="200px" height="200px" src="./zzh.mp4"></video>
  <canvas id="canvas2" style="border: 1px solid" width="200" height="200"></canvas>
  <div style="margin-right: 20px; border: 1px solid black; width: fit-content;" @click="handleClic(index)" v-for="(item, index) in list">
    {{ item }}
  </div>
  <component :is="componentsList[currentIndex]"></component>
  <!-- <DotLottieVue style="height: 500px; width: 500px" autoplay loop :src="globalLoading" />
  <DotLottieVue style="height: 500px; width: 500px" autoplay loop :src="partLoading" /> -->
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, defineAsyncComponent, toRaw } from 'vue'
import zzhImg from './zzh.png'
import A from './a.vue'
import B from './b.vue'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import globalLoading from './globalLoading.json?url'
import partLoading from './partLoading.json?url'
const list = ['A', 'B']
const componentsList = [A, B]
const currentIndex = ref(0)
const handleClic = async (index) => {
  currentIndex.value = index
  await nextTick()
}
const draw = () => {
  const videoElement = document.getElementById('video')
  const canvasElement = document.getElementById('canvas')
  const canvasElement2 = document.getElementById('canvas2')
  let ctx = canvasElement.getContext('2d')
  let ctx2 = canvasElement2.getContext('2d')
  let imgData
  const img = new Image(200, 200)
  img.onload = function () {
    ctx2.drawImage(img, 0, 0);
    imgData = ctx2.getImageData(0, 0, 200, 200);
  }
  img.src = zzhImg
  videoElement.addEventListener('play', () => {
    const computeFrame = () => {
      if (videoElement.paused || videoElement.ended) {
        return
      }
      ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
      let frame = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)
      let l = frame.data.length / 4;
      for (let i = 0; i < l; i++) {
        let r = frame.data[i * 4 + 0];
        let g = frame.data[i * 4 + 1];
        let b = frame.data[i * 4 + 2];
        // if (r === 97 && g === 255 && b === 9) {
        if (r >= 87 && r <= 107 && g >= 245 && g <= 265 && b >= 0 && b <= 19) {
          // frame.data[i * 4 + 3] = 0
          frame.data[i * 4 + 0] = imgData.data[i * 4 + 0]
          frame.data[i * 4 + 1] = imgData.data[i * 4 + 1]
          frame.data[i * 4 + 2] = imgData.data[i * 4 + 2]
        }
      }
      ctx2.putImageData(frame, 0, 0);
      setTimeout(() => {
        computeFrame()
      }, 0)
    }
    computeFrame()
  })
}
onMounted(() => {
  // draw()
})
</script>

<style>
</style>