<!-- 设备管理页面 -->
<template>
  <view class="device-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="44" color="#000000"></u-icon>
      </view>
      <view class="title">设备管理</view>
      <view class="header-right">
        <view class="add-btn" @click="addDevice">
          <u-icon name="plus" size="30" color="#ffffff"></u-icon>
          <text class="add-text">添加设备</text>
        </view>
      </view>
    </view>
    
    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <view class="stat-label">总设备数</view>
        <view class="stat-value blue">42</view>
      </view>
      <view class="stat-card">
        <view class="stat-label">在线设备</view>
        <view class="stat-value green">35</view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 搜索和筛选区域 -->
      <view class="search-bar">
        <view class="search-input">
          <u-search 
            placeholder="搜索设备IMEI/备注" 
            v-model="searchKeyword"
            :show-action="false"
            :clearabled="true"
            bgColor="#fff"
            searchIconSize="50"
            shape="round"
          ></u-search>
        </view>
        <view class="filter-btn" @click="showFilter">
          <image src="/static/images/icons/filter.svg" class="filter-icon"></image>
        </view>
        <view class="refresh-btn" @click="refreshList">
          <u-icon name="reload" size="48" color="#333"></u-icon>
        </view>
      </view>
      
      <!-- 状态筛选 -->
      <view class="filter-bar">
        <view class="status-filter" @click="showStatusPopup">
          <text>{{ statusText }}</text>
          <u-icon name="arrow-down" size="28" color="#333"></u-icon>
        </view>
        <view class="select-all">
          <u-checkbox v-model="selectAll" size="40" iconSize="35" shape="circle" activeColor="#4080ff"></u-checkbox>
          <text class="select-text">全选</text>
        </view>
        <view class="delete-btn" @click="deleteDevices" :class="{disabled: !hasSelected}">
          删除
        </view>
      </view>
      
      <!-- 设备列表 -->
      <view class="device-list">
        <!-- 设备项 1 -->
        <view class="device-item" @click="goToDeviceDetail(1)">
          <view class="device-checkbox">
            <u-checkbox size="40" iconSize="35" v-model="device1Selected" shape="circle" activeColor="#4080ff" @click.stop></u-checkbox>
          </view>
          <view class="device-info">
            <view class="device-header">
              <view class="device-name">设备 1</view>
              <view class="device-status online">在线</view>
            </view>
            <view class="device-imei">IMEI: sd123123</view>
            <view class="device-wx">微信号: wxid_hxdxdoal</view>
            <view class="device-likes">
              <text>好友数: 435</text>
              <text class="today-stats">今日新增: +20</text>
            </view>
          </view>
        </view>
        
        <!-- 设备项 2 -->
        <view class="device-item" @click="goToDeviceDetail(2)">
          <view class="device-checkbox">
            <u-checkbox v-model="device2Selected" shape="circle" activeColor="#4080ff"
            size="40" iconSize="35" @click.stop
            ></u-checkbox>
          </view>
          <view class="device-info">
            <view class="device-header">
              <view class="device-name">设备 2</view>
              <view class="device-status online">在线</view>
            </view>
            <view class="device-imei">IMEI: sd123124</view>
            <view class="device-wx">微信号: wxid_2i7sncgq</view>
            <view class="device-likes">
              <text>好友数: 143</text>
              <text class="today-stats">今日新增: +26</text>
            </view>
          </view>
        </view>
        
        <!-- 设备项 3 -->
        <view class="device-item" @click="goToDeviceDetail(3)">
          <view class="device-checkbox">
            <u-checkbox size="40" iconSize="35" v-model="device3Selected" shape="circle" activeColor="#4080ff" @click.stop></u-checkbox>
          </view>
          <view class="device-info">
            <view class="device-header">
              <view class="device-name">设备 3</view>
              <view class="device-status online">在线</view>
            </view>
            <view class="device-imei">IMEI: sd123125</view>
            <view class="device-wx">微信号: wxid_yunzn4lp</view>
            <view class="device-likes">
              <text>好友数: 707</text>
              <text class="today-stats">今日新增: +48</text>
            </view>
          </view>
        </view>
        
        <!-- 设备项 4 -->
        <view class="device-item" @click="goToDeviceDetail(4)">
          <view class="device-checkbox">
            <u-checkbox size="40" iconSize="35" v-model="device4Selected" shape="circle" activeColor="#4080ff" @click.stop></u-checkbox>
          </view>
          <view class="device-info">
            <view class="device-header">
              <view class="device-name">设备 4</view>
              <view class="device-status offline">离线</view>
            </view>
            <view class="device-imei">IMEI: sd123126</view>
            <view class="device-wx">微信号: wxid_4k39dnsc</view>
            <view class="device-likes">
              <text>好友数: 529</text>
              <text class="today-stats">今日新增: +0</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 状态选择弹窗 -->
    <u-picker
      :show="statusPickerShow"
      :columns="[statusOptions]"
      @confirm="confirmStatus"
      @cancel="cancelStatus"
      confirmColor="#4080ff"
      title="选择状态"
    ></u-picker>
    
    <!-- 添加设备弹窗 -->
    <view class="add-device-modal" v-if="showAddDeviceModal">
      <view class="modal-mask" @click="cancelAddDevice"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">添加设备</text>
          <view class="modal-close" @click="cancelAddDevice">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="qr-container">
            <image class="qr-image" src="/static/images/qr-placeholder.png" mode="aspectFit"></image>
          </view>
          <view class="qr-hint">请使用设备扫描二维码进行添加</view>
          <view class="qr-hint">或手动输入设备ID</view>
          <view class="device-id-input">
            <u-input
              v-model="deviceId"
              placeholder="请输入设备ID"
              shape="circle"
              border="surround"
              clearable
            ></u-input>
          </view>
        </view>
        <view class="modal-actions">
          <view class="cancel-btn" @click="cancelAddDevice">取消</view>
          <view class="confirm-btn" @click="confirmAddDevice">确认添加</view>
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
      selectAll: false,
      device1Selected: false,
      device2Selected: false,
      device3Selected: false,
      device4Selected: false,
      statusPickerShow: false,
      statusOptions: [
        { text: '全部状态', value: 'all' },
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' }
      ],
      currentStatus: 'all',
      // 添加设备相关数据
      showAddDeviceModal: false,
      deviceId: ''
    }
  },
  computed: {
    hasSelected() {
      return this.device1Selected || this.device2Selected || this.device3Selected || this.device4Selected;
    },
    statusText() {
      const selected = this.statusOptions.find(option => option.value === this.currentStatus);
      return selected ? selected.text : '全部状态';
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 添加设备
    addDevice() {
      this.showAddDeviceModal = true;
    },
    
    // 取消添加设备
    cancelAddDevice() {
      this.showAddDeviceModal = false;
      this.deviceId = '';
    },
    
    // 确认添加设备
    confirmAddDevice() {
      if (!this.deviceId.trim()) {
        uni.showToast({
          title: '请输入设备ID',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '添加中'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        });
        this.cancelAddDevice();
      }, 1500);
    },
    
    // 刷新列表
    refreshList() {
      uni.showLoading({
        title: '刷新中'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      }, 1000);
    },
    
    // 显示筛选
    showFilter() {
      uni.showToast({
        title: '筛选功能待实现',
        icon: 'none'
      });
    },
    
    // 显示状态选择
    showStatusPopup() {
      this.statusPickerShow = true;
    },
    
    // 确认状态选择
    confirmStatus(e) {
      this.currentStatus = e.value[0];
      this.statusPickerShow = false;
      
      // 应用筛选逻辑
      this.applyStatusFilter();
    },
    
    // 应用状态筛选
    applyStatusFilter() {
      uni.showLoading({
        title: '筛选中'
      });
      
      // 模拟筛选过程
      setTimeout(() => {
        uni.hideLoading();
        
        // 提示用户
        uni.showToast({
          title: `已筛选: ${this.statusText}`,
          icon: 'none'
        });
        
        // 这里可以添加实际的设备筛选逻辑
        // 根据 this.currentStatus 对设备列表进行筛选
      }, 500);
    },
    
    // 取消状态选择
    cancelStatus() {
      this.statusPickerShow = false;
    },
    
    // 删除设备
    deleteDevices() {
      if (!this.hasSelected) return;
      
      uni.showModal({
        title: '确认删除',
        content: '确定要删除选中的设备吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.device1Selected = false;
            this.device2Selected = false;
            this.device3Selected = false;
            this.device4Selected = false;
            this.selectAll = false;
          }
        }
      });
    },
    
    // 跳转到设备详情页
    goToDeviceDetail(deviceId) {
      uni.navigateTo({
        url: `/pages/device/detail?id=${deviceId}`
      });
    }
  },
  watch: {
    selectAll(newVal) {
      this.device1Selected = newVal;
      this.device2Selected = newVal;
      this.device3Selected = newVal;
      this.device4Selected = newVal;
    }
  }
}
</script>

<style lang="scss" scoped>
.device-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 180rpx;
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
    float: left;
    margin-left: 70rpx;
  }
  
  .header-right {
    .add-btn {
      display: flex;
      align-items: center;
      background-color: #2563EB;
      border-radius: 20rpx;
      padding: 15rpx 30rpx;
      color: #fff;
      text-indent: 15rpx;
      
      .add-text {
        color: #fff;
        font-size: 28rpx;
        margin-left: 8rpx;
      }
    }
  }
}

.stats-cards {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  margin-top: 130rpx;  // 添加顶部边距，为固定header留出空间
  
  .stat-card {
    flex: 1;
    background-color: #fff;
    border-radius: 35rpx;
    padding: 30rpx;
    margin: 15rpx;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    
    .stat-label {
      font-size: 28rpx;
      color: #666;
    }
    
    .stat-value {
      font-size: 55rpx;
      font-weight: bold;
      font-family: 'Digital-Bold', sans-serif;
      
      &.blue {
        color: #4080ff;
      }
      
      &.green {
        color: #2fc25b;
      }
    }
  }
}

.content-container {
  margin: 0 30rpx;
  background-color: #fff;
  border-radius: 35rpx;
  overflow: hidden;
  border: 2rpx solid #e9e9e9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  
  .search-input {
    flex: 1;
    border: 1px solid #e9e9e9;
    border-radius: 20rpx;
    padding: 10rpx 20rpx;
  }
  
  .filter-btn, .refresh-btn {
    margin-left: 20rpx;
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20rpx;
    border: 2rpx solid #e9e9e9;
  }
}

.filter-icon {
  width: 43rpx;
  height: 43rpx;
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 10rpx 25rpx;

  .status-filter {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    background-color: #fff;
    border: 1rpx solid #e5e5e5;
    min-width: 180rpx;
    justify-content: space-between;
    
    text {
      margin-right: 10rpx;
    }
    
    &:active {
      background-color: #f8f8f8;
    }
  }
  
  .select-all {
    display: flex;
    align-items: center;
    margin-right: auto;
    margin-left: 20rpx;
    
    .select-text {
      font-size: 28rpx;
      color: #333;
      margin-left: 10rpx;
    }
  }
  
  .delete-btn {
    margin-left: 30rpx;
    background-color: #ee6666;
    color: #fff;
    padding: 10rpx 30rpx;
    border-radius: 20rpx;
    font-size: 28rpx;
    
    &.disabled {
      background-color: #cccccc;
    }
  }
}

.device-list {
  padding: 0;
  
  .device-item {
    display: flex;
    background-color: #fff;
    padding: 30rpx;
    margin: 25rpx;
    border-radius: 20rpx;
    border: 2rpx solid #e9e9e9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    
    &:last-child {
      border-bottom: none;
    }
    
    .device-checkbox {
      margin-right: 10rpx;
      display: flex;
      align-items: center;
    }
    
    .device-info {
      flex: 1;
      
      .device-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15rpx;
        
        .device-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
        
        .device-status {
          font-size: 24rpx;
          padding: 6rpx 20rpx;
          border-radius: 20rpx;
          
          &.online {
            background-color: #e6f7f0;
            color: #2fc25b;
          }
          
          &.offline {
            background-color: #f7eae9;
            color: #ee6666;
          }
        }
      }
      
      .device-imei, .device-wx {
        font-size: 32rpx;
        color: #666;
      }
      
      .device-likes {
        display: flex;
        justify-content: space-between;
        font-size: 32rpx;
        color: #666;
      }
    }
  }
}

/* 添加设备弹窗样式 */
.add-device-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
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
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 40rpx;
      
      .modal-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }
      
      .modal-close {
        padding: 10rpx;
        
        .close-icon {
          font-size: 44rpx;
          color: #777;
          line-height: 1;
        }
      }
    }
    
    .modal-body {
      padding: 0rpx 40rpx;
      padding-bottom: 30rpx;
      
      .qr-container {
        width: 450rpx;
        height: 450rpx;
        margin: 0 auto 30rpx;
        background-color: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10rpx;
        
        .qr-image {
          width: 400rpx;
          height: 400rpx;
        }
      }
      
      .qr-hint {
        text-align: center;
        color: #666;
        font-size: 28rpx;
      }
      
      .device-id-input {
        margin-top: 40rpx;
      }
    }
    
    .modal-actions {
      display: flex;
      justify-content: center;
      padding: 20rpx 40rpx 40rpx;
      
      .cancel-btn, .confirm-btn {
        width: 180rpx;
        height: 80rpx;
        border-radius: 25rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        margin: 0 15rpx;
      }
      
      .cancel-btn {
        background-color: #ffffff;
        color: #333;
        border: 1px solid #e5e5e5;
      }
      
      .confirm-btn {
        background-color: #4080ff;
        color: #fff;
      }
    }
  }
}
</style> 