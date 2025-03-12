import Vue from 'vue'
import Router from 'vue-router'
import AuthRouter from './auth'
import HomeRouter from './home'
import SystemRouter from './system'
import ProductRouter from '@/router/product';
import TaskRouter from '@/router/task';
import DeviceRouter from '@/router/device';

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

export default new Router({
  routes,
  mode: 'hash',
})
