"use client"

import { CheckIcon } from "lucide-react"
import { cn } from "@/app/lib/utils"

interface Step {
  id: string
  name: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && index <= currentStep

          return (
            <li
              key={step.id}
              className={cn("flex items-center space-x-2.5 flex-1", index !== steps.length - 1 ? "relative" : "")}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-medium",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary/20 text-primary border border-primary"
                      : "bg-muted text-muted-foreground",
                  isClickable ? "cursor-pointer" : "",
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : index + 1}
              </span>
              <span>
                <h3
                  className={cn(
                    "font-medium leading-tight",
                    isCompleted || isCurrent ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.name}
                </h3>
                {step.description && (
                  <p className="text-sm text-muted-foreground hidden md:block">{step.description}</p>
                )}
              </span>
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-8 -translate-y-1/2 w-full h-0.5",
                    isCompleted ? "bg-primary" : "bg-muted",
                  )}
                  style={{ width: "calc(100% - 2rem)" }}
                ></div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

