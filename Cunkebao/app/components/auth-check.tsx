"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 排除不需要登录的页面
    const publicPaths = ['/login', '/register', '/forgot-password']
    if (publicPaths.includes(pathname)) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      // 如果没有token，重定向到登录页面，并携带当前页面URL作为回调
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
  }, [router, pathname])

  return <>{children}</>
} 