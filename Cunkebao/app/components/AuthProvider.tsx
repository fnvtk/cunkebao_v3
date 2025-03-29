"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 客户端检查token
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        setToken(storedToken)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // 暂时禁用重定向逻辑，允许访问所有页面
        // 将来需要恢复登录验证时，取消下面注释
        /*
        if (pathname !== "/login") {
          router.push("/login")
        }
        */
      }
    }
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setIsAuthenticated(false)
    // 登出后不强制跳转到登录页
    // router.push("/login")
  }

  return <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>{children}</AuthContext.Provider>
}

