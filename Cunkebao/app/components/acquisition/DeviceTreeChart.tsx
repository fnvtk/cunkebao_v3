"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

// 模拟数据
const weeklyData = [
  { day: "周一", 获客数: 12, 添加好友: 8 },
  { day: "周二", 获客数: 18, 添加好友: 12 },
  { day: "周三", 获客数: 15, 添加好友: 10 },
  { day: "周四", 获客数: 25, 添加好友: 18 },
  { day: "周五", 获客数: 30, 添加好友: 22 },
  { day: "周六", 获客数: 18, 添加好友: 14 },
  { day: "周日", 获客数: 15, 添加好友: 11 },
]

const monthlyData = [
  { day: "1月", 获客数: 120, 添加好友: 85 },
  { day: "2月", 获客数: 180, 添加好友: 130 },
  { day: "3月", 获客数: 150, 添加好友: 110 },
  { day: "4月", 获客数: 250, 添加好友: 180 },
  { day: "5月", 获客数: 300, 添加好友: 220 },
  { day: "6月", 获客数: 280, 添加好友: 210 },
]

export function DeviceTreeChart() {
  const [period, setPeriod] = useState("week")

  const data = period === "week" ? weeklyData : monthlyData

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">获客趋势</CardTitle>
          <Tabs defaultValue="week" value={period} onValueChange={setPeriod} className="h-9">
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="week">本周</TabsTrigger>
              <TabsTrigger value="month">本月</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="获客数"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="添加好友"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

