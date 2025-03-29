"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, MoreVertical, Copy, Pencil, Trash2, Clock, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DailyAcquisitionChart } from "./DailyAcquisitionChart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  dailyData?: { date: string; acquired: number; added: number }[]
}

interface ExpandableAcquisitionCardProps {
  task: Task
  channel: string
  onCopy: (taskId: string) => void
  onDelete: (taskId: string) => void
  onOpenSettings?: (taskId: string) => void
  onStatusChange?: (taskId: string, newStatus: "running" | "paused") => void
}

export function ExpandableAcquisitionCard({
  task,
  channel,
  onCopy,
  onDelete,
  onOpenSettings,
  onStatusChange,
}: ExpandableAcquisitionCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const { devices: deviceCount, acquired: acquiredCount, added: addedCount } = task.stats
  const passRate = calculatePassRate(acquiredCount, addedCount)

  const handleEdit = (taskId: string) => {
    router.push(`/scenarios/${channel}/edit/${taskId}`)
  }

  const toggleTaskStatus = () => {
    if (onStatusChange) {
      onStatusChange(task.id, task.status === "running" ? "paused" : "running")
    }
  }

  return (
    <div className="mb-6">
      <Card className="p-6 hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-lg">{task.name}</h3>
            <Badge
              variant={task.status === "running" ? "success" : "secondary"}
              className="cursor-pointer hover:opacity-80"
              onClick={toggleTaskStatus}
            >
              {task.status === "running" ? "进行中" : "已暂停"}
            </Badge>
          </div>
          <div className="relative z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleEdit(task.id)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  编辑计划
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy(task.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  复制计划
                </DropdownMenuItem>
                {onOpenSettings && (
                  <DropdownMenuItem onClick={() => onOpenSettings(task.id)}>
                    <Link className="w-4 h-4 mr-2" />
                    计划接口
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除计划
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <a href={`/scenarios/${channel}/devices`}>
            <Card className="p-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-sm text-gray-500 mb-1">设备数</div>
              <div className="text-2xl font-semibold">{deviceCount}</div>
            </Card>
          </a>

          <a href={`/scenarios/${channel}/acquired`}>
            <Card className="p-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-sm text-gray-500 mb-1">已获客</div>
              <div className="text-2xl font-semibold">{acquiredCount}</div>
            </Card>
          </a>

          <a href={`/scenarios/${channel}/added`}>
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

        <div className="h-48 bg-white rounded-lg p-4 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={task.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="customers"
                name="获客数"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-4 text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>上次执行：{task.lastUpdated}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>下次执行：{task.nextExecutionTime}</span>
          </div>
        </div>
      </Card>

      {expanded && task.dailyData && (
        <div className="mt-4 bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-medium mb-4">每日获客数据</h4>
          <div className="h-64">
            <DailyAcquisitionChart data={task.dailyData} />
          </div>
        </div>
      )}

      <div className="flex justify-center mt-2">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-gray-500">
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              展开
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// 计算通过率
function calculatePassRate(acquired: number, added: number) {
  if (acquired === 0) return 0
  return Math.round((added / acquired) * 100)
}

