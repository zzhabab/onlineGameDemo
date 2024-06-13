const express = require('express');
const cors = require('cors');

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
app.post('/test', (req, res) => {
    console.log(req.body)
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 3600000); // 过期时间为当前时间加1小时
    res.setHeader('Expires', expirationDate.toUTCString());
    res.send('here is test')
});
app.listen(9123,() => {
    console.log('success 9123')
});
// node index.js启动