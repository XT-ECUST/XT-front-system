import request from '../utils/request'

export function page(deviceName, status, page, pageSize) {
    return request({
        url: '/fault-handling?deviceName=' + deviceName + '&status=' + status + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(faultHandling) {
    return request({
        url: '/fault-handling',
        method: 'post',
        data: faultHandling
    })
}

export function update(faultHandling) {
    return request({
        url: '/fault-handling',
        method: 'put',
        data: faultHandling
    })
}

export function deleteById(id) {
    return request({
        url: '/fault-handling/' + id,
        method: 'delete',
    })
}

export function selectById(id) {
    return request({
        url: '/fault-handling/' + id,
        method: 'get',
    })
} 