"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { fetchWechatAccountSummary, fetchWechatFriendDetail, WechatFriendDetail } from "@/api/wechat-accounts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  ChevronLeft,
  Smartphone,
  Users,
  Star,
  Clock,
  MessageSquare,
  Shield,
  Info,
  UserPlus,
  Search,
  Filter,
  Tag,
  ChevronRight,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

interface FriendsResponse {
  list: Array<{
    id: number;
    nickname: string;
    avatar: string;
    wechatId: string;
    memo: string;
    tags: string[];
  }>;
  total: number;
}

interface RestrictionRecord {
  id: string
  date: string
  reason: string
  recoveryTime: string
  type: "friend_limit" | "marketing" | "spam" | "other"
}

interface FriendTag {
  id: string
  name: string
  color: string
}

interface Friend {
  id: string;
  avatar: string;
  nickname: string;
  wechatId: string;
  remark: string;
  addTime: string;
  lastInteraction: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  region: string;
  source: string;
  notes: string;
}

interface WechatAccountDetail {
  id: string
  avatar: string
  nickname: string
  wechatId: string
  wechatAccount: string
  deviceId: string
  deviceName: string
  friendCount: number
  todayAdded: number
  status: "normal" | "abnormal"
  lastActive: string
  messageCount: number
  activeRate: number
  accountAge: {
    years: number
    months: number
  }
  totalChats: number
  chatFrequency: number
  restrictionRecords: RestrictionRecord[]
  isVerified: boolean
  firstMomentDate: string
  accountWeight: number
  weightFactors: {
    restrictionFactor: number
    verificationFactor: number
    ageFactor: number
    activityFactor: number
  }
  weeklyStats: {
    date: string
    friends: number
    messages: number
  }[]
  friends: Friend[]
}

interface WechatAccountSummary {
  accountAge: string;
  activityLevel: {
    allTimes: number;
    dayTimes: number;
  };
  accountWeight: {
    scope: number;
    ageWeight: number;
    activityWeigth: number;
    restrictWeight: number;
    realNameWeight: number;
  };
  statistics: {
    todayAdded: number;
    addLimit: number;
  };
  restrictions: {
    id: number;
    level: string;
    reason: string;
    date: string;
  }[];
}

interface PageProps {
  params: {
    id: string
  }
}

export default function WechatAccountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [account, setAccount] = useState<WechatAccountDetail | null>(null)
  const [accountSummary, setAccountSummary] = useState<WechatAccountSummary | null>(null)
  const [showRestrictions, setShowRestrictions] = useState(false)
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)
  const [showFriendDetail, setShowFriendDetail] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [friendDetail, setFriendDetail] = useState<WechatFriendDetail | null>(null)
  const [isLoadingFriendDetail, setIsLoadingFriendDetail] = useState(false)
  const [friendDetailError, setFriendDetailError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  // 好友列表相关状态
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendsPage, setFriendsPage] = useState(1)
  const [friendsTotal, setFriendsTotal] = useState(0)
  const [hasMoreFriends, setHasMoreFriends] = useState(true)
  const [isFetchingFriends, setIsFetchingFriends] = useState(false)
  const [hasFriendLoadError, setHasFriendLoadError] = useState(false)
  const friendsObserver = useRef<IntersectionObserver | null>(null)
  const friendsLoadingRef = useRef<HTMLDivElement | null>(null)
  const friendsContainerRef = useRef<HTMLDivElement | null>(null)

  const [initialData, setInitialData] = useState<{
    avatar: string;
    nickname: string;
    status: "normal" | "abnormal";
    wechatId: string;
    wechatAccount: string;
    deviceName: string;
    deviceId?: string | number;
  } | null>(null)

  useEffect(() => {
    // 从 URL 参数中获取初始数据
    const searchParams = new URLSearchParams(window.location.search);
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setInitialData(decodedData);
        // 使用初始数据设置account
        const mockData = generateMockAccountData(id);
        if (decodedData) {
          mockData.avatar = decodedData.avatar;
          mockData.nickname = decodedData.nickname;
          mockData.status = decodedData.status;
          mockData.wechatId = decodedData.wechatId;
          mockData.deviceName = decodedData.deviceName;
          mockData.wechatAccount = decodedData.wechatAccount;
        }
        setAccount(mockData);
        setFriendsTotal(mockData.friendCount);
        setIsLoading(false);
      } catch (error) {
        console.error('解析初始数据失败:', error);
        setIsLoading(false);
      }
    } else {
      // 如果没有初始数据，使用模拟数据
      const mockData = generateMockAccountData(id);
      setAccount(mockData);
      setFriendsTotal(mockData.friendCount);
      setIsLoading(false);
    }
  }, [id]);

  // 计算好友列表容器高度
  const getFriendsContainerHeight = () => {
    // 最少显示一条记录的高度，最多显示十条记录的高度
    const minHeight = 80; // 单条记录高度
    const maxHeight = 800; // 十条记录高度
    
    if (friends.length === 0) return minHeight;
    return Math.min(Math.max(friends.length * 80, minHeight), maxHeight);
  };

  // 生成模拟账号数据（作为备用，服务器请求失败时使用）
  const generateMockAccountData = (accountId: string): WechatAccountDetail => {
      // 生成随机标签
    const generateRandomTags = (count: number): FriendTag[] => {
        const tagPool = [
          { name: "潜在客户", color: "bg-blue-100 text-blue-800" },
          { name: "高意向", color: "bg-green-100 text-green-800" },
          { name: "已成交", color: "bg-purple-100 text-purple-800" },
          { name: "需跟进", color: "bg-yellow-100 text-yellow-800" },
          { name: "活跃用户", color: "bg-indigo-100 text-indigo-800" },
          { name: "沉默用户", color: "bg-gray-100 text-gray-800" },
          { name: "企业客户", color: "bg-red-100 text-red-800" },
          { name: "个人用户", color: "bg-pink-100 text-pink-800" },
          { name: "新增好友", color: "bg-emerald-100 text-emerald-800" },
          { name: "老客户", color: "bg-amber-100 text-amber-800" },
      ];

        return Array.from({ length: Math.floor(Math.random() * count) + 1 }, () => {
        const randomTag = tagPool[Math.floor(Math.random() * tagPool.length)];
          return {
            id: `tag-${Math.random().toString(36).substring(2, 9)}`,
            name: randomTag.name,
            color: randomTag.color,
        };
      });
    };

      // 生成随机好友
    const friendCount = Math.floor(Math.random() * (300 - 150)) + 150;
    const generateFriends = (count: number): Friend[] => {
        return Array.from({ length: count }, (_, i) => {
        const firstName = ["张", "王", "李", "赵", "陈", "刘", "杨", "黄", "周", "吴"][Math.floor(Math.random() * 10)];
          const secondName = ["小", "大", "明", "华", "强", "伟", "芳", "娜", "秀", "英"][
            Math.floor(Math.random() * 10)
        ];
        const lastName = ["明", "华", "强", "伟", "芳", "娜", "秀", "英", "军", "杰"][Math.floor(Math.random() * 10)];
        const nickname = firstName + secondName + lastName;

          // 生成随机的添加时间（过去1年内）
        const addDate = new Date();
        addDate.setDate(addDate.getDate() - Math.floor(Math.random() * 365));

          // 生成随机的最后互动时间（过去30天内）
        const lastDate = new Date();
        lastDate.setDate(lastDate.getDate() - Math.floor(Math.random() * 30));

          return {
            id: `friend-${i}`,
            avatar: `/placeholder.svg?height=40&width=40&text=${nickname[0]}`,
            nickname,
            wechatId: `wxid_${Math.random().toString(36).substring(2, 9)}`,
            remark:
              Math.random() > 0.5
                ? `${nickname}（${["同事", "客户", "朋友", "同学"][Math.floor(Math.random() * 4)]}）`
                : "",
            addTime: addDate.toISOString().split("T")[0],
            lastInteraction: lastDate.toISOString().split("T")[0],
            tags: generateRandomTags(3),
            region: ["广东", "北京", "上海", "浙江", "江苏", "四川", "湖北", "福建", "山东", "河南"][
              Math.floor(Math.random() * 10)
            ],
            source: ["抖音", "小红书", "朋友介绍", "搜索添加", "群聊", "附近的人", "名片分享"][
              Math.floor(Math.random() * 7)
            ],
            notes:
              Math.random() > 0.7
                ? ["对产品很感兴趣", "需要进一步跟进", "已购买过产品", "价格敏感", "需要更多信息"][
                    Math.floor(Math.random() * 5)
                  ]
                : "",
        };
      });
    };

    const friends = generateFriends(friendCount);

      const mockAccount: WechatAccountDetail = {
        id: accountId,
        avatar:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img_v3_02jn_e7fcc2a4-3560-478d-911a-4ccd69c6392g.jpg-a8zVtwxMuSrPWN9dfWH93EBY0yM3Dh.jpeg",
        nickname: "卡若-25vig",
        wechatId: `wxid_${Math.random().toString(36).substr(2, 8)}`,
        wechatAccount: initialData?.wechatAccount || "wxid_default",
        deviceId: "device-1",
        deviceName: "设备1",
        friendCount: friends.length,
        todayAdded: 12,
        status: "normal",
        lastActive: new Date().toLocaleString(),
        messageCount: 1234,
        activeRate: 87,
        accountAge: {
          years: 2,
          months: 8,
        },
        totalChats: 15234,
        chatFrequency: 42,
        restrictionRecords: [
          {
            id: "1",
            date: "2024-02-25",
            reason: "添加好友过于频繁",
            recoveryTime: "2024-02-26",
            type: "friend_limit",
          },
          {
            id: "2",
            date: "2024-01-15",
            reason: "营销内容违规",
            recoveryTime: "2024-01-16",
            type: "marketing",
          },
        ],
        isVerified: true,
        firstMomentDate: "2021-06-15",
        accountWeight: 85,
        weightFactors: {
          restrictionFactor: 0.8,
          verificationFactor: 1.0,
          ageFactor: 0.9,
          activityFactor: 0.85,
        },
        weeklyStats: Array.from({ length: 7 }, (_, i) => ({
          date: `Day ${i + 1}`,
          friends: Math.floor(Math.random() * 50) + 50,
          messages: Math.floor(Math.random() * 100) + 100,
        })),
        friends: friends,
    };
    return mockAccount;
  };

  // 随机生成标签颜色
  const getRandomTagColor = (): string => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-red-100 text-red-800",
      "bg-pink-100 text-pink-800",
      "bg-emerald-100 text-emerald-800",
      "bg-amber-100 text-amber-800",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 修改fetchFriends函数
  const fetchFriends = useCallback(async (page: number = 1, isNewSearch: boolean = false) => {
    if (!account || isFetchingFriends) return;
    
    try {
      setIsFetchingFriends(true);
      setHasFriendLoadError(false);
      
      const data = await api.get<ApiResponse<FriendsResponse>>(`/v1/wechats/${account?.wechatId}/friends?page=${page}&limit=30`, true);
      
      if (data && data.code === 200) {
        // 更新总数计数
        if (isNewSearch || friendsTotal === 0) {
          setFriendsTotal(data.data.total || 0);
        }
        
        const newFriends = data.data.list.map((friend) => ({
          id: friend.id.toString(),
          avatar: friend.avatar,
          nickname: friend.nickname,
          wechatId: friend.wechatId,
          remark: friend.memo || '',
          addTime: '2024-01-01', // 接口未返回，使用默认值
          lastInteraction: '2024-01-01', // 接口未返回，使用默认值
          tags: (friend.tags || []).map((label: string, index: number) => ({
            id: `tag-${index}`,
            name: label,
            color: getRandomTagColor(),
          })),
          region: '未知地区',
          source: '未记录',
          notes: '',
        }));
        
        // 更新状态
        if (isNewSearch) {
          setFriends(newFriends);
        } else {
          setFriends(prev => [...prev, ...newFriends]);
        }
        
        setFriendsPage(page);
        // 判断是否还有更多数据
        setHasMoreFriends(page * 30 < data.data.total);
        
      } else {
        setHasFriendLoadError(true);
        toast({
          title: "获取好友列表失败",
          description: data?.msg || "请稍后再试",
          variant: "destructive"
        });
      }
    } catch (error) {
      setHasFriendLoadError(true);
      console.error("获取好友列表失败:", error);
      toast({
        title: "获取好友列表失败",
        description: "请检查网络连接或稍后再试",
        variant: "destructive"
      });
    } finally {
      setIsFetchingFriends(false);
    }
  }, [account, id, friendsTotal]);

  // 处理搜索
  const handleSearch = useCallback(() => {
    setFriends([]);
    setFriendsPage(1);
    setHasMoreFriends(true);
    fetchFriends(1, true);
  }, [fetchFriends]);

  // 处理标签切换
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "overview") {
      fetchSummaryData();
    } else if (value === "friends" && friends.length === 0) {
      fetchFriends(1, true);
    }
  };

  // 设置IntersectionObserver用于懒加载
  useEffect(() => {
    friendsObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreFriends && !isFetchingFriends) {
        fetchFriends(friendsPage + 1);
      }
    }, { threshold: 0.5 });
    
    return () => {
      if (friendsObserver.current) {
        friendsObserver.current.disconnect();
      }
    };
  }, [fetchFriends, friendsPage, hasMoreFriends, isFetchingFriends]);

  // 观察加载指示器
  useEffect(() => {
    if (friendsLoadingRef.current && friendsObserver.current) {
      friendsObserver.current.observe(friendsLoadingRef.current);
    }
    
    return () => {
      if (friendsLoadingRef.current && friendsObserver.current) {
        friendsObserver.current.unobserve(friendsLoadingRef.current);
      }
    };
  }, [friendsLoadingRef.current, friendsObserver.current]);

  // 计算账号年龄
  const calculateAccountAge = (registerTime: string) => {
    const register = new Date(registerTime);
    const now = new Date();
    const years = now.getFullYear() - register.getFullYear();
    const months = now.getMonth() - register.getMonth();
    
    if (months < 0) {
      return {
        years: years - 1,
        months: months + 12
      };
    }
    
    return {
      years,
      months
    };
  };

  // 获取账号概览数据
  const fetchSummaryData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchWechatAccountSummary(account?.wechatId || '');
      if (response.code === 200) {
        setAccountSummary(response.data);
        } else {
          toast({
          title: "获取账号概览失败",
          description: response.msg || "请稍后再试",
            variant: "destructive"
        });
        }
      } catch (error) {
      console.error("获取账号概览失败:", error);
        toast({
        title: "获取账号概览失败",
          description: "请检查网络连接或稍后再试",
          variant: "destructive"
      });
      } finally {
      setIsLoading(false);
    }
  }, [account]);

  // 在页面加载和切换到概览标签时获取数据
  useEffect(() => {
    if (activeTab === "overview") {
      fetchSummaryData();
    }
  }, [activeTab, fetchSummaryData]);

  // 在初始加载时获取数据
  useEffect(() => {
    if (activeTab === "overview") {
      fetchSummaryData();
    }
  }, [fetchSummaryData, activeTab]);

  if (!account) {
    return <div>加载中...</div>
  }

  const getWeightColor = (weight: number) => {
    if (weight >= 80) return "text-green-600"
    if (weight >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getWeightDescription = (weight: number) => {
    if (weight >= 80) return "账号状态良好"
    if (weight >= 60) return "账号状态一般"
    return "账号状态较差"
  }

  const calculateMaxDailyAdds = (weight: number) => {
    const baseLimit = 20
    return Math.floor(baseLimit * (weight / 100))
  }

  const getRestrictionTypeColor = (type: string) => {
    switch (type) {
      case "friend_limit":
        return "text-yellow-600"
      case "marketing":
        return "text-red-600"
      case "spam":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const formatAccountAge = (age: { years: number; months: number }) => {
    if (age.years > 0) {
      return `${age.years}年${age.months}个月`;
    }
    return `${age.months}个月`;
  };

  const handleTransferFriends = () => {
    setShowTransferConfirm(true)
  }

  const confirmTransferFriends = () => {
    // 模拟API调用
    toast({
      title: "好友转移成功",
      description: `已成功转移 ${account?.friends.length} 个好友`,
    });
    setShowTransferConfirm(false)
  }

  const handleFriendClick = async (friend: Friend) => {
    setSelectedFriend(friend)
    setShowFriendDetail(true)
    setIsLoadingFriendDetail(true)
    setFriendDetailError(null)
    
    try {
      const response = await fetchWechatFriendDetail(friend.wechatId)
      if (response.code === 200) {
        setFriendDetail(response.data)
      } else {
        setFriendDetailError(response.msg || "获取好友详情失败")
      }
    } catch (error) {
      console.error("获取好友详情失败:", error)
      setFriendDetailError("获取好友详情失败，请稍后再试")
    } finally {
      setIsLoadingFriendDetail(false)
    }
  }

  // 修改获取限制等级颜色的函数
  const getRestrictionLevelColor = (level: string) => {
    const colorMap = {
      "1": "text-gray-600",
      "2": "text-yellow-600",
      "3": "text-red-600"
    };
    return colorMap[level as keyof typeof colorMap] || "text-gray-600";
  }

  // 添加时间格式化函数
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  }

  return (
    <TooltipProvider>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : account ? (
        <div className="flex-1 bg-gradient-to-b from-blue-50 to-white min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
          <div className="flex items-center p-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="ml-2 text-lg font-medium">账号详情</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-4 ring-offset-2 ring-blue-500/20">
                  <AvatarImage src={account.avatar} />
                  <AvatarFallback>{account.nickname[0]}</AvatarFallback>
                </Avatar>
                {account.isVerified && (
                  <Badge className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-blue-500 text-white hover:bg-blue-600">
                    已认证
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold truncate max-w-[200px]">{account.nickname}</h2>
                    <Badge variant={account.status === "normal" ? "default" : "destructive"} className={account.status === "normal" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                    {account.status === "normal" ? "正常" : "异常"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">微信号：{account.wechatAccount}</p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // 优先使用 initialData.deviceId
                      const targetDeviceId = initialData?.deviceId || account.deviceId;
                      if (targetDeviceId) {
                        // 保证 deviceId 是数字或字符串
                        return router.push(`/devices/${targetDeviceId}`);
                      }
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    {account.deviceName || '未命名设备'}
                  </Button>
                  <Button variant="outline" onClick={handleTransferFriends}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    好友转移
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">账号概览</TabsTrigger>
                <TabsTrigger value="friends">
                好友列表{activeTab === "friends" && friendsTotal > 0 ? ` (${friendsTotal})` : ''}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* 账号基础信息 */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">账号年龄</span>
                  </div>
                  {accountSummary && (
                    <>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatAccountAge(calculateAccountAge(accountSummary.accountAge))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        注册时间：{new Date(accountSummary.accountAge).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">活跃程度</span>
                  </div>
                  {accountSummary && (
                    <>
                      <div className="text-2xl font-bold text-blue-600">{accountSummary.activityLevel.dayTimes.toLocaleString()}次/天</div>
                      <div className="text-sm text-gray-500 mt-1">总聊天数：{accountSummary.activityLevel.allTimes.toLocaleString()}</div>
                    </>
                  )}
                </Card>
              </div>

              {/* 账号权重评估 */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">账号权重评估</span>
                  </div>
                  {accountSummary && (
                    <div className={`flex items-center space-x-2 ${getWeightColor(accountSummary.accountWeight.scope)}`}>
                      <span className="text-2xl font-bold">{accountSummary.accountWeight.scope}</span>
                    <span className="text-sm">分</span>
                  </div>
                  )}
                </div>
                {accountSummary && (
                  <>
                    <p className="text-sm text-gray-500 mb-4">{getWeightDescription(accountSummary.accountWeight.scope)}</p>
                <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-16 text-sm">账号年龄</span>
                        <div className="flex-1 mx-4">
                          <Progress value={accountSummary.accountWeight.ageWeight} className="h-2" />
                  </div>
                        <span className="flex-shrink-0 w-12 text-sm text-right">{accountSummary.accountWeight.ageWeight}%</span>
                  </div>
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-16 text-sm">活跃度</span>
                        <div className="flex-1 mx-4">
                          <Progress value={accountSummary.accountWeight.activityWeigth} className="h-2" />
                  </div>
                        <span className="flex-shrink-0 w-12 text-sm text-right">{accountSummary.accountWeight.activityWeigth}%</span>
                  </div>
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-16 text-sm">限制影响</span>
                        <div className="flex-1 mx-4">
                          <Progress value={accountSummary.accountWeight.restrictWeight} className="h-2" />
                </div>
                        <span className="flex-shrink-0 w-12 text-sm text-right">{accountSummary.accountWeight.restrictWeight}%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-16 text-sm">实名认证</span>
                        <div className="flex-1 mx-4">
                          <Progress value={accountSummary.accountWeight.realNameWeight} className="h-2" />
                        </div>
                        <span className="flex-shrink-0 w-12 text-sm text-right">{accountSummary.accountWeight.realNameWeight}%</span>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {/* 添加好友统计 */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">添加好友统计</span>
                  </div>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>根据账号权重计算每日可添加好友数量</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                {accountSummary && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">今日已添加</span>
                      <span className="text-xl font-bold text-blue-600">{accountSummary.statistics.todayAdded}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">添加进度</span>
                      <span>
                          {accountSummary.statistics.todayAdded}/{accountSummary.statistics.addLimit}
                      </span>
                    </div>
                    <Progress
                        value={(accountSummary.statistics.todayAdded / accountSummary.statistics.addLimit) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                      根据当前账号权重({accountSummary.accountWeight.scope}分)，每日最多可添加{" "}
                      <span className="font-medium text-blue-600">{accountSummary.statistics.addLimit}</span>{" "}
                    个好友
                  </div>
                </div>
                )}
              </Card>

              {/* 限制记录 */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    <span className="font-medium">限制记录</span>
                  </div>
                  {accountSummary && (
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setShowRestrictions(true)}>
                      共 {accountSummary.restrictions.length} 次
                  </Badge>
                  )}
                </div>
                {accountSummary && (
                <div className="space-y-2">
                    {accountSummary.restrictions.slice(0, 2).map((record) => (
                    <div key={record.id} className="text-sm">
                      <div className="flex items-center justify-between">
                          <span className={`${getRestrictionLevelColor(record.level)}`}>
                            {record.reason}
                          </span>
                          <span className="text-gray-500">{formatDateTime(record.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="friends" className="space-y-4 mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  {/* 搜索栏 */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索好友昵称/微信号/备注/标签"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-9"
                      />
                    </div>
                      <Button variant="outline" size="icon" onClick={handleSearch}>
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 好友列表 */}
                    <div 
                      ref={friendsContainerRef}
                      className="space-y-2 transition-all duration-300"
                      style={{ 
                        minHeight: '80px',
                        height: `${getFriendsContainerHeight()}px`,
                        overflowY: 'auto'
                      }}
                    >
                      {isFetchingFriends && friends.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                      ) : friends.length === 0 && hasFriendLoadError ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>加载好友失败，请重试</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchFriends(1, true)}>
                            重新加载
                          </Button>
                        </div>
                      ) : friends.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">未找到匹配的好友</div>
                    ) : (
                        <>
                          {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleFriendClick(friend)}
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={friend.avatar} />
                                <AvatarFallback>{friend.nickname?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                  <div className="font-medium truncate max-w-[180px]">
                                {friend.nickname}
                                    {friend.remark && <span className="text-gray-500 ml-1 truncate">({friend.remark})</span>}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-sm text-gray-500 truncate">{friend.wechatId}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                  {friend.tags.slice(0, 3).map((tag: FriendTag) => (
                                <span key={tag.id} className={`text-xs px-2 py-0.5 rounded-full ${tag.color}`}>
                                  {tag.name}
                                </span>
                              ))}
                              {friend.tags.length > 3 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                  +{friend.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                          ))}
                          
                          {/* 懒加载指示器 */}
                          {hasMoreFriends && (
                            <div ref={friendsLoadingRef} className="py-4 flex justify-center">
                              {isFetchingFriends && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
                            </div>
                          )}
                        </>
                    )}
                  </div>

                    {/* 显示加载状态和总数 */}
                    <div className="text-sm text-gray-500 text-center">
                      {friendsTotal > 0 ? (
                        <span>
                          已加载 {Math.min(friends.length, friendsTotal)} / {friendsTotal} 条记录
                        </span>
                      ) : !isFetchingFriends && !hasFriendLoadError && account ? (
                        <span>
                          共 {account.friendCount} 条记录
                        </span>
                      ) : null}
                    </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 限制记录详情弹窗 */}
          <Dialog open={showRestrictions} onOpenChange={setShowRestrictions}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>限制记录详情</DialogTitle>
                <DialogDescription>每次限制恢复时间为24小时</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-4">
                  {(accountSummary?.restrictions && accountSummary.restrictions.length > 0) ? (
                    accountSummary.restrictions.map((record) => (
                      <div key={record.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div className={`text-sm ${getRestrictionLevelColor(record.level)}`}>
                            {record.reason}
                          </div>
                          <Badge variant="outline">{formatDateTime(record.date)}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">恢复时间：{formatDateTime(record.date)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-green-500">
                      暂无风险记录，请继续保持
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* 好友转移确认弹窗 */}
          <Dialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>好友转移确认</DialogTitle>
                <DialogDescription>即将导出该微信号的好友列表，用于创建新的获客计划</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={account.avatar} />
                    <AvatarFallback>{account.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{account.nickname}</div>
                    <div className="text-sm text-gray-500">{account.wechatId}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>• 将导出该账号下的所有好友信息</p>
                  <p>• 好友信息将用于创建新的订单获客计划</p>
                  <p>• 导出过程中请勿关闭页面</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTransferConfirm(false)}>
                  取消
                </Button>
                <Button onClick={confirmTransferFriends}>确认转移</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 好友详情弹窗 */}
          <Dialog open={showFriendDetail} onOpenChange={setShowFriendDetail}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>好友详情</DialogTitle>
              </DialogHeader>
              {isLoadingFriendDetail ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : friendDetailError ? (
                <div className="text-center py-8 text-red-500">
                  <p>{friendDetailError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => handleFriendClick(selectedFriend!)}
                  >
                    重新加载
                  </Button>
                </div>
              ) : friendDetail ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={friendDetail.avatar} />
                      <AvatarFallback>{friendDetail.nickname[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xl font-medium">{friendDetail.nickname}</div>
                      <div className="text-sm text-gray-500">{friendDetail.wechatId}</div>
                      {friendDetail.memo && (
                        <div className="text-sm text-gray-500">备注: {friendDetail.memo}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">添加时间</div>
                      <div className="font-medium">{friendDetail.addDate}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">最近互动</div>
                      <div className="font-medium">{friendDetail.playDate}</div>
                    </div>
                    {friendDetail.region && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500">地区</div>
                        <div className="font-medium">{friendDetail.region || '未知地区'}</div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">来源</div>
                      <div className="font-medium">{friendDetail.source || '未记录'}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      标签
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {friendDetail.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`text-sm px-2 py-1 rounded-full ${getRandomTagColor()}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {friendDetail.tags.length === 0 && <span className="text-sm text-gray-500">暂无标签</span>}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowFriendDetail(false)}>
                      关闭
                    </Button>
                    {/* <Button
                      onClick={() => {
                        setShowFriendDetail(false)
                        router.push(`/traffic-pool?source=${friendDetail.wechatId}`)
                      }}
                    >
                      添加到流量池
                    </Button> */}
                  </div>
                </div>
              ) : selectedFriend && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedFriend.avatar} />
                      <AvatarFallback>{selectedFriend.nickname[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xl font-medium">{selectedFriend.nickname}</div>
                      <div className="text-sm text-gray-500">{selectedFriend.wechatId}</div>
                      {selectedFriend.remark && (
                        <div className="text-sm text-gray-500">备注: {selectedFriend.remark}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">添加时间</div>
                      <div className="font-medium">{selectedFriend.addTime}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">最近互动</div>
                      <div className="font-medium">{selectedFriend.lastInteraction}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">地区</div>
                      <div className="font-medium">{selectedFriend.region}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">来源</div>
                      <div className="font-medium">{selectedFriend.source}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      标签
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedFriend.tags.map((tag: FriendTag) => (
                        <span key={tag.id} className={`text-sm px-2 py-1 rounded-full ${tag.color}`}>
                          {tag.name}
                        </span>
                      ))}
                      {selectedFriend.tags.length === 0 && <span className="text-sm text-gray-500">暂无标签</span>}
                    </div>
                  </div>

                  {selectedFriend.notes && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">备注信息</div>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">{selectedFriend.notes}</div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowFriendDetail(false)}>
                      关闭
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFriendDetail(false)
                        router.push(`/traffic-pool?source=${selectedFriend.wechatId}`)
                      }}
                    >
                      添加到流量池
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      ) : (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">未找到账号信息</p>
        </div>
      )}
    </TooltipProvider>
  )
}


