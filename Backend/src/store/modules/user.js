import { setUserInfo, getUserInfo, removeAll, getToken, isLogin } from '@/utils/auth'

import { ServeLogout, ServeRefreshToken } from '@/api/user'

let state = {
  // 用户ID
  id: 0,
  // 角色
  role: '',
  // 权限
  permissions: [],
  // 账号
  username: '',
  // 姓名
  name: '',
  // 个性头像
  avatar: require('@/assets/image/detault-avatar.jpg'),
  // 当前登录状态
  loginStatus: false,
  // 原有字段保持不变
  channel_id: 0,
  channel_name: '',
  mobile: '',
  login_time: '',
  login_count: 0,
  login_ip: '',
  create_time: '',
  mod_game: false,
}

// 判断用户是否登录
if (isLogin()) {
  let userInfo = getUserInfo()

  // 更新状态
  state.id = userInfo.id
  state.username = userInfo.username
  state.name = userInfo.name
  state.role = userInfo.role
  state.permissions = userInfo.permissions || []
  state.loginStatus = true
  
  // 兼容原有字段
  state.channel_id = userInfo.channel_id || 0
  state.channel_name = userInfo.channel_name || ''
  state.mobile = userInfo.mobile || ''
  state.login_time = userInfo.login_time || ''
  state.login_count = userInfo.login_count || 0
  state.login_ip = userInfo.login_ip || ''
  state.create_time = userInfo.create_time || ''
  state.mod_game = userInfo.mod_game || false
  state.roles = userInfo.roles || []

  console.log('userInfo: ', userInfo)
}

const User = {
  state,
  mutations: {
    // 用户退出登录
    USER_LOGOUT(state) {
      state.id = 0
      state.username = ''
      state.name = ''
      state.role = ''
      state.permissions = []
      state.loginStatus = false
      
      // 原有字段重置
      state.channel_id = 0
      state.channel_name = ''
      state.mobile = ''
      state.login_time = ''
      state.login_count = 0
      state.login_ip = ''
      state.create_time = ''
      state.roles = []
      state.mod_game = false
    },

    // 设置用户登录状态
    UPDATE_LOGIN_STATUS(state, status) {
      state.loginStatus = status
    },

    // 更新用户信息
    UPDATE_USER_INFO(state, data) {
      for (const key in data) {
        if (state.hasOwnProperty(key)) {
          state[key] = data[key]
        }
      }

      // 保存用户信息到缓存
      setUserInfo({
        id: state.id,
        username: state.username,
        name: state.name,
        role: state.role,
        permissions: state.permissions || [],
        // 兼容原有字段
        channel_id: state.channel_id,
        channel_name: state.channel_name,
        mobile: state.mobile,
        login_time: state.login_time,
        login_count: state.login_count,
        login_ip: state.login_ip,
        create_time: state.create_time,
        roles: state.roles || [],
        mod_game: state.mod_game,
      })
    },
  },
  actions: {
    // 退出登录处理操作
    ACT_USER_LOGOUT({ commit }) {
      commit('USER_LOGOUT')
      ServeLogout().finally(() => {
        removeAll()
        location.reload()
      })
    },
    
    // 刷新令牌
    ACT_REFRESH_TOKEN({ commit }) {
      return new Promise((resolve, reject) => {
        ServeRefreshToken()
          .then(res => {
            if (res.code === 200) {
              // 更新token
              setToken(res.data.token, res.data.token_expired - Math.floor(Date.now() / 1000))
              resolve(res)
            } else {
              reject(res)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
  },
}

export default User
