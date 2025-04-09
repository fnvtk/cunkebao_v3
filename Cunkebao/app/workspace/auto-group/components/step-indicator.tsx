"use client"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  steps: { title: string; description: string }[]
  onStepClick?: (step: number) => void
}

export function StepIndicator({ currentStep, steps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative w-full">
            {/* 连接线 */}
            {index > 0 && (
              <div
                className={cn(
                  "absolute h-[2px] w-full top-4 -left-1/2 z-0",
                  index <= currentStep ? "bg-blue-500" : "bg-gray-200",
                )}
              />
            )}

            {/* 步骤圆点 */}
            <button
              onClick={() => index < currentStep && onStepClick?.(index)}
              disabled={index > currentStep}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center z-10 mb-2 transition-all",
                index < currentStep
                  ? "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                  : index === currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
              )}
            >
              {index + 1}
            </button>

            {/* 步骤标题 */}
            <div className="text-sm font-medium">{step.title}</div>
            <div className="text-xs text-gray-500">{step.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

