import request from '../src/utils/request'

// 分页查询物料列表
export function page(name, type, pageNum, pageSize) {
    return request({
        url: '/material/list',
        method: 'get',
        params: {
            name,
            type,
            pageNum,
            pageSize
        }
    })
}

// 根据ID查询物料
export function selectById(id) {
    return request({
        url: `/material/${id}`,
        method: 'get'
    })
}

// 新增物料
export function add(data) {
    return request({
        url: '/material',
        method: 'post',
        data
    })
}

// 修改物料
export function update(data) {
    return request({
        url: '/material',
        method: 'put',
        data
    })
}

// 删除单个物料
export function deleteById(id) {
    return request({
        url: `/material/${id}`,
        method: 'delete'
    })
}

// 批量删除物料
export function deleteByIds(ids) {
    return request({
        url: '/material/batch',
        method: 'delete',
        data: ids
    })
}