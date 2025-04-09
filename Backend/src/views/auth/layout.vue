<template>
  <div>
    <el-container id="auth-container">
      <el-main>
        <div id="logo-name" class="animated slideInLeft" style="width: 600px; display: flex; align-items: center;">
          <img src="@/icons/logo.png" style="width: 56px; height: 56px;">
          <div style="margin-left: 25px;">{{ $store.state.website_name }}</div>
        </div>
        
        <router-view />

        <div class="copyright" v-html="$store.state.copyright"></div>
      </el-main>
    </el-container>

    <div class="fly-box">
      <div class="fly bg-fly-circle1"></div>
      <div class="fly bg-fly-circle2"></div>
      <div class="fly bg-fly-circle3"></div>
      <div class="fly bg-fly-circle4"></div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
}
</script>
<style lang="less" scoped>
@import '~@/assets/css/page/login-auth.less';
</style>
