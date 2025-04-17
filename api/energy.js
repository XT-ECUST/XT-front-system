import request from '../src/utils/request'

// 查询所有工艺
export function getAllCrafts() {
    return request({
        url: '/craft/all',
        method: 'get'
    })
}

// 触发能耗计算的接口（新增 section 参数）
export function calculateEnergyData(section) {
    return request({
        url: '/energy/calculate',
        method: 'get',
        params: { section } // 传递工段参数
    })
}



