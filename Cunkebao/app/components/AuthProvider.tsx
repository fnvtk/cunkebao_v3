"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { validateToken } from "@/lib/api"

// 安全的localStorage访问方法
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }
}

interface User {
  id: number;
  username: string;
  account?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  login: (token: string, userData: User) => void
  logout: () => void
  updateToken: (newToken: string) => void
}

// 创建默认上下文
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  updateToken: () => {}
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 避免在服务端渲染时设置初始状态
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // 初始页面加载时显示为false，避免在服务端渲染和客户端水合时不匹配
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // 初始化认证状态
  useEffect(() => {
    // 仅在客户端执行初始化
    setIsLoading(true)
    
    const initAuth = async () => {
      try {
        const storedToken = safeLocalStorage.getItem("token")
        
        if (storedToken) {
          // 首先尝试从localStorage获取用户信息
          const userDataStr = safeLocalStorage.getItem("userInfo")
          if (userDataStr) {
            try {
              // 如果能解析用户数据，先设置登录状态
              const userData = JSON.parse(userDataStr) as User
              setToken(storedToken)
              setUser(userData)
              setIsAuthenticated(true)
              
              // 然后在后台尝试验证token，但不影响当前登录状态
              validateToken().then(isValid => {
                // 只有在确认token绝对无效时才登出
                // 网络错误等情况默认保持登录状态
                if (isValid === false) {
                  console.warn('验证token失败，但仍允许用户保持登录状态')
                }
              }).catch(error => {
                // 捕获所有验证过程中的错误，并记录日志
                console.error('验证token过程中出错:', error)
                // 网络错误等不会导致登出
              })
            } catch (parseError) {
              // 用户数据无法解析，需要清除
              console.error('解析用户数据失败:', parseError)
              handleLogout()
            }
          } else {
            // 有token但没有用户信息，可能是部分数据丢失
            console.warn('找到token但没有用户信息，尝试保持登录状态')
            
            // 尝试验证token并获取用户信息
            try {
              const isValid = await validateToken()
              if (isValid) {
                // 如果token有效，尝试从API获取用户信息
                // 这里简化处理，直接使用token
                setToken(storedToken)
                setIsAuthenticated(true)
              } else {
                // token确认无效，清除
                handleLogout()
              }
            } catch (error) {
              // 验证过程出错，记录日志但不登出
              console.error('验证token过程中出错:', error)
              // 保留token，允许用户继续使用
              setToken(storedToken)
              setIsAuthenticated(true)
            }
          }
        }
      } catch (error) {
        console.error("初始化认证状态时出错:", error)
        // 非401错误不应强制登出
        if (error instanceof Error && 
            (error.message.includes('401') || 
             error.message.includes('未授权') || 
             error.message.includes('token'))) {
          handleLogout()
        }
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initAuth()
  }, []) // 空依赖数组，仅在组件挂载时执行一次

  const handleLogout = () => {
    safeLocalStorage.removeItem("token")
    safeLocalStorage.removeItem("user")
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = (newToken: string, userData: User) => {
    safeLocalStorage.setItem("token", newToken)
    safeLocalStorage.setItem("user", JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    handleLogout()
    // 登出后不强制跳转到登录页
    // router.push("/login")
  }

  // 用于刷新 token 的方法
  const updateToken = (newToken: string) => {
    safeLocalStorage.setItem("token", newToken)
    setToken(newToken)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, updateToken }}>
      {isLoading && isInitialized ? (
        <div className="flex h-screen w-screen items-center justify-center">加载中...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

