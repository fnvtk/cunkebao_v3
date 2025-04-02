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
    <div className="mx-auto w-full">
      <main className="w-full mx-auto bg-white min-h-screen flex flex-col relative lg:max-w-7xl xl:max-w-[1200px]">
        {children}
        {showBottomNav && <BottomNav />}
        {showBottomNav && <VideoTutorialButton />}
      </main>
    </div>
  )
}

