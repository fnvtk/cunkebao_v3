<template>
  <div id="app">
    <router-view v-if="showView" />
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      // 用于点击当前页的router时，刷新当前页
      showView: true,
    }
  },
  methods: {
    // 刷新当前路由方法
    refreshView() {
      this.showView = false
      this.$nextTick(() => (this.showView = true))
    },
  },
}
</script>
<style>
.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.image-uploader .el-upload:hover {
  border-color: #409EFF;
}
.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 118px;
  height: 118px;
  line-height: 118px !important;
  text-align: center;
}
.image-uploader .image {
  width: 118px;
  height: 118px;
  display: block;
}
</style>
