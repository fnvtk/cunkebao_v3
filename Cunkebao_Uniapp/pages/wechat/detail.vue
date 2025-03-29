<template>
  <view class="detail-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">账号详情</view>
      <view class="header-right"></view>
    </view>
    
    <!-- 账号信息卡片 -->
    <view class="account-card">
      <view class="avatar-section">
        <image :src="accountInfo.avatar || '/static/images/avatar.png'" mode="aspectFill" class="avatar-img"></image>
      </view>
      <view class="basic-info">
        <view class="name-status">
          <text class="account-name">{{accountInfo.name}}</text>
          <text class="status-tag" :class="getStatusClass(accountInfo.status)">{{accountInfo.status}}</text>
        </view>
        <view class="account-id">微信号：{{accountInfo.wechatId}}</view>
        <view class="action-buttons">
          <view class="action-btn device-btn" @click="goToDeviceDetail">
            <u-icon name="setting" size="28" color="#333"></u-icon>
            <text>设备{{accountInfo.deviceNumber}}</text>
          </view>
          <view class="action-btn friends-btn" @click="showTransferModal">
            <u-icon name="account" size="28" color="#333"></u-icon>
            <text>好友转移</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 好友转移模态框 -->
    <view class="transfer-modal" v-if="showTransferModalFlag">
      <view class="modal-mask" @click="hideTransferModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">好友转移确认</text>
          <view class="close-btn" @click="hideTransferModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="transfer-title">即将导出该微信号的好友列表，用于创建新的获客计划</view>
          
          <view class="account-info-box">
            <view class="account-avatar">
              <image :src="accountInfo.avatar || '/static/images/avatar.png'" mode="aspectFill" class="avatar-small"></image>
            </view>
            <view class="account-detail">
              <text class="account-name-text">{{accountInfo.name}}</text>
              <text class="account-id-text">{{accountInfo.wechatId}}</text>
            </view>
          </view>
          
          <view class="transfer-tips">
            <view class="tip-item">
              <text class="dot">•</text>
              <text class="tip-text">将导出该账号下的所有好友信息</text>
            </view>
            <view class="tip-item">
              <text class="dot">•</text>
              <text class="tip-text">好友信息将用于创建新的订单获客计划</text>
            </view>
            <view class="tip-item">
              <text class="dot">•</text>
              <text class="tip-text">导出过程中请勿关闭页面</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <view class="cancel-btn" @click="hideTransferModal">取消</view>
          <view class="confirm-btn" @click="confirmTransfer">确认转移</view>
        </view>
      </view>
    </view>
    
    <!-- 标签栏 -->
    <view class="tab-section">
      <view class="tab-item" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
        <text>账号概览</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'friends' }" @click="activeTab = 'friends'">
        <text>好友列表 ({{accountInfo.friendsCount}})</text>
      </view>
    </view>
    
    <!-- 账号概览内容 -->
    <block v-if="activeTab === 'overview'">
      <!-- 年龄卡片 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="calendar" size="28" color="#666"></u-icon>
          <text class="card-title">账号年龄</text>
        </view>
        <view class="age-content">
          <view class="age-value">{{accountInfo.age}}</view>
          <view class="age-register">注册时间：{{accountInfo.registerDate}}</view>
        </view>
      </view>
      
      <!-- 活跃度卡片 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="chat" size="28" color="#666"></u-icon>
          <text class="card-title">活跃程度</text>
        </view>
        <view class="activity-content">
          <view class="activity-value">{{accountInfo.activityRate}}次/天</view>
          <view class="total-days">总聊天数：{{accountInfo.totalChatDays}}</view>
        </view>
      </view>
      
      <!-- 账号权重评估 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="star" size="28" color="#FFAD33"></u-icon>
          <text class="card-title">账号权重评估</text>
          <text class="score">{{accountInfo.score}} 分</text>
        </view>
        <view class="evaluate-content">
          <view class="evaluate-text">账号状态良好</view>
          
          <!-- 账号年龄评分 -->
          <view class="evaluate-item">
            <view class="item-header">
              <text class="item-name">账号年龄</text>
              <text class="item-percent">{{accountInfo.ageScore}}%</text>
            </view>
            <view class="progress-bar">
              <view class="progress-bg"></view>
              <view class="progress-value" :style="{width: accountInfo.ageScore + '%', backgroundColor: '#4080ff'}"></view>
            </view>
          </view>
          
          <!-- 活跃度评分 -->
          <view class="evaluate-item">
            <view class="item-header">
              <text class="item-name">活跃度</text>
              <text class="item-percent">{{accountInfo.activityScore}}%</text>
            </view>
            <view class="progress-bar">
              <view class="progress-bg"></view>
              <view class="progress-value" :style="{width: accountInfo.activityScore + '%', backgroundColor: '#4080ff'}"></view>
            </view>
          </view>
          
          <!-- 限制影响评分 -->
          <view class="evaluate-item">
            <view class="item-header">
              <text class="item-name">限制影响</text>
              <text class="item-percent">{{accountInfo.limitScore}}%</text>
            </view>
            <view class="progress-bar">
              <view class="progress-bg"></view>
              <view class="progress-value" :style="{width: accountInfo.limitScore + '%', backgroundColor: '#4080ff'}"></view>
            </view>
          </view>
          
          <!-- 实名认证评分 -->
          <view class="evaluate-item">
            <view class="item-header">
              <text class="item-name">实名认证</text>
              <text class="item-percent">{{accountInfo.verifyScore}}%</text>
            </view>
            <view class="progress-bar">
              <view class="progress-bg"></view>
              <view class="progress-value" :style="{width: accountInfo.verifyScore + '%', backgroundColor: '#4080ff'}"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 添加好友统计 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="account-add" size="28" color="#4080ff"></u-icon>
          <text class="card-title">添加好友统计</text>
          <u-icon name="info-circle" size="28" color="#999"></u-icon>
        </view>
        <view class="friends-stat-content">
          <view class="stat-row">
            <text class="stat-label">今日已添加</text>
            <text class="stat-value blue">{{accountInfo.todayAdded}}</text>
          </view>
          <view class="stat-row">
            <text class="stat-label">添加进度</text>
            <text class="stat-progress">{{accountInfo.todayAdded}}/{{accountInfo.dailyLimit}}</text>
          </view>
          <view class="progress-bar">
            <view class="progress-bg"></view>
            <view class="progress-value" :style="{width: (accountInfo.todayAdded / accountInfo.dailyLimit * 100) + '%', backgroundColor: '#4080ff'}"></view>
          </view>
          <view class="limit-tip">
            <text>根据当前账号权重({{accountInfo.score}}分)，每日最多可添加 {{accountInfo.dailyLimit}} 个好友</text>
          </view>
        </view>
      </view>
      
      <!-- 限制记录 -->
      <view class="info-card">
        <view class="card-header">
          <u-icon name="warning" size="28" color="#fa5151"></u-icon>
          <text class="card-title">限制记录</text>
          <text class="limit-count">共 {{accountInfo.limitRecords.length}} 次</text>
        </view>
        <view class="limit-records">
          <view class="limit-item" v-for="(record, index) in accountInfo.limitRecords" :key="index">
            <text class="limit-reason">{{record.reason}}</text>
            <text class="limit-date">{{record.date}}</text>
          </view>
        </view>
      </view>
    </block>
    
    <!-- 好友列表内容 -->
    <block v-if="activeTab === 'friends'">
      <view class="friends-list-container">
        <view class="search-filter">
          <u-search
            v-model="searchKeyword"
            placeholder="搜索好友"
            :showAction="false"
            shape="round"
            bgColor="#f4f4f4"
          ></u-search>
        </view>
        
        <view class="friends-list">
          <view class="empty-tip" v-if="filteredFriends.length === 0">
            <text>暂无好友数据</text>
          </view>
          <view class="friend-item" v-for="(friend, index) in filteredFriends" :key="index">
            <image :src="friend.avatar" mode="aspectFill" class="friend-avatar"></image>
            <view class="friend-info">
              <view class="friend-name">{{friend.name}}</view>
              <view class="friend-remark">备注：{{friend.remark || '无'}}</view>
            </view>
            <view class="friend-action">
              <view class="action-button">
                <u-icon name="chat" size="24" color="#4080ff"></u-icon>
                <text>聊天</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </block>
    
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
      id: '', // 微信账号ID
      activeTab: 'overview', // 当前激活的标签页：overview 或 friends
      searchKeyword: '', // 搜索关键词
      showTransferModalFlag: false, // 是否显示好友转移模态框
      accountInfo: {
        avatar: '/static/images/avatar.png',
        name: '卡若-25vig',
        status: '正常',
        wechatId: 'wxid_hahphr2h',
        deviceNumber: '1',
        friendsCount: 192,
        age: '2年8个月',
        registerDate: '2021-06-15',
        activityRate: '42',
        totalChatDays: '15,234',
        score: 85,
        ageScore: 90,
        activityScore: 85,
        limitScore: 80,
        verifyScore: 100,
        todayAdded: 12,
        dailyLimit: 17,
        limitRecords: [
          { reason: '添加好友过于频繁', date: '2024-02-25' },
          { reason: '营销内容违规', date: '2024-01-15' }
        ]
      },
      friends: [] // 好友列表
    }
  },
  computed: {
    // 过滤后的好友列表
    filteredFriends() {
      if (!this.searchKeyword) return this.friends;
      return this.friends.filter(friend => 
        friend.name.includes(this.searchKeyword) || 
        (friend.remark && friend.remark.includes(this.searchKeyword))
      );
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.loadAccountInfo();
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      if (status === '正常') return 'status-normal';
      if (status === '运营') return 'status-running';
      return '';
    },
    
    // 跳转到设备详情页
    goToDeviceDetail() {
      // 根据账号关联的设备编号跳转
      uni.navigateTo({
        url: `/pages/device/detail?id=${this.accountInfo.deviceNumber}`
      });
    },
    
    // 显示好友转移模态框
    showTransferModal() {
      this.showTransferModalFlag = true;
    },
    
    // 隐藏好友转移模态框
    hideTransferModal() {
      this.showTransferModalFlag = false;
    },
    
    // 确认好友转移
    confirmTransfer() {
      // 在实际应用中，这里应该调用API进行好友转移
      uni.showLoading({
        title: '转移中...'
      });
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '好友转移成功',
          icon: 'success'
        });
        this.hideTransferModal();
      }, 1500);
    },
    
    // 加载账号信息
    loadAccountInfo() {
      // 这里应该是API调用，现在使用模拟数据
      console.log(`加载账号信息: ${this.id}`);
      
      // 模拟加载好友数据
      this.friends = [
        {
          id: 1,
          name: '张三',
          avatar: '/static/images/avatar.png',
          remark: '客户-北京'
        },
        {
          id: 2,
          name: '李四',
          avatar: '/static/images/avatar.png',
          remark: '客户-上海'
        },
        {
          id: 3,
          name: '王五',
          avatar: '/static/images/avatar.png',
          remark: '客户-广州'
        }
      ];
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
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

.account-card {
  margin: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  
  .avatar-section {
    margin-right: 30rpx;
    
    .avatar-img {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
    }
  }
  
  .basic-info {
    flex: 1;
    
    .name-status {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
      
      .account-name {
        font-size: 36rpx;
        font-weight: 600;
        margin-right: 20rpx;
      }
      
      .status-tag {
        font-size: 24rpx;
        padding: 2rpx 16rpx;
        border-radius: 8rpx;
        
        &.status-normal {
          background-color: #4cd964;
          color: #fff;
        }
        
        &.status-running {
          background-color: #ff6b6b;
          color: #fff;
        }
      }
    }
    
    .account-id {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }
    
    .action-buttons {
      display: flex;
      
      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10rpx 20rpx;
        border-radius: 8rpx;
        background-color: #f5f5f5;
        margin-right: 20rpx;
        
        text {
          font-size: 26rpx;
          margin-left: 10rpx;
        }
      }
    }
  }
}

.tab-section {
  display: flex;
  background-color: #fff;
  margin: 0 30rpx 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #4080ff;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background-color: #4080ff;
        border-radius: 3rpx;
      }
    }
  }
}

.info-card {
  margin: 0 30rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .card-title {
      font-size: 30rpx;
      font-weight: 500;
      margin-left: 10rpx;
      flex: 1;
    }
    
    .score {
      font-size: 36rpx;
      font-weight: 600;
      color: #4cd964;
    }
    
    .limit-count {
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .age-content, .activity-content {
    padding: 20rpx 0;
    
    .age-value, .activity-value {
      font-size: 48rpx;
      font-weight: 600;
      color: #4080ff;
      margin-bottom: 10rpx;
    }
    
    .age-register, .total-days {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .evaluate-content {
    .evaluate-text {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }
    
    .evaluate-item {
      margin-bottom: 20rpx;
      
      .item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        .item-name {
          font-size: 28rpx;
          color: #666;
        }
        
        .item-percent {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
  
  .friends-stat-content {
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;
      
      .stat-label {
        font-size: 28rpx;
        color: #666;
      }
      
      .stat-value {
        font-size: 36rpx;
        font-weight: 600;
        
        &.blue {
          color: #4080ff;
        }
      }
      
      .stat-progress {
        font-size: 28rpx;
        color: #666;
      }
    }
    
    .limit-tip {
      margin-top: 20rpx;
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .limit-records {
    .limit-item {
      display: flex;
      justify-content: space-between;
      padding: 20rpx 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .limit-reason {
        font-size: 28rpx;
        color: #fa5151;
      }
      
      .limit-date {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}

.progress-bar {
  position: relative;
  height: 10rpx;
  margin: 10rpx 0;
  
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
    border-radius: 10rpx;
  }
}

.friends-list-container {
  margin: 0 30rpx;
  
  .search-filter {
    margin-bottom: 20rpx;
  }
  
  .friends-list {
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    overflow: hidden;
    
    .empty-tip {
      padding: 40rpx 0;
      text-align: center;
      color: #999;
      font-size: 28rpx;
    }
    
    .friend-item {
      display: flex;
      align-items: center;
      padding: 20rpx 30rpx;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .friend-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }
      
      .friend-info {
        flex: 1;
        
        .friend-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .friend-remark {
          font-size: 26rpx;
          color: #999;
        }
      }
      
      .friend-action {
        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 24rpx;
          color: #4080ff;
        }
      }
    }
  }
}

/* 好友转移模态框样式 */
.transfer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: relative;
    width: 650rpx;
    background-color: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    z-index: 1001;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .modal-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }
      
      .close-btn {
        width: 44rpx;
        height: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .close-icon {
          font-size: 44rpx;
          color: #999;
          line-height: 1;
        }
      }
    }
    
    .modal-body {
      padding: 30rpx;
      
      .transfer-title {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 30rpx;
      }
      
      .account-info-box {
        display: flex;
        align-items: center;
        background-color: #f8f9fc;
        padding: 20rpx;
        border-radius: 10rpx;
        margin-bottom: 30rpx;
        
        .account-avatar {
          margin-right: 20rpx;
          
          .avatar-small {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
          }
        }
        
        .account-detail {
          display: flex;
          flex-direction: column;
          
          .account-name-text {
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 4rpx;
          }
          
          .account-id-text {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
      
      .transfer-tips {
        margin-top: 20rpx;
        
        .tip-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 15rpx;
          
          .dot {
            margin-right: 10rpx;
            font-size: 30rpx;
            color: #666;
          }
          
          .tip-text {
            font-size: 28rpx;
            color: #666;
            line-height: 1.5;
          }
        }
      }
    }
    
    .modal-footer {
      display: flex;
      padding: 20rpx 30rpx 40rpx;
      
      .cancel-btn, .confirm-btn {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 30rpx;
      }
      
      .cancel-btn {
        background-color: #f5f5f5;
        color: #666;
        margin-right: 20rpx;
      }
      
      .confirm-btn {
        background-color: #4080ff;
        color: #fff;
      }
    }
  }
}
</style> 