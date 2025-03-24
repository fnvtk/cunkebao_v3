<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="title">我的</view>
      <view class="header-icons">
        <u-icon name="setting" size="26" class="icon-setting" @click="goToSetting"></u-icon>
        <u-icon name="bell" size="26" class="icon-bell" @click="goToNotification"></u-icon>
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
      </view>
      <view class="edit-profile-btn" @click="editProfile">
        编辑资料
      </view>
    </view>
    
    <!-- 功能菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pages/device/index')">
        <view class="menu-left">
          <u-icon name="setting" size="28" color="#4080ff" class="menu-icon"></u-icon>
          <text class="menu-title">设备管理</text>
        </view>
        <u-icon name="arrow-right" size="20" color="#c8c9cc"></u-icon>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/wechat/index')">
        <view class="menu-left">
          <u-icon name="weixin-fill" size="28" color="#07c160" class="menu-icon"></u-icon>
          <text class="menu-title">微信号管理</text>
        </view>
        <u-icon name="arrow-right" size="20" color="#c8c9cc"></u-icon>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/traffic/index')">
        <view class="menu-left">
          <u-icon name="wifi" size="28" color="#fa3534" class="menu-icon"></u-icon>
          <text class="menu-title">流量池</text>
        </view>
        <u-icon name="arrow-right" size="20" color="#c8c9cc"></u-icon>
      </view>
      
      <view class="menu-item" @click="navigateTo('/pages/content/index')">
        <view class="menu-left">
          <u-icon name="folder" size="28" color="#ff9900" class="menu-icon"></u-icon>
          <text class="menu-title">内容库</text>
        </view>
        <u-icon name="arrow-right" size="20" color="#c8c9cc"></u-icon>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout">
      <u-icon name="arrow-left" color="#ff3c2a" size="18"></u-icon>
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
        avatar: null, // 设置为 null，使用默认图标
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
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  padding-bottom: 150rpx; /* 为底部导航栏预留空间，从110rpx更新为150rpx */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  background-color: #fff;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
  
  .header-icons {
    display: flex;
    align-items: center;
    
    .icon-setting {
      margin-right: 30rpx;
    }
  }
}

.user-card {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .avatar-wrap {
    width: 120rpx;
    height: 120rpx;
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
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .account {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .edit-profile-btn {
    padding: 12rpx 30rpx;
    background-color: #f5f5f5;
    border-radius: 30rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.menu-list {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 2rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .menu-left {
      display: flex;
      align-items: center;
      
      .menu-icon {
        margin-right: 20rpx;
      }
      
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
  
  .logout-text {
    font-size: 32rpx;
    color: #ff3c2a;
    margin-left: 10rpx;
  }
}
</style> 