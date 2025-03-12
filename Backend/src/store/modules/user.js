import { setUserInfo, getUserInfo, removeAll, getToken } from '@/utils/auth'

import { ServeLogout } from '@/api/user'

let state = {
  // 用户ID
  id: 0,
  // 渠道ID
  channel_id: 0,
  // 渠道名称
  channel_name: '',
  // 账号
  username: '',
  // 姓名
  name: '',
  // 手机号
  mobile: '',
  // 登录时间
  login_time: '',
  // 登录次数
  login_count: 0,
  // 登录IP
  login_ip: '',
  // 创建时间
  create_time: '',
  // 个性头像
  avatar: require('@/assets/image/detault-avatar.jpg'),
  // 角色
  roles: [],
  // 当前登录状态
  loginStatus: false,
  // 是否启动游戏模块
  mod_game: false,
}

// 判断用户是否登录
if (getToken()) {
  let userInfo = getUserInfo()

  state.id          = userInfo.id
  state.channel_id  = userInfo.channel_id
  state.channel_name = userInfo.channel_name
  state.username    = userInfo.username
  state.name        = userInfo.name
  state.mobile      = userInfo.mobile
  state.login_time  = userInfo.login_time
  state.login_count = userInfo.login_count
  state.login_ip    = userInfo.login_ip
  state.create_time = userInfo.create_time
  state.roles       = userInfo.roles ? userInfo.roles: []
  //state.avatar      = userInfo.avatar ? userInfo.avatar : state.avatar
  state.loginStatus = true
  state.mod_game    = userInfo.mod_game

  console.log('userInfo: ', userInfo)
}

const User = {
  state,
  mutations: {
    // 用户退出登录
    USER_LOGOUT(state) {
      state.id          = 0
      state.channel_id  = 0
      state.channel_name = ''
      state.username    = ''
      state.name        = ''
      state.mobile      = ''
      state.login_time  = ''
      state.login_count = 0
      state.login_ip    = ''
      state.create_time = ''
      state.roles       = []
      state.loginStatus = false
      state.mod_game    = false
    },

    // 设置用户登录状态
    UPDATE_LOGIN_STATUS(state) {
      state.loginStatus = true
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
        channel_id: state.channel_id,
        channel_name: state.channel_name,
        username: state.username,
        name: state.name,
        mobile: state.mobile,
        login_time: state.login_time,
        login_count: state.login_count,
        login_ip: state.login_ip,
        create_time: state.create_time,
        roles: state.roles ? state.roles: [],
        mod_game: state.mod_game,
        //avatar: state.avatar,
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
  },
}

export default User
