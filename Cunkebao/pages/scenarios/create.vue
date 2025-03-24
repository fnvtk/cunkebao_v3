<template>
  <view class="create-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="26"></u-icon>
      </view>
      <view class="title">新建计划</view>
      <view class="header-icons">
        <u-icon name="checkmark" size="26" color="#4080ff" class="icon-save" @click="savePlan"></u-icon>
      </view>
    </view>
    
    <!-- 表单区域 -->
    <view class="form-content">
      <u-form :model="formData" ref="uForm">
        <u-form-item label="计划名称" prop="name">
          <u-input v-model="formData.name" placeholder="请输入计划名称" />
        </u-form-item>
        
        <u-form-item label="获客渠道" prop="channel">
          <u-input v-model="formData.channelName" placeholder="选择获客渠道" @click="showChannelPicker" disabled disabledColor="#ffffff" />
          <u-icon slot="right" name="arrow-right" size="24" color="#c8c9cc"></u-icon>
        </u-form-item>
        
        <u-form-item label="目标人数" prop="target">
          <u-input v-model="formData.target" placeholder="请输入目标获客人数" type="number" />
        </u-form-item>
        
        <u-form-item label="开始日期" prop="startDate">
          <u-input v-model="formData.startDate" placeholder="选择开始日期" @click="showDatePicker('start')" disabled disabledColor="#ffffff" />
          <u-icon slot="right" name="calendar" size="24" color="#c8c9cc"></u-icon>
        </u-form-item>
        
        <u-form-item label="结束日期" prop="endDate">
          <u-input v-model="formData.endDate" placeholder="选择结束日期" @click="showDatePicker('end')" disabled disabledColor="#ffffff" />
          <u-icon slot="right" name="calendar" size="24" color="#c8c9cc"></u-icon>
        </u-form-item>
        
        <u-form-item label="描述" prop="description">
          <u-input v-model="formData.description" type="textarea" placeholder="请输入计划描述" />
        </u-form-item>
      </u-form>
    </view>
    
    <!-- 渠道选择器 -->
    <u-select
      :list="channelList"
      v-model="showChannelSelect"
      @confirm="confirmChannel"
    ></u-select>
    
    <!-- 日期选择器 -->
    <u-calendar
      v-model="showDateSelect"
      :mode="dateMode"
      @confirm="confirmDate"
    ></u-calendar>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        name: '',
        channel: '',
        channelName: '',
        target: '',
        startDate: '',
        endDate: '',
        description: ''
      },
      showChannelSelect: false,
      showDateSelect: false,
      dateMode: 'single',
      dateType: 'start',
      channelList: [
        { value: 'douyin', label: '抖音获客' },
        { value: 'xiaohongshu', label: '小红书获客' },
        { value: 'phone', label: '电话获客' },
        { value: 'official', label: '公众号获客' },
        { value: 'poster', label: '海报获客' },
        { value: 'wechat-group', label: '微信群获客' }
      ]
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 显示渠道选择器
    showChannelPicker() {
      this.showChannelSelect = true;
    },
    
    // 确认选择渠道
    confirmChannel(e) {
      this.formData.channel = e[0].value;
      this.formData.channelName = e[0].label;
    },
    
    // 显示日期选择器
    showDatePicker(type) {
      this.dateType = type;
      this.showDateSelect = true;
    },
    
    // 确认选择日期
    confirmDate(e) {
      const dateStr = e.year + '-' + e.month + '-' + e.day;
      if (this.dateType === 'start') {
        this.formData.startDate = dateStr;
      } else {
        this.formData.endDate = dateStr;
      }
    },
    
    // 保存计划
    savePlan() {
      // 表单验证
      if (!this.formData.name) {
        uni.showToast({
          title: '请输入计划名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.formData.channel) {
        uni.showToast({
          title: '请选择获客渠道',
          icon: 'none'
        });
        return;
      }
      
      // 显示保存成功
      uni.showLoading({
        title: '保存中'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
.create-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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

.form-content {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}
</style> 