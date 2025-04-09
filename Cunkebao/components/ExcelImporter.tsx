"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export interface ContactData {
  mobile: number;
  from?: string;
  alias?: string;
}

interface ExcelImporterProps {
  onImport: (data: ContactData[]) => void;
  onReset?: () => void;
}

export default function ExcelImporter({ onImport, onReset }: ExcelImporterProps) {
  const [parsedData, setParsedData] = useState<ContactData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isImportSuccessful, setIsImportSuccessful] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState<{
    mobile?: string;
    from?: string;
    alias?: string;
  }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // 重置状态
    setError(null);
    setIsImportSuccessful(false);
    setParsedData([]);
    setDetectedColumns({});
    setIsProcessing(true);
    
    const file = files[0];
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        
        if (!data) {
          setError("文件内容为空，请检查文件是否有效");
          setIsProcessing(false);
          return;
        }
        
        // 尝试将读取的二进制数据解析为Excel工作簿
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'binary' });
        } catch (parseErr) {
          console.error("解析Excel内容失败:", parseErr);
          setError("无法解析文件内容，请确保上传的是有效的Excel文件(.xlsx或.xls格式)");
          setIsProcessing(false);
          return;
        }
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setError("Excel文件中没有找到工作表");
          setIsProcessing(false);
          return;
        }
        
        // 取第一个工作表
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          setError(`无法读取工作表 "${sheetName}"，请检查文件是否损坏`);
          setIsProcessing(false);
          return;
        }
        
        // 将工作表转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonData || jsonData.length === 0) {
          setError("Excel 文件中没有数据");
          setIsProcessing(false);
          return;
        }
        
        // 查找栏位对应的列
        let mobileColumn: string | null = null;
        let fromColumn: string | null = null;
        let aliasColumn: string | null = null;
        
        // 遍历第一行查找栏位
        const firstRow = jsonData[0] as Record<string, any>;
        if (!firstRow) {
          setError("Excel 文件的第一行为空，无法识别栏位");
          setIsProcessing(false);
          return;
        }
        
        for (const key in firstRow) {
          if (!firstRow[key]) continue; // 跳过空值
          
          const value = String(firstRow[key]).toLowerCase();
          
          // 扩展匹配列表，提高识别成功率
          if (value.includes("手机") || value.includes("电话") || value.includes("mobile") || 
              value.includes("phone") || value.includes("tel") || value.includes("cell")) {
            mobileColumn = key;
          } else if (value.includes("来源") || value.includes("source") || value.includes("from") || 
                    value.includes("channel") || value.includes("渠道")) {
            fromColumn = key;
          } else if (value.includes("微信") || value.includes("alias") || value.includes("wechat") || 
                    value.includes("wx") || value.includes("id") || value.includes("账号")) {
            aliasColumn = key;
          }
        }
        
        // 保存检测到的列名
        if (mobileColumn && firstRow[mobileColumn]) {
          setDetectedColumns(prev => ({ ...prev, mobile: String(firstRow[mobileColumn]) }));
        }
        if (fromColumn && firstRow[fromColumn]) {
          setDetectedColumns(prev => ({ ...prev, from: String(firstRow[fromColumn]) }));
        }
        if (aliasColumn && firstRow[aliasColumn]) {
          setDetectedColumns(prev => ({ ...prev, alias: String(firstRow[aliasColumn]) }));
        }
        
        if (!mobileColumn) {
          setError("未找到手机号码栏位，请确保Excel中包含手机、电话、mobile或phone等栏位名称");
          setIsProcessing(false);
          return;
        }
        
        // 取第二行开始的数据（跳过标题行）
        const importedData: ContactData[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as Record<string, any>;
          
          // 确保手机号存在且不为空
          if (!row || !row[mobileColumn]) continue;
          
          // 处理手机号，去掉非数字字符
          let mobileValue = row[mobileColumn];
          let mobileNumber: number;
          
          if (typeof mobileValue === 'number') {
            mobileNumber = mobileValue;
          } else {
            // 如果是字符串，去掉非数字字符
            const mobileStr = String(mobileValue).trim().replace(/\D/g, '');
            if (!mobileStr) continue; // 如果手机号为空，跳过该行
            mobileNumber = Number(mobileStr);
            if (isNaN(mobileNumber)) continue; // 如果转换后不是数字，跳过该行
          }
          
          // 构建数据对象
          const contact: ContactData = {
            mobile: mobileNumber
          };
          
          // 添加来源字段（如果存在）
          if (fromColumn && row[fromColumn]) {
            contact.from = String(row[fromColumn]).trim();
          }
          
          // 添加微信号字段（如果存在）
          if (aliasColumn && row[aliasColumn]) {
            contact.alias = String(row[aliasColumn]).trim();
          }
          
          importedData.push(contact);
        }
        
        if (importedData.length === 0) {
          setError("未找到有效数据，请确保Excel中至少有一行有效的手机号码");
          setIsProcessing(false);
          return;
        }
        
        setParsedData(importedData);
        setIsProcessing(false);
      } catch (err) {
        console.error("解析Excel文件出错:", err);
        setError("解析Excel文件时出错，请确保文件格式正确");
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      setError("读取文件时出错，请重试");
      setIsProcessing(false);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
      setIsImportSuccessful(true);
    }
  };

  const handleReset = () => {
    setParsedData([]);
    setError(null);
    setFileName("");
    setIsImportSuccessful(false);
    setDetectedColumns({});
    if (onReset) {
      onReset();
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">选择Excel文件</label>
          <Input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full"
            disabled={isProcessing}
          />
          {fileName && (
            <p className="text-sm text-gray-500">
              当前文件: {fileName}
            </p>
          )}
          <div className="text-xs text-gray-500 mt-1">
            请确保Excel文件包含以下列: 手机号码(必需)、来源(可选)、微信号(可选)
          </div>
        </div>
        
        {isProcessing && (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">正在处理Excel文件...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isImportSuccessful && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              已成功导入 {parsedData.length} 条联系人数据！
            </AlertDescription>
          </Alert>
        )}
        
        {parsedData.length > 0 && !isImportSuccessful && (
          <div className="space-y-4">
            <p className="text-sm">
              已解析 {parsedData.length} 条有效数据，点击下方按钮确认导入。
            </p>
            
            {Object.keys(detectedColumns).length > 0 && (
              <div className="text-xs p-2 bg-blue-50 rounded border border-blue-100">
                <p className="font-medium text-blue-700 mb-1">检测到的列名:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {detectedColumns.mobile && <li>手机号: {detectedColumns.mobile}</li>}
                  {detectedColumns.from && <li>来源: {detectedColumns.from}</li>}
                  {detectedColumns.alias && <li>微信号: {detectedColumns.alias}</li>}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm mb-1">数据示例：</p>
                <div className="text-xs bg-gray-50 p-2 rounded overflow-hidden">
                  <pre>{JSON.stringify(parsedData.slice(0, 3), null, 2)}</pre>
                  {parsedData.length > 3 && <p className="mt-1 text-gray-500">...共 {parsedData.length} 条</p>}
                </div>
              </div>
              <div>
                <p className="font-medium text-sm mb-1">数据结构：</p>
                <div className="text-xs bg-gray-50 p-2 rounded">
                  <pre>{`[
  {
    "mobile": 13800000000,
    "from": "小红书",
    "alias": "xxxxxx"
  },
  ...
]`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button 
            onClick={handleImport} 
            className="flex-1"
            disabled={parsedData.length === 0 || isImportSuccessful || isProcessing}
          >
            确认导入
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
            disabled={isProcessing}
          >
            重置
          </Button>
        </div>
      </div>
    </Card>
  );
} 