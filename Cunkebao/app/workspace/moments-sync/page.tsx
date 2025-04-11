"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Plus, Filter, Search, RefreshCw, MoreVertical, Clock, Edit, Trash2, Eye, Copy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { api, ApiResponse } from "@/lib/api"
import { showToast } from "@/lib/toast"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

interface SyncTask {
  id: string
  name: string
  status: "running" | "paused"
  deviceCount: number
  contentLib: string
  syncCount: number
  lastSyncTime: string
  createTime: string
  creator: string
  libraries?: string[]
}

export default function MomentsSyncPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<SyncTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  // 获取任务列表
  const fetchTasks = async () => {
    const loadingToast = showToast("正在加载任务列表...", "loading", true);
    setIsLoading(true)
    try {
      const response = await api.get<ApiResponse>('/v1/workbench/list?type=2')
      if (response.code === 200 && response.data) {
        setTasks(response.data.list || [])
      } else {
        showToast(response.msg || "获取任务列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取朋友圈同步任务列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      loadingToast.remove();
      setIsLoading(false)
    }
  }

  // 组件加载时获取任务列表
  useEffect(() => {
    fetchTasks()
  }, [])

  // 搜索任务
  const handleSearch = () => {
    fetchTasks()
  }

  // 切换任务状态
  const toggleTaskStatus = async (taskId: string, currentStatus: "running" | "paused") => {
    const loadingToast = showToast("正在更新任务状态...", "loading", true);
    try {
      const newStatus = currentStatus === "running" ? "paused" : "running"
      const response = await api.post<ApiResponse>('/v1/workbench/update-status', {
        id: taskId,
        status: newStatus === "running" ? 1 : 0
      })

      if (response.code === 200) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        )
        loadingToast.remove();
        showToast(`任务已${newStatus === "running" ? "启用" : "暂停"}`, "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "操作失败", "error")
      }
    } catch (error: any) {
      console.error("更新任务状态失败:", error)
      loadingToast.remove();
      showToast(error?.message || "更新任务状态失败", "error")
    }
  }

  // 确认删除
  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId)
    setShowDeleteAlert(true)
  }

  // 执行删除
  const handleDelete = async () => {
    if (!taskToDelete) return

    const loadingToast = showToast("正在删除任务...", "loading", true);
    try {
      const response = await api.delete<ApiResponse>(`/v1/workbench/delete?id=${taskToDelete}`)

      if (response.code === 200) {
        setTasks(tasks.filter((task) => task.id !== taskToDelete))
        loadingToast.remove();
        showToast("删除成功", "success")
      } else {
        loadingToast.remove();
        showToast(response.msg || "删除失败", "error")
      }
    } catch (error: any) {
      console.error("删除任务失败:", error)
      loadingToast.remove();
      showToast(error?.message || "删除任务失败", "error")
    } finally {
      setTaskToDelete(null)
      setShowDeleteAlert(false)
    }
  }

  // 编辑任务
  const handleEdit = (taskId: string) => {
    router.push(`/workspace/moments-sync/${taskId}/edit`)
  }

  // 查看任务详情
  const handleView = (taskId: string) => {
    router.push(`/workspace/moments-sync/${taskId}`)
  }

  // 复制任务
  const handleCopy = async (taskId: string) => {
    const loadingToast = showToast("正在复制任务...", "loading", true);
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/copy', {
        id: taskId
      })

      if (response.code === 200) {
        loadingToast.remove();
        showToast("复制成功", "success")
        fetchTasks() // 重新获取列表
      } else {
        loadingToast.remove();
        showToast(response.msg || "复制失败", "error")
      }
    } catch (error: any) {
      console.error("复制任务失败:", error)
      loadingToast.remove();
      showToast(error?.message || "复制任务失败", "error")
    }
  }

  // 过滤任务
  const filteredTasks = tasks.filter(
    (task) => task.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">朋友圈同步</h1>
          </div>
          <Link href="/workspace/moments-sync/new">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchTasks}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <p className="text-gray-500 mb-4">暂无数据</p>
              <Link href="/workspace/moments-sync/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  新建任务
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{task.name}</h3>
                    <Badge variant={task.status === 1 ? "success" : "secondary"}>
                      {task.status === "running" ? "进行中" : "已暂停"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={task.status === 1} 
                      onCheckedChange={() => toggleTaskStatus(task.id, task.status)} 
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
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
                        <DropdownMenuItem onClick={() => confirmDelete(task.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-sm text-gray-500">
                    <div>推送设备：{task.deviceCount} 个</div>
                    <div>内容库：{task.contentLib}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div>已同步：{task.syncCount} 条</div>
                    <div>创建人：{task.creator}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    上次同步：{task.lastSyncTime}
                  </div>
                  <div>创建时间：{task.createTime}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后，此任务将无法恢复。确定要删除吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

