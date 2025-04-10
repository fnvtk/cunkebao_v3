"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { getAdministratorDetail, AdministratorDetail } from "@/lib/admin-api"
import { useToast } from "@/components/ui/use-toast"

// 权限 ID 到前端权限键的映射
const permissionMapping: Record<number, string[]> = {
  1: ["project_management", "customer_pool", "admin_management"], // 超级管理员
  2: ["project_management", "customer_pool"], // 项目管理员
  3: ["customer_pool"], // 客户管理员
  4: [], // 普通管理员
};

export default function EditAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminInfo, setAdminInfo] = useState<AdministratorDetail | null>(null)
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")

  const permissions = [
    { id: "project_management", label: "项目管理" },
    { id: "customer_pool", label: "客户池" },
    { id: "admin_management", label: "管理员权限" },
  ]

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // 加载管理员详情
  useEffect(() => {
    const fetchAdminDetail = async () => {
      setIsLoading(true)
      try {
        const response = await getAdministratorDetail(params.id)
        if (response.code === 200 && response.data) {
          setAdminInfo(response.data)
          // 设置表单数据
          setUsername(response.data.username)
          setName(response.data.name)
          // 根据 authId 设置权限
          setSelectedPermissions(permissionMapping[response.data.authId] || [])
        } else {
          toast({
            title: "获取管理员详情失败",
            description: response.msg || "请稍后重试",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("获取管理员详情出错:", error)
        toast({
          title: "获取管理员详情失败",
          description: "请检查网络连接后重试",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminDetail()
  }, [params.id])

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/dashboard/admins")
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载管理员详情中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/admins">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">编辑管理员</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>管理员信息</CardTitle>
            <CardDescription>编辑管理员账号信息和权限</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">账号</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入姓名"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">重置密码</Label>
                <Input id="password" type="password" placeholder="留空则不修改密码" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input id="confirmPassword" type="password" placeholder="留空则不修改密码" />
              </div>
            </div>

            <div className="space-y-3">
              <Label>权限设置</Label>
              <div className="grid gap-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <Label htmlFor={permission.id} className="cursor-pointer">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/admins">取消</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存修改"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

