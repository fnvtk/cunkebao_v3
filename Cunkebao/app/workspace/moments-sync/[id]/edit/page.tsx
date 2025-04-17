"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "../../components/step-indicator"
import { BasicSettings } from "../../components/basic-settings"
import { DeviceSelectionDialog } from "../../components/device-selection-dialog"
import { ContentLibrarySelectionDialog } from "../../components/content-library-selection-dialog"
import { Input } from "@/components/ui/input"
import { api, ApiResponse } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface Task {
  id: string
  name: string
  status: number
  config: {
    startTime: string
    endTime: string
    syncCount: number
    syncInterval: number
    syncType: number
    devices: string[]
    contentLibraries: string[]
  }
}

export default function EditMomentsSyncPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    taskName: "",
    startTime: "06:00",
    endTime: "23:59",
    syncCount: 5,
    syncInterval: 30,
    accountType: "business" as "business" | "personal",
    enabled: true,
    selectedDevices: [] as string[],
    selectedLibraries: [] as string[],
  })

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setIsLoading(true)
      try {
        const response = await api.get<{code: number, msg: string, data: Task}>(`/v1/workbench/detail?id=${resolvedParams.id}`)
        if (response.code === 200 && response.data) {
          const taskData = response.data
          setFormData({
            taskName: taskData.name || "",
            startTime: taskData.config.startTime || "06:00",
            endTime: taskData.config.endTime || "23:59",
            syncCount: taskData.config.syncCount || 5,
            syncInterval: taskData.config.syncInterval || 30,
            accountType: taskData.config.syncType === 1 ? "business" : "personal",
            enabled: !!taskData.status,
            selectedDevices: taskData.config.devices || [],
            selectedLibraries: taskData.config.contentLibraries || [],
          })
        } else {
          showToast(response.msg || "获取任务详情失败", "error")
          router.back()
        }
      } catch (error: any) {
        console.error("获取任务详情失败:", error)
        showToast(error?.message || "获取任务详情失败", "error")
        router.back()
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskDetail()
  }, [resolvedParams.id, router])

  const handleUpdateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleComplete = async () => {
    try {
      const response = await api.post<ApiResponse>('/v1/workbench/update', {
        id: resolvedParams.id,
        type: 2,
        name: formData.taskName,
        syncInterval: formData.syncInterval,
        syncCount: formData.syncCount,
        syncType: formData.accountType === "business" ? 1 : 2,
        startTime: formData.startTime,
        endTime: formData.endTime,
        accountType: formData.accountType === "business" ? 1 : 2,
        status: formData.enabled ? 1 : 0,
        devices: formData.selectedDevices,
        contentLibraries: formData.selectedLibraries
      });

      if (response.code === 200) {
        showToast(response.msg || "更新成功", "success");
        router.push("/workspace/moments-sync");
      } else {
        showToast(response.msg || "请稍后再试", "error");
      }
    } catch (error: any) {
      console.error("更新朋友圈同步任务失败:", error);
      showToast(error?.message || "请检查网络连接或稍后再试", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-50">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="ml-2 text-lg font-medium">编辑朋友圈同步</h1>
        </div>
      </header>

      <div className="mt-8">
        <StepIndicator currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && (
            <BasicSettings 
              formData={formData}
              onChange={handleUpdateFormData} 
              onNext={handleNext} 
            />
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
            <div className="space-y-6 px-6">
              <div className="relative">
                <Search className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="选择内容库"
                  className="h-12 pl-11 rounded-xl border-gray-200 text-base"
                  onClick={() => setLibraryDialogOpen(true)}
                  readOnly
                  value={formData.selectedLibraries.length > 0 ? `已选择 ${formData.selectedLibraries.length} 个内容库` : ""}
                />
              </div>

              {formData.selectedLibraries.length > 0 && (
                <div className="text-base text-gray-500">已选内容库：{formData.selectedLibraries.length} 个</div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button variant="outline" onClick={handlePrev} className="flex-1 h-12 rounded-xl text-base">
                  上一步
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base shadow-sm"
                  disabled={formData.selectedLibraries.length === 0}
                >
                  保存
                </Button>
              </div>

              <ContentLibrarySelectionDialog
                open={libraryDialogOpen}
                onOpenChange={setLibraryDialogOpen}
                selectedLibraries={formData.selectedLibraries}
                onSelect={(libraries) => {
                  handleUpdateFormData({ selectedLibraries: libraries })
                  setLibraryDialogOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

