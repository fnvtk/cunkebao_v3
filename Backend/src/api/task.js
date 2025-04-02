import { post } from '@/utils/request'

export const TaskIndex = data => {
    return post('/backend/task/index', data)
}

export const TaskLog = data => {
    return post('/backend/task/log', data)
}

export const TaskSave = data => {
    return post('/backend/task/save', data)
}

export const TaskDelete = id => {
    return post('/backend/task/delete', { id })
}

export const TaskBatchDelete = ids => {
    return post('/backend/task/batchDelete', { ids })
}

export const TaskRunTypeAssoc = () => {
    return post('/backend/task/runTypeAssoc', { })
}

export const TaskMessageReplyClose = data => {
    return post('/backend/message_reply/close', data)
}