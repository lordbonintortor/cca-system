import type { User } from '../context/auth'
import { supabase } from './supabaseClient'

type Metadata = Record<string, unknown>
const AUTH_USERNAME_DOMAIN = 'cca.local'
const ADMIN_LOGIN_EMAIL = import.meta.env.VITE_AUTH_ADMIN_EMAIL?.trim().toLowerCase()

const getMetadataString = (metadata: Metadata, keys: string[]) => {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

export const validateCredentials = async (
  username: string,
  password: string
): Promise<User | null> => {
  const loginName = username.trim().toLowerCase()
  if (!loginName || !password) {
    return null
  }

  const email =
    loginName === 'admin' && ADMIN_LOGIN_EMAIL
      ? ADMIN_LOGIN_EMAIL
      : loginName.includes('@')
        ? loginName
        : `${loginName}@${AUTH_USERNAME_DOMAIN}`

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return null
  }

  const userMetadata = data.user.user_metadata as Metadata
  const appMetadata = data.user.app_metadata as Metadata
  const role =
    getMetadataString(userMetadata, ['role']) ||
    getMetadataString(appMetadata, ['role']) ||
    'admin'

  return {
    username: getMetadataString(userMetadata, ['username', 'user_name']) || loginName.split('@')[0],
    fullName:
      getMetadataString(userMetadata, ['full_name', 'fullName', 'name', 'display_name']) ||
      loginName.split('@')[0],
    role,
  }
}

export const signOutUser = async () => {
  await supabase.auth.signOut()
}
