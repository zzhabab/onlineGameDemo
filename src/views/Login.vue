<template>
  <div class="box" style="max-height: 500px; overflow: auto;">
    <div class="container" :style="`height: ${myList.length * 100}px;`">
      <div class="transitionBox" style="width: 700px;">
        <div class="boxItem" style="width: 100%; height: 100px; text-align: center;" :style="index % 2 === 0 ? 'background-color: lightgray;' : ''" v-for="(item, index) in myList.slice(startIndex, endIndex)">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    reactive,
    onMounted,
    nextTick,
    defineAsyncComponent,
    toRaw,
    computed
  } from 'vue'
  
  const myList = Array.from({length: 100}, (_, index) => index)
  let startIndex = ref(0)
  let endIndex = ref(7)
  let initFlag = true
  let lastScrollTop = 0
  
  onMounted(() => {
    const boxElement = document.querySelector('.box')
    boxElement?.addEventListener('scroll', (event) => {
      // 往下滚
      const currentScrollTop = event.target.scrollTop
      if (currentScrollTop - lastScrollTop >= 60) {
        
        lastScrollTop = currentScrollTop
      }
      if (currentScrollTop - lastScrollTop <= -60) {
        lastScrollTop = currentScrollTop
      }
    })
  })
  
  // onMounted(() => {
  //   const boxElement = document.querySelector('.box')
  //   const myObserver = new IntersectionObserver((entries) => {
  //     if (initFlag) {
  //       initFlag = !initFlag
  //     } else {
  //       entries.forEach(entry => {
  //         if (entry.intersectionRatio === 1) {
  //           console.log('------------>entry', entry.target)
  //           startIndex.value = startIndex.value + 1
  //           endIndex.value = endIndex.value + 1
  //           const boxItemElList = document.querySelectorAll('.boxItem')
  //           myObserver.observe(boxItemElList[boxItemElList.length - 1])
  //         }
  //       })
  //     }
  //   }, {root: boxElement, threshold: [0, 1]})
  //   nextTick(() => {
  //     const boxItemElList = document.querySelectorAll('.boxItem')
  //     boxItemElList.forEach(item => {
  //       myObserver.observe(item)
  //     })
  //   })
  // })
  
</script>

<style>
  
</style>