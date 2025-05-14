"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StepIndicator } from "../components/step-indicator"
import { BasicSettings } from "../components/basic-settings"
import { DeviceSelectionDialog } from "../components/device-selection-dialog"
import { TagSelector } from "../components/tag-selector"
import { api, ApiResponse } from "@/lib/api"
import { showToast } from "@/lib/toast"
import { WechatFriendSelector, WechatFriend } from "@/components/WechatFriendSelector"

export default function NewAutoLikePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [isFriendSelectorOpen, setIsFriendSelectorOpen] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState<WechatFriend[]>([])
  const [formData, setFormData] = useState({
    taskName: "",
    likeInterval: 5, // 默认5秒
    maxLikesPerDay: 200, // 默认200次
    timeRange: { start: "08:00", end: "22:00" },
    contentTypes: ["text", "image", "video"],
    enabled: true,
    selectedDevices: [] as number[],
    selectedTags: [] as string[],
    tagOperator: "and" as "and" | "or",
    friends: [] as string[],
  })

  const handleUpdateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSelectFriends = () => {
    if (formData.selectedDevices.length === 0) {
      showToast("请先选择设备", "error")
      return
    }
    setIsFriendSelectorOpen(true)
  }

  const handleSaveSelectedFriends = (friends: WechatFriend[]) => {
    const ids = friends.map(f => f.id)
    setSelectedFriends(friends)
    handleUpdateFormData({ friends: ids })
    setIsFriendSelectorOpen(false)
  }

  const handleComplete = async () => {
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/create', {
        type: 1,
        name: formData.taskName,
        interval: formData.likeInterval,
        maxLikes: formData.maxLikesPerDay,
        startTime: formData.timeRange.start,
        endTime: formData.timeRange.end,
        contentTypes: formData.contentTypes,
        enabled: formData.enabled,
        devices: formData.selectedDevices,
        friends: formData.friends,
      });

      if (response.code === 200) {
        showToast(response.msg, "success");
        router.push("/workspace/auto-like");
      } else {
        showToast(response.msg || "请稍后再试", "error");
      }
    } catch (error: any) {
      console.error("创建自动点赞任务失败:", error);
      showToast(error?.message || "请检查网络连接或稍后再试", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-50">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="ml-2 text-lg font-medium">新建自动点赞</h1>
        </div>
      </header>

      <div className="mt-8">
        <StepIndicator currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && (
            <BasicSettings formData={formData} onChange={handleUpdateFormData} onNext={handleNext} />
          )}

          {currentStep === 2 && (
            <div className="space-y-6 px-6">
              <div className="relative">
                <Search className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="选择设备"
                  className="h-12 pl-11 rounded-xl border-gray-200 text-base"
                  onClick={() => setDeviceDialogOpen(true)}
                  readOnly
                  value={formData.selectedDevices.length > 0 ? `已选择 ${formData.selectedDevices.length} 个设备` : ""}
                />
              </div>

              {formData.selectedDevices.length > 0 && (
                <div className="text-base text-gray-500">已选设备：{formData.selectedDevices.length} 个</div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button variant="outline" onClick={handlePrev} className="flex-1 h-12 rounded-xl text-base">
                  上一步
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base shadow-sm"
                  disabled={formData.selectedDevices.length === 0}
                >
                  下一步
                </Button>
              </div>

              <DeviceSelectionDialog
                open={deviceDialogOpen}
                onOpenChange={setDeviceDialogOpen}
                selectedDevices={formData.selectedDevices}
                onSelect={(devices) => {
                  handleUpdateFormData({ selectedDevices: devices })
                  setDeviceDialogOpen(false)
                }}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="px-6">
              <div className="relative">
                <Users className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="选择微信好友"
                  className="h-12 pl-11 rounded-xl border-gray-200 text-base"
                  onClick={handleSelectFriends}
                  readOnly
                  value={formData.friends.length > 0 ? `已选择 ${formData.friends.length} 个好友` : ""}
                />
              </div>
              {formData.friends.length > 0 && (
                <div className="text-base text-gray-500">已选好友：{formData.friends.length} 个</div>
              )}
              <div className="flex space-x-4 pt-4">
                <Button variant="outline" onClick={handlePrev} className="flex-1 h-12 rounded-xl text-base">
                  上一步
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base shadow-sm"
                >
                  完成
                </Button>
              </div>
              <WechatFriendSelector
                open={isFriendSelectorOpen}
                onOpenChange={setIsFriendSelectorOpen}
                selectedFriends={selectedFriends}
                onSelect={handleSaveSelectedFriends}
                devices={formData.selectedDevices}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
