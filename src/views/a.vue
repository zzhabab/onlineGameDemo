<template>
  <div style="width: 100%; height: 200px; background-color: antiquewhite;">
    i am aaaaaaaaaaaaaa
    <button @click="handleClick">666</button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, defineAsyncComponent, toRaw } from 'vue'
import workerFile from '../webWorker/test.js?url'
let myWorker = null
const webworkerFn = () => {
  myWorker = new Worker(workerFile)
  const obj = {
    message: 'i am main thread'
  }
  myWorker.postMessage(obj)
  myWorker.onmessage = (e) => {
    console.log('-------------->onmessage main', e, JSON.parse(e.data), typeof JSON.parse(e.data))
  }
  myWorker.onerror = (e) => {
    console.log('-------------->onerror main', e)
  }
}
const handleClick = () => {
  fetch('http://localhost:9123/test', {
    method: 'get',
    // body: JSON.stringify({
    //   name: 'zzh'
    // }),
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => response.text())
  .then(data => {
    console.log(`response:${JSON.stringify(data)}`)
  })
  .catch(err => {
    console.log(`err:${JSON.stringify(err)}`)
  })
}
onMounted(() => {
  // draw()
  // webworkerFn()
  // myWorker.postMessage('i am main thread')
})
</script>

<style>
</style>