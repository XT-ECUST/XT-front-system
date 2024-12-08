import request from '../src/utils/request'

export function page(deviceName, deviceType, page, pageSize) {
    return request({
        url: '/devices?deviceName=' + deviceName + '&deviceType=' + deviceType + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(device) {
    return request({
        url: '/devices',
        method: 'post',
        data: device
    })
}

export function update(device) {
    return request({
        url: '/devices',
        method: 'put',
        data: device
    })
}


export function deleteById(id) {
    return request({
        url: '/devices/' + id,
        method: 'delete',
    })
}


export function selectById(id) {
    return request({
        url: '/devices/' + id,
        method: 'get',
    })
}

