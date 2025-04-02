"use client"

import "./globals.css"
import BottomNav from "./components/BottomNav"
import "regenerator-runtime/runtime"
import type React from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import { VideoTutorialButton } from "@/components/VideoTutorialButton"
import { AuthProvider } from "@/app/components/AuthProvider"
import { usePathname } from "next/navigation"

// 创建一个包装组件来使用 usePathname hook
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 只在主页路径显示底部导航栏
  const showBottomNav =
    pathname === "/" || pathname === "/devices" || pathname === "/content" || pathname === "/profile"

  return (
    <div className="mx-auto w-full">
      <main className="w-full mx-auto bg-white min-h-screen flex flex-col relative lg:max-w-7xl xl:max-w-[1200px]">
        {children}
        {showBottomNav && <BottomNav />}
        {showBottomNav && <VideoTutorialButton />}
      </main>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100">
        <AuthProvider>
          <ErrorBoundary>
            <LayoutContent>{children}</LayoutContent>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}

