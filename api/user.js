import request from '../src/utils/request'

export function page(name, gender, page, pageSize) {
    return request({
        url: '/users?name=' + name + '&gender=' + gender + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(user) {
    return request({
        url: '/users',
        method: 'post',
        data: user
    })
}

export function update(user) {
    return request({
        url: '/users',
        method: 'put',
        data: user
    })
}


export function deleteById(id) {
    return request({
        url: '/users/' + id,
        method: 'delete',
    })
}


export function selectById(id) {
    return request({
        url: '/users/' + id,
        method: 'get',
    })
}

