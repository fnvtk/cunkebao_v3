import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ApiDocumentationTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            计划接口允许您通过API将外部系统的客户数据直接导入到存客宝。支持多种编程语言和第三方平台集成。
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

