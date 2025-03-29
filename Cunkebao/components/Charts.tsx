"use client"

import { Line } from "@ant-design/plots"

interface LineChartProps {
  data: { date: string; value: number }[]
  xField: string
  yField: string
}

export function LineChart({ data, xField, yField }: LineChartProps) {
  const config = {
    data,
    xField,
    yField,
    smooth: true,
    color: "#1677ff",
    point: {
      size: 4,
      shape: "circle",
      style: {
        fill: "#1677ff",
        stroke: "#fff",
        lineWidth: 2,
      },
    },
    tooltip: {
      showMarkers: false,
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: "#000",
          fill: "red",
        },
      },
    },
    interactions: [
      {
        type: "marker-active",
      },
    ],
  }

  return <Line {...config} />
}

