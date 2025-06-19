"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { Search, Users } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://yishi.com'

interface BasicInfoStepProps {
  onNext: (data: any) => void
  initialData?: {
    name?: string
    distributeType?: string | number
    maxPerDay?: number
    timeType?: string | number
    startTime?: string
    endTime?: string
    accounts?: string[]
    account?: string[]
  }
}

export default function BasicInfoStep({ onNext, initialData = {} }: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    name: initialData.name ?? `流量分发 ${format(new Date(), "yyyyMMdd HHmm")}`,
    distributeType: String(initialData.distributeType ?? "1"),
    maxPerDay: initialData.maxPerDay ?? 200,
    timeType: String(initialData.timeType ?? "2"),
    startTime: initialData.startTime ?? "09:00",
    endTime: initialData.endTime ?? "18:00",
  })

  // 账号选择相关状态
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountList, setAccountList] = useState<any[]>([])
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    (initialData.account || initialData.accounts || []).map(String)
  )
  const [accountPage, setAccountPage] = useState(1)
  const [accountTotal, setAccountTotal] = useState(0)
  const [accountLoading, setAccountLoading] = useState(false)

  // API配置弹窗状态
  const [apiDialogOpen, setApiDialogOpen] = useState(false)
  const [apiKey] = useState("naxf1-82h2f-vdwcm-rrhpm-q9hd1") // 这里可以从后端获取或生成
  const [apiUrl] = useState(`${API_BASE_URL}/v1/plan/api/scenariosz`)

  // 拉取账号列表
  useEffect(() => {
    setAccountLoading(true)
    api.get(`/v1/workbench/account-list?page=${accountPage}&size=10`).then((res: any) => {
      setAccountList(res.data?.list || [])
      setAccountTotal(res.data?.total || 0)
    }).finally(() => setAccountLoading(false))
  }, [accountPage])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onNext({
      name: formData.name,
      distributeType: Number(formData.distributeType),
      maxPerDay: formData.maxPerDay,
      timeType: Number(formData.timeType),
      startTime: formData.timeType == "2" ? formData.startTime : "09:00",
      endTime: formData.timeType == "2" ? formData.endTime : "21:00",
      account: selectedAccountIds,
      accounts: selectedAccountIds,
    })
  }

  // 账号弹窗确认
  const handleAccountDialogConfirm = () => {
    setAccountDialogOpen(false)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">基本信息</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            计划名称 <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="请输入计划名称"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>分配方式</Label>
          <RadioGroup
            value={String(formData.distributeType)}
            onValueChange={(value) => handleChange("distributeType", value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="equal" />
              <Label htmlFor="equal" className="cursor-pointer">
                均分配 <span className="text-gray-500 text-sm">(流量将均分配给所有客服)</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>分配限制</Label>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>每日最大分配量</span>
              <span className="font-medium">{formData.maxPerDay} 人/天</span>
            </div>
            <Slider
              value={[formData.maxPerDay]}
              min={1}
              max={1000}
              step={1}
              onValueChange={(value) => handleChange("maxPerDay", value[0])}
              className="py-4"
            />
            <p className="text-sm text-gray-500">限制每天最多分配的流量数量（1-1000）</p>
          </div>

          <div className="space-y-4 pt-4">
            <Label>时间限制</Label>
            <RadioGroup
              value={String(formData.timeType)}
              onValueChange={(value) => handleChange("timeType", value)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="allDay" />
                <Label htmlFor="allDay" className="cursor-pointer">
                  全天分配
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  自定义时间段
                </Label>
              </div>
            </RadioGroup>

            {formData.timeType == "2" && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="startTime" className="mb-2 block">
                    开始时间
                  </Label>
                  <div className="relative">
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endTime" className="mb-2 block">
                    结束时间
                  </Label>
                  <div className="relative">
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 账号选择 */}
        <div className="space-y-2">
          <Label>选择账号 <span className="text-red-500 ml-1">*</span></Label>
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4 text-blue-500" />
            <span>已选账号：</span>
            {selectedAccountIds.length === 0 ? (
              <span className="text-gray-400">未选择</span>
            ) : (
              <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5 font-semibold">{selectedAccountIds.length} 个</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} disabled={selectedAccountIds.length === 0} className="px-8">
          下一步 →
        </Button>
      </div>

      {/* 账号选择弹窗 */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-xl w-full p-0 rounded-2xl shadow-2xl max-h-[80vh]">
          <DialogTitle className="text-lg font-bold text-center py-3 border-b">选择账号</DialogTitle>
          <div className="p-6 pt-4">
            {/* 账号列表 */}
            <div className="max-h-[500px] overflow-y-auto space-y-2">
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
                      <div className="font-semibold text-base">{account.realName || account.nickname}</div>
                      <div className="text-xs text-gray-500">账号: {account.userName || '--'}</div>
                    </div>
                  </label>
                ))
              )}
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
