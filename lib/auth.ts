export interface User {
  id: string
  email: string
  name: string
  plan: "free" | "premium" | "pro"
  isAdmin: boolean
  createdAt: string
  usage: {
    corrections: number
    monthlyLimit: number
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@grammarpro.com",
    name: "Admin User",
    plan: "pro",
    isAdmin: true,
    createdAt: "2024-01-01",
    usage: { corrections: 50, monthlyLimit: 10000 },
  },
  {
    id: "2",
    email: "user@example.com",
    name: "John Doe",
    plan: "free",
    isAdmin: false,
    createdAt: "2024-01-15",
    usage: { corrections: 8, monthlyLimit: 30 },
  },
]

export interface AnonymousUsage {
  corrections: number
  limit: number
}

export const anonymousService = {
  getUsage(): AnonymousUsage {
    if (typeof window === "undefined") return { corrections: 0, limit: 5 }
    const stored = localStorage.getItem("anonymous_usage")
    return stored ? JSON.parse(stored) : { corrections: 0, limit: 5 }
  },

  updateUsage(corrections: number): void {
    const usage = { corrections, limit: 5 }
    localStorage.setItem("anonymous_usage", JSON.stringify(usage))
  },

  canUse(): boolean {
    const usage = this.getUsage()
    return usage.corrections < usage.limit
  },

  resetUsage(): void {
    localStorage.removeItem("anonymous_usage")
  },
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Mock authentication - replace with real auth
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (!user || password !== "password") {
      throw new Error("Invalid credentials")
    }

    localStorage.setItem("auth_user", JSON.stringify(user))
    return user
  },

  async register(email: string, password: string, name: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      plan: "free",
      isAdmin: false,
      createdAt: new Date().toISOString(),
      usage: { corrections: 0, monthlyLimit: 30 },
    }

    mockUsers.push(newUser)
    localStorage.setItem("auth_user", JSON.stringify(newUser))
    return newUser
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth_user")
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("auth_user")
    return stored ? JSON.parse(stored) : null
  },

  updateUserUsage(userId: string, corrections: number): void {
    const user = this.getCurrentUser()
    if (user && user.id === userId) {
      user.usage.corrections = corrections
      localStorage.setItem("auth_user", JSON.stringify(user))
    }
  },
}
