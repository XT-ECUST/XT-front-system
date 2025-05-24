import request from '../src/utils/request'

// 分页查询维保记录
export function page(deviceName, status, page, pageSize) {
  return request({
    url: '/maintenances',
    method: 'get',
    params: {
      deviceName,
      status,
      page,
      pageSize
    }
  })
}

// 新增维保记录
export function add(data) {
  return request({
    url: '/maintenances',
    method: 'post',
    data
  })
}

// 修改维保记录
export function update(data) {
  return request({
    url: '/maintenances',
    method: 'put',
    data
  })
}

// 删除维保记录
export function deleteById(ids) {
  return request({
    url: `/maintenances/${ids}`,
    method: 'delete'
  })
}

// 根据id查询维保记录
export function selectById(id) {
  return request({
    url: `/maintenances/${id}`,
    method: 'get'
  })
} 