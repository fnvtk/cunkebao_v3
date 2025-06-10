"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  Database,
  Clock,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import BottomNav from "@/app/components/BottomNav"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"
import { Switch } from "@/components/ui/switch"

interface DistributionPlan {
  id: string | number
  companyId?: number
  name: string
  type?: number
  status: number // 1: 进行中, 0: 已暂停
  autoStart?: number
  userId?: number
  createTime: string
  updateTime?: string
  config: {
    id?: number
    workbenchId?: number
    distributeType?: number
    maxPerDay?: number
    timeType?: number
    startTime?: string
    endTime?: string
    account?: string[]
    devices: string[]
    pools: string[]
    createTime?: string
    updateTime?: string
    lastUpdated?: string
    total: {
      dailyAverage: number
      totalAccounts: number
      deviceCount: number
      poolCount: number
      totalUsers: number
    }
  }
  creatorName?: string
  auto_like?: any
  moments_sync?: any
  group_push?: any
}

interface ApiResponse {
  code: number
  msg: string
  data: {
    list: DistributionPlan[]
    total: number
  }
}

export default function TrafficDistributionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [plans, setPlans] = useState<DistributionPlan[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // 加载分发计划数据
  const fetchPlans = async (page: number, searchTerm?: string) => {
    const loadingToast = showToast("正在加载分发计划...", "loading", true);
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type: "5",
        page: page.toString(),
        limit: pageSize.toString()
      })
      
      if (searchTerm) {
        queryParams.append('keyword', searchTerm)
      }
      
      const response = await api.get<ApiResponse>(`/v1/workbench/list?${queryParams.toString()}`)
      
      if (response.code === 200) {
        setPlans(response.data.list)
        setTotal(response.data.total)
      } else {
        showToast(response.msg || "获取分发计划失败", "error")
      }
    } catch (error: any) {
      console.error("获取分发计划失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      loadingToast.remove();
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPlans(1, searchTerm)
  }

  const handleRefresh = () => {
    fetchPlans(currentPage, searchTerm)
  }

  const handleDelete = async (planId: string) => {
    const loadingToast = showToast("正在删除计划...", "loading", true);
    try {
      const response = await api.delete<ApiResponse>(`/v1/workbench/delete?id=${planId}`)

      if (response.code === 200) {
        loadingToast.remove();
        fetchPlans(currentPage, searchTerm)
        showToast(response.msg || "已成功删除分发计划", "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "请稍后再试", "error")
      }
    } catch (error: any) {
      console.error("删除计划失败:", error)
      loadingToast.remove();
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  const handleEdit = (planId: string) => {
    router.push(`/workspace/traffic-distribution/${planId}/edit`)
  }

  const handleView = (planId: string) => {
    router.push(`/workspace/traffic-distribution/${planId}`)
  }

  const togglePlanStatus = async (planId: string, currentStatus: number) => {
    const loadingToast = showToast("正在更新计划状态...", "loading", true);
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/update-status', {
        id: planId,
        status: currentStatus === 1 ? 0 : 1
      })

      if (response.code === 200) {
        setPlans(plans.map(plan => 
          plan.id === planId 
            ? { ...plan, status: currentStatus === 1 ? 0 : 1 }
            : plan
        ))
        const newStatus = currentStatus === 1 ? 0 : 1
        loadingToast.remove();
        showToast(response.msg || `计划${newStatus === 1 ? "已启动" : "已暂停"}`, "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "请稍后再试", "error")
      }
    } catch (error: any) {
      console.error("更新计划状态失败:", error)
      loadingToast.remove();
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-16">
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
                placeholder="搜索计划名称" 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border mt-4">
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
          <div className="space-y-4 mt-2">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                {/* 卡片头部：全部元素一行排列，间距紧凑 */}
                <div className="p-4 bg-white border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3 w-full">
                    <span className="font-medium text-base truncate max-w-[40%]">{plan.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${plan.status === 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"}`}>{plan.status === 1 ? "进行中" : "已暂停"}</span>
                    <Switch
                      checked={plan.status === 1}
                      onCheckedChange={() => togglePlanStatus(plan.id.toString(), Number(plan.status))}
                      className="ml-2"
                    />
                    <div className="flex-1" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem onClick={() => handleView(plan.id.toString())}>
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => handleEdit(plan.id.toString())}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑计划
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePlanStatus(plan.id.toString(), Number(plan.status))}>
                          {plan.status === 1 ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              暂停计划
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              启动计划
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(plan.id.toString())} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除计划
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 卡片内容 - 上3下2布局，图标在文字左侧 */}
                <div className="bg-white">
                  <div className="grid grid-cols-3">
                    <div className="p-3 text-center border-r border-gray-200">
                      <div className="text-lg font-semibold">{plan.config.total.totalAccounts}</div>
                      <div className="text-xs text-gray-500 mt-1">分发账号</div>
                    </div>
                    <div className="p-3 text-center border-r border-gray-200">
                      <div className="text-lg font-semibold">{plan.config.total.deviceCount}</div>
                      <div className="text-xs text-gray-500 mt-1">分发设备</div>
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-lg font-semibold">{plan.config.total.poolCount}</div>
                      <div className="text-xs text-gray-500 mt-1">流量池</div>
                    </div>
                  </div>
                  {/* 横向分隔线 */}
                  <div className="border-t border-gray-200 mx-auto w-full" style={{height: 0}} />
                  <div className="grid grid-cols-2">
                    <div className="p-3 text-center border-r border-gray-200">
                      <div className="text-lg font-semibold">{plan.config.total.dailyAverage}</div>
                      <div className="text-xs text-gray-500 mt-1">日均分发量</div>
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-lg font-semibold">{plan.config.total.totalAccounts}</div>
                      <div className="text-xs text-gray-500 mt-1">总流量池数量</div>
                    </div>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="p-3 bg-gray-50 text-sm text-gray-500 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>上次执行: {plan.config.lastUpdated}</span>
                  </div>
                  <div>创建人: {plan.creatorName}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!loading && total > pageSize && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              上一页
            </Button>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500">第 {currentPage} 页</span>
              <span className="text-sm text-gray-500">共 {Math.ceil(total / pageSize)} 页</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(total / pageSize), prev + 1))}
              disabled={currentPage >= Math.ceil(total / pageSize) || loading}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

