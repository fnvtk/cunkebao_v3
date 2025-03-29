<template>
  <view class="work-container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">工作台</text>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stats-card">
        <view class="stats-label">总任务数</view>
        <view class="stats-value blue">42</view>
        <view class="progress-bar">
          <view class="progress-filled blue" style="width: 70%;"></view>
        </view>
        <view class="stats-detail">
          <text>进行中：12 / 已完成：30</text>
        </view>
      </view>
      
      <view class="stats-card light-green">
        <view class="stats-label">今日任务</view>
        <view class="stats-value green">12</view>
        <view class="trend-info">
          <u-icon name="arrow-up" color="#2fc25b" size="20"></u-icon>
          <text class="trend-text">活跃度 98%</text>
        </view>
      </view>
    </view>
    
    <!-- 常用功能 -->
    <view class="section-title">常用功能</view>
    
    <view class="function-grid">
      <!-- 流量分发 -->
      <view class="function-card" @click="navigateTo('/pages/traffic/index')">
        <view class="icon-wrapper light-green">
          <text class="icon">$</text>
        </view>
        <view class="function-content">
          <view class="function-name">流量分发</view>
          <view class="function-desc">定义你的流量价格</view>
        </view>
      </view>
      
      <!-- 自动点赞 -->
      <view class="function-card" @click="handleAutoLike">
        <view class="icon-wrapper light-blue">
          <u-icon name="thumb-up" color="#4080ff" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">自动点赞</view>
          <view class="function-desc">定时对好友朋友圈点赞</view>
        </view>
      </view>
      
      <!-- 朋友圈同步 -->
      <view class="function-card" @click="handleMomentSync">
        <view class="icon-wrapper light-purple">
          <u-icon name="reload" color="#7551ff" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">朋友圈同步</view>
          <view class="function-desc">多微信朋友圈同步发布</view>
        </view>
      </view>
      
      <!-- 微信号管理 -->
      <view class="function-card" @click="navigateTo('/pages/wechat/index')">
        <view class="icon-wrapper light-green">
          <u-icon name="weixin-fill" color="#48d2a0" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">微信号管理</view>
          <view class="function-desc">管理已绑定的微信账号</view>
        </view>
      </view>
      
      <!-- 群消息推送 -->
      <view class="function-card" @click="handleGroupMessage">
        <view class="icon-wrapper light-orange">
          <u-icon name="chat" color="#ff9e45" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">群消息推送</view>
          <view class="function-desc">批量向群内自动发消息</view>
        </view>
      </view>
      
      <!-- 自动建群 -->
      <view class="function-card" @click="handleAutoGroup">
        <view class="icon-wrapper light-green">
          <u-icon name="team" color="#48d2a0" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">自动建群</view>
          <view class="function-desc">智能匹分好友建群</view>
        </view>
      </view>
      
      <!-- AI话术助手 -->
      <view class="function-card" @click="handleAIChatAssistant">
        <view class="icon-wrapper light-blue">
          <u-icon name="tv" color="#4080ff" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">AI话术助手</view>
          <view class="function-desc">智能回复，提高互动质量</view>
        </view>
      </view>
    </view>
    
    <!-- AI智能助手 -->
    <view class="section-title">AI 智能助手</view>
    
    <view class="function-grid">
      <!-- AI数据分析 -->
      <view class="function-card" @click="handleAIDataAnalysis">
        <view class="icon-wrapper light-blue">
          <u-icon name="tv" color="#4080ff" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">AI数据分析</view>
          <view class="function-desc">智能分析客户行为特征</view>
        </view>
      </view>
      
      <!-- AI策略优化 -->
      <view class="function-card" @click="handleAIStrategy">
        <view class="icon-wrapper light-cyan">
          <u-icon name="tv" color="#36cfc9" size="28"></u-icon>
        </view>
        <view class="function-content">
          <view class="function-name">AI策略优化</view>
          <view class="function-desc">智能优化获客策略</view>
        </view>
      </view>
    </view>
    
    <!-- 内容库卡片 -->
    <view class="func-card" @click="goToTraffic">
      <view class="func-card-icon traffic-icon">
        <u-icon name="man-add-fill" color="#fff" size="44"></u-icon>
      </view>
      <view class="func-card-info">
        <text class="func-card-title">流量池</text>
        <text class="func-card-desc">管理您的流量用户</text>
      </view>
      <view class="func-card-arrow">
        <u-icon name="arrow-right" color="#ccc" size="28"></u-icon>
      </view>
    </view>
    
    <view class="func-card" @click="goToContent">
      <view class="func-card-icon content-icon">
        <u-icon name="folder" color="#fff" size="44"></u-icon>
      </view>
      <view class="func-card-info">
        <text class="func-card-title">内容库</text>
        <text class="func-card-desc">管理微信内容素材</text>
      </view>
      <view class="func-card-arrow">
        <u-icon name="arrow-right" color="#ccc" size="28"></u-icon>
      </view>
    </view>
    
    <!-- 底部TabBar -->
    <CustomTabBar active="work"></CustomTabBar>
  </view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue'

export default {
  components: {
    CustomTabBar
  },
  data() {
    return {
      // 将来可从API获取的数据
      totalTasks: 42,
      completedTasks: 30,
      todayTasks: 12,
      activeRate: 98
    }
  },
  methods: {
    // 页面导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
      });
    },
    
    // 自动点赞功能处理
    handleAutoLike() {
      // 由于尚未实现该页面，我们显示一个toast提示
      this.showFunctionMessage('自动点赞');
    },
    
    // 朋友圈同步功能处理
    handleMomentSync() {
      this.showFunctionMessage('朋友圈同步');
    },
    
    // 群消息推送功能处理
    handleGroupMessage() {
      this.showFunctionMessage('群消息推送');
    },
    
    // 自动建群功能处理
    handleAutoGroup() {
      this.showFunctionMessage('自动建群');
    },
    
    // AI话术助手功能处理
    handleAIChatAssistant() {
      this.showFunctionMessage('AI话术助手');
    },
    
    // AI数据分析功能处理
    handleAIDataAnalysis() {
      this.showFunctionMessage('AI数据分析');
    },
    
    // AI策略优化功能处理
    handleAIStrategy() {
      this.showFunctionMessage('AI策略优化');
    },
    
    // 显示功能消息
    showFunctionMessage(functionName) {
      uni.showToast({
        title: `${functionName}功能即将上线`,
        icon: 'none',
        duration: 2000
      });
    },
    
    // 跳转到流量池页面
    goToTraffic() {
      uni.navigateTo({
        url: '/pages/traffic/index'
      });
    },
    
    // 跳转到内容库页面
    goToContent() {
      uni.navigateTo({
        url: '/pages/content/index'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.work-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 0 30rpx 150rpx;
}

.header {
  padding: 30rpx 0 20rpx;
  
  .title {
    font-size: 42rpx;
    font-weight: 600;
    color: #000;
  }
}

.stats-cards {
  display: flex;
  margin: 20rpx 0 30rpx;
  
  .stats-card {
    flex: 1;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
    margin-right: 15rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    
    &:last-child {
      margin-right: 0;
      background-color: #f5fffa;
    }
    
    .stats-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    
    .stats-value {
      font-size: 50rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      
      &.blue {
        color: #4080ff;
      }
      
      &.green {
        color: #2fc25b;
      }
    }
    
    .progress-bar {
      height: 10rpx;
      background-color: #f0f0f0;
      border-radius: 10rpx;
      overflow: hidden;
      margin-bottom: 10rpx;
      
      .progress-filled {
        height: 100%;
        background-color: #4080ff;
        border-radius: 10rpx;
        
        &.blue {
          background-color: #4080ff;
        }
      }
    }
    
    .stats-detail {
      font-size: 24rpx;
      color: #999;
    }
    
    .trend-info {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      
      .trend-text {
        font-size: 24rpx;
        color: #2fc25b;
        margin-left: 6rpx;
      }
    }
  }
}

.section-title {
  font-size: 34rpx;
  font-weight: 500;
  color: #000;
  margin: 30rpx 0 20rpx;
}

.function-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
  
  .function-card {
    width: calc(50% - 20rpx);
    background-color: #fff;
    border-radius: 16rpx;
    margin: 0 10rpx 20rpx;
    padding: 24rpx 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    
    .icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 16rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 16rpx;
      
      &.light-green {
        background-color: rgba(47, 194, 91, 0.1);
      }
      
      &.light-pink {
        background-color: rgba(255, 87, 122, 0.1);
      }
      
      &.light-purple {
        background-color: rgba(112, 102, 224, 0.1);
      }
      
      &.light-orange {
        background-color: rgba(255, 153, 0, 0.1);
      }
      
      &.light-blue {
        background-color: rgba(64, 128, 255, 0.1);
      }
      
      &.light-cyan {
        background-color: rgba(54, 207, 201, 0.1);
      }
      
      .icon {
        font-size: 34rpx;
        color: #2fc25b;
        font-weight: bold;
      }
    }
    
    .function-content {
      flex: 1;
      
      .function-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .function-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.func-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  
  .func-card-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 16rpx;
    
    &.traffic-icon {
      background-color: #4080ff;
    }
    
    &.content-icon {
      background-color: #2fc25b;
    }
  }
  
  .func-card-info {
    flex: 1;
    
    .func-card-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .func-card-desc {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .func-card-arrow {
    width: 28rpx;
    height: 28rpx;
    margin-left: 16rpx;
  }
}
</style> 