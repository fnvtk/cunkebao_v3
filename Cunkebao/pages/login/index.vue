<template>
  <view class="login-container">
    <!-- 登录方式切换 -->
    <view class="tabs-container">
      <u-tabs
        :list="tabsList"
        :current="current"
        @change="handleTabChange"
        activeStyle="color: #4080ff; font-weight: bold; font-size: 36rpx"
        inactiveStyle="color: #999999; font-size: 36rpx"
        itemStyle="height: 96rpx; padding: 0 30rpx;"
        lineColor="#4080ff"
        lineWidth="48rpx"
        lineHeight="4rpx"
        :itemWidth="300"
      ></u-tabs>
    </view>
    
    <!-- 提示文字 -->
    <view class="login-hint">
      你所在地区仅支持 手机号 / 微信 / Apple 登录
    </view>
    
    <!-- 表单区域 -->
    <view class="login-form">
      <!-- 手机号输入 -->
      <u-form-item>
        <u--input
          v-model="form.mobile"
          placeholder="+86手机号"
          prefixIcon="phone"
          prefixIconStyle="font-size: 52rpx;color: #909399;padding-right: 16rpx;"
          clearable
          type="number"
          maxlength="11"
          border="none"
          fontSize="36rpx"
        ></u--input>
      </u-form-item>
      
      <!-- 验证码输入 -->
      <u-form-item v-if="current === 0">
        <u--input
          v-model="form.code"
          placeholder="验证码"
          clearable
          type="number"
          maxlength="6"
          border="none"
          inputAlign="left"
          fontSize="36rpx"
        ></u--input>
        <template #right>
          <view class="code-btn-wrap">
            <u-button 
              @tap="getCode" 
              :text="codeTips" 
              type="primary" 
              size="mini" 
              :disabled="!isValidMobile || sending"
              customStyle="width: 200rpx;height: 76rpx;font-size: 32rpx;"
            ></u-button>
          </view>
        </template>
      </u-form-item>
      
      <!-- 密码输入 -->
      <u-form-item v-if="current === 1">
        <u--input
          v-model="form.password"
          placeholder="密码"
          prefixIcon="lock"
          prefixIconStyle="font-size: 52rpx;color: #909399;padding-right: 16rpx;"
          :password="!showPassword"
          clearable
          border="none"
          fontSize="36rpx"
        ></u--input>
        <template #right>
          <u-icon
            :name="showPassword ? 'eye' : 'eye-off'"
            color="#909399"
            size="52"
            @click="showPassword = !showPassword"
          ></u-icon>
        </template>
      </u-form-item>
      
      <!-- 用户协议 -->
      <view class="agreement">
        <u-checkbox
          v-model="isAgree"
          shape="circle"
          activeColor="#4080ff"
          iconSize="24"
        ></u-checkbox>
        <text class="agreement-text">
          已阅读并同意 
          <text class="link" @click="goToUserAgreement"> 用户协议 </text> 
          与 
          <text class="link" @click="goToPrivacyPolicy"> 隐私政策 </text>
        </text>
      </view>
      
      <!-- 登录按钮 -->
      <u-button
        text="登录"
        type="info"
        :disabled="!canLogin"
        @click="handleLogin"
        customStyle="width: 100%; margin-top: 40rpx; height: 96rpx; border-radius: 24rpx; font-size: 40rpx; font-weight: bold; background-color: #2563eb;"
      ></u-button>
      
      <!-- 分割线 -->
      <view class="divider">
        <view class="line"></view>
        <view class="text">或</view>
        <view class="line"></view>
      </view>
      
      <!-- 第三方登录 -->
      <view class="other-login">
        <!-- 微信登录 -->
        <u-button
          text="使用微信登录"
          @click="handleWechatLogin"
          icon="weixin-fill"
          iconSize="52"
          plain
          customStyle="width: 100%; margin-bottom: 20rpx; height: 96rpx; border-radius: 24rpx; border-color: #07c160; color: #07c160; font-size: 40rpx;"
        ></u-button>
        
        <!-- Apple登录 -->
        <u-button
          text="使用 Apple 登录"
          @click="handleAppleLogin"
          plain
          customStyle="width: 100%; margin-bottom: 20rpx; height: 96rpx; border-radius: 24rpx; border-color: #333333; color: #333333; font-size: 40rpx;"
        >
          <template #icon>
            <image src="/static/images/apple.png" class="apple-icon"></image>
          </template>
        </u-button>
      </view>
      
      <!-- 联系我们 -->
      <view class="contact-us" @click="handleContact">联系我们</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tabsList: [
        {
          name: '验证码登录'
        },
        {
          name: '密码登录'
        }
      ],
      current: 0, // 当前选中的选项卡索引
      form: {
        mobile: '',
        password: '',
        code: ''
      },
      showPassword: false, // 是否显示密码
      isAgree: false, // 是否同意协议
      sending: false, // 是否正在发送验证码
      codeTips: '发送验证码' // 验证码按钮文字
    }
  },
  computed: {
    // 手机号是否有效
    isValidMobile() {
      return /^1\d{10}$/.test(this.form.mobile);
    },
    // 是否可以登录
    canLogin() {
      if (!this.isAgree || !this.isValidMobile) return false;
      
      if (this.current === 1) {
        return !!this.form.password;
      } else {
        return !!this.form.code;
      }
    }
  },
  methods: {
    // 处理选项卡切换
    handleTabChange(index) {
      this.current = index;
    },
    
    // 处理登录
    handleLogin() {
      if (!this.canLogin) return;
      
      if (this.current === 1) {
        this.passwordLogin();
      } else {
        this.codeLogin();
      }
    },
    
    // 密码登录
    passwordLogin() {
      uni.showLoading({
        title: '登录中...'
      });
      
      // 这里替换为实际的登录API调用
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        // 登录成功后跳转到个人中心页面
        uni.switchTab({
          url: '/pages/profile/index'
        });
      }, 1500);
    },
    
    // 验证码登录
    codeLogin() {
      uni.showLoading({
        title: '登录中...'
      });
      
      // 这里替换为实际的登录API调用
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        // 登录成功后跳转到个人中心页面
        uni.switchTab({
          url: '/pages/profile/index'
        });
      }, 1500);
    },
    
    // 获取验证码
    getCode() {
      if (this.sending) return;
      
      // 验证手机号
      if (!this.isValidMobile) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '发送中...'
      });
      
      this.sending = true;
      this.codeTips = '60s';
      
      let secondsLeft = 60;
      const timer = setInterval(() => {
        secondsLeft--;
        this.codeTips = `${secondsLeft}s`;
        
        if (secondsLeft <= 0) {
          clearInterval(timer);
          this.sending = false;
          this.codeTips = '发送验证码';
        }
      }, 1000);
      
      // 这里替换为实际的发送验证码API调用
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        });
      }, 1000);
    },
    
    // 微信登录
    handleWechatLogin() {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: (res) => {
          console.log('微信登录成功', res);
          // 获取用户信息
          uni.getUserInfo({
            provider: 'weixin',
            success: (infoRes) => {
              console.log('获取用户信息成功', infoRes);
              // 处理登录逻辑
            }
          });
        },
        fail: (err) => {
          console.error('微信登录失败', err);
        }
      });
      // #endif
      
      // #ifdef H5 || APP-PLUS
      uni.showToast({
        title: '请在微信中打开',
        icon: 'none'
      });
      // #endif
    },
    
    // Apple登录
    handleAppleLogin() {
      // #ifdef APP-PLUS
      uni.login({
        provider: 'apple',
        success: (res) => {
          console.log('Apple登录成功', res);
          // 处理登录逻辑
        },
        fail: (err) => {
          console.error('Apple登录失败', err);
        }
      });
      // #endif
      
      // #ifdef H5 || MP-WEIXIN
      uni.showToast({
        title: '请在iOS设备上使用',
        icon: 'none'
      });
      // #endif
    },
    
    // 前往用户协议
    goToUserAgreement() {
      uni.navigateTo({
        url: '/pages/agreement/user'
      });
    },
    
    // 前往隐私政策
    goToPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/agreement/privacy'
      });
    },
    
    // 联系我们
    handleContact() {
      uni.showModal({
        title: '联系我们',
        content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
        showCancel: false
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  padding: 40rpx;
  background-color: #ffffff;
  min-height: 100vh;
}

.tabs-container {
  display: flex;
  justify-content: center;
}

.login-hint {
  font-size: 32rpx;
  color: #999999;
  margin: 30rpx 0 60rpx;
  text-align: center;
}

.login-form {
  .u-form-item {
    margin-bottom: 30rpx;
  }
  
  .code-btn-wrap {
    margin-left: 20rpx;
  }
}

.agreement {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
  
  .agreement-text {
    font-size: 32rpx;
    color: #999999;
    margin-left: 12rpx;
  }
  
  .link {
    color: $primary-color;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 60rpx 0;
  
  .line {
    flex: 1;
    height: 2px;
    background-color: #eeeeee;
  }
  
  .text {
    color: #999999;
    padding: 0 30rpx;
    font-size: 32rpx;
  }
}

.apple-icon {
  width: 52rpx;
  height: 52rpx;
  margin-right: 16rpx;
}

.contact-us {
  text-align: center;
  font-size: 32rpx;
  color: #666666;
  margin-top: 60rpx;
}
</style> 