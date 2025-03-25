<template>
  <view class="scenarios-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">场景获客</view>
      <view class="header-icons">
        <u-icon name="plus" size="30" color="#fff" class="icon-add" @click="createNewPlan"></u-icon>
        <text>新建计划</text>
      </view>
    </view>
    
    <!-- 获客渠道卡片列表 -->
    <view class="channel-grid">
      <!-- 抖音获客 -->
      <view class="channel-card" @click="navigateToDetail('douyin')">
        <view class="channel-icon bg-black">
          <u-icon name="play-right" size="28" color="#ffffff"></u-icon>
        </view>
        <view class="channel-name">抖音获客</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">156</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+12.5%</text>
          </view>
        </view>
      </view>
      
      <!-- 小红书获客 -->
      <view class="channel-card" @click="navigateToDetail('xiaohongshu')">
        <view class="channel-icon bg-red">
          <u-icon name="heart" size="28" color="#ffffff"></u-icon>
        </view>
        <view class="channel-name">小红书获客</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">89</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+8.3%</text>
          </view>
        </view>
      </view>
      
      <!-- 电话获客 -->
      <view class="channel-card" @click="navigateToDetail('phone')">
        <view class="channel-icon bg-blue">
          <u-icon name="phone" size="28" color="#ffffff"></u-icon>
        </view>
        <view class="channel-name">电话获客</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">42</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+15.8%</text>
          </view>
        </view>
      </view>
      
      <!-- 公众号获客 -->
      <view class="channel-card" @click="navigateToDetail('official')">
        <view class="channel-icon bg-green">
          <u-icon name="integral-fill" size="28" color="#ffffff"></u-icon>
        </view>
        <view class="channel-name">公众号获客</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">234</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+15.7%</text>
          </view>
        </view>
      </view>
      
      <!-- 海报获客 -->
      <view class="channel-card" @click="navigateToDetail('poster')">
        <view class="channel-icon bg-yellow">
          <u-icon name="coupon" size="28" color="#ffffff"></u-icon>
        </view>
        <view class="channel-name">海报获客</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">167</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+10.2%</text>
          </view>
        </view>
      </view>
      
      <!-- 微信群获客 -->
      <view class="channel-card" @click="navigateToDetail('wechat-group')">
        <view class="channel-icon bg-wechat">
          <u-icon name="weixin-fill" size="28" color="#ffffff"></u-icon>
        </view>
        <view class="channel-name">微信群获客</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">145</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+11.2%</text>
          </view>
        </view>
      </view>
      
      <!-- AI智能获客 版块标题 -->
      <view class="section-title">
        <image src="/static/images/icons/robot.svg" class="robot-icon"></image>
        <text>AI智能获客</text>
        <text class="beta-tag">Beta</text>
      </view>
      
      <!-- AI智能加友 -->
      <view class="channel-card channel-card-xw" @click="navigateToDetail('ai-friend')">
        <view class="channel-icon">
          <image src="/static/images/icons/aipa.svg" mode="aspectFit" class="ai-icon"></image>
        </view>
        <view class="channel-name">AI智能加友</view>
        <view class="channel-desc">智能分析目标用户画像，自动筛选优质客户</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">245</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+18.5%</text>
          </view>
        </view>
      </view>
      
      <!-- AI智能群控 -->
      <view class="channel-card channel-card-xw" @click="navigateToDetail('ai-group')">
        <view class="channel-icon">
          <image src="/static/images/icons/aipa.svg" mode="aspectFit" class="ai-icon"></image>
        </view>
        <view class="channel-name">AI智能群控</view>
        <view class="channel-desc">一键管理多个群聊，自动回复，数据分析</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">128</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+9.7%</text>
          </view>
        </view>
      </view>
      
      <!-- AI场景转化 -->
      <view class="channel-card channel-card-xw" @click="navigateToDetail('ai-convert')">
        <view class="channel-icon">
          <image src="/static/images/icons/aipa.svg" mode="aspectFit" class="ai-icon"></image>
        </view>
        <view class="channel-name">AI场景转化</view>
        <view class="channel-desc">多场景智能营销，提升获客转化效果</view>
        <view class="channel-data">
          <view class="data-item">
            <view class="data-label">今日：</view>
            <view class="data-value">134</view>
          </view>
          <view class="data-trend up">
            <image src="/static/images/icons/trend-up.svg" style="width: 32rpx; height: 32rpx;"></image>
            <text>+14.3%</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="market"></CustomTabBar>
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
      channels: [
        { id: 'douyin', name: '抖音获客', icon: 'play-right', bgColor: 'black', count: 156, increase: '+12.5%' },
        { id: 'xiaohongshu', name: '小红书获客', icon: 'heart', bgColor: 'red', count: 89, increase: '+8.3%' },
        { id: 'phone', name: '电话获客', icon: 'phone', bgColor: 'blue', count: 42, increase: '+15.8%' },
        { id: 'official', name: '公众号获客', icon: 'integral-fill', bgColor: 'green', count: 234, increase: '+15.7%' },
        { id: 'poster', name: '海报获客', icon: 'coupon', bgColor: 'yellow', count: 167, increase: '+10.2%' },
        { id: 'wechat-group', name: '微信群获客', icon: 'weixin-fill', bgColor: 'wechat', count: 145, increase: '+11.2%' },
        { 
          id: 'ai-friend', 
          name: 'AI智能加友', 
          icon: 'star', 
          bgColor: 'blue', 
          count: 245, 
          increase: '+18.5%',
          desc: '智能分析目标用户画像，自动筛选优质客户',
          isAI: true
        },
        { 
          id: 'ai-group', 
          name: 'AI群引流', 
          icon: 'star', 
          bgColor: 'blue', 
          count: 178, 
          increase: '+15.2%',
          desc: '智能推聊互动，提高群活跃度和转化率',
          isAI: true
        },
        { 
          id: 'ai-convert', 
          name: 'AI场景转化', 
          icon: 'star', 
          bgColor: 'blue', 
          count: 134, 
          increase: '+14.3%',
          desc: '多场景智能营销，提升获客转化效果',
          isAI: true
        }
      ]
    }
  },
  onLoad() {
    // 页面加载时获取数据
    this.loadData();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 创建新的获客计划
    createNewPlan() {
      uni.navigateTo({
        url: '/pages/scenarios/create'
      });
    },
    
    // 导航到详情页面
    navigateToDetail(channelId) {
      uni.navigateTo({
        url: `/pages/scenarios/detail?id=${channelId}`
      });
    },
    
    // 加载数据
    loadData() {
      // 这里可以添加API调用获取实际数据
      console.log('加载场景获客数据');
      // 示例数据已在data中预设
    }
  }
}
</script>

<style lang="scss" scoped>
.scenarios-container {
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  
  .back-icon {
    width: 60rpx;
    color: #000;
    padding: 10rpx;
    border-radius: 50%;
    
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  .title {
    position: absolute;
    font-size: 40rpx;
    font-weight: bold;
    color: #2563EB;
    float: left;
    margin-left: 70rpx;
  }
  
  .header-icons {
    display: flex;
    align-items: center;
    background-color: #2563EB;
    border-radius: 20rpx;
    padding: 15rpx 30rpx;
    color: #fff;
    text-indent: 15rpx;
  }
}

.channel-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 15rpx;
  margin-top: 130rpx;  // 添加顶部边距，为固定header留出空间
  
  .channel-card {
    width: calc(50% - 30rpx);
    margin: 15rpx;
    background-color: #fff;
    border-radius: 35rpx;
    padding: 35rpx 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    
    // AI智能获客栏目下的卡片特殊背景色
    .section-title + & {
      background-color: #F8FBFF;
    }
    
    .channel-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 15rpx;
      
      &.bg-black {
        background-color: #000000;
      }
      
      &.bg-red {
        background-color: #fa5151;
      }
      
      &.bg-blue {
        background-color: #4080ff;
      }
      
      &.bg-green {
        background-color: #07c160;
      }
      
      &.bg-yellow {
        background-color: #ff9900;
      }
      
      &.bg-wechat {
        background-color: #07c160;
      }
      
      &.bg-purple {
        background-color: #8a2be2;
      }
    }
    
    .channel-name {
      font-size: 30rpx;
      color: #2563EB;
      margin: 15rpx;
    }
    
    .channel-desc {
      font-size: 24rpx;
      color: #666;
      text-align: center;
      margin-bottom: 15rpx;
      height: 80rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .channel-data {
      width: 100%;
      padding: 0 10rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .data-item {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
        
        .data-label {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #999;
          
          &::before {
            content: '';
            display: inline-block;
            width: 36rpx;
            height: 36rpx;
            margin-right: 6rpx;
            background: url('/static/images/icons/user-label.svg') no-repeat center/contain;
          }
        }
        
        .data-value {
          font-size: 38rpx;
          font-weight: bold;
          color: #333;
        }
      }
      
      .data-trend {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        text-indent: 15rpx;
        
        &.up {
          color: #2fc25b;
        }
        
        &.down {
          color: #fa3534;
        }
      }
    }
  }

  .channel-card-xw {
    background-color: #F8FBFF !important;
    border: 6rpx solid #DBEAFE !important;

    .channel-icon {
      background: none !important;
      
      .ai-icon {
        width: 90rpx;
        height: 90rpx;
      }
    }
  }
}

.section-title {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx 15rpx;
  margin: 15rpx 7.5rpx 5rpx;
  
  .robot-icon {
    width: 56rpx;
    height: 56rpx;
    margin-right: 10rpx;
  }
  
  text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .beta-tag {
    font-size: 25rpx;
    color: #4080ff;
    background-color: #ecf5ff;
    padding: 5rpx 20rpx;
    border-radius: 20rpx;
    margin-left: 20rpx;
  }
}
</style> 