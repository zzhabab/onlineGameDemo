<template>
  <canvas id="canvas" style="border: 1px solid" width="200" height="200"></canvas>
  <video id="video" controls="true" width="200px" height="200px" src="./zzh.mp4"></video>
  <canvas id="canvas2" style="border: 1px solid" width="200" height="200"></canvas>
  <div style="margin-right: 20px; border: 1px solid black; width: fit-content;" @click="handleClic(index)"
    v-for="(item, index) in list">
    {{ item }}
  </div>
  <component :is="componentsList[currentIndex]"></component>
  <!-- <DotLottieVue style="height: 500px; width: 500px" autoplay loop :src="globalLoading" />
  <DotLottieVue style="height: 500px; width: 500px" autoplay loop :src="partLoading" /> -->
  <div class="scrollContainer" style="border: 1px solid black; overflow: auto; width: 500px; height: 300px; display: flex; flex-wrap: wrap;">
    <template v-for="(item, index) in myList.slice(startIndex, endIndex)" :key="index">
      <div class="countBox" style="width: 50px; height: 50px; margin-right: 10px; margin-top: 10px; background-color: antiquewhite;">
        {{ item.count }}
      </div>
    </template>
  </div>
</template>

<script setup>
  import {
    ref,
    reactive,
    onMounted,
    nextTick,
    defineAsyncComponent,
    toRaw,
    computed
  } from 'vue'
  import zzhImg from './zzh.png'
  import A from './a.vue'
  import B from './b.vue'
  import {
    DotLottieVue
  } from '@lottiefiles/dotlottie-vue'
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
    img.onload = function() {
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
  
  const myList = ref(Array.from({length: 100}, (_, index) => {
    return {
      count: index + 1
    }
  }))
  let startIndex = ref(0)
  let endIndex = ref(50)
  
  onMounted(() => {
    myList.value.forEach((item, index) => {
      if (index < endIndex.value) {
        item.show = true
      }
    })
    const myObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        // if (entry.intersectionRatio === 0) {
        //   console.log('----------->entry.intersectionRatio===0', entry.intersectionRatio, entry.target)
        // } else if (entry.intersectionRatio === 1) {
        //   console.log('----------->entry.intersectionRatio===1', entry.intersectionRatio, entry.target)
        // }
        // endIndex.value = Math.min(100, endIndex.value + 1)
        // const elList = document.querySelectorAll('.countBox')
        // const lastEl = elList[elList.length - 1]
        // myObserver.observe(lastEl)
        
        // endIndex.value = Math.min(100, endIndex.value + 1)
        // startIndex.value = Math.min(100, startIndex.value + 1)
        // myObserver.unobserve(entry.target)
        // const elList = document.querySelectorAll('.countBox')
        // const lastEl = elList[elList.length - 1]
        // myObserver.observe(lastEl)
        // console.log('ifffffffffffffff', startIndex.value, endIndex.value, entry.target)
        
      } else {
        // const elList = document.querySelectorAll('.countBox')
        // const firstEl = elList[0]
        // myObserver.unobserve(firstEl)
        // startIndex.value = Math.min(100, startIndex.value + 1)
        // console.log('elseeeeeeeeeeeeeee', startIndex.value, endIndex.value, entry.target)
      }
    }, {root: document.querySelector('.scrollContainer'), threshold: [0, 0.5, 1]})
    nextTick(() => {
      const elList = document.querySelectorAll('.countBox')
      elList.forEach(item => {
        myObserver.observe(item)
      })
    })
    
    var request = indexedDB.open('myDatabase', 1);
    request.onerror = function(event) {
      console.log('数据库打开失败')
    };
    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      var objectStore = db.createObjectStore('myObjectStore', {
        keyPath: 'id',
        autoIncrement: true
      });
      objectStore.createIndex('name', 'name', {
        unique: false
      });
    };
    request.onsuccess = function(event) {
      var db = event.target.result;
      var transaction = db.transaction(['myObjectStore'], 'readwrite');
      var objectStore = transaction.objectStore('myObjectStore');
      var customerData = [{
          name: '张三',
          email: 'zhangsan@example.com'
        },
        {
          name: '李四',
          email: 'lisi@example.com'
        }
      ];
      customerData.forEach(function(data) {
        objectStore.add(data);
      });
      // 查看objectStore中的所有数据
      var getRequest = objectStore.openCursor();
      getRequest.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            console.log('Key:', cursor.key, 'Value:', cursor.value);
            cursor.continue();
        } else {
            console.log('所有数据已经遍历完成');
        }
      };
      var getRequest = objectStore.get(1);
      getRequest.onsuccess = function() {
        var data = getRequest.result;
        console.log('获取到数据:', data);
        data.email = 'zhangsan_updated@example.com';
        var updateRequest = objectStore.put(data);
        updateRequest.onsuccess = function() {
          console.log('数据更新成功');
          var getRequestAgain = objectStore.get(1);
          getRequestAgain.onsuccess = function() {
            var updatedData = getRequestAgain.result;
            console.log('更新后的数据:', updatedData);
          };
        };
      };
      // 删除objectStore中的所有数据
      objectStore.clear()
      transaction.oncomplete = function() {
        console.log('事务完成');
        db.close();
      };
    };
  })
</script>

<style>
  
</style>