"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "./components/step-indicator"
import { TimeSettings, type TimeSettingsData } from "./components/time-settings"
import { DeviceSelection, type DeviceSelectionData } from "./components/device-selection"
import type { LikeConfigData } from "./components/like-config"
import { useRouter } from "next/navigation"

const steps = [
  {
    id: "device-selection",
    name: "设备选择",
    description: "选择执行自动点赞的设备",
  },
  {
    id: "audience-selection",
    name: "人群选择",
    description: "选择点赞目标人群",
  },
  {
    id: "time-settings",
    name: "时间设置",
    description: "设置点赞时间和频率",
  },
]

export default function AutoLikePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    deviceSelection: {
      selectedDevices: [],
      selectedDatabase: "",
      selectedAudience: "",
    } as DeviceSelectionData,
    timeSettings: {
      enableAutoLike: true,
      timeRanges: [{ id: "1", start: "06:00", end: "08:00" }],
      likeInterval: 15,
      randomizeInterval: false,
    } as TimeSettingsData,
    likeConfig: {
      likeAll: false,
      likeFirstPage: true,
      maxLikesPerDay: 50,
      likeImmediately: true,
      excludeTags: [],
      includeTags: [],
    } as LikeConfigData,
  })

  const handleDeviceSelectionSave = (data: DeviceSelectionData) => {
    setFormData({ ...formData, deviceSelection: data })
    setCurrentStep(1)
  }

  const handleTimeSettingsSave = (data: TimeSettingsData) => {
    setFormData({ ...formData, timeSettings: data })
    setCurrentStep(2)
  }

  const handleLikeConfigSave = (data: LikeConfigData) => {
    setFormData({ ...formData, likeConfig: data })
    // 提交表单或导航到确认页面
    router.push("/workspace")
  }

  const handleStepClick = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/workspace")
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          ← 返回
        </Button>
        <h1 className="text-2xl font-bold">自动点赞</h1>
        <p className="text-muted-foreground">设置自动点赞功能，提高互动率和活跃度</p>
      </div>

      <div className="mb-8">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      {currentStep === 0 && (
        <DeviceSelection
          initialData={formData.deviceSelection}
          onSave={handleDeviceSelectionSave}
          onBack={handleBack}
        />
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>人群选择</CardTitle>
            <CardDescription>选择需要自动点赞的目标人群</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 这里可以添加人群选择的具体内容 */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                上一步
              </Button>
              <Button onClick={() => setCurrentStep(2)}>下一步</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && <TimeSettings initialData={formData.timeSettings} onSave={handleTimeSettingsSave} />}
    </div>
  )
}

