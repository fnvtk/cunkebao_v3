<template>
  <view class="wechat-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">微信号</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input">
        <u-search
          v-model="searchKeyword"
          placeholder="搜索微信号/昵称"
          :showAction="false"
          shape="round"
          :clearabled="true"
          height="70"
          bgColor="#f4f4f4"
        ></u-search>
      </view>
      <view class="filter-icon">
        <u-icon name="filter" size="36" color="#000"></u-icon>
      </view>
      <view class="refresh-icon">
        <u-icon name="reload" size="36" color="#000"></u-icon>
      </view>
    </view>
    
    <!-- 微信号列表 -->
    <view class="wechat-list">
      <!-- 微信号项 1 -->
      <view class="wechat-item" @click="goToDetail(wechatAccounts[0])">
        <view class="wechat-avatar">
          <image src="/static/images/avatar.png" mode="aspectFill" class="avatar-img"></image>
        </view>
        <view class="wechat-info">
          <view class="wechat-header">
            <view class="wechat-name">卡若-25vig</view>
            <view class="wechat-status">
              <text class="status-tag status-running">运营</text>
            </view>
          </view>
          <view class="wechat-id">微信号：wxid_8evmgz0y</view>
          <view class="friends-info">
            <text class="friends-count">好友数量：6095</text>
            <text class="friends-added">今日新增：<text class="added-count">+7</text></text>
          </view>
          <view class="daily-limit">
            <text class="limit-text">今日可添加：8</text>
            <view class="limit-progress">
              <view class="progress-bg"></view>
              <view class="progress-value" style="width: 35%;"></view>
            </view>
            <text class="limit-count">7/20</text>
          </view>
          <view class="device-info">
            <text class="device-label">所属设备：</text>
            <text class="device-value">设备1</text>
            <text class="last-active-label">最后活跃：</text>
            <text class="last-active-value">2025/3/26 12:25:10</text>
          </view>
        </view>
        <view class="wechat-action" @click.stop="transferFriends(wechatAccounts[0].wechatId)">
          <view class="transfer-btn">
            <u-icon name="swap-right" size="28" color="#333"></u-icon>
            <text>好友转移</text>
          </view>
        </view>
      </view>
      
      <!-- 微信号项 2 -->
      <view class="wechat-item" @click="goToDetail(wechatAccounts[1])">
        <view class="wechat-avatar">
          <image src="/static/images/avatar.png" mode="aspectFill" class="avatar-img"></image>
        </view>
        <view class="wechat-info">
          <view class="wechat-header">
            <view class="wechat-name">卡若-zok7e</view>
            <view class="wechat-status">
              <text class="status-tag status-normal">正常</text>
            </view>
          </view>
          <view class="wechat-id">微信号：wxid_7mlqr91i</view>
          <view class="friends-info">
            <text class="friends-count">好友数量：4149</text>
            <text class="friends-added">今日新增：<text class="added-count">+11</text></text>
          </view>
          <view class="daily-limit">
            <text class="limit-text">今日可添加：5</text>
            <view class="limit-progress">
              <view class="progress-bg"></view>
              <view class="progress-value" style="width: 55%;"></view>
            </view>
            <text class="limit-count">11/20</text>
          </view>
          <view class="device-info">
            <text class="device-label">所属设备：</text>
            <text class="device-value">设备1</text>
            <text class="last-active-label">最后活跃：</text>
            <text class="last-active-value">2025/3/26 11:30:34</text>
          </view>
        </view>
        <view class="wechat-action" @click.stop="transferFriends(wechatAccounts[1].wechatId)">
          <view class="transfer-btn">
            <u-icon name="swap-right" size="28" color="#333"></u-icon>
            <text>好友转移</text>
          </view>
        </view>
      </view>
      
      <!-- 微信号项 3 -->
      <view class="wechat-item" @click="goToDetail(wechatAccounts[2])">
        <view class="wechat-avatar">
          <image src="/static/images/avatar.png" mode="aspectFill" class="avatar-img"></image>
        </view>
        <view class="wechat-info">
          <view class="wechat-header">
            <view class="wechat-name">卡若-ip9ob</view>
            <view class="wechat-status">
              <text class="status-tag status-normal">正常</text>
            </view>
          </view>
          <view class="wechat-id">微信号：wxid_jzfn1nmr</view>
          <view class="friends-info">
            <text class="friends-count">好友数量：4131</text>
            <text class="friends-added">今日新增：<text class="added-count">+11</text></text>
          </view>
          <view class="daily-limit">
            <text class="limit-text">今日可添加：11</text>
            <view class="limit-progress">
              <view class="progress-bg"></view>
              <view class="progress-value" style="width: 55%;"></view>
            </view>
            <text class="limit-count">11/20</text>
          </view>
          <view class="device-info">
            <text class="device-label">所属设备：</text>
            <text class="device-value">设备1</text>
            <text class="last-active-label">最后活跃：</text>
            <text class="last-active-value">2025/3/26 10:45:22</text>
          </view>
        </view>
        <view class="wechat-action" @click.stop="transferFriends(wechatAccounts[2].wechatId)">
          <view class="transfer-btn">
            <u-icon name="swap-right" size="28" color="#333"></u-icon>
            <text>好友转移</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="profile"></CustomTabBar>
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
      searchKeyword: '',
      wechatAccounts: [
        {
          name: '卡若-25vig',
          status: '运营',
          wechatId: 'wxid_8evmgz0y',
          friendsCount: 6095,
          todayAdded: 7,
          todayLimit: 8,
          maxLimit: 20,
          device: '设备1',
          lastActive: '2025/3/26 12:25:10'
        },
        {
          name: '卡若-zok7e',
          status: '正常',
          wechatId: 'wxid_7mlqr91i',
          friendsCount: 4149,
          todayAdded: 11,
          todayLimit: 5,
          maxLimit: 20,
          device: '设备1',
          lastActive: '2025/3/26 11:30:34'
        },
        {
          name: '卡若-ip9ob',
          status: '正常',
          wechatId: 'wxid_jzfn1nmr',
          friendsCount: 4131,
          todayAdded: 11,
          todayLimit: 11,
          maxLimit: 20,
          device: '设备1',
          lastActive: '2025/3/26 10:45:22'
        }
      ]
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 好友转移
    transferFriends(wechatId) {
      uni.showToast({
        title: `${wechatId} 好友转移功能即将上线`,
        icon: 'none',
        duration: 2000
      });
    },

    // 跳转到详情页
    goToDetail(account) {
      uni.navigateTo({
        url: `/pages/wechat/detail?id=${account.wechatId}`
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.wechat-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 150rpx; /* 为底部导航栏预留空间 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  
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
    font-size: 38rpx;
    font-weight: 600;
    margin-left: -60rpx; /* 使标题居中 */
    flex: 1;
    text-align: center;
  }
  
  .header-right {
    width: 60rpx;
  }
}

.search-box {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .search-input {
    flex: 1;
  }
  
  .filter-icon, .refresh-icon {
    margin-left: 20rpx;
    padding: 10rpx;
  }
}

.wechat-list {
  padding: 20rpx 30rpx;
  
  .wechat-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    position: relative;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    
    .wechat-avatar {
      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;
      
      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    
    .wechat-info {
      flex: 1;
      
      .wechat-header {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .wechat-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
          margin-right: 16rpx;
        }
        
        .wechat-status {
          .status-tag {
            font-size: 24rpx;
            padding: 2rpx 12rpx;
            border-radius: 6rpx;
            
            &.status-running {
              background-color: #ff6b6b;
              color: #fff;
            }
            
            &.status-normal {
              background-color: #4cd964;
              color: #fff;
            }
          }
        }
      }
      
      .wechat-id {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 8rpx;
      }
      
      .friends-info {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 8rpx;
        
        .friends-count {
          margin-right: 20rpx;
        }
        
        .added-count {
          color: #4cd964;
        }
      }
      
      .daily-limit {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
        
        .limit-text {
          width: 200rpx;
        }
        
        .limit-progress {
          flex: 1;
          position: relative;
          height: 10rpx;
          margin: 0 16rpx;
          
          .progress-bg {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: #ebeef5;
            border-radius: 10rpx;
          }
          
          .progress-value {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background-color: #4080ff;
            border-radius: 10rpx;
          }
        }
        
        .limit-count {
          width: 100rpx;
          text-align: right;
        }
      }
      
      .device-info {
        font-size: 26rpx;
        color: #999;
        
        .device-label, .last-active-label {
          margin-right: 8rpx;
        }
        
        .device-value {
          margin-right: 20rpx;
        }
      }
    }
    
    .wechat-action {
      display: flex;
      align-items: center;
      
      .transfer-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style> 