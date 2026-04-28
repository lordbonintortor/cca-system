// Admin credentials for testing
export const DEMO_CREDENTIALS = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrator',
    role: 'admin'
  }
]

// Developer/programmer test credential
DEMO_CREDENTIALS.push({
  username: 'dev',
  password: 'dev123',
  fullName: 'Programmer',
  role: 'programmer'
})

export const validateCredentials = (username: string, password: string) => {
  const user = DEMO_CREDENTIALS.find(
    (cred) => cred.username === username && cred.password === password
  )
  return user || null
}
