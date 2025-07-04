"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Settings, Bell, LogOut } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/app/components/AuthProvider"
import ClientOnly from "@/components/ClientOnly"
import { getClientRandomId } from "@/lib/utils"

const menuItems = [
  { href: "/devices", label: "设备管理" },
  { href: "/wechat-accounts", label: "微信号管理" },
  { href: "/traffic-pool", label: "流量池" },
  { href: "/content", label: "内容库" },
]

export default function ProfilePage() {
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  // 从localStorage获取用户信息
  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      setUserInfo(JSON.parse(userInfoStr))
    }
  }, [])

  const handleLogout = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('token_expired')
    localStorage.removeItem('s2_accountId')
    localStorage.removeItem('userInfo')
    setShowLogoutDialog(false)
    router.push("/login")
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-white pb-16">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold text-blue-600">我的</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* 用户信息卡片 */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userInfo?.avatar || ""} />
              <AvatarFallback>{userInfo?.username ? userInfo.username.slice(0, 2) : "用户"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-blue-600">{userInfo?.username || "用户"}</h2>
              <p className="text-gray-500">
                账号: <ClientOnly fallback="加载中...">
                  {userInfo?.account || Math.floor(10000000 + Math.random() * 90000000).toString()}
                </ClientOnly>
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm">
                  编辑资料
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 功能菜单 */}
        <Card className="divide-y">
          {menuItems.map((item) => (
            <div
              key={item.href || item.label}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => (item.href ? router.push(item.href) : null)}
            >
              <div className="flex items-center">
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </Card>

        {/* 退出登录按钮 */}
        <Button
          variant="ghost"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 mt-6"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </div>

      {/* 退出登录确认对话框 */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认退出登录</DialogTitle>
            <DialogDescription>您确定要退出登录吗？退出后需要重新登录才能使用完整功能。</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              确认退出
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

