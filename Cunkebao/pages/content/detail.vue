<template>
  <view class="detail-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <u-icon name="arrow-left" size="42" color="black"></u-icon>
      </view>
      <view class="title">内容库详情</view>
      <view class="header-right">
        <view class="save-btn" @click="saveContent">
          <u-icon name="checkbox-mark" size="28" color="#fff"></u-icon>
          <text class="save-text">保存</text>
        </view>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 内容库名称 -->
      <view class="form-item">
        <view class="form-label">内容库名称</view>
        <view class="form-input-box">
          <input type="text" v-model="form.title" placeholder="示例内容库" class="form-input" />
        </view>
      </view>
      
      <!-- 数据来源配置 -->
      <view class="form-item">
        <view class="form-label">数据来源配置</view>
        <view class="source-buttons">
          <view class="source-btn" :class="{ active: form.dataSource === 'friend' }" @click="setDataSource('friend')">
            <text>选择微信好友</text>
          </view>
          <view class="source-btn" :class="{ active: form.dataSource === 'group' }" @click="setDataSource('group')">
            <text>选择聊天群</text>
          </view>
        </view>
        
        <!-- 当选择微信好友时显示 -->
        <view class="friend-list-box" v-if="form.dataSource === 'friend'">
          <view class="friend-select-btn" @click="showFriendSelector">
            <text>选择微信好友</text>
          </view>
          <view class="selected-friends" v-if="form.selectedFriends.length > 0">
            <view class="friend-tag" v-for="(friend, index) in form.selectedFriends" :key="index">
              <text>{{friend.name || friend}}</text>
            </view>
          </view>
        </view>
        
        <!-- 当选择聊天群时显示 -->
        <view class="group-list-box" v-if="form.dataSource === 'group'">
          <view class="group-select-btn" @click="showGroupSelector">
            <text>选择聊天群</text>
          </view>
          <view class="selected-groups" v-if="form.selectedGroups.length > 0">
            <view class="group-tag" v-for="(group, index) in form.selectedGroups" :key="index">
              <text>{{group.name || group}}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 关键字设置 -->
      <view class="form-item">
        <view class="form-label">
          <text>关键字设置</text>
          <u-icon name="arrow-down" size="28" color="#666" @click="toggleKeywordSection"></u-icon>
        </view>
      </view>
      
      <!-- 是否启用AI -->
      <view class="form-item">
        <view class="form-label-with-desc">
          <view class="label-row">
            <text>是否启用AI</text>
            <u-switch v-model="form.enableAI" activeColor="#4080ff"></u-switch>
          </view>
          <view class="label-desc">
            <text>当启用AI之后，该内容库下的所有内容，都会通过AI重新生成内容。</text>
          </view>
        </view>
      </view>
      
      <!-- AI提示词 -->
      <view class="form-item" v-if="form.enableAI">
        <view class="form-label">AI 提示词</view>
        <view class="form-textarea-box">
          <textarea v-model="form.aiPrompt" placeholder="AI提示词示例" class="form-textarea" />
        </view>
      </view>
      
      <!-- 时间限制 -->
      <view class="form-item">
        <view class="form-label">时间限制</view>
        <view class="form-date-box" @click="showDatePicker">
          <u-icon name="calendar" size="28" color="#666"></u-icon>
          <text class="date-text">{{form.dateRange || '选择日期范围'}}</text>
        </view>
      </view>
      
      <!-- 是否启用 -->
      <view class="form-item">
        <view class="form-label-with-switch">
          <text>是否启用</text>
          <u-switch v-model="form.isEnabled" activeColor="#4080ff"></u-switch>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <CustomTabBar active="work"></CustomTabBar>
    
    <!-- 微信好友选择器 -->
    <FriendSelector 
      :show="showFriendSelectorFlag" 
      :selected="selectedFriendIds"
      :multiple="true"
      @update:show="showFriendSelectorFlag = $event"
      @confirm="handleFriendConfirm"
      @cancel="showFriendSelectorFlag = false"
    />
    
    <!-- 聊天群选择器 -->
    <GroupSelector 
      :show="showGroupSelectorFlag" 
      :selected="selectedGroupIds"
      :multiple="true"
      @update:show="showGroupSelectorFlag = $event"
      @confirm="handleGroupConfirm"
      @cancel="showGroupSelectorFlag = false"
    />
  </view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar.vue'
import FriendSelector from './components/FriendSelector.vue'
import GroupSelector from './components/GroupSelector.vue'

export default {
  components: {
    CustomTabBar,
    FriendSelector,
    GroupSelector
  },
  data() {
    return {
      id: '', // 编辑时的内容库ID
      form: {
        title: '', // 内容库名称
        dataSource: 'friend', // 数据来源: friend-微信好友, group-聊天群
        selectedFriends: [], // 已选择的好友
        selectedGroups: [], // 已选择的群组
        enableAI: true, // 是否启用AI
        aiPrompt: 'AI提示词示例', // AI提示词
        isKeywordExpanded: false, // 关键字设置是否展开
        dateRange: '', // 时间限制
        isEnabled: true // 是否启用
      },
      isEdit: false, // 是否为编辑模式
      showFriendSelectorFlag: false, // 是否显示好友选择器
      showGroupSelectorFlag: false, // 是否显示群组选择器
    }
  },
  computed: {
    // 获取已选择的好友ID列表
    selectedFriendIds() {
      return this.form.selectedFriends.map(friend => {
        return typeof friend === 'object' ? friend.id : friend;
      });
    },
    
    // 获取已选择的群组ID列表
    selectedGroupIds() {
      return this.form.selectedGroups.map(group => {
        return typeof group === 'object' ? group.id : group;
      });
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id;
      this.isEdit = true;
      this.loadContentDetail();
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 设置数据来源
    setDataSource(source) {
      this.form.dataSource = source;
    },
    
    // 显示好友选择器
    showFriendSelector() {
      this.showFriendSelectorFlag = true;
    },
    
    // 显示群组选择器
    showGroupSelector() {
      this.showGroupSelectorFlag = true;
    },
    
    // 处理好友选择确认
    handleFriendConfirm(selectedFriends) {
      this.form.selectedFriends = selectedFriends;
    },
    
    // 处理群组选择确认
    handleGroupConfirm(selectedGroups) {
      this.form.selectedGroups = selectedGroups;
    },
    
    // 切换关键字设置区域
    toggleKeywordSection() {
      this.form.isKeywordExpanded = !this.form.isKeywordExpanded;
    },
    
    // 显示日期选择器
    showDatePicker() {
      // 这里应该调用日期选择器组件
      uni.showToast({
        title: '日期选择功能开发中',
        icon: 'none'
      });
    },
    
    // 保存内容库
    saveContent() {
      // 表单验证
      if (!this.form.title) {
        uni.showToast({
          title: '请输入内容库名称',
          icon: 'none'
        });
        return;
      }
      
      // 验证是否选择了数据来源
      if (this.form.dataSource === 'friend' && this.form.selectedFriends.length === 0) {
        uni.showToast({
          title: '请选择微信好友',
          icon: 'none'
        });
        return;
      }
      
      if (this.form.dataSource === 'group' && this.form.selectedGroups.length === 0) {
        uni.showToast({
          title: '请选择聊天群',
          icon: 'none'
        });
        return;
      }
      
      // 在实际应用中，这里应该提交表单数据到服务器
      uni.showLoading({
        title: '保存中...'
      });
      
      // 模拟API请求
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 1000);
    },
    
    // 加载内容库详情数据
    loadContentDetail() {
      // 在实际应用中，这里应该从服务器获取内容库详情
      console.log('加载内容库详情:', this.id);
      // 模拟数据加载
      if (this.isEdit) {
        // 模拟已有数据
        this.form = {
          title: '示例内容库',
          dataSource: 'friend',
          selectedFriends: ['张三', '李四'],
          selectedGroups: [],
          enableAI: true,
          aiPrompt: 'AI提示词示例',
          isKeywordExpanded: false,
          dateRange: '',
          isEnabled: true
        };
      }
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
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .form-label-with-desc {
      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .label-desc {
        font-size: 24rpx;
        color: #999;
        line-height: 1.4;
      }
    }
    
    .form-label-with-switch {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
    }
    
    .form-input-box {
      .form-input {
        width: 100%;
        height: 80rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
      }
    }
    
    .form-textarea-box {
      .form-textarea {
        width: 100%;
        height: 200rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        padding: 20rpx;
        font-size: 28rpx;
      }
    }
    
    .source-buttons {
      display: flex;
      margin-bottom: 20rpx;
      
      .source-btn {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        font-size: 28rpx;
        color: #666;
        
        &:first-child {
          border-top-left-radius: 8rpx;
          border-bottom-left-radius: 8rpx;
          border-right: 1px solid #e0e0e0;
        }
        
        &:last-child {
          border-top-right-radius: 8rpx;
          border-bottom-right-radius: 8rpx;
        }
        
        &.active {
          background-color: #e6f7ff;
          color: #4080ff;
          font-weight: 500;
        }
      }
    }
    
    .friend-list-box, .group-list-box {
      .friend-select-btn, .group-select-btn {
        width: 100%;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
      }
      
      .selected-friends, .selected-groups {
        display: flex;
        flex-wrap: wrap;
        
        .friend-tag, .group-tag {
          background-color: #f5f5f5;
          border-radius: 30rpx;
          padding: 10rpx 20rpx;
          margin-right: 15rpx;
          margin-bottom: 15rpx;
          font-size: 26rpx;
          color: #666;
        }
      }
    }
    
    .form-date-box {
      width: 100%;
      height: 80rpx;
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 0 20rpx;
      
      .date-text {
        margin-left: 10rpx;
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}
</style> 