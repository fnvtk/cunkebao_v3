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
    <div style="max-height: 300px; overflow-x: hidden; overflow-y: auto;">
      <div v-for="(item, i) in list" :key="item.id" :style="{color: item.type === 'error' ? '#F56C6C' : '#67C23A', paddingBottom: '5px'}">
        [{{ item.create_time }}] {{ item.message }}
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>

import { TaskLog } from "@/api/task";

export default {
  name: 'TaskLog',
  data() {
    return {
      loading: false,
      dialogShow: false,
      title: '任务日志',
      list: [],
    };
  },
  methods: {
    show(row) {
      this.dialogShow = true
      this.list       = []
      TaskLog({id: row.id}).then(ret => {
        if (ret && ret.code == 200) {
          this.list = ret.data
        }
      })
    },
    close() {
      this.dialogShow = false
    },
  }
}
</script>

<style scoped>

</style>