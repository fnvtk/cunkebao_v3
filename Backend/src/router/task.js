export default {
    path: '/task',
    name: 'task',
    meta: {
        title: '任务队列',
        needLogin: true,
    },
    redirect: '/task/index',
    component: () => import('@/views/task/layout'),
    children: [
        {
            path: '/task/index',
            meta: {
                title: '任务队列',
                needLogin: true,
            },
            component: () => import('@/views/task/index'),
        },
    ],
}