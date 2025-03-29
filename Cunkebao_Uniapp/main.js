import Vue from 'vue'
import App from './App'

// 引入uView UI
import uView from 'uview-ui'
Vue.use(uView)

// 设置为 false 以阻止 Vue 在启动时生成生产提示
Vue.config.productionTip = false

// 导入全局样式
import './uni.scss'

// 导入请求拦截和封装
import Request from './utils/request'
Vue.prototype.$request = Request

// 导入API
import * as UserApi from './api/user'
Vue.prototype.$userApi = UserApi

// 导入工具函数
import Utils from './utils/common'
Vue.prototype.$utils = Utils

// 导入权限检查
import Auth from './utils/auth'
Vue.prototype.$auth = Auth

App.mpType = 'app'

// #ifdef MP
// 引入uView对小程序分享的mixin封装
const mpShare = require('uview-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)
// #endif

const app = new Vue({
  ...App
})

// 挂载uView到Vue原型，使用时可以使用this.$u访问
Vue.prototype.$u = Vue.prototype.$u || {}

// 如果采用了自定义主题，必须加入这个
import uviewTheme from './uni.scss'
Vue.prototype.$u.config.unit = 'rpx'

app.$mount() 