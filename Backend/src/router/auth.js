export default {
  path: '/auth',
  name: 'auth',
  redirect: '/auth/login',
  component: () => import('@/views/auth/layout'),
  children: [
    {
      path: '/auth/login',
      meta: {
        title: '账号登录？',
        needLogin: false,
      },
      component: () => import('@/views/auth/login'),
    },
  ],
}
