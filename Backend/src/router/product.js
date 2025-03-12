export default {
    path: '/product',
    name: 'product',
    meta: {
        title: '商品管理',
        needLogin: true,
    },
    redirect: '/product/index',
    component: () => import('@/views/product/layout'),
    children: [
        {
            path: '/product/index',
            meta: {
                title: '商品列表',
                needLogin: true,
            },
            component: () => import('@/views/product/index'),
        },
        {
            path: '/product/group',
            meta: {
                title: '商品分组',
                needLogin: true,
            },
            component: () => import('@/views/product/group'),
        },
    ],
}