"use client";

import React, { useState } from "react";
import { ExcelImporter } from "@/components/ExcelImporter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { Separator } from "@/components/ui/separator";

interface ImportedData {
  mobile: number;
  from: string;
  alias: string;
}

export default function ExcelImportDemo() {
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [showData, setShowData] = useState(false);

  const handleImport = (data: ImportedData[]) => {
    setImportedData(data);
    setShowData(true);
    console.log("导入的数据:", data);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Excel导入演示</h1>
        <p className="text-gray-500">
          本演示页面用于测试Excel文件导入功能，将解析Excel中的手机号码、来源和微信号字段。
        </p>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">上传Excel文件</h2>
          <ExcelImporter onImport={handleImport} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">导入结果</h2>
          <Card className="p-4">
            {importedData.length > 0 ? (
              <div className="space-y-4">
                <p>导入 {importedData.length} 条数据</p>
                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[400px]">
                  <pre className="text-sm">
                    {JSON.stringify(importedData, null, 2)}
                  </pre>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant={showData ? "default" : "outline"}
                    onClick={() => setShowData(!showData)}
                  >
                    {showData ? "隐藏数据" : "显示数据"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>尚未导入数据</p>
                <p className="text-sm mt-2">请上传Excel文件并点击确认导入</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">使用说明</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4 space-y-2">
            <h3 className="font-medium">功能说明</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>支持上传.xlsx和.xls格式的Excel文件</li>
              <li>自动识别"手机号码"、"来源"和"微信号"栏位</li>
              <li>可以自动跳过没有手机号的行</li>
              <li>点击"确认导入"按钮将解析后的数据传给回调函数</li>
            </ul>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="font-medium">数据结构</h3>
            <Code className="text-xs">
              {`{
  mobile: "手机号码", // 必填
  from: "来源",      // 选填
  alias: "微信号"    // 选填
}`}
            </Code>
            <p className="text-sm text-gray-500">
              注意：手机号为空的行会被自动忽略，来源和微信号栏位如果没有数据，则为空字符串。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
} 