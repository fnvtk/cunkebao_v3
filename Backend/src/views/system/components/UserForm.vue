<template>
  <el-dialog
      :title="title"
      :visible.sync="dialogShow"
      v-loading="loading"
      width="580px"
      modal-append-to-body
      append-to-body
      destroy-on-close
      :close-on-press-escape="false">
    <div>
      <el-form :model="form" :rules="rules" ref="form" size="small" label-width="78px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item v-if="!form.id" label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" maxlength="11" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-checkbox-group v-model="form.roles">
            <el-checkbox v-for="(role, i) in roles" :key="i" :label="role.value">{{ role.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option
                v-for="item in statuses"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>

import { UserSave, UserGetUsername } from "@/api/user";

export default {
  name: 'SystemUserForm',
  data() {
    return {
      loading: false,
      dialogShow: false,
      title: '',
      form: { roles: [], status: 0 },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
        ],
        roles: [
          { required: true, message: '请设置角色', trigger: 'blur' },
        ],
        resource_key: [
          { required: true, message: '请输入资源KEY', trigger: 'blur' },
        ],
      },
      roles: [],
      statuses: [],
    };
  },
  methods: {
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          UserSave(this.form).then(ret => {
            this.loading = false
            if (ret.code == 200) {
              this.$message.success(ret.msg)
              this.$emit('fetch-data')
              this.close()
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
    },
    show(row, roles, statuses) {
      this.roles    = roles
      this.statuses = statuses
      if (row) {
        this.title      = '修改员工'
        this.dialogShow = true
        this.form       = Object.assign({}, row)
      } else {
        this.title      = '添加员工'
        this.dialogShow = true
        this.form       = { roles: [], status: 0 }

        UserGetUsername().then(ret => {
          if (ret && ret.code == 200) {
            this.form = Object.assign({}, this.form, {
              username: ret.data.username
            })
          }
        })
      }
    },
    close() {
      this.dialogShow = false
      this.$refs['form'].resetFields()
      this.form = this.$options.data().form
    },
  }
}
</script>

<style scoped>

</style>