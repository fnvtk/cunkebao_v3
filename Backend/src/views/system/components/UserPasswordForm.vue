<template>
  <el-dialog
      :title="title"
      :visible.sync="dialogShow"
      v-loading="loading"
      width="420px"
      modal-append-to-body
      append-to-body
      destroy-on-close
      :close-on-press-escape="false">
    <div>
      <el-form :model="form" :rules="rules" ref="form" size="small" label-width="68px">
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码"></el-input>
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

import { UserPassword } from "@/api/user";

export default {
  name: 'SystemUserPasswordForm',
  data() {
    return {
      loading: false,
      dialogShow: false,
      title: '',
      form: { roles: [], status: 0 },
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          UserPassword(this.form).then(ret => {
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
    show(row) {
      this.title      = '修改密码'
      this.dialogShow = true
      this.form       = Object.assign({}, row)
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