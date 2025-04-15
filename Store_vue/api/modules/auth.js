import { request, requestWithRetry } from '../config'

// 认证相关API
export const authApi = {
    // 用户登录
    login: (account, password) => {
        return request({
            url: '/v1/auth/login',
            method: 'POST',
            data: {
                account: account,
                password: password,
                typeId: 2 // 固定为2
            }
        })
    }
} 