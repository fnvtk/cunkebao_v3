"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { QrCode, X, ChevronDown, Plus, Maximize2, Upload, Download, Settings, Loader2 } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { fetchScenes } from "@/api/scenarios"
import type { SceneItem } from "@/api/scenarios"
import { toast } from "react-hot-toast"

// 调整场景顺序，确保API获客在最后，并且前三个是最常用的场景
const scenarios = [
  { id: "haibao", name: "海报获客", type: "material" },
  { id: "order", name: "订单获客", type: "api" },
  { id: "douyin", name: "抖音获客", type: "social" },
  { id: "xiaohongshu", name: "小红书获客", type: "social" },
  { id: "phone", name: "电话获客", type: "social" },
  { id: "gongzhonghao", name: "公众号获客", type: "social" },
  { id: "weixinqun", name: "微信群获客", type: "social" },
  { id: "payment", name: "付款码获客", type: "material" },
  { id: "api", name: "API获客", type: "api" }, // API获客放在最后
]

interface Account {
  id: string
  nickname: string
  avatar: string
}

interface Material {
  id: string
  name: string
  type: "poster" | "payment"
  preview: string
}

interface BasicSettingsProps {
  formData: any
  onChange: (data: any) => void
  onNext?: () => void
}

const posterTemplates = [
  {
    id: "poster-1",
    name: "点击领取",
    preview:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%82%B9%E5%87%BB%E9%A2%86%E5%8F%961-tipd1HI7da6qooY5NkhxQnXBnT5LGU.gif",
  },
  {
    id: "poster-2",
    name: "点击合作",
    preview:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%82%B9%E5%87%BB%E5%90%88%E4%BD%9C-LPlMdgxtvhqCSr4IM1bZFEFDBF3ztI.gif",
  },
  {
    id: "poster-3",
    name: "点击咨询",
    preview:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%82%B9%E5%87%BB%E5%92%A8%E8%AF%A2-FTiyAMAPop2g9LvjLOLDz0VwPg3KVu.gif",
  },
  {
    id: "poster-4",
    name: "点击签到",
    preview:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%82%B9%E5%87%BB%E7%AD%BE%E5%88%B0-94TZIkjLldb4P2jTVlI6MkSDg0NbXi.gif",
  },
  {
    id: "poster-5",
    name: "点击了解",
    preview:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%82%B9%E5%87%BB%E4%BA%86%E8%A7%A3-6GCl7mQVdO4WIiykJyweSubLsTwj71.gif",
  },
  {
    id: "poster-6",
    name: "点击报名",
    preview:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E7%82%B9%E5%87%BB%E6%8A%A5%E5%90%8D-Mj0nnva0BiASeDAIhNNaRRAbjPgjEj.gif",
  },
]

const generateRandomAccounts = (count: number): Account[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `account-${index + 1}`,
    nickname: `账号-${Math.random().toString(36).substring(2, 7)}`,
    avatar: `/placeholder.svg?height=40&width=40&text=${index + 1}`,
  }))
}

const generatePosterMaterials = (): Material[] => {
  return posterTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    type: "poster",
    preview: template.preview,
  }))
}

// 格式化场景名称，移除"获客"二字
function formatSceneName(name: string): string {
  return name.replace(/获客/g, "");
}

export function BasicSettings({ formData, onChange, onNext }: BasicSettingsProps) {
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPhoneSettingsOpen, setIsPhoneSettingsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [accounts] = useState<Account[]>(generateRandomAccounts(50))
  const [materials] = useState<Material[]>(generatePosterMaterials())
  const [selectedAccounts, setSelectedAccounts] = useState<Account[]>(
    formData.accounts?.length > 0 ? formData.accounts : [],
  )
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>(
    formData.materials?.length > 0 ? formData.materials : [],
  )
  
  // 添加场景列表状态
  const [scenes, setScenes] = useState<SceneItem[]>([])
  const [loadingScenes, setLoadingScenes] = useState(true)
  const [sceneError, setSceneError] = useState<string | null>(null)
  
  const [showAllScenarios, setShowAllScenarios] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importedTags, setImportedTags] = useState<
    Array<{
      phone: string
      wechat: string
      source?: string
      orderAmount?: number
      orderDate?: string
    }>
  >(formData.importedTags || [])

  // 初始化电话获客设置
  const [phoneSettings, setPhoneSettings] = useState({
    autoAdd: formData.phoneSettings?.autoAdd ?? true,
    speechToText: formData.phoneSettings?.speechToText ?? true,
    questionExtraction: formData.phoneSettings?.questionExtraction ?? true,
  })

  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // 加载场景列表
  useEffect(() => {
    const loadScenes = async () => {
      try {
        setLoadingScenes(true)
        setSceneError(null)
        
        const response = await fetchScenes({ limit: 30 })
        
        if (response.code === 200 && response.data?.list) {
          setScenes(response.data.list)
        } else {
          setSceneError(response.msg || "获取场景列表失败")
          console.error("获取场景列表失败:", response.msg)
        }
      } catch (err) {
        console.error("获取场景列表失败:", err)
        setSceneError("获取场景列表失败，请稍后重试")
      } finally {
        setLoadingScenes(false)
      }
    }
    
    loadScenes()
  }, [])

  // 初始化时，如果没有选择场景，默认选择海报获客
  useEffect(() => {
    if (!formData.scenario) {
      onChange({ ...formData, scenario: "haibao" })
    }

    if (!formData.planName) {
      if (formData.materials?.length > 0) {
        const today = new Date().toLocaleDateString("zh-CN").replace(/\//g, "")
        onChange({ ...formData, planName: `海报${today}` })
      } else {
        onChange({ ...formData, planName: "场景" })
      }
    }
  }, [formData, onChange])

  // 处理从API获取的场景选择
  const handleSceneSelect = (scene: SceneItem) => {
    // 更新formData中的场景相关数据
    const formattedName = formatSceneName(scene.name);
    
    onChange({
      ...formData,
      sceneId: scene.id,
      sceneName: scene.name,
      scenario: getLocalScenarioType(scene.name), // 基于名称推断本地场景类型
    });
    
    // 如果是电话场景，自动设置计划名称
    if (scene.name.includes("电话")) {
      const today = new Date().toLocaleDateString("zh-CN").replace(/\//g, "");
      onChange({ ...formData, planName: `${formattedName}${today}` });
    }
  }

  // 处理本地场景选择
  const handleScenarioSelect = (scenarioId: string) => {
    onChange({ ...formData, scenario: scenarioId })
    
    // 如果选择了电话获客，自动更新计划名称
    if (scenarioId === "phone") {
      const today = new Date().toLocaleDateString("zh-CN").replace(/\//g, "")
      onChange({ ...formData, planName: `电话${today}` })
    }
  }

  // 根据场景名称推断本地场景类型
  const getLocalScenarioType = (name: string): string => {
    if (name.includes("海报")) return "haibao";
    if (name.includes("订单")) return "order";
    if (name.includes("抖音")) return "douyin";
    if (name.includes("小红书")) return "xiaohongshu";
    if (name.includes("电话")) return "phone";
    if (name.includes("公众号")) return "gongzhonghao";
    if (name.includes("微信群")) return "weixinqun";
    if (name.includes("付款码")) return "payment";
    if (name.includes("API")) return "api";
    return "haibao"; // 默认返回海报获客类型
  }

  const handleAccountSelect = (account: Account) => {
    const updatedAccounts = [...selectedAccounts, account]
    setSelectedAccounts(updatedAccounts)
    onChange({ ...formData, accounts: updatedAccounts })
  }

  const handleMaterialSelect = (material: Material) => {
    const updatedMaterials = [material]
    setSelectedMaterials(updatedMaterials)
    onChange({ ...formData, materials: updatedMaterials })
    setIsMaterialDialogOpen(false)

    // 更新计划名称
    const today = new Date().toLocaleDateString("zh-CN").replace(/\//g, "")
    onChange({ ...formData, planName: `海报${today}`, materials: updatedMaterials })
  }

  const handleRemoveAccount = (accountId: string) => {
    const updatedAccounts = selectedAccounts.filter((a) => a.id !== accountId)
    setSelectedAccounts(updatedAccounts)
    onChange({ ...formData, accounts: updatedAccounts })
  }

  const handleRemoveMaterial = (materialId: string) => {
    const updatedMaterials = selectedMaterials.filter((m) => m.id !== materialId)
    setSelectedMaterials(updatedMaterials)
    onChange({ ...formData, materials: updatedMaterials })
  }

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsPreviewOpen(true)
  }

  // 只显示前三个场景，其他的需要点击展开
  const displayedScenarios = showAllScenarios ? scenarios : scenarios.slice(0, 3)

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const rows = content.split("\n").filter((row) => row.trim())
          const tags = rows.slice(1).map((row) => {
            const [phone, wechat, source, orderAmount, orderDate] = row.split(",")
            return {
              phone: phone.trim(),
              wechat: wechat?.trim(),
              source: source?.trim(),
              orderAmount: orderAmount ? Number(orderAmount) : 0,
              orderDate: orderDate?.trim(),
            }
          })
          setImportedTags(tags)
          onChange({ ...formData, importedTags: tags })
        } catch (error) {
          console.error("导入失败:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDownloadTemplate = () => {
    // 直接从 public 目录下载文件
    const link = document.createElement("a")
    link.href = "/订单导入模板.csv"
    link.download = "订单导入模板.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 处理电话获客设置更新
  const handlePhoneSettingsUpdate = () => {
    onChange({ ...formData, phoneSettings })
    setIsPhoneSettingsOpen(false)
  }

  const handleConfirmImport = async () => {
    if (importedTags.length === 0) {
      setImportError('请先导入数据');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/traffic/pool/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 添加认证token
        },
        body: JSON.stringify({
          mobile: importedTags.map(tag => tag.phone),
          from: importedTags.map(tag => tag.source),
          sceneId: formData.sceneId
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        toast.success(`成功导入 ${result.data.success} 条数据`);
        setIsImportDialogOpen(false);
      } else {
        setImportError(result.msg || '导入失败');
      }
    } catch (error) {
      setImportError('导入失败，请稍后重试');
      console.error('导入失败:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="w-full p-4">
        <div className="space-y-6">
          <div>
            <Label className="text-base mb-4 block">获客场景</Label>
            
            {/* 场景按钮阵列 */}
            <div className="grid grid-cols-3 gap-2">
              {loadingScenes ? (
                // 加载中状态
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-10 w-full rounded-lg bg-gray-200 animate-pulse"></div>
                ))
              ) : sceneError || scenes.length === 0 ? (
                // 加载失败或无数据时显示本地场景
                displayedScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className={`p-2 rounded-lg text-center transition-all ${
                      formData.scenario === scenario.id
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  onClick={() => handleScenarioSelect(scenario)}
                  >
                    {formatSceneName(scenario.name)}
                  </button>
                ))
              ) : (
                // 从API获取的场景列表
                scenes.map((scene) => (
                  <button
                    key={scene.id}
                    className={`p-2 rounded-lg text-center transition-all ${
                      formData.sceneId === scene.id
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSceneSelect(scene)}
                  >
                    {formatSceneName(scene.name)}
                  </button>
                ))
              )}
            </div>
            
            {/* 展开更多按钮 - 仅当显示本地场景且未展开全部时显示 */}
            {(!loadingScenes && (sceneError || scenes.length === 0) && !showAllScenarios) && (
              <Button variant="ghost" className="mt-2 w-full text-blue-600" onClick={() => setShowAllScenarios(true)}>
                展开更多选项 <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="planName">计划名称</Label>
            <Input
              id="planName"
              value={formData.planName}
              onChange={(e) => onChange({ ...formData, planName: e.target.value })}
              placeholder="请输入计划名称"
              className="mt-2"
            />
          </div>

          {formData.scenario && (
            <>
              {scenarios.find((s) => s.id === formData.scenario)?.type === "social" && (
                <div>
                  <Label>绑定账号</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      className="flex-1 justify-start"
                      onClick={() => setIsAccountDialogOpen(true)}
                    >
                      {selectedAccounts.length > 0 ? `已选择 ${selectedAccounts.length} 个账号` : "选择账号"}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setIsQRCodeOpen(true)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedAccounts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedAccounts.map((account) => (
                        <div key={account.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <img
                            src={account.avatar || "/placeholder.svg"}
                            alt={account.nickname}
                            className="w-4 h-4 rounded-full mr-2"
                          />
                          <span className="text-sm">{account.nickname}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 p-0"
                            onClick={() => handleRemoveAccount(account.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 电话获客特殊设置 */}
              {formData.scenario === "phone" && (
                <Card className="p-4 border-blue-100 bg-blue-50/50 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium text-blue-700">电话获客设置</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPhoneSettingsOpen(true)}
                      className="flex items-center gap-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      修改设置
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${phoneSettings.autoAdd ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span>自动添加客户</span>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs ${phoneSettings.autoAdd ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {phoneSettings.autoAdd ? "已开启" : "已关闭"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${phoneSettings.speechToText ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span>语音转文字</span>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs ${phoneSettings.speechToText ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {phoneSettings.speechToText ? "已开启" : "已关闭"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${phoneSettings.questionExtraction ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span>问题提取</span>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs ${phoneSettings.questionExtraction ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {phoneSettings.questionExtraction ? "已开启" : "已关闭"}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    提示：电话获客功能将自动记录来电信息，并根据设置执行相应操作
                  </p>
                </Card>
              )}

              {scenarios.find((s) => s.id === formData.scenario)?.type === "material" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>选择海报</Label>
                    <Button variant="outline" onClick={() => setIsMaterialDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 海报展示区域 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden group ${
                          selectedMaterials.find((m) => m.id === material.id)
                            ? "ring-2 ring-blue-600"
                            : "hover:ring-2 hover:ring-blue-600"
                        }`}
                        onClick={() => handleMaterialSelect(material)}
                      >
                        <img
                          src={material.preview || "/placeholder.svg"}
                          alt={material.name}
                          className="w-full aspect-[9/16] object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewImage(material.preview)
                            }}
                          >
                            <Maximize2 className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
                          <div className="text-sm truncate">{material.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedMaterials.length > 0 && (
                    <div className="mt-4">
                      <Label>已选择的海报</Label>
                      <div className="mt-2">
                        <div className="relative w-full max-w-[200px]">
                          <img
                            src={selectedMaterials[0].preview || "/placeholder.svg"}
                            alt={selectedMaterials[0].name}
                            className="w-full aspect-[9/16] object-cover rounded-lg cursor-pointer"
                            onClick={() => handlePreviewImage(selectedMaterials[0].preview)}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => handleRemoveMaterial(selectedMaterials[0].id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {scenarios.find((s) => s.id === formData.scenario)?.id === "order" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>订单导入</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleDownloadTemplate}>
                        <Download className="h-4 w-4 mr-2" />
                        下载模板
                      </Button>
                      <Button onClick={() => setIsImportDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        导入订单
                      </Button>
                    </div>
                  </div>

                  {importedTags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">已导入 {importedTags.length} 条数据</h4>
                      <div className="max-h-[300px] overflow-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>电话号码</TableHead>
                              <TableHead>来源</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importedTags.slice(0, 5).map((tag, index) => (
                              <TableRow key={index}>
                                <TableCell>{tag.phone}</TableCell>
                                <TableCell>{tag.source}</TableCell>
                              </TableRow>
                            ))}
                            {importedTags.length > 5 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500">
                                  还有 {importedTags.length - 5} 条数据未显示
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">是否启用</Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => onChange({ ...formData, enabled: checked })}
            />
          </div>

          <Button className="w-full h-12 text-base" onClick={onNext}>
            下一步
              </Button>
            </div>
          </div>
  )
}

