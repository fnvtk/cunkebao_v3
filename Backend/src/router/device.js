export default {
    path: '/device',
    name: 'device',
    meta: {
        title: '设备管理',
        needLogin: true,
    },
    redirect: '/device/index',
    component: () => import('@/views/device/layout'),
    children: [
        {
            path: '/device/index',
            meta: {
                title: '设备列表',
                needLogin: true,
            },
            component: () => import('@/views/device/index'),
        },
    ],
}