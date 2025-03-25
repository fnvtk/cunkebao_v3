<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="title">我的</view>
      <view class="header-icons">
        <u-icon name="setting" size="45" color="#000000" class="icon-setting" @click="goToSetting"></u-icon>
        <u-icon name="bell" size="50" color="#000000" class="icon-bell" @click="goToNotification"></u-icon>
      </view>
    </view>
    
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrap">
        <template v-if="userInfo.avatar">
          <image class="avatar" :src="userInfo.avatar"></image>
        </template>
        <template v-else>
          <view class="avatar-icon">
            <u-icon name="account-fill" size="60" color="#4080ff"></u-icon>
          </view>
        </template>
      </view>
      <view class="user-info">
        <view class="username">卡若</view>
        <view class="account">账号: 84675209</view>
        <view class="edit-profile-btn" @click="editProfile">
          编辑资料
        </view>
      </view>
    </view>
    
    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pages/device/index')">
        <view class="menu-left">
          <text class="menu-title">设备管理</text>
        </view>
        <u-icon name="arrow-right" size="30" color="#9fa6b1"></u-icon>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/wechat/index')">
        <view class="menu-left">
          <text class="menu-title">微信号管理</text>
        </view>
        <u-icon name="arrow-right" size="30" color="#9fa6b1"></u-icon>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/traffic/index')">
        <view class="menu-left">
          <text class="menu-title">流量池</text>
        </view>
        <u-icon name="arrow-right" size="30" color="#9fa6b1"></u-icon>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/content/index')">
        <view class="menu-left">
          <text class="menu-title">内容库</text>
        </view>
        <u-icon name="arrow-right" size="30" color="#9fa6b1"></u-icon>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout">
      <image src="/static/images/icons/logout.svg" class="logout-icon"></image>
      <text class="logout-text">退出登录</text>
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
      userInfo: {
        avatar: null,
        username: '卡若',
        account: '84675209'
      }
    }
  },
  onLoad() {
    // 获取用户信息
    this.getUserInfo();
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      // 这里可以添加获取用户信息的API调用
      console.log('获取用户信息');
      // 示例数据，实际应从API获取
      this.userInfo = {
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&auto=format&fit=crop',
        username: '卡若',
        account: '84675209'
      };
    },
    
    // 跳转到设置页面
    goToSetting() {
      uni.navigateTo({
        url: '/pages/setting/index'
      });
    },
    
    // 跳转到通知页面
    goToNotification() {
      uni.navigateTo({
        url: '/pages/notification/index'
      });
    },
    
    // 编辑个人资料
    editProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      });
    },
    
    // 页面导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
      });
    },
    
    // 处理退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态
            // uni.removeStorageSync('token');
            // uni.removeStorageSync('userInfo');
            
            // 跳转到登录页面
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 90vh;
  background-color: #f9fafb;
  position: relative;
  padding-top: 46rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #e9e9e9;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  
  .title {
    font-size: 40rpx;
  }
  
  .header-icons {
    display: flex;
    align-items: center;
    
    .icon-setting {
      margin-right: 40rpx;
    }
  }
}

.user-card {
  margin: 35rpx;
  margin-top: 120rpx;
  background-color: #fff;
  border-radius: 35rpx;
  padding: 50rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .avatar-wrap {
    width: 180rpx;
    height: 180rpx;
    margin-right: 30rpx;
    
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    
    .avatar-icon {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #f0f5ff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  .user-info {
    flex: 1;
    
    .username {
      font-size: 45rpx;
      font-weight: bold;
      color: #2664ec;
      margin-bottom: 4rpx;
    }
    
    .account {
      font-size: 32rpx;
      color: #6b7280;
      margin-bottom: 10rpx;
    }
    
    .edit-profile-btn {
      display: inline-block;
      padding: 10rpx 25rpx;
      background-color: #f5f5f5;
      border-radius: 30rpx;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.menu-list {
  margin: 35rpx;
  background-color: #fff;
  border-radius: 35rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 2rpx solid #e9e9e9;
    
    &:last-child {
      border-bottom: none;
    }
    
    .menu-left {
      display: flex;
      align-items: center;
      
      .menu-title {
        font-size: 32rpx;
        color: #333;
      }
    }
  }
}

.logout-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 60rpx auto;
  width: 200rpx;
  
  .logout-icon {
    width: 42rpx;
    height: 42rpx;
    margin-right: 10rpx;
  }
  
  .logout-text {
    font-size: 32rpx;
    color: #ff3c2a;
  }
}
</style> 