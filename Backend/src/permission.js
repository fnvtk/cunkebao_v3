import router from '@/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import config from '@/config/config'
import {getToken, setToken} from '@/utils/auth'
import ar from "element-ui/src/locale/lang/ar";

NProgress.configure({
  showSpinner: false,
})

const WEBSITE_NAME = config.WEBSITE_NAME

// 登录用户强制重定向页面
const redirect = ['/auth/login', '/auth/register', '/auth/forget']

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${WEBSITE_NAME} | ${to.meta.title}`
    : WEBSITE_NAME

  // 链接传TOKEN
  if (/\?token=.*/i.test(location.href)) {
    let args = location.href.substr(location.href.indexOf('?') + 1).split('&')
    for (var i = 0; i < args.length; i ++) {
      var arg = args[i].split('=');
      if (arg.length >=2 && arg[0].toLowerCase() === 'token' && arg[1]) {
        setToken(arg[1], 7 * 24 * 3600)
      }
    }
  }

  // 如果有token说明该用户已登陆
  if (getToken()) {
    if (redirect.indexOf(to.path) >= 0) {
      next('/')
    }
  } else if (to.meta.needLogin) {
    next('/auth/login')
  }

  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})
