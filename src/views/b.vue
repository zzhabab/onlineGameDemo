<template>
  <div style="width: 100%; height: 200px; background-color: rebeccapurple;">
    i am bbbbbbbbbbbb
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, defineAsyncComponent, toRaw } from 'vue'
import workerFile from '../webWorker/test.js?url'
const webworkerFn = () => {
  const myWorker = new Worker(workerFile)
  myWorker.postMessage('i am main thread')
  myWorker.onmessage = (e) => {
    console.log('-------------->onmessage main', e)
  }
  myWorker.onerror = (e) => {
    console.log('-------------->onerror main', e)
  }
}
onMounted(() => {
  // draw()
  webworkerFn()
})
</script>

<style>
</style>