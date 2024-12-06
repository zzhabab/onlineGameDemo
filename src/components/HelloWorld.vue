<script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useCounterStore } from '@/stores/counter'
  import { ElLoading, ElMessage } from 'element-plus'
  import { World } from '@/typeScript/World'
  import * as THREE from 'three'
  import { Ball, Player } from '@/typeScript/Role'
  import { gsap } from "gsap";

  const counter = useCounterStore()
  const serverAddress = 'ws://localhost:8080'
  let ws: WebSocket
  const firstEnterTime = new Date()
  let reconnectCount = 0
  let connectLoading: any
  const settingShow = ref(false)
  const storeShow = ref(false)
  let characterElement: HTMLDivElement
  const characterElementList: Array<{
    uuid: string,
    element: HTMLDivElement
  }> = []
  let behaviorArray = ref<Array<string>>([])
  let optionOneArray = ref<Array<string>>([])
  let optionTwoArray = ref<Array<string>>([])

  class LastSettingItemOption {
    index: number | null
    type: string | null
    content: string | null
    element: HTMLDivElement | null
    constructor() {
      this.index = null
      this.type = null
      this.content = null
      this.element = null
    }
    init = () => {
      this.index = null
      this.type = null
      this.content = null
      this.element = null
    }
  }
  let world: World
  const lastSettingItemOption = new LastSettingItemOption()
  const chatMessage = ref('')
  // 这里如果给historyContentList.push(1)也不会出现报错，也许还需要什么其他操作？
  const historyContentList = reactive<string []>([])
  
  onMounted(async () => {
    connectLoading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    const establishConnectionPromise = await establishConnection()
    if (establishConnectionPromise === 'open') {
      world = new World()
      setControl()
      handleMessage()
      initClassNameMoreDiv()
    }
    if (establishConnectionPromise === 'error') {

    }
  })
  const establishConnection = () => {
    return new Promise((resolve, reject) => {
      ws = new WebSocket(serverAddress)
      ws.addEventListener('open', async (event) => {
        connectLoading.close()
        resolve('open')
      })
      // 尝试连接失败后也会触发这个listener
      ws.addEventListener('error', (event) => {
        const currentTime = new Date()
        // 60000毫秒也就是一分钟的超时
        if (currentTime.getTime() - firstEnterTime.getTime() < 60000) {
          establishConnection()
          reconnectCount++
          console.log('尝试连接时间：', reconnectCount, currentTime.getTime() - firstEnterTime.getTime())
        } else {
          console.log('connection timed out', event)
          reject('error')
        }
      })
    })
  }
  const loadCharacter = (uuid: string) : Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const sceneElement = document.querySelector('.scene')
        characterElement = document.createElement('div')
        characterElement.setAttribute('id', uuid)
        characterElement.style.width = '10vw'
        characterElement.style.height = '10vh'
        characterElement.style.backgroundColor = 'rgb(173, 216, 156)'
        characterElement.style.position = 'fixed'
        characterElement.innerText = uuid
        sceneElement!.appendChild(characterElement)
        characterElementList.push({
          uuid: uuid,
          element: characterElement
        })
        resolve(true)
      } catch (e) {
        console.error('角色加载失败', e)
        reject(false)
      }
    })
  }
  const reqKeyboardCommands = () => {
    fetch('http://localhost:9123/reqKeyboardCommands', {
      method: 'post',
      body: JSON.stringify({
        name: counter.uuid
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.text())
    .then(data => {
      const res = JSON.parse(data)
      behaviorArray.value = res.data.map(({ behavior }: {behavior: string}) => behavior)
      optionOneArray.value = res.data.map(({ optionOne }: {optionOne: string}) => optionOne)
      optionTwoArray.value = res.data.map(({ optionTwo }: {optionTwo: string}) => optionTwo)
    })
    .catch(err => {
      console.error('api错误', err)
    })
  }
  const setControl = () => {
    // 两种操作方式
    if (counter.deviceType === 'PC') {
      reqKeyboardCommands()
      window.addEventListener('keydown', (e) => {
        const keydownEventTarget: HTMLElement = e.target as HTMLElement
        if (keydownEventTarget.getAttribute('id') === 'userInputBox') {
          return
        }
        if (lastSettingItemOption.type && lastSettingItemOption.index !== null) {
          let targetIndex = Math.max(optionOneArray.value.indexOf(e.key.toLowerCase()), optionTwoArray.value.indexOf(e.key.toLowerCase()))
          if (targetIndex >= 0) {
            lastSettingItemOption.element!.textContent = lastSettingItemOption.content
            ElMessage({
              message: `键位"${behaviorArray.value[lastSettingItemOption.index]}"冲突`,
              type: 'error'
            })
          } else {
            if (lastSettingItemOption.type === 'optionOne') {
              optionOneArray.value[lastSettingItemOption.index] = e.key.toLowerCase()
            }
            if (lastSettingItemOption.type === 'optionTwo') {
              optionTwoArray.value[lastSettingItemOption.index] = e.key.toLowerCase()
            }
          }
          lastSettingItemOption.init()
          return
        }
        const obj = {
          type: 'behavior',
          data: e.key.toLowerCase(),
          uuid: counter.uuid
        }
        ws.send(JSON.stringify(obj))
      })
    }
    if (counter.deviceType === 'Mobile') {
      
    }
  }
  const initClassNameMoreDiv = () => {
    const moreBoxElement: HTMLDivElement = document.querySelector('.moreBox') as HTMLDivElement
    // 键盘是hover展开，移动端是click
    if (counter.deviceType === 'PC') {
      moreBoxElement!.addEventListener('mouseenter', e => {
        moreBoxElement.style.height = 'calc(9vw + 20px)'
      })
      moreBoxElement!.addEventListener('mouseleave', e => {
        moreBoxElement.style.height = '3vw'
      })
    }
    if (counter.deviceType === 'Mobile') {
      
    }
  }
  const handleMessage = () => {
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data)
      if (res.type === 'behavior') {
        if (res.status) {
          const optionOneIndex = optionOneArray.value.indexOf(res.data)
          const optionTwoIndex = optionTwoArray.value.indexOf(res.data)
          if (optionOneIndex >= 0 || optionTwoIndex >= 0) {
            const reallyIndex = Math.max(optionOneIndex, optionTwoIndex)
            const reallyBehavior = behaviorArray.value[reallyIndex]
            const activeElementIndex = characterElementList.findIndex(item => item.uuid === res.uuid)
            const activeElement = characterElementList[activeElementIndex].element
            const characterRect = activeElement.getBoundingClientRect();
            switch (reallyBehavior){
              case 'forward':
                activeElement.style.top = characterRect.top - 1 + 'px'
                break;
              case 'backward':
                activeElement.style.top = characterRect.top + 1 + 'px'
                break;
              case 'turnLeft':
                activeElement.style.left = characterRect.left - 1 + 'px'
                break;
              case 'turnRight':
                activeElement.style.left = characterRect.left + 1 + 'px'
                break;
              default:
                break;
            }
          }
        } else {
          console.error(res.message)
        }
      }
      if (res.type === 'chat') {
        if (res.status) {
          const historyContentElement = document.querySelector('.historyContent')
          historyContentList.push(`${res.uuid}:${res.data}`)
          nextTick(() => {
            historyContentElement!.scrollTop = 9999
          })
        }
      }
      if (res.type === 'loadCharacter') {
        if (res.status) {
          res.uuidList.forEach((item: string) => {
            const el = document.getElementById(item)
            if (!el) {
              loadCharacter(item)
            }
          })
        }
      }
    })
  }
  const handleClickSendMessage = () => {
    const obj = {
      type: 'chat',
      data: chatMessage.value,
      uuid: counter.uuid
    }
    ws.send(JSON.stringify(obj))
    chatMessage.value = ''
  }
  const handleClickSetting = () => {
    lastSettingItemOption.init()
    settingShow.value = true
  }
  const handleClickStore = () => {
    storeShow.value = true
  }
  const handleSettingAndStoreClose = () => {
    settingShow.value = false
    storeShow.value = false
  }
  const handleSettingItemClick = (event: MouseEvent, type: string, myIndex: number) => {
    if (lastSettingItemOption.type) {
      lastSettingItemOption.element!.textContent = lastSettingItemOption.content
    }
    lastSettingItemOption.type = type
    lastSettingItemOption.index = myIndex
    lastSettingItemOption.content = (event.target as HTMLDivElement).textContent
    lastSettingItemOption.element = event.target as HTMLDivElement
    (event.target as HTMLDivElement).textContent = '请按键'
  }
  const handleLogOut = () => {
    ws.close()
  }
  const forward = () => {
    const player = world.playerList[0]
    player.actions.idle.play().crossFadeTo(player.actions.run.play(), 0.5, true);
    gsap.to(player.model.position, {
      duration: 5,
      z: -10,
      ease: "power2.out",
      onComplete: () => {
        player.actions.run.play().crossFadeTo(player.actions.run.stop(), 0.5, true);
      }
    })
  }
  const idle = () => {
    const player = world.playerList[0]
    player.actions.idle.play()
  }
  const zzh = () => {
    // const _ball = world.roleList[0] as Ball
    // gsap.to(_ball.ballBody.position, {
    //   duration: 5,
    //   x: 5,
    //   ease: "power2.out",
    // })

    // _ball.ballBody.velocity.set(5,0,0)

    console.log('-----ss------>zzh', counter.resources)
  }
  onBeforeUnmount(() => {
    counter.scene.remove(...counter.scene.children)
  })
</script>

<template>
  <div class="container"></div>
  <div style="position: absolute; top: 0; left: 100px; z-index: 999;">
    <button @click="forward">forward</button>
    <button @click="idle">idle</button>
    <button @click="zzh">zzh</button>
  </div>
  <div class="moreBox">
    <div class="more"></div>
    <div class="setting" @click="handleClickSetting"></div>
    <div class="store" @click="handleClickStore"></div>
  </div>
  <div class="chatBox">
    <div class="historyContent">
      <div class="historyContentItem" v-for="item in historyContentList">{{ item }}</div>
    </div>
    <div class="inputBox">
      <div class="left">
        <input id="userInputBox" autocomplete="off" @keydown.enter="handleClickSendMessage" v-model="chatMessage" />
      </div>
      <div class="right">
        <button @click="handleClickSendMessage">发送</button>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="settingShow"
    title="设置"
    width="70vw"
    :before-close="handleSettingAndStoreClose"
  >
    <div class="settingDialogBody">
      <div v-for="(item, index) in behaviorArray" class="optionContainer" :style="index === behaviorArray.length - 1 ? '' : 'margin-bottom: 2vh;'">
        <div style="width: 100px;">{{ item }}</div>
        <div class="optionContainerItem" @click="handleSettingItemClick($event, 'optionOne', index)">{{ optionOneArray[index] }}</div>
        <div class="optionContainerItem" @click="handleSettingItemClick($event, 'optionTwo', index)">{{ optionTwoArray[index] }}</div>
      </div>
      <div style="flex: 1;"></div>
      <div style="display: flex; width: 100%;">
        <el-button style="margin-left: auto;">确定</el-button>
        <el-button>默认设置</el-button>
      </div>
    </div>
  </el-dialog>
  <el-dialog
    v-model="storeShow"
    title="商城"
    width="70vw"
    :before-close="handleSettingAndStoreClose"
  >
    <span>This is a message</span>
  </el-dialog>
</template>

<style lang="scss" scoped>
  @import "@/common/index.scss";
  $myTransitionDuration: 0.5s;
  .container {
    width: 100vw;
    height: 100vh;
  }
  .moreBox {
    z-index: 999;
    width: 3vw;
    height: 3vw;
    margin: 10px;
    position: absolute;
    top: 0;
    right: 0;
    transition: all $myTransitionDuration;
    overflow: hidden;
    div {
      cursor: pointer;
      width: 3vw;
      height: 3vw;
      border-radius: 50%;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: center;
    }
    .more {
      background-image: url('@/images/mainScreen/more.svg');
    }
    .setting {
      background-image: url('@/images/mainScreen/setting.svg');
      margin: 10px 0px;
    }
    .store {
      background-image: url('@/images/mainScreen/store.svg');
    }
  }
  .chatBox {
    z-index: 999;
    width: 30vw;
    height: 20vh;
    position: absolute;
    bottom: 0;
    left: 0;
    border-radius: 0 20px 0 0;
    border: 1px solid black;
    background-color: transparent;
    border-bottom: none;
    overflow: hidden;
    transition: all $myTransitionDuration;
    .historyContent {
      background-color: rgba($color: #ffffff, $alpha: 0.2);
      width: 100%;
      max-height: 85%;
      height: 85%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      position: relative;
      .historyContentItem {
        width: 100%;
      }
    }
    .inputBox {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 15%;
      display: flex;
      .left {
        width: 80%;
        height: 100%;
        input {
          height: 100%;
          width: 100%;
        }
      }
      .right {
        width: 20%;
        height: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        button {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
  .settingDialogBody {
    display: flex;
    flex-direction: column;
    border: 1px solid $defaultBorderColor;
    border-radius: 3px;
    height: 60vh;
    padding: 2vh 2vw;
  }
  .optionContainer {
    @include flex(row, space-between, center);
    width: 100%;
    .optionContainerItem {
      width: 10vw;
      cursor: pointer;
      text-align: center;
      padding: .2vh .2vw;
      border: 1px solid $defaultBorderColor;
      border-radius: 3px;
      &:hover {
        background-color: rgba($themeColor, 0.2);
      }
    }
  }
</style>