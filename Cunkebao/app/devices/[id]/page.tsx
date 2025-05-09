"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Smartphone, Battery, Wifi, MessageCircle, Users, Settings, History, RefreshCw, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchDeviceDetail, fetchDeviceRelatedAccounts, updateDeviceTaskConfig, fetchDeviceHandleLogs } from "@/api/devices"
import { toast } from "sonner"
import { ImeiDisplay } from "@/components/ImeiDisplay"

interface WechatAccount {
  id: string
  avatar: string
  nickname: string
  wechatId: string
  gender: number
  status: number
  statusText: string
  wechatAlive: number
  wechatAliveText: string
  addFriendStatus: number
  totalFriend: number
  lastActive: string
}

interface Device {
  id: string
  imei: string
  name: string
  status: "online" | "offline"
  battery: number
  lastActive: string
  historicalIds: string[]
  wechatAccounts: WechatAccount[]
  features: {
    autoAddFriend: boolean
    autoReply: boolean
    momentsSync: boolean
    aiChat: boolean
  }
  history: {
    time: string
    action: string
    operator: string
  }[]
  totalFriend: number
  thirtyDayMsgCount: number
}

// 这个helper函数用于获取Badge变体类型
function getBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  if (status === "online" || status === "normal") {
    return "default"
  } else if (status === "abnormal") {
    return "destructive"
  } else if (status === "enabled") {
    return "outline"
  } else {
    return "secondary"
  }
}

// 添加操作记录接口
interface HandleLog {
  id: string | number;
  content: string;  // 操作说明
  username: string; // 操作人
  createTime: string; // 操作时间
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [device, setDevice] = useState<Device | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [loading, setLoading] = useState(true)
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [handleLogs, setHandleLogs] = useState<HandleLog[]>([])
  const [logPage, setLogPage] = useState(1)
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  const logsPerPage = 10
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [savingFeatures, setSavingFeatures] = useState({
    autoAddFriend: false,
    autoReply: false,
    momentsSync: false,
    aiChat: false
  })
  const [tabChangeLoading, setTabChangeLoading] = useState(false)

  useEffect(() => {
    if (!params.id) return

    const fetchDevice = async () => {
      try {
        setLoading(true)
        const response = await fetchDeviceDetail(params.id as string)
        
        if (response && response.code === 200 && response.data) {
          const serverData = response.data
          
          // 构建符合前端期望格式的设备对象
          const formattedDevice: Device = {
            id: serverData.id?.toString() || "",
            imei: serverData.imei || "",
            name: serverData.memo || "未命名设备",
            status: serverData.alive === 1 ? "online" : "offline",
            battery: serverData.battery || 0,
            lastActive: serverData.lastUpdateTime || new Date().toISOString(),
            historicalIds: [], // 服务端暂无此数据
            wechatAccounts: [], // 默认空数组
            history: [], // 服务端暂无此数据
            features: {
              autoAddFriend: false,
              autoReply: false,
              momentsSync: false,
              aiChat: false
            },
            totalFriend: serverData.totalFriend || 0,
            thirtyDayMsgCount: serverData.thirtyDayMsgCount || 0
          }
          
          // 解析features
          if (serverData.features) {
            // 如果后端直接返回了features对象，使用它
            formattedDevice.features = {
              autoAddFriend: Boolean(serverData.features.autoAddFriend),
              autoReply: Boolean(serverData.features.autoReply),
              momentsSync: Boolean(serverData.features.momentsSync || serverData.features.contentSync),
              aiChat: Boolean(serverData.features.aiChat)
            }
          } else if (serverData.taskConfig) {
            try {
              // 解析taskConfig字段
              const taskConfig = JSON.parse(serverData.taskConfig || '{}');
              
              if (taskConfig) {
                formattedDevice.features = {
                  autoAddFriend: Boolean(taskConfig.autoAddFriend),
                  autoReply: Boolean(taskConfig.autoReply),
                  momentsSync: Boolean(taskConfig.momentsSync),
                  aiChat: Boolean(taskConfig.aiChat)
                }
              }
            } catch (err) {
              console.error('解析taskConfig失败:', err)
            }
          }
          
          // 如果有微信账号信息，构建微信账号对象
          if (serverData.wechatId) {
            formattedDevice.wechatAccounts = [
              {
                id: serverData.wechatId?.toString() || "1",
                avatar: "/placeholder.svg", // 默认头像
                nickname: serverData.memo || "微信账号",
                wechatId: serverData.imei || "",
                gender: 1, // 默认性别
                status: serverData.alive === 1 ? 1 : 0,
                statusText: serverData.alive === 1 ? "可加友" : "已停用",
                wechatAlive: serverData.alive === 1 ? 1 : 0,
                wechatAliveText: serverData.alive === 1 ? "正常" : "异常",
                addFriendStatus: 1,
                totalFriend: serverData.totalFriend || 0,
                lastActive: serverData.lastUpdateTime || new Date().toISOString()
              }
            ]
          }
          
          setDevice(formattedDevice)
          
          // 如果当前激活标签是"accounts"，则加载关联微信账号
          if (activeTab === "accounts") {
            fetchRelatedAccounts()
          }
        } else {
          // 如果API返回错误，显示错误提示
          toast.error("获取设备信息失败: " + ((response as any)?.msg || "未知错误"))
          setLoading(false)
        }
      } catch (error) {
        console.error("获取设备信息失败:", error)
        toast.error("获取设备信息出错，请稍后重试")
        setLoading(false)
      } finally {
        // 确保loading状态被关闭
        setLoading(false)
      }
    }
    
    fetchDevice()
  }, [params.id, activeTab])
  
  // 获取设备关联微信账号
  const fetchRelatedAccounts = async () => {
    if (!params.id || accountsLoading) return
    
    try {
      setAccountsLoading(true)
      const response = await fetchDeviceRelatedAccounts(params.id as string)
      
      if (response && response.code === 200 && response.data) {
        const accounts = response.data.accounts || []
        
        // 更新设备的微信账号信息
        setDevice(prev => {
          if (!prev) return null
          return {
            ...prev,
            wechatAccounts: accounts
          }
        })
        
        if (accounts.length > 0) {
          toast.success(`成功获取${accounts.length}个关联微信账号`)
        } else {
          toast.info("此设备暂无关联微信账号")
        }
      } else {
        toast.error("获取关联微信账号失败")
      }
    } catch (error) {
      console.error("获取关联微信账号失败:", error)
      toast.error("获取关联微信账号出错")
    } finally {
      setAccountsLoading(false)
    }
  }

  // 获取设备操作记录
  const fetchHandleLogs = async () => {
    if (!params.id || logsLoading) return
    
    try {
      setLogsLoading(true)
      const response = await fetchDeviceHandleLogs(
        params.id as string, 
        logPage, 
        logsPerPage
      )
      
      if (response && response.code === 200 && response.data) {
        const logs = response.data.list || []
        
        // 如果是第一页，替换数据；否则追加数据
        if (logPage === 1) {
          setHandleLogs(logs)
        } else {
          setHandleLogs(prev => [...prev, ...logs])
        }
        
        // 判断是否还有更多数据
        setHasMoreLogs(logs.length === logsPerPage)
        
        if (logs.length > 0) {
          console.log('获取到操作记录:', logs.length)
        } else {
          console.log('设备暂无操作记录')
        }
      } else {
        toast.error("获取操作记录失败")
      }
    } catch (error) {
      console.error("获取操作记录失败:", error)
      toast.error("获取操作记录失败，请稍后重试")
    } finally {
      setLogsLoading(false)
    }
  }

  // 加载更多日志
  const loadMoreLogs = () => {
    if (logsLoading || !hasMoreLogs) return
    
    setLogPage(prevPage => prevPage + 1)
  }
  
  // 监听滚动加载更多
  useEffect(() => {
    if (activeTab !== "history") return
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    }
    
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMoreLogs && !logsLoading) {
        loadMoreLogs()
      }
    }
    
    const observer = new IntersectionObserver(handleIntersect, observerOptions)
    
    if (logsEndRef.current) {
      observer.observe(logsEndRef.current)
    }
    
    return () => {
      if (logsEndRef.current) {
        observer.unobserve(logsEndRef.current)
      }
    }
  }, [activeTab, hasMoreLogs, logsLoading])
  
  // 当切换到日志标签时重置页码
  useEffect(() => {
    if (activeTab === "history") {
      setLogPage(1)
      setHasMoreLogs(true)
    }
  }, [activeTab])
  
  // 观察logPage变化加载数据
  useEffect(() => {
    if (activeTab === "history") {
      fetchHandleLogs()
    }
  }, [logPage, activeTab])

  // 处理标签页切换
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // 显示过渡加载状态
    setTabChangeLoading(true)
    
    // 当切换到"关联账号"标签时，获取最新的关联微信账号信息
    if (value === "accounts") {
      fetchRelatedAccounts()
    }
    
    // 当切换到"操作记录"标签时，获取最新的操作记录
    if (value === "history") {
      fetchHandleLogs()
    }
    
    // 设置短暂的延迟来关闭加载状态，模拟加载过程
    setTimeout(() => {
      setTabChangeLoading(false)
    }, 300)
  }

  // 处理功能开关状态变化
  const handleFeatureChange = async (feature: keyof Device['features'], checked: boolean) => {
    if (!device) return
    
    // 避免已经在处理中的功能被重复触发
    if (savingFeatures[feature]) {
      return
    }
    
    setSavingFeatures(prev => ({ ...prev, [feature]: true }))
    
    try {
      // 准备更新后的功能状态
      const updatedFeatures = { ...device.features, [feature]: checked }
      
      // 创建API请求参数，将布尔值转换为0/1
      const configUpdate = {
        deviceId: device.id,
        [feature]: checked ? 1 : 0
      }
      
      // 立即更新UI状态，提供即时反馈
      setDevice(prev => prev ? {
        ...prev,
        features: updatedFeatures
      } : null)
      
      // 使用更安全的API调用方式，避免自动重定向
      try {
        // 获取token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('未找到授权信息');
        }
        
        // 直接使用fetch，而不是通过API工具
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/devices/task-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(configUpdate)
        });
        
        // 检查是否是401错误（未授权），这是唯一应该处理token的情况
        if (response.status === 401) {
          // 此处我们不立即跳转，而是给出错误提示
          toast.error('认证已过期，请重新登录后再尝试操作');
          console.error('API请求返回401未授权错误');
          // 可以选择是否重定向到登录页面
          // window.location.href = '/login';
          throw new Error('认证已过期');
        }
        
        // 检查响应是否正常
        if (!response.ok) {
          // 所有非401的HTTP错误
          console.warn(`API返回HTTP错误: ${response.status} ${response.statusText}`);
          
          // 尝试解析错误详情
          try {
            const errorResult = await response.json();
            // 显示详细错误信息，但保持本地token
            const errorMsg = errorResult?.msg || `服务器错误 (${response.status})`;
            toast.error(`更新失败: ${errorMsg}`);
            
            // 回滚UI更改
            setDevice(prev => prev ? {
              ...prev,
              features: { ...prev.features, [feature]: !checked }
            } : null);
          } catch (parseError) {
            // 无法解析响应，可能是网络问题
            console.error('无法解析错误响应:', parseError);
            toast.error(`更新失败: 服务器无响应 (${response.status})`);
            
            // 回滚UI更改
            setDevice(prev => prev ? {
              ...prev,
              features: { ...prev.features, [feature]: !checked }
            } : null);
          }
          
          return; // 提前返回，避免继续处理
        }

        // 响应正常，尝试解析
        try {
          const result = await response.json();
          
          // 检查API响应码
          if (result && result.code === 200) {
            toast.success(`${getFeatureName(feature)}${checked ? '已启用' : '已禁用'}`);
          } else if (result && result.code === 401) {
            // API明确返回401，提示用户但不自动登出
            toast.error('认证已过期，请重新登录后再尝试操作');
            console.error('API请求返回401未授权状态码');
            
            // 回滚UI更改
            setDevice(prev => prev ? {
              ...prev,
              features: { ...prev.features, [feature]: !checked }
            } : null);
          } else {
            // 其他API错误
            const errorMsg = result?.msg || '未知错误';
            console.warn(`API返回业务错误: ${result?.code} - ${errorMsg}`);
            toast.error(`更新失败: ${errorMsg}`);
            
            // 回滚UI更改
            setDevice(prev => prev ? {
              ...prev,
              features: { ...prev.features, [feature]: !checked }
            } : null);
          }
        } catch (parseError) {
          // 无法解析响应JSON
          console.error('无法解析API响应:', parseError);
          toast.error('更新失败: 无法解析服务器响应');
          
          // 回滚UI更改
          setDevice(prev => prev ? {
            ...prev,
            features: { ...prev.features, [feature]: !checked }
          } : null);
        }
      } catch (fetchError) {
        console.error('请求错误:', fetchError)
        
        // 回滚UI更改
        setDevice(prev => prev ? {
          ...prev,
          features: { ...prev.features, [feature]: !checked }
        } : null)
        
        // 显示友好的错误提示
        toast.error('网络请求失败，请稍后重试')
      }
    } catch (error) {
      console.error(`更新${getFeatureName(feature)}失败:`, error)
      
      // 异常情况下也回滚UI变更
      setDevice(prev => prev ? {
        ...prev,
        features: { ...prev.features, [feature]: !checked }
      } : null)
      
      toast.error('更新失败，请稍后重试')
    } finally {
      setSavingFeatures(prev => ({ ...prev, [feature]: false }))
    }
  }
  
  // 获取功能中文名称
  const getFeatureName = (feature: string): string => {
    const nameMap: Record<string, string> = {
      autoAddFriend: '自动加好友',
      autoReply: '自动回复',
      momentsSync: '朋友圈同步',
      aiChat: 'AI会话'
    }
    
    return nameMap[feature] || feature
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <div className="text-gray-500">正在加载设备详情...</div>
        </div>
      </div>
    )
  }
  
  if (!device) {
    return (
      <div className="flex h-screen w-full justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-sm max-w-md">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
            <Smartphone className="h-6 w-6 text-red-500" />
          </div>
          <div className="text-xl font-medium text-center">设备不存在或已被删除</div>
          <div className="text-sm text-gray-500 text-center">
            无法加载ID为 "{params.id}" 的设备信息，请检查设备是否存在。
          </div>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回上一页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto bg-white">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-medium">设备详情</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium truncate">{device.name}</h2>
                  <Badge variant={getBadgeVariant(device.status)}>
                    {device.status === "online" ? "在线" : "离线"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1 flex items-center imei-display-area">
                  <span className="mr-1 whitespace-nowrap">IMEI:</span> 
                  <ImeiDisplay imei={device.imei} containerWidth="max-w-[calc(100%-60px)]" />
                </div>
                {device.historicalIds && device.historicalIds.length > 0 && (
                  <div className="text-sm text-gray-500">历史ID: {device.historicalIds.join(", ")}</div>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Battery className={`w-4 h-4 ${device.battery < 20 ? "text-red-500" : "text-green-500"}`} />
                <span className="text-sm">{device.battery}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{device.status === "online" ? "已连接" : "未连接"}</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">最后活跃：{device.lastActive}</div>
          </Card>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">基本信息</TabsTrigger>
              <TabsTrigger value="accounts">关联账号</TabsTrigger>
              <TabsTrigger value="history">操作记录</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="p-4 space-y-4">
                {/* 标签切换时的加载状态 */}
                {tabChangeLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      <div className="text-gray-500 text-sm">加载中...</div>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>自动加好友</Label>
                      <div className="text-sm text-gray-500">自动通过好友验证</div>
                    </div>
                    <div className="flex items-center">
                      {savingFeatures.autoAddFriend && (
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      )}
                      <Switch 
                        checked={Boolean(device.features.autoAddFriend)} 
                        onCheckedChange={(checked) => handleFeatureChange('autoAddFriend', checked)}
                        disabled={savingFeatures.autoAddFriend}
                        className="data-[state=checked]:bg-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>自动回复</Label>
                      <div className="text-sm text-gray-500">自动回复好友消息</div>
                    </div>
                    <div className="flex items-center">
                      {savingFeatures.autoReply && (
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      )}
                      <Switch 
                        checked={Boolean(device.features.autoReply)} 
                        onCheckedChange={(checked) => handleFeatureChange('autoReply', checked)}
                        disabled={savingFeatures.autoReply}
                        className="data-[state=checked]:bg-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>朋友圈同步</Label>
                      <div className="text-sm text-gray-500">自动同步朋友圈内容</div>
                    </div>
                    <div className="flex items-center">
                      {savingFeatures.momentsSync && (
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      )}
                      <Switch 
                        checked={Boolean(device.features.momentsSync)} 
                        onCheckedChange={(checked) => handleFeatureChange('momentsSync', checked)}
                        disabled={savingFeatures.momentsSync}
                        className="data-[state=checked]:bg-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI会话</Label>
                      <div className="text-sm text-gray-500">启用AI智能对话</div>
                    </div>
                    <div className="flex items-center">
                      {savingFeatures.aiChat && (
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      )}
                      <Switch 
                        checked={Boolean(device.features.aiChat)} 
                        onCheckedChange={(checked) => handleFeatureChange('aiChat', checked)}
                        disabled={savingFeatures.aiChat}
                        className="data-[state=checked]:bg-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="accounts">
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium">微信账号列表</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchRelatedAccounts}
                    disabled={accountsLoading}
                  >
                    {accountsLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                        刷新中
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        刷新
                      </>
                    )}
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {/* 标签切换时的加载状态 */}
                  {tabChangeLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                        <div className="text-gray-500 text-sm">加载中...</div>
                      </div>
                    </div>
                  )}
                  {accountsLoading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
                      <span className="text-gray-500">加载微信账号中...</span>
                    </div>
                  )}
                  
                  {!accountsLoading && device.wechatAccounts && device.wechatAccounts.length > 0 ? (
                    <div className="space-y-4">
                      {device.wechatAccounts.map((account) => (
                        <div key={account.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={account.avatar || "/placeholder.svg"}
                            alt={account.nickname}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate">{account.nickname}</div>
                              <Badge variant={account.wechatAlive === 1 ? "default" : "destructive"}>
                                {account.wechatAliveText}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">微信号: {account.wechatId}</div>
                            <div className="text-sm text-gray-500">性别: {account.gender === 1 ? "男" : "女"}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-500">好友数: {account.totalFriend}</span>
                              <Badge variant={account.status === 1 ? "outline" : "secondary"}>
                                {account.statusText}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">最后活跃: {account.lastActive}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !accountsLoading && (
                      <div className="text-center py-8 text-gray-500">
                        <p>此设备暂无关联的微信账号</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={fetchRelatedAccounts}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          刷新
                        </Button>
                      </div>
                    )
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium">操作记录</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setLogPage(1)
                      setHasMoreLogs(true)
                    }}
                    disabled={logsLoading}
                  >
                    {logsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        加载中
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        刷新
                      </>
                    )}
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(min(80vh, 500px))]">
                  {/* 标签切换时的加载状态 */}
                  {tabChangeLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                        <div className="text-gray-500 text-sm">加载中...</div>
                      </div>
                    </div>
                  )}
                  {logsLoading && handleLogs.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
                      <span className="text-gray-500">加载操作记录中...</span>
                    </div>
                  ) : handleLogs.length > 0 ? (
                    <div className="space-y-4">
                      {handleLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-50 rounded-full">
                            <History className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{log.content}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              操作人: {log.username} · {log.createTime}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* 加载更多区域 - 用于懒加载触发点 */}
                      <div 
                        ref={logsEndRef} 
                        className="py-2 flex justify-center items-center"
                      >
                        {logsLoading && hasMoreLogs ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                            <span className="text-sm text-gray-500">加载更多...</span>
                          </div>
                        ) : hasMoreLogs ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={loadMoreLogs}
                            className="text-sm text-blue-500 hover:text-blue-600"
                          >
                            加载更多
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">- 已加载全部记录 -</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>暂无操作记录</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setLogPage(1)
                          setHasMoreLogs(true)
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        刷新
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-sm">好友总数</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {device.totalFriend || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">消息数量</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {device.thirtyDayMsgCount || 0}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

