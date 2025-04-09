<template>
  <el-container v-loading="loading" style="height: 100%;">
    <el-header style="display: flex; align-items: center;justify-content: space-between; padding: 0;">
      <div style="display: flex; align-items: center;">
        <el-button @click="handleBatchDelete()" type="warning" size="small" icon="el-icon-circle-close">批量删除</el-button>
      </div>
      <div style="padding-right: 30px;">
        <el-form :inline="true" :model="search" size="small">
          <el-form-item>
            <el-select v-model="search.type" placeholder="任务类型" clearable style="width: 148px;">
              <el-option
                  v-for="item in types"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="search.run_type" placeholder="执行方式" clearable style="width: 120px;">
              <el-option
                  v-for="item in runTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="search.status" placeholder="执行状态" clearable style="width: 120px;">
              <el-option
                  v-for="item in statuses"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="search.keywords" placeholder="设备编号" clearable style="width: 156px;"></el-input>
          </el-form-item>
          <el-button @click="loadData(1)" type="primary" icon="el-icon-search" size="small">搜索</el-button>
        </el-form>
      </div>
    </el-header>
    <el-main style="padding: 0; position: relative;">
      <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;">
        <el-table
            :data="tableData"
            height="100%"
            stripe
            style="width: 100%;"
            size="small"
            @selection-change="handleSelectionChange">
          <el-table-column
              type="selection"
              width="55"
              fixed="left">
          </el-table-column>
          <el-table-column
              prop="id"
              label="ID"
              width="60">
          </el-table-column>
          <el-table-column
              prop="device_number"
              label="设备编号"
              min-width="98"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.device_number ? scope.row.device_number : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="device_name"
              label="设备型号"
              min-width="120"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.device_name ? scope.row.device_name : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="device_online"
              label="设备状态"
              min-width="80"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="type_name"
              label="任务类型"
              min-width="140"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="remark"
              label="任务备注"
              min-width="150"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.remark ? scope.row.remark : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="status_name"
              label="运行状态"
              min-width="88"
              show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tag :type="statusColors[scope.row.status]" size="small" effect="dark">{{ scope.row.status_name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              prop="run_type_name"
              label="执行方式"
              min-width="88"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="run_time"
              label="执行时间"
              width="150">
            <template slot-scope="scope">
              {{ scope.row.run_time ? scope.row.run_time : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="create_time"
              label="添加时间"
              width="150">
          </el-table-column>
          <el-table-column
              label="操作"
              width="88"
              fixed="right">
            <template slot-scope="scope">
              <el-button @click="handleLog(scope.row)" type="text" size="small">日志</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
    <el-footer style="display: flex; align-items: center; padding: 0;">
      <el-pagination
          @current-change="setPage"
          background
          layout="prev, pager, next"
          :current-page="page"
          :page-count="pageCount">
      </el-pagination>
    </el-footer>

    <task-log ref="taskLog"></task-log>
  </el-container>
</template>
<script>

import {TaskIndex, TaskDelete, TaskBatchDelete, TaskSave} from "@/api/task";
import TaskLog from "@/views/task/components/TaskLog";

export default {
  name: 'TaskIndexPage',
  components: {
    TaskLog
  },
  data() {
    return {
      tableData: [],
      search: {},
      loading: false,
      page: 1,
      pageCount: 1,
      platforms: [],
      types: [],
      runTypes: [],
      statuses: [],
      statusColors: {
        0: 'info',
        10: 'warning',
        20: 'success',
      },
      checkeds: [],
    }
  },
  created() {
    this.loadData(1)
  },
  methods: {
    handleLog(row) {
      this.$refs.taskLog.show(row)
    },
    handleBatchDelete() {
      if (this.checkeds.length <= 0) {
        return this.$message.error('请选择要删除的任务')
      }
      this.$confirm('此操作将删除选中的任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        TaskBatchDelete(this.checkeds).then(ret => {
          this.loading = false
          if (ret && ret.code == 200) {
            this.$message.success('删除成功')
            this.loadData(this.page)
          }
        })
      })
    },
    handleSelectionChange(rows) {
      var checkeds = []
      for (var i = 0; i < rows.length; i ++) {
        checkeds.push(rows[i].id)
      }
      this.checkeds = checkeds
    },
    handleCreate() {
      this.$refs.productForm.show(null, this.groups)
    },
    handleUpdate(row) {
      this.$refs.productForm.show(row, this.groups)
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        TaskDelete(row.id).then(ret => {
          this.loading = false
          if (ret.code == 200) {
            this.$message.success(ret.msg)
            this.loadData(1)
          } else {
            this.$message.error(ret.msg)
          }
        }).catch(e => {
          this.$message.error(e.message)
        })
      })
    },
    setPage(page) {
      this.loadData(page);
    },
    loadData(page) {
      if (this.loading) {
        return;
      }

      this.loading = true
      TaskIndex(Object.assign(this.search, { page })).then(ret => {
        this.loading = false
        if (ret.code == 200) {
          this.page       = ret.data.page;
          this.pageCount  = ret.data.pageCount;
          this.tableData  = ret.data.list;
          this.types      = ret.data.types;
          this.statuses   = ret.data.statuses;
          this.runTypes   = ret.data.runTypes;
        }
      });
    },
  }
}
</script>
<style lang="less" scoped>
.container h4 {
  color: rgba(0, 0, 0, 0.85);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  margin-bottom: 12px;
  margin-bottom: 30px;
}

.container .list-item {
  height: 70px;
  margin: 5px 25px 5px 0px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 20px;

  .left-col {
    display: flex;
    flex-direction: row;

    .avatar {
      flex-basis: 50px;
      flex-shrink: 0;
    }

    .conent {
      flex: 1 1;
      margin-left: 30px;
    }

    h4 {
      margin-bottom: 4px;
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      line-height: 1.5715;
    }

    p {
      margin-top: 5px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      line-height: 1.5715;
    }
  }

  .right-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;

    .action {
      color: rgb(24, 144, 255);
      font-size: 14px;
      font-weight: 300;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>