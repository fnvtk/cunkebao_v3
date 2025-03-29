interface ApiHeader {
  name: string
  value: string
  description: string
  required: boolean
}

interface ApiParameter {
  name: string
  type: string
  description: string
  required: boolean
}

interface ApiEndpoint {
  method: string
  url: string
  description: string
  headers: ApiHeader[]
  parameters: ApiParameter[]
  response: any
}

interface CodeExample {
  language: string
  title: string
  code: string
}

interface ApiGuide {
  title: string
  description: string
  endpoints: ApiEndpoint[]
  examples: CodeExample[]
}

export function getApiGuideForScenario(scenarioId: string, channel: string): ApiGuide {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const webhookUrl = `${baseUrl}/api/scenarios/${channel}/${scenarioId}/webhook`

  return {
    title: `${getChannelName(channel)}获客计划接口文档`,
    description: `通过此接口，您可以将外部系统收集的客户信息直接导入到存客宝的${getChannelName(channel)}获客计划中。`,
    endpoints: [
      {
        method: "POST",
        url: webhookUrl,
        description: "添加新客户到获客计划",
        headers: [
          {
            name: "X-API-KEY",
            value: "您的API密钥",
            description: "用于身份验证的API密钥",
            required: true,
          },
          {
            name: "Content-Type",
            value: "application/json",
            description: "请求体格式",
            required: true,
          },
        ],
        parameters: [
          {
            name: "name",
            type: "string",
            description: "客户姓名",
            required: true,
          },
          {
            name: "phone",
            type: "string",
            description: "客户手机号码",
            required: true,
          },
          {
            name: "source",
            type: "string",
            description: "客户来源",
            required: false,
          },
          {
            name: "remark",
            type: "string",
            description: "备注信息",
            required: false,
          },
          {
            name: "tags",
            type: "array<string>",
            description: "客户标签",
            required: false,
          },
        ],
        response: {
          success: true,
          data: {
            id: "12345",
            name: "张三",
            phone: "13800138000",
            createdAt: "2023-05-15T08:30:00Z",
          },
          message: "客户添加成功",
        },
      },
      {
        method: "GET",
        url: `${webhookUrl}?name=张三&phone=13800138000`,
        description: "通过GET请求添加新客户（适用于简单集成场景）",
        headers: [
          {
            name: "X-API-KEY",
            value: "您的API密钥",
            description: "用于身份验证的API密钥",
            required: true,
          },
        ],
        parameters: [
          {
            name: "name",
            type: "string",
            description: "客户姓名",
            required: true,
          },
          {
            name: "phone",
            type: "string",
            description: "客户手机号码",
            required: true,
          },
          {
            name: "source",
            type: "string",
            description: "客户来源",
            required: false,
          },
          {
            name: "remark",
            type: "string",
            description: "备注信息",
            required: false,
          },
        ],
        response: {
          success: true,
          data: {
            id: "12345",
            name: "张三",
            phone: "13800138000",
            createdAt: "2023-05-15T08:30:00Z",
          },
          message: "客户添加成功",
        },
      },
    ],
    examples: [
      {
        language: "curl",
        title: "CURL",
        code: `curl -X POST "${webhookUrl}" \\
  -H "X-API-KEY: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "source": "官网表单",
    "remark": "对产品很感兴趣"
  }'`,
      },
      {
        language: "python",
        title: "Python",
        code: `import requests

url = "${webhookUrl}"
headers = {
    "X-API-KEY": "your_api_key",
    "Content-Type": "application/json"
}
data = {
    "name": "张三",
    "phone": "13800138000",
    "source": "官网表单",
    "remark": "对产品很感兴趣"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,
      },
      {
        language: "javascript",
        title: "JavaScript",
        code: `// 使用fetch API
fetch("${webhookUrl}", {
  method: "POST",
  headers: {
    "X-API-KEY": "your_api_key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "张三",
    phone: "13800138000",
    source: "官网表单",
    remark: "对产品很感兴趣"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`,
      },
      {
        language: "java",
        title: "Java",
        code: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiExample {
    public static void main(String[] args) {
        try {
            String url = "${webhookUrl}";
            String requestBody = "{" +
                "\\\"name\\\": \\\"张三\\\"," +
                "\\\"phone\\\": \\\"13800138000\\\"," +
                "\\\"source\\\": \\\"官网表单\\\"," +
                "\\\"remark\\\": \\\"对产品很感兴趣\\\"" +
                "}";
            
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("X-API-KEY", "your_api_key")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
                
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println(response.body());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`,
      },
      {
        language: "php",
        title: "PHP",
        code: `<?php
$url = "${webhookUrl}";
$data = array(
    'name' => '张三',
    'phone' => '13800138000',
    'source' => '官网表单',
    'remark' => '对产品很感兴趣'
);

$options = array(
    'http' => array(
        'header'  => "X-API-KEY: your_api_key\\r\\nContent-type: application/json\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error";
} else {
    var_dump(json_decode($result));
}
?>`,
      },
    ],
  }
}

function getChannelName(channel: string): string {
  const channelMap: Record<string, string> = {
    douyin: "抖音",
    kuaishou: "快手",
    xiaohongshu: "小红书",
    weibo: "微博",
    haibao: "海报",
    phone: "电话",
    gongzhonghao: "公众号",
    weixinqun: "微信群",
    payment: "付款码",
    api: "API",
  }
  return channelMap[channel] || channel
}

