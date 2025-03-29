<template>
  <u-popup
    :show="show"
    @close="onClose"
    mode="bottom"
    :safeAreaInsetBottom="true"
    :round="10"
    :closeable="true"
    closeIconPos="top-right"
    closeIconColor="#999"
    :maskCloseAble="true"
    height="85%"
  >
    <view class="group-selector">
      <!-- 标题栏 -->
      <view class="selector-header">
        <text class="selector-title">选择聊天群</text>
        <view class="close-icon" @click="onClose">
          <u-icon name="close" size="28" color="#999"></u-icon>
        </view>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-box">
        <u-search
          v-model="searchKeyword"
          placeholder="搜索聊天群"
          :showAction="false"
          clearabled
          shape="round"
          :clearabled="true"
          height="70"
          bgColor="#f4f4f4"
        ></u-search>
      </view>
      
      <!-- 群列表 -->
      <scroll-view scroll-y class="group-list">
        <view 
          class="group-item" 
          v-for="(group, index) in filteredGroups" 
          :key="index"
          @click="toggleSelect(group)"
        >
          <view class="group-checkbox">
            <u-radio 
              :name="group.id" 
              v-model="group.selected"
              :disabled="disabled"
              @change="() => toggleSelect(group)"
              shape="circle"
              activeColor="#4080ff"
            ></u-radio>
          </view>
          <view class="group-avatar">
            <image :src="group.avatar || '/static/images/avatar.png'" mode="aspectFill" class="avatar-img"></image>
          </view>
          <view class="group-info">
            <view class="group-name">{{group.name}}</view>
            <view class="group-id">{{group.groupId}}</view>
            <view class="group-member-count">{{group.memberCount}}人</view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 底部按钮 -->
      <view class="action-buttons">
        <view class="cancel-btn" @click="onCancel">取消</view>
        <view class="confirm-btn" @click="onConfirm">确定</view>
      </view>
    </view>
  </u-popup>
</template>

<script>
export default {
  name: 'GroupSelector',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchKeyword: '',
      groups: [
        {
          id: '1',
          name: '产品讨论群',
          groupId: '12345678910',
          memberCount: 120,
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '2',
          name: '客户交流群',
          groupId: '28374656374',
          memberCount: 88,
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '3',
          name: '企业内部群',
          groupId: '98374625162',
          memberCount: 56,
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '4',
          name: '推广活动群',
          groupId: '38273645123',
          memberCount: 240,
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '5',
          name: '售后服务群',
          groupId: '73645182934',
          memberCount: 178,
          avatar: '/static/images/avatar.png',
          selected: false
        }
      ]
    }
  },
  computed: {
    filteredGroups() {
      if (!this.searchKeyword) {
        return this.groups;
      }
      
      return this.groups.filter(group => 
        group.name.includes(this.searchKeyword) || 
        group.groupId.includes(this.searchKeyword)
      );
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.initSelection();
      }
    },
    selected: {
      handler: function(newVal) {
        this.initSelection();
      },
      immediate: true
    }
  },
  methods: {
    // 初始化选择状态
    initSelection() {
      this.groups.forEach(group => {
        group.selected = this.selected.includes(group.id);
      });
    },
    
    // 切换选择状态
    toggleSelect(group) {
      if (this.disabled) return;
      
      if (!this.multiple) {
        // 单选模式
        this.groups.forEach(item => {
          item.selected = item.id === group.id;
        });
      } else {
        // 多选模式
        group.selected = !group.selected;
      }
    },
    
    // 取消按钮
    onCancel() {
      this.$emit('cancel');
      this.$emit('update:show', false);
    },
    
    // 确定按钮
    onConfirm() {
      const selectedGroups = this.groups.filter(group => group.selected);
      this.$emit('confirm', selectedGroups);
      this.$emit('update:show', false);
    },
    
    // 关闭弹窗
    onClose() {
      this.$emit('cancel');
      this.$emit('update:show', false);
    }
  }
}
</script>

<style lang="scss" scoped>
.group-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .selector-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30rpx;
    position: relative;
    border-bottom: 1px solid #f0f0f0;
    
    .selector-title {
      font-size: 34rpx;
      font-weight: 500;
      color: #333;
    }
    
    .close-icon {
      position: absolute;
      right: 30rpx;
      top: 30rpx;
      padding: 10rpx;
    }
  }
  
  .search-box {
    padding: 20rpx 30rpx;
  }
  
  .group-list {
    flex: 1;
    padding: 0 30rpx;
    overflow-y: auto;
    
    .group-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1px solid #f5f5f5;
      
      .group-checkbox {
        margin-right: 20rpx;
      }
      
      .group-avatar {
        width: 80rpx;
        height: 80rpx;
        margin-right: 20rpx;
        border-radius: 10rpx;
        overflow: hidden;
        background-color: #f5f5f5;
        
        .avatar-img {
          width: 100%;
          height: 100%;
        }
      }
      
      .group-info {
        flex: 1;
        
        .group-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 4rpx;
        }
        
        .group-id {
          font-size: 26rpx;
          color: #999;
          margin-bottom: 4rpx;
        }
        
        .group-member-count {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    padding: 20rpx 30rpx;
    border-top: 1px solid #f0f0f0;
    
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
</style> 