"use client"

import { useState, useEffect, useRef } from "react"
import type React from "react"
import { TrendingUp, Users, ChevronLeft, Bot, Sparkles, Plus, Phone } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchScenes, transformSceneItem } from "@/api/scenarios"

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

// AI场景列表（服务端暂未提供）
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
    link: "/scenarios/ai-friend",
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
    link: "/scenarios/ai-group",
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
    link: "/scenarios/ai-conversion",
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
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 使用ref跟踪组件挂载状态
  const isMounted = useRef(true);
  // 使用ref跟踪是否已经加载过数据
  const hasLoadedRef = useRef(false);

  // 组件卸载时更新挂载状态
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // 组件未挂载，不执行操作
    if (!isMounted.current) return;
    
    // 如果已经加载过数据，不再重复请求
    if (hasLoadedRef.current && channels.length > 0) return;

    const loadScenes = async () => {
      try {
        setLoading(true)
        const response = await fetchScenes({ limit: 50 })
        
        if (response.code === 200 && response.data?.list) {
          // 转换场景数据为前端展示格式
          const transformedScenes = response.data.list.map((scene) => {
            const transformedScene = transformSceneItem(scene)
            
            // 添加link属性（用于导航）
            return {
              ...transformedScene,
              link: `/scenarios/${scene.id}`
            }
          })
          
          // 只有在组件仍然挂载的情况下才更新状态
          if (isMounted.current) {
            setChannels(transformedScenes)
            // 标记已加载过数据
            hasLoadedRef.current = true;
          }
        } else {
          if (isMounted.current) {
            setError(response.msg || "获取场景列表失败")
          }
        }
      } catch (err) {
        console.error("Failed to fetch scenes:", err)
        if (isMounted.current) {
          setError("获取场景列表失败")
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }
    
    loadScenes()
  }, [])

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
  
  // 展示场景骨架屏
  const renderSkeletons = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="flex flex-col">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          </Card>
        </div>
      ))
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="w-full mx-auto bg-white min-h-screen lg:max-w-7xl xl:max-w-[1200px]">
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
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => window.location.reload()}
              >
                重试
              </Button>
            </div>
          )}
          
          {/* Traditional channels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
              renderSkeletons()
            ) : (
              channels.map((channel) => (
                <div key={channel.id} className="flex flex-col">
                  <Card
                    className={`p-4 hover:shadow-lg transition-all cursor-pointer`}
                    onClick={() => router.push(channel.link || "")}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <img
                          src={channel.icon || "/placeholder.svg"}
                          alt={channel.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // 图片加载失败时，使用默认图标
                            const target = e.target as HTMLImageElement
                            target.src = "/assets/icons/poster-icon.svg"
                          }}
                        />
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
                        <span>{channel.stats.growth > 0 ? "+" : ""}{channel.stats.growth}%</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>

          {/* AI scenarios */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-medium">AI智能获客</h2>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">Beta</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

