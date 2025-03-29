"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Smartphone, Battery, Wifi, MessageCircle, Users, Settings, History } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WechatAccount {
  id: string
  avatar: string
  nickname: string
  wechatId: string
  gender: "male" | "female"
  status: "normal" | "abnormal"
  addFriendStatus: "enabled" | "disabled"
  friendCount: number
  lastActive: string
}

interface Device {
  id: string
  imei: string
  name: string
  status: "online" | "offline"
  battery: number
  lastActive: string
  historicalIds: string[]
  wechatAccounts: WechatAccount[]
  features: {
    autoAddFriend: boolean
    autoReply: boolean
    contentSync: boolean
    aiChat: boolean
  }
  history: {
    time: string
    action: string
    operator: string
  }[]
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [device, setDevice] = useState<Device | null>(null)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    // 模拟API调用
    const mockDevice: Device = {
      id: params.id as string,
      imei: "sd123123",
      name: "设备 1",
      status: "online",
      battery: 85,
      lastActive: "2024-02-09 15:30:45",
      historicalIds: ["vx412321", "vfbadasd"],
      wechatAccounts: [
        {
          id: "1",
          avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-q2rVrFbfDdAbSnT3ZTNE7gfn3QCbvr.png",
          nickname: "老张",
          wechatId: "wxid_abc123",
          gender: "male",
          status: "normal",
          addFriendStatus: "enabled",
          friendCount: 523,
          lastActive: "2024-02-09 15:20:33",
        },
        {
          id: "2",
          avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-q2rVrFbfDdAbSnT3ZTNE7gfn3QCbvr.png",
          nickname: "老李",
          wechatId: "wxid_xyz789",
          gender: "male",
          status: "abnormal",
          addFriendStatus: "disabled",
          friendCount: 245,
          lastActive: "2024-02-09 14:15:22",
        },
      ],
      features: {
        autoAddFriend: true,
        autoReply: true,
        contentSync: false,
        aiChat: true,
      },
      history: [
        {
          time: "2024-02-09 15:30:45",
          action: "开启自动加好友",
          operator: "系统",
        },
        {
          time: "2024-02-09 14:20:33",
          action: "添加微信号",
          operator: "管理员",
        },
      ],
    }
    setDevice(mockDevice)
  }, [params.id])

  if (!device) {
    return <div>加载中...</div>
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-[390px] mx-auto bg-white">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-medium">设备详情</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium truncate">{device.name}</h2>
                  <Badge variant={device.status === "online" ? "success" : "secondary"}>
                    {device.status === "online" ? "在线" : "离线"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">IMEI: {device.imei}</div>
                <div className="text-sm text-gray-500">历史ID: {device.historicalIds.join(", ")}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Battery className={`w-4 h-4 ${device.battery < 20 ? "text-red-500" : "text-green-500"}`} />
                <span className="text-sm">{device.battery}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{device.status === "online" ? "已连接" : "未连接"}</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">最后活跃：{device.lastActive}</div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">基本信息</TabsTrigger>
              <TabsTrigger value="accounts">关联账号</TabsTrigger>
              <TabsTrigger value="history">操作记录</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>自动加好友</Label>
                      <div className="text-sm text-gray-500">自动通过好友验证</div>
                    </div>
                    <Switch checked={device.features.autoAddFriend} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>自动回复</Label>
                      <div className="text-sm text-gray-500">自动回复好友消息</div>
                    </div>
                    <Switch checked={device.features.autoReply} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>朋友圈同步</Label>
                      <div className="text-sm text-gray-500">自动同步朋友圈内容</div>
                    </div>
                    <Switch checked={device.features.contentSync} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI会话</Label>
                      <div className="text-sm text-gray-500">启用AI智能对话</div>
                    </div>
                    <Switch checked={device.features.aiChat} />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="accounts">
              <Card className="p-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {device.wechatAccounts.map((account) => (
                      <div key={account.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={account.avatar || "/placeholder.svg"}
                          alt={account.nickname}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">{account.nickname}</div>
                            <Badge variant={account.status === "normal" ? "success" : "destructive"}>
                              {account.status === "normal" ? "正常" : "异常"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">微信号: {account.wechatId}</div>
                          <div className="text-sm text-gray-500">性别: {account.gender === "male" ? "男" : "女"}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">好友数: {account.friendCount}</span>
                            <Badge variant={account.addFriendStatus === "enabled" ? "outline" : "secondary"}>
                              {account.addFriendStatus === "enabled" ? "可加友" : "已停用"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {device.history.map((record, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-50 rounded-full">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{record.action}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            操作人: {record.operator} · {record.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">好友总数</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {device?.wechatAccounts?.reduce((sum, account) => sum + account.friendCount, 0)}
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">消息数量</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-2">5,678</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

