"use client"

import { useState } from "react"
import { ChevronLeft, Copy, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiGuideForScenario } from "@/docs/api-guide"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ApiDocPage({ params }: { params: { channel: string; id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [copiedExample, setCopiedExample] = useState<string | null>(null)

  const apiGuide = getApiGuideForScenario(params.id, params.channel)

  const copyToClipboard = (text: string, exampleId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedExample(exampleId)

    toast({
      title: "已复制代码",
      description: "代码示例已复制到剪贴板",
    })

    setTimeout(() => {
      setCopiedExample(null)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="ml-2 text-lg font-medium">{apiGuide.title}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>接口说明</CardTitle>
            <CardDescription>{apiGuide.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-gray-700">
                  此接口用于将外部系统收集的客户信息直接导入到存客宝的获客计划中。您需要使用API密钥进行身份验证。
                </p>
              </div>

              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>安全提示：</strong>{" "}
                  请妥善保管您的API密钥，不要在客户端代码中暴露它。建议在服务器端使用该接口。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="mb-6">
          {apiGuide.endpoints.map((endpoint, index) => (
            <AccordionItem key={index} value={`endpoint-${index}`}>
              <AccordionTrigger className="px-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <Badge className="mr-2">{endpoint.method}</Badge>
                  <span className="font-mono text-sm">{endpoint.url}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2">
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">{endpoint.description}</p>

                  <div>
                    <h4 className="text-sm font-medium mb-2">请求头</h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      {endpoint.headers.map((header, i) => (
                        <div key={i} className="flex items-start mb-2 last:mb-0">
                          <Badge variant="outline" className="mr-2 mt-0.5 font-mono">
                            {header.required ? "*" : ""}
                            {header.name}
                          </Badge>
                          <div>
                            <p className="text-sm">{header.value}</p>
                            <p className="text-xs text-gray-500">{header.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">请求参数</h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      {endpoint.parameters.map((param, i) => (
                        <div key={i} className="flex items-start mb-3 last:mb-0">
                          <Badge variant="outline" className="mr-2 mt-0.5 font-mono">
                            {param.required ? "*" : ""}
                            {param.name}
                          </Badge>
                          <div>
                            <p className="text-sm">
                              <span className="text-gray-500 font-mono">{param.type}</span>
                            </p>
                            <p className="text-xs text-gray-500">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">响应示例</h4>
                    <pre className="bg-gray-50 rounded-md p-3 text-xs overflow-auto">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card>
          <CardHeader>
            <CardTitle>代码示例</CardTitle>
            <CardDescription>以下是不同编程语言的接口调用示例</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={apiGuide.examples[0].language}>
              <TabsList className="mb-4">
                {apiGuide.examples.map((example) => (
                  <TabsTrigger key={example.language} value={example.language}>
                    {example.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {apiGuide.examples.map((example) => (
                <TabsContent key={example.language} value={example.language}>
                  <div className="relative">
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">{example.code}</pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(example.code, example.language)}
                    >
                      {copiedExample === example.language ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">集成指南</h3>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">集简云平台集成</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>登录集简云平台</li>
                <li>导航至"应用集成" > "外部接口"</li>
                <li>选择"添加新接口"，输入存客宝接口信息</li>
                <li>配置回调参数，将"X-API-KEY"设置为您的API密钥</li>
                <li>
                  设置接口URL为：
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    &lt;code&gt;{apiGuide.endpoints[0].url}&lt;/code&gt;
                  </code>
                </li>
                <li>映射必要字段（name, phone等）</li>
                <li>保存并启用集成</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">问题排查</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">接口认证失败</h4>
                <p className="text-sm text-gray-700">
                  请确保X-API-KEY正确无误，此密钥区分大小写。如需重置密钥，请联系管理员。
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">数据格式错误</h4>
                <p className="text-sm text-gray-700">
                  确保所有必填字段已提供，并且字段类型正确。特别是电话号码格式需符合标准。
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">请求频率限制</h4>
                <p className="text-sm text-gray-700">
                  单个API密钥每分钟最多可发送30个请求，超过限制将被暂时限制。对于大批量数据，请使用批量接口。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

