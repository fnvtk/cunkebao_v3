"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit } from "lucide-react"

// Sample project data
const projectData = {
  id: "1",
  name: "电商平台项目",
  phone: "13800138000",
  account: "ecommerce_admin",
  description: "这是一个电商平台推广项目，主要针对年轻用户群体，通过微信社交渠道进行产品推广和销售转化。",
  createdAt: "2023-05-15",
  devices: [
    { id: "d1", name: "iPhone 13 Pro", wechatFriends: 120 },
    { id: "d2", name: "Huawei P40", wechatFriends: 85 },
    { id: "d3", name: "Samsung S21", wechatFriends: 40 },
  ],
  subAccounts: [
    { id: "a1", username: "sales_team1", createdAt: "2023-05-16" },
    { id: "a2", username: "sales_team2", createdAt: "2023-05-16" },
    { id: "a3", username: "marketing_team", createdAt: "2023-05-17" },
    { id: "a4", username: "support_team", createdAt: "2023-05-18" },
    { id: "a5", username: "admin_assistant", createdAt: "2023-05-20" },
  ],
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{projectData.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${params.id}/edit`}>
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
                  <dd className="text-sm">{projectData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">手机号</dt>
                  <dd className="text-sm">{projectData.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">账号</dt>
                  <dd className="text-sm">{projectData.account}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">创建时间</dt>
                  <dd className="text-sm">{projectData.createdAt}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">项目介绍</dt>
                  <dd className="text-sm">{projectData.description}</dd>
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
                <div className="text-2xl font-bold">{projectData.devices.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">子账号数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectData.subAccounts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">微信好友总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projectData.devices.reduce((sum, device) => sum + device.wechatFriends, 0)}
                </div>
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
                    <TableHead className="text-right">微信好友数量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectData.devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell className="text-right">{device.wechatFriends}</TableCell>
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
                  {projectData.subAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.username}</TableCell>
                      <TableCell className="text-right">{account.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

