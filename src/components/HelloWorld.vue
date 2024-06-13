<script setup lang="ts">
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import { useCounterStore } from '@/stores/counter'
  import { ElLoading } from 'element-plus'
  
  const counter = useCounterStore()
  const serverAddress = 'ws://localhost:8080'
  let ws: WebSocket
  const firstEnterTime = new Date()
  let reconnectCount = 0
  let connectLoading: any
  const settingShow = ref(false)
  const storeShow = ref(false)
  const keyboardCommands = [
    {
      behavior: 'forward',
      optionOne: 'w',
      optionTwo: 'arrowup'
    },
    {
      behavior: 'backward',
      optionOne: 's',
      optionTwo: 'arrowdown'
    },
    {
      behavior: 'turnLeft',
      optionOne: 'a',
      optionTwo: 'arrowleft'
    },
    {
      behavior: 'turnRight',
      optionOne: 'd',
      optionTwo: 'arrowright'
    }
  ]
  let characterElement: HTMLDivElement
  const characterElementList: Array<{
    uuid: string,
    element: HTMLDivElement
  }> = []
  const behaviorArray = keyboardCommands.map(({ behavior }) => behavior);
  const optionOneArray = keyboardCommands.map(({ optionOne }) => optionOne);
  const optionTwoArray = keyboardCommands.map(({ optionTwo }) => optionTwo);
  const chatMessage = ref('')
  // ���������historyContentList.push(1)Ҳ������ֱ�����Ҳ������Ҫʲô����������
  const historyContentList = reactive<string []>([])
  
  onMounted(() => {
    connectLoading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    establishConnection()
    initClassNameMoreDiv()
  })
  const loadScene = () : Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const containerElement = document.querySelector('.container')
        const sceneElement = document.createElement('div')
        sceneElement.setAttribute('class', 'scene')
        sceneElement.style.width = '100vw'
        sceneElement.style.height = '100vh'
        sceneElement.style.backgroundColor = 'a'
        containerElement!.appendChild(sceneElement)
        resolve(true)
      } catch (e) {
        console.error('��������ʧ��', e)
        reject(false)
      }
    })
  }
  const loadCharacter = (uuid: string) : Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const sceneElement = document.querySelector('.scene')
        characterElement = document.createElement('div')
        characterElement.setAttribute('id', uuid)
        characterElement.style.width = '5vw'
        characterElement.style.height = '5vh'
        characterElement.style.backgroundColor = 'antiquewhite'
        characterElement.style.position = 'fixed'
        characterElement.innerText = uuid
        sceneElement!.appendChild(characterElement)
        characterElementList.push({
          uuid: uuid,
          element: characterElement
        })
        resolve(true)
      } catch (e) {
        console.error('��ɫ����ʧ��', e)
        reject(false)
      }
    })
  }
  const reqKeyboardCommands = () => {
    fetch('http://localhost:9123/test', {
      method: 'post',
      body: JSON.stringify({
        name: 'zzh'
      }),
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
  const setControl = () => {
    // ���ֲ�����ʽ
    if (counter.deviceType === 'PC') {
      reqKeyboardCommands()
      window.addEventListener('keydown', (e) => {
        const keydownEventTarget: HTMLInputElement = e.target as HTMLInputElement
        if (keydownEventTarget.getAttribute('id') === 'userInputBox') {
          return
        }
        const obj = {
          type: 'behavior',
          data: e.key.toLowerCase(),
          uuid: counter.uuid
        }
        ws.send(JSON.stringify(obj))
      })
    } else {
      
    }
  }
  const initClassNameMoreDiv = () => {
    const moreBoxElement: HTMLDivElement = document.querySelector('.moreBox') as HTMLDivElement
    // ������hoverչ�����ƶ�����click
    if (counter.deviceType === 'PC') {
      moreBoxElement!.addEventListener('mouseenter', e => {
        moreBoxElement.style.height = 'calc(9vw + 20px)'
      })
      moreBoxElement!.addEventListener('mouseleave', e => {
        moreBoxElement.style.height = '3vw'
      })
    } else {
      
    }
  }
  const handleMessage = () => {
    ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data)
      // console.log('---------------->message', res)
      if (res.type === 'behavior') {
        if (res.status) {
          const optionOneIndex = optionOneArray.indexOf(res.data)
          const optionTwoIndex = optionTwoArray.indexOf(res.data)
          if (optionOneIndex >= 0 || optionTwoIndex >= 0) {
            const reallyIndex = Math.max(optionOneIndex, optionTwoIndex)
            const reallyBehavior = behaviorArray[reallyIndex]
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
          console.log(res.uuid)
          loadCharacter(res.uuid)
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
  }
  const handleClickSetting = () => {
    settingShow.value = true
  }
  const handleClickStore = () => {
    storeShow.value = true
  }
  const handleSettingAndStoreClose = () => {
    settingShow.value = false
    storeShow.value = false
  }
  const handleLogOut = () => {
    ws.close()
  }
  const establishConnection = () => {
    ws = new WebSocket(serverAddress)
    ws.addEventListener('open', async (event) => {
      console.log('���ӳɹ�', event)
      console.log(ws.readyState, ws.readyState === 1)
      connectLoading.close()
      await loadScene()
      // await loadCharacter()
      setControl()
      handleMessage()
    })
    // ��������ʧ�ܺ�Ҳ�ᴥ�����listener
    ws.addEventListener('error', (event) => {
      const currentTime = new Date()
      // 60000����Ҳ����һ���ӵĳ�ʱ
      if (currentTime.getTime() - firstEnterTime.getTime() < 60000) {
        establishConnection()
        reconnectCount++
        console.log(reconnectCount, currentTime.getTime() - firstEnterTime.getTime())
      } else {
        console.log('connection timed out', event)
      }
    })
  }
</script>

<template>
  <div class="container"></div>
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
        <input id="userInputBox" @keydown.enter="handleClickSendMessage" v-model="chatMessage" />
      </div>
      <div class="right">
        <button @click="handleClickSendMessage">����</button>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="settingShow"
    title="����"
    width="70vw"
    :before-close="handleSettingAndStoreClose"
  >
    <span>This is a message</span>
  </el-dialog>
  <el-dialog
    v-model="storeShow"
    title="�̳�"
    width="70vw"
    :before-close="handleSettingAndStoreClose"
  >
    <span>This is a message</span>
  </el-dialog>
</template>

<style lang="scss" scoped>
  $myTransitionDuration: 0.5s;
  .container {
    width: 100vw;
    height: 100vh;
  }
  .moreBox {
    width: 3vw;
    height: 3vw;
    margin: 10px;
    position: absolute;
    top: 0;
    right: 0;
    transition: all $myTransitionDuration;
    overflow: hidden;
    div {
      width: 3vw;
      height: 3vw;
      border-radius: 50%;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-color: aqua;
    }
    .more {
      background-image: url('../../public/vite.svg');
    }
    .setting {
      background-image: url('../../public/vite.svg');
      margin: 10px 0px;
    }
    .store {
      background-image: url('../../public/vite.svg');
    }
  }
  .chatBox {
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
</style>