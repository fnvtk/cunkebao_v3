"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { DeviceSelectionDialog } from "@/app/components/device-selection-dialog"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface Device {
  id: string
  name: string
  status: "online" | "offline"
  avatar?: string
}

interface CustomerService {
  id: string
  name: string
  status: "online" | "offline"
  avatar?: string
}

interface TargetSettingsStepProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

export default function TargetSettingsStep({ onNext, onBack, initialData = {}, setDevices }: TargetSettingsStepProps & { setDevices: (ids: string[]) => void }) {
  const [deviceList, setDeviceList] = useState<any[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  // 每次 initialData.devices 变化时，同步 selectedDeviceIds
  useEffect(() => {
    const ids = Array.isArray(initialData.devices) ? initialData.devices.map(String) : [];
    setSelectedDeviceIds(ids);
  }, [initialData.devices])

  useEffect(() => {
    setLoading(true)
    api.get('/v1/devices?page=1&limit=100').then((res: any) => {
      setDeviceList(res.data?.list || [])
    }).finally(() => setLoading(false))
  }, [])

  const filteredDevices = deviceList.filter(device => {
    const matchesSearch =
      search === "" ||
      (device.memo || device.nickname || "").toLowerCase().includes(search.toLowerCase()) ||
      (device.imei || "").toLowerCase().includes(search.toLowerCase()) ||
      (device.wechatId || "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || (statusFilter === "online" ? device.alive === 1 : device.alive !== 1)
    return matchesSearch && matchesStatus
  })

  const handleSubmit = () => {
    onNext({ devices: selectedDeviceIds })
  }

  // 弹窗内确认选择
  const handleDialogConfirm = () => {
    if (typeof setDevices === 'function') {
      setDevices(selectedDeviceIds)
    }
    setDeviceDialogOpen(false)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">目标设置</h2>
      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="选择设备"
            value={selectedDeviceIds.length > 0 ? `已选择${selectedDeviceIds.length}个设备` : ''}
            readOnly
            className="pl-10 cursor-pointer"
            onClick={() => setDeviceDialogOpen(true)}
          />
        </div>
      </div>
      <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
        {selectedDeviceIds.length === 0 ? (
          <div className="text-gray-400">未选择设备</div>
        ) : (
          <div className="text-base text-gray-500">已选设备：{selectedDeviceIds.length} 个</div>
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>← 上一步</Button>
        <Button onClick={handleSubmit} disabled={selectedDeviceIds.length === 0}>下一步 →</Button>
      </div>
      {/* 设备选择弹窗 */}
      <Dialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen}>
        <DialogContent className="max-w-xl w-full p-0 rounded-2xl shadow-2xl max-h-[80vh]">
          <DialogTitle className="text-lg font-bold text-center py-3 border-b">选择设备</DialogTitle>
          <div className="p-6 pt-4">
            {/* 搜索和筛选 */}
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="搜索设备IMEI/备注/微信号"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:border-blue-500"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
              </select>
            </div>
            {/* 设备列表 */}
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center text-gray-400 py-8">加载中...</div>
              ) : filteredDevices.length === 0 ? (
                <div className="text-center text-gray-400 py-8">暂无设备</div>
              ) : (
                filteredDevices.map(device => (
                  <label
                    key={device.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border
                      ${selectedDeviceIds.includes(String(device.id)) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
                      hover:border-blue-400 transition-colors cursor-pointer
                    `}
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-500 scale-110"
                      checked={selectedDeviceIds.includes(String(device.id))}
                      onChange={() => {
                        setSelectedDeviceIds(prev =>
                          prev.includes(String(device.id))
                            ? prev.filter(id => id !== String(device.id))
                            : [...prev, String(device.id)]
                        )
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-base">{device.memo || device.nickname || device.name}</div>
                      <div className="text-xs text-gray-500">IMEI: {device.imei}</div>
                      <div className="text-xs text-gray-400">微信号: {device.wechatId || '--'}（{device.nickname || '--'}）</div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${device.alive === 1 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={device.alive === 1 ? 'text-green-600' : 'text-gray-400'}>
                        {device.alive === 1 ? '在线' : '离线'}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            {/* 确认按钮 */}
            <div className="flex justify-center mt-8">
              <Button
                className="w-4/5 py-3 rounded-full text-base font-bold shadow-md"
                onClick={handleDialogConfirm}
              >
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
