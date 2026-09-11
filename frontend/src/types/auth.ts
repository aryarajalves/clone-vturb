export type UserRole = 'super_admin' | 'admin' | 'user'

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  is_super_admin: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface UserInvite {
  id: string
  token: string
  role: 'admin' | 'user'
  expires_at: string
  is_used: boolean
  used_by_email?: string | null
  created_at: string
  invite_url?: string
}

export interface CreateInvitePayload {
  role: 'admin' | 'user'
  duration_hours: number
}

export interface InviteValidation {
  valid: boolean
  role: 'admin' | 'user'
  expires_at: string
}

export interface RegisterInvitePayload {
  token: string
  email: string
  password: string
}

