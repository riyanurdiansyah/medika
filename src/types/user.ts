export interface UserData {
  id?: string
  email: string
  fullname: string
  username?: string
  avatar?: string | null
  role: string
  status: 'active' | 'inactive'
  directSuperior?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateUserData {
  email: string
  fullname: string
  role: string
  status: 'active' | 'inactive'
  password: string
  guid: string
  directSuperior?: string
}

export interface UserRole {
  id: string
  name: string
  description: string
  isSystem: boolean
  level: number
  status: 'active' | 'inactive'
  createdAt?: Date
  updatedAt?: Date
  guid?: string
  permissions?: string[]
} 