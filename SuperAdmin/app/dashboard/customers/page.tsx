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
import { PaginationControls } from "@/components/ui/pagination-controls"

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
  const [pageSize, setPageSize] = useState(100)

  // 获取客户列表数据
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await getTrafficPoolList(currentPage, pageSize, searchTerm);
        if (response.code === 200 && response.data) {
          setCustomers(response.data.list);
          setTotalItems(response.data.total);
          setTotalPages(Math.ceil(response.data.total / pageSize));
          setError(null);
        } else {
          setError(response.msg || "获取客户列表失败");
          setCustomers([]);
          setTotalItems(0); // Reset totals on error
          setTotalPages(0);
        }
      } catch (err: any) {
        setError(err.message || "获取客户列表失败");
        setCustomers([]);
        setTotalItems(0); // Reset totals on error
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage, pageSize, searchTerm]);

  // 修改后的页面大小处理函数
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Filter customers based on search and filters (兼容示例数据)
  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.wechatId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRegion = selectedRegion ? customer.region === selectedRegion : true
    const matchesGender = selectedGender ? customer.gender === selectedGender : true
    const matchesSource = selectedSource ? customer.source === selectedSource : true
    const matchesProject = selectedProject ? customer.projectName === selectedProject : true

    return matchesSearch && matchesRegion && matchesGender && matchesSource && matchesProject
  })

  // Get unique values for filters
  const regions = [...new Set(customersData.map((c) => c.region))]
  const sources = [...new Set(customersData.map((c) => c.source))]
  const projects = [...new Set(customersData.map((c) => c.projectName))]

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
                <TableHead>客户昵称</TableHead>
                <TableHead>微信ID</TableHead>
                <TableHead>性别</TableHead>
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
                    加载中...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-red-600">
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
                            alt={customer.nickname || "未知"} 
                            onError={(e) => {
                              // 图片加载失败时使用默认图片
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=40&width=40";
                            }}
                          />
                          <AvatarFallback>{(customer.nickname || "未知").slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.nickname || "未知"}</div>
                          <div className="text-xs text-muted-foreground">{customer.gender}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.wechatId}</TableCell>
                    <TableCell>{customer.gender}</TableCell>
                    <TableCell>{customer.region}</TableCell>
                    <TableCell>{customer.source}</TableCell>
                    <TableCell>{customer.projectName}</TableCell>
                    <TableCell>{customer.addTime}</TableCell>
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
        
        {/* 使用新的分页组件 */} 
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage} // 直接传递setCurrentPage
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}

