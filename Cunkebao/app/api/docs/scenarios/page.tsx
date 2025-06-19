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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://yishi.com'

export default function ApiDocPage({ params }: { params: { channel: string; id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [copiedExample, setCopiedExample] = useState<string | null>(null)

  const apiGuide = getApiGuideForScenario(params.id, params.channel)

  // 假设 fullUrl 和 apiKey 可通过 props 或接口获取，这里用演示值
  const [apiKey] = useState("naxf1-82h2f-vdwcm-rrhpm-q9hd1")
  const [fullUrl] = useState("/v1/api/scenarios")
  const testUrl = fullUrl.startsWith("http") ? fullUrl : `${API_BASE_URL}${fullUrl}`

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
            <h1 className="ml-2 text-lg font-medium">计划接口文档</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>接口说明</CardTitle>
            <CardDescription>本接口用于将外部客户数据导入到存客宝计划。请使用 <b>apiKey</b> 进行身份认证，建议仅在服务端调用。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-gray-700">
                  支持多种编程语言和平台集成。接口地址和参数请参考下方说明。
                </p>
              </div>
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>安全提示：</strong> 请妥善保管您的API密钥，不要在客户端代码中暴露它。建议在服务器端使用该接口。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>签名规则</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <b>签名参数：</b> <span className="font-mono">sign</span>
              </div>
              <div>
                <b>签名算法：</b> 将所有请求参数（排除 sign 和 apiKey）按参数名升序排序，<b>直接拼接参数值</b>（不含等号和&），对该字符串进行 <span className="font-mono">MD5</span> 加密，得到中间串，再拼接 apiKey，最后再进行一次 <span className="font-mono">MD5</span> 加密，结果作为 sign 参数传递。
              </div>
              <div>
                <b>签名步骤：</b>
                <ol className="list-decimal list-inside ml-4">
                  <li>去除 sign 和 apiKey 参数，将其余所有参数（如 name、phone、timestamp、source、remark、tags）按参数名升序排序</li>
                  <li><b>直接拼接参数值</b>，如 value1value2value3...</li>
                  <li>对拼接后的字符串进行 MD5 加密，得到中间串</li>
                  <li>将中间串与 apiKey 直接拼接</li>
                  <li>对拼接后的字符串再进行一次 MD5 加密，结果即为 sign</li>
                </ol>
              </div>
              <div>
                <b>示例：</b>
                <pre className="bg-gray-50 rounded p-2 text-xs overflow-auto">
{`参数：
  name=张三
  phone=18888888888
  timestamp=1700000000
  apiKey=naxf1-82h2f-vdwcm-rrhpm-q9hd1

排序后拼接（排除apiKey，直接拼接值）：
  张三188888888881700000000

第一步MD5：
  md5(张三188888888881700000000) = 123456abcdef...

拼接apiKey：
  123456abcdef...naxf1-82h2f-vdwcm-rrhpm-q9hd1

第二步MD5：
  sign=md5(123456abcdef...naxf1-82h2f-vdwcm-rrhpm-q9hd1)`}
                </pre>
              </div>
              <div className="text-xs text-amber-700 mt-2">注意：所有参数均需参与签名（除 sign 和 apiKey），且参数值需为原始值（不可 URL 编码）。</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>接口地址</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="font-mono text-sm">{testUrl}</span>
            </div>
            <div className="text-xs text-gray-500">
              <div>必要参数: <b>phone</b> (电话), <b>timestamp</b> (时间戳), <b>apiKey</b> (接口密钥)</div>
              <div>可选参数: <b>name</b> (姓名), <b>source</b> (来源), <b>remark</b> (备注), <b>tags</b> (标签)</div>
              <div>请求方式: <b>POST</b> 或 <b>GET</b></div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>请求参数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-md p-3 text-xs">
              <div><b>phone</b> (string, 必填): 客户电话</div>
              <div><b>timestamp</b> (int, 必填): 当前时间戳，精确到秒（如 1700000000，建议用 Math.floor(Date.now() / 1000) 获取）</div>
              <div><b>apiKey</b> (string, 必填): 接口密钥</div>
              <div><b>name</b> (string, 可选): 客户姓名</div>
              <div><b>source</b> (string, 可选): 来源</div>
              <div><b>remark</b> (string, 可选): 备注</div>
              <div><b>tags</b> (string, 可选): 标签</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>响应示例</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 rounded-md p-3 text-xs overflow-auto">
{`{
  "code": 200,
  "msg": "导入成功",
  "data": {
    "customerId": "123456"
  }
}`}
            </pre>
          </CardContent>
        </Card>

       

        <Card>
          <CardHeader>
            <CardTitle>代码示例</CardTitle>
            <CardDescription>以下是不同编程语言的接口调用示例</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl">
              <TabsList className="mb-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
                <TabsTrigger value="java">Java</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">{`curl -X POST 'http://yishi.com/v1/plan/api/scenariosz' \
  -d "phone=18888888888" \
  -d "timestamp=1700000000" \
  -d "name=张三" \
  -d "apiKey=naxf1-82h2f-vdwcm-rrhpm-q9hd1" \
  -d "sign=请用签名算法生成"`}</pre>
              </TabsContent>
              <TabsContent value="python">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">{`import hashlib
import time
import requests

def gen_sign(params, api_key):
    data = {k: v for k, v in params.items() if k not in ('sign', 'apiKey')}
    s = ''.join([str(data[k]) for k in sorted(data)])
    first = hashlib.md5(s.encode('utf-8')).hexdigest()
    return hashlib.md5((first + api_key).encode('utf-8')).hexdigest()

api_key = 'naxf1-82h2f-vdwcm-rrhpm-q9hd1'
params = {
    'phone': '18888888888',
    'timestamp': int(time.time()),
    'name': '张三',
}
params['apiKey'] = api_key
params['sign'] = gen_sign(params, api_key)
resp = requests.post('http://yishi.com/v1/plan/api/scenariosz', data=params)
print(resp.json())`}</pre>
              </TabsContent>
              <TabsContent value="node">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">{`const axios = require('axios');
const crypto = require('crypto');

function genSign(params, apiKey) {
  const data = {...params};
  delete data.sign;
  delete data.apiKey;
  const keys = Object.keys(data).sort();
  let str = '';
  keys.forEach(k => { str += data[k]; });
  const first = crypto.createHash('md5').update(str).digest('hex');
  return crypto.createHash('md5').update(first + apiKey).digest('hex');
}

const apiKey = 'naxf1-82h2f-vdwcm-rrhpm-q9hd1';
const params = {
  phone: '18888888888',
  timestamp: Math.floor(Date.now() / 1000),
  name: '张三',
};
params.apiKey = apiKey;
params.sign = genSign(params, apiKey);

axios.post('http://yishi.com/v1/plan/api/scenariosz', params)
  .then(res => console.log(res.data));`}</pre>
              </TabsContent>
              <TabsContent value="php">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">{`<?php
function md5_sign($params, $apiKey) {
    unset($params['sign']);
    unset($params['apiKey']);
    ksort($params);
    $str = '';
    foreach ($params as $v) {
        $str .= $v;
    }
    $first = md5($str);
    $final = md5($first . $apiKey);
    return $final;
}

$params = [
    'phone' => '18888888888',
    'timestamp' => time(),
    'name' => '张三',
    // 'source' => '', 'remark' => '', 'tags' => ''
];
$apiKey = 'naxf1-82h2f-vdwcm-rrhpm-q9hd1';
$params['apiKey'] = $apiKey;
$params['sign'] = md5_sign($params, $apiKey);

$url = '${API_BASE_URL}/v1/api/scenarios';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`}</pre>
              </TabsContent>
              <TabsContent value="java">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">{`import java.security.MessageDigest;
import java.util.*;
import java.net.*;
import java.io.*;

public class ApiSignDemo {
    public static String md5(String s) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] array = md.digest(s.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : array) sb.append(String.format("%02x", b));
        return sb.toString();
    }
    public static void main(String[] args) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("phone", "18888888888");
        params.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
        params.put("name", "张三");
        // params.put("source", ""); params.put("remark", ""); params.put("tags", "");
        String apiKey = "naxf1-82h2f-vdwcm-rrhpm-q9hd1";
        // 排序并拼接
        List<String> keys = new ArrayList<>(params.keySet());
        keys.remove("sign");
        keys.remove("apiKey");
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (String k : keys) {
            sb.append(params.get(k));
        }
        String first = md5(sb.toString());
        String sign = md5(first + apiKey);
        params.put("apiKey", apiKey);
        params.put("sign", sign);
        // 发送POST请求
        StringBuilder postData = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (postData.length() > 0) postData.append("&");
            postData.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
            postData.append("=");
            postData.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
        }
        URL url = new URL("${API_BASE_URL}/v1/api/scenarios");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        OutputStream os = conn.getOutputStream();
        os.write(postData.toString().getBytes("UTF-8"));
        os.flush(); os.close();
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line; StringBuilder resp = new StringBuilder();
        while ((line = in.readLine()) != null) resp.append(line);
        in.close();
        System.out.println(resp.toString());
    }
}`}</pre>
              </TabsContent>
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
                <li>导航至"应用集成" &gt; "外部接口"</li>
                <li>选择"添加新接口"，输入存客宝接口信息</li>
                <li>配置回调参数，将"X-API-KEY"设置为您的API密钥</li>
                <li>
                  设置接口URL为：
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {testUrl}
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

