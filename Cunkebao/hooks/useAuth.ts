import { useState, useEffect } from 'react'

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 检查本地存储的token
        const token = localStorage.getItem('token')
        if (!token) {
          setState({ isAuthenticated: false, isLoading: false, user: null })
          return
        }

        // TODO: 这里可以添加token验证的API调用
        // const response = await validateToken(token)
        // if (response.valid) {
        //   setState({ isAuthenticated: true, isLoading: false, user: response.user })
        // } else {
        //   setState({ isAuthenticated: false, isLoading: false, user: null })
        // }

        // 临时：仅检查token存在性
        setState({ isAuthenticated: true, isLoading: false, user: { token } })
      } catch (error) {
        console.error('Auth check failed:', error)
        setState({ isAuthenticated: false, isLoading: false, user: null })
      }
    }

    checkAuth()
  }, [])

  return state
} 