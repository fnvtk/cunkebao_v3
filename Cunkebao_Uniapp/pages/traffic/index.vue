<template>
  <view class="traffic-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">流量分发</view>
      <view class="header-right">
        <view class="add-btn" @click="createTraffic">
          <u-icon name="plus" size="28" color="#fff"></u-icon>
          <text class="add-text">新建分发</text>
        </view>
      </view>
    </view>
    
    <!-- 流量包列表 -->
    <view class="traffic-list">
      <!-- 普通流量包 -->
      <view class="traffic-item">
        <view class="traffic-header">
          <text class="traffic-title">普通流量包</text>
          <view class="traffic-actions">
            <u-icon name="edit-pen" size="36" color="#999" @click="editTraffic(1)"></u-icon>
            <u-icon name="trash" size="36" color="#999" @click="deleteTraffic(1)" class="trash-icon"></u-icon>
          </view>
        </view>
        <view class="traffic-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">0.50</text>
          <text class="price-unit">/ 流量包</text>
        </view>
        <view class="traffic-info">
          <text class="total-added">总添加人数: 10 人</text>
        </view>
        <view class="traffic-tags">
          <view class="tag">新用户</view>
          <view class="tag">低活跃度</view>
          <view class="tag">全国</view>
        </view>
      </view>
      
      <!-- 高质量流量 -->
      <view class="traffic-item">
        <view class="traffic-header">
          <text class="traffic-title">高质量流量</text>
          <view class="traffic-actions">
            <u-icon name="edit-pen" size="36" color="#999" @click="editTraffic(2)"></u-icon>
            <u-icon name="trash" size="36" color="#999" @click="deleteTraffic(2)" class="trash-icon"></u-icon>
          </view>
        </view>
        <view class="traffic-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">2.50</text>
          <text class="price-unit">/ 流量包</text>
        </view>
        <view class="traffic-info">
          <text class="total-added">总添加人数: 25 人</text>
        </view>
        <view class="traffic-tags">
          <view class="tag">高消费</view>
          <view class="tag">高活跃度</view>
          <view class="tag">一线城市</view>
        </view>
      </view>
      
      <!-- 精准营销流量 -->
      <view class="traffic-item">
        <view class="traffic-header">
          <text class="traffic-title">精准营销流量</text>
          <view class="traffic-actions">
            <u-icon name="edit-pen" size="36" color="#999" @click="editTraffic(3)"></u-icon>
            <u-icon name="trash" size="36" color="#999" @click="deleteTraffic(3)" class="trash-icon"></u-icon>
          </view>
        </view>
        <view class="traffic-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">3.80</text>
          <text class="price-unit">/ 流量包</text>
        </view>
        <view class="traffic-info">
          <text class="total-added">总添加人数: 50 人</text>
        </view>
        <view class="traffic-tags">
          <view class="tag">潜在客户</view>
          <view class="tag">有购买意向</view>
          <view class="tag">华东地区</view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
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
      trafficItems: [
        {
          id: 1,
          title: '普通流量包',
          price: 0.5,
          totalAdded: 10,
          tags: ['新用户', '低活跃度', '全国']
        },
        {
          id: 2,
          title: '高质量流量',
          price: 2.5,
          totalAdded: 25,
          tags: ['高消费', '高活跃度', '一线城市']
        },
        {
          id: 3,
          title: '精准营销流量',
          price: 3.8,
          totalAdded: 50,
          tags: ['潜在客户', '有购买意向', '华东地区']
        }
      ]
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 创建新的流量分发
    createTraffic() {
      uni.navigateTo({
        url: '/pages/traffic/create'
      })
    },
    
    // 编辑流量分发
    editTraffic(id) {
      uni.navigateTo({
        url: `/pages/traffic/create?id=${id}`
      })
    },
    
    // 删除流量分发
    deleteTraffic(id) {
      uni.showModal({
        title: '提示',
        content: '确定要删除该流量分发吗？',
        success: (res) => {
          if (res.confirm) {
            // 模拟删除操作
            this.trafficItems = this.trafficItems.filter(item => item.id !== id);
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.traffic-container {
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
      
      .add-text {
        font-size: 28rpx;
        margin-left: 8rpx;
      }
    }
  }
}

.traffic-list {
  padding: 30rpx;
  
  .traffic-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .traffic-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .traffic-title {
        font-size: 34rpx;
        font-weight: 600;
        color: #333;
      }
      
      .traffic-actions {
        display: flex;
        
        .trash-icon {
          margin-left: 20rpx;
        }
      }
    }
    
    .traffic-price {
      display: flex;
      align-items: baseline;
      margin-bottom: 20rpx;
      
      .price-symbol {
        font-size: 30rpx;
        color: #1cc15e;
        font-weight: 600;
      }
      
      .price-value {
        font-size: 60rpx;
        color: #1cc15e;
        font-weight: 700;
        font-family: 'Digital-Bold', sans-serif;
        margin: 0 8rpx;
      }
      
      .price-unit {
        font-size: 28rpx;
        color: #666;
      }
    }
    
    .traffic-info {
      margin-bottom: 20rpx;
      
      .total-added {
        font-size: 28rpx;
        color: #666;
      }
    }
    
    .traffic-tags {
      display: flex;
      flex-wrap: wrap;
      
      .tag {
        background-color: #f5f5f5;
        border-radius: 8rpx;
        padding: 8rpx 16rpx;
        font-size: 24rpx;
        color: #666;
        margin-right: 16rpx;
        margin-bottom: 16rpx;
      }
    }
  }
}
</style> 