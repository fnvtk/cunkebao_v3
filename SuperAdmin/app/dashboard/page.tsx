"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderKanban, UserCog } from "lucide-react"
import useAuthCheck from "@/hooks/useAuthCheck"

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("")
  const [userName, setUserName] = useState("")

  // 验证用户是否已登录
  useAuthCheck()

  useEffect(() => {
    // 获取用户信息
    const adminInfo = localStorage.getItem("admin_info")
    if (adminInfo) {
      try {
        const { name } = JSON.parse(adminInfo)
        setUserName(name || "管理员")
      } catch (err) {
        console.error("解析用户信息失败:", err)
      }
    }

    // 获取当前时间
    const hour = new Date().getHours()
    let timeGreeting = ""
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = "上午好"
    } else if (hour >= 12 && hour < 14) {
      timeGreeting = "中午好"
    } else if (hour >= 14 && hour < 18) {
      timeGreeting = "下午好"
    } else {
      timeGreeting = "晚上好"
    }
    
    setGreeting(timeGreeting)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">欢迎使用超级管理员后台</h1>
      <p className="text-muted-foreground">
        {greeting}，{userName}！通过此平台，您可以管理项目、客户和管理员权限。
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">较上月增长 12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">客户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">较上月增长 8%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理员数量</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">较上月增长 2 人</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

