<template>
  <view class="traffic-create-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">{{pageTitle}}</view>
      <view class="header-right">
        <view class="save-btn" @click="saveTraffic">
          <text class="save-text">保存</text>
        </view>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 流量包名称 -->
      <view class="form-item">
        <view class="form-label">流量包名称</view>
        <view class="form-input-box">
          <input type="text" v-model="form.title" placeholder="例如：普通流量包" class="form-input" />
        </view>
      </view>
      
      <!-- 价格设置 -->
      <view class="form-item">
        <view class="form-label">价格设置（元/流量包）</view>
        <view class="form-input-box">
          <input type="digit" v-model="form.price" placeholder="0.00" class="form-input" />
        </view>
      </view>
      
      <!-- 流量规模 -->
      <view class="form-item">
        <view class="form-label">流量规模（人数）</view>
        <view class="form-input-box">
          <input type="number" v-model="form.quantity" placeholder="0" class="form-input" />
        </view>
      </view>
      
      <!-- 标签管理 -->
      <view class="form-item">
        <view class="form-label">标签管理</view>
        <view class="tags-container">
          <view class="tags-list">
            <view
              v-for="(tag, index) in form.tags"
              :key="index"
              class="tag-item"
            >
              <text class="tag-text">{{tag}}</text>
              <text class="tag-delete" @click="removeTag(index)">×</text>
            </view>
            <view class="tag-add" @click="showAddTagModal">
              <text>+ 添加标签</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 流量来源 -->
      <view class="form-item">
        <view class="form-label">流量来源</view>
        <view class="source-radios">
          <view 
            class="source-radio" 
            :class="{ active: form.source === 'platform' }"
            @click="form.source = 'platform'"
          >
            <view class="radio-dot">
              <view class="inner-dot" v-if="form.source === 'platform'"></view>
            </view>
            <text>平台</text>
          </view>
          <view 
            class="source-radio" 
            :class="{ active: form.source === 'custom' }"
            @click="form.source = 'custom'"
          >
            <view class="radio-dot">
              <view class="inner-dot" v-if="form.source === 'custom'"></view>
            </view>
            <text>自定义</text>
          </view>
        </view>
      </view>
      
      <!-- 地区限制 -->
      <view class="form-item">
        <view class="form-label">地区限制</view>
        <view class="region-select" @click="showRegionSelector">
          <text>{{form.region || '选择地区'}}</text>
          <u-icon name="arrow-right" size="28" color="#999"></u-icon>
        </view>
      </view>
      
      <!-- 流量时间 -->
      <view class="form-item">
        <view class="form-label">流量时间</view>
        <view class="datetime-select" @click="showDatetimePicker">
          <text>{{form.datetime || '选择时间'}}</text>
          <u-icon name="arrow-right" size="28" color="#999"></u-icon>
        </view>
      </view>
      
      <!-- 流量限制 -->
      <view class="form-item">
        <view class="form-label-with-switch">
          <text>流量限制</text>
          <u-switch v-model="form.enableLimit" activeColor="#4080ff"></u-switch>
        </view>
        <view class="limit-input-box" v-if="form.enableLimit">
          <input type="number" v-model="form.limitPerDay" placeholder="每日限制数量" class="form-input" />
        </view>
      </view>
    </view>
    
    <!-- 添加标签弹窗 -->
    <u-popup :show="showTagModal" @close="hideAddTagModal" mode="center">
      <view class="tag-modal">
        <view class="tag-modal-header">
          <text class="modal-title">添加标签</text>
        </view>
        <view class="tag-modal-body">
          <input type="text" v-model="newTagText" placeholder="请输入标签名称" class="tag-input" />
        </view>
        <view class="tag-modal-footer">
          <view class="modal-btn cancel-btn" @click="hideAddTagModal">取消</view>
          <view class="modal-btn confirm-btn" @click="addNewTag">确定</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isEdit: false, // 是否为编辑模式
      trafficId: null, // 流量包ID
      form: {
        title: '', // 流量包名称
        price: '', // 价格
        quantity: '', // 流量规模
        tags: [], // 标签数组
        source: 'platform', // 流量来源：platform-平台，custom-自定义
        region: '', // 地区限制
        datetime: '', // 流量时间
        enableLimit: false, // 是否启用流量限制
        limitPerDay: '' // 每日限制数量
      },
      showTagModal: false, // 是否显示添加标签弹窗
      newTagText: '' // 新标签的文本
    }
  },
  onLoad(options) {
    // 判断是否为编辑模式
    if (options.id) {
      this.isEdit = true;
      this.trafficId = options.id;
      this.loadTrafficData();
    }
  },
  computed: {
    // 页面标题
    pageTitle() {
      return this.isEdit ? '编辑分发' : '新建分发';
    }
  },
  methods: {
    // 加载流量包数据
    loadTrafficData() {
      uni.showLoading({
        title: '加载中...'
      });
      
      // 模拟API请求获取数据
      setTimeout(() => {
        // 根据ID获取对应的数据
        // 这里使用模拟数据
        let mockData = {
          1: {
            title: '普通流量包',
            price: '0.50',
            quantity: '10',
            tags: ['新用户', '低活跃度', '全国'],
            source: 'platform',
            region: '全国',
            datetime: '2023-09-01',
            enableLimit: true,
            limitPerDay: '5'
          },
          2: {
            title: '高质量流量',
            price: '2.50',
            quantity: '25',
            tags: ['高消费', '高活跃度', '一线城市'],
            source: 'custom',
            region: '一线城市',
            datetime: '2023-09-05',
            enableLimit: false,
            limitPerDay: ''
          },
          3: {
            title: '精准营销流量',
            price: '3.80',
            quantity: '50',
            tags: ['潜在客户', '有购买意向', '华东地区'],
            source: 'platform',
            region: '华东地区',
            datetime: '2023-09-10',
            enableLimit: true,
            limitPerDay: '10'
          }
        };
        
        // 获取数据并填充表单
        if (mockData[this.trafficId]) {
          this.form = mockData[this.trafficId];
          uni.hideLoading();
        } else {
          uni.hideLoading();
          uni.showToast({
            title: '未找到对应数据',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      }, 1000);
    },
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 保存流量包
    saveTraffic() {
      // 表单验证
      if (!this.form.title) {
        uni.showToast({
          title: '请输入流量包名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.form.price) {
        uni.showToast({
          title: '请输入价格',
          icon: 'none'
        });
        return;
      }
      
      if (!this.form.quantity) {
        uni.showToast({
          title: '请输入流量规模',
          icon: 'none'
        });
        return;
      }
      
      // 在实际应用中，这里应该提交表单数据到服务器
      uni.showLoading({
        title: this.isEdit ? '更新中...' : '保存中...'
      });
      
      // 模拟API请求
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: this.isEdit ? '更新成功' : '创建成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 1000);
    },
    
    // 显示添加标签弹窗
    showAddTagModal() {
      this.showTagModal = true;
      this.newTagText = '';
    },
    
    // 隐藏添加标签弹窗
    hideAddTagModal() {
      this.showTagModal = false;
    },
    
    // 添加新标签
    addNewTag() {
      if (this.newTagText.trim()) {
        this.form.tags.push(this.newTagText.trim());
        this.hideAddTagModal();
      } else {
        uni.showToast({
          title: '标签名称不能为空',
          icon: 'none'
        });
      }
    },
    
    // 删除标签
    removeTag(index) {
      this.form.tags.splice(index, 1);
    },
    
    // 显示地区选择器
    showRegionSelector() {
      // 这里应该调用地区选择器组件
      uni.showToast({
        title: '地区选择功能开发中',
        icon: 'none'
      });
    },
    
    // 显示时间选择器
    showDatetimePicker() {
      // 这里应该调用时间选择器组件
      uni.showToast({
        title: '时间选择功能开发中',
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.traffic-create-container {
  min-height: 100vh;
  background-color: #f9fafb;
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
    .save-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #4080ff;
      border-radius: 30rpx;
      padding: 12rpx 24rpx;
      color: #fff;
      
      .save-text {
        font-size: 28rpx;
      }
    }
  }
}

.form-container {
  padding: 20rpx 30rpx;
  
  .form-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    
    .form-label {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .form-label-with-switch {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .form-input-box, .limit-input-box {
      .form-input {
        width: 100%;
        height: 80rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
      }
    }
    
    .tags-container {
      .tags-list {
        display: flex;
        flex-wrap: wrap;
        
        .tag-item {
          display: flex;
          align-items: center;
          background-color: #f0f7ff;
          border-radius: 8rpx;
          padding: 10rpx 16rpx;
          margin-right: 16rpx;
          margin-bottom: 16rpx;
          
          .tag-text {
            font-size: 26rpx;
            color: #4080ff;
          }
          
          .tag-delete {
            font-size: 28rpx;
            color: #999;
            margin-left: 10rpx;
            padding: 0 5rpx;
          }
        }
        
        .tag-add {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          padding: 10rpx 16rpx;
          margin-bottom: 16rpx;
          
          text {
            font-size: 26rpx;
            color: #666;
          }
        }
      }
    }
    
    .source-radios {
      display: flex;
      
      .source-radio {
        display: flex;
        align-items: center;
        margin-right: 40rpx;
        
        .radio-dot {
          width: 36rpx;
          height: 36rpx;
          border-radius: 50%;
          border: 2rpx solid #999;
          margin-right: 10rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .inner-dot {
            width: 20rpx;
            height: 20rpx;
            border-radius: 50%;
            background-color: #4080ff;
          }
        }
        
        text {
          font-size: 28rpx;
          color: #333;
        }
        
        &.active {
          .radio-dot {
            border-color: #4080ff;
          }
        }
      }
    }
    
    .region-select, .datetime-select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 80rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 0 20rpx;
      
      text {
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}

.tag-modal {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .tag-modal-header {
    padding: 30rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
    
    .modal-title {
      font-size: 34rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .tag-modal-body {
    padding: 30rpx;
    
    .tag-input {
      width: 100%;
      height: 80rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
    }
  }
  
  .tag-modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
    
    .modal-btn {
      flex: 1;
      height: 90rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      
      &.cancel-btn {
        color: #666;
        border-right: 1rpx solid #f0f0f0;
      }
      
      &.confirm-btn {
        color: #4080ff;
      }
    }
  }
}
</style> 