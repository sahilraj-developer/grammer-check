export interface UserRole {
  id: string
  name: string
  permissions: string[]
  description: string
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  plan: "free" | "premium" | "pro"
  status: "active" | "suspended" | "pending" | "banned"
  isAdmin: boolean
  roles: string[]
  usage: {
    corrections: number
    monthlyLimit: number
    resetDate: string
  }
  profile: {
    avatar?: string
    bio?: string
    company?: string
    website?: string
    location?: string
    timezone?: string
  }
  preferences: {
    emailNotifications: boolean
    marketingEmails: boolean
    language: string
    theme: "light" | "dark" | "system"
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginAttempts: number
    lockedUntil?: string
  }
  createdAt: string
  updatedAt: string
  lastActive: string
  totalSpent: number
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  usersByPlan: {
    free: number
    premium: number
    pro: number
  }
  usersByStatus: {
    active: number
    suspended: number
    pending: number
    banned: number
  }
}

export const defaultRoles: UserRole[] = [
  {
    id: "user",
    name: "User",
    permissions: ["grammar.check", "profile.edit"],
    description: "Standard user with basic permissions",
  },
  {
    id: "premium",
    name: "Premium User",
    permissions: ["grammar.check", "grammar.advanced", "profile.edit", "export.documents"],
    description: "Premium user with advanced features",
  },
  {
    id: "admin",
    name: "Administrator",
    permissions: ["*"],
    description: "Full system access",
  },
  {
    id: "moderator",
    name: "Moderator",
    permissions: ["users.view", "users.suspend", "content.moderate"],
    description: "Content moderation and user management",
  },
]

export const userManagementService = {
  async getUsers(filters?: {
    search?: string
    plan?: string
    status?: string
    role?: string
    page?: number
    limit?: number
  }): Promise<{ users: UserProfile[]; total: number; pages: number }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock data - replace with real API
    const mockUsers: UserProfile[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        plan: "premium",
        status: "active",
        isAdmin: false,
        roles: ["premium"],
        usage: {
          corrections: 45,
          monthlyLimit: 1000,
          resetDate: "2024-02-01",
        },
        profile: {
          bio: "Content writer and blogger",
          company: "Tech Corp",
          location: "New York, USA",
        },
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          language: "en",
          theme: "light",
        },
        security: {
          twoFactorEnabled: true,
          lastPasswordChange: "2024-01-01",
          loginAttempts: 0,
        },
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20",
        lastActive: "2024-01-20",
        totalSpent: 299,
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        plan: "free",
        status: "active",
        isAdmin: false,
        roles: ["user"],
        usage: {
          corrections: 8,
          monthlyLimit: 10,
          resetDate: "2024-02-01",
        },
        profile: {
          bio: "Student and aspiring writer",
        },
        preferences: {
          emailNotifications: true,
          marketingEmails: true,
          language: "en",
          theme: "dark",
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: "2024-01-18",
          loginAttempts: 0,
        },
        createdAt: "2024-01-18",
        updatedAt: "2024-01-19",
        lastActive: "2024-01-19",
        totalSpent: 0,
      },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        plan: "pro",
        status: "suspended",
        isAdmin: false,
        roles: ["premium"],
        usage: {
          corrections: 150,
          monthlyLimit: 10000,
          resetDate: "2024-02-01",
        },
        profile: {
          bio: "Professional editor",
          company: "Editorial Services Inc",
        },
        preferences: {
          emailNotifications: false,
          marketingEmails: false,
          language: "en",
          theme: "system",
        },
        security: {
          twoFactorEnabled: true,
          lastPasswordChange: "2024-01-10",
          loginAttempts: 3,
        },
        createdAt: "2024-01-10",
        updatedAt: "2024-01-17",
        lastActive: "2024-01-17",
        totalSpent: 599,
      },
    ]

    // Apply filters
    let filteredUsers = mockUsers
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
      )
    }
    if (filters?.plan) {
      filteredUsers = filteredUsers.filter((user) => user.plan === filters.plan)
    }
    if (filters?.status) {
      filteredUsers = filteredUsers.filter((user) => user.status === filters.status)
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    return {
      users: filteredUsers.slice(start, end),
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit),
    }
  },

  async getUserById(id: string): Promise<UserProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // Mock implementation
    const { users } = await this.getUsers()
    return users.find((user) => user.id === id) || null
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock implementation
    const user = await this.getUserById(id)
    if (!user) throw new Error("User not found")

    return {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
  },

  async suspendUser(id: string, reason: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock implementation
    console.log(`User ${id} suspended. Reason: ${reason}`)
  },

  async activateUser(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock implementation
    console.log(`User ${id} activated`)
  },

  async deleteUser(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock implementation
    console.log(`User ${id} deleted`)
  },

  async resetUserPassword(id: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock implementation
    const tempPassword = Math.random().toString(36).slice(-8)
    console.log(`Password reset for user ${id}. Temp password: ${tempPassword}`)
    return tempPassword
  },

  async getUserActivity(userId: string, limit = 50): Promise<UserActivity[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock activity data
    return [
      {
        id: "1",
        userId,
        action: "login",
        details: "User logged in successfully",
        timestamp: "2024-01-20T10:30:00Z",
        ipAddress: "192.168.1.1",
      },
      {
        id: "2",
        userId,
        action: "grammar_check",
        details: "Performed grammar check on 250 words",
        timestamp: "2024-01-20T10:35:00Z",
      },
      {
        id: "3",
        userId,
        action: "profile_update",
        details: "Updated profile information",
        timestamp: "2024-01-19T15:20:00Z",
      },
    ]
  },

  async getUserStats(): Promise<UserStats> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      totalUsers: 1247,
      activeUsers: 892,
      newUsersToday: 12,
      newUsersThisWeek: 89,
      newUsersThisMonth: 234,
      usersByPlan: {
        free: 856,
        premium: 298,
        pro: 93,
      },
      usersByStatus: {
        active: 1156,
        suspended: 45,
        pending: 32,
        banned: 14,
      },
    }
  },

  async bulkUpdateUsers(userIds: string[], updates: Partial<UserProfile>): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Mock implementation
    console.log(`Bulk updated ${userIds.length} users`)
  },

  async exportUsers(filters?: any): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock CSV export
    const csvContent = `Name,Email,Plan,Status,Created At,Total Spent
John Doe,john@example.com,premium,active,2024-01-15,$299
Jane Smith,jane@example.com,free,active,2024-01-18,$0
Mike Johnson,mike@example.com,pro,suspended,2024-01-10,$599`

    return new Blob([csvContent], { type: "text/csv" })
  },
}
