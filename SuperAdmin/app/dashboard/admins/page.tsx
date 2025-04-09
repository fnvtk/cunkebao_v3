"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Edit, Trash, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample admin data
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

  const filteredAdmins = adminsData.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          />
        </div>
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
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
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
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> 删除管理员
                        </DropdownMenuItem>
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
    </div>
  )
}

