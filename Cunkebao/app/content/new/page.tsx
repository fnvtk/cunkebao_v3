"use client"

import { useState } from "react"
import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { WechatFriendSelector } from "@/components/WechatFriendSelector"
import { WechatGroupSelector } from "@/components/WechatGroupSelector"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface WechatFriend {
  id: string
  nickname: string
  wechatId: string
  avatar: string
  gender: "male" | "female"
  customer: string
}

interface WechatGroup {
  id: string
  name: string
  memberCount: number
  avatar: string
  owner: string
  customer: string
}

export default function NewContentLibraryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    sourceType: "friends" as "friends" | "groups",
    keywordsInclude: "",
    keywordsExclude: "",
    startDate: "",
    endDate: "",
    selectedFriends: [] as WechatFriend[],
    selectedGroups: [] as WechatGroup[],
    useAI: false,
    aiPrompt: "",
    enabled: true,
  })

  const [isWechatFriendSelectorOpen, setIsWechatFriendSelectorOpen] = useState(false)
  const [isWechatGroupSelectorOpen, setIsWechatGroupSelectorOpen] = useState(false)

  const removeFriend = (friendId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedFriends: prev.selectedFriends.filter((friend) => friend.id !== friendId),
    }))
  }

  const removeGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.filter((group) => group.id !== groupId),
    }))
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen pb-16">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-lg font-medium">新建内容库</h1>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入内容库名称"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-base">数据来源配置</Label>
              <Tabs
                value={formData.sourceType}
                onValueChange={(value: "friends" | "groups") => setFormData({ ...formData, sourceType: value })}
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
                  {formData.selectedFriends.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.selectedFriends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <img
                              src={friend.avatar || "/placeholder.svg"}
                              alt={friend.nickname}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>{friend.nickname}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFriend(friend.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="groups" className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => setIsWechatGroupSelectorOpen(true)}>
                    选择聊天群
                  </Button>
                  {formData.selectedGroups.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.selectedGroups.map((group) => (
                        <div key={group.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <img
                              src={group.avatar || "/placeholder.svg"}
                              alt={group.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>{group.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeGroup(group.id)}>
                            <X className="h-4 w-4" />
                          </Button>
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
                        value={formData.keywordsInclude}
                        onChange={(e) => setFormData({ ...formData, keywordsInclude: e.target.value })}
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
                        value={formData.keywordsExclude}
                        onChange={(e) => setFormData({ ...formData, keywordsExclude: e.target.value })}
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
                checked={formData.useAI}
                onCheckedChange={(checked) => setFormData({ ...formData, useAI: checked })}
              />
            </div>

            {formData.useAI && (
              <div>
                <Label htmlFor="aiPrompt" className="text-base">
                  AI 提示词
                </Label>
                <Textarea
                  id="aiPrompt"
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
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
                    setFormData({
                      ...formData,
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
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" className="flex-1">
            保存
          </Button>
        </div>
      </div>

      <WechatFriendSelector
        open={isWechatFriendSelectorOpen}
        onOpenChange={setIsWechatFriendSelectorOpen}
        selectedFriends={formData.selectedFriends}
        onSelect={(friends) => setFormData({ ...formData, selectedFriends: friends })}
      />

      <WechatGroupSelector
        open={isWechatGroupSelectorOpen}
        onOpenChange={setIsWechatGroupSelectorOpen}
        selectedGroups={formData.selectedGroups}
        onSelect={(groups) => setFormData({ ...formData, selectedGroups: groups })}
      />
    </div>
  )
}

