<template>
  <view class="device-detail-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @click="goBack">
        <u-icon name="arrow-left" size="44" color="#333"></u-icon>
      </view>
      <text class="navbar-title">设备详情</text>
      <view class="navbar-right">
        <u-icon name="setting" size="44" color="#333" @click="openSettings"></u-icon>
      </view>
    </view>
    
    <!-- 设备信息卡片 -->
    <view class="device-card">
      <view class="device-icon-box">
        <u-icon name="smartphone" size="54" color="#4080ff"></u-icon>
      </view>
      <view class="device-title">
        <text class="device-name">{{ deviceInfo.name }}</text>
        <text class="device-status" :class="deviceInfo.status === '在线' ? 'online' : 'offline'">{{ deviceInfo.status }}</text>
      </view>
      <view class="device-info-row">
        <text class="device-info-label">IMEI: </text>
        <text class="device-info-value">{{ deviceInfo.imei }}</text>
      </view>
      <view class="device-info-row">
        <text class="device-info-label">历史ID: </text>
        <text class="device-info-value">{{ deviceInfo.historyId }}</text>
      </view>
      <view class="device-stats">
        <!-- 电量指示器 -->
        <view class="battery-indicator">
          <u-icon name="integral" size="40" :color="deviceInfo.status === '在线' ? '#07c160' : '#909399'"></u-icon>
          <text class="battery-percentage">{{ deviceInfo.battery }}</text>
        </view>
        
        <!-- 网络状态 -->
        <view class="wifi-indicator">
          <u-icon name="wifi" size="40" :color="deviceInfo.status === '在线' ? '#4080ff' : '#909399'"></u-icon>
          <text class="wifi-status">{{ deviceInfo.wifiStatus }}</text>
        </view>
      </view>
      
      <view class="device-last-active">
        <text class="last-active-label">最后活跃: </text>
        <text class="last-active-time">{{ deviceInfo.lastActive }}</text>
      </view>
    </view>
    
    <!-- 标签切换栏 -->
    <u-tabs
      :list="tabsList"
      :current="tabCurrent"
      @change="handleTabChange"
      activeStyle="color: #333; font-weight: bold;"
      inactiveStyle="color: #888;"
      itemStyle="height: 90rpx; font-size: 30rpx;"
      lineColor="#4080ff"
      lineWidth="60rpx"
      lineHeight="4rpx"
    ></u-tabs>
    
    <!-- 基本信息内容 -->
    <view v-if="tabCurrent === 0" class="tab-content">
      <view class="features-list">
        <!-- 自动加好友 -->
        <view class="feature-item">
          <view class="feature-left">
            <text class="feature-title">自动加好友</text>
            <text class="feature-desc">自动通过好友验证</text>
          </view>
          <view class="feature-right">
            <u-switch v-model="features.autoAddFriend" activeColor="#4080ff"></u-switch>
          </view>
        </view>
        
        <!-- 自动回复 -->
        <view class="feature-item">
          <view class="feature-left">
            <text class="feature-title">自动回复</text>
            <text class="feature-desc">自动回复好友消息</text>
          </view>
          <view class="feature-right">
            <u-switch v-model="features.autoReply" activeColor="#4080ff"></u-switch>
          </view>
        </view>
        
        <!-- 朋友圈同步 -->
        <view class="feature-item">
          <view class="feature-left">
            <text class="feature-title">朋友圈同步</text>
            <text class="feature-desc">自动同步朋友圈内容</text>
          </view>
          <view class="feature-right">
            <u-switch v-model="features.momentSync" activeColor="#4080ff"></u-switch>
          </view>
        </view>
        
        <!-- AI会话 -->
        <view class="feature-item">
          <view class="feature-left">
            <text class="feature-title">AI会话</text>
            <text class="feature-desc">启用AI智能对话</text>
          </view>
          <view class="feature-right">
            <u-switch v-model="features.aiChat" activeColor="#4080ff"></u-switch>
          </view>
        </view>
      </view>
      
      <!-- 统计数据卡片 -->
      <view class="stats-container">
        <view class="stats-card">
          <view class="stats-icon">
            <u-icon name="account" size="40" color="#4080ff"></u-icon>
          </view>
          <text class="stats-title">好友总数</text>
          <text class="stats-value">768</text>
        </view>
        
        <view class="stats-card">
          <view class="stats-icon">
            <u-icon name="chat" size="40" color="#4080ff"></u-icon>
          </view>
          <text class="stats-title">消息数量</text>
          <text class="stats-value">5,678</text>
        </view>
      </view>
    </view>
    
    <!-- 关联账号内容 -->
    <view v-if="tabCurrent === 1" class="tab-content">
      <view class="wechat-accounts-list">
        <!-- 账号项 1 -->
        <view class="wechat-account-item">
          <view class="wechat-avatar">
            <u-avatar src="/static/images/avatar.png" size="80"></u-avatar>
          </view>
          <view class="wechat-info">
            <view class="wechat-name-row">
              <text class="wechat-name">老张</text>
              <text class="wechat-status normal">正常</text>
            </view>
            <view class="wechat-id-row">
              <text class="wechat-id-label">微信号: </text>
              <text class="wechat-id-value">wxid_abc123</text>
            </view>
            <view class="wechat-gender-row">
              <text class="wechat-gender-label">性别: </text>
              <text class="wechat-gender-value">男</text>
            </view>
            <view class="wechat-friends-row">
              <text class="wechat-friends-label">好友数: </text>
              <text class="wechat-friends-value">523</text>
              <text class="wechat-add-friends">可加友</text>
            </view>
          </view>
        </view>
        
        <!-- 账号项 2 -->
        <view class="wechat-account-item">
          <view class="wechat-avatar">
            <u-avatar src="/static/images/avatar.png" size="80"></u-avatar>
          </view>
          <view class="wechat-info">
            <view class="wechat-name-row">
              <text class="wechat-name">老李</text>
              <text class="wechat-status warning">异常</text>
            </view>
            <view class="wechat-id-row">
              <text class="wechat-id-label">微信号: </text>
              <text class="wechat-id-value">wxid_xyz789</text>
            </view>
            <view class="wechat-gender-row">
              <text class="wechat-gender-label">性别: </text>
              <text class="wechat-gender-value">男</text>
            </view>
            <view class="wechat-friends-row">
              <text class="wechat-friends-label">好友数: </text>
              <text class="wechat-friends-value">245</text>
              <text class="wechat-add-friends used">已使用</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 操作记录内容 -->
    <view v-if="tabCurrent === 2" class="tab-content">
      <view class="operation-logs">
        <!-- 操作记录项 1 -->
        <view class="operation-item">
          <view class="operation-icon">
            <u-icon name="reload" size="36" color="#4080ff"></u-icon>
          </view>
          <view class="operation-info">
            <text class="operation-title">开启自动加好友</text>
            <text class="operation-meta">操作人: 系统 · 2024-02-09 15:30:45</text>
          </view>
        </view>
        
        <!-- 操作记录项 2 -->
        <view class="operation-item">
          <view class="operation-icon">
            <u-icon name="reload" size="36" color="#4080ff"></u-icon>
          </view>
          <view class="operation-info">
            <text class="operation-title">添加微信号</text>
            <text class="operation-meta">操作人: 管理员 · 2024-02-09 14:20:33</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="home"></CustomTabBar>
  </view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue';

export default {
  components: {
    CustomTabBar
  },
  data() {
    return {
      tabsList: [
        { name: '基本信息' },
        { name: '关联账号' },
        { name: '操作记录' }
      ],
      tabCurrent: 0,
      features: {
        autoAddFriend: true,
        autoReply: true,
        momentSync: false,
        aiChat: true
      },
      deviceInfo: {
        name: '设备 1',
        imei: 'sd123123',
        historyId: 'vx412321, vfbadasd',
        battery: '85%',
        wifiStatus: '已连接',
        lastActive: '2024-02-09 15:30:45',
        status: '在线'
      },
      wechatAccounts: [
        {
          avatar: '/static/images/avatar.png',
          name: '老张',
          status: '正常',
          id: 'wxid_abc123',
          gender: '男',
          friends: 523,
          canAddFriends: true
        },
        {
          avatar: '/static/images/avatar.png',
          name: '老李',
          status: '异常',
          id: 'wxid_xyz789',
          gender: '男',
          friends: 245,
          canAddFriends: false
        }
      ],
      operationLogs: [
        {
          title: '开启自动加好友',
          operator: '系统',
          time: '2024-02-09 15:30:45'
        },
        {
          title: '添加微信号',
          operator: '管理员',
          time: '2024-02-09 14:20:33'
        }
      ],
      deviceId: null
    }
  },
  onLoad(options) {
    // 获取路由参数中的设备ID
    if (options && options.id) {
      this.deviceId = options.id;
      console.log('设备ID:', this.deviceId);
    }
    
    // 加载设备详情数据
    this.loadDeviceDetail();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    openSettings() {
      uni.showToast({
        title: '设置功能即将上线',
        icon: 'none',
        duration: 2000
      });
    },
    handleTabChange(index) {
      this.tabCurrent = index;
    },
    loadDeviceDetail() {
      // 这里模拟API调用获取设备详情数据
      uni.showLoading({
        title: '加载中...'
      });
      
      // 模拟网络请求延迟
      setTimeout(() => {
        // 根据设备ID获取不同的设备数据
        // 在实际应用中，这里应该是从服务器获取数据
        if (this.deviceId) {
          // 使用预设数据，实际项目中应替换为API调用
          console.log('加载设备ID为', this.deviceId, '的详情数据');
          
          // 模拟不同的设备数据
          if (this.deviceId === '1') {
            // 设备1数据保持不变，已在data中预设
          } else if (this.deviceId === '2') {
            this.deviceInfo.name = '设备 2';
            this.deviceInfo.imei = 'sd123124';
            this.deviceInfo.battery = '65%';
            this.deviceInfo.lastActive = '2024-02-08 10:15:23';
          } else if (this.deviceId === '3') {
            this.deviceInfo.name = '设备 3';
            this.deviceInfo.imei = 'sd123125';
            this.deviceInfo.battery = '92%';
            this.deviceInfo.lastActive = '2024-02-09 08:45:12';
          } else if (this.deviceId === '4') {
            this.deviceInfo.name = '设备 4';
            this.deviceInfo.imei = 'sd123126';
            this.deviceInfo.battery = '23%';
            this.deviceInfo.status = '离线';
            this.deviceInfo.wifiStatus = '未连接';
            this.deviceInfo.lastActive = '2024-02-07 16:20:35';
          }
        }
        
        uni.hideLoading();
      }, 500);
    }
  }
}
</script>

<style lang="scss" scoped>
.device-detail-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 150rpx; /* 为底部导航栏预留空间 */
}

/* 顶部导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  background-color: #fff;
  position: relative;
  
  .navbar-left {
    width: 80rpx;
  }
  
  .navbar-title {
    font-size: 36rpx;
    font-weight: bold;
  }
  
  .navbar-right {
    width: 80rpx;
    display: flex;
    justify-content: flex-end;
  }
}

/* 设备信息卡片 */
.device-card {
  margin: 20rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .device-icon-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    background-color: #f0f5ff;
    margin: 0 auto;
  }
  
  .device-title {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 16rpx 0;
    
    .device-name {
      font-size: 36rpx;
      font-weight: bold;
      margin-right: 16rpx;
    }
    
    .device-status {
      font-size: 26rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      
      &.online {
        background-color: rgba(7, 193, 96, 0.1);
        color: #07c160;
      }
      
      &.offline {
        background-color: rgba(144, 147, 153, 0.1);
        color: #909399;
      }
    }
  }
  
  .device-info-row {
    display: flex;
    justify-content: center;
    margin: 8rpx 0;
    font-size: 28rpx;
    color: #666;
    
    .device-info-value {
      color: #333;
    }
  }
  
  .device-stats {
    display: flex;
    justify-content: center;
    margin: 20rpx 0;
    
    .battery-indicator, .wifi-indicator {
      display: flex;
      align-items: center;
      margin: 0 30rpx;
      
      .battery-percentage, .wifi-status {
        margin-left: 8rpx;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
  
  .device-last-active {
    text-align: center;
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
    
    .last-active-time {
      color: #666;
    }
  }
}

/* 选项卡内容 */
.tab-content {
  padding: 20rpx;
}

/* 功能设置列表 */
.features-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  
  .feature-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .feature-left {
      display: flex;
      flex-direction: column;
      
      .feature-title {
        font-size: 32rpx;
        color: #333;
        margin-bottom: 4rpx;
      }
      
      .feature-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

/* 统计数据卡片 */
.stats-container {
  display: flex;
  justify-content: space-between;
  
  .stats-card {
    flex: 1;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin: 0 10rpx;
    text-align: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .stats-icon {
      margin-bottom: 16rpx;
    }
    
    .stats-title {
      font-size: 26rpx;
      color: #666;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .stats-value {
      font-size: 48rpx;
      color: #4080ff;
      font-weight: bold;
      font-family: 'Digital-Bold', sans-serif;
    }
  }
}

/* 微信账号列表 */
.wechat-accounts-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .wechat-account-item {
    display: flex;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .wechat-avatar {
      margin-right: 20rpx;
    }
    
    .wechat-info {
      flex: 1;
      
      .wechat-name-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;
        
        .wechat-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
        
        .wechat-status {
          font-size: 24rpx;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          
          &.normal {
            background-color: rgba(7, 193, 96, 0.1);
            color: #07c160;
          }
          
          &.warning {
            background-color: rgba(250, 81, 81, 0.1);
            color: #fa5151;
          }
        }
      }
      
      .wechat-id-row, .wechat-gender-row, .wechat-friends-row {
        font-size: 26rpx;
        color: #666;
        margin: 6rpx 0;
      }
      
      .wechat-friends-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .wechat-add-friends {
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          
          &:not(.used) {
            background-color: rgba(7, 193, 96, 0.1);
            color: #07c160;
          }
          
          &.used {
            background-color: rgba(144, 147, 153, 0.1);
            color: #909399;
          }
        }
      }
    }
  }
}

/* 操作记录 */
.operation-logs {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .operation-item {
    display: flex;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .operation-icon {
      margin-right: 20rpx;
    }
    
    .operation-info {
      flex: 1;
      
      .operation-title {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 6rpx;
      }
      
      .operation-meta {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style> 