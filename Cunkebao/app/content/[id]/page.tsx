"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { WechatFriendSelector } from "@/components/WechatFriendSelector"
import { WechatGroupSelector } from "@/components/WechatGroupSelector"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"

interface ContentLibrary {
  id: string
  name: string
  sourceType: "friends" | "groups"
  keywordsInclude: string
  keywordsExclude: string
  startDate: string
  endDate: string
  selectedFriends: any[]
  selectedGroups: any[]
  useAI: boolean
  aiPrompt: string
  enabled: boolean
}

export default function ContentLibraryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [library, setLibrary] = useState<ContentLibrary | null>(null)
  const [isWechatFriendSelectorOpen, setIsWechatFriendSelectorOpen] = useState(false)
  const [isWechatGroupSelectorOpen, setIsWechatGroupSelectorOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLibrary = async () => {
      setIsLoading(true)
      try {
        // 模拟从API获取内容库数据
        await new Promise((resolve) => setTimeout(resolve, 500))
        const data = {
          id: params.id,
          name: "示例内容库",
          sourceType: "friends",
          keywordsInclude: "关键词1,关键词2",
          keywordsExclude: "排除词1,排除词2",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          selectedFriends: [
            { id: "1", nickname: "张三", avatar: "/placeholder.svg?height=40&width=40" },
            { id: "2", nickname: "李四", avatar: "/placeholder.svg?height=40&width=40" },
          ],
          selectedGroups: [],
          useAI: true,
          aiPrompt: "AI提示词示例",
          enabled: true,
        }
        setLibrary(data)
      } catch (error) {
        console.error("Failed to fetch library data:", error)
        toast({
          title: "错误",
          description: "获取内容库数据失败",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchLibrary()
  }, [params.id])

  const handleSave = async () => {
    if (!library) return
    try {
      // 模拟保存到API
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "成功",
        description: "内容库已保存",
      })
      // 这里应该调用一个函数来更新外部展示的数据
      // updateExternalDisplay(library)
    } catch (error) {
      console.error("Failed to save library:", error)
      toast({
        title: "错误",
        description: "保存内容库失败",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>
  }

  if (!library) {
    return <div className="flex justify-center items-center h-screen">内容库不存在</div>
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">内容库详情</h1>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base required">
                内容库名称
              </Label>
              <Input
                id="name"
                value={library.name}
                onChange={(e) => setLibrary({ ...library, name: e.target.value })}
                placeholder="请输入内容库名称"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-base">数据来源配置</Label>
              <Tabs
                value={library.sourceType}
                onValueChange={(value: "friends" | "groups") => setLibrary({ ...library, sourceType: value })}
                className="mt-1.5"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="friends">选择微信好友</TabsTrigger>
                  <TabsTrigger value="groups">选择聊天群</TabsTrigger>
                </TabsList>
                <TabsContent value="friends" className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setIsWechatFriendSelectorOpen(true)}>
                    选择微信好友
                  </Button>
                  {library.selectedFriends.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {library.selectedFriends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                          <span>{friend.nickname}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="groups" className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setIsWechatGroupSelectorOpen(true)}>
                    选择聊天群
                  </Button>
                  {library.selectedGroups.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {library.selectedGroups.map((group) => (
                        <div key={group.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                          <span>{group.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="keywords">
                <AccordionTrigger>关键字设置</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keywordsInclude" className="text-base">
                        关键字匹配
                      </Label>
                      <Textarea
                        id="keywordsInclude"
                        value={library.keywordsInclude}
                        onChange={(e) => setLibrary({ ...library, keywordsInclude: e.target.value })}
                        placeholder="如果设置了关键字，系统只会采集含有关键字的内容。多个关键字，用半角的','隔开。"
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="keywordsExclude" className="text-base">
                        关键字排除
                      </Label>
                      <Textarea
                        id="keywordsExclude"
                        value={library.keywordsExclude}
                        onChange={(e) => setLibrary({ ...library, keywordsExclude: e.target.value })}
                        placeholder="如果设置了关键字，匹配到关键字的，系统将不会采集。多个关键字，用半角的','隔开。"
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">是否启用AI</Label>
                <p className="text-sm text-gray-500 mt-1">
                  当启用AI之后，该内容库下的所有内容，都会通过AI重新生成内容。
                </p>
              </div>
              <Switch
                checked={library.useAI}
                onCheckedChange={(checked) => setLibrary({ ...library, useAI: checked })}
              />
            </div>

            {library.useAI && (
              <div>
                <Label htmlFor="aiPrompt" className="text-base">
                  AI 提示词
                </Label>
                <Textarea
                  id="aiPrompt"
                  value={library.aiPrompt}
                  onChange={(e) => setLibrary({ ...library, aiPrompt: e.target.value })}
                  placeholder="请输入 AI 提示词"
                  className="mt-1.5 min-h-[100px]"
                />
              </div>
            )}

            <div>
              <Label className="text-base">时间限制</Label>
              <DateRangePicker
                className="mt-1.5"
                onChange={(range) => {
                  if (range?.from) {
                    setLibrary({
                      ...library,
                      startDate: range.from.toISOString(),
                      endDate: range.to?.toISOString() || "",
                    })
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-base required">是否启用</Label>
              <Switch
                checked={library.enabled}
                onCheckedChange={(checked) => setLibrary({ ...library, enabled: checked })}
              />
            </div>
          </div>
        </Card>
      </div>

      <WechatFriendSelector
        open={isWechatFriendSelectorOpen}
        onOpenChange={setIsWechatFriendSelectorOpen}
        selectedFriends={library.selectedFriends}
        onSelect={(friends) => setLibrary({ ...library, selectedFriends: friends })}
      />

      <WechatGroupSelector
        open={isWechatGroupSelectorOpen}
        onOpenChange={setIsWechatGroupSelectorOpen}
        selectedGroups={library.selectedGroups}
        onSelect={(groups) => setLibrary({ ...library, selectedGroups: groups })}
      />
    </div>
  )
}

