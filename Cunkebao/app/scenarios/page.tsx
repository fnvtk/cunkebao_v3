"use client"
import { useRouter } from "next/navigation"
import { Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { api, ApiResponse } from "@/lib/api"

export default function ScenariosPage() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<any[]>([])
  // AI智能获客用本地 mock 数据
  const aiScenarios = [
    {
      id: "ai-friend",
      name: "AI智能加友",
      icon: "🤖",
      count: 245,
      growth: "+18.5%",
      description: "智能分析目标用户画像，自动筛选优质客户",
      path: "/scenarios/ai-friend",
    },
    {
      id: "ai-group",
      name: "AI群引流",
      icon: "🤖",
      count: 178,
      growth: "+15.2%",
      description: "智能群管理，提高群活跃度，增强获客效果",
      path: "/scenarios/ai-group",
    },
    {
      id: "ai-conversion",
      name: "AI场景转化",
      icon: "🤖",
      count: 134,
      growth: "+12.8%",
      description: "多场景智能营销，提升获客转化率",
      path: "/scenarios/ai-conversion",
    },
  ]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    api.get<ApiResponse>("/v1/plan/scenes")
      .then((res) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          setScenarios(res.data)
        } else {
          setError(res.msg || "接口返回异常")
        }
      })
      .catch((err) => setError(err?.message || "接口请求失败"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-40">加载中...</div>
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">场景获客</h1>
          <Button onClick={() => router.push("/scenarios/new")} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新建计划
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/scenarios/${scenario.id}`)}
            >
              <CardContent className="p-4 flex flex-col items-center">
                <img src={scenario.image} alt={scenario.name} className="w-12 h-12 mb-2 rounded" />
                <h3 className="text-blue-600 font-medium text-center">{scenario.name}</h3>
                {scenario.description && (
                  <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{scenario.description}</p>
                )}
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <span>今日: </span>
                  <span className="font-medium ml-1">{scenario.count}</span>
                </div>
                <div className="flex items-center mt-1 text-green-500 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{scenario.growth}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/*
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium">AI智能获客</h2>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600">
              Beta
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {aiScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(scenario.path)}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-3xl mb-2">{scenario.icon}</div>
                  <h3 className="text-blue-600 font-medium text-center">{scenario.name}</h3>
                  <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{scenario.description}</p>
                  <div className="flex items-center mt-2 text-gray-500 text-sm">
                    <span>今日: </span>
                    <span className="font-medium ml-1">{scenario.count}</span>
                  </div>
                  <div className="flex items-center mt-1 text-green-500 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>{scenario.growth}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        */}
      </div>
    </div>
  )
}
