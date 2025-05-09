"use client"

import { useState, useEffect, useRef } from "react"
import type { Device } from "@/components/device-grid"

interface DeviceStatus {
  status: "online" | "offline"
  battery: number
}

async function fetchDeviceStatuses(deviceIds: string[]): Promise<Record<string, DeviceStatus>> {
  // 模拟API调用
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return deviceIds.reduce(
    (acc, id) => {
      acc[id] = {
        status: Math.random() > 0.3 ? "online" : "offline",
        battery: Math.floor(Math.random() * 100),
      }
      return acc
    },
    {} as Record<string, DeviceStatus>,
  )
}

export function useDeviceStatusPolling(devices: Device[]) {
  const [statuses, setStatuses] = useState<Record<string, DeviceStatus>>({})
  // 使用ref跟踪上一次的设备ID列表
  const prevDeviceIdsRef = useRef<string[]>([]);
  // 使用ref跟踪组件挂载状态
  const isMounted = useRef(true);
  // 记录轮询错误次数，用于实现退避策略
  const errorCountRef = useRef(0);

  // 检查设备列表是否有实质性变化
  const hasDevicesChanged = (prevIds: string[], currentIds: string[]): boolean => {
    if (prevIds.length !== currentIds.length) return true;
    
    // 使用Set检查两个数组是否包含相同的元素
    const prevSet = new Set(prevIds);
    return currentIds.some(id => !prevSet.has(id));
  };

  useEffect(() => {
    // 重置组件挂载状态
    isMounted.current = true;
    
    // 获取当前设备ID列表
    const deviceIds = devices.map(d => d.id);
    
    // 检查设备列表是否有变化
    const deviceListChanged = hasDevicesChanged(prevDeviceIdsRef.current, deviceIds);
    
    // 更新设备ID引用
    prevDeviceIdsRef.current = deviceIds;
    
    const pollStatus = async () => {
      try {
        const newStatuses = await fetchDeviceStatuses(devices.map((d) => d.id))
        // 确保组件仍然挂载
        if (isMounted.current) {
          setStatuses((prevStatuses) => ({ ...prevStatuses, ...newStatuses }))
          // 重置错误计数
          errorCountRef.current = 0;
        }
      } catch (error) {
        console.error("Failed to fetch device statuses:", error)
        // 增加错误计数
        errorCountRef.current += 1;
      }
    }

    // 仅当设备列表有变化或初始加载时才立即执行一次
    if (deviceListChanged || Object.keys(statuses).length === 0) {
      pollStatus();
    }
    
    // 使用基于错误次数的指数退避策略
    const getPollingInterval = () => {
      const baseInterval = 30000; // 基础间隔 30 秒
      const maxInterval = 2 * 60 * 1000; // 最大间隔 2 分钟
      
      if (errorCountRef.current === 0) return baseInterval;
      
      // 计算指数退避间隔，但不超过最大间隔
      const backoffInterval = Math.min(
        baseInterval * Math.pow(1.5, Math.min(errorCountRef.current, 5)),
        maxInterval
      );
      
      return backoffInterval;
    };
    
    // 设置轮询间隔
    const intervalId = setInterval(pollStatus, getPollingInterval());

    // 清理函数
    return () => {
      isMounted.current = false;
      clearInterval(intervalId)
    }
  }, [devices])

  return statuses
}

