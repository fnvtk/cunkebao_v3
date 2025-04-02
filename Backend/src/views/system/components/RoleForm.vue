<template>
  <el-dialog
      :title="title"
      :visible.sync="dialogShow"
      v-loading="loading"
      width="760px"
      modal-append-to-body
      append-to-body
      destroy-on-close
      :close-on-press-escape="false">
    <div>
      <el-form :model="form" :rules="rules" ref="form" size="small" label-width="68px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名"></el-input>
        </el-form-item>
        <el-form-item label="权限" prop="privileges">
          <el-checkbox-group v-model="form.privileges" @change="setChange">
            <div v-for="(item, i) in privileges" :key="i">
              <div v-if="parseInt(i) == i">
                <div style="font-weight: bold;"><el-checkbox :label="item.value">{{ item.title }}</el-checkbox></div>
                <div v-for="(item1, j) in item.items" :key="j">
                  <div style="padding-left: 25px;"><el-checkbox :disabled="getDisabled(item1.value)" :label="item1.value">{{ item1.title }}</el-checkbox></div>
                  <div style="padding-left: 50px;">
                    <el-checkbox v-for="(item2, n) in item1.items" :key="n" :disabled="getDisabled(item2.value)" :label="item2.value">{{ item2.title }}</el-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"></el-input>
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

import { RoleSave, RolePrivileges } from "@/api/role";

export default {
  name: 'SystemRoleForm',
  data() {
    return {
      loading: false,
      dialogShow: false,
      title: '',
      form: { privileges: [] },
      rules: {
        name: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
        ],
        privileges: [
          { required: true, message: '请设置权限', trigger: 'blur' },
        ],
      },
      privileges: [],
    };
  },
  methods: {
    setChange(e) {
      for (var i = 0; i < this.form.privileges.length; i ++) {
        var s = this.form.privileges[i].replace(/\/[\d\w]+$/, '')
        if (s.length > 0) {
          if (this.form.privileges.indexOf(s) < 0) {
            this.form.privileges[i] = ''
          }
        }
      }
      var privileges = []
      for (var i = 0; i < this.form.privileges.length; i ++) {
        if (this.form.privileges[i].length > 0) {
          privileges.push(this.form.privileges[i])
        }
      }
      this.form.privileges = privileges
      this.form = Object.assign({}, this.form)
    },
    getDisabled(value) {
      if (this.form.privileges.indexOf(value) >= 0) {
        return false
      }

      var prev = value.replace(/\/[\d\w]+$/, '')
      if (this.form.privileges.indexOf(prev) >= 0) {
        return false
      }

      return true
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true
          RoleSave(this.form).then(ret => {
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
        this.title      = '修改角色'
        this.dialogShow = true
        this.form       = Object.assign({}, row)
      } else {
        this.title      = '添加角色'
        this.dialogShow = true
        this.form       = { privileges: [] }
      }

      RolePrivileges().then(ret => {
        if (ret && ret.code == 200) {
          this.privileges = ret.data
        }
      })
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