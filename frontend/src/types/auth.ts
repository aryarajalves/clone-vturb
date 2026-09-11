export interface User {
  id: string
  email: string
  is_super_admin: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}
