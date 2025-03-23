import request from '../src/utils/request'

// 分页查询工艺详情
export function getCraftDetails(craftName, page, pageSize) {
    return request({
        url: `/craft/details?craftName=${craftName || ''}&pageNum=${page || 1}&pageSize=${pageSize || 10}`,
        method: 'get'
    })
}

// 添加工艺
export function addCraft(craftDetailsDTO) {
    return request({
        url: '/craft/add',
        method: 'post',
        data: craftDetailsDTO
    }).then(response => {
        // 假设后端返回的数据结构中有 craftId 字段
        if (response.data && response.data.data && response.data.data.craftId) {
            craftDetailsDTO.craft.craftId = response.data.data.craftId;
        }
        return response;
    });
}

// 更新工艺
export function updateCraft(craftDetailsDTO) {
    return request({
        url: '/craft/update',
        method: 'put',
        data: craftDetailsDTO
    })
}

// 删除工艺
export function deleteCraft(craftId) {
    return request({
        url: `/craft/delete/${craftId}`,
        method: 'delete'
    })
}
