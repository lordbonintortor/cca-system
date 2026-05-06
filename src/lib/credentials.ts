import type { User } from '../context/auth'
import { supabase } from './supabaseClient'

type Metadata = Record<string, unknown>

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
  const email = username.trim()
  if (!email || !password) {
    return null
  }

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
    username: email,
    fullName:
      getMetadataString(userMetadata, ['full_name', 'fullName', 'name', 'display_name']) ||
      email,
    role,
  }
}

export const signOutUser = async () => {
  await supabase.auth.signOut()
}
