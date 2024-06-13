import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router/index'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' })
    .then(function (registration) {
      // 注册成功
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    })
    .catch(function (err) {
      // 注册失败:
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')