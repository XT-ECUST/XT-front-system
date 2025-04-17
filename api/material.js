import request from '../src/utils/request'

// 分页查询物料列表
export const page = (code, name, page, pageSize) => {
    return request({
        url: '/materials',
        method: 'get',
        params: {
            code,
            name,
            page,
            pageSize
        }
    })
}

// 根据ID查询物料
export const selectById = (id) => {
    return request({
        url: `/materials/${id}`,
        method: 'get'
    })
}

// 新增物料
export const add = (data) => {
    return request({
        url: '/materials',
        method: 'post',
        data
    })
}

// 修改物料
export const update = (data) => {
    return request({
        url: '/materials',
        method: 'put',
        data
    })
}

// 删除单个物料
export const deleteById = (ids) => {
    return request({
        url: `/materials/${ids}`,
        method: 'delete'
    })
}

// 批量删除物料
export const deleteByIds = (ids) => {
    return request({
        url: '/materials/batch',
        method: 'delete',
        data: ids
    })
}