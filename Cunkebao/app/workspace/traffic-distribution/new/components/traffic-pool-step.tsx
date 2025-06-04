"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Database } from "lucide-react"
import { api } from "@/lib/api"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface TrafficPool {
  id: string
  name: string
  count: number
  description: string
}

interface TrafficPoolStepProps {
  onSubmit: (data: any) => void
  onBack: () => void
  initialData?: any
  devices?: string[]
}

export default function TrafficPoolStep({ onSubmit, onBack, initialData = {}, devices = [] }: TrafficPoolStepProps) {
  const [selectedPools, setSelectedPools] = useState<string[]>(initialData.selectedPools || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deviceLabels, setDeviceLabels] = useState<{ label: string; count: number }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)
  const filteredPools = deviceLabels.filter(
    (pool) =>
      pool.label && pool.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(total / pageSize)
  const pagedPools = filteredPools.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 监听 devices 变化，请求标签
  useEffect(() => {
    if (!devices || devices.length === 0) {
      setDeviceLabels([])
      setTotal(0)
      return
    }
    const fetchLabels = async () => {
      try {
        const params = devices.join(",")
        const res = await api.get<{ code: number; msg: string; data: { label: string; count: number }[]; total?: number }>(`/v1/workbench/device-labels?deviceIds=${params}`)
        if (res.code === 200 && Array.isArray(res.data)) {
          setDeviceLabels(res.data)
          setTotal(res.total || res.data.length)
        } else {
          setDeviceLabels([])
          setTotal(0)
        }
      } catch (e) {
        setDeviceLabels([])
        setTotal(0)
      }
    }
    fetchLabels()
  }, [devices])

  // label 到描述的映射
  const poolDescMap: Record<string, string> = {
    "新客流量池": "新获取的客户流量",
    "高意向流量池": "有购买意向的客户",
    "复购流量池": "已购买过产品的客户",
    "活跃流量池": "近期活跃的客户",
    "沉睡流量池": "长期未活跃的客户",
  }

  const togglePool = (label: string) => {
    setSelectedPools((prev) =>
      prev.includes(label) ? prev.filter((id) => id !== label) : [...prev, label]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSubmit({ poolIds: selectedPools })
    } catch (error) {
      console.error("提交失败:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 每次弹窗打开时重置分页
  useEffect(() => { if (dialogOpen) setCurrentPage(1) }, [dialogOpen])

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">流量池选择</h2>
      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="选择流量池"
            value={selectedPools.join(", ")}
            readOnly
            className="pl-10 cursor-pointer"
            onClick={() => setDialogOpen(true)}
          />
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl w-full p-0 rounded-2xl shadow-2xl max-h-[80vh]">
          <DialogTitle className="text-lg font-bold text-center py-3 border-b">选择流量池</DialogTitle>
          <div className="p-6 pt-4">
            {/* 搜索栏 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索流量池"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {/* 流量池列表 */}
            <div className="overflow-y-auto max-h-[400px] space-y-3">
              {pagedPools.map((pool) => (
                <div
                  key={pool.label}
                  className={`
                    flex items-center justify-between rounded-xl shadow-sm border transition-colors duration-150 cursor-pointer
                    ${selectedPools.includes(pool.label) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
                    hover:border-blue-400
                  `}
                  onClick={() => togglePool(pool.label)}
                >
                  <div className="flex items-center space-x-3 p-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-base">{pool.label}</p>
                      <p className="text-sm text-gray-500">{poolDescMap[pool.label] || ""}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 mr-4">{pool.count} 人</span>
                  <input
                    type="checkbox"
                    className="accent-blue-500 scale-125 mr-6"
                    checked={selectedPools.includes(pool.label)}
                    onChange={e => {
                      e.stopPropagation();
                      togglePool(pool.label);
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
            {/* 分页按钮 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>上一页</Button>
                <span className="text-sm text-gray-500">第 {currentPage} / {totalPages} 页</span>
                <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>下一页</Button>
              </div>
            )}
            {/* 确认按钮 */}
            <div className="flex justify-center mt-8">
              <Button
                className="w-4/5 py-3 rounded-full text-base font-bold shadow-md"
                onClick={() => setDialogOpen(false)}
                disabled={selectedPools.length === 0}
              >
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← 上一步
        </Button>
        <Button onClick={handleSubmit} disabled={selectedPools.length === 0 || isSubmitting}>
          {isSubmitting ? "提交中..." : "完成"}
        </Button>
      </div>
    </div>
  )
}
