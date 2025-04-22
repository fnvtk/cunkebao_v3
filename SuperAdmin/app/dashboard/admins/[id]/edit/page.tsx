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
import { getAdministratorDetail, updateAdministrator } from "@/lib/admin-api"
import { useToast } from "@/components/ui/use-toast"
import { getTopLevelMenus } from "@/lib/menu-api"
import { getAdminInfo } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MenuPermission {
  id: number;
  title: string;
}

export default function EditAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any | null>(null)
  const [account, setAccount] = useState("")
  const [username, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null)
  const [canEditPermissions, setCanEditPermissions] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // 加载管理员详情和菜单权限
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // 获取当前登录的管理员信息
        const currentAdminInfo = getAdminInfo()
        setCurrentAdmin(currentAdminInfo)
        
        // 获取管理员详情
        const adminResponse = await getAdministratorDetail(params.id)
        
        if (adminResponse.code === 200 && adminResponse.data) {
          setAdminInfo(adminResponse.data)
          setAccount(adminResponse.data.username)
          setUserName(adminResponse.data.username)
          
          // 判断是否可以编辑权限
          // 只有超级管理员(ID为1)可以编辑其他人的权限
          // 编辑自己时不能修改权限
          const isEditingSelf = currentAdminInfo && parseInt(params.id) === currentAdminInfo.id
          const isSuperAdmin = currentAdminInfo && currentAdminInfo.id === 1
          
          setCanEditPermissions(!!(isSuperAdmin && !isEditingSelf))
          
          // 如果可以编辑权限，则获取菜单权限
          if (isSuperAdmin && !isEditingSelf) {
            const menuResponse = await getTopLevelMenus()
            if (menuResponse.code === 200 && menuResponse.data) {
              setMenuPermissions(menuResponse.data)
              
              // 获取管理员已有的权限
              const permissionsResponse = await getAdministratorDetail(params.id)
              if (permissionsResponse.code === 200 && permissionsResponse.data) {
                // 如果有权限数据，则设置选中的权限
                if (permissionsResponse.data.permissions) {
                  // 处理权限ID数组，确保是数字类型
                  const permissionIds = permissionsResponse.data.permissions.map(Number);
                  setSelectedPermissions(permissionIds);
                }
              }
            }
          }
        } else {
          toast({
            title: "获取管理员详情失败",
            description: adminResponse.msg || "请稍后重试",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("获取数据出错:", error)
        toast({
          title: "获取数据失败",
          description: "请检查网络连接后重试",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  // 切换权限选择
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证密码
    if (password && password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致")
      setErrorDialogOpen(true)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 准备提交的数据
      const updateData: any = {
        account,
        username,
      }
      
      // 如果有设置密码，则添加密码字段
      if (password) {
        updateData.password = password
      }
      
      // 如果可以编辑权限，则添加权限字段
      if (canEditPermissions) {
        updateData.permissionIds = selectedPermissions
      }
      
      // 调用更新API
      const response = await updateAdministrator(params.id, updateData)
      
      if (response.code === 200) {
        toast({
          title: "更新成功",
          description: "管理员信息已更新",
          variant: "success",
        })
        
        // 更新成功后返回列表页
        router.push("/dashboard/admins")
      } else {
        setErrorMessage(response.msg || "更新失败，请稍后重试")
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error("更新管理员信息出错:", error)
      setErrorMessage("更新失败，请检查网络连接后重试")
      setErrorDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
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
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>错误提示</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setErrorDialogOpen(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="account">账号</Label>
                <Input
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入账号"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="请输入用户名"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">重置密码</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="留空则不修改密码" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="留空则不修改密码" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {canEditPermissions && (
              <div className="space-y-3">
                <Label>权限设置</Label>
                <div className="grid gap-2">
                  {menuPermissions.map((menu) => (
                    <div key={menu.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`menu-${menu.id}`}
                        checked={selectedPermissions.includes(menu.id)}
                        onCheckedChange={() => togglePermission(menu.id)}
                      />
                      <Label htmlFor={`menu-${menu.id}`} className="cursor-pointer">
                        {menu.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/admins">取消</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存修改"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

