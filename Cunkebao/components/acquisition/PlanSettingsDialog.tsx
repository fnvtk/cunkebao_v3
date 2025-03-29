"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface PlanSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
}

export function PlanSettingsDialog({ open, onOpenChange, planId }: PlanSettingsDialogProps) {
  const [planName, setPlanName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [frequency, setFrequency] = useState("daily")
  const [isLoading, setIsLoading] = useState(false)

  // Simulate loading plan data
  useEffect(() => {
    if (open && planId) {
      // In a real app, you would fetch the plan data here
      setPlanName(`获客计划 ${planId}`)
      setIsActive(true)
      setFrequency("daily")
    }
  }, [open, planId])

  const handleSave = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      toast({
        title: "计划已更新",
        description: "获客计划设置已成功保存",
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑获客计划</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              计划名称
            </Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-status" className="text-right">
              计划状态
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="plan-status" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="plan-status">{isActive ? "进行中" : "已暂停"}</Label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-frequency" className="text-right">
              执行频率
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择执行频率" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">每小时</SelectItem>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "保存中..." : "保存更改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

