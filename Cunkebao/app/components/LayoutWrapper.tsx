"use client"

import { usePathname } from "next/navigation"
import BottomNav from "./BottomNav"
import { VideoTutorialButton } from "@/components/VideoTutorialButton"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// 创建视图模式上下文
const ViewModeContext = createContext<{ viewMode: "desktop" | "mobile" }>({ viewMode: "desktop" })

// 创建视图模式钩子函数
export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) {
    throw new Error("useViewMode must be used within a LayoutWrapper")
  }
  return context
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  // 检测视图模式
  useEffect(() => {
    const checkViewMode = () => {
      setViewMode(window.innerWidth < 768 ? "mobile" : "desktop")
    }
    
    // 初始检测
    checkViewMode()
    
    // 监听窗口大小变化
    window.addEventListener("resize", checkViewMode)
    
    return () => {
      window.removeEventListener("resize", checkViewMode)
    }
  }, [])

  // 只在四个主页显示底部导航栏：首页、场景获客、工作台和我的
  const mainPages = ["/", "/scenarios", "/workspace", "/profile"]
  const showBottomNav = mainPages.includes(pathname)

  return (
    <ViewModeContext.Provider value={{ viewMode }}>
      <div className="mx-auto w-full">
        <main className="w-full mx-auto bg-white min-h-screen flex flex-col relative lg:max-w-7xl xl:max-w-[1200px]">
          {children}
          {showBottomNav && <BottomNav />}
          {showBottomNav && <VideoTutorialButton />}
        </main>
      </div>
    </ViewModeContext.Provider>
  )
}

