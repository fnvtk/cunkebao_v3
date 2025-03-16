import { post, get } from '@/utils/request'

// 登录服务接口
export const ServeLogin = data => {
  return post('/api/auth/login', data)
}

// 获取用户信息
export const ServeGetUser = () => {
  return get('/api/auth/info')
}

// 刷新token
export const ServeRefreshToken = () => {
  return post('/api/auth/refresh')
}

export const ServeSetUserPassword = (data) => {
  return post('/backend/user/password', data)
}

// 退出登录服务接口
export const ServeLogout = () => {
  // JWT不需要服务端登出，直接清除本地token即可
  return Promise.resolve({ code: 200, msg: '退出成功' })
}

export const UserIndex = data => {
  return post('/backend/user/index', data)
}

export const UserGetUsername = data => {
  return post('/backend/user/username', data)
}

export const UserSave = data => {
  return post('/backend/user/save', data)
}

export const UserPassword = data => {
  return post('/backend/user/password', data)
}