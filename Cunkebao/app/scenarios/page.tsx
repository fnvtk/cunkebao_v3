"use client"

import type React from "react"
import { TrendingUp, Users, ChevronLeft, Bot, Sparkles, Plus, Phone } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Channel {
  id: string
  name: string
  icon: string
  stats: {
    daily: number
    growth: number
  }
  link?: string
  plans?: Plan[]
}

interface Plan {
  id: string
  name: string
  isNew?: boolean
  status: "active" | "paused" | "completed"
  acquisitionCount: number
}

// 调整场景顺序，确保API获客在最后
const channels: Channel[] = [
  {
    id: "haibao",
    name: "海报获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-x92XJgXy4MI7moNYlA1EAes2FqDxMH.png",
    stats: {
      daily: 167,
      growth: 10.2,
    },
    link: "/scenarios/haibao",
    plans: [
      {
        id: "plan-5",
        name: "产品海报获客",
        isNew: true,
        status: "active",
        acquisitionCount: 45,
      },
    ],
  },
  {
    id: "order",
    name: "订单获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-203hwGO5hn7hTByGiJltmtACbQF4yl.png",
    stats: {
      daily: 112,
      growth: 7.8,
    },
    link: "/scenarios/order",
    plans: [
      {
        id: "plan-9",
        name: "电商订单获客",
        status: "active",
        acquisitionCount: 42,
      },
    ],
  },
  {
    id: "douyin",
    name: "抖音获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-QR8ManuDplYTySUJsY4mymiZkDYnQ9.png",
    stats: {
      daily: 156,
      growth: 12.5,
    },
    link: "/scenarios/douyin",
    plans: [
      {
        id: "plan-1",
        name: "抖音直播间获客",
        isNew: true,
        status: "active",
        acquisitionCount: 56,
      },
      {
        id: "plan-2",
        name: "抖音评论区获客",
        status: "completed",
        acquisitionCount: 128,
      },
    ],
  },
  {
    id: "xiaohongshu",
    name: "小红书获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JXQOWS9M8mxbAgvFSlA8cCl64p3OiF.png",
    stats: {
      daily: 89,
      growth: 8.3,
    },
    link: "/scenarios/xiaohongshu",
    plans: [
      {
        id: "plan-3",
        name: "小红书笔记获客",
        isNew: true,
        status: "active",
        acquisitionCount: 32,
      },
    ],
  },
  {
    id: "phone",
    name: "电话获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/phone-icon-Hs9Ck3Ij7aqCOoY5NkhxQnXBnT5LGU.png",
    stats: {
      daily: 42,
      growth: 15.8,
    },
    link: "/scenarios/phone",
    plans: [
      {
        id: "phone-1",
        name: "招商电话获客",
        isNew: true,
        status: "active",
        acquisitionCount: 28,
      },
    ],
  },
  {
    id: "gongzhonghao",
    name: "公众号获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Gsg0CMf5tsZb41mioszdjqU1WmsRxW.png",
    stats: {
      daily: 234,
      growth: 15.7,
    },
    link: "/scenarios/gongzhonghao",
    plans: [
      {
        id: "plan-4",
        name: "公众号文章获客",
        status: "active",
        acquisitionCount: 87,
      },
    ],
  },
  {
    id: "weixinqun",
    name: "微信群获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-azCH8EgGfidWXOqiM2D1jLH0VFRUtW.png",
    stats: {
      daily: 145,
      growth: 11.2,
    },
    link: "/scenarios/weixinqun",
    plans: [
      {
        id: "plan-6",
        name: "微信群活动获客",
        status: "paused",
        acquisitionCount: 23,
      },
    ],
  },
  {
    id: "payment",
    name: "付款码获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FI5qJhBgV87ZS3P2WrUDsVyV91Y78i.png",
    stats: {
      daily: 78,
      growth: 9.5,
    },
    link: "/scenarios/payment",
    plans: [
      {
        id: "plan-7",
        name: "支付宝码获客",
        status: "active",
        acquisitionCount: 19,
      },
    ],
  },
  {
    id: "api",
    name: "API获客",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JKtHDY1Ula8ya0XKQDxle5qrcE0qC5.png",
    stats: {
      daily: 198,
      growth: 14.3,
    },
    link: "/scenarios/api",
    plans: [
      {
        id: "plan-8",
        name: "网站表单获客",
        isNew: true,
        status: "active",
        acquisitionCount: 67,
      },
    ],
  },
]

const aiScenarios = [
  {
    id: "ai-friend",
    name: "AI智能加友",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-azCH8EgGfidWXOqiM2D1jLH0VFRUtW.png",
    description: "智能分析目标用户画像，自动筛选优质客户",
    stats: {
      daily: 245,
      growth: 18.5,
    },
    plans: [
      {
        id: "ai-plan-1",
        name: "AI智能筛选计划",
        isNew: true,
        status: "active",
        acquisitionCount: 78,
      },
    ],
  },
  {
    id: "ai-group",
    name: "AI群引流",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-azCH8EgGfidWXOqiM2D1jLH0VFRUtW.png",
    description: "智能群聊互动，提高群活跃度和转化率",
    stats: {
      daily: 178,
      growth: 15.2,
    },
    plans: [
      {
        id: "ai-plan-2",
        name: "AI群聊互动计划",
        status: "active",
        acquisitionCount: 56,
      },
    ],
  },
  {
    id: "ai-conversion",
    name: "AI场景转化",
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-m4ENUaZon82EPFHod2dP1dajlrRdVG.png",
    description: "多场景智能营销，提升获客转化效果",
    stats: {
      daily: 134,
      growth: 12.8,
    },
    plans: [
      {
        id: "ai-plan-3",
        name: "AI多场景营销",
        isNew: true,
        status: "active",
        acquisitionCount: 43,
      },
    ],
  },
]

export default function ScenariosPage() {
  const router = useRouter()
  const handleChannelClick = (channelId: string, event: React.MouseEvent) => {
    router.push(`/scenarios/${channelId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "paused":
        return "bg-amber-100 text-amber-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "执行中"
      case "paused":
        return "已暂停"
      case "completed":
        return "已完成"
      default:
        return "未知状态"
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-[390px] mx-auto bg-white min-h-screen">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-blue-600">场景获客</h1>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/plans/new")}>
              <Plus className="h-4 w-4 mr-2" />
              新建计划
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* Traditional channels */}
          <div className="grid grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex flex-col">
                <Card
                  className={`p-4 hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => router.push(channel.link || "")}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      {channel.id === "phone" ? (
                        <Phone className="w-8 h-8 text-blue-500" />
                      ) : (
                        <img
                          src={channel.icon || "/placeholder.svg"}
                          alt={channel.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                    </div>

                    <h3 className="text-sm font-medium text-blue-600">{channel.name}</h3>

                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <div className="flex items-baseline">
                        <span className="text-xs text-gray-500">今日：</span>
                        <span className="text-base font-medium ml-1">{channel.stats.daily}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-green-500 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+{channel.stats.growth}%</span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* AI scenarios */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-medium">AI智能获客</h2>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">Beta</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {aiScenarios.map((scenario) => (
                <div key={scenario.id} className="flex flex-col">
                  <Card
                    className={`p-4 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white border-2 border-blue-100`}
                    onClick={() => router.push(scenario.link || "")}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                      </div>

                      <h3 className="text-sm font-medium text-blue-600">{scenario.name}</h3>
                      <p className="text-xs text-gray-500 text-center line-clamp-2">{scenario.description}</p>

                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <div className="flex items-baseline">
                          <span className="text-xs text-gray-500">今日：</span>
                          <span className="text-base font-medium ml-1">{scenario.stats.daily}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-green-500 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>+{scenario.stats.growth}%</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

