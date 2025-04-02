# 定时任务和队列使用说明

## 一、环境准备

### 1. 安装Redis
确保服务器已安装Redis，并正常运行。

```bash
# Ubuntu/Debian系统
sudo apt-get update
sudo apt-get install redis-server

# CentOS系统
sudo yum install redis
sudo systemctl start redis
```

### 2. 安装PHP的Redis扩展

```bash
sudo pecl install redis
```

### 3. 修改队列配置

编辑 `config/queue.php` 文件，根据实际环境修改Redis连接信息。

## 二、系统组件说明

### 1. 命令行任务
已实现的命令行任务：
- `device:list`: 获取设备列表命令

### 2. 队列任务
已实现的队列任务：
- `DeviceListJob`: 处理设备列表获取并自动翻页的任务

## 三、配置步骤

### 1. 确保API连接信息正确
在 `.env` 文件中确保以下配置正确：
- `api.wechat_url`: API基础URL地址
- `api.username`: API登录用户名
- `api.password`: API登录密码

## 四、系统架构说明

### 1. 授权服务
系统使用了公共授权服务 `app\common\service\AuthService`，用于管理API授权信息：
- 提供静态方法 `getSystemAuthorization()`，可被所有定时任务和控制器复用
- 从环境变量（.env文件）中读取API连接信息
- 自动缓存授权Token，有效期为10分钟，避免频繁请求API
- 缓存失效后自动重新获取授权信息

### 2. 队列任务
队列任务统一放置在 `application/job` 目录中：
- 目前已实现 `DeviceListJob` 用于获取设备列表
- 每个任务类需实现 `fire` 方法来处理队列任务
- 任务可以通过 `think queue:work` 命令处理
- 失败任务会自动重试，最多3次

### 3. 定时命令
定时命令统一放置在 `application/common/command` 目录中：
- 继承自 `BaseCommand` 基类
- 需要在 `application/command.php` 中注册命令
- 可通过 `php think` 命令调用

## 五、配置定时任务

### 1. 编辑crontab配置

```bash
crontab -e
```

### 2. 直接配置PHP命令执行定时任务

```
# 每5分钟执行一次设备列表获取任务
*/5 * * * * cd /www/wwwroot/yi.54iis.com && php think device:list >> /www/wwwroot/yi.54iis.com/logs/device_list.log 2>&1
```

说明：
- `cd /www/wwwroot/yi.54iis.com`: 切换到项目目录
- `php think device:list`: 执行设备列表命令
- `>> /www/wwwroot/yi.54iis.com/logs/device_list.log 2>&1`: 将输出和错误信息追加到日志文件

### 3. 创建日志目录

```bash
# 确保日志目录存在
mkdir -p /www/wwwroot/yi.54iis.com/logs
chmod 755 /www/wwwroot/yi.54iis.com/logs
```

## 六、配置队列处理进程

### 1. 使用crontab监控队列进程

```
# 每分钟检查队列进程，如果不存在则启动
* * * * * ps aux | grep "php think queue:work" | grep -v grep > /dev/null || (cd /www/wwwroot/yi.54iis.com && nohup php think queue:work --queue device_list --tries 3 --sleep 3 >> /www/wwwroot/yi.54iis.com/logs/queue_worker.log 2>&1 &)
```

说明：
- `ps aux | grep "php think queue:work" | grep -v grep > /dev/null`: 检查队列进程是否存在
- `||`: 如果前面的命令失败（进程不存在），则执行后面的命令
- `(cd /www/wwwroot/yi.54iis.com && nohup...)`: 进入项目目录并启动队列处理进程

### 2. 或者使用supervisor管理队列进程（推荐）

如果服务器上安装了supervisor，可以创建配置文件 `/etc/supervisor/conf.d/device_queue.conf`：

```ini
[program:device_queue]
process_name=%(program_name)s_%(process_num)02d
command=php /www/wwwroot/yi.54iis.com/think queue:work --queue device_list --tries 3 --sleep 3
autostart=true
autorestart=true
user=www
numprocs=1
redirect_stderr=true
stdout_logfile=/www/wwwroot/yi.54iis.com/logs/queue_worker.log
```

然后重新加载supervisor配置：

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start device_queue:*
```

## 七、测试

### 1. 手动执行命令

```bash
# 进入项目目录
cd /www/wwwroot/yi.54iis.com

# 执行设备列表获取命令
php think device:list
```

### 2. 查看日志

```bash
# 查看定时任务日志
cat /www/wwwroot/yi.54iis.com/logs/device_list.log

# 查看队列处理日志
cat /www/wwwroot/yi.54iis.com/logs/queue_worker.log
```

## 八、新增定时任务流程

如需添加新的定时任务，请按照以下步骤操作：

1. 在 `application/common/command` 目录下创建新的命令类
2. 在 `application/job` 目录下创建对应的队列任务处理类
3. 在 `application/command.php` 文件中注册新命令
4. 更新crontab配置，添加新的命令执行计划

示例：添加一个每天凌晨2点执行的数据备份任务

```
0 2 * * * cd /www/wwwroot/yi.54iis.com && php think backup:data >> /www/wwwroot/yi.54iis.com/logs/backup_data.log 2>&1
```

新增的定时任务可直接使用 `AuthService::getSystemAuthorization()` 获取授权信息，无需重复实现授权逻辑。

## 九、注意事项

1. 确保PHP命令可以正常执行（如果默认PHP版本不匹配，可能需要使用完整路径，例如 `/www/server/php/74/bin/php`）
2. 确保Redis服务正常运行
3. 确保API连接信息配置正确
4. 确保日志目录存在且有写入权限
5. 定时任务执行用户需要有项目目录的读写权限
6. 如果使用宝塔面板，可以在【计划任务】中配置上述crontab任务 