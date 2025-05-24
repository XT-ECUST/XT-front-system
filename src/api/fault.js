import request from '../utils/request'

export function page(deviceName, status, page, pageSize) {
    return request({
        url: '/faults?deviceName=' + deviceName + '&status=' + status + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(fault) {
    return request({
        url: '/faults',
        method: 'post',
        data: fault
    })
}

export function update(fault) {
    return request({
        url: '/faults',
        method: 'put',
        data: fault
    })
}

export function deleteById(ids) {
    return request({
        url: '/faults/' + ids,
        method: 'delete',
    })
}

export function selectById(id) {
    return request({
        url: '/faults/' + id,
        method: 'get',
    })
} 