<template>
  <view class="index-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="title align-left">存客宝</view>
      <view class="header-icons">
        <u-icon name="bell" size="50" color="#000000" class="icon-bell" @click="goToNotification"></u-icon>
      </view>
    </view>
    
    <!-- 数据概览卡片 -->
    <view class="data-cards">
      <view class="data-card">
        <view class="data-title">设备数量</view>
        <view class="data-content">
          <text class="data-number digital-number">42</text>
          <image src="/static/images/icons/smartphone.svg" class="device-icon"></image>
        </view>
      </view>
      
      <view class="data-card">
        <view class="data-title">微信号数量</view>
        <view class="data-content">
          <text class="data-number digital-number">42</text>
          <image src="/static/images/icons/users.svg" class="team-icon"></image>
        </view>
      </view>
      
      <view class="data-card">
        <view class="data-title">在线微信号</view>
        <view class="data-content">
          <text class="data-number digital-number">35</text>
          <image src="/static/images/icons/heartbeat.svg" class="heartbeat-icon"></image>
        </view>
        <view class="progress-container">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: onlineRate + '%' }"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 场景获客统计卡片 -->
    <view class="stat-card">
      <view class="card-title align-left">场景获客统计</view>
      <view class="stat-grid">
        <view class="stat-item">
          <view class="stat-icon bg-green">
            <u-icon name="integral-fill" size="38" color="#07c160"></u-icon>
          </view>
          <view class="stat-number">234</view>
          <view class="stat-label">公众号获客</view>
        </view>
        
        <view class="stat-item">
          <view class="stat-icon bg-yellow">
            <u-icon name="coupon" size="38" color="#ff9900"></u-icon>
          </view>
          <view class="stat-number">167</view>
          <view class="stat-label">海报获客</view>
        </view>
        
        <view class="stat-item">
          <view class="stat-icon bg-black">
            <u-icon name="play-right" size="38" color="#000000"></u-icon>
          </view>
          <view class="stat-number">156</view>
          <view class="stat-label">抖音获客</view>
        </view>
        
        <view class="stat-item">
          <view class="stat-icon bg-red">
            <u-icon name="heart" size="38" color="#fa5151"></u-icon>
          </view>
          <view class="stat-number">89</view>
          <view class="stat-label">小红书获客</view>
        </view>
      </view>
    </view>
    
    <!-- 每日获客趋势卡片 -->
    <view class="trend-card">
      <view class="card-title align-left">每日获客趋势</view>
      <view class="chart-container">
        <!-- 使用自定义LineChart组件代替uChart -->
        <LineChart
          :points="weekTrendData"
          :xAxisLabels="weekDays"
          color="#2563EB"
          class="custom-chart"
        ></LineChart>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="home"></CustomTabBar>
  </view>
</template>

<script>
import LineChart from '@/components/LineChart.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

export default {
  components: {
    LineChart,
    CustomTabBar
  },
  data() {
    return {
      weekTrendData: [120, 150, 180, 210, 240, 210, 190],
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      deviceCount: 42,
      wechatCount: 42,
      onlineCount: 35,
      onlineRate: 83, // 计算在线率百分比：(35/42)*100 约等于 83
      channelStats: [
        { icon: 'integral-fill', color: 'green', count: 234, label: '公众号获客' },
        { icon: 'coupon', color: 'yellow', count: 167, label: '海报获客' },
        { icon: 'play-right', color: 'black', count: 156, label: '抖音获客' },
        { icon: 'heart', color: 'red', count: 89, label: '小红书获客' }
      ]
    }
  },
  onLoad() {
    // 加载数据
    this.loadData();
  },
  methods: {
    // 加载数据
    loadData() {
      // 这里可以添加API调用获取实际数据
      console.log('加载首页数据');
      // 示例数据已在data中预设
    },
    
    // 跳转到通知页面
    goToNotification() {
      uni.navigateTo({
        url: '/pages/notification/index'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f9fafb;
  position: relative;
  padding-bottom: 150rpx; /* 为底部导航栏预留空间 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #e9e9e9;
  
  .title {
    font-size: 45rpx;
    font-weight: bold;
    color: #2664ec;
    
    &.align-left {
      text-align: left;
    }
  }
  
  .header-icons {
    display: flex;
    color: black;
    align-items: center;
  }
}

.data-cards {
  display: flex;
  justify-content: space-between;
  margin: 20rpx;
  
  .data-card {
    flex: 1;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 30rpx 30rpx;
    margin:  15rpx;
    box-shadow: 0 2rpx 7rpx rgba(0, 0, 0, 0.15);
    
    .data-title {
      font-size: 28rpx;
      color: black;
      text-align: center;
    }
    
    .data-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .data-number {
        font-size: 58rpx;
        font-weight: bold;
        color: #2563EB;
        height: 80rpx;
        line-height: 80rpx;
      }
      
      .device-icon {
        width: 76rpx;
        height: 60rpx;
        margin-right: 6rpx;
      }
      
      .team-icon {
        width: 76rpx;
        height: 60rpx;
        margin-right: 6rpx;
      }
      
      .heartbeat-icon {
        width: 76rpx;
        height: 60rpx;
        margin-right: 6rpx;
        animation: pulse 1.5s ease-in-out infinite;
      }
    }
    
    .progress-container {
      display: flex;
      align-items: center;
      margin-top: 16rpx;
      
      .progress-bar {
        flex: 1;
        height: 10rpx;
        background-color: #eeeeee;
        border-radius: 5rpx;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background-color: #2664ec;
          border-radius: 5rpx;
        }
      }
      
      .progress-text {
        margin-left: 10rpx;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.stat-card, .trend-card {
  margin: 35rpx;
  background-color: #fff;
  border-radius: 30rpx;
  padding: 25rpx 40rpx;
  box-shadow: 0 2rpx 7rpx rgba(0, 0, 0, 0.15);
  
  .card-title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    color: #333;
    text-align: center;
    
    &.align-left {
      text-align: left;
    }
  }
}

.stat-grid {
  display: flex;
  flex-wrap: wrap;
  
  .stat-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;
    
    .stat-icon {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 16rpx;
      
      &.bg-green {
        background-color: rgba(7, 193, 96, 0.2);
      }
      
      &.bg-yellow {
        background-color: rgba(255, 153, 0, 0.2);
      }
      
      &.bg-black {
        background-color: rgba(0, 0, 0, 0.2);
      }
      
      &.bg-red {
        background-color: rgba(250, 81, 81, 0.2);
      }
    }
    
    .stat-number {
      font-size: 34rpx;
      font-weight: normal;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.chart-container {
  height: 500rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .custom-chart {
    width: 100%;
    height: 100%;
  }
}
</style> 