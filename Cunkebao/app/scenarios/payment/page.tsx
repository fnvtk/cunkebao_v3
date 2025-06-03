"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Settings, QrCode, BarChart4, CreditCard, Users, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function PaymentCodePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("codes")

  // 模拟数据
  const paymentCodes = [
    { id: 1, name: "社群会员付款码", amount: "19.9", status: "active", totalPayments: 156, totalAmount: 3104.4 },
    { id: 2, name: "课程付款码", amount: "99", status: "active", totalPayments: 78, totalAmount: 7722 },
    { id: 3, name: "咨询服务付款码", amount: "199", status: "active", totalPayments: 45, totalAmount: 8955 },
    { id: 4, name: "产品购买付款码", amount: "299", status: "active", totalPayments: 32, totalAmount: 9568 },
  ]

  const statistics = {
    today: { payments: 24, amount: 2568, customers: 22 },
    week: { payments: 156, amount: 15420, customers: 142 },
    month: { payments: 311, amount: 29845, customers: 289 },
  }

  const distributions = [
    { id: 1, name: "分销返利规则1", type: "percentage", value: "10%", totalDistributed: 1245.6 },
    { id: 2, name: "分销返利规则2", type: "fixed", value: "5元", totalDistributed: 890 },
  ]

  const redPackets = [
    { id: 1, name: "新客红包", amount: "5", totalSent: 156, totalAmount: 780 },
    { id: 2, name: "推广红包", amount: "10", totalSent: 89, totalAmount: 890 },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="ml-2 text-lg font-medium">付款码获客</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/scenarios/payment/settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 统计卡片 */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">数据概览</h2>
              <Badge variant="outline" className="text-blue-500 bg-blue-50">
                今日
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">支付笔数</p>
                <p className="text-xl font-semibold">{statistics.today.payments}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">支付金额</p>
                <p className="text-xl font-semibold">¥{statistics.today.amount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">新增客户</p>
                <p className="text-xl font-semibold">{statistics.today.customers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <div className="flex-1 px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="codes" className="text-xs">
              <QrCode className="h-4 w-4 mr-1" />
              付款码
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <BarChart4 className="h-4 w-4 mr-1" />
              数据统计
            </TabsTrigger>
            <TabsTrigger value="distribution" className="text-xs">
              <Users className="h-4 w-4 mr-1" />
              分销返利
            </TabsTrigger>
            <TabsTrigger value="redpacket" className="text-xs">
              <Gift className="h-4 w-4 mr-1" />
              红包池
            </TabsTrigger>
          </TabsList>

          {/* 付款码列表 */}
          <TabsContent value="codes" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push("/scenarios/payment/new")} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                新建付款码
              </Button>
            </div>

            {paymentCodes.map((code) => (
              <Card key={code.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4 border-b">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{code.name}</h3>
                      <p className="text-sm text-gray-500">金额: ¥{code.amount}</p>
                    </div>
                    <Badge variant={code.status === "active" ? "success" : "secondary"}>
                      {code.status === "active" ? "启用中" : "已停用"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-3 text-center">
                      <p className="text-sm text-gray-500">支付笔数</p>
                      <p className="font-semibold">{code.totalPayments}</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-sm text-gray-500">支付金额</p>
                      <p className="font-semibold">¥{code.totalAmount}</p>
                    </div>
                  </div>
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      className="w-full text-blue-500"
                      onClick={() => router.push(`/scenarios/payment/${code.id}`)}
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 数据统计 */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">支付数据统计</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">今日支付笔数</span>
                    <span className="font-medium">{statistics.today.payments}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">今日支付金额</span>
                    <span className="font-medium">¥{statistics.today.amount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">今日新增客户</span>
                    <span className="font-medium">{statistics.today.customers}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">本周支付笔数</span>
                    <span className="font-medium">{statistics.week.payments}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">本周支付金额</span>
                    <span className="font-medium">¥{statistics.week.amount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">本月支付金额</span>
                    <span className="font-medium">¥{statistics.month.amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button variant="outline" onClick={() => router.push("/scenarios/payment/stats")}>
                查看详细统计
              </Button>
            </div>
          </TabsContent>

          {/* 分销返利 */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push("/scenarios/payment/distribution/new")} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                新建分销规则
              </Button>
            </div>

            {distributions.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{rule.name}</h3>
                    <Badge variant="outline">{rule.type === "percentage" ? "比例" : "固定金额"}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">返利值</span>
                    <span className="font-medium">{rule.value}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">已发放金额</span>
                    <span className="font-medium">¥{rule.totalDistributed}</span>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      className="w-full text-blue-500"
                      onClick={() => router.push(`/scenarios/payment/distribution/${rule.id}`)}
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 红包池 */}
          <TabsContent value="redpacket" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => router.push("/scenarios/payment/redpacket/new")} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                新建红包
              </Button>
            </div>

            {redPackets.map((packet) => (
              <Card key={packet.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{packet.name}</h3>
                    <Badge variant="outline" className="text-red-500 bg-red-50">
                      ¥{packet.amount}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">已发放数量</span>
                    <span className="font-medium">{packet.totalSent}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">已发放金额</span>
                    <span className="font-medium">¥{packet.totalAmount}</span>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      className="w-full text-blue-500"
                      onClick={() => router.push(`/scenarios/payment/redpacket/${packet.id}`)}
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
