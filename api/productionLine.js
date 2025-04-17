import request from '../src/utils/request'

export function page(lineName, lineType, page, pageSize) {
    return request({
        url: '/productionLines?lineName=' + lineName + '&lineType=' + lineType + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(productionLine) {
    return request({
        url: '/productionLines',
        method: 'post',
        data: productionLine
    })
}

export function update(productionLine) {
    return request({
        url: '/productionLines',
        method: 'put',
        data: productionLine
    })
}


export function deleteById(id) {
    return request({
        url: '/productionLines/' + id,
        method: 'delete',
    })
}


export function selectById(id) {
    return request({
        url: '/productionLines/' + id,
        method: 'get',
    })
}