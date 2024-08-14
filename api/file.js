import request from './request'

export function page(name, page, pageSize) {
    return request({
        url: '/files?name=' + name + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}


export function uploads() {
    return request({
        url: '/uploads',
        method: 'post'
    })
}

export function add(fileMeta) {
    return request({
        url: '/files',
        method: 'post',
        data: fileMeta
    })
}

export function update(file) {
    return request({
        url: '/files',
        method: 'put',
        data: file
    })
}


export function deleteById(id) {
    return request({
        url: '/files/' + id,
        method: 'delete',
    })
}


export function selectById(id) {
    return request({
        url: '/files/' + id,
        method: 'get',
    })
}

