"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Minus, Clock, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useViewMode } from "@/app/components/LayoutWrapper"
import { Label } from "@/components/ui/label"

interface BasicSettingsProps {
  formData: {
    taskName: string
    startTime: string
    endTime: string
    syncCount: number
    syncInterval: number
    accountType: "business" | "personal"
    enabled: boolean
  }
  onChange: (data: Partial<BasicSettingsProps["formData"]>) => void
  onNext: () => void
}

export function BasicSettings({ formData, onChange, onNext }: BasicSettingsProps) {
  const { viewMode } = useViewMode()

  const handleSyncCountChange = (delta: number) => {
    const newValue = Math.max(1, formData.syncCount + delta)
    onChange({ syncCount: newValue })
  }

  const handleSyncIntervalChange = (delta: number) => {
    const newValue = Math.max(5, formData.syncInterval + delta)
    onChange({ syncInterval: newValue })
  }

  return (
    <div className={`space-y-6 ${viewMode === "desktop" ? "p-6" : "p-4"}`}>
      <div className={`grid ${viewMode === "desktop" ? "grid-cols-2 gap-8" : "grid-cols-1 gap-4"}`}>
        <div>
          <Label htmlFor="taskName" className="text-base">任务名称</Label>
          <Input
            id="taskName"
            value={formData.taskName}
            onChange={(e) => onChange({ taskName: e.target.value })}
            placeholder="请输入任务名称"
            className="mt-1.5 h-12 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-base">每日同步数量</Label>
          <div className="flex items-center space-x-4 mt-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => handleSyncCountChange(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-20 text-center text-base">{formData.syncCount}</div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => handleSyncCountChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-gray-500">条/天</span>
          </div>
        </div>

        <div>
          <Label className="text-base">同步间隔</Label>
          <div className="flex items-center space-x-4 mt-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => handleSyncIntervalChange(-5)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="w-20 text-center text-base">{formData.syncInterval}</div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => handleSyncIntervalChange(5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-gray-500">分钟</span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">设置每次发朋友圈的时间间隔</p>
        </div>

        <div>
          <Label className="text-base">同步时间</Label>
          <div className="grid grid-cols-2 gap-4 mt-1.5">
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => onChange({ startTime: e.target.value })}
              className="h-12 rounded-xl"
            />
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => onChange({ endTime: e.target.value })}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div>
          <Label className="text-base">账号类型</Label>
          <div className="grid grid-cols-2 gap-4 mt-1.5">
            <button
              type="button"
              className={`h-12 rounded-xl border ${
                formData.accountType === "business"
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600"
              }`}
              onClick={() => onChange({ accountType: "business" })}
            >
              业务号
            </button>
            <button
              type="button"
              className={`h-12 rounded-xl border ${
                formData.accountType === "personal"
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600"
              }`}
              onClick={() => onChange({ accountType: "personal" })}
            >
              人设号
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-base">是否启用</Label>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
          />
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base shadow-sm"
        disabled={!formData.taskName}
      >
        下一步
      </Button>
    </div>
  )
}
