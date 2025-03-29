"use client"

import { useState } from "react"
import { ChevronLeft, Copy, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

// 获取渠道中文名称
const getChannelName = (channel: string) => {
  const channelMap: Record<string, string> = {
    douyin: "抖音",
    kuaishou: "快手",
    xiaohongshu: "小红书",
    weibo: "微博",
    haibao: "海报",
    phone: "电话",
  }
  return channelMap[channel] || channel
}

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
  status: "active" | "inactive"
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  createdAt: string
  lastTriggered: string | null
  status: "active" | "inactive"
}

export default function ApiManagementPage({ params }: { params: { channel: string } }) {
  const router = useRouter()
  const channel = params.channel
  const channelName = getChannelName(channel)

  // 模拟API密钥数据
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: `${channelName}获客API密钥`,
      key: `api_${channel}_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: "2024-03-20 14:30:00",
      lastUsed: "2024-03-21 09:15:22",
      status: "active",
    },
  ])

  // 模拟Webhook数据
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "1",
      name: `${channelName}获客回调`,
      url: `https://api.example.com/webhooks/${channel}`,
      events: ["customer.created", "customer.updated", "tag.added"],
      createdAt: "2024-03-20 14:35:00",
      lastTriggered: "2024-03-21 09:16:45",
      status: "active",
    },
  ])

  // 对话框状态
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false)
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [newWebhookData, setNewWebhookData] = useState({
    name: "",
    url: "",
    events: ["customer.created", "customer.updated", "tag.added"],
  })

  // 创建新API密钥
  const handleCreateApiKey = () => {
    if (!newApiKeyName.trim()) {
      toast({
        title: "错误",
        description: "请输入API密钥名称",
        variant: "destructive",
      })
      return
    }

    const newKey: ApiKey = {
      id: `${Date.now()}`,
      name: newApiKeyName,
      key: `api_${channel}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toLocaleString(),
      lastUsed: null,
      status: "active",
    }

    setApiKeys([...apiKeys, newKey])
    setNewApiKeyName("")
    setShowNewApiKeyDialog(false)

    toast({
      title: "创建成功",
      description: "新的API密钥已创建",
      variant: "success",
    })
  }

  // 创建新Webhook
  const handleCreateWebhook = () => {
    if (!newWebhookData.name.trim() || !newWebhookData.url.trim()) {
      toast({
        title: "错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    const newWebhook: Webhook = {
      id: `${Date.now()}`,
      name: newWebhookData.name,
      url: newWebhookData.url,
      events: newWebhookData.events,
      createdAt: new Date().toLocaleString(),
      lastTriggered: null,
      status: "active",
    }

    setWebhooks([...webhooks, newWebhook])
    setNewWebhookData({
      name: "",
      url: "",
      events: ["customer.created", "customer.updated", "tag.added"],
    })
    setShowNewWebhookDialog(false)

    toast({
      title: "创建成功",
      description: "新的Webhook已创建",
      variant: "success",
    })
  }

  // 删除API密钥
  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
    toast({
      title: "删除成功",
      description: "API密钥已删除",
      variant: "success",
    })
  }

  // 删除Webhook
  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== id))
    toast({
      title: "删除成功",
      description: "Webhook已删除",
      variant: "success",
    })
  }

  // 切换API密钥状态
  const toggleApiKeyStatus = (id: string) => {
    setApiKeys(
      apiKeys.map((key) => (key.id === id ? { ...key, status: key.status === "active" ? "inactive" : "active" } : key)),
    )
  }

  // 切换Webhook状态
  const toggleWebhookStatus = (id: string) => {
    setWebhooks(
      webhooks.map((webhook) =>
        webhook.id === id ? { ...webhook, status: webhook.status === "active" ? "inactive" : "active" } : webhook,
      ),
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-blue-600 ml-2">{channelName}获客接口管理</h1>
        </div>
      </header>

      <div className="p-4 max-w-7xl mx-auto">
        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="api-keys">API密钥</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">API密钥管理</h2>
              <Button onClick={() => setShowNewApiKeyDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建API密钥
              </Button>
            </div>

            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{apiKey.name}</CardTitle>
                        <CardDescription>创建于 {apiKey.createdAt}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={apiKey.status === "active"}
                            onCheckedChange={() => toggleApiKeyStatus(apiKey.id)}
                          />
                          <span className="text-sm text-gray-500">{apiKey.status === "active" ? "启用" : "禁用"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input value={apiKey.key} readOnly className="font-mono text-sm" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey.key)
                            toast({
                              title: "已复制",
                              description: "API密钥已复制到剪贴板",
                              variant: "success",
                            })
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {apiKey.lastUsed && <p className="text-sm text-gray-500">上次使用: {apiKey.lastUsed}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {apiKeys.length === 0 && (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">暂无API密钥</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Webhook管理</h2>
              <Button onClick={() => setShowNewWebhookDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建Webhook
              </Button>
            </div>

            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{webhook.name}</CardTitle>
                        <CardDescription>创建于 {webhook.createdAt}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={webhook.status === "active"}
                            onCheckedChange={() => toggleWebhookStatus(webhook.id)}
                          />
                          <span className="text-sm text-gray-500">{webhook.status === "active" ? "启用" : "禁用"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input value={webhook.url} readOnly className="font-mono text-sm" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(webhook.url)
                            toast({
                              title: "已复制",
                              description: "Webhook URL已复制到剪贴板",
                              variant: "success",
                            })
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {webhook.events.map((event) => (
                          <span key={event} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {event}
                          </span>
                        ))}
                      </div>
                      {webhook.lastTriggered && (
                        <p className="text-sm text-gray-500">上次触发: {webhook.lastTriggered}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {webhooks.length === 0 && (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">暂无Webhook</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 创建API密钥对话框 */}
      <Dialog open={showNewApiKeyDialog} onOpenChange={setShowNewApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建新API密钥</DialogTitle>
            <DialogDescription>创建一个新的API密钥用于访问{channelName}获客接口</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">API密钥名称</Label>
              <Input
                id="api-key-name"
                placeholder="例如：获客系统集成"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewApiKeyDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateApiKey}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建Webhook对话框 */}
      <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建新Webhook</DialogTitle>
            <DialogDescription>创建一个新的Webhook用于接收{channelName}获客事件通知</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Webhook名称</Label>
              <Input
                id="webhook-name"
                placeholder="例如：CRM系统集成"
                value={newWebhookData.name}
                onChange={(e) => setNewWebhookData({ ...newWebhookData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://example.com/webhook"
                value={newWebhookData.url}
                onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>事件类型</Label>
              <div className="grid grid-cols-1 gap-2">
                {["customer.created", "customer.updated", "tag.added", "tag.removed"].map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <Switch
                      checked={newWebhookData.events.includes(event)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewWebhookData({
                            ...newWebhookData,
                            events: [...newWebhookData.events, event],
                          })
                        } else {
                          setNewWebhookData({
                            ...newWebhookData,
                            events: newWebhookData.events.filter((e) => e !== event),
                          })
                        }
                      }}
                    />
                    <span>{event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWebhookDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateWebhook}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

