"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MessageSquare, Phone, UserPlus } from "lucide-react"

// Sample customer data
const customerData = {
  id: "1",
  name: "张三",
  avatar: "/placeholder.svg?height=100&width=100",
  wechatId: "zhangsan123",
  gender: "男",
  region: "北京",
  source: "微信搜索",
  tags: ["潜在客户", "高消费"],
  projectName: "电商平台项目",
  addedDate: "2023-06-10",
  devices: [
    { id: "d1", name: "iPhone 13 Pro", addedDate: "2023-06-10" },
    { id: "d2", name: "MacBook Pro", addedDate: "2023-06-12" },
  ],
  interactions: [
    {
      id: "i1",
      type: "消息",
      content: "您好，我对您的产品很感兴趣，能详细介绍一下吗？",
      date: "2023-06-15 14:30",
    },
    {
      id: "i2",
      type: "电话",
      content: "讨论产品细节和价格",
      duration: "15分钟",
      date: "2023-06-16 10:45",
    },
    {
      id: "i3",
      type: "消息",
      content: "谢谢您的详细介绍，我考虑一下再联系您。",
      date: "2023-06-16 16:20",
    },
    {
      id: "i4",
      type: "消息",
      content: "我决定购买您的产品，请问如何下单？",
      date: "2023-06-18 09:15",
    },
  ],
  transactions: [
    {
      id: "t1",
      product: "高级会员套餐",
      amount: "¥1,299",
      status: "已完成",
      date: "2023-06-20",
    },
  ],
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">客户详情</h1>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> 分发客户
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={customerData.avatar} alt={customerData.name} />
              <AvatarFallback>{customerData.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{customerData.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{customerData.wechatId}</p>

            <div className="flex flex-wrap justify-center gap-1 mb-6">
              {customerData.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="w-full space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">性别</span>
                <span className="text-sm">{customerData.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">地区</span>
                <span className="text-sm">{customerData.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">来源</span>
                <span className="text-sm">{customerData.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">所属项目</span>
                <span className="text-sm">{customerData.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">添加时间</span>
                <span className="text-sm">{customerData.addedDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>详细信息</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="interactions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="interactions">互动记录</TabsTrigger>
                <TabsTrigger value="devices">关联设备</TabsTrigger>
                <TabsTrigger value="transactions">交易记录</TabsTrigger>
              </TabsList>

              <TabsContent value="interactions" className="space-y-4">
                {customerData.interactions.map((interaction) => (
                  <div key={interaction.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {interaction.type === "消息" ? (
                        <MessageSquare className="h-5 w-5" />
                      ) : (
                        <Phone className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{interaction.type}</p>
                        <p className="text-xs text-muted-foreground">{interaction.date}</p>
                      </div>
                      <p className="text-sm">{interaction.content}</p>
                      {interaction.duration && (
                        <p className="text-xs text-muted-foreground">通话时长: {interaction.duration}</p>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="devices">
                {customerData.devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">添加时间: {device.addedDate}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="transactions">
                {customerData.transactions.length > 0 ? (
                  customerData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{transaction.product}</p>
                        <p className="text-xs text-muted-foreground">交易日期: {transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{transaction.amount}</p>
                        <Badge variant={transaction.status === "已完成" ? "success" : "outline"}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">暂无交易记录</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

