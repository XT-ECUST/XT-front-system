import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { page } from '../../api/user'

export interface User {
  id: number
  username: string
  name: string
  gender: string
}

export interface UserOption {
  label: string
  value: string
}

export function useUser() {
  const userOptions = ref<UserOption[]>([])
  const userMap = ref<Map<number, User>>(new Map())

  const loadUserOptions = async () => {
    try {
      const res = await page('', '', 1, 1000) // 获取所有用户
      if (res.data.code === 1) {
        const users = res.data.data.rows
        // 转换为选项格式
        userOptions.value = users.map((user: User) => ({
          label: user.name || user.username,
          value: user.id
        }))
        
        // 创建用户ID到用户对象的映射
        users.forEach((user: User) => {
          userMap.value.set(user.id, user)
        })
      } else {
        ElMessage.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('加载用户列表出错:', error)
      ElMessage.error('加载用户列表失败')
    }
  }

  return {
    userOptions,
    userMap,
    loadUserOptions
  }
} 