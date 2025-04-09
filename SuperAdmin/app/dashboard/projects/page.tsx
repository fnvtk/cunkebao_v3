"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash } from "lucide-react"

// Sample project data
const projectsData = [
  {
    id: "1",
    name: "电商平台项目",
    phone: "13800138000",
    accountCount: 5,
    deviceCount: 12,
    wechatFriends: 245,
  },
  {
    id: "2",
    name: "社交媒体营销",
    phone: "13900139000",
    accountCount: 8,
    deviceCount: 20,
    wechatFriends: 567,
  },
  {
    id: "3",
    name: "企业官网推广",
    phone: "13700137000",
    accountCount: 3,
    deviceCount: 8,
    wechatFriends: 120,
  },
  {
    id: "4",
    name: "教育平台项目",
    phone: "13600136000",
    accountCount: 10,
    deviceCount: 25,
    wechatFriends: 780,
  },
  {
    id: "5",
    name: "金融服务推广",
    phone: "13500135000",
    accountCount: 6,
    deviceCount: 15,
    wechatFriends: 320,
  },
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = projectsData.filter(
    (project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.phone.includes(searchTerm),
  )

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
            placeholder="搜索项目名称或手机号..."
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
              <TableHead>手机号</TableHead>
              <TableHead className="text-center">关联设备数</TableHead>
              <TableHead className="text-center">子账号数</TableHead>
              <TableHead className="text-center">微信好友总数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.phone}</TableCell>
                  <TableCell className="text-center">{project.deviceCount}</TableCell>
                  <TableCell className="text-center">{project.accountCount}</TableCell>
                  <TableCell className="text-center">{project.wechatFriends}</TableCell>
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
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> 删除项目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  未找到项目
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

