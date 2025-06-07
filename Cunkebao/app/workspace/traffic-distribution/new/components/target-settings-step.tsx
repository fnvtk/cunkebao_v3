"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Search, Users, Smartphone } from "lucide-react"
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

  // 账号选择相关状态
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountList, setAccountList] = useState<any[]>([])
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [accountPage, setAccountPage] = useState(1)
  const [accountTotal, setAccountTotal] = useState(0)
  const [accountLoading, setAccountLoading] = useState(false)

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

  // 同步初始账号
  useEffect(() => {
    const ids = Array.isArray(initialData.accounts) ? initialData.accounts.map(String) : [];
    setSelectedAccountIds(ids);
  }, [initialData.accounts])

  // 拉取账号列表
  useEffect(() => {
    setAccountLoading(true)
    api.get(`/v1/workbench/account-list?page=${accountPage}&size=10`).then((res: any) => {
      setAccountList(res.data?.list || [])
      setAccountTotal(res.data?.total || 0)
    }).finally(() => setAccountLoading(false))
  }, [accountPage])

  // 账号弹窗每次打开时同步反选
  useEffect(() => {
    if (accountDialogOpen) {
      const ids = Array.isArray(initialData.accounts) ? initialData.accounts.map(String) : [];
      setSelectedAccountIds(ids);
    }
  }, [accountDialogOpen, initialData.accounts])

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
    onNext({ devices: selectedDeviceIds, accounts: selectedAccountIds })
  }

  // 弹窗内确认选择
  const handleDialogConfirm = () => {
    if (typeof setDevices === 'function') {
      setDevices(selectedDeviceIds)
    }
    setDeviceDialogOpen(false)
  }

  // 账号弹窗确认
  const handleAccountDialogConfirm = () => {
    setAccountDialogOpen(false)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">目标设置</h2>
      {/* 设备选择 */}
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
      {/* 账号选择 */}
      <div className="mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="选择账号"
            value={selectedAccountIds.length > 0 ? `已选择${selectedAccountIds.length}个账号` : ''}
            readOnly
            className="pl-10 cursor-pointer"
            onClick={() => setAccountDialogOpen(true)}
          />
        </div>
      </div>
      {/* 已选账号/设备展示优化 */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4 text-blue-500" />
          <span>已选账号：</span>
          {selectedAccountIds.length === 0 ? (
            <span className="text-gray-400">未选择</span>
          ) : (
            <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5 font-semibold">{selectedAccountIds.length} 个</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Smartphone className="w-4 h-4 text-green-500" />
          <span>已选设备：</span>
          {selectedDeviceIds.length === 0 ? (
            <span className="text-gray-400">未选择</span>
          ) : (
            <span className="bg-green-50 text-green-600 rounded px-2 py-0.5 font-semibold">{selectedDeviceIds.length} 个</span>
          )}
        </div>
      </div>
      <div className="mt-10 flex justify-between">
        <Button variant="outline" onClick={onBack}>← 上一步</Button>
        <Button onClick={handleSubmit} disabled={selectedDeviceIds.length === 0} className="px-8 font-bold shadow-md">下一步 →</Button>
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
      {/* 账号选择弹窗 */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-xl w-full p-0 rounded-2xl shadow-2xl max-h-[80vh]">
          <DialogTitle className="text-lg font-bold text-center py-3 border-b">选择账号</DialogTitle>
          <div className="p-6 pt-4">
            {/* 账号列表 */}
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {accountLoading ? (
                <div className="text-center text-gray-400 py-8">加载中...</div>
              ) : accountList.length === 0 ? (
                <div className="text-center text-gray-400 py-8">暂无账号</div>
              ) : (
                accountList.map(account => (
                  <label
                    key={account.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border
                      ${selectedAccountIds.includes(String(account.id)) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
                      hover:border-blue-400 transition-colors cursor-pointer
                    `}
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-500 scale-110"
                      checked={selectedAccountIds.includes(String(account.id))}
                      onChange={() => {
                        setSelectedAccountIds(prev =>
                          prev.includes(String(account.id))
                            ? prev.filter(id => id !== String(account.id))
                            : [...prev, String(account.id)]
                        )
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-base">{account.realName || account.nickname || account.userName}</div>
                      <div className="text-xs text-gray-500">账号: {account.userName}</div>
                      <div className="text-xs text-gray-400">昵称: {account.nickname || '--'} 备注: {account.memo || '--'}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {/* 分页 */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button size="sm" variant="outline" disabled={accountPage === 1} onClick={() => setAccountPage(p => Math.max(1, p - 1))}>上一页</Button>
              <span className="text-sm">第 {accountPage} 页 / 共 {Math.ceil(accountTotal / 10) || 1} 页</span>
              <Button size="sm" variant="outline" disabled={accountPage >= Math.ceil(accountTotal / 10)} onClick={() => setAccountPage(p => p + 1)}>下一页</Button>
            </div>
            {/* 确认按钮 */}
            <div className="flex justify-center mt-8">
              <Button
                className="w-4/5 py-3 rounded-full text-base font-bold shadow-md"
                onClick={handleAccountDialogConfirm}
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
