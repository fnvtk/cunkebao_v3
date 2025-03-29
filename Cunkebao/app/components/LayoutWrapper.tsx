"use client"

import { usePathname } from "next/navigation"
import BottomNav from "./BottomNav"
import { VideoTutorialButton } from "@/components/VideoTutorialButton"
import type React from "react"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 只在四个主页显示底部导航栏：首页、场景获客、工作台和我的
  const mainPages = ["/", "/scenarios", "/workspace", "/profile"]
  const showBottomNav = mainPages.includes(pathname)

  return (
    <main className="max-w-[390px] mx-auto bg-white min-h-screen flex flex-col relative">
      {children}
      {showBottomNav && <BottomNav />}
      {showBottomNav && <VideoTutorialButton />}
    </main>
  )
}

