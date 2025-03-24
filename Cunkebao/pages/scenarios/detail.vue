<template>
  <view class="detail-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="26"></u-icon>
      </view>
      <view class="title">{{channelInfo.name}}</view>
      <view class="header-icons">
        <u-icon name="more-circle" size="26" class="icon-more" @click="showOptions"></u-icon>
      </view>
    </view>
    
    <!-- 数据概览卡片 -->
    <view class="data-overview">
      <view class="overview-header">
        <view class="channel-icon" :class="'bg-' + channelInfo.bgColor">
          <u-icon :name="channelInfo.icon" size="32" color="#ffffff"></u-icon>
        </view>
        <view class="channel-info">
          <view class="channel-name">{{channelInfo.name}}</view>
          <view class="channel-desc">今日新增客户 {{channelInfo.count}} 人</view>
        </view>
      </view>
      
      <view class="overview-data">
        <view class="data-col">
          <view class="data-value">{{channelInfo.count}}</view>
          <view class="data-label">今日获客</view>
        </view>
        <view class="data-col">
          <view class="data-value">{{weekTotal}}</view>
          <view class="data-label">本周获客</view>
        </view>
        <view class="data-col">
          <view class="data-value">{{monthTotal}}</view>
          <view class="data-label">本月获客</view>
        </view>
      </view>
    </view>
    
    <!-- 趋势图 -->
    <view class="trend-card">
      <view class="card-title">获客趋势</view>
      <view class="tab-wrapper">
        <view 
          class="tab-item" 
          :class="{ active: timeRange === 'week' }"
          @click="changeTimeRange('week')"
        >本周</view>
        <view 
          class="tab-item" 
          :class="{ active: timeRange === 'month' }"
          @click="changeTimeRange('month')"
        >本月</view>
        <view 
          class="tab-item" 
          :class="{ active: timeRange === 'year' }"
          @click="changeTimeRange('year')"
        >全年</view>
      </view>
      
      <view class="chart-container">
        <LineChart
          :points="trendData"
          :xAxisLabels="timeRange === 'week' ? weekDays : (timeRange === 'month' ? monthDays : monthNames)"
          :color="getColorByChannel(channelInfo.bgColor)"
          class="custom-chart"
        ></LineChart>
      </view>
    </view>
    
    <!-- 客户列表 -->
    <view class="customer-list">
      <view class="list-header">
        <view class="list-title">新增客户</view>
        <view class="list-action" @click="viewAllCustomers">查看全部</view>
      </view>
      
      <view class="customer-item" v-for="(item, index) in customers" :key="index">
        <view class="customer-avatar">
          <template v-if="item.avatar">
            <image class="avatar" :src="item.avatar"></image>
          </template>
          <template v-else>
            <view class="avatar-icon">
              <u-icon name="account-fill" size="30" color="#4080ff"></u-icon>
            </view>
          </template>
        </view>
        <view class="customer-info">
          <view class="customer-name">{{item.name}}</view>
          <view class="customer-time">{{item.time}}</view>
        </view>
        <view class="customer-action">
          <u-button size="mini" type="primary" text="联系" @click="contactCustomer(item)"></u-button>
        </view>
      </view>
      
      <view class="empty-tip" v-if="customers.length === 0">
        暂无客户数据
      </view>
    </view>
  </view>
</template>

<script>
import LineChart from '@/components/LineChart.vue'

export default {
  components: {
    LineChart
  },
  data() {
    return {
      channelId: '',
      timeRange: 'week',
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      monthDays: Array.from({length: 30}, (_, i) => `${i+1}日`),
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      weekData: [52, 65, 78, 95, 110, 95, 80],
      monthData: [30, 45, 60, 75, 90, 105, 120, 135, 120, 105, 90, 75, 60, 45, 30, 45, 60, 75, 90, 105, 120, 135, 120, 105, 90, 75, 60, 45, 30],
      yearData: [100, 120, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330],
      customers: [
        { name: '张先生', time: '今天 12:30', avatar: null },
        { name: '李女士', time: '今天 10:15', avatar: null },
        { name: '王先生', time: '今天 09:45', avatar: null },
        { name: '赵女士', time: '今天 08:20', avatar: null }
      ],
      channels: [
        { id: 'douyin', name: '抖音获客', icon: 'play-right', bgColor: 'black', count: 156, increase: '+12.5%' },
        { id: 'xiaohongshu', name: '小红书获客', icon: 'heart', bgColor: 'red', count: 89, increase: '+8.3%' },
        { id: 'phone', name: '电话获客', icon: 'phone', bgColor: 'blue', count: 42, increase: '+15.8%' },
        { id: 'official', name: '公众号获客', icon: 'integral-fill', bgColor: 'green', count: 234, increase: '+15.7%' },
        { id: 'poster', name: '海报获客', icon: 'coupon', bgColor: 'yellow', count: 167, increase: '+10.2%' },
        { id: 'wechat-group', name: '微信群获客', icon: 'weixin-fill', bgColor: 'wechat', count: 145, increase: '+11.2%' }
      ]
    }
  },
  computed: {
    // 获取当前渠道信息
    channelInfo() {
      const channel = this.channels.find(item => item.id === this.channelId);
      return channel || { name: '获客详情', icon: 'home', bgColor: 'blue', count: 0, increase: '+0.0%' };
    },
    
    // 根据时间范围获取趋势数据
    trendData() {
      if (this.timeRange === 'week') {
        return this.weekData;
      } else if (this.timeRange === 'month') {
        return this.monthData;
      } else {
        return this.yearData;
      }
    },
    
    // 计算周总量
    weekTotal() {
      return this.weekData.reduce((sum, num) => sum + num, 0);
    },
    
    // 计算月总量
    monthTotal() {
      return this.monthData.slice(0, 30).reduce((sum, num) => sum + num, 0);
    }
  },
  onLoad(options) {
    // 获取渠道ID
    if (options.id) {
      this.channelId = options.id;
    }
    
    // 加载数据
    this.loadData();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 显示更多选项
    showOptions() {
      uni.showActionSheet({
        itemList: ['分享', '设置', '删除'],
        success: (res) => {
          console.log('选择了第' + (res.tapIndex + 1) + '个选项');
        }
      });
    },
    
    // 切换时间范围
    changeTimeRange(range) {
      this.timeRange = range;
    },
    
    // 查看全部客户
    viewAllCustomers() {
      uni.navigateTo({
        url: `/pages/scenarios/customers?id=${this.channelId}`
      });
    },
    
    // 联系客户
    contactCustomer(customer) {
      uni.showModal({
        title: '联系客户',
        content: `是否联系 ${customer.name}？`,
        success: (res) => {
          if (res.confirm) {
            console.log('联系客户:', customer);
          }
        }
      });
    },
    
    // 根据渠道类型获取颜色
    getColorByChannel(type) {
      const colorMap = {
        'black': '#000000',
        'red': '#fa5151',
        'blue': '#4080ff',
        'green': '#07c160',
        'yellow': '#ff9900',
        'wechat': '#07c160'
      };
      
      return colorMap[type] || '#4080ff';
    },
    
    // 加载数据
    loadData() {
      // 这里可以添加API调用获取实际数据
      console.log('加载获客详情数据:', this.channelId);
      // 示例数据已在data中预设
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  background-color: #fff;
  position: relative;
  
  .back-icon {
    width: 48rpx;
  }
  
  .title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
  
  .header-icons {
    display: flex;
    align-items: center;
  }
}

.data-overview {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .overview-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .channel-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20rpx;
      
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
    }
    
    .channel-info {
      .channel-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .channel-desc {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
  
  .overview-data {
    display: flex;
    justify-content: space-around;
    text-align: center;
    
    .data-col {
      flex: 1;
      
      .data-value {
        font-size: 44rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .data-label {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}

.trend-card {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .card-title {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    color: #333;
  }
  
  .tab-wrapper {
    display: flex;
    margin-bottom: 20rpx;
    
    .tab-item {
      padding: 10rpx 30rpx;
      font-size: 28rpx;
      color: #666;
      border-radius: 8rpx;
      margin-right: 20rpx;
      
      &.active {
        background-color: #ecf5ff;
        color: #4080ff;
      }
    }
  }
  
  .chart-container {
    height: 400rpx;
    
    .custom-chart {
      width: 100%;
      height: 100%;
    }
  }
}

.customer-list {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .list-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
    
    .list-action {
      font-size: 28rpx;
      color: #4080ff;
    }
  }
  
  .customer-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .customer-avatar {
      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;
      
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
    
    .customer-info {
      flex: 1;
      
      .customer-name {
        font-size: 32rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .customer-time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .empty-tip {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}
</style> 