export default {
    path: '/system',
    name: 'system',
    meta: {
        title: '系统设置',
        needLogin: true,
    },
    redirect: '/system/index',
    component: () => import('@/views/system/layout'),
    children: [
        {
            path: '/system/index',
            meta: {
                title: '个人信息',
                needLogin: true,
            },
            component: () => import('@/views/system/index'),
        },
        {
            path: '/system/user',
            meta: {
                title: '员工管理',
                needLogin: true,
            },
            component: () => import('@/views/system/user'),
        },
        {
            path: '/system/role',
            meta: {
                title: '角色管理',
                needLogin: true,
            },
            component: () => import('@/views/system/role'),
        },
    ],
}