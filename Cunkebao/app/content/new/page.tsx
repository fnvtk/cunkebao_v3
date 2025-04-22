"use client"

import { useState } from "react"
import { ChevronLeft, X, Users } from "lucide-react"
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
import { WechatGroupMemberSelector } from "@/components/WechatGroupMemberSelector"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { api } from "@/lib/api"
import { showToast } from "@/lib/toast"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { WechatFriend, WechatGroup, WechatGroupMember } from "@/types/wechat"

interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
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
    selectedGroupMembers: [] as WechatGroupMember[],
    useAI: false,
    aiPrompt: "",
    enabled: true,
  })

  const [isWechatFriendSelectorOpen, setIsWechatFriendSelectorOpen] = useState(false)
  const [isWechatGroupSelectorOpen, setIsWechatGroupSelectorOpen] = useState(false)
  const [isWechatGroupMemberSelectorOpen, setIsWechatGroupMemberSelectorOpen] = useState(false)
  const [currentGroupId, setCurrentGroupId] = useState<string>("")
  const [loading, setLoading] = useState(false)

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

  const handleSelectGroupMembers = (groupId: string) => {
    setCurrentGroupId(groupId)
    setIsWechatGroupMemberSelectorOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      showToast("请输入内容库名称", "error")
      return
    }

    if (formData.sourceType === "friends" && formData.selectedFriends.length === 0) {
      showToast("请选择微信好友", "error")
      return
    }

    if (formData.sourceType === "groups" && formData.selectedGroups.length === 0) {
      showToast("请选择聊天群", "error")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: formData.name,
        sourceType: formData.sourceType === "friends" ? 1 : 2,
        friends: formData.selectedFriends.map(f => f.id),
        groups: formData.selectedGroups.map(g => g.id),
        groupMembers: formData.selectedGroupMembers.map(m => m.id),
        keywordInclude: formData.keywordsInclude.split(",").map(k => k.trim()).filter(Boolean),
        keywordExclude: formData.keywordsExclude.split(",").map(k => k.trim()).filter(Boolean),
        aiPrompt: formData.useAI ? formData.aiPrompt : "",
        timeEnabled: formData.startDate && formData.endDate ? 1 : 0,
        startTime: formData.startDate ? format(new Date(formData.startDate), "yyyy-MM-dd") : "",
        endTime: formData.endDate ? format(new Date(formData.endDate), "yyyy-MM-dd") : "",
        status: formData.enabled ? 1 : 0
      }

      const response = await api.post<ApiResponse>("/v1/content/library/create", payload)
      
      if (response.code === 200) {
        showToast("创建成功", "success")
        router.push("/content")
      } else {
        showToast(response.msg || "创建失败", "error")
      }
    } catch (error: any) {
      console.error("创建内容库失败:", error)
      showToast(error?.message || "请检查网络连接", "error")
    } finally {
      setLoading(false)
    }
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
                onValueChange={(value) => setFormData({ ...formData, sourceType: value as "friends" | "groups" })}
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
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSelectGroupMembers(group.id)}
                              className="mr-1"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeGroup(group.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.selectedGroupMembers.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">已选择群成员 ({formData.selectedGroupMembers.length})</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({...formData, selectedGroupMembers: []})}
                        >
                          清空
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md max-h-[150px] overflow-y-auto">
                        {formData.selectedGroupMembers.map((member) => (
                          <div key={member.id} className="flex items-center bg-white px-2 py-1 rounded border">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.nickname?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.nickname}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={() => setFormData({
                                ...formData,
                                selectedGroupMembers: formData.selectedGroupMembers.filter(m => m.id !== member.id)
                              })}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
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
                  setFormData({
                    ...formData,
                    startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
                    endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
                  })
                }}
                value={formData.startDate && formData.endDate ? {
                  from: new Date(formData.startDate),
                  to: new Date(formData.endDate)
                } : undefined}
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
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1" 
            onClick={() => router.back()}
            disabled={loading}
          >
            取消
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "保存中..." : "保存"}
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

      <WechatGroupMemberSelector
        open={isWechatGroupMemberSelectorOpen}
        onOpenChange={setIsWechatGroupMemberSelectorOpen}
        groupId={currentGroupId}
        selectedMembers={formData.selectedGroupMembers}
        onSelect={(members) => setFormData({ ...formData, selectedGroupMembers: members })}
      />
    </div>
  )
}

