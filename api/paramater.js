import request from '../src/utils/request'

// 查询所有工艺
export function getAllCrafts(name = '') {
    return request({
        url: '/craft/all',
        method: 'get',
        params: { name }
    });
}

// 查询某个工艺的所有参数
export function getParametersByCraftId(craftId) {
    return request({
        url: `/parameter/list/${craftId}`,
        method: 'get'
    })
}

// 新增参数
export function addParameter(parameter) {
    return request({
        url: '/parameter/add',
        method: 'post',
        data: parameter
    })
}

// 更新参数
export function updateParameter(parameter) {
    return request({
        url: '/parameter/update',
        method: 'put',
        data: parameter
    })
}

// 删除参数
export function deleteParameterById(parameterId) {
    return request({
        url: `/parameter/delete/${parameterId}`,
        method: 'delete'
    })
}

// 查询参数的实时数据（通过参数ID）
export function getRealtimeDataByParameterId(parameterId) {
    return request({
        url: `/parameter-realtime/data/${parameterId}`,
        method: 'get'
    })
}
