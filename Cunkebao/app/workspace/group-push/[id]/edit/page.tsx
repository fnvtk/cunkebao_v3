"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "../../components/step-indicator"
import { BasicSettings } from "../../components/basic-settings"
import { GroupSelector } from "../../components/group-selector"
import { ContentSelector } from "../../components/content-selector"
import type { WechatGroup, ContentLibrary } from "@/types/group-push"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"

const steps = [
  { id: 1, title: "步骤 1", subtitle: "基础设置" },
  { id: 2, title: "步骤 2", subtitle: "选择社群" },
  { id: 3, title: "步骤 3", subtitle: "选择内容库" },
  { id: 4, title: "步骤 4", subtitle: "京东联盟" },
]

export default function EditGroupPushPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    pushTimeStart: "06:00",
    pushTimeEnd: "23:59",
    dailyPushCount: 20,
    pushOrder: "latest" as "earliest" | "latest",
    isLoopPush: false,
    isImmediatePush: false,
    isEnabled: false,
    groups: [] as WechatGroup[],
    contentLibraries: [] as ContentLibrary[],
  })

  // 拉取详情
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/v1/workbench/detail?id=${id}`) as any
        if (res.code === 200 && res.data) {
          const data = res.data
          setFormData({
            name: data.name || "",
            pushTimeStart: data.config?.startTime || "06:00",
            pushTimeEnd: data.config?.endTime || "23:59",
            dailyPushCount: data.config?.maxPerDay || 20,
            pushOrder: data.config?.pushOrder === 2 ? "latest" : "earliest",
            isLoopPush: data.config?.isLoop === 1,
            isImmediatePush: false, // 详情接口如有此字段可补充
            isEnabled: data.status === 1,
            groups: (data.config.groupList || []).map((item: any) => ({
              id: String(item.id),
              name: item.groupName,
              avatar: item.groupAvatar || item.avatar,
              serviceAccount: {
                id: item.ownerWechatId,
                name: item.nickName,
                avatar: "",
              },
            })),
            contentLibraries: (data.config.contentLibraryList || []).map((item: any) => ({
              id: String(item.id),
              name: item.name,
              sourceType: item.sourceType,
              selectedFriends: item.selectedFriends || [],
              selectedGroups: item.selectedGroups || [],
            })),
          })
        } else {
          showToast(res.msg || "获取详情失败", "error")
        }
      } catch (e) {
        showToast((e as any)?.message || "网络错误", "error")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
    // eslint-disable-next-line
  }, [id])

  const handleBasicSettingsNext = (values: any) => {
    setFormData((prev) => ({ ...prev, ...values }))
    setCurrentStep(2)
  }

  const handleGroupsChange = (groups: WechatGroup[]) => {
    setFormData((prev) => ({ ...prev, groups }))
  }

  const handleLibrariesChange = (contentLibraries: ContentLibrary[]) => {
    setFormData((prev) => ({ ...prev, contentLibraries }))
  }

  const handleSave = async () => {
    const loadingToast = showToast("正在保存...", "loading", true)
    try {
      const paramsData = {
        id,
        name: formData.name,
        type: 3,
        pushType: 1,
        startTime: formData.pushTimeStart,
        endTime: formData.pushTimeEnd,
        maxPerDay: formData.dailyPushCount,
        pushOrder: formData.pushOrder === "latest" ? 2 : 1,
        isLoop: formData.isLoopPush ? 1 : 0,
        status: formData.isEnabled ? 1 : 0,
        groups: (formData.groups || []).filter(g => g && g.id).map((g: any) => g.id),
        contentLibraries: (formData.contentLibraries || []).filter(c => c && c.id).map((c: any) => c.id),
      }
      const res = await api.post("/v1/workbench/update", paramsData) as any
      loadingToast.remove()
      if (res.code === 200) {
        showToast("保存成功", "success")
        router.push("/workspace/group-push")
      } else {
        showToast(res.msg || "保存失败", "error")
      }
    } catch (e) {
      loadingToast.remove()
      showToast((e as any)?.message || "网络错误", "error")
    }
  }

  const handleCancel = () => {
    router.push("/workspace/group-push")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <span className="animate-spin h-8 w-8 text-blue-500">⏳</span>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 md:py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workspace/group-push")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">编辑社群推送任务</h1>
      </div>

      <StepIndicator currentStep={currentStep} steps={steps} />

      <div className="mt-8">
        {currentStep === 1 && (
          <BasicSettings
            defaultValues={{
              name: formData.name,
              pushTimeStart: formData.pushTimeStart,
              pushTimeEnd: formData.pushTimeEnd,
              dailyPushCount: formData.dailyPushCount,
              pushOrder: formData.pushOrder,
              isLoopPush: formData.isLoopPush,
              isImmediatePush: formData.isImmediatePush,
              isEnabled: formData.isEnabled,
            }}
            onNext={handleBasicSettingsNext}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 2 && (
          <GroupSelector
            selectedGroups={formData.groups}
            onGroupsChange={handleGroupsChange}
            onPrevious={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 3 && (
          <ContentSelector
            selectedLibraries={formData.contentLibraries}
            onLibrariesChange={handleLibrariesChange}
            onPrevious={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border rounded-md p-8 text-center text-gray-500">
              京东联盟设置（此步骤为占位，实际功能待开发）
            </div>

            <div className="flex space-x-2 justify-center sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(3)} className="flex-1 sm:flex-none">
                上一步
              </Button>
              <Button type="button" onClick={handleSave} className="flex-1 sm:flex-none">
                完成
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

