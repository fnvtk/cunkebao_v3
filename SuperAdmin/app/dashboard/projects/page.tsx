"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PaginationControls } from "@/components/ui/pagination-controls"

interface Project {
  id: number
  name: string
  status: number
  tenantId: number
  companyId: number
  memo: string | null
  userCount: number
  createTime: string
  deviceCount: number
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://yishi.com/company/list?page=${currentPage}&limit=${pageSize}`)
        const data = await response.json()
        
        if (data.code === 200) {
          setProjects(data.data.list)
          setTotalItems(data.data.total)
          setTotalPages(Math.ceil(data.data.total / pageSize))
        } else {
          toast.error(data.msg || "获取项目列表失败")
          setProjects([])
          setTotalItems(0)
          setTotalPages(0)
        }
      } catch (error) {
        toast.error("获取项目列表失败")
        setProjects([])
        setTotalItems(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [currentPage, pageSize])

  // 处理页面大小变化
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleDeleteClick = (projectId: number) => {
    setDeletingProjectId(projectId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingProjectId) return

    setIsDeleting(true)
    try {
      const response = await fetch("http://yishi.com/company/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deletingProjectId
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        toast.success("删除成功")
        // Fetch projects again after delete
        const fetchProjects = async () => {
          setIsLoading(true)
          try {
            const response = await fetch(`http://yishi.com/company/list?page=${currentPage}&limit=${pageSize}`)
            const data = await response.json()
            if (data.code === 200) {
              setProjects(data.data.list)
              setTotalItems(data.data.total)
              setTotalPages(Math.ceil(data.data.total / pageSize))
              if (currentPage > Math.ceil(data.data.total / pageSize) && Math.ceil(data.data.total / pageSize) > 0) {
                setCurrentPage(Math.ceil(data.data.total / pageSize));
              }
            } else {
              setProjects([]); setTotalItems(0); setTotalPages(0);
            }
          } catch (error) { setProjects([]); setTotalItems(0); setTotalPages(0); } 
          finally { setIsLoading(false); }
        }
        fetchProjects();
      } else {
        toast.error(data.msg || "删除失败")
      }
    } catch (error) {
      toast.error("网络错误，请稍后重试")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDeletingProjectId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">项目列表</h1>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" /> 新建项目
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索项目名称..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>用户数量</TableHead>
              <TableHead>设备数量</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 1 ? "default" : "secondary"}>
                      {project.status === 1 ? "启用" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.userCount}</TableCell>
                  <TableCell>{project.deviceCount}</TableCell>
                  <TableCell>{project.createTime}</TableCell>
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
                          <Link href={`/dashboard/projects/${project.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> 查看详情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> 编辑项目
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteClick(project.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> 删除项目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  未找到项目
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除项目将会删除本项目关联的所有账号，项目删除后不可恢复，是否确认删除？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

