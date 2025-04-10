"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderKanban, UserCog } from "lucide-react"
import useAuthCheck from "@/hooks/useAuthCheck"
import { getAdminInfo, getGreeting } from "@/lib/utils"
import ClientOnly from "@/components/ClientOnly"

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("")
  const [userName, setUserName] = useState("")

  // 验证用户是否已登录
  useAuthCheck()

  useEffect(() => {
    // 获取用户信息
    const adminInfo = getAdminInfo()
    if (adminInfo) {
      setUserName(adminInfo.name || "管理员")
    } else {
      setUserName("管理员")
    }
  }, [])

  // 单独处理问候语，避免依赖问题
  useEffect(() => {
    // 设置问候语
    const updateGreeting = () => {
      if (userName) {
        setGreeting(getGreeting(userName))
      }
    }
    
    updateGreeting()
    
    // 每分钟更新一次问候语，以防用户长时间停留在页面
    const interval = setInterval(updateGreeting, 60000)
    
    return () => clearInterval(interval)
  }, [userName])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">欢迎使用超级管理员后台</h1>
      <p className="text-muted-foreground">
        <ClientOnly fallback={`你好，${userName}！`}>
          {greeting || getGreeting(userName)}
        </ClientOnly>
        ！通过此平台，您可以管理项目、客户和管理员权限。
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

