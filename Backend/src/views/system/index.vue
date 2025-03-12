<template>
  <el-container v-loading="loading" style="height: 100%;">
    <el-main style="padding: 0; position: relative;">
      <el-tabs v-model="active">
        <el-tab-pane label="个人信息" name="first">
          <div style="height: 10px;"></div>
          <el-form size="small" label-width="88px">
            <el-form-item label="用户名">
              {{ user.username }}
            </el-form-item>
            <el-form-item label="名称">
              {{ user.name ? user.name : '-' }}
            </el-form-item>
            <el-form-item label="登录IP">
              {{ user.login_ip ? user.login_ip: '-' }}
            </el-form-item>
            <el-form-item label="登录时间">
              {{ user.login_time ? user.login_time: '-' }}
            </el-form-item>
            <el-form-item label="注册时间">
              {{ user.create_time ? user.create_time: '-' }}
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="second">
          <div style="height: 10px;"></div>
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" size="small" label-width="88px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" style="width: 280px;" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" style="width: 280px;" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" style="width: 280px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="passwordSubmit">确 定</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>
<script>

import { ServeGetUser, ServeSetUserPassword } from "@/api/user";

export default {
  name: 'IndexPage',
  components: {},
  computed: {},
  data() {
    return {
      loading: false,
      active: 'first',
      user: {},
      passwordForm: {},
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 6, max: 16, message: '不可超过16个字符', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度在6-16个字符之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      ServeGetUser().then(ret => {
        if (ret.code == 200) {
          if (ret.data.user) {
            this.user = ret.data.user
          }
        }
      })
    },
    passwordSubmit() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          if (this.passwordForm.newPassword != this.passwordForm.confirmPassword) {
            return this.$message.error('两次输入的密码不一致');
          }

          this.loading = true
          ServeSetUserPassword(this.passwordForm).then(ret => {
            this.loading = false
            if (ret.code == 200) {
              this.$message.success(ret.msg)
              this.$refs['passwordForm'].resetFields()
              this.passwordForm = this.$options.data().passwordForm
            } else {
              this.$message.error(ret.msg);
            }
          }).catch(e => {
            this.loading = false
            this.$message.error(e.message);
          })
        } else {
          return false;
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>

</style>
