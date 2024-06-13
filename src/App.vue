<script setup lang="ts">
  import HelloWorld from './components/HelloWorld.vue'
  import Login from './views/Login.vue'
  import { ref, onMounted, reactive } from 'vue'
  import { useCounterStore } from '@/stores/counter'
  import * as THREE from 'three'
  
  const counter = useCounterStore()
  
  onMounted(() => {
    counter.deviceType = determineDevice()
  })
  const determineDevice = () => {
    const userAgentInfo = navigator.userAgent
    const agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    let deviceType = 'PC'
    agents.forEach(item => {
      if (userAgentInfo.includes(item)) {
        deviceType = 'mobileDevice'
      }
    })
    return deviceType;
  }
</script>

<template>
  <!-- <HelloWorld></HelloWorld> -->
  <!-- <Login></Login> -->
  <router-view></router-view>
</template>

<style lang="scss" scoped>
  // .zzh {
  //   width: 100px;
  //   height: 100px;
  //   mask-image: url('../public/block-file.svg');
  //   background-color: currentColor;
  //   color: red;
  // }
</style>