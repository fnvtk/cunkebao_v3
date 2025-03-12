<template>
  <div>
    <MainLayout :idx="1">
      <el-container slot="container" class="container">
        <el-header height="60px" class="header no-select" style="font-weight: 500;">{{ titles[$route.path] }}</el-header>
        <el-container class="full-height">
          <el-main style="padding-right: 0;">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </MainLayout>
  </div>
</template>
<script>
import MainLayout from '@/views/layout/MainLayout'

export default {
  name: 'TaskXyPage',
  components: {
    MainLayout,
  },
  computed: {

  },
  data() {
    return {
      titles: {
        '/task/index': '任务队列',
      },
    }
  },
  mounted() {

  },
  created() {

  }
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .header {
    line-height: 60px;
    border-bottom: 1px solid #f5f5f5;
  }

  .aside {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background-color: #f0f2f5;

    a {
      text-decoration: none;
      color: rgba(0, 0, 0, 0.65);
    }

    .menu-list {
      height: 35px;
      line-height: 35px;
      padding-left: 25px;
      font-weight: 400;
      font-size: 13px;
      background-color: white;
      border-left: 3px solid white;
      border-radius: 5px;
      margin: 4px 2px;
      transition: ease 0.5s;

      &:hover {
        color: rgb(24, 144, 255);
      }

      &.selectd {
        border-left-color: #2196f3;
        color: #2196f3;
      }
    }
  }
}
</style>
