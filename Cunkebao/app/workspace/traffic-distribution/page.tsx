"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Plus,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  Clock,
  TrendingUp,
  Users,
  Trash2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface DistributionPlan {
  id: string
  name: string
  status: "active" | "paused"
  source: string
  sourceIcon: string
  targetGroups: string[]
  totalUsers: number
  dailyAverage: number
  lastUpdated: string
  createTime: string
  creator: string
}

export default function TrafficDistributionPage() {
  const router = useRouter()
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [plans, setPlans] = useState<DistributionPlan[]>([
    {
      id: "1",
      name: "抖音直播引流计划",
      status: "active",
      source: "douyin",
      sourceIcon: "🎬",
      targetGroups: ["新客户", "潜在客户"],
      totalUsers: 1250,
      dailyAverage: 85,
      lastUpdated: "2024-03-18 10:30:00",
      createTime: "2024-03-10 08:30:00",
      creator: "admin",
    },
    {
      id: "2",
      name: "小红书种草计划",
      status: "active",
      source: "xiaohongshu",
      sourceIcon: "📱",
      targetGroups: ["女性用户", "美妆爱好者"],
      totalUsers: 980,
      dailyAverage: 65,
      lastUpdated: "2024-03-17 14:20:00",
      createTime: "2024-03-12 09:15:00",
      creator: "marketing",
    },
    {
      id: "3",
      name: "微信社群活动",
      status: "paused",
      source: "wechat",
      sourceIcon: "💬",
      targetGroups: ["老客户", "会员"],
      totalUsers: 2340,
      dailyAverage: 0,
      lastUpdated: "2024-03-15 09:45:00",
      createTime: "2024-02-28 11:20:00",
      creator: "social",
    },
  ])

  // 根据筛选条件过滤计划
  const filteredPlans = plans
    .filter((plan) => searchQuery === "" || plan.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((plan) => sourceFilter === "all" || plan.source === sourceFilter)

  const handleDelete = (planId: string) => {
    setPlans(plans.filter((plan) => plan.id !== planId))
  }

  const handleEdit = (planId: string) => {
    router.push(`/workspace/traffic-distribution/${planId}/edit`)
  }

  const handleView = (planId: string) => {
    router.push(`/workspace/traffic-distribution/${planId}`)
  }

  const togglePlanStatus = (planId: string) => {
    setPlans(
      plans.map((plan) =>
        plan.id === planId ? { ...plan, status: plan.status === "active" ? "paused" : "active" } : plan,
      ),
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">流量分发</h1>
          </div>
          <Link href="/workspace/traffic-distribution/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建分发
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索分发计划"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilterDialog(true)}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-gray-500">暂无数据</div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/workspace/traffic-distribution/new")}
              >
                创建分发计划
              </Button>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl mr-1">{plan.sourceIcon}</span>
                    <h3 className="font-medium">{plan.name}</h3>
                    <Badge variant={plan.status === "active" ? "success" : "secondary"}>
                      {plan.status === "active" ? "进行中" : "已暂停"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={plan.status === "active"} onCheckedChange={() => togglePlanStatus(plan.id)} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleView(plan.id)}>
                          <Users className="h-4 w-4 mr-2" />
                          查看
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
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
                    <div>目标人群：{plan.targetGroups.join(", ")}</div>
                    <div>总流量：{plan.totalUsers} 人</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div>日均获取：{plan.dailyAverage} 人</div>
                    <div>创建人：{plan.creator}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    上次更新：{plan.lastUpdated}
                  </div>
                  <div>创建时间：{plan.createTime}</div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 筛选弹窗 */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>筛选分发计划</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">流量来源</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择流量来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  <SelectItem value="douyin">抖音</SelectItem>
                  <SelectItem value="xiaohongshu">小红书</SelectItem>
                  <SelectItem value="wechat">微信</SelectItem>
                  <SelectItem value="weibo">微博</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSourceFilter("all")
                }}
              >
                重置
              </Button>
              <Button onClick={() => setShowFilterDialog(false)}>应用筛选</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

