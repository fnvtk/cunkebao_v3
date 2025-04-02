<template>
  <div id="login-box">
    <div class="header">手机号登录</div>
    <div class="main">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item prop="mobile">
          <el-input
            v-model="form.mobile"
            placeholder="手机号"
            class="cuborder-radius"
            maxlength="11"
            @keyup.enter.native="onSubmit('form')"
          />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-input">
            <el-input
              v-model="form.code"
              placeholder="验证码"
              class="cuborder-radius"
              maxlength="6"
              @keyup.enter.native="onSubmit('form')"
            />
            <el-button
              type="primary"
              class="code-btn"
              :disabled="codeBtnDisabled"
              @click="sendCode"
            >{{ codeBtnText }}</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loginLoading"
            @click="onSubmit('form')"
            >立即登录
          </el-button>
        </el-form-item>
        <div class="login-options">
          <span @click="toAccountLogin">账号密码登录</span>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import { setToken, setUserInfo } from '@/utils/auth'
import { ServeMobileLogin, ServeSendCode } from '@/api/user'
import CryptoUtil from '@/utils/crypto'

export default {
  data() {
    // 手机号验证规则
    const validateMobile = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入手机号'))
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        return callback(new Error('手机号格式不正确'))
      }
      callback()
    }
    
    return {
      loginLoading: false,
      form: {
        mobile: '',
        code: '',
      },
      rules: {
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '验证码不能为空', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度必须在4-6位之间', trigger: 'blur' }
        ],
      },
      codeBtnText: '获取验证码',
      codeBtnDisabled: false,
      countdown: 60,
      timer: null
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    onSubmit(formName) {
      if (this.loginLoading) return false

      this.$refs[formName].validate(valid => {
        if (!valid) return false
        this.loginLoading = true
        this.login()
      })
    },

    login() {
      // 不再对验证码进行加密，直接使用明文
      ServeMobileLogin({
        mobile: this.form.mobile,
        code: this.form.code,
        is_encrypted: false // 标记验证码未加密
      })
        .then(res => {
          if (res.code == 200) {
            let result = res.data

            // 保存授权信息到本地缓存
            setToken(result.token, result.token_expired - Math.floor(Date.now() / 1000))
            
            // 保存用户信息到本地缓存
            setUserInfo(result.member)

            this.$store.commit('UPDATE_USER_INFO', result.member)
            this.$store.commit('UPDATE_LOGIN_STATUS', true)

            this.$notify.success({
              title: '成功',
              message: '登录成功',
            })

            // 跳转到首页
            this.toLink('/')
          } else {
            this.$notify.error({
              title: '错误',
              message: res.msg,
            })
          }
        })
        .finally(() => {
          this.loginLoading = false
        })
    },

    // 发送验证码
    sendCode() {
      if (this.codeBtnDisabled) return
      
      // 验证手机号
      this.$refs.form.validateField('mobile', (errorMsg) => {
        if (errorMsg) return
        
        this.codeBtnDisabled = true
        
        // 发送验证码请求
        ServeSendCode({
          mobile: this.form.mobile,
          type: 'login'
        }).then(res => {
          if (res.code === 200) {
            this.$notify.success({
              title: '成功',
              message: '验证码发送成功',
            })
            
            // 开始倒计时
            this.startCountdown()
            
            // 测试环境下，自动填充验证码
            if (res.data && res.data.code) {
              this.form.code = res.data.code
            }
          } else {
            this.$notify.error({
              title: '错误',
              message: res.msg,
            })
            this.codeBtnDisabled = false
          }
        }).catch(() => {
          this.codeBtnDisabled = false
        })
      })
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      this.codeBtnText = `${this.countdown}秒后重新获取`
      
      this.timer = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--
          this.codeBtnText = `${this.countdown}秒后重新获取`
        } else {
          clearInterval(this.timer)
          this.codeBtnDisabled = false
          this.codeBtnText = '获取验证码'
        }
      }, 1000)
    },

    // 跳转到账号密码登录
    toAccountLogin() {
      this.$router.push('/auth/login')
    },

    toLink(url) {
      this.$router.push({
        path: url,
      })
    },
  },
}
</script>
<style lang="less" scoped>
@import '~@/assets/css/page/login-auth.less';

.code-input {
  display: flex;
  align-items: center;
  
  .el-input {
    flex: 1;
  }
  
  .code-btn {
    margin-left: 10px;
    width: 120px;
  }
}

.login-options {
  text-align: right;
  margin-top: 10px;
  font-size: 14px;
  color: #409EFF;
  cursor: pointer;
}
</style> 