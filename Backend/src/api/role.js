import { post } from '@/utils/request'

export const RoleIndex = data => {
  return post('/manage/role/index', data)
}

export const RoleSave = data => {
  return post('/manage/role/save', data)
}

export const RolePrivileges = data => {
  return post('/manage/role/privileges', data)
}