import { post } from '@/utils/request'

export const ServerIndex = data => {
    return post('/manage/server/index', data)
}