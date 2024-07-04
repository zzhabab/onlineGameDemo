<template>
  <!-- <div class="box" style="max-height: 500px; overflow: auto;">
    <div class="container" style="position: relative;" :style="`height: ${myList.length * itemHeight}px;`">
      <div class="transitionBox" style="width: 100%; position: absolute;">
        <div class="boxItem" style="width: 100%; height: 100px; text-align: center;" :style="parseInt(item) % 2 === 0 ? 'background-color: lightgray;' : ''" v-for="(item, index) in myList.slice(startIndex, startIndex + count)">
          {{ item }}
        </div>
      </div>
    </div>
  </div> -->
  <div class="box" style="max-height: 500px; overflow: auto;">
    <div class="container" style="position: relative;" :style="`height: ${myList.length * itemHeight}px;`">
      <div class="transitionBox" style="width: 100%; position: absolute;">
        <div class="boxItem" style="width: 100%; height: 100px; text-align: center;" :style="parseInt(item) % 2 === 0 ? 'background-color: lightgray;' : ''" v-for="(item, index) in myList.slice(startIndex, startIndex + count)">
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
  } from 'vue'
  
  const myList = Array.from({length: 1000}, (_, index) => index)
  let startIndex = ref(0)
  const count = 7
  let lastModuloResult = 0
  const itemHeight = 100
  
  // onMounted(() => {
  //   const boxElement = document.querySelector('.box')
  //   const transitionBoxElement = document.querySelector('.transitionBox')
  //   boxElement?.addEventListener('scroll', (event) => {
  //     const currentScrollTop = event.target.scrollTop
  //     const moduloResult = Math.min(parseInt(currentScrollTop / itemHeight), myList.length - count)
  //     // 往下滚
  //     if (moduloResult > lastModuloResult) {
  //       startIndex.value = Math.min(startIndex.value + (moduloResult - lastModuloResult), myList.length)
  //       transitionBoxElement.style.top = currentScrollTop + 'px'
  //       lastModuloResult = moduloResult
  //     }
  //     // 往上滚
  //     if (moduloResult < lastModuloResult) {
  //       startIndex.value = Math.max(startIndex.value - (lastModuloResult - moduloResult), 0)
  //       // 三元表达式的赋值为0px很有必要，可以调节top值的误差
  //       transitionBoxElement.style.top = moduloResult === 0 ? '0px' : currentScrollTop - itemHeight + 'px'
  //       lastModuloResult = moduloResult
  //     }
  //   })
  // })
</script>

<style>
  
</style>