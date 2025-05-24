import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { page } from '../../api/device'

export interface Device {
  deviceId: number
  deviceName: string
  deviceType: number
  number: string
}

export interface DeviceOption {
  label: string
  value: string
}

export function useDevice() {
  const deviceOptions = ref<DeviceOption[]>([])
  const deviceMap = ref<Map<number, Device>>(new Map())

  const loadDeviceOptions = async () => {
    try {
      const res = await page('', '', 1, 1000) // 获取所有设备
      if (res.data.code === 1) {
        const devices = res.data.data.rows
        // 转换为选项格式
        deviceOptions.value = devices.map((device: Device) => ({
          label: device.deviceName,
          value: device.deviceId
        }))
        
        // 创建设备ID到设备对象的映射
        devices.forEach((device: Device) => {
          deviceMap.value.set(device.deviceId, device)
        })
      } else {
        ElMessage.error('获取设备列表失败')
      }
    } catch (error) {
      console.error('加载设备列表出错:', error)
      ElMessage.error('加载设备列表失败')
    }
  }

  return {
    deviceOptions,
    deviceMap,
    loadDeviceOptions
  }
} 