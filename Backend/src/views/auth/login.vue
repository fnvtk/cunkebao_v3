<template>
  <div id="login-box">
    <div class="header">管理员登录</div>
    <div class="main">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="账号"
            class="cuborder-radius"
            maxlength="32"
            @keyup.enter.native="onSubmit('form')"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            class="cuborder-radius"
            @keyup.enter.native="onSubmit('form')"
          />
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
      </el-form>
    </div>
  </div>
</template>
<script>
import { setToken, setUserInfo } from '@/utils/auth'
import { ServeLogin } from '@/api/user'

export default {
  data() {
    return {
      loginLoading: false,
      form: {
        username: '',
        password: '',
      },
      rules: {
        username: [
          {
            required: true,
            message: '账号不能为空',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '密码不能为空!',
            trigger: 'blur',
          },
        ],
      },
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
      ServeLogin({
        username: this.form.username,
        password: this.form.password,
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
</style>
