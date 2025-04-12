"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, UserPlus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getTrafficPoolList } from "@/lib/traffic-pool-api"
import { Customer } from "@/lib/traffic-pool-api"

// Sample customer data
const customersData = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "zhangsan123",
    gender: "男",
    region: "北京",
    source: "微信搜索",
    tags: ["潜在客户", "高消费"],
    projectName: "电商平台项目",
    addedDate: "2023-06-10",
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "lisi456",
    gender: "男",
    region: "上海",
    source: "朋友推荐",
    tags: ["活跃用户"],
    projectName: "社交媒体营销",
    addedDate: "2023-06-12",
  },
  {
    id: "3",
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "wangwu789",
    gender: "男",
    region: "广州",
    source: "广告点击",
    tags: ["新用户"],
    projectName: "企业官网推广",
    addedDate: "2023-06-15",
  },
  {
    id: "4",
    name: "赵六",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "zhaoliu321",
    gender: "男",
    region: "深圳",
    source: "线下活动",
    tags: ["高消费", "忠诚客户"],
    projectName: "教育平台项目",
    addedDate: "2023-06-18",
  },
  {
    id: "5",
    name: "钱七",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "qianqi654",
    gender: "女",
    region: "成都",
    source: "微信群",
    tags: ["潜在客户"],
    projectName: "金融服务推广",
    addedDate: "2023-06-20",
  },
  {
    id: "6",
    name: "孙八",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "sunba987",
    gender: "女",
    region: "武汉",
    source: "微信搜索",
    tags: ["活跃用户", "高消费"],
    projectName: "电商平台项目",
    addedDate: "2023-06-22",
  },
  {
    id: "7",
    name: "周九",
    avatar: "/placeholder.svg?height=40&width=40",
    wechatId: "zhoujiu135",
    gender: "女",
    region: "杭州",
    source: "朋友推荐",
    tags: ["新用户"],
    projectName: "社交媒体营销",
    addedDate: "2023-06-25",
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [selectedSource, setSelectedSource] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  
  // 客户列表状态
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize, setPageSize] = useState(30)
  const [jumpToPage, setJumpToPage] = useState("")

  // 获取客户列表数据
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await getTrafficPoolList(currentPage, pageSize, searchTerm);
        if (response.code === 200 && response.data) {
          // 处理标签数据，过滤掉无效标签
          const processedCustomers = response.data.list.map(customer => ({
            ...customer,
            tags: customer.tags.filter(tag => tag && tag !== "请选择标签"),
            createTime: customer.addTime // 统一使用createTime字段
          }));
          setCustomers(processedCustomers);
          setTotalItems(response.data.total);
          setTotalPages(Math.ceil(response.data.total / pageSize));
          setError(null);
        } else {
          setError(response.msg || "获取客户列表失败");
          setCustomers([]);
        }
      } catch (err: any) {
        setError(err.message || "获取客户列表失败");
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage, pageSize, searchTerm]);

  // 切换页码
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 处理页码跳转
  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpToPage("");
    }
  };

  // 处理每页显示条数变化
  const handlePageSizeChange = (size: string) => {
    const newSize = parseInt(size);
    setPageSize(newSize);
    setCurrentPage(1); // 重置为第一页
  };

  // Filter customers based on search and filters (兼容示例数据)
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.wechatId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = selectedRegion ? customer.region === selectedRegion : true;
    const matchesGender = selectedGender ? customer.gender === selectedGender : true;
    const matchesSource = selectedSource ? customer.source === selectedSource : true;
    const matchesProject = selectedProject ? customer.projectName === selectedProject : true;

    return matchesSearch && matchesRegion && matchesGender && matchesSource && matchesProject;
  });

  // Get unique values for filters
  const regions = [...new Set(customers.map((c) => c.region))]
  const sources = [...new Set(customers.map((c) => c.source))]
  const projects = [...new Set(customers.map((c) => c.projectName))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">客户池</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> 批量分发
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索客户名称或微信ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> 筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="p-2">
                <p className="mb-2 text-sm font-medium">地区</p>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="所有地区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有地区</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="mb-2 text-sm font-medium">性别</p>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="所有性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有性别</SelectItem>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="mb-2 text-sm font-medium">来源</p>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="所有来源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有来源</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="mb-2 text-sm font-medium">所属项目</p>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="所有项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有项目</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客户信息</TableHead>
                <TableHead>微信ID</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>地区</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>公司名称</TableHead>
                <TableHead>添加时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    正在加载...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage 
                            src={customer.avatar || "/placeholder.svg?height=40&width=40"} 
                            alt={customer.nickname} 
                            onError={(e) => {
                              // 图片加载失败时使用默认图片
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=40&width=40";
                            }}
                          />
                          <AvatarFallback>{customer.nickname.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.nickname}</div>
                          <div className="text-xs text-muted-foreground">{customer.gender}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.wechatId}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">无标签</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.region}</TableCell>
                    <TableCell>{customer.source}</TableCell>
                    <TableCell>{customer.projectName}</TableCell>
                    <TableCell>{customer.createTime || "未记录"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">打开菜单</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> 查看详情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" /> 分发客户
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    未找到客户
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* 分页控件 */}
        {!isLoading && !error && customers.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                共 {totalItems} 条记录，当前第 {currentPage}/{totalPages} 页
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">每页显示:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">条</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* 数字分页按钮 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 显示当前页码前后2页，以及第一页和最后一页
                const shouldShow = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2);
                
                if (!shouldShow) {
                  // 显示省略号
                  if (page === currentPage - 3 || page === currentPage + 3) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* 页码跳转 */}
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-sm">跳转到</span>
                <Input
                  type="number"
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJumpToPage()}
                  className="h-8 w-16 text-center"
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm">页</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleJumpToPage}
                  disabled={!jumpToPage || isNaN(parseInt(jumpToPage)) || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
                >
                  确定
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

