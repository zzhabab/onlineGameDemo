// import { WebSocket } from 'ws'
// import DFAUtil from './dfa.js'
const DFAUtil = require('./dfa');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const uuidList = []

const loadCharacter = () => {
  const allClients = Array.from(ws.clients)
  allClients.forEach((item, index) => {
    const obj = {
      status: true,
      type: "loadCharacter",
      uuidList: uuidList
    }
    item.send(JSON.stringify(obj))
  })
}
const ws = new WebSocket.Server({port: 8080}, () => {
  console.log('启动成功')
})
ws.on('connection', (socket) => {
  console.log('连接成功')
  loadCharacter()
  socket.on('message', (e) => {
    console.log(JSON.parse(e))
    const req = JSON.parse(e)
    let violatingWords
    if (req.type === 'chat') {
      const dfaUtil = new DFAUtil();
      const set = new Set();
      set.add("我操");
      set.add("我草");
      set.add("fuck");
      dfaUtil.createDFAHashMap(set);
      const violationSet = dfaUtil.getSensitiveWordByDFAMap(req.data, 2)
      console.log('--------------', violationSet)
      if (violationSet.size !== 0) {
        violatingWords = Array.from(violationSet)[0]
        const regex = new RegExp(violatingWords, 'g')
        req.data = req.data.replace(regex, '*'.repeat(violatingWords.length))
      }
    }
    const obj = {
      status: true,
      type: req.type,
      data: req.data,
      uuid: req.uuid
    }
    // 广播,向所有连接的人发送
    ws.clients.forEach(item => {
      item.send(JSON.stringify(obj))
    })
    // if (req.type === 'chat') {
    //   ws.clients.forEach(item => {
    //     item.send(JSON.stringify(obj))
    //   })
    // } else {
    //   socket.send(JSON.stringify(obj))
    // }
  })
  // 心跳检测
  let heartInreaval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      const obj = {
        status: true,
        type: 'ping',
        data: 'ping'
      }
      socket.send(JSON.stringify(obj))
    } else {
      clearInterval(heartInreaval)
    }
  }, 5000)
})
// http
const app = express();
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.post('/tracker', (req, res) => {
  const list = Object.keys(req.body)
  list.forEach(item => {
    console.log('-----------------------------')
    const obj = JSON.parse(item)
    for (let key in obj) {
      console.log(key + ': ' + obj[key] + '\r\n');
    }
    console.log('-----------------------------')
  })
  res.send('good')
});
// app.post('/test', (req, res) => {
//     console.log(req.body)
//     res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
//     const now = new Date();
//     const expirationDate = new Date(now.getTime() + 3600000); // 过期时间为当前时间加1小时
//     res.setHeader('Expires', expirationDate.toUTCString());
//     res.send('here is test')
// });
app.post('/reqKeyboardCommands', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 3600000); // 过期时间为当前时间加1小时
    res.setHeader('Expires', expirationDate.toUTCString());
    let obj = {
      state: true,
      data: [
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
    }
    res.send(obj)
});
// data中有name、password目前认为name是uuid
app.post('/login', (req, res) => {
    const data = JSON.parse(JSON.stringify(req.body))
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 3600000); // 过期时间为当前时间加1小时
    res.setHeader('Expires', expirationDate.toUTCString());
    let obj
    let flag = true
    if (data.name === '') {
      flag = false
      obj = {
        status: false,
        uuid: data.name,
        message: '未输入用户名'
      }
    }
    if (uuidList.includes(data.name)) {
      flag = false
      obj = {
        status: false,
        uuid: data.name,
        message: '重复登录'
      }
    }
    if (flag) {
      uuidList.push(data.name)
      obj = {
        status: true,
        uuid: data.name,
        message: ''
      }
    }
    res.send(obj)
});
app.listen(9123,() => {
    console.log('success 9123')
});