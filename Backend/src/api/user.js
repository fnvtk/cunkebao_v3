import { post } from '@/utils/request'

// 登录服务接口
export const ServeLogin = data => {
  return post('/backend/user/login', data)
}

export const ServeGetUser = () => {
  return post('/backend/user/get')
}

export const ServeSetUserPassword = (data) => {
  return post('/backend/user/password', data)
}

// 退出登录服务接口
export const ServeLogout = data => {
  return post('/backend/user/logout', data)
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