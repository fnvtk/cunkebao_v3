<template>
  <div v-if="reload" class="body-bag" :class="themeBagImg">
    <el-container class="main-layout" :class="{ 'full-mode': themeMode }">
      <el-aside width="70px" class="side-edge">
        <el-container class="full-height">
          <el-header height="100px" class="logo-header">
            <div class="userlogo" v-popover:usercard>
              <img :src="userAvatar" :onerror="detaultAvatar" />
            </div>
            <p class="user-status">
              <span class="online">在线</span>
            </p>
          </el-header>
          <el-main class="sidebar-menu">
            <el-tooltip
                content="首页"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/home">
                <div class="menu-items" :class="{ active: idx == 0 }">
                  <i class="el-icon-house" />
                </div>
              </router-link>
            </el-tooltip>

            <el-tooltip
                v-if="$userRoles.indexOf('/chat') >= 0"
                content="账号运营"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/chat">
                <div class="menu-items" :class="{ active: idx == 1 }">
                  <i class="el-icon-chat-line-round" />
                </div>
              </router-link>
            </el-tooltip>

            <el-tooltip
                v-if="$userRoles.indexOf('/rise') >= 0"
                content="增长管理"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/rise">
                <div class="menu-items" :class="{ active: idx == 2 }">
                  <i class="el-icon-data-line" />
                </div>
              </router-link>
            </el-tooltip>

            <el-tooltip
                v-if="$userRoles.indexOf('/service') >= 0"
                content="客服管理"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/service">
                <div class="menu-items" :class="{ active: idx == 3 }">
                  <i class="el-icon-service" />
                </div>
              </router-link>
            </el-tooltip>

            <el-tooltip
                v-if="$userRoles.indexOf('/clients') >= 0"
                content="客户管理"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/clients">
                <div class="menu-items" :class="{ active: idx == 4 }">
                  <i class="el-icon-user-solid" />
                </div>
              </router-link>
            </el-tooltip>

            <!--<el-tooltip
                v-if="$userRoles.indexOf('/game') >= 0"
                content="游戏管理"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/game">
                <div class="menu-items" :class="{ active: idx == 5 }">
                  <i class="el-icon-coordinate" />
                </div>
              </router-link>
            </el-tooltip>-->

            <el-tooltip
                v-if="$userRoles.indexOf('/statistics') >= 0"
                content="数据统计"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/statistics">
                <div class="menu-items" :class="{ active: idx == 6 }">
                  <i class="el-icon-s-data" />
                </div>
              </router-link>
            </el-tooltip>

            <el-tooltip
                content="设置"
                placement="right"
                :visible-arrow="false"
            >
              <router-link to="/system">
                <div class="menu-items" :class="{ active: idx == 7 }">
                  <i class="el-icon-setting" />
                </div>
              </router-link>
            </el-tooltip>
          </el-main>
          <el-footer height="60px" class="fixed-sidebar">
            <div class="menu-items" @click="logout">
              <span class="logout">退出</span>
            </div>
          </el-footer>
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
      userAvatar: state => state.user.avatar,
      detaultAvatar: state => state.detaultAvatar,
      themeMode: state => state.settings.themeMode,
      themeBagImg: state => state.settings.themeBagImg,
    }),
  },
  data() {
    return {
      reload: true
    }
  },
  watch: {

  },
  mounted() {

  },
  created() {
    ServeUserRoleGet().then(ret => {
      if (ret && ret.code == 200) {
        Vue.prototype.$userRoles = ret.data
        this.$forceUpdate()
      }
    })
  },
  methods: {
    logout() {
      this.$store.dispatch('ACT_USER_LOGOUT')
    },
  },
}
</script>
<style lang="less">
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
