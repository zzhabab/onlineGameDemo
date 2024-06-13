import { createRouter, createWebHistory } from 'vue-router'

export const constantRoutes = [
  //重定向--一般设置为首页
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/hello',
    component: () => import('@/components/HelloWorld.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes]
})
router.beforeEach((to, from, next: Function) => {
  next();
});

export default router;