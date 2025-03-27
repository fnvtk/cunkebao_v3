<template>
  <view class="content-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">内容库</view>
      <view class="header-right">
        <view class="add-btn" @click="createContent">
          <text class="add-icon">+</text>
          <text class="add-text">新建</text>
        </view>
      </view>
    </view>
    
    <!-- 内容区 -->
    <view class="content-wrapper">
      <!-- 搜索框 -->
      <view class="search-box">
        <u-search
          v-model="searchKeyword"
          placeholder="搜索内容库..."
          :showAction="false"
          shape="round"
          :clearabled="true"
          height="70"
          bgColor="#f4f4f4"
        ></u-search>
        <view class="filter-btn" @click="showFilter">
          <u-icon name="filter" size="36" color="#000"></u-icon>
        </view>
        <view class="refresh-btn" @click="refreshData">
          <u-icon name="reload" size="36" color="#000"></u-icon>
        </view>
      </view>
      
      <!-- 标签页 -->
      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'all' }" 
          @click="switchTab('all')"
        >
          全部
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'friends' }" 
          @click="switchTab('friends')"
        >
          微信好友
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'groups' }" 
          @click="switchTab('groups')"
        >
          聊天群
        </view>
      </view>
      
      <!-- 内容列表 -->
      <view class="content-list" v-if="filteredContents.length > 0">
        <view class="content-item" v-for="(item, index) in filteredContents" :key="index">
          <view class="content-header">
            <text class="content-title">{{item.title}}</text>
            <view class="usage-tag" :class="item.used ? 'used' : 'unused'">
              {{item.used ? '已使用' : '未使用'}}
            </view>
            <view class="more-icon" @click.stop="showOptions(item)">
              <u-icon name="more-dot-fill" size="32" color="#333"></u-icon>
            </view>
          </view>
          <view class="content-info">
            <view class="info-row">
              <text class="info-label">来源：</text>
              <view class="source-avatars">
                <image v-for="(avatar, i) in item.sourceAvatars" :key="i" :src="avatar" mode="aspectFill" class="source-avatar"></image>
              </view>
            </view>
            <view class="info-row">
              <text class="info-label">创建人：</text>
              <text class="info-value">{{item.creator}}</text>
            </view>
            <view class="info-row">
              <text class="info-label">内容数量：</text>
              <text class="info-value">{{item.contentCount}}</text>
            </view>
            <view class="info-row">
              <text class="info-label">更新时间：</text>
              <text class="info-value">{{item.updateTime}}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载中提示 -->
      <view class="loading-container" v-else-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-container" v-else>
        <image src="/static/images/empty.png" mode="aspectFit" class="empty-img"></image>
        <text class="empty-text">暂无内容</text>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="work"></CustomTabBar>
    
    <!-- 筛选弹窗 -->
    <u-popup :show="showFilterPopup" @close="closeFilterPopup" mode="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">筛选条件</text>
          <view class="popup-close" @click="closeFilterPopup">
            <u-icon name="close" size="28" color="#999"></u-icon>
          </view>
        </view>
        <view class="popup-body">
          <view class="filter-section">
            <view class="filter-title">使用状态</view>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{ active: selectedUsage === 'all' }"
                @click="selectUsage('all')"
              >
                全部
              </view>
              <view 
                class="filter-option" 
                :class="{ active: selectedUsage === 'used' }"
                @click="selectUsage('used')"
              >
                已使用
              </view>
              <view 
                class="filter-option" 
                :class="{ active: selectedUsage === 'unused' }"
                @click="selectUsage('unused')"
              >
                未使用
              </view>
            </view>
          </view>
          <view class="filter-section">
            <view class="filter-title">更新时间</view>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{ active: selectedTime === 'all' }"
                @click="selectTime('all')"
              >
                全部时间
              </view>
              <view 
                class="filter-option" 
                :class="{ active: selectedTime === 'today' }"
                @click="selectTime('today')"
              >
                今天
              </view>
              <view 
                class="filter-option" 
                :class="{ active: selectedTime === 'week' }"
                @click="selectTime('week')"
              >
                本周
              </view>
              <view 
                class="filter-option" 
                :class="{ active: selectedTime === 'month' }"
                @click="selectTime('month')"
              >
                本月
              </view>
            </view>
          </view>
          <view class="filter-buttons">
            <view class="reset-btn" @click="resetFilter">重置</view>
            <view class="confirm-btn" @click="applyFilter">确定</view>
          </view>
        </view>
      </view>
    </u-popup>
    
    <!-- 内容操作弹窗 -->
    <u-popup :show="showActionPopup" @close="closeActionPopup" mode="bottom">
      <view class="action-list">
        <view class="action-item" @click="editContent">
          <u-icon name="edit-pen" size="32" color="#333"></u-icon>
          <text>编辑内容</text>
        </view>
        <view class="action-item" @click="shareContent">
          <u-icon name="share" size="32" color="#333"></u-icon>
          <text>分享内容</text>
        </view>
        <view class="action-item delete" @click="deleteContent">
          <u-icon name="trash" size="32" color="#fa5151"></u-icon>
          <text>删除内容</text>
        </view>
        <view class="action-item cancel" @click="closeActionPopup">
          <text>取消</text>
        </view>
      </view>
    </u-popup>
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
      currentTab: 'all',
      showFilterPopup: false,
      showActionPopup: false,
      selectedUsage: 'all',
      selectedTime: 'all',
      tempSelectedUsage: 'all',
      tempSelectedTime: 'all',
      loading: true,
      currentContent: null,
      contents: [
        {
          id: 1,
          title: '微信好友广告',
          used: true,
          sourceAvatars: ['/static/images/avatar.png'],
          creator: '海尼',
          contentCount: 0,
          updateTime: '2024-02-09 12:30'
        },
        {
          id: 2,
          title: '开发群',
          used: true,
          sourceAvatars: ['/static/images/avatar.png'],
          creator: 'karuo',
          contentCount: 0,
          updateTime: '2024-02-09 12:30'
        }
      ]
    }
  },
  computed: {
    filteredContents() {
      let result = [...this.contents];
      
      // 搜索关键词筛选
      if (this.searchKeyword) {
        result = result.filter(item => 
          item.title.includes(this.searchKeyword) || 
          item.creator.includes(this.searchKeyword)
        );
      }
      
      // 标签页筛选
      if (this.currentTab === 'friends') {
        result = result.filter(item => item.title.includes('好友'));
      } else if (this.currentTab === 'groups') {
        result = result.filter(item => item.title.includes('群'));
      }
      
      // 使用状态筛选
      if (this.selectedUsage === 'used') {
        result = result.filter(item => item.used);
      } else if (this.selectedUsage === 'unused') {
        result = result.filter(item => !item.used);
      }
      
      // 时间筛选
      if (this.selectedTime !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        
        result = result.filter(item => {
          const itemTime = new Date(item.updateTime).getTime();
          if (this.selectedTime === 'today') {
            return itemTime >= today;
          } else if (this.selectedTime === 'week') {
            return itemTime >= weekAgo;
          } else if (this.selectedTime === 'month') {
            return itemTime >= monthAgo;
          }
          return true;
        });
      }
      
      return result;
    }
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 刷新数据
    refreshData() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        uni.showToast({
          title: '刷新成功',
          icon: 'none'
        });
      }, 1000);
    },
    
    // 显示筛选弹窗
    showFilter() {
      this.tempSelectedUsage = this.selectedUsage;
      this.tempSelectedTime = this.selectedTime;
      this.showFilterPopup = true;
    },
    
    // 关闭筛选弹窗
    closeFilterPopup() {
      this.showFilterPopup = false;
    },
    
    // 切换标签页
    switchTab(tab) {
      this.currentTab = tab;
    },
    
    // 选择使用状态
    selectUsage(usage) {
      this.tempSelectedUsage = usage;
    },
    
    // 选择时间范围
    selectTime(time) {
      this.tempSelectedTime = time;
    },
    
    // 重置筛选条件
    resetFilter() {
      this.tempSelectedUsage = 'all';
      this.tempSelectedTime = 'all';
    },
    
    // 应用筛选条件
    applyFilter() {
      this.selectedUsage = this.tempSelectedUsage;
      this.selectedTime = this.tempSelectedTime;
      this.closeFilterPopup();
    },
    
    // 显示内容操作弹窗
    showOptions(content) {
      this.currentContent = content;
      this.showActionPopup = true;
    },
    
    // 关闭内容操作弹窗
    closeActionPopup() {
      this.showActionPopup = false;
    },
    
    // 创建内容
    createContent() {
      uni.navigateTo({
        url: '/pages/content/detail'
      });
    },
    
    // 编辑内容
    editContent() {
      uni.showToast({
        title: `编辑内容：${this.currentContent.title}`,
        icon: 'none'
      });
      this.closeActionPopup();
    },
    
    // 分享内容
    shareContent() {
      uni.showToast({
        title: `分享内容：${this.currentContent.title}`,
        icon: 'none'
      });
      this.closeActionPopup();
    },
    
    // 删除内容
    deleteContent() {
      uni.showModal({
        title: '提示',
        content: `确定要删除内容"${this.currentContent.title}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.contents = this.contents.filter(item => item.id !== this.currentContent.id);
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
          this.closeActionPopup();
        }
      });
    },
    
    // 加载数据
    loadData() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
.content-container {
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
    .add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #4080ff;
      border-radius: 30rpx;
      padding: 12rpx 24rpx;
      color: #fff;
      
      .add-icon {
        font-size: 36rpx;
        font-weight: bold;
        margin-right: 6rpx;
        line-height: 1;
      }
      
      .add-text {
        font-size: 28rpx;
      }
    }
  }
}

.content-wrapper {
  padding: 20rpx 0;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 0 30rpx 20rpx;
  
  .u-search {
    flex: 1;
  }
  
  .filter-btn, .refresh-btn {
    margin-left: 20rpx;
    padding: 10rpx;
  }
}

.tabs {
  display: flex;
  margin: 0 30rpx 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #666;
    
    &.active {
      color: #4080ff;
      font-weight: 500;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: #4080ff;
        border-radius: 2rpx;
      }
    }
  }
}

.content-list {
  padding: 0 30rpx;
  
  .content-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    
    .content-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .content-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        flex: 1;
      }
      
      .usage-tag {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        margin-right: 16rpx;
        
        &.used {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        
        &.unused {
          background-color: #f6ffed;
          color: #52c41a;
        }
      }
      
      .more-icon {
        padding: 10rpx;
      }
    }
    
    .content-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
        font-size: 28rpx;
        color: #666;
        
        .info-label {
          color: #999;
          min-width: 150rpx;
        }
        
        .source-avatars {
          display: flex;
          
          .source-avatar {
            width: 40rpx;
            height: 40rpx;
            border-radius: 50%;
            margin-right: 10rpx;
          }
        }
      }
    }
  }
}

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  
  .loading-text, .empty-text {
    font-size: 30rpx;
    color: #999;
    margin-top: 20rpx;
  }
  
  .empty-img {
    width: 200rpx;
    height: 200rpx;
  }
}

.popup-content {
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #f0f0f0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: 500;
    }
    
    .popup-close {
      padding: 10rpx;
    }
  }
  
  .popup-body {
    padding: 30rpx;
    
    .filter-section {
      margin-bottom: 30rpx;
      
      .filter-title {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        
        .filter-option {
          padding: 16rpx 30rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #666;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          
          &.active {
            background-color: #e6f7ff;
            color: #4080ff;
            font-weight: 500;
          }
        }
      }
    }
    
    .filter-buttons {
      display: flex;
      margin-top: 40rpx;
      
      .reset-btn, .confirm-btn {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        border-radius: 8rpx;
      }
      
      .reset-btn {
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

.action-list {
  background-color: #fff;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
  
  .action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    font-size: 32rpx;
    color: #333;
    border-bottom: 1px solid #f5f5f5;
    
    u-icon {
      margin-right: 15rpx;
    }
    
    &.delete {
      color: #fa5151;
    }
    
    &.cancel {
      color: #666;
      margin-top: 16rpx;
      border-bottom: none;
    }
  }
}
</style> 