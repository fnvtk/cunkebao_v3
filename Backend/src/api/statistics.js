import { post, upload } from '@/utils/request'

export const StatisticsIndex = data => {
    return post('/backend/statistics/index', data)
}

export const StatisticsSummaryUserSmall = data => {
    return post('/backend/statistics_summary/userSmall', data)
}

export const StatisticsSummaryPayMoney = data => {
    return post('/backend/statistics_summary/payMoney', data)
}

export const StatisticsSummarySendNum = data => {
    return post('/backend/statistics_summary/sendNum', data)
}

// 导出数据
export const derive = data => {
    return post('/manage/statistics/derive', data)
}