var cacheName = '0.0.0';
self.addEventListener('install', function (e) {
});
self.addEventListener('fetch', function (e) {
  e.respondWith(
    (async () => {
      let myResponse
      try{
        const myMatchCache = await caches.match(e.request)
        if (myMatchCache) {
          return myMatchCache
        } else {
          // 这里如果使用then的链式执行可能会出问题，外层自执行函数就是异步而then链式
          // 调用也是异步那就导致了e.respondWidth(param)中的param没获得我们想要的return res
          myResponse = await fetch(e.request)
          const myCache = await caches.open(cacheName)
          if ((e.request.url.startsWith('http') || e.request.url.startsWith('https')) && myResponse.status !== 206) {
            myCache.put(e.request, myResponse.clone())
          }
          return myResponse.clone()
        }
      }catch(err){
        console.log('------------>err', err)
      }
    })()
  )
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    (async () => {
      const myCache = await caches.open(cacheName)
      const myResponse = await myCache.matchAll()
      await Promise.all(myResponse.map(async (item, index) => {
        await myCache.delete(item.url)
      }))
      return self.clients.claim()
    })()
  )
})