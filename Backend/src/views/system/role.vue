<template>
  <el-container v-loading="loading" style="height: 100%;">
    <el-header style="display: flex; align-items: center;justify-content: space-between; padding: 0;">
      <div style="display: flex; align-items: center;">
        <el-button :disabled="$userRoles.indexOf('/system/role/save') < 0" @click="handleCreate" type="primary" size="small" icon="el-icon-plus">添加角色</el-button>
      </div>
      <div style="padding-right: 30px;">
        <el-form :inline="true" :model="search" size="small">
          <el-form-item>
            <el-input v-model="search.keywords" placeholder="角色名" clearable style="width: 200px;"></el-input>
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
              prop="name"
              label="角色名"
              min-width="150"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="user_count"
              label="员工数"
              min-width="100"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="remark"
              label="备注"
              min-width="200"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.remark ? scope.row.remark : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="create_time"
              label="添加时间"
              min-width="150">
          </el-table-column>
          <el-table-column
              label="操作"
              width="88"
              fixed="right">
            <template slot-scope="scope">
              <el-button :disabled="scope.row.privileges.indexOf('*') >= 0 || $userRoles.indexOf('/system/role/save') < 0" @click="handleUpdate(scope.row)" type="text" size="small">修改</el-button>
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

    <role-form ref="roleForm" @fetch-data="() => loadData(page)"></role-form>
  </el-container>
</template>
<script>
import RoleForm from "@/views/system/components/RoleForm";
import { RoleIndex } from "@/api/role";

export default {
  name: 'SystemRolePage',
  components: {
    RoleForm,
  },
  data() {
    return {
      tableData: [],
      search: { },
      loading: false,
      page: 1,
      pageCount: 1,
    }
  },
  created() {
    this.loadData(1)
  },
  methods: {
    handleUpdate(row) {
      this.$refs.roleForm.show(row)
    },
    handleCreate() {
      this.$refs.roleForm.show(null)
    },
    setPage(page) {
      this.loadData(page);
    },
    loadData(page) {
      if (this.loading) {
        return;
      }

      this.loading = true
      RoleIndex(Object.assign(this.search, { page })).then(ret => {
        this.loading = false
        if (ret.code == 200) {
          this.page       = ret.data.page;
          this.pageCount  = ret.data.pageCount;
          this.tableData  = ret.data.list;
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