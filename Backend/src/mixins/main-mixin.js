import SocketInstance from '../socket-instance'
import { ServeGetUser } from '@/api/user'

export default {
  created() {
    // 判断用户是否登录
    if (this.$store.getters.loginStatus) {
      this.initialize()
    }
  },
  methods: {
    // 页面初始化设置
    initialize() {
      //SocketInstance.connect()
      this.loadUser()
    },

    // 加载用户相关设置信息，更新本地缓存
    loadUser() {
      ServeGetUser().then(({ code, data }) => {
        if (code == 200) {
          const { user } = data

          this.$store.commit('UPDATE_USER_INFO', {
            id: user.id,
            //channel_id: user.channel_id,
            //channel_name: user.channel_name,
            username: user.username,
            name: user.name,
            remark: user.remark,
            login_time: user.login_time,
            login_count: user.login_count,
            login_ip: user.login_ip,
            create_time: user.create_time,
            roles: user.roles,
            mod_game: user.mod_game,
          })
        }
      })
    },

    reload() {
      this.$root.$children[0].refreshView()
    },

    // 跳转到指定好友对话页
    dumpTalkPage(index_name) {
      sessionStorage.setItem('send_message_index_name', index_name)

      if (this.$route.path == '/message') {
        this.reload()
        return
      }

      this.$router.push('/message')
    },
  },
}
