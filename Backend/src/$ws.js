import Vue from 'vue'
import config from '@/config/config'

var uuid = () => {
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

var log = (message, contexts = {}, ex = null) => {
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

var callbacks = {}
var reqQueues = []
var connected = false
var websocket = null
var logininfo = {}

Vue.prototype.$wsConnect = (username, password, callback) => {
    websocket = new WebSocket(config.WS_URL)
    websocket.onmessage = (e) => {
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

    websocket.onopen = (e) => {
        log('open: {e}', { e })

        Vue.prototype.$wsReq('login', {
            username: username,
            password: password,
        }, (ret) => {
            if (typeof callback === 'function') {
                callback(ret)
            }
            if (ret.ok) {
                connected = true
                logininfo = { username, password }
                if (reqQueues.length > 0) {
                    for (let i = 0; i < reqQueues.length; i ++) {
                        Vue.prototype.$wsSend(reqQueues[i])
                    }
                }
            } else {
                websocket.close()
                log('login error: {ret}', { ret })
            }
        }, true)
    }
    websocket.onclose = (e) => {
        connected = false

        log('close: {e}', { e })
        if (logininfo) {
            log('reconnect in three seconds')
            setTimeout(() => {
                Vue.prototype.$wsConnect(logininfo.username, logininfo.password)
            }, 3000)
        }
    }
    websocket.onerror = (e) => {
        log('error: {e}', { e })
    }
}

Vue.prototype.$wsSend = (message, force = false) => {
    if (connected || force) {
        websocket.send(message)
    } else {
        reqQueues.push(message)
    }
}

Vue.prototype.$wsReq = (type, data, callback, force = false) => {
    var reqId   = uuid();
    var message = JSON.stringify(Object.assign(config.WS_REQ_PARAMS, {
        type: type,
        requestId: reqId,
        data: data,
    }))

    if (typeof callback == 'function') {
        callbacks[reqId] = callback
    }

    log('send: {message}', { message })

    Vue.prototype.$wsSend(message, force)
}

Vue.prototype.$wsClose = () => {
    logininfo = { username: '', password: '' }
    connected = false
    websocket.close()
}

/*Vue.prototype.$wsConnect('test', '123456', (ret) => {
    console.log('haha', ret)
})*/