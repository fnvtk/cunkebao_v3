import { post } from '@/utils/request'

export const DeviceIndex = data => {
    return post('/backend/device/index', data)
}

export const DeviceAssoc = () => {
    return post('/backend/device/assoc', {})
}

export const XianyuIndex = data => {
    return post('/backend/xianyu/index', data)
}

export const XianyuRemark = data => {
    return post('/backend/xianyu/remark', data)
}