"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit } from "lucide-react"
import { toast } from "sonner"
import { use } from "react"

interface ProjectProfile {
  id: number
  name: string
  memo: string
  companyId: number
  createTime: string
  account: string
  phone: string | null
  deviceCount: number
  friendCount: number
  userCount: number
}

interface Device {
  id: number
  memo: string
  phone: string
  model: string
  brand: string
  alive: number
  deviceId: number
  wechatId: string
  friendCount: number
  wAlive: number
  imei: string
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<ProjectProfile | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const { id } = use(params)

  useEffect(() => {
    const fetchProjectProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/profile/${id}`)
        const data = await response.json()

        if (data.code === 200) {
          setProfile(data.data)
        } else {
          toast.error(data.msg || "获取项目信息失败")
        }
      } catch (error) {
        toast.error("网络错误，请稍后重试")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectProfile()
  }, [id])

  useEffect(() => {
    const fetchDevices = async () => {
      if (activeTab === "devices") {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/devices?companyId=${id}`)
          const data = await response.json()

          if (data.code === 200) {
            setDevices(data.data)
          } else {
            toast.error(data.msg || "获取设备列表失败")
          }
        } catch (error) {
          toast.error("网络错误，请稍后重试")
        }
      }
    }

    fetchDevices()
  }, [activeTab, id])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">未找到项目信息</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> 编辑项目
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">项目概览</TabsTrigger>
          <TabsTrigger value="devices">关联设备</TabsTrigger>
          <TabsTrigger value="accounts">子账号</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">项目名称</dt>
                  <dd className="text-sm">{profile.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">手机号</dt>
                  <dd className="text-sm">{profile.phone || "未设置"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">账号</dt>
                  <dd className="text-sm">{profile.account}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">创建时间</dt>
                  <dd className="text-sm">{profile.createTime}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">项目介绍</dt>
                  <dd className="text-sm">{profile.memo}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">关联设备数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.deviceCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">子账号数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.userCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">微信好友总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.friendCount}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>关联设备列表</CardTitle>
              <CardDescription>项目关联的所有设备及其微信好友数量</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>设备名称</TableHead>
                    <TableHead>设备型号</TableHead>
                    <TableHead>品牌</TableHead>
                    <TableHead>IMEI</TableHead>
                    <TableHead>设备状态</TableHead>
                    <TableHead>微信状态</TableHead>
                    <TableHead className="text-right">微信好友数量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.memo}</TableCell>
                      <TableCell>{device.model}</TableCell>
                      <TableCell>{device.brand}</TableCell>
                      <TableCell>{device.imei}</TableCell>
                      <TableCell>{device.alive === 1 ? "在线" : "离线"}</TableCell>
                      <TableCell>{device.wAlive === 1 ? "在线" : device.wAlive === 0 ? "离线" : "未登录微信"}</TableCell>
                      <TableCell className="text-right">{device.friendCount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>子账号列表</CardTitle>
              <CardDescription>项目下的所有子账号</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>账号名称</TableHead>
                    <TableHead className="text-right">创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Assuming subAccounts are fetched from the profile */}
                  {/* Replace with actual subAccounts data */}
                  {/* {profile.subAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.username}</TableCell>
                      <TableCell className="text-right">{account.createdAt}</TableCell>
                    </TableRow>
                  ))} */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

