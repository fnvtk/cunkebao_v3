"use client"
import { Card } from "@/components/ui/card"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Copy, Pencil, Trash2, Clock, Link } from "lucide-react"

interface Task {
  id: string
  name: string
  status: "running" | "paused" | "completed"
  stats: {
    devices: number
    acquired: number
    added: number
  }
  lastUpdated: string
  executionTime: string
  nextExecutionTime: string
  trend: { date: string; customers: number }[]
  reqConf?: {
    device?: string[]
    selectedDevices?: string[]
  }
}

interface ScenarioAcquisitionCardProps {
  task: Task
  channel: string
  onEdit: (taskId: string) => void
  onCopy: (taskId: string) => void
  onDelete: (taskId: string) => void
  onOpenSettings?: (taskId: string) => void
  onStatusChange?: (taskId: string, newStatus: "running" | "paused") => void
}

export function ScenarioAcquisitionCard({
  task,
  channel,
  onEdit,
  onCopy,
  onDelete,
  onOpenSettings,
  onStatusChange,
}: ScenarioAcquisitionCardProps) {
  // 兼容后端真实数据结构
  const deviceCount = Array.isArray(task.reqConf?.device)
    ? task.reqConf.device.length
    : Array.isArray(task.reqConf?.selectedDevices)
      ? task.reqConf.selectedDevices.length
      : 0
  // 获客数和已添加数可根据 msgConf 或其它字段自定义
  const acquiredCount = task.acquiredCount ?? 0
  const addedCount = task.addedCount ?? 0
  const passRate = task.passRate ?? 0
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = task.status === 1;

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStatusChange) {
      onStatusChange(task.id, task.status === "running" ? "paused" : "running")
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    onEdit(task.id)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    onCopy(task.id)
  }

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (onOpenSettings) {
      onOpenSettings(task.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    onDelete(task.id)
  }

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <Card className="p-6 hover:shadow-lg transition-all mb-4 bg-white/80">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-lg">{task.name}</h3>
          <Badge
            variant={isActive ? "success" : "secondary"}
            className="cursor-pointer hover:opacity-80"
            onClick={handleStatusChange}
          >
            {isActive ? "进行中" : "已暂停"}
          </Badge>
        </div>
        <div className="relative z-20" ref={menuRef}>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full" onClick={toggleMenu}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleEdit}
              >
                <Pencil className="w-4 h-4 mr-2" />
                编辑计划
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制计划
              </button>
              {onOpenSettings && (
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleOpenSettings}
                >
                  <Link className="w-4 h-4 mr-2" />
                  计划接口
                </button>
              )}
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除计划
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <a href={`/scenarios/${channel}/devices`} className="block">
          <Card className="p-2 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="text-sm text-gray-500 mb-1">设备数</div>
            <div className="text-2xl font-semibold">{deviceCount}</div>
          </Card>
        </a>

        <a href={`/scenarios/${channel}/acquired`} className="block">
          <Card className="p-2 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="text-sm text-gray-500 mb-1">已获客</div>
            <div className="text-2xl font-semibold">{acquiredCount}</div>
          </Card>
        </a>

        <a href={`/scenarios/${channel}/added`} className="block">
          <Card className="p-2 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="text-sm text-gray-500 mb-1">已添加</div>
            <div className="text-2xl font-semibold">{addedCount}</div>
          </Card>
        </a>

        <Card className="p-2">
          <div className="text-sm text-gray-500 mb-1">通过率</div>
          <div className="text-2xl font-semibold">{passRate}%</div>
        </Card>
      </div>

      <div className="flex items-center justify-between text-sm border-t pt-4 text-gray-500">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>上次执行：{task.lastUpdated}</span>
        </div>
      </div>
    </Card>
  )
}

// 计算通过率
function calculatePassRate(acquired: number, added: number) {
  if (acquired === 0) return 0
  return Math.round((added / acquired) * 100)
}

