<template>
  <view class="custom-tab-bar">
    <view 
      class="tab-item" 
      :class="{ active: active === 'home' }" 
      @click="switchTab('/pages/index/index', 'home')"
    >
      <u-icon :name="active === 'home' ? 'home-fill' : 'home'" :size="48" :color="active === 'home' ? '#4080ff' : '#e9e9e9'"></u-icon>
      <text class="tab-text" :class="{ 'active-text': active === 'home' }">首页</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{ active: active === 'market' }" 
      @click="switchTab('/pages/scenarios/index', 'market')"
    >
      <u-icon :name="active === 'market' ? 'tags-fill' : 'tags'" :size="48" :color="active === 'market' ? '#4080ff' : '#e9e9e9'"></u-icon>
      <text class="tab-text" :class="{ 'active-text': active === 'market' }">场景获客</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{ active: active === 'work' }" 
      @click="switchTab('/pages/work/index', 'work')"
    >
      <u-icon :name="active === 'work' ? 'grid-fill' : 'grid'" :size="48" :color="active === 'work' ? '#4080ff' : '#e9e9e9'"></u-icon>
      <text class="tab-text" :class="{ 'active-text': active === 'work' }">工作台</text>
    </view>
    
    <view 
      class="tab-item" 
      :class="{ active: active === 'profile' }" 
      @click="switchTab('/pages/profile/index', 'profile')"
    >
      <u-icon :name="active === 'profile' ? 'account-fill' : 'account'" :size="48" :color="active === 'profile' ? '#4080ff' : '#e9e9e9'"></u-icon>
      <text class="tab-text" :class="{ 'active-text': active === 'profile' }">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  props: {
    active: {
      type: String,
      default: 'home'
    }
  },
  methods: {
    switchTab(url, tab) {
      if (this.active !== tab) {
        uni.reLaunch({
          url: url
        });
        
        // 也可以通过事件通知父组件
        this.$emit('change', tab);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 10rpx;
    
    .tab-text {
      font-size: 26rpx;
      color: #999;
      
      &.active-text {
        color: #4080ff;
      }
    }
  }
}
</style> 