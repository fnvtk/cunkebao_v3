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
    <view class="friend-selector">
      <!-- 标题栏 -->
      <view class="selector-header">
        <text class="selector-title">选择微信好友</text>
        <view class="close-icon" @click="onClose">
          <u-icon name="close" size="28" color="#999"></u-icon>
        </view>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-box">
        <u-search
          v-model="searchKeyword"
          placeholder="搜索好友"
          :showAction="false"
          clearabled
          shape="round"
          :clearabled="true"
          height="70"
          bgColor="#f4f4f4"
        ></u-search>
      </view>
      
      <!-- 好友列表 -->
      <scroll-view scroll-y class="friend-list">
        <view 
          class="friend-item" 
          v-for="(friend, index) in filteredFriends" 
          :key="index"
          @click="toggleSelect(friend)"
        >
          <view class="friend-checkbox">
            <u-radio 
              :name="friend.id" 
              v-model="friend.selected"
              :disabled="disabled"
              @change="() => toggleSelect(friend)"
              shape="circle"
              activeColor="#4080ff"
            ></u-radio>
          </view>
          <view class="friend-avatar">
            <image :src="friend.avatar || '/static/images/avatar.png'" mode="aspectFill" class="avatar-img"></image>
          </view>
          <view class="friend-info">
            <view class="friend-name">{{friend.name}}</view>
            <view class="friend-id">{{friend.wechatId}}</view>
            <view class="friend-client">归属客户：{{friend.client}}</view>
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
  name: 'FriendSelector',
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
      friends: [
        {
          id: '1',
          name: '好友1',
          wechatId: 'wxid_0y06hq00',
          client: '客户1',
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '2',
          name: '好友2',
          wechatId: 'wxid_mt5oz9fz',
          client: '客户2',
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '3',
          name: '好友3',
          wechatId: 'wxid_bma8xfh8',
          client: '客户3',
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '4',
          name: '好友4',
          wechatId: 'wxid_9xazw62h',
          client: '客户4',
          avatar: '/static/images/avatar.png',
          selected: false
        },
        {
          id: '5',
          name: '好友5',
          wechatId: 'wxid_v1fv02q3',
          avatar: '/static/images/avatar.png',
          selected: false
        }
      ]
    }
  },
  computed: {
    filteredFriends() {
      if (!this.searchKeyword) {
        return this.friends;
      }
      
      return this.friends.filter(friend => 
        friend.name.includes(this.searchKeyword) || 
        friend.wechatId.includes(this.searchKeyword) ||
        (friend.client && friend.client.includes(this.searchKeyword))
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
      this.friends.forEach(friend => {
        friend.selected = this.selected.includes(friend.id);
      });
    },
    
    // 切换选择状态
    toggleSelect(friend) {
      if (this.disabled) return;
      
      if (!this.multiple) {
        // 单选模式
        this.friends.forEach(item => {
          item.selected = item.id === friend.id;
        });
      } else {
        // 多选模式
        friend.selected = !friend.selected;
      }
    },
    
    // 取消按钮
    onCancel() {
      this.$emit('cancel');
      this.$emit('update:show', false);
    },
    
    // 确定按钮
    onConfirm() {
      const selectedFriends = this.friends.filter(friend => friend.selected);
      this.$emit('confirm', selectedFriends);
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
.friend-selector {
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
  
  .friend-list {
    flex: 1;
    padding: 0 30rpx;
    overflow-y: auto;
    
    .friend-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1px solid #f5f5f5;
      
      .friend-checkbox {
        margin-right: 20rpx;
      }
      
      .friend-avatar {
        width: 80rpx;
        height: 80rpx;
        margin-right: 20rpx;
        border-radius: 50%;
        overflow: hidden;
        background-color: #f5f5f5;
        
        .avatar-img {
          width: 100%;
          height: 100%;
        }
      }
      
      .friend-info {
        flex: 1;
        
        .friend-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 4rpx;
        }
        
        .friend-id {
          font-size: 26rpx;
          color: #999;
          margin-bottom: 4rpx;
        }
        
        .friend-client {
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