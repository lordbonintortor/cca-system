// Admin credentials for testing
export const DEMO_CREDENTIALS = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrator',
    role: 'admin'
  }
]

export const validateCredentials = (username: string, password: string) => {
  const user = DEMO_CREDENTIALS.find(
    (cred) => cred.username === username && cred.password === password
  )
  return user || null
}
