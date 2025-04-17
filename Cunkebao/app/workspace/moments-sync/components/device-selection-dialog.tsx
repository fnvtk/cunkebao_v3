"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface Device {
  id: string
  name: string
  imei: string
  wechatId: string
  memo?: string
  alive: number
  usedInPlans: number
  lastActiveTime: string
}

interface DeviceSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDevices: string[]
  onSelect: (devices: string[]) => void
}

export function DeviceSelectionDialog({
  open,
  onOpenChange,
  selectedDevices,
  onSelect,
}: DeviceSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [tempSelected, setTempSelected] = useState<string[]>([])

  // 获取设备列表
  const fetchDevices = async () => {
    setLoading(true)
    try {
      setLoading(true)
      const response = await api.get<{code: number, msg: string, data: {list: ServerDevice[], total: number}}>('/v1/devices?page=1&limit=100')
      
      if (response.code === 200 && response.data.list) {
        const transformedDevices: Device[] = response.data.list.map(device => ({
          id: device.id,
          name: device.memo || "未命名设备",
          imei: device.imei || '',
          wxid: device.wechatId || '',
          status: device.alive === 1 ? "online" : "offline",
          totalFriend: device.totalFriend || 0
        }))
        setDevices(transformedDevices)
      } else {
        showToast(response.msg || "获取设备列表失败", "error")
      }
    } catch (error: any) {
      console.error("获取设备列表失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchDevices()
      setTempSelected(selectedDevices)
    }
  }, [open, searchQuery, selectedDevices])

  const handleRefresh = () => {
    fetchDevices()
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch = !searchQuery || 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.wechatId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "online" && device.alive === 1) ||
      (statusFilter === "offline" && device.alive === 0)

    return matchesSearch && matchesStatus
  })

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setTempSelected(selectedDevices)
    }
    onOpenChange(open)
  }

  const handleSelectAll = () => {
    if (tempSelected.length === filteredDevices.length) {
      setTempSelected([])
    } else {
      setTempSelected(filteredDevices.map(device => device.id))
    }
  }

  const handleDeviceToggle = (deviceId: string) => {
    setTempSelected(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择设备</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索设备IMEI/备注/微信号"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="online">在线</SelectItem>
              <SelectItem value="offline">离线</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            已选择 {tempSelected.length} 个设备
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={loading || filteredDevices.length === 0}
            >
              {tempSelected.length === filteredDevices.length ? "取消全选" : "全选"}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                加载中...
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                暂无数据
              </div>
            ) : (
              filteredDevices.map((device) => (
                <Label
                  key={device.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  htmlFor={device.id}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Checkbox 
                      id={device.id}
                      checked={tempSelected.includes(device.id)}
                      onCheckedChange={() => handleDeviceToggle(device.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate mb-1">{device.memo || device.imei}</div>
                      <div className="text-sm text-gray-500 truncate mb-1">IMEI: {device.imei}</div>
                      <div className="text-sm text-gray-500 truncate">{device.wechatId ? `微信号: ${device.wechatId}` : ''}</div>
                      {device.usedInPlans > 0 && (
                        <div className="text-sm text-orange-500 mt-1">
                          已用于 {device.usedInPlans} 个计划
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={device.alive === 1 ? "default" : "secondary"}>
                    {device.alive === 1 ? "在线" : "离线"}
                  </Badge>
                </Label>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          {/* <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
            取消
          </Button> */}
          <Button onClick={() => {
            onSelect(tempSelected)
            onOpenChange(false)
          }}>
            确定{tempSelected.length > 0 ? ` (${tempSelected.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
