import Vue from 'vue'
import Router from 'vue-router'
import AuthRouter from './auth'
import HomeRouter from './home'
import SystemRouter from './system'
import ProductRouter from '@/router/product';
import TaskRouter from '@/router/task';
import DeviceRouter from '@/router/device';
import { isLogin } from '@/utils/auth'
import store from '@/store'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => console.log(err))
}

Vue.use(Router)

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view'),
}

const routes = [
  AuthRouter,
  HomeRouter,
  SystemRouter,
  ProductRouter,
  TaskRouter,
  DeviceRouter,
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/layout'),
    meta: {
      title: '',
      needLogin: true,
    },
  },
  {
    path: '*',
    name: '404 NotFound',
    component: () => import('@/views/other/404'),
    meta: {
      title: '404 NotFound',
      needLogin: false,
    },
  },
]

const router = new Router({
  routes,
  mode: 'hash',
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? to.meta.title : '医视管理系统'
  
  // 检查路由是否需要登录
  if (to.meta.needLogin) {
    // 检查登录状态
    if (isLogin()) {
      next()
    } else {
      // 未登录，重定向到登录页
      next({ path: '/auth/login' })
    }
  } else {
    // 如果是访问登录页且已登录，则跳转到首页
    if (to.path === '/auth/login' && isLogin()) {
      next({ path: '/' })
    } else {
      next()
    }
  }
})

export default router
