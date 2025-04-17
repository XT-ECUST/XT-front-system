import request from '../src/utils/request'

// 采购订单相关接口
export const getOrders = (params) => {
  return request({
    url: '/api/supply-chain/orders',
    method: 'get',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      orderNo: params.orderNo,
      supplierName: params.supplierName,
      status: params.status
    }
  })
}

export const getOrderById = (orderId) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}`,
    method: 'get'
  })
}

export const createOrder = (data) => {
  return request({
    url: '/api/supply-chain/orders',
    method: 'post',
    data
  })
}

export const approveOrder = (orderId) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}/approve`,
    method: 'put'
  })
}

export const cancelOrder = (orderId) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}/cancel`,
    method: 'put'
  })
}

// 供应商相关接口
export const getSuppliers = () => {
  return request({
    url: '/api/supply-chain/suppliers',
    method: 'get'
  })
}

export const createSupplier = (data) => {
  return request({
    url: '/api/supply-chain/suppliers',
    method: 'post',
    data
  })
}

export const updateSupplier = (data) => {
  return request({
    url: `/api/supply-chain/suppliers/${data.supplierId}`,
    method: 'put',
    data
  })
}

export const deleteSupplier = (supplierId) => {
  return request({
    url: `/api/supply-chain/suppliers/${supplierId}`,
    method: 'delete'
  })
}

// 物料相关接口
export const getMaterials = (params) => {
  return request({
    url: '/api/supply-chain/materials',
    method: 'get',
    params
  })
}

// 采购统计相关接口
export const getOrderStatistics = (params) => {
  return request({
    url: '/api/supply-chain/statistics/orders',
    method: 'get',
    params
  })
}

// 供应商评估相关接口
export const getSupplierRatings = (supplierId) => {
  return request({
    url: `/api/supply-chain/suppliers/${supplierId}/ratings`,
    method: 'get'
  })
}

// 订单跟踪相关接口
export const updateOrderStatus = (orderId, status) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}/status`,
    method: 'put',
    data: { status }
  })
}

// 订单支付相关接口
export const createOrderPayment = (orderId, data) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}/payments`,
    method: 'post',
    data
  })
}

// 订单发票相关接口
export const createOrderInvoice = (orderId, data) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}/invoices`,
    method: 'post',
    data
  })
}

// 订单文档相关接口
export const uploadOrderDocument = (orderId, formData) => {
  return request({
    url: `/api/supply-chain/orders/${orderId}/documents`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出相关接口
export const exportOrders = (params) => {
  return request({
    url: '/api/supply-chain/orders/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export const exportSuppliers = () => {
  return request({
    url: '/api/supply-chain/suppliers/export',
    method: 'get',
    responseType: 'blob'
  })
}