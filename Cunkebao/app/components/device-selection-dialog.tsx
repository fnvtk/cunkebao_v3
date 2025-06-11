"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"

interface Device {
  id: string
  name: string
  imei: string
  status: "online" | "offline"
  wechatAccounts: {
    wechatId: string
    nickname: string
    remainingAdds: number
    maxDailyAdds: number
  }[]
}

interface DeviceSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDevices: string[]
  onSelect: (deviceIds: string[]) => void
}

export function DeviceSelectionDialog({ open, onOpenChange, selectedDevices, onSelect }: DeviceSelectionDialogProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])

  useEffect(() => {
    if (open) setSelectedDeviceIds(selectedDevices)
  }, [open, selectedDevices])

  useEffect(() => {
    if (!open) return
    const fetchDevices = async () => {
      setLoading(true)
      try {
        const params = []
        if (searchQuery) params.push(`keyword=${encodeURIComponent(searchQuery)}`)
        if (statusFilter !== "all") params.push(`status=${statusFilter}`)
        params.push("page=1", "limit=100")
        const url = `/v1/devices?${params.join("&")}`
        const response = await api.get<any>(url)
        const list = response.data?.list || response.data?.items || []
        const devices = list.map((device: any) => ({
          id: device.id?.toString() || device.id,
          imei: device.imei || "",
          name: device.memo || device.name || `设备_${device.id}`,
          status: device.alive === 1 || device.status === "online" ? "online" : "offline",
          wechatAccounts: [
            {
              wechatId: device.wechatId || device.wxid || "",
              nickname: device.nickname || "",
              remainingAdds: device.remainingAdds || 0,
              maxDailyAdds: device.maxDailyAdds || 0,
            },
          ],
        }))
        setDevices(devices)
      } catch {
        setDevices([])
      } finally {
        setLoading(false)
      }
    }
    fetchDevices()
  }, [open, searchQuery, statusFilter])

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDeviceIds.length === filteredDevices.length) {
      setSelectedDeviceIds([])
    } else {
      setSelectedDeviceIds(filteredDevices.map((device) => device.id))
    }
  }

  const handleConfirm = () => {
    onSelect(selectedDeviceIds)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedDeviceIds(selectedDevices)
    onOpenChange(false)
  }

  const filteredDevices = devices.filter((device) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      (device.name || '').toLowerCase().includes(searchLower) ||
      (device.imei || '').toLowerCase().includes(searchLower) ||
      (device.wechatAccounts[0]?.wechatId || '').toLowerCase().includes(searchLower)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && device.status === "online") ||
      (statusFilter === "offline" && device.status === "offline")
    return matchesSearch && matchesStatus
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full p-0 rounded-2xl shadow-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center py-3 border-b">选择设备</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-4">
          {/* 搜索和筛选 */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="搜索设备IMEI/备注/微信号"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="text-center text-gray-400 py-8">加载中...</div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center text-gray-400 py-8">暂无设备</div>
            ) : (
              filteredDevices.map(device => {
                const checked = selectedDeviceIds.includes(device.id)
                const wx = device.wechatAccounts[0] || {}
                return (
                  <label
                    key={device.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border
                      ${checked ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
                      hover:border-blue-400 transition-colors cursor-pointer
                    `}
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-500 scale-110"
                      checked={checked}
                      onChange={() => {
                        setSelectedDeviceIds(prev =>
                          prev.includes(device.id)
                            ? prev.filter(id => id !== device.id)
                            : [...prev, device.id]
                        )
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-base">{device.name}</div>
                      <div className="text-xs text-gray-500">IMEI: {device.imei}</div>
                      <div className="text-xs text-gray-400">微信号: {wx.wechatId || '--'}（{wx.nickname || '--'}）</div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={device.status === 'online' ? 'text-green-600' : 'text-gray-400'}>
                        {device.status === 'online' ? '在线' : '离线'}
                      </span>
                    </span>
                  </label>
                )
              })
            )}
          </div>
          {/* 确认按钮 */}
          <div className="flex justify-center mt-8">
            <Button
              className="w-4/5 py-3 rounded-full text-base font-bold shadow-md"
              onClick={() => {
                onSelect(selectedDeviceIds)
                onOpenChange(false)
              }}
            >
              确认
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

