import request from '../src/utils/request'

export function pageOperationData(deviceName, page, pageSize) {
    return request({
        url: '/operationData?deviceName=' + deviceName +  '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(operationData) {
    return request({
        url: '/operationData',
        method: 'post',
        data: operationData
    })
}

export function update(operationData) {
    return request({
        url: '/operationData',
        method: 'put',
        data: operationData
    })
}


export function deleteById(id) {
    return request({
        url: '/operationData/' + id,
        method: 'delete',
    })
}


export function selectById(id) {
    return request({
        url: '/operationData/' + id,
        method: 'get',
    })
}

export function selectByDeviceId(deviceId) { 
    return request({
        url: '/operationData/device/' + deviceId,
        method: 'get',
    })
}
