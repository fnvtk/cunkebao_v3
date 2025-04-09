"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Edit, Trash, UserPlus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getAdministrators, Administrator } from "@/lib/admin-api"

// 保留原始示例数据，作为加载失败时的备用数据
const adminsData = [
  {
    id: "1",
    username: "admin_zhang",
    name: "张管理",
    role: "超级管理员",
    permissions: ["项目管理", "客户池", "管理员权限"],
    createdAt: "2023-05-01",
    lastLogin: "2023-06-28 09:15",
  },
  {
    id: "2",
    username: "admin_li",
    name: "李管理",
    role: "项目管理员",
    permissions: ["项目管理", "客户池"],
    createdAt: "2023-05-10",
    lastLogin: "2023-06-27 14:30",
  },
  {
    id: "3",
    username: "admin_wang",
    name: "王管理",
    role: "客户管理员",
    permissions: ["客户池"],
    createdAt: "2023-05-15",
    lastLogin: "2023-06-28 11:45",
  },
  {
    id: "4",
    username: "admin_zhao",
    name: "赵管理",
    role: "项目管理员",
    permissions: ["项目管理"],
    createdAt: "2023-05-20",
    lastLogin: "2023-06-26 16:20",
  },
]

export default function AdminsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [administrators, setAdministrators] = useState<Administrator[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const { toast } = useToast()

  // 加载管理员列表
  useEffect(() => {
    fetchAdministrators()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // 获取管理员列表
  const fetchAdministrators = async (keyword: string = searchTerm) => {
    setIsLoading(true)
    try {
      const response = await getAdministrators(currentPage, pageSize, keyword)
      if (response.code === 200 && response.data) {
        setAdministrators(response.data.list)
        setTotalCount(response.data.total)
      } else {
        toast({
          title: "获取管理员列表失败",
          description: response.msg || "请稍后重试",
          variant: "destructive",
        })
        // 加载失败时显示示例数据
        setAdministrators(adminsData.map(admin => ({
          ...admin,
          id: Number(admin.id)
        })) as Administrator[])
        setTotalCount(adminsData.length)
      }
    } catch (error) {
      console.error("获取管理员列表出错:", error)
      toast({
        title: "获取管理员列表失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
      // 加载失败时显示示例数据
      setAdministrators(adminsData.map(admin => ({
        ...admin,
        id: Number(admin.id)
      })) as Administrator[])
      setTotalCount(adminsData.length)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1) // 重置为第一页
    fetchAdministrators()
  }

  // Enter键搜索
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // 检查是否为超级管理员（id为1）
  const isSuperAdmin = (id: number) => {
    return id === 1
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">管理员列表</h1>
        <Button asChild>
          <Link href="/dashboard/admins/new">
            <UserPlus className="mr-2 h-4 w-4" /> 新增管理员
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索管理员账号、姓名或角色..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <Button onClick={handleSearch}>搜索</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>账号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : administrators.length > 0 ? (
              administrators.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "超级管理员" ? "default" : "outline"}>{admin.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{admin.createdAt}</TableCell>
                  <TableCell>{admin.lastLogin}</TableCell>
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
                          <Link href={`/dashboard/admins/${admin.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> 编辑管理员
                          </Link>
                        </DropdownMenuItem>
                        {!isSuperAdmin(admin.id) && (
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" /> 删除管理员
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  未找到管理员
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalCount > pageSize && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            上一页
          </Button>
          <span className="py-2 px-4 text-sm">
            第 {currentPage} 页 / 共 {Math.ceil(totalCount / pageSize)} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize) || isLoading}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}

