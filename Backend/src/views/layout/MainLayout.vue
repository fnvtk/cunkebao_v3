<template>
  <div v-if="reload" class="body-bag" :class="themeBagImg">
    <el-container class="main-layout" :class="{ 'full-mode': themeMode }">
      <el-aside width="228px" class="side-edge" style="background-color: #fff; border-right: 2px solid #DCDFE6;">
        <el-container class="full-height">
          <el-header height="70px" class="logo-header" style="display: flex; align-items: center; border-bottom: 1px solid #DCDFE6; position: relative;">
            <div class="userlogo" style="margin: 0 15px 0 20px;" v-popover:usercard>
              <img :src="userAvatar" :onerror="detaultAvatar" />
            </div>
            <p class="user-status" style="text-align: left; display: block; margin-top: 0;">
              <span style="display: block; font-size: 14px; font-weight: 500; color: #333;">{{ userName }}</span>
              <span style="display: block; margin-top: 3px;" class="online">在线</span>
            </p>
            <div @click="logout" class="t-logout" style="font-size: 13px; color: #333; cursor: pointer; position: absolute; right: 10px; bottom: 14px;">
              <i class="el-icon-switch-button"></i>
              <span style="margin-left: 3px;">退出</span>
            </div>
          </el-header>
          <el-main class="sidebar-menu" style="width: auto; margin: 0; position: relative;">
            <div class="thin-scrollbar" ref="thinScrollbar" @scroll="handleScroll" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow-x: hidden; overflow-y: auto;">
              <div style="height: 8px;"></div>
              <div v-for="(menu, i) in menus" :key="i">
                <router-link :to="{ path: menu.path, query: { _: top > 0 ? top : undefined } }">
                  <div class="left-menu-title" :class="{ active: idx == i }">
                    <i :class="menu.icon" />
                    <span>{{ menu.title }}</span>
                  </div>
                </router-link>
                <div v-if="menu.items && menu.items.length > 0" class="left-menu-menus">
                  <router-link v-for="(item, j) in menu.items" :key="j" :to="{ path: item.path, query: { _: top > 0 ? top : undefined } }">
                    <el-button v-if="$route.path == item.path" size="small" type="primary">{{ item.title }}</el-button>
                    <el-button v-else size="small">{{ item.title }}</el-button>
                  </router-link>
                </div>
              </div>
              <div style="height: 20px;"></div>
            </div>
          </el-main>
          <!--
          <el-footer height="60px" class="fixed-sidebar">
            <div class="menu-items" @click="logout">
              <span class="logout">退出</span>
            </div>
          </el-footer>
          -->
        </el-container>
      </el-aside>

      <el-main class="no-padding" style="background: white">
        <slot name="container"></slot>
      </el-main>
    </el-container>

    <!-- 语音消息提示 -->
    <audio id="audio" preload="auto">
      <source src="~@/assets/image/1701.mp3" type="audio/mp3" />
    </audio>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { ServeUserRoleGet } from '@/api/user'

export default {
  name: 'MainLayout',
  components: {

  },
  props: {
    idx: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapState({
      userName: state => state.user.name ? state.user.name : state.user.username,
      userAvatar: state => state.user.avatar,
      detaultAvatar: state => state.detaultAvatar,
      themeMode: state => state.settings.themeMode,
      themeBagImg: state => state.settings.themeBagImg,
    }),
  },
  data() {
    return {
      reload: true,
      top: 0,
      menus: [
        {
          title: '首页',
          icon: 'el-icon-s-home', // el-icon-house
          path: '/home',
        },
        {
          title: '任务队列',
          icon: 'el-icon-s-operation',
          path: '/task',
          items: [],
        },
        {
          title: '设备管理',
          icon: 'el-icon-mobile', // el-icon-chat-line-round
          path: '/device',
          items: [
            { title: '设备列表', path: '/device/index' },
          ],
        },
        {
          title: '商品管理',
          icon: 'el-icon-present', // el-icon-chat-line-round
          path: '/product',
          items: [
            { title: '商品列表', path: '/product/index' },
            { title: '商品分组', path: '/product/group' },
          ],
        },
        {
          title: '设置',
          icon: 'el-icon-setting', // el-icon-setting
          path: '/system',
          items: [
            { title: '个人信息', path: '/system/index' },
            //{ title: '服务器管理', path: '/system/server' },
            //{ title: '员工管理', path: '/system/user' },
            //{ title: '角色管理', path: '/system/role' },
          ],
        }
      ]
    }
  },
  watch: {

  },
  mounted() {
    if (this.$route.query && this.$route.query._) {
      this.top = this.$route.query._
      this.$refs.thinScrollbar.scrollTop = this.top
    }
  },
  created() {

  },
  methods: {
    handleScroll(e) {
      this.top = e.target.scrollTop
    },
    logout() {
      this.$store.dispatch('ACT_USER_LOGOUT')
    },
  },
}
</script>
<style lang="less">
/* 设置细滚动条 */
.thin-scrollbar::-webkit-scrollbar {
  width: 2px; /* 对于水平滚动条的高度 */
  height: 2px; /* 对于垂直滚动条的宽度 */
}

.thin-scrollbar::-webkit-scrollbar-track {
  background: #fff; /* 滚动条轨道的背景色 */
}

.thin-scrollbar::-webkit-scrollbar-thumb {
  background: #888; /* 滚动条实际可拖动部分的背景色 */
  border-radius: 2px; /* 滚动条圆角 */
}

.thin-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555; /* 鼠标悬浮时滚动条的背景色 */
}
.left-menu-menus {
  display: flex;
  flex-wrap: wrap;
  padding-left: 25px;
  padding-bottom: 10px;
}
.left-menu-menus .el-button {
  margin-left: 0;
  margin-right: 8px;
  margin-top: 8px;
}
.left-menu-title {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #706d6d;
  position: relative;
  margin-left: 0;
  padding-left: 15px;
  font-size: 16px;
  font-weight: 500;
  height: 38px;
}
.left-menu-title i {
  font-size: 20px !important;
}
.left-menu-title span {
  margin-left: 5px;
}
.left-menu-title.active {
  color: #222 !important;
}
.form-notice {
  font-size: 12px;
  color: #999;
  line-height: 12px;
  margin-top: 8px;
}
.main-layout {
  position: fixed;
  width: 75%;
  height: 80%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  overflow: hidden;
  transition: ease 0.5s;
  border-radius: 5px;

  &.full-mode {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .side-edge {
    user-select: none;
    background-color: #202225;

    .logo-header {
      padding: 0;
      .userlogo {
        width: 50px;
        height: 50px;
        margin: 10px auto 0;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        overflow: hidden;
        transition: ease-in 3s;

        img {
          width: 100%;
          height: 100%;
        }

        &:hover {
          transform: rotate(360deg);
        }
      }

      .user-status {
        text-align: center;
        margin-top: 10px;
        color: #ccc9c9;
        font-size: 13px;
        font-weight: 300;
        .online {
          color: #0d710d;
        }
      }
    }
  }

  .sidebar-menu {
    width: 60px;
    margin: 0 auto;
    text-align: center;
    padding: 0;
    overflow: hidden;

    a {
      text-decoration: none;
    }

    .menu-items {
      cursor: pointer;
      color: #706d6d;
      position: relative;
      width: 45px;
      height: 45px;
      margin: 6px auto 0;
      line-height: 45px;
      text-align: center;

      i {
        font-size: 20px;

        &:hover {
          transform: scale(1.3);
        }
      }

      .notify {
        width: 5px;
        height: 5px;
        background: #ff1e1e;
        display: inline-block;
        border-radius: 5px;
        position: absolute;
        right: 5px;
        top: 9px;
        animation: notifymove 3s infinite;
        animation-direction: alternate;
        -webkit-animation: notifymove 3s infinite;
      }

      &.active {
        color: #416641 !important;
      }
    }
  }
}

.fixed-sidebar {
  padding: 0;
  .menu-items {
    height: 25px;
    line-height: 25px;
    padding: 10px 5px;
    cursor: pointer;
    box-shadow: 0 0 0 0 #ccc9c9;
    text-align: center;
    color: #afabab;

    i {
      font-size: 20px;
    }

    .logout {
      font-weight: 300;
      font-size: 15px;
      color: #9e9e9e;
      transition: ease 0.5;
      &:hover {
        font-size: 16px;
      }
    }
  }
}

/* 主题背景图片 */
.body-bag {
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  background-color: #121212;
  transition: ease-in 0.5s;

  &.bag001 {
    background: url(~@/assets/image/background/001.jpg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  &.bag002 {
    background: url(~@/assets/image/background/002.jpg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  &.bag003 {
    background: url(~@/assets/image/background/003.jpg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  &.bag004 {
    background: url(~@/assets/image/background/005.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}

@keyframes notifymove {
  0% {
    background: #ff1e1e;
  }

  25% {
    background: #2e3238;
  }

  50% {
    background: #ff1e1e;
  }

  75% {
    background: #2e3238;
  }

  100% {
    background: #ff1e1e;
  }
}

@-webkit-keyframes notifymove {
  0% {
    background: #ff1e1e;
  }

  25% {
    background: #2e3238;
  }

  50% {
    background: #ff1e1e;
  }

  75% {
    background: #2e3238;
  }

  100% {
    background: #ff1e1e;
  }
}

@media screen and (max-width: 1000px) {
  .main-layout {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
</style>
