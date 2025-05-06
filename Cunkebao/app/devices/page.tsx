"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, Filter, Search, RefreshCw, QrCode, Smartphone, Loader2, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchDeviceList, deleteDevice } from "@/api/devices"
import { ServerDevice } from "@/types/device"
import { api } from "@/lib/api"
import { ImeiDisplay } from "@/components/ImeiDisplay"

// 设备接口更新为与服务端接口对应的类型
interface Device extends ServerDevice {
  status: "online" | "offline";
}

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDevices, setSelectedDevices] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)
  // 使用ref来追踪当前页码，避免依赖effect循环
  const pageRef = useRef(1)
  // 添加设备相关状态
  const [deviceImei, setDeviceImei] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [qrCodeImage, setQrCodeImage] = useState("")
  const [isLoadingQRCode, setIsLoadingQRCode] = useState(false)
  const [isSubmittingImei, setIsSubmittingImei] = useState(false)
  const [activeTab, setActiveTab] = useState("scan")
  const [pollingStatus, setPollingStatus] = useState<{
    isPolling: boolean;
    message: string;
    messageType: 'default' | 'success' | 'error';
    showAnimation: boolean;
  }>({
    isPolling: false,
    message: '',
    messageType: 'default',
    showAnimation: false
  });

  // 添加轮询定时器引用
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const devicesPerPage = 20 // 每页显示20条记录

  // 获取设备列表
  const loadDevices = useCallback(async (page: number, refresh: boolean = false) => {
    // 检查是否已经在加载中，避免重复请求
    if (isLoading) return;
    
    try {
      setIsLoading(true)
      const response = await fetchDeviceList(page, devicesPerPage, searchQuery)
      
      if (response.code === 200 && response.data) {
        // 转换数据格式，确保status类型正确
        const serverDevices = response.data.list.map(device => ({
          ...device,
          status: device.alive === 1 ? "online" as const : "offline" as const
        }))
        
        // 更新设备列表
        if (refresh) {
          setDevices(serverDevices)
        } else {
          setDevices(prev => [...prev, ...serverDevices])
        }
        
        // 更新统计信息
        const total = response.data.total
        const online = response.data.list.filter(d => d.alive === 1).length
        setStats({
          totalDevices: total,
          onlineDevices: online
        })
        
        // 更新分页信息
        setTotalCount(response.data.total)
        
        // 更新hasMore状态，确保有更多数据且返回的数据数量等于每页数量
        const hasMoreData = serverDevices.length > 0 && 
                            serverDevices.length === devicesPerPage && 
                            (page * devicesPerPage) < response.data.total;
        setHasMore(hasMoreData)
        
        // 更新当前页码的ref值
        pageRef.current = page
      } else {
        toast({
          title: "获取设备列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取设备列表失败", error)
      toast({
        title: "获取设备列表失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  // 移除isLoading依赖，只保留真正需要的依赖
  }, [searchQuery, devicesPerPage])

  // 加载下一页数据的函数，使用ref来追踪页码，避免依赖循环
  const loadNextPage = useCallback(() => {
    // 如果正在加载或者没有更多数据，直接返回
    if (isLoading || !hasMore) return;
    
    // 使用ref来获取下一页码，避免依赖currentPage
    const nextPage = pageRef.current + 1;
    // 设置UI显示的当前页
    setCurrentPage(nextPage);
    // 加载下一页数据
    loadDevices(nextPage, false);
  // 只依赖必要的状态
  }, [hasMore, isLoading, loadDevices]);

  // 初始加载和搜索时刷新列表
  useEffect(() => {
    // 重置页码
    setCurrentPage(1)
    pageRef.current = 1
    // 加载第一页数据
    loadDevices(1, true)
  }, [searchQuery, loadDevices])

  // 无限滚动加载实现
  useEffect(() => {
    // 如果没有更多数据或者正在加载，不创建observer
    if (!hasMore || isLoading) return;
    
    let isMounted = true; // 追踪组件是否已挂载

    // 创建观察器观察加载点
    const observer = new IntersectionObserver(
      entries => {
        // 如果交叉了，且有更多数据，且当前不在加载状态，且组件仍然挂载
        if (entries[0].isIntersecting && hasMore && !isLoading && isMounted) {
          loadNextPage();
        }
      },
      { threshold: 0.5 }
    )

    // 只在客户端时观察节点
    if (typeof window !== 'undefined' && observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    // 清理观察器
    return () => {
      isMounted = false;
      observer.disconnect();
    }
  }, [hasMore, isLoading, loadNextPage])

  // 获取设备二维码
  const fetchDeviceQRCode = async () => {
    try {
      setIsLoadingQRCode(true)
      setQrCodeImage("") // 清空当前二维码
      
      // 获取保存的accountId
      const accountId = localStorage.getItem('s2_accountId')
      if (!accountId) {
        toast({
          title: "获取二维码失败",
          description: "未获取到用户信息，请重新登录",
          variant: "destructive",
        })
        return
      }
      
      // 发起请求获取二维码 - 直接使用fetch避免api工具添加基础URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/api/device/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          accountId: accountId
        })
      })
      
      // 保存原始响应文本以便调试
      const responseText = await response.text();
      
      // 尝试将响应解析为JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        toast({
          title: "获取二维码失败",
          description: "服务器返回的数据格式无效",
          variant: "destructive",
        });
        return;
      }
      
      if (result && result.code === 200) {
        // 尝试多种可能的返回数据结构
        let qrcodeData = null;
        
        if (result.data?.qrCode) {
          qrcodeData = result.data.qrCode;
        } else if (result.data?.qrcode) {
          qrcodeData = result.data.qrcode;
        } else if (result.data?.image) {
          qrcodeData = result.data.image;
        } else if (result.data?.url) {
          // 如果返回的是URL而不是base64
          qrcodeData = result.data.url;
          setQrCodeImage(qrcodeData);
          
          toast({
            title: "二维码已更新",
            description: "请使用手机扫描新的二维码添加设备",
          });
          
          return; // 直接返回，不进行base64处理
        } else if (typeof result.data === 'string') {
          // 如果data直接是字符串
          qrcodeData = result.data;
        } else {
          toast({
            title: "获取二维码失败",
            description: "返回数据格式不正确",
            variant: "destructive",
          });
          return;
        }
        
        // 检查数据是否为空
        if (!qrcodeData) {
          toast({
            title: "获取二维码失败",
            description: "服务器返回的二维码数据为空",
            variant: "destructive",
          });
          return;
        }
        
        // 检查是否已经是完整的data URL
        if (qrcodeData.startsWith('data:image')) {
          setQrCodeImage(qrcodeData);
        } 
        // 检查是否是URL
        else if (qrcodeData.startsWith('http')) {
          setQrCodeImage(qrcodeData);
        }
        // 尝试作为base64处理
        else {
          try {
            // 确保base64字符串没有空格等干扰字符
            const cleanedBase64 = qrcodeData.trim();
            
            // 直接以图片src格式设置
            setQrCodeImage(`data:image/png;base64,${cleanedBase64}`);
            
            // 预加载图片，确认是否有效
            const img = new Image();
            img.onload = () => {
              // 图片加载成功
            };
            img.onerror = (e) => {
              toast({
                title: "二维码加载失败",
                description: "服务器返回的数据无法显示为图片",
                variant: "destructive",
              });
            };
            img.src = `data:image/png;base64,${cleanedBase64}`;
          } catch (e) {
            toast({
              title: "获取二维码失败",
              description: "图片数据处理失败",
              variant: "destructive",
            });
            return;
          }
        }
        
        toast({
          title: "二维码已更新",
          description: "请使用手机扫描新的二维码添加设备",
        });
      } else {
        toast({
          title: "获取二维码失败",
          description: result?.msg || "请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "获取二维码失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQRCode(false);
    }
  }

  // 清理轮询函数
  const cleanupPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setPollingStatus({
      isPolling: false,
      message: '',
      messageType: 'default',
      showAnimation: false
    });
  }, []);

  // 轮询检测设备添加状态
  const startPolling = useCallback(() => {
    let pollCount = 0;
    const maxPolls = 60;
    const pollInterval = 1000; // 1秒
    const initialDelay = 5000; // 5秒后开始轮询

    // 初始提示
    setPollingStatus({
      isPolling: false,
      message: '请扫描二维码添加设备，5秒后将开始检测添加结果',
      messageType: 'default',
      showAnimation: false
    });

    const poll = async () => {
      try {
        const accountId = localStorage.getItem('s2_accountId');
        if (!accountId) {
          setPollingStatus({
            isPolling: false,
            message: '未获取到用户信息，请重新登录',
            messageType: 'error',
            showAnimation: false
          });
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/devices/add-results?accountId=${accountId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (data.code === 200 && data.data) {
          if (data.data.added) {
            setPollingStatus({
              isPolling: false,
              message: '设备添加成功。关闭后可继续',
              messageType: 'success',
              showAnimation: false
            });
            setQrCodeImage('/broken-qr.png'); // 显示损坏的二维码
            cleanupPolling();
            return;
          }
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          setPollingStatus({
            isPolling: false,
            message: '未检测到设备添加，请关闭后重试',
            messageType: 'error',
            showAnimation: false
          });
          cleanupPolling();
          return;
        }

        pollingTimerRef.current = setTimeout(poll, pollInterval);
      } catch (error) {
        setPollingStatus({
          isPolling: false,
          message: '检测过程中发生错误，请重试',
          messageType: 'error',
          showAnimation: false
        });
        cleanupPolling();
      }
    };

    // 5秒后开始轮询
    pollingTimerRef.current = setTimeout(() => {
      setPollingStatus({
        isPolling: true,
        message: '正在检测添加结果',
        messageType: 'default',
        showAnimation: true
      });
      poll();
    }, initialDelay);
  }, [cleanupPolling]);

  // 修改打开添加设备模态框的处理函数
  const handleOpenAddDeviceModal = () => {
    setIsAddDeviceOpen(true);
    setDeviceImei("");
    setDeviceName("");
    setQrCodeImage("");
    setPollingStatus({
      isPolling: false,
      message: '',
      messageType: 'default',
      showAnimation: false
    });
    fetchDeviceQRCode();
    startPolling();
  }

  // 修改关闭模态框的处理函数
  const handleCloseAddDeviceModal = () => {
    cleanupPolling();
    setIsAddDeviceOpen(false);
  }

  // 通过IMEI添加设备
  const handleAddDeviceByImei = async () => {
    if (!deviceImei) {
      toast({
        title: "IMEI不能为空",
        description: "请输入有效的设备IMEI",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmittingImei(true);
      
      // 使用api.post发送请求到/v1/devices
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          imei: deviceImei,
          memo: deviceName 
        })
      });
      
      // 保存原始响应文本以便调试
      const responseText = await response.text();
      
      // 尝试将响应解析为JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        toast({
          title: "添加设备失败",
          description: "服务器返回的数据格式无效",
          variant: "destructive",
        });
        return;
      }
      
      if (result && result.code === 200) {
        toast({
          title: "设备添加成功",
          description: result.data?.msg || "设备已成功添加",
        });
        
        // 清空输入并关闭弹窗
        setDeviceImei("");
        setDeviceName("");
        setIsAddDeviceOpen(false);
        
        // 刷新设备列表
        loadDevices(1, true);
      } else {
        toast({
          title: "添加设备失败",
          description: result?.msg || "请检查设备信息是否正确",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "请求失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingImei(false);
    }
  }

  // 刷新设备列表
  const handleRefresh = () => {
    setCurrentPage(1)
    pageRef.current = 1
    loadDevices(1, true)
    toast({
      title: "刷新成功",
      description: "设备列表已更新",
    })
  }

  // 筛选设备
  const filteredDevices = devices.filter(device => {
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "online" && device.alive === 1) || 
      (statusFilter === "offline" && device.alive === 0)
    return matchesStatus
  })

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "请选择设备",
        description: "您需要选择至少一个设备来执行批量删除操作",
        variant: "destructive",
      })
      return
    }

    // 这里需要实现批量删除逻辑
    // 目前只是单个删除的循环
    let successCount = 0
    for (const deviceId of selectedDevices) {
      try {
        const response = await deleteDevice(deviceId)
        if (response.code === 200) {
          successCount++
        }
      } catch (error) {
        console.error(`删除设备 ${deviceId} 失败`, error)
      }
    }

    // 删除后刷新列表
    if (successCount > 0) {
    toast({
      title: "批量删除成功",
        description: `已删除 ${successCount} 个设备`,
    })
    setSelectedDevices([])
      handleRefresh()
    } else {
      toast({
        title: "批量删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 设备详情页跳转
  const handleDeviceClick = (deviceId: number, event: React.MouseEvent) => {
    // 判断点击事件是否来自ImeiDisplay组件或其后代元素
    // 如果点击事件已经被处理（例如ImeiDisplay中已阻止传播），则不执行跳转
    if (event.defaultPrevented) {
      return;
    }
    
    // 如果点击的元素或其父元素有imei-display类，则不跳转
    let target = event.target as HTMLElement;
    while (target && target !== event.currentTarget) {
      if (target.classList.contains('imei-display-area')) {
        return;
      }
      target = target.parentElement as HTMLElement;
    }
    
    router.push(`/devices/${deviceId}`);
  }

  // 处理添加设备
  const handleAddDevice = async () => {
    try {
      const s2_accountId = localStorage.getItem('s2_accountId');
      if (!s2_accountId) {
        toast({
          title: '未获取到用户信息，请重新登录',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          imei: deviceImei,
          memo: deviceName,
          s2_accountId: s2_accountId,
        }),
      });

      const data = await response.json();
      if (data.code === 200) {
        toast({
          title: '添加设备成功',
          variant: 'default',
        });
        setIsAddDeviceOpen(false);
        // 刷新设备列表
        loadDevices(1, true);
      } else {
        toast({
          title: data.msg || '添加设备失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('添加设备失败:', error);
      toast({
        title: '添加设备失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">设备管理</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenAddDeviceModal}>
            <Plus className="h-4 w-4 mr-2" />
            添加设备
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="text-sm text-gray-500">总设备数</div>
            <div className="text-xl font-bold text-blue-600">{stats.totalDevices}</div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-gray-500">在线设备</div>
            <div className="text-xl font-bold text-green-600">{stats.onlineDevices}</div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索设备IMEI/备注"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="online">在线</SelectItem>
                    <SelectItem value="offline">离线</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDevices(filteredDevices.map((d) => d.id))
                      } else {
                        setSelectedDevices([])
                      }
                    }}
                  />
                  <span className="text-sm text-gray-500">全选</span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={selectedDevices.length === 0}
              >
                删除
              </Button>
            </div>

            <div className="space-y-2">
              {filteredDevices.map((device) => (
                <Card
                  key={device.id}
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={(e) => handleDeviceClick(device.id, e)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedDevices.includes(device.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDevices([...selectedDevices, device.id])
                        } else {
                          setSelectedDevices(selectedDevices.filter((id) => id !== device.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium truncate">{device.memo || "未命名设备"}</div>
                        <Badge variant={device.status === "online" ? "default" : "secondary"} className="ml-2">
                          {device.status === "online" ? "在线" : "离线"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center imei-display-area">
                        <span className="mr-1">IMEI:</span>
                        <ImeiDisplay imei={device.imei} containerWidth={180} />
                      </div>
                      <div className="text-sm text-gray-500">微信号: {device.wechatId || "未绑定"}</div>
                      <div className="flex items-center justify-between mt-1 text-sm">
                        <span className="text-gray-500">好友数: {device.totalFriend}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* 加载更多观察点 */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {isLoading && <div className="text-sm text-gray-500">加载中...</div>}
                {!hasMore && devices.length > 0 && <div className="text-sm text-gray-500">没有更多设备了</div>}
                {!hasMore && devices.length === 0 && <div className="text-sm text-gray-500">暂无设备</div>}
            </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 修改添加设备对话框 */}
      <Dialog open={isAddDeviceOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseAddDeviceModal();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加设备</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="scan" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            {/* <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="scan" className="flex items-center">
                <QrCode className="h-4 w-4 mr-2" />
                扫码添加
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                手动添加
              </TabsTrigger>
            </TabsList> */}
            
            <TabsContent value="scan" className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center p-6 space-y-4 relative">
                {/* 悬浮提示区域，上移50% */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="flex flex-col items-center w-full py-2">
                    {pollingStatus.isPolling || pollingStatus.showAnimation ? (
                      <>
                        <span className="text-sm text-gray-800">正在检测添加结果</span>
                        <div className="flex space-x-1 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-800">5秒后将开始检测添加结果</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-[280px] min-h-[280px] flex flex-col items-center justify-center">
                  {isLoadingQRCode ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">正在获取二维码...</p>
                    </div>
                  ) : qrCodeImage ? (
                    <div id="qrcode-container" className="flex flex-col items-center space-y-3">
                      <div className="relative w-64 h-64 flex items-center justify-center">
                        <img 
                          src={qrCodeImage} 
                          alt="设备添加二维码" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error("二维码图片加载失败");
                            // 隐藏图片
                            e.currentTarget.style.display = 'none';
                            // 显示错误信息
                            const container = document.getElementById('qrcode-container');
                            if (container) {
                              const errorEl = container.querySelector('.qrcode-error');
                              if (errorEl) {
                                errorEl.classList.remove('hidden');
                              }
                            }
                          }}
                        />
                        <div className="qrcode-error hidden absolute inset-0 flex flex-col items-center justify-center text-center text-red-500 bg-white">
                          <AlertTriangle className="h-10 w-10 mb-2" />
                          <p>未能加载二维码，请点击刷新按钮重试</p>
                        </div>
                      </div>
                      <p className="text-sm text-center text-gray-600 mt-2">
                        请使用手机扫描此二维码添加设备
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>点击下方按钮获取二维码</p>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={fetchDeviceQRCode}
                  disabled={isLoadingQRCode}
                  className="w-48 mt-8"
                >
                  {isLoadingQRCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      获取中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      刷新二维码
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">设备名称</label>
                  <Input 
                    placeholder="请输入设备名称" 
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    为设备添加一个便于识别的名称
                  </p>
            </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">设备IMEI</label>
                  <Input 
                    placeholder="请输入设备IMEI" 
                    value={deviceImei}
                    onChange={(e) => setDeviceImei(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    请输入设备IMEI码，可在设备信息中查看
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDeviceOpen(false)}>
                取消
              </Button>
                  <Button 
                    onClick={handleAddDevice} 
                    disabled={!deviceImei.trim() || !deviceName.trim()}
                  >
                    添加
                  </Button>
            </div>
          </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 在二维码显示区域下方添加状态提示 */}
      <div className="mt-4 text-center">
        {pollingStatus.message && (
          <div className="flex flex-col items-center space-y-2">
            <p className={`text-sm ${
              pollingStatus.messageType === 'success' ? 'text-green-600' :
              pollingStatus.messageType === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {pollingStatus.message}
            </p>
            {pollingStatus.showAnimation && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

