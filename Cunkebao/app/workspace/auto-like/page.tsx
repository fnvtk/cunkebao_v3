"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  Plus,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  Clock,
  Edit,
  Trash2,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings,
  Calendar,
  Users,
  ThumbsUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface TaskConfig {
  id: number
  workbenchId: number
  interval: number
  maxLikes: number
  friendMaxLikes?: number
  startTime: string
  endTime: string
  contentTypes: string[]
  devices: number[]
  targetGroups: string[]
  tagOperator: number
  createTime: string
  updateTime: string
  todayLikeCount?: number
  totalLikeCount?: number
  friends?: string[]
  enableFriendTags?: boolean
  friendTags?: string
}

interface Task {
  id: number
  name: string
  type: number
  status: number
  autoStart: number
  createTime: string
  updateTime: string
  config: TaskConfig
}

interface TaskListResponse {
  code: number
  msg: string
  data: {
    list: Task[]
    total: number
  }
}

interface ApiResponse {
  code: number
  msg: string
}

export default function AutoLikePage() {
  const router = useRouter()
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  const fetchTasks = async (page: number, name?: string) => {
    const loadingToast = showToast("正在加载任务列表...", "loading", true);
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type: '1',
        page: page.toString(),
        limit: pageSize.toString(),
      })
      if (name) {
        queryParams.append('name', name)
      }
      const response = await api.get<TaskListResponse>(`/v1/workbench/list?${queryParams.toString()}`)

      if (response.code === 200) {
        setTasks(response.data.list)
        setTotal(response.data.total)
      } else {
        showToast(response.msg || "请稍后再试", "error")
      }
    } catch (error: any) {
      console.error("获取任务列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      loadingToast.remove();
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks(currentPage, searchName)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchTasks(1, searchName)
  }

  const handleRefresh = () => {
    fetchTasks(currentPage, searchName)
  }

  const toggleExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const handleDelete = async (taskId: number) => {
    const loadingToast = showToast("正在删除任务...", "loading", true);
    try {
      const response = await api.delete<ApiResponse>(`/v1/workbench/delete?id=${taskId}`)

      if (response.code === 200) {
        // 删除成功后刷新列表
        loadingToast.remove();
        fetchTasks(currentPage, searchName)
        showToast(response.msg || "已成功删除点赞任务", "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "请稍后再试", "error")
      }
    } catch (error: any) {
      console.error("删除任务失败:", error)
      loadingToast.remove();
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  const handleEdit = (taskId: number) => {
    router.push(`/workspace/auto-like/${taskId}/edit`)
  }

  const handleView = (taskId: number) => {
    router.push(`/workspace/auto-like/${taskId}`)
  }

  const handleCopy = async (taskId: number) => {
    const loadingToast = showToast("正在复制任务...", "loading", true);
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/copy', {
        id: taskId
      })

      if (response.code === 200) {
        // 复制成功后刷新列表
        loadingToast.remove();
        fetchTasks(currentPage, searchName)
        showToast(response.msg || "已成功复制点赞任务", "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "请稍后再试", "error")
      }
    } catch (error: any) {
      console.error("复制任务失败:", error)
      loadingToast.remove();
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  const toggleTaskStatus = async (taskId: number, currentStatus: number) => {
    const loadingToast = showToast("正在更新任务状态...", "loading", true);
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/update-status', {
        id: taskId,
        status: currentStatus === 1 ? 2 : 1
      })

      if (response.code === 200) {
        // 更新本地状态
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: currentStatus === 1 ? 2 : 1 }
            : task
        ))
        
        const newStatus = currentStatus === 1 ? 2 : 1
        loadingToast.remove();
        showToast(response.msg || `任务${newStatus === 1 ? "已启动" : "已暂停"}`, "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "请稍后再试", "error")
      }
    } catch (error: any) {
      console.error("更新任务状态失败:", error)
      loadingToast.remove();
      showToast(error?.message || "请检查网络连接", "error")
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-20">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">自动点赞</h1>
          </div>
          <Link href="/workspace/auto-like/new">
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
              <Input 
                placeholder="搜索任务名称" 
                className="pl-9" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
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

        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{task.name}</h3>
                  <Badge variant={task.status === 1 ? "default" : "secondary"}>
                    {task.status === 1 ? "进行中" : "已暂停"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={task.status === 1} onCheckedChange={() => toggleTaskStatus(task.id, task.status)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(task.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        查看
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(task.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(task.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        复制
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-sm text-gray-500">
                  <div className="mb-1">执行设备：{task.config.devices.length} 个</div>
                  <div className="mb-1">目标人群：{task.config.friends?.length || 0} 个</div>
                  <div>更新时间：{task.updateTime}</div>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="mb-1">点赞间隔：{task.config.interval} 秒</div>
                  <div className="mb-1">每日上限：{task.config.maxLikes} 次</div>
                  <div>创建时间：{task.createTime}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="text-sm">
                <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-500">今日点赞：</span>
                    <span className="ml-1 font-medium">{task.config.todayLikeCount || 0} 次</span>
                  </div>
                </div>
                <div className="text-sm">
                <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-gray-500">总点赞数：</span>
                    <span className="ml-1 font-medium">{task.config.totalLikeCount || 0} 次</span>
                  </div>
                </div>
              </div>

              {expandedTaskId === task.id && (
                <div className="mt-4 pt-4 border-t border-dashed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-gray-500" />
                        <h4 className="font-medium">基本设置</h4>
                      </div>
                      <div className="space-y-2 pl-7">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">点赞间隔：</span>
                          <span>{task.config.interval} 秒</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">每日最大点赞数：</span>
                          <span>{task.config.maxLikes} 次</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">每个好友最大点赞数：</span>
                          <span>{task.config.friendMaxLikes || 3} 次</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">执行时间段：</span>
                          <span>
                            {task.config.startTime} - {task.config.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-gray-500" />
                        <h4 className="font-medium">目标人群</h4>
                      </div>
                      <div className="space-y-2 pl-7">
                        <div className="flex flex-wrap gap-2">
                          {task.config.targetGroups.map((tag, index) => (
                            <Badge key={`${task.id}-tag-${index}-${tag}`} variant="outline" className="bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          匹配方式：{task.config.tagOperator === 1 ? "满足所有标签" : "满足任一标签"}
                        </div>
                        {task.config.enableFriendTags && task.config.friendTags && (
                          <div className="mt-2">
                            <div className="text-sm font-medium mb-1">好友标签：</div>
                            <Badge variant="outline" className="bg-blue-50 border-blue-200">
                              {task.config.friendTags}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <ThumbsUp className="h-5 w-5 mr-2 text-gray-500" />
                        <h4 className="font-medium">点赞内容类型</h4>
                      </div>
                      <div className="space-y-2 pl-7">
                        <div className="flex flex-wrap gap-2">
                          {task.config.contentTypes.map((type, index) => (
                            <Badge key={`${task.id}-type-${index}-${type}`} variant="outline" className="bg-gray-50">
                              {type === "text" ? "文字" : type === "image" ? "图片" : "视频"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* 分页 */}
        {total > pageSize && (
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
    </div>
  )
}
