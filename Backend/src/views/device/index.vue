<template>
  <el-container v-loading="loading" style="height: 100%;">
    <el-header style="display: flex; align-items: center;justify-content: space-between; padding: 0;">
      <div style="display: flex; align-items: center;"></div>
      <div style="padding-right: 30px;">
        <el-form :inline="true" :model="search" size="small">
          <el-form-item>
            <el-select v-model="search.is_online" placeholder="是否在线" clearable style="width: 120px;">
              <el-option
                  v-for="item in onlines"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="search.status" placeholder="状态" clearable style="width: 120px;">
              <el-option
                  v-for="item in statuses"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="search.keywords" placeholder="设备编号" clearable></el-input>
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
            size="small">
          <el-table-column
              prop="id"
              label="ID"
              width="60">
          </el-table-column>
          <el-table-column
              prop="number"
              label="设备编号"
              min-width="120"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="name"
              label="设备型号"
              min-width="130"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.name ? scope.row.name : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="ip"
              label="IP"
              min-width="120"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.ip ? scope.row.ip : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="app_version"
              label="APP版本"
              min-width="88"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.app_version ? scope.row.app_version : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="is_online"
              label="是否在线"
              min-width="88"
              show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tag v-if="scope.row.is_online == 1" type="success" effect="dark" size="small">在线</el-tag>
              <el-tag v-else type="danger" effect="dark" size="small">离线</el-tag>
            </template>
          </el-table-column>
          <el-table-column
              prop="active_time"
              label="活动时间"
              width="150">
          </el-table-column>
          <el-table-column
              prop="create_time"
              label="添加时间"
              width="150">
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
  </el-container>
</template>
<script>

import { DeviceIndex } from "@/api/device";

export default {
  name: 'DeviceIndexPage',
  data() {
    return {
      tableData: [],
      search: {},
      loading: false,
      page: 1,
      pageCount: 1,
      statuses: [],
      onlines: [],
    }
  },
  created() {
    this.loadData(1)
  },
  methods: {
    setPage(page) {
      this.loadData(page);
    },
    loadData(page) {
      if (this.loading) {
        return;
      }

      this.loading = true
      DeviceIndex(Object.assign(this.search, { page })).then(ret => {
        this.loading = false
        if (ret.code == 200) {
          this.page       = ret.data.page;
          this.pageCount  = ret.data.pageCount;
          this.tableData  = ret.data.list;
          this.statuses   = ret.data.statuses;
          this.onlines    = ret.data.onlines;
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