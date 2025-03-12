import store from '@/store'
import config from '@/config/config'
//import WsSocket from '@/plugins/socket/ws-socket'
import { getToken } from '@/utils/auth'

// 引入消息处理类
//import TalkEvent from '@/plugins/socket/event/talk-event'
//import RevokeEvent from '@/plugins/socket/event/revoke-event'
//import LoginEvent from '@/plugins/socket/event/login-event'
//import KeyboardEvent from '@/plugins/socket/event/keyboard-event'
//import GroupJoinEvent from '@/plugins/socket/event/group-join-event'
//import FriendApplyEvent from '@/plugins/socket/event/friend-apply-event'

let uuid = () => {
  var s   = [];
  var hex = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hex.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hex.substr((s[19] & 0x3) | 0x8, 1)  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('');
}

let log = (message, contexts = {}, ex = null) => {
  if (config.WS_DEBUG) {
    if (typeof contexts === 'object') {
      for (var k in contexts) {
        message = message.replaceAll('{' + k + '}', typeof contexts[k] === 'object' ? JSON.stringify(contexts[k]) : contexts[k])
      }
    }
    if (ex) {
      console.log('[WebSocket] ' + message, ex)
    } else {
      console.log('[WebSocket] ' + message)
    }

  }
}

let callbacks = {}

/**
 * SocketInstance 连接实例
 *
 * 注释: 所有 WebSocket 消息接收处理在此实例中处理
 */
class SocketInstance {
  /**
   * WsSocket 实例
   */
  socket

  /**
   * SocketInstance 初始化实例
   */
  constructor() {
    /*this.socket = new WsSocket(
      () => {
        return `${config.BASE_WS_URL}?token=` + getToken()
      },
      {
        onError: evt => {
          console.log('Websocket 连接失败回调方法')
        },
        // Websocket 连接成功回调方法
        onOpen: evt => {
          this.updateSocketStatus(true)
        },
        // Websocket 断开连接回调方法
        onClose: evt => {
          this.updateSocketStatus(false)
        },
      }
    )

    this.registerEvents()*/
  }

  // 连接 WebSocket 服务
  connect() {
    //this.socket.connection()
    this.socket = new WebSocket(`${config.BASE_WS_URL}?token=` + getToken())
    // 连接打开
    this.socket.onopen = (e) => {
      this.updateSocketStatus(true)
      this.request('test', {}, (ret) => {
        console.log('request test: ', ret)
      })

      log('open: {e}', { e })
    }
    // 接收消息
    this.socket.onmessage = (e) => {
      log('recv: {data}', { data: e.data })
      try {
        var data = JSON.parse(e.data)
        if (data['type'] === 'answer') {
          if (callbacks[data['requestId']]) {
            callbacks[data['requestId']](data['data'])
            delete callbacks[data['requestId']];
          }
        }
      } catch (ex) {
        log('recv error: {data}', { data: e.data }, ex)
      }
    }
    this.socket.onclose = (e) => {
      this.updateSocketStatus(false)

      log('close: {e}', { e })
      log('reconnect in three seconds')
      setTimeout(() => {
        if (getToken()) {
          this.connect()
        }
      }, 3000)
    }
    this.socket.onerror = (e) => {
      log('error: {e}', { e })
    }
  }

  /**
   * 注册回调消息处理事件
   */
  /*registerEvents() {
    this.socket
      .on('event_talk', data => {
        new TalkEvent(data).handle()
      })
      .on('event_online_status', data => {
        new LoginEvent(data).handle()
      })
      .on('event_keyboard', data => {
        new KeyboardEvent(data).handle()
      })
      .on('event_revoke_talk', data => {
        new RevokeEvent(data).handle()
      })
      .on('event_friend_apply', data => {
        new FriendApplyEvent(data).handle()
      })
      .on('join_group', data => {
        new GroupJoinEvent(data).handle()
      })
  }*/

  /**
   * 更新 WebSocket 连接状态
   *
   * @param {Boolean} status 连接状态
   */
  updateSocketStatus(status) {
    store.commit('UPDATE_SOCKET_STATUS', status)
  }

  /**
   * 聊天发送数据
   *
   * @param {string} mesage
   */
  send(mesage) {
    this.socket.send(mesage)
  }

  /**
   * 调用接口
   *
   * @param type
   * @param data
   * @param callback
   */
  request(type, data, callback) {
    var reqId   = uuid();
    var message = JSON.stringify(Object.assign({
      type: type,
      requestId: reqId,
      data: data,
    }, { from: 1, token: getToken() }))

    if (typeof callback == 'function') {
      callbacks[reqId] = callback
    }

    this.send(message)

    log('send: {message}', { message })
  }

  /**
   * 推送消息
   *
   * @param {String} event 事件名
   * @param {Object} data 数据
   */
  emit(event, data) {
    this.socket.request(event, data)
  }

  close() {
    if (this.socket) {
      this.socket.close()
    }
  }
}

export default new SocketInstance()
