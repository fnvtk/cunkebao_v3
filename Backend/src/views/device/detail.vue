<template>
  <el-container v-loading="loading" style="height: 100%;">
    <el-header style="display: flex; align-items: center; padding: 0;">
      <div style="margin-left: 20px;">
        <el-page-header @back="goBack" :content="'设备ID: ' + deviceId"></el-page-header>
      </div>
    </el-header>
    <el-main>
      <el-card v-if="deviceInfo" class="device-card">
        <div slot="header" class="card-header">
          <span>设备详情</span>
          <el-tag :type="getStatusType(deviceInfo.status)" class="status-tag">
            {{ getStatusText(deviceInfo.status) }}
          </el-tag>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">设备ID：</span>
              <span class="value">{{ deviceInfo.id }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">IMEI：</span>
              <span class="value">{{ deviceInfo.imei }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">设备手机号：</span>
              <span class="value">{{ deviceInfo.phone || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">电量：</span>
              <span class="value">
                <el-progress 
                  :percentage="deviceInfo.battery" 
                  :color="getBatteryColor(deviceInfo.battery)"
                  :format="() => `${deviceInfo.battery}%`"
                  style="width: 200px;">
                </el-progress>
              </span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">微信ID：</span>
              <span class="value">{{ deviceInfo.wechat_id || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">微信号：</span>
              <span class="value">{{ deviceInfo.wechat_name || '--' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">分组名称：</span>
              <span class="value">{{ deviceInfo.group_name || '--' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">保管者：</span>
              <span class="value">{{ deviceInfo.username || '--' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="info-item">
              <span class="label">备注：</span>
              <span class="value">{{ deviceInfo.remark || '--' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatTime(deviceInfo.create_time) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">更新时间：</span>
              <span class="value">{{ formatTime(deviceInfo.update_time) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
      
      <el-empty v-else description="未找到设备信息"></el-empty>
    </el-main>
  </el-container>
</template>

<script>
// 引入API请求
import request from '@/utils/request'

export default {
  name: 'DeviceDetail',
  data() {
    return {
      // 设备ID
      deviceId: null,
      // 设备信息
      deviceInfo: null,
      // 加载状态
      loading: false
    }
  },
  created() {
    // 获取路由参数中的设备ID
    this.deviceId = this.$route.params.id
    // 加载设备详情
    this.getDeviceDetail()
  },
  methods: {
    // 返回列表页
    goBack() {
      this.$router.push('/device/index')
    },
    // 获取设备详情
    getDeviceDetail() {
      if (!this.deviceId) {
        this.$message.error('设备ID不能为空')
        return
      }
      
      this.loading = true
      request({
        url: `/api/devices/detail/${this.deviceId}`,
        method: 'get'
      }).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.deviceInfo = res.data
        } else {
          this.$message.error(res.msg || '获取设备详情失败')
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(timestamp * 1000)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      const second = date.getSeconds().toString().padStart(2, '0')
      
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },
    // 获取状态对应的类型
    getStatusType(status) {
      const statusMap = {
        '0': 'info',   // 离线
        '1': 'success', // 在线
        '2': 'danger',  // 故障
        '3': 'warning'  // 维修中
      }
      return statusMap[status] || 'info'
    },
    // 获取状态对应的文本
    getStatusText(status) {
      const statusMap = {
        '0': '离线',
        '1': '在线',
        '2': '故障',
        '3': '维修中'
      }
      return statusMap[status] || status
    },
    // 获取电量对应的颜色
    getBatteryColor(battery) {
      if (battery < 20) {
        return '#F56C6C' // 红色，电量低
      } else if (battery < 50) {
        return '#E6A23C' // 黄色，电量中等
      } else {
        return '#67C23A' // 绿色，电量充足
      }
    }
  }
}
</script>

<style scoped>
.el-header {
  border-bottom: 1px solid #e6e6e6;
  background-color: #fff;
}

.device-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tag {
  margin-left: 10px;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  color: #606266;
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
  display: inline-block;
}

.value {
  color: #303133;
}
</style> 