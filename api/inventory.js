import request from '../src/utils/request'

export function page(itemName, deviceType, page, pageSize) {
    return request({
        url: '/inventories?itemName=' + itemName + '&deviceType=' + deviceType + '&page=' + page + '&pageSize=' + pageSize,
        method: 'get'
    })
}

export function add(inventory) {
    return request({
        url: '/inventories',
        method: 'post',
        data: inventory
    })
}

export function update(inventory) {
    return request({
        url: '/inventories',
        method: 'put',
        data: inventory
    })
}

export function deleteById(id) {
    return request({
        url: '/inventories/' + id,
        method: 'delete',
    })
}

export function selectById(id) {
    return request({
        url: '/inventories/' + id,
        method: 'get',
    })
}

export function addInventoryIn(inventoryIn) {
    return request({
        url: '/inventories/in',
        method: 'post',
        data: inventoryIn
    })
}

// 新增出库请求
export function addInventoryOut(inventoryOut) {
    return request({
        url: '/inventories/out',
        method: 'post',
        data: inventoryOut
    })
}