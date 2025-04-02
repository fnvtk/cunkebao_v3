export default {
    path: '/home',
    name: 'home',
    meta: {
        title: '首页',
        needLogin: true,
    },
    redirect: '/home/index',
    component: () => import('@/views/home/layout'),
    children: [
        {
            path: '/home/index',
            meta: {
                title: '任务管理',
                needLogin: true,
            },
            component: () => import('@/views/home/index'),
        },
    ],
}
