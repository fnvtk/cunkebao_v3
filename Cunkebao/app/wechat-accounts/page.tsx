"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, Filter, Search, RefreshCw, ArrowRightLeft, AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { fetchWechatAccountList, refreshWechatAccounts, transferWechatFriends } from "@/api/wechat-accounts"
import { WechatAccount } from "@/types/wechat-account"

// 定义接口以匹配新的数据结构
interface WechatAccountResponse {
  id: number
  wechatId: string
  nickname: string
  avatar: string
  times: number
  addedCount: number
  wechatStatus: number
  totalFriend: number
  deviceMemo: string
  activeTime: string
}

export default function WechatAccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<WechatAccount[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<WechatAccount | null>(null)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const accountsPerPage = 10
  const mounted = useRef(false)

  // 获取微信账号列表
  const fetchAccounts = useCallback(async (page: number = 1, keyword: string = "") => {
    try {
      setIsLoading(true);
      const response = await fetchWechatAccountList({
        page,
        limit: accountsPerPage,
        keyword,
        sort: 'id',
        order: 'desc'
      });

      if (response && response.code === 200 && response.data) {
        // 转换数据格式
        const wechatAccounts = response.data.list.map((item: any) => {
          const account: WechatAccount = {
            id: item.id.toString(),
            wechatId: item.wechatId,
            nickname: item.nickname,
            avatar: item.avatar,
            remainingAdds: item.times - item.addedCount,
            todayAdded: item.addedCount,
            status: item.wechatStatus === 1 ? "normal" as const : "abnormal" as const,
            friendCount: item.totalFriend,
            deviceName: item.deviceMemo,
            lastActive: item.activeTime,
            maxDailyAdds: item.times,
            deviceId: item.deviceId.toString(),
          };
          return account;
        });
        setAccounts(wechatAccounts);
        setTotalAccounts(response.data.total);
      } else {
        toast({
          title: "获取微信账号失败",
          description: response?.msg || "请稍后再试",
          variant: "destructive"
        });
        setAccounts([]);
        setTotalAccounts(0);
      }
    } catch (error) {
      console.error("获取微信账号列表失败:", error);
      toast({
        title: "获取微信账号失败",
        description: "请检查网络连接或稍后再试",
        variant: "destructive"
      });
      setAccounts([]);
      setTotalAccounts(0);
    } finally {
      setIsLoading(false);
    }
  }, [accountsPerPage]);

  // 初始化数据加载
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      fetchAccounts(currentPage, searchQuery);
    }
  }, []);

  // 处理页码和搜索变化
  useEffect(() => {
    if (mounted.current) {
      fetchAccounts(currentPage, searchQuery);
    }
  }, [currentPage, searchQuery, fetchAccounts]);

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1);
  };

  // 刷新处理
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const response = await refreshWechatAccounts();
      
      if (response && response.code === 200) {
        toast({
          title: "刷新成功",
          description: "微信账号状态已更新"
        });
        // 重新获取数据
        await fetchAccounts(currentPage, searchQuery);
      } else {
        toast({
          title: "刷新失败",
          description: response?.msg || "请稍后再试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("刷新微信账号状态失败:", error);
      toast({
        title: "刷新失败",
        description: "请检查网络连接或稍后再试",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredAccounts = accounts;
  const totalPages = Math.ceil(totalAccounts / accountsPerPage);

  const handleTransferFriends = (account: WechatAccount) => {
    setSelectedAccount(account)
    setIsTransferDialogOpen(true)
  }

  const handleConfirmTransfer = async () => {
    if (!selectedAccount) return

    try {
      // 实际实现好友转移功能，这里需要另一个账号作为目标
      // 现在只是模拟效果
      toast({
        title: "好友转移计划已创建",
        description: "请在场景获客中查看详情",
      })
      setIsTransferDialogOpen(false)
      router.push("/scenarios")
    } catch (error) {
      console.error("好友转移失败:", error);
      toast({
        title: "好友转移失败",
        description: "请稍后再试",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-lg font-medium">微信号</h1>
        </div>
      </header>

      <div className="p-4">
        <Card className="p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="搜索微信号/昵称"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>暂无微信账号数据</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              刷新
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className="p-4 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => {
                  // 将需要的数据编码为 URL 安全的字符串
                  const accountData = encodeURIComponent(JSON.stringify({
                    avatar: account.avatar,
                    nickname: account.nickname,
                    status: account.status,
                    wechatId: account.wechatId,
                    deviceName: account.deviceName,
                    deviceId: account.deviceId,
                  }));
                  router.push(`/wechat-accounts/${account.id}?data=${accountData}`);
                }}
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-blue-500/20">
                    <AvatarImage src={account.avatar} />
                    <AvatarFallback>{account.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium truncate max-w-[180px]">{account.nickname}</h3>
                        <Badge 
                          variant={account.status === "normal" ? "default" : "destructive"} 
                          className={`min-w-[48px] text-center justify-center ${account.status === "normal" ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                        >
                          {account.status === "normal" ? "正常" : "异常"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTransferFriends(account)
                        }}
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        好友转移
                      </Button>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      <div className="truncate">微信号：{account.wechatId}</div>
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div>好友数量：{account.friendCount}</div>
                        <div className="text-green-600">今日新增：+{account.todayAdded}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <span>今日可添加：</span>
                            <span className="font-medium">{account.remainingAdds}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>每日最多添加 {account.maxDailyAdds} 个好友</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm text-gray-500">
                            {account.todayAdded}/{account.maxDailyAdds}
                          </span>
                        </div>
                        <Progress 
                          value={(account.todayAdded / account.maxDailyAdds) * 100} 
                          className="h-2" 
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 flex-wrap gap-1">
                        <div className="truncate max-w-[150px]">所属设备：{account.deviceName || '未知设备'}</div>
                        <div className="whitespace-nowrap">最后活跃：{account.lastActive}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && accounts.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1)
                      }
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // 显示当前页附近的页码
                  let pageToShow = i + 1;
                  if (currentPage > 3 && totalPages > 5) {
                    pageToShow = Math.min(currentPage - 2 + i, totalPages);
                    if (pageToShow > totalPages - 4) {
                      pageToShow = totalPages - 4 + i;
                    }
                  }
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageToShow}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(pageToShow)
                        }}
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setCurrentPage((prev) => prev + 1)
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>好友转移确认</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              确认要将 {selectedAccount?.nickname} 的 {selectedAccount?.friendCount}{" "}
              个好友转移到场景获客吗？系统将自动创建一个获客计划。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmTransfer}>确认转移</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}