"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"

interface ServerDevice {
  id: number
  imei: string
  memo: string
  wechatId: string
  alive: number
  totalFriend: number
}

interface Device {
  id: number
  name: string
  imei: string
  wxid: string
  status: "online" | "offline"
  totalFriend: number
}

interface DeviceSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDevices: number[]
  onSelect: (devices: number[]) => void
}

export function DeviceSelectionDialog({ open, onOpenChange, selectedDevices, onSelect }: DeviceSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [tempSelectedDevices, setTempSelectedDevices] = useState<number[]>(selectedDevices)

  useEffect(() => {
    if (open) {
      setTempSelectedDevices(selectedDevices)
      fetchDevices()
    }
  }, [open, selectedDevices])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await api.get<{code: number, msg: string, data: {list: ServerDevice[], total: number}}>('/v1/devices?page=1&limit=100')
      
      if (response.code === 200 && response.data.list) {
        const transformedDevices: Device[] = response.data.list.map(device => ({
          id: device.id,
          name: device.memo || device.imei || '',
          imei: device.imei || '',
          wxid: device.wechatId || '',
          status: device.alive === 1 ? "online" : "offline",
          totalFriend: device.totalFriend || 0
        }))
        setDevices(transformedDevices)
      }
    } catch (error) {
      console.error('获取设备列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDevices()
  }

  const handleDeviceToggle = (deviceId: number, checked: boolean) => {
    if (checked) {
      setTempSelectedDevices(prev => [...prev, deviceId])
    } else {
      setTempSelectedDevices(prev => prev.filter(id => id !== deviceId))
    }
  }

  const handleConfirm = () => {
    onSelect(tempSelectedDevices)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempSelectedDevices(selectedDevices)
    onOpenChange(false)
  }

  const filteredDevices = devices.filter((device) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      (device.name || '').toLowerCase().includes(searchLower) ||
      (device.imei || '').toLowerCase().includes(searchLower) ||
      (device.wxid || '').toLowerCase().includes(searchLower)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && device.status === "online") ||
      (statusFilter === "offline" && device.status === "offline")

    return matchesSearch && matchesStatus
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>选择设备</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索设备IMEI/备注/微信号"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
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

        <ScrollArea className="flex-1 -mx-6 px-6" style={{overflowY: 'auto'}}>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDevices.map((device) => (
                <label
                  key={device.id}
                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                  style={{paddingLeft: '0px',paddingRight: '0px'}}
                >
                  <Checkbox 
                    checked={tempSelectedDevices.includes(device.id)}
                    onCheckedChange={(checked) => handleDeviceToggle(device.id, checked as boolean)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{device.name}</span>
                      <Badge variant={device.status === "online" ? "default" : "secondary"}>
                        {device.status === "online" ? "在线" : "离线"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>IMEI: {device.imei || '--'}</div>
                      <div>微信号: {device.wxid || '--'}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4 flex gap-4 -mx-6 px-6">
          <Button className="flex-1" onClick={handleConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
