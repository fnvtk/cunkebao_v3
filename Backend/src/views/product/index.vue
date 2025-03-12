<template>
  <el-container v-loading="loading" style="height: 100%;">
    <el-header style="display: flex; align-items: center;justify-content: space-between; padding: 0;">
      <div style="display: flex; align-items: center;">
        <el-button @click="handleCreate()" type="primary" size="small" icon="el-icon-plus">添加商品</el-button>
      </div>
      <div style="padding-right: 30px;">
        <el-form :inline="true" :model="search" size="small">
          <el-form-item>
            <el-select v-model="search.group_id" placeholder="商品分组" clearable style="width: 120px;">
              <el-option label="默认分组" :value="0"></el-option>
              <el-option
                  v-for="item in groups"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="search.is_used" placeholder="是否使用" clearable style="width: 120px;">
              <el-option
                  v-for="item in isUseds"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="search.keywords" placeholder="商品名称" clearable></el-input>
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
              prop="group_name"
              label="商品分组"
              min-width="100"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.group_name ? scope.row.group_name : '默认分组' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="images"
              label="商品图片"
              min-width="168"
              show-overflow-tooltip>
            <template slot-scope="scope">
              <div style="display: flex;">
                <el-image v-for="(item, i) in scope.row.images" v-if="i < 3" :key="i" :src="item.url" style="width: 42px; height: 42px; display: block; margin-right: 6px;"></el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column
              prop="title"
              label="商品标题"
              min-width="130"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="content"
              label="描述"
              min-width="130"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="labels"
              label="图片标签"
              min-width="130"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ (scope.row.labels && scope.row.labels.length > 0) ? scope.row.labels.join(',') : '-' }}
            </template>
          </el-table-column>
          <el-table-column
              prop="price"
              label="价格(￥)"
              min-width="80"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="stock"
              label="库存"
              min-width="80"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="themes"
              label="宝贝主题"
              min-width="130"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ (scope.row.themes && scope.row.themes.length > 0) ? scope.row.themes.join(',') : '-' }}
            </template>
          </el-table-column>
          <!--<el-table-column
              prop="shipping_fee"
              label="运费(￥)"
              min-width="80"
              show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.shipping_fee > 0 ? scope.row.shipping_fee : '包邮' }}
            </template>
          </el-table-column>-->
          <el-table-column
              prop="is_used_name"
              label="是否使用"
              min-width="80"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="create_time"
              label="添加时间"
              width="150">
          </el-table-column>
          <el-table-column
              label="操作"
              width="120"
              fixed="right">
            <template slot-scope="scope">
              <el-button @click="handleUpdate(scope.row)" type="text" size="small">修改</el-button>
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
  </el-container>
</template>
<script>

import ProductForm from "@/views/product/components/ProductForm";
import { ProductIndex, ProductDelete } from "@/api/product";

export default {
  name: 'ProductPage',
  components: {
    ProductForm,
  },
  data() {
    return {
      tableData: [],
      search: {},
      loading: false,
      page: 1,
      pageCount: 1,
      groups: [],
      isUseds: [],
      checked: [],
    }
  },
  created() {
    this.loadData(1)
  },
  methods: {
    handleMenu(e) {
      if (this.checked.length <= 0) {
        return this.$message.error('请选择商品')
      }

      this.$refs['' + e + 'Form'].show(this.checked)
    },
    handleSelectionChange(rows) {
      var checked = []
      for (var i = 0; i < rows.length; i ++) {
        checked.push(rows[i].id)
      }
      this.checked = checked
    },
    handleCreate() {
      this.$refs.productForm.show(null, this.groups)
    },
    handleUpdate(row) {
      this.$refs.productForm.show(row, this.groups)
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        ProductDelete(row.id).then(ret => {
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
      ProductIndex(Object.assign(this.search, { page })).then(ret => {
        this.loading = false
        if (ret.code == 200) {
          this.page       = ret.data.page;
          this.pageCount  = ret.data.pageCount;
          this.tableData  = ret.data.list;
          this.groups     = ret.data.groups;
          this.isUseds    = ret.data.isUseds;
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