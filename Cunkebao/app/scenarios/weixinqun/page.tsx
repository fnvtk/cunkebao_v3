"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Users, MessageSquare, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

// 微信群获客计划数据
const wechatGroupPlans = [
  {
    id: 1,
    name: "产品推广群计划",
    status: "运行中",
    groupCount: 8,
    memberCount: 1250,
    dailyMessages: 15,
    tags: ["产品分享", "优惠信息"],
    createdAt: "2024-01-15",
    lastActive: "2小时前",
  },
  {
    id: 2,
    name: "用户交流群计划",
    status: "已暂停",
    groupCount: 5,
    memberCount: 680,
    dailyMessages: 8,
    tags: ["用户交流", "答疑解惑"],
    createdAt: "2024-01-10",
    lastActive: "1天前",
  },
  {
    id: 3,
    name: "新人欢迎群计划",
    status: "运行中",
    groupCount: 12,
    memberCount: 2100,
    dailyMessages: 25,
    tags: ["新人欢迎", "群活动"],
    createdAt: "2024-01-08",
    lastActive: "30分钟前",
  },
]

export default function WechatGroupPage() {
  const [plans] = useState(wechatGroupPlans)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "运行中":
        return "bg-green-100 text-green-800"
      case "已暂停":
        return "bg-yellow-100 text-yellow-800"
      case "已完成":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTagColor = (tag: string) => {
    const colors = {
      群活动: "bg-green-100 text-green-800",
      产品分享: "bg-blue-100 text-blue-800",
      用户交流: "bg-purple-100 text-purple-800",
      优惠信息: "bg-pink-100 text-pink-800",
      答疑解惑: "bg-orange-100 text-orange-800",
      新人欢迎: "bg-cyan-100 text-cyan-800",
      群规通知: "bg-indigo-100 text-indigo-800",
      活跃互动: "bg-emerald-100 text-emerald-800",
    }
    return colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">微信群获客</h1>
              <p className="text-sm text-gray-600 mt-1">管理微信群获客计划，提升群活跃度</p>
            </div>
            <Link href="/plans/new?type=weixinqun">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新建计划
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">总群数</p>
                  <p className="text-xl font-semibold">25</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">总成员</p>
                  <p className="text-xl font-semibold">4,030</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">日均消息</p>
                  <p className="text-xl font-semibold">48</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">活跃计划</p>
                  <p className="text-xl font-semibold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 计划列表 */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">群数量</p>
                    <p className="font-semibold">{plan.groupCount} 个</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">成员数</p>
                    <p className="font-semibold">{plan.memberCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">日均消息</p>
                    <p className="font-semibold">{plan.dailyMessages} 条</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最后活跃</p>
                    <p className="font-semibold">{plan.lastActive}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {plan.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className={getTagColor(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>创建时间：{plan.createdAt}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                    <Button variant="outline" size="sm">
                      编辑计划
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-4 py-2">
          <Link href="/" className="flex flex-col items-center py-2 text-gray-600">
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs">首页</span>
          </Link>
          <Link href="/scenarios" className="flex flex-col items-center py-2 text-blue-600">
            <div className="w-6 h-6 mb-1">🎯</div>
            <span className="text-xs">场景获客</span>
          </Link>
          <Link href="/workspace" className="flex flex-col items-center py-2 text-gray-600">
            <div className="w-6 h-6 mb-1">💼</div>
            <span className="text-xs">工作台</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 text-gray-600">
            <div className="w-6 h-6 mb-1">👤</div>
            <span className="text-xs">我的</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
