<template>
  <el-dialog
      :title="title"
      :visible.sync="dialogShow"
      v-loading="loading"
      width="368px"
      modal-append-to-body
      append-to-body
      destroy-on-close
      :close-on-press-escape="false">
    <div>
      <el-form :model="form" :rules="rules" ref="form" size="small" label-width="0">
        <el-form-item label="" prop="name">
          <el-input v-model="form.name" placeholder="请输入分组名称"></el-input>
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

import { ProductGroupSave } from "@/api/product";

export default {
  name: 'ProductGroupForm',
  data() {
    return {
      loading: false,
      dialogShow: false,
      title: '',
      form: { },
      rules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          ProductGroupSave(this.form).then(ret => {
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
      if (row) {
        this.title      = '修改分组'
        this.dialogShow = true
        this.form       = Object.assign({}, row)
      } else {
        this.title      = '添加分组'
        this.dialogShow = true
        this.form       = { }
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