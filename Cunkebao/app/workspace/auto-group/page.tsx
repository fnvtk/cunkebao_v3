"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Plus, Filter, Search, RefreshCw, MoreVertical, Clock, Edit, Trash2, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Users, Settings } from "lucide-react"

interface Plan {
  id: string
  name: string
  groupCount: number
  groupSize: number
  totalFriends: number
  tags: string[]
  status: "running" | "stopped" | "completed"
  lastUpdated: string
}

const mockPlans: Plan[] = [
  {
    id: "1",
    name: "品牌推广群",
    groupCount: 6,
    groupSize: 38,
    totalFriends: 228,
    tags: ["品牌", "推广"],
    status: "running",
    lastUpdated: "2024-02-24 10:30",
  },
  {
    id: "2",
    name: "客户服务群",
    groupCount: 4,
    groupSize: 38,
    totalFriends: 152,
    tags: ["客服", "售后"],
    status: "stopped",
    lastUpdated: "2024-02-23 15:45",
  },
]

export default function AutoGroupPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [plans, setPlans] = useState(mockPlans)

  const handleDelete = (planId: string) => {
    setPlans(plans.filter((plan) => plan.id !== planId))
  }

  const handleEdit = (planId: string) => {
    router.push(`/workspace/auto-group/${planId}/edit`)
  }

  const handleView = (planId: string) => {
    router.push(`/workspace/auto-group/${planId}`)
  }

  const togglePlanStatus = (planId: string) => {
    setPlans(
      plans.map((plan) =>
        plan.id === planId ? { ...plan, status: plan.status === "running" ? "stopped" : "running" } : plan,
      ),
    )
  }

  const getStatusColor = (status: Plan["status"]) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-500"
      case "stopped":
        return "bg-red-500/10 text-red-500"
      case "completed":
        return "bg-blue-500/10 text-blue-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusText = (status: Plan["status"]) => {
    switch (status) {
      case "running":
        return "运行中"
      case "stopped":
        return "已停止"
      case "completed":
        return "已完成"
      default:
        return status
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">自动建群、自动进群</h1>
          </div>
          <Link href="/workspace/auto-group/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="搜索任务名称" className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-full -z-10"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{plan.name}</h3>
                  <Badge variant="outline" className={getStatusColor(plan.status)}>
                    {getStatusText(plan.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={plan.status === "running"} onCheckedChange={() => togglePlanStatus(plan.id)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleView(plan.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        查看
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    已建群数：{plan.groupCount}
                  </div>
                  <div className="flex items-center mt-1">
                    <Settings className="w-4 h-4 mr-2" />
                    群规模：{plan.groupSize}人/群
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <div>总人数：{plan.totalFriends}人</div>
                  <div className="mt-1">
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plan.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  更新时间：{plan.lastUpdated}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
