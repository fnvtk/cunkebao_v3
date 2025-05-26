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

export default function TargetSettingsStep({ onNext, onBack, initialData = {} }: TargetSettingsStepProps) {
  const [deviceList, setDeviceList] = useState<any[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(initialData.devices || [])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/v1/devices?page=1&limit=100').then(res => {
      setDeviceList(res.data?.list || [])
    }).finally(() => setLoading(false))
  }, [])

  const filteredDevices = deviceList.filter(device =>
    (device.memo || device.nickname || "").toLowerCase().includes(search.toLowerCase())
  )

  const toggleDevice = (id: string) => {
    setSelectedDeviceIds(prev =>
      prev.includes(id) ? prev.filter(did => did !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    onNext({
      targets: selectedDeviceIds,
    })
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">目标设置</h2>
      <div className="mb-4">
        <Input placeholder="搜索设备" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
        {loading ? <div className="text-center text-gray-400 py-8">加载中...</div> :
          filteredDevices.map(device => (
            <div key={device.id} className="flex items-center border rounded-lg px-4 py-2 mb-2 justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${device.alive === 1 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>设</span>
                <div>
                  <div className="font-medium">{device.memo }</div>
                  <div className="text-xs text-gray-400">IMEI:{device.imei}</div>
                  <div className="text-xs text-gray-400">微信号:{device.wechatId || "--"}（{device.nickname || "--"}）</div>
                  <div className={`text-xs ${device.alive === 1 ? "text-green-600" : "text-gray-400"}`}>{device.alive === 1 ? "在线" : "离线"}</div>
                </div>
              </div>
              <Checkbox
                checked={selectedDeviceIds.includes(device.id)}
                onCheckedChange={() => toggleDevice(device.id)}
              />
            </div>
          ))
        }
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>← 上一步</Button>
        <Button onClick={handleSubmit} disabled={selectedDeviceIds.length === 0}>下一步 →</Button>
      </div>
    </div>
  )
}
