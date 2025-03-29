"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Battery, Users, MessageCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export interface Device {
  id: string
  imei: string
  name: string
  remark: string
  status: "online" | "offline"
  battery: number
  wechatId: string
  friendCount: number
  todayAdded: number
  messageCount: number
  lastActive: string
  addFriendStatus: "normal" | "abnormal"
}

interface DeviceGridProps {
  devices: Device[]
  selectable?: boolean
  selectedDevices?: string[]
  onSelect?: (deviceIds: string[]) => void
  deviceStatuses?: Record<string, { status: "online" | "offline"; battery: number }>
}

export function DeviceGrid({ devices, selectable, selectedDevices, onSelect, deviceStatuses }: DeviceGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {devices.map((device) => {
        const currentStatus = deviceStatuses?.[device.id] || device
        return (
          <Card
            key={device.id}
            className={`p-4 relative ${selectable && selectedDevices?.includes(device.id) ? "ring-2 ring-blue-500" : ""}`}
          >
            {selectable && (
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedDevices?.includes(device.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelect?.([...(selectedDevices ?? []), device.id])
                    } else {
                      onSelect?.(selectedDevices?.filter((id) => id !== device.id) ?? [])
                    }
                  }}
                />
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={currentStatus.status === "online" ? "success" : "secondary"}>
                  {currentStatus.status === "online" ? "在线" : "离线"}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Battery className={`w-4 h-4 ${currentStatus.battery < 20 ? "text-red-500" : "text-green-500"}`} />
                  <span className="text-sm">{currentStatus.battery}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">{device.name}</div>
                    <div className="text-xs text-gray-500">IMEI-{device.imei}</div>
                  </div>
                </div>
                {device.remark && <div className="text-xs text-gray-500">备注: {device.remark}</div>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{device.friendCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{device.messageCount}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <div>微信号：{device.wechatId}</div>
                <div>今日添加：{device.todayAdded}</div>
                <div>
                  加友状态：
                  <Badge variant={device.addFriendStatus === "normal" ? "success" : "destructive"}>
                    {device.addFriendStatus === "normal" ? "正常" : "异常"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

