"use client"
import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Send, Users, Share2, Brain, BarChart2, LineChart, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function WorkspacePage() {
  // 模拟任务数据
  const taskStats = {
    total: 42,
    inProgress: 12,
    completed: 30,
    todayTasks: 12,
    activityRate: 98,
  }

  // 常用功能 - 保持原有排列
  const commonFeatures = [
    {
      id: "auto-like",
      name: "自动点赞",
      description: "智能自动点赞互动",
      icon: <ThumbsUp className="h-5 w-5 text-red-500" />,
      path: "/workspace/auto-like",
      bgColor: "bg-red-100",
      isNew: true,
    },
    {
      id: "moments-sync",
      name: "朋友圈同步",
      description: "自动同步朋友圈内容",
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      path: "/workspace/moments-sync",
      bgColor: "bg-purple-100",
    },
    {
      id: "group-push",
      name: "群消息推送",
      description: "智能群发助手",
      icon: <Send className="h-5 w-5 text-orange-500" />,
      path: "/workspace/group-push",
      bgColor: "bg-orange-100",
    },
    {
      id: "auto-group",
      name: "自动建群",
      description: "智能拉好友建群",
      icon: <Users className="h-5 w-5 text-green-500" />,
      path: "/workspace/auto-group",
      bgColor: "bg-green-100",
    },
    {
      id: "traffic-distribution",
      name: "流量分发",
      description: "管理流量分发和分配",
      icon: <Share2 className="h-5 w-5 text-blue-500" />,
      path: "/workspace/traffic-distribution",
      bgColor: "bg-blue-100",
    },
    {
      id: "ai-assistant",
      name: "AI对话助手",
      description: "智能回复，提高互动质量",
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
      path: "/workspace/ai-assistant",
      bgColor: "bg-blue-100",
      isNew: true,
    },
  ]

  // AI智能助手
  const aiFeatures = [
    {
      id: "ai-analyzer",
      name: "AI数据分析",
      description: "智能分析客户行为特征",
      icon: <BarChart2 className="h-5 w-5 text-indigo-500" />,
      path: "/workspace/ai-analyzer",
      bgColor: "bg-indigo-100",
      isNew: true,
    },
    {
      id: "ai-strategy",
      name: "AI策略优化",
      description: "智能优化获客策略",
      icon: <Brain className="h-5 w-5 text-cyan-500" />,
      path: "/workspace/ai-strategy",
      bgColor: "bg-cyan-100",
      isNew: true,
    },
    {
      id: "ai-forecast",
      name: "AI销售预测",
      description: "智能预测销售趋势",
      icon: <LineChart className="h-5 w-5 text-amber-500" />,
      path: "/workspace/ai-forecast",
      bgColor: "bg-amber-100",
    },
  ]

  return (
    <div className="flex-1 p-4 bg-gray-50 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">工作台</h1>

        {/* 任务统计卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">总任务数</div>
              <div className="text-3xl font-bold text-blue-500 mt-1">{taskStats.total}</div>
              <Progress value={(taskStats.inProgress / taskStats.total) * 100} className="h-2 mt-2 bg-blue-100" />
              <div className="text-xs text-gray-500 mt-1">
                进行中: {taskStats.inProgress} / 已完成: {taskStats.completed}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">今日任务</div>
              <div className="text-3xl font-bold text-green-500 mt-1">{taskStats.todayTasks}</div>
              <div className="flex items-center mt-2">
                <svg
                  className="w-4 h-4 text-green-500 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12H7L10 19L14 5L17 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">活跃度 {taskStats.activityRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 常用功能 */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">常用功能</h2>
          <div className="grid grid-cols-2 gap-3">
            {commonFeatures.map((feature) => (
              <Link href={feature.path} key={feature.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                      {feature.icon}
                    </div>
                    <div className="flex items-center">
                      <div className="font-medium">{feature.name}</div>
                      {feature.isNew && (
                        <Badge className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">New</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* AI智能助手 */}
        <div>
          <h2 className="text-lg font-medium mb-3">AI 智能助手</h2>
          <div className="grid grid-cols-2 gap-3">
            {aiFeatures.map((feature) => (
              <Link href={feature.path} key={feature.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                      {feature.icon}
                    </div>
                    <div className="flex items-center">
                      <div className="font-medium">{feature.name}</div>
                      {feature.isNew && (
                        <Badge className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-100 border-0">New</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

