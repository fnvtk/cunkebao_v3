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
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 检查token有效性并初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      const storedToken = safeLocalStorage.getItem("token")
      
      if (storedToken) {
        try {
          // 验证token是否有效
          const isValid = await validateToken()
          
          if (isValid) {
            // 从localStorage获取用户信息
            const userDataStr = safeLocalStorage.getItem("user")
            if (userDataStr) {
              const userData = JSON.parse(userDataStr) as User
              setToken(storedToken)
              setUser(userData)
              setIsAuthenticated(true)
            } else {
              // token有效但没有用户信息，清除token
              handleLogout()
            }
          } else {
            // token无效，清除
            handleLogout()
          }
        } catch (error) {
          console.error("验证token时出错:", error)
          handleLogout()
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

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
      {isLoading ? <div className="flex h-screen w-screen items-center justify-center">加载中...</div> : children}
    </AuthContext.Provider>
  )
}

