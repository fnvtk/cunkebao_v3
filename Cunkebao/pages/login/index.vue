<template>
  <view class="login-container">
    <!-- 登录方式切换 -->
    <u-tabs
      :list="tabsList"
      :current="Number(current)"
      @change="handleTabChange"
      activeStyle="color: #4080ff; font-size: 36rpx"
      inactiveStyle="color: #e9e9e9; font-size: 36rpx"
      itemStyle="height: 96rpx; padding: 0 30rpx;"
      lineColor="#4080ff"
      lineWidth="48rpx"
      lineHeight="4rpx"
      :itemWidth="500"
    ></u-tabs>
    
    <!-- 提示文字 -->
    <view class="login-hint">
      你所在地区仅支持 手机号 / 微信 / Apple 登录
    </view>
    
    <!-- 表单区域 -->
    <view class="login-form">
      <!-- 手机号输入 -->
      <view class="input-box">
        <u--input
          v-model="form.mobile"
          placeholder="+86手机号"
          prefixIcon="phone"
          prefixIconStyle="font-size: 52rpx;color: #909399;padding-right: 16rpx;"
          clearable
          type="number"
          maxlength="11"
          border="none"
          fontSize="30rpx"
        ></u--input>
      </view>
      
      <!-- 验证码输入 -->
      <view v-if="current == 0" class="input-box code-box">
        <u--input
          v-model="form.code"
          placeholder="验证码"
          clearable
          type="number"
          maxlength="6"
          border="none"
          inputAlign="left"
          fontSize="30rpx"
        ></u--input>
        <view class="code-btn-wrap">
          <u-button 
            @tap="getCode" 
            :text="codeTips" 
            type="primary" 
            size="mini" 
            :disabled="!isValidMobile || sending"
            customStyle="width: 180rpx;height: 68rpx;font-size: 28rpx;"
          ></u-button>
        </view>
      </view>
      
      <!-- 密码输入 -->
      <view v-if="current == 1" class="input-box">
        <u--input
          v-model="form.password"
          placeholder="密码"
          :password="!showPassword"
          clearable
          border="none"
          fontSize="30rpx"
          suffixIcon="eye"
          @clickSuffixIcon="showPassword = !showPassword"
          suffixIconStyle="font-size: 45rpx;"
        ></u--input>
      </view>
      
      <!-- 用户协议 -->
      <view class="agreement">
        <u-checkbox-group
          v-model="isAgree"
          placement="column"
          @change="checkboxChange"
        >
          <u-checkbox
            key="1"
            shape="circle"
            activeColor="#4080ff"
            size="35" 
            iconSize="30"
          ></u-checkbox>
      </u-checkbox-group>
        <text class="agreement-text">
          已阅读并同意 
          <text class="link" @click="goToUserAgreement">用户协议</text> 
          与 
          <text class="link" @click="goToPrivacyPolicy">隐私政策</text>
        </text>
      </view>
      
      <!-- 登录按钮 -->
      <u-button
        text="登录"
        type="primary"
        @click="handleLogin"
        customStyle="width: 100%; margin-top: 40rpx; height: 96rpx; border-radius: 24rpx; font-size: 32rpx; font-weight: 500;"
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
        <button class="wechat-btn" @click="handleWechatLogin">
          <u-icon name="weixin-fill" size="56" color="#07c160" class="wechat-icon"></u-icon>
          <text>使用微信登录</text>
        </button>
        
        <!-- Apple登录 -->
        <button class="apple-btn" @click="handleAppleLogin">
          <u-icon name="apple-fill" size="56" color="#333333" class="apple-icon"></u-icon>
          <text>使用 Apple 登录</text>
        </button>
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
        { text: '验证码登录', name: '验证码登录', id: 0 },
        { text: '密码登录', name: '密码登录', id: 1 }
      ],
      current: 0,
      form: {
        mobile: '',
        code: '',
        password: ''
      },
      showPassword: false,
      isAgree: false,
      sending: false,
      codeTips: '发送验证码'
    }
  },
  onLoad() {
    // 确保初始状态下表单字段正确
    this.current = 0;
    this.form.password = '';
  },
  computed: {
    isValidMobile() {
      return /^1\d{10}$/.test(this.form.mobile)
    },
    canLogin() {
      if (!this.isAgree || !this.isValidMobile) return false
      return this.current == 0 ? !!this.form.code : !!this.form.password
    }
  },
  methods: {
    checkboxChange(value) {
      console.log('checkboxChange', value)
    },
    handleTabChange(index) {
      this.current = Number(index.index);
      // 清除不相关的表单字段
      if (this.current == 0) {
        this.form.password = '';
      } else {
        this.form.code = '';
      }
      // 确保密码输入框的可见状态正确重置
      this.showPassword = false; 
    },
    getCode() {
      if (this.sending || !this.isValidMobile) return
      this.sending = true
      this.codeTips = '60s'
      let seconds = 60
      const timer = setInterval(() => {
        seconds--
        this.codeTips = `${seconds}s`
        if (seconds <= 0) {
          clearInterval(timer)
          this.sending = false
          this.codeTips = '发送验证码'
        }
      }, 1000)
    },
    handleLogin() {
      if (!this.canLogin) {
        if (!this.isAgree) {
          uni.showToast({
            title: '请先同意用户协议和隐私政策',
            icon: 'none'
          })
          return
        }
        if (!this.isValidMobile) {
          uni.showToast({
            title: '请输入有效的手机号',
            icon: 'none'
          })
          return
        }
        if (this.current == 0 && !this.form.code) {
          uni.showToast({
            title: '请输入验证码',
            icon: 'none'
          })
          return
        }
        if (this.current == 1 && !this.form.password) {
          uni.showToast({
            title: '请输入密码',
            icon: 'none'
          })
          return
        }
        return
      }
      
      // 显示加载中
      uni.showLoading({
        title: '登录中...',
        mask: true
      })
      
      // 模拟登录成功
      setTimeout(() => {
        // 隐藏加载提示
        uni.hideLoading()
        
        // 保存登录状态和用户信息
        uni.setStorageSync('token', 'mock_token_' + Date.now())
        uni.setStorageSync('userInfo', {
          mobile: this.form.mobile,
          loginTime: Date.now()
        })
        
        // 显示登录成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        })
        
        // 延迟跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index',
            success: () => {
              console.log('跳转到首页成功')
            },
            fail: (err) => {
              console.error('跳转失败:', err)
              uni.showToast({
                title: '跳转失败，请重试',
                icon: 'none'
              })
            }
          })
        }, 1500)
      }, 1000)
    },
    handleWechatLogin() {
      console.log('微信登录')
      // 仅模拟
      uni.showToast({
        title: '微信登录',
        icon: 'none'
      })
    },
    handleAppleLogin() {
      console.log('Apple登录')
      // 仅模拟
      uni.showToast({
        title: 'Apple登录',
        icon: 'none'
      })
    },
    goToUserAgreement() {
      uni.navigateTo({
        url: '/pages/agreement/user'
      })
    },
    goToPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/agreement/privacy'
      })
    },
    handleContact() {
      uni.showModal({
        title: '联系我们',
        content: '客服电话：400-xxx-xxxx',
        showCancel: false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 0 40rpx;
}

.login-hint {
  font-size: 32rpx;
  text-align: center;
  margin: 30rpx 0;
}

.login-form {
  margin-top: 40rpx;
  
  .input-box {
    height: 96rpx;
    border: 2rpx solid #e9e9e9;
    border-radius: 16rpx;
    padding: 0 24rpx;
    margin-bottom: 30rpx;
    display: flex;
    align-items: center;
    
    .u-form-item {
      flex: 1;
      margin-bottom: 0;
    }
  }
  
  .code-box {
    display: flex;
    align-items: center;
    padding-right: 12rpx;
    
    .u--input {
      flex: 1;
    }
    
    .code-btn-wrap {
      margin-left: 12rpx;
      height: 68rpx;
      
      .u-button {
        margin: 0;
      }
    }
  }
}

.agreement {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
  
  .agreement-text {
    font-size: 28rpx;
    color: #777777;
    margin-left: 12rpx;
  }
  
  .link {
    color: #4080ff;
    margin: 0 8rpx;
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 60rpx 0;
  
  .line {
    flex: 1;
    height: 2rpx;
    background-color: #eeeeee;
  }
  
  .text {
    color: #777777;
    padding: 0 30rpx;
    font-size: 28rpx;
  }
}

.other-login {
  .wechat-btn, .apple-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    margin-bottom: 20rpx;
    border-radius: 24rpx;
    font-size: 32rpx;
    background-color: #ffffff;
    border: 2rpx solid #dddddd;
    
    text {
      color: #333333;
      margin-left: 16rpx;
    }
  }
  
  .wechat-btn {
    text {
      font-size: 32rpx;
      font-weight: 500;
    }
  }
  
  .apple-btn {
    text {
      color: #333333;
      font-size: 32rpx;
      font-weight: 500;
    }
  }
}

.contact-us {
  text-align: center;
  font-size: 26rpx;
  color: #777777;
  margin-top: 60rpx;
  padding-bottom: 40rpx;
}
</style> 