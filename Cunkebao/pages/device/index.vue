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
        <view class="stat-value blue">{{ totalDeviceCount }}</view>
      </view>
      <view class="stat-card">
        <view class="stat-label">在线设备</view>
        <view class="stat-value green">{{ onlineDeviceCount }}</view>
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
            @search="handleSearch"
            @clear="handleClearSearch"
            @input="handleSearchInput"
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
        <!-- 添加搜索过滤标签 -->
        <view class="filter-tag" v-if="searchKeyword">
          <text>{{ searchKeyword }}</text>
          <text class="close-icon" @click.stop="clearSearch">×</text>
        </view>
        <view class="select-all" v-if="deviceList.length > 0">
          <u-checkbox 
            v-model="selectAll" 
            size="40" 
            iconSize="35" 
            shape="circle" 
            activeColor="#4080ff" 
            @change="handleSelectAllChange"
          ></u-checkbox>
          <text class="select-text">全选</text>
        </view>
        <view class="delete-btn" @click="deleteDevices" :class="{disabled: !hasSelected}">
          删除
        </view>
      </view>
      
      <!-- 设备列表 -->
      <view class="device-list">
        <!-- 加载中 -->
        <view v-if="loading && page === 1" class="loading-container">
          <u-loading-icon mode="circle" size="36"></u-loading-icon>
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 空状态 -->
        <view v-else-if="deviceList.length === 0" class="empty-container">
          <u-empty mode="list" text="暂无设备"></u-empty>
        </view>
        
        <!-- 设备列表内容 -->
        <template v-else>
          <!-- 设备项 -->
          <view 
            class="device-item" 
            v-for="(device, index) in deviceList" 
            :key="device.id"
            @click="goToDeviceDetail(device.id)"
          >
            <view class="device-checkbox">
              <u-checkbox 
                :size="40" 
                :iconSize="35" 
                v-model="device.selected" 
                shape="circle" 
                activeColor="#4080ff" 
                @click.stop
                @change="handleDeviceSelectChange"
              ></u-checkbox>
            </view>
            <view class="device-info">
              <view class="device-header">
                <view class="device-name">{{ device.memo || '未命名设备' }}</view>
                <view :class="['device-status', device.alive === 1 ? 'online' : 'offline']">
                  {{ device.alive === 1 ? '在线' : '离线' }}
                </view>
              </view>
              <view class="device-imei" @click.stop="showImeiDetail(device.imei)">
                IMEI: <text class="imei-text">{{ formatImei(device.imei) }}</text>
              </view>
              <view class="device-wx">微信号: {{ device.wechatId || '未登录' }}</view>
              <view class="device-likes">
                <text>好友数: {{ device.totalFriend || 0 }}</text>
              </view>
            </view>
          </view>
          
          <!-- 加载更多 -->
          <view v-if="hasMoreData && !loadingMore" class="load-more" @click="loadMore">
            <text class="load-more-text">点击加载更多</text>
          </view>
          <view v-else-if="loadingMore" class="load-more">
            <u-loading-icon mode="circle" size="24"></u-loading-icon>
            <text class="load-more-text">加载中...</text>
          </view>
          <view v-else-if="deviceList.length >= 20" class="load-more">
            <text class="load-more-text">没有更多数据了</text>
          </view>
        </template>
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
    
    <!-- IMEI详情模态框 -->
    <view class="imei-modal" v-if="showImeiModal">
      <view class="modal-mask" @click="closeImeiModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">IMEI详情</text>
          <view class="modal-close" @click="closeImeiModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="imei-detail">
            <text class="imei-label">IMEI:</text>
            <text class="imei-value">{{ currentImei }}</text>
          </view>
          <view class="copy-btn" @click="copyImei">
            <text class="copy-text">复制IMEI</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="device"></CustomTabBar>
  </view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue'
import * as DeviceApi from '@/api/device'
import Auth from '@/utils/auth'

export default {
  components: {
    CustomTabBar
  },
  data() {
    return {
      // 搜索相关
      searchKeyword: '',
      prevSearchKeyword: '', // 添加前一次搜索关键词
      searchTimer: null, // 添加搜索防抖定时器
      
      // 设备列表相关
      deviceList: [],
      page: 1,
      limit: 20,
      total: 0,
      loading: false,
      loadingMore: false,
      hasMoreData: false,
      
      // 统计相关
      totalDeviceCount: 0,
      onlineDeviceCount: 0,
      
      // 选择相关
      selectAll: false,
      selectedIds: [],
      
      // 筛选相关
      statusPickerShow: false,
      statusOptions: [
        { text: '全部状态', value: 'all' },
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' }
      ],
      currentStatus: 'all',
      
      // 添加设备相关
      showAddDeviceModal: false,
      deviceId: '',
      
      // IMEI详情相关
      showImeiModal: false,
      currentImei: '',
    }
  },
  computed: {
    hasSelected() {
      return this.selectedIds.length > 0;
    },
    statusText() {
      const selected = this.statusOptions.find(option => option.value === this.currentStatus);
      return selected ? selected.text : '全部状态';
    },
    queryParams() {
      const params = {
        page: this.page,
        limit: this.limit
      };
      
      // 添加搜索关键词（添加trim，避免空格干扰）
      if (this.searchKeyword && this.searchKeyword.trim()) {
        // 同时搜索IMEI和备注（使用OR关系）
        params.keyword = this.searchKeyword.trim();
      }
      
      // 添加状态筛选
      if (this.currentStatus === 'online') {
        params.alive = 1;
      } else if (this.currentStatus === 'offline') {
        params.alive = 0;
      }
      
      console.log('请求参数:', params); // 调试输出，观察参数
      return params;
    }
  },
  onLoad() {
    // 检查登录状态
    if (!Auth.isLogin()) {
      uni.reLaunch({
        url: '/pages/login/index'
      });
      return;
    }
    
    // 获取设备统计数据
    this.loadDeviceStats();
    
    // 加载设备列表
    this.loadDeviceList();
  },
  methods: {
    // 加载设备统计数据
    async loadDeviceStats() {
      try {
        // 获取设备总数
        const totalRes = await DeviceApi.getDeviceCount();
        if (totalRes.code === 200) {
          this.totalDeviceCount = totalRes.data.count || 0;
        }
        
        // 获取在线设备数
        const onlineRes = await DeviceApi.getDeviceCount({ alive: 1 });
        if (onlineRes.code === 200) {
          this.onlineDeviceCount = onlineRes.data.count || 0;
        }
      } catch (error) {
        console.error('加载设备统计数据失败', error);
        uni.showToast({
          title: '加载统计数据失败',
          icon: 'none'
        });
      }
    },
    
    // 加载设备列表
    async loadDeviceList(isLoadMore = false) {
      try {
        if (isLoadMore) {
          this.loadingMore = true;
        } else {
          this.loading = true;
          
          if (!isLoadMore) {
            // 重置页码
            this.page = 1;
            this.deviceList = [];
          }
        }
        
        console.log('发送请求参数:', this.queryParams); // 查看请求参数
        const res = await DeviceApi.getDeviceList(this.queryParams);
        
        if (res.code === 200) {
          const newDevices = res.data.list.map(item => ({
            ...item,
            selected: false
          }));
          
          if (isLoadMore) {
            this.deviceList = [...this.deviceList, ...newDevices];
          } else {
            this.deviceList = newDevices;
          }
          
          this.total = res.data.total || 0;
          this.hasMoreData = this.deviceList.length < this.total;
        } else {
          uni.showToast({
            title: res.msg || '加载设备列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载设备列表失败', error);
        uni.showToast({
          title: '加载设备列表失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },
    
    // 加载更多
    loadMore() {
      if (this.hasMoreData && !this.loadingMore) {
        this.page++;
        this.loadDeviceList(true);
      }
    },
    
    // 处理搜索输入（带防抖）
    handleSearchInput(value) {
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      // 设置新的定时器（300ms防抖）
      this.searchTimer = setTimeout(() => {
        // 如果搜索关键词与前一次相同，不重新加载
        if (this.searchKeyword.trim() === this.prevSearchKeyword.trim()) {
          return;
        }
        
        this.prevSearchKeyword = this.searchKeyword.trim();
        this.loadDeviceList();
      }, 300);
    },
    
    // 处理搜索
    handleSearch() {
      if (this.searchKeyword.trim() === this.prevSearchKeyword.trim()) {
        return;
      }
      this.prevSearchKeyword = this.searchKeyword.trim();
      this.loadDeviceList();
    },
    
    // 清除搜索关键词
    clearSearch() {
      this.searchKeyword = '';
      this.prevSearchKeyword = '';
      this.loadDeviceList();
    },
    
    // 处理清除搜索（组件clear按钮触发）
    handleClearSearch() {
      this.searchKeyword = '';
      this.prevSearchKeyword = '';
      this.loadDeviceList();
    },
    
    // 刷新列表
    refreshList() {
      uni.showLoading({
        title: '刷新中...'
      });
      
      Promise.all([
        DeviceApi.refreshDevices(),
        this.loadDeviceStats(),
        this.loadDeviceList()
      ]).finally(() => {
        uni.hideLoading();
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      });
    },
    
    // 显示状态筛选
    showStatusPopup() {
      this.statusPickerShow = true;
    },
    
    // 确认状态筛选
    confirmStatus(e) {
      this.currentStatus = e.value[0];
      this.statusPickerShow = false;
      
      // 重新加载设备列表
      this.loadDeviceList();
    },
    
    // 取消状态筛选
    cancelStatus() {
      this.statusPickerShow = false;
    },
    
    // 处理全选状态变化
    handleSelectAllChange(value) {
      // 注意：这里的value是uView的checkbox传递的布尔值
      console.log('全选状态变更为:', value);
      
      // 更新所有设备的选择状态
      this.deviceList.forEach(device => {
        device.selected = value;
      });
      
      // 更新已选择的设备ID数组
      this.selectedIds = value ? this.deviceList.map(device => device.id) : [];
    },
    
    // 处理设备选择状态变化
    handleDeviceSelectChange() {
      // 更新已选择的设备ID数组
      this.selectedIds = this.deviceList
        .filter(device => device.selected)
        .map(device => device.id);
      
      // 更新全选状态
      this.selectAll = this.deviceList.length > 0 && this.selectedIds.length === this.deviceList.length;
      console.log('更新全选状态为:', this.selectAll, '选中设备数:', this.selectedIds.length);
    },
    
    // 删除设备
    deleteDevices() {
      if (!this.hasSelected) return;
      
      uni.showModal({
        title: '删除设备',
        content: `确定要删除已选择的 ${this.selectedIds.length} 台设备吗？`,
        confirmColor: '#f56c6c',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            });
            
            try {
              const deletePromises = this.selectedIds.map(id => DeviceApi.deleteDevice(id));
              await Promise.all(deletePromises);
              
              // 刷新列表和统计
              await this.loadDeviceStats();
              await this.loadDeviceList();
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } catch (error) {
              console.error('删除设备失败', error);
              uni.showToast({
                title: '删除设备失败',
                icon: 'none'
              });
            } finally {
              uni.hideLoading();
            }
          }
        }
      });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 前往设备详情页
    goToDeviceDetail(id) {
      uni.navigateTo({
        url: `/pages/device/detail?id=${id}`
      });
    },
    
    // 显示筛选
    showFilter() {
      uni.showToast({
        title: '筛选功能开发中',
        icon: 'none'
      });
    },
    
    // 添加设备
    addDevice() {
      this.showAddDeviceModal = true;
    },
    
    // 确认添加设备
    async confirmAddDevice() {
      if (!this.deviceId) {
        uni.showToast({
          title: '请输入设备ID',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '添加中...'
      });
      
      try {
        const res = await DeviceApi.addDevice({
          imei: this.deviceId,
          memo: `设备-${this.deviceId.slice(-6)}`
        });
        
        if (res.code === 200) {
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
          
          this.showAddDeviceModal = false;
          this.deviceId = '';
          
          // 刷新列表和统计
          await this.loadDeviceStats();
          await this.loadDeviceList();
        } else {
          uni.showToast({
            title: res.msg || '添加失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('添加设备失败', error);
        uni.showToast({
          title: '添加设备失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 取消添加设备
    cancelAddDevice() {
      this.showAddDeviceModal = false;
      this.deviceId = '';
    },
    
    // 格式化IMEI，超过一定长度显示省略号
    formatImei(imei) {
      if (!imei) return '';
      
      // 如果IMEI长度超过16个字符，则截取前16个字符并添加省略号
      if (imei.length > 16) {
        return imei.substring(0, 16) + '...';
      }
      
      return imei;
    },
    
    // 显示IMEI详情
    showImeiDetail(imei) {
      this.currentImei = imei;
      this.showImeiModal = true;
    },
    
    // 关闭IMEI详情模态框
    closeImeiModal() {
      this.showImeiModal = false;
      this.currentImei = '';
    },
    
    // 复制IMEI到剪贴板
    copyImei() {
      uni.setClipboardData({
        data: this.currentImei,
        success: () => {
          uni.showToast({
            title: 'IMEI已复制',
            icon: 'success'
          });
          this.closeImeiModal();
        }
      });
    },
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
    background-color: #f0f5ff;
    border: 1rpx solid #d6e4ff;
    min-width: 180rpx;
    justify-content: space-between;
    
    text {
      margin-right: 10rpx;
    }
    
    &:active {
      background-color: #e0ebff;
    }
  }
  
  .filter-tag {
    display: inline-flex;
    align-items: center;
    font-size: 24rpx;
    color: #4080ff;
    padding: 6rpx 16rpx;
    border-radius: 16rpx;
    background-color: #f0f5ff;
    border: 1rpx solid #d6e4ff;
    margin-left: 16rpx;
    margin-right: auto;
    max-width: 250rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    
    .close-icon {
      margin-left: 12rpx;
      font-size: 28rpx;
      line-height: 24rpx;
      color: #999;
      
      &:active {
        color: #666;
      }
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
      
      .device-imei {
        cursor: pointer;
        
        .imei-text {
          color: #4080ff;
          padding-left: 10rpx;
          font-size: 32rpx;
        }
        
        &:active {
          opacity: 0.7;
        }
      }
      
      .device-likes {
        display: flex;
        justify-content: space-between;
        font-size: 32rpx;
        color: #666;
      }
    }
  }
  
  .loading-container, .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .loading-text {
      font-size: 28rpx;
      color: #999;
      margin-top: 20rpx;
    }
  }
  
  .load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    
    .load-more-text {
      font-size: 28rpx;
      color: #999;
      margin-left: 10rpx;
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

/* IMEI详情模态框样式 */
.imei-modal {
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
    width: 600rpx;
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
      padding: 20rpx 40rpx 40rpx;
      
      .imei-detail {
        background-color: #f5f7fa;
        padding: 30rpx;
        border-radius: 10rpx;
        margin-bottom: 30rpx;
        
        .imei-label {
          display: block;
          font-size: 28rpx;
          color: #666;
          margin-bottom: 10rpx;
        }
        
        .imei-value {
          display: block;
          font-size: 32rpx;
          color: #333;
          word-break: break-all;
          font-family: monospace;
          line-height: 1.5;
        }
      }
      
      .copy-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #4080ff;
        color: #fff;
        padding: 20rpx 0;
        border-radius: 10rpx;
        
        .copy-text {
          margin-left: 10rpx;
          font-size: 28rpx;
        }
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style> 