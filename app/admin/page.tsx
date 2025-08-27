"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Shield,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowLeft,
  Search,
  MoreHorizontal,
  Crown,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { userManagementService, type UserProfile, type UserStats } from "@/lib/user-management"

interface PaymentRecord {
  id: string
  userId: string
  userName: string
  amount: number
  plan: string
  status: "completed" | "pending" | "failed"
  date: string
  method: string
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalCorrections: number
  averageUsage: number
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  // Mock data - replace with real API calls
  const systemStats: SystemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalRevenue: 45680,
    monthlyRevenue: 12340,
    totalCorrections: 89456,
    averageUsage: 67,
  }

  const mockPayments: PaymentRecord[] = [
    {
      id: "pay_1",
      userId: "1",
      userName: "John Doe",
      amount: 29.99,
      plan: "Premium",
      status: "completed",
      date: "2024-01-20",
      method: "Credit Card",
    },
    {
      id: "pay_2",
      userId: "3",
      userName: "Mike Johnson",
      amount: 59.99,
      plan: "Pro",
      status: "completed",
      date: "2024-01-19",
      method: "PayPal",
    },
    {
      id: "pay_3",
      userId: "4",
      userName: "Sarah Wilson",
      amount: 29.99,
      plan: "Premium",
      status: "pending",
      date: "2024-01-18",
      method: "Credit Card",
    },
  ]

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers()
    }
    if (activeTab === "overview") {
      loadUserStats()
    }
  }, [activeTab, searchTerm, selectedPlan, selectedStatus])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const result = await userManagementService.getUsers({
        search: searchTerm,
        plan: selectedPlan === "all" ? undefined : selectedPlan,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        limit: 50,
      })
      setUsers(result.users)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      const stats = await userManagementService.getUserStats()
      setUserStats(stats)
    } catch (error) {
      console.error("Failed to load user stats:", error)
    }
  }

  const handleExportUsers = async () => {
    try {
      const blob = await userManagementService.exportUsers({
        search: searchTerm,
        plan: selectedPlan === "all" ? undefined : selectedPlan,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "users-export.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Users data has been exported successfully",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export users data",
        variant: "destructive",
      })
    }
  }

  const handleUserAction = (userId: string, action: string) => {
    if (action === "View" || action === "Edit") {
      setSelectedUserId(userId)
      setShowUserDialog(true)
    } else {
      toast({
        title: "Action Performed",
        description: `${action} action performed for user ${userId}`,
      })
    }
  }

  const handleUserUpdated = () => {
    loadUsers()
    if (userStats) {
      loadUserStats()
    }
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "premium":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )
      case "pro":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Crown className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            Free
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="text-xl font-bold font-work-sans">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">System management and analytics</p>
                </div>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Crown className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
            <p className="text-muted-foreground">Monitor and manage your GrammarPro application</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Key Metrics with User Stats */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">
                          {userStats?.totalUsers.toLocaleString() || systemStats.totalUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">+{userStats?.newUsersThisMonth || 234} this month</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">
                          {userStats?.activeUsers.toLocaleString() || systemStats.activeUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">+{userStats?.newUsersToday || 12} today</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                        <p className="text-2xl font-bold">${systemStats.monthlyRevenue.toLocaleString()}</p>
                        <p className="text-xs text-green-600">+15% from last month</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Corrections</p>
                        <p className="text-2xl font-bold">{systemStats.totalCorrections.toLocaleString()}</p>
                        <p className="text-xs text-blue-600">This month</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Distribution Stats */}
              {userStats && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Users by Plan</CardTitle>
                      <CardDescription>Distribution of subscription plans</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              <Zap className="h-3 w-3 mr-1" />
                              Free
                            </Badge>
                          </div>
                          <span className="font-medium">{userStats.usersByPlan.free.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                          <span className="font-medium">{userStats.usersByPlan.premium.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              <Crown className="h-3 w-3 mr-1" />
                              Pro
                            </Badge>
                          </div>
                          <span className="font-medium">{userStats.usersByPlan.pro.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Users by Status</CardTitle>
                      <CardDescription>Account status distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                          <span className="font-medium">{userStats.usersByStatus.active.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Suspended
                            </Badge>
                          </div>
                          <span className="font-medium">{userStats.usersByStatus.suspended.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <span className="font-medium">{userStats.usersByStatus.pending.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent User Registrations</CardTitle>
                    <CardDescription>New users who joined in the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          {getPlanBadge(user.plan)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                    <CardDescription>Latest payment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPayments.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">${payment.amount}</div>
                              <div className="text-sm text-muted-foreground">{payment.userName}</div>
                            </div>
                          </div>
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportUsers}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || selectedPlan !== "all" || selectedStatus !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedPlan("all")
                      setSelectedStatus("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getPlanBadge(user.plan)}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {user.usage.corrections}/{user.usage.monthlyLimit}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">${user.totalSpent}</div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, "View")}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, "Edit")}>
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, "Suspend")}>
                                    Suspend User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Payment Management</h3>
                <p className="text-sm text-muted-foreground">Monitor transactions and revenue</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${systemStats.totalRevenue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">${systemStats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Transaction</p>
                        <p className="text-2xl font-bold">$34.50</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest payment activity</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="font-medium">{payment.userName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.plan}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">${payment.amount}</TableCell>
                          <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">Detailed usage and performance metrics</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Daily Active Users</p>
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-xs text-green-600">+5.2% from yesterday</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Corrections Today</p>
                        <p className="text-2xl font-bold">8,456</p>
                        <p className="text-xs text-green-600">+12% from yesterday</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">3.2%</p>
                        <p className="text-xs text-green-600">+0.3% this week</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Session</p>
                        <p className="text-2xl font-bold">12m 34s</p>
                        <p className="text-xs text-blue-600">+2m from last week</p>
                      </div>
                      <Shield className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Trends</CardTitle>
                    <CardDescription>Grammar corrections over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Chart placeholder - Integration with charting library needed
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New user registrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Chart placeholder - Integration with charting library needed
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">System Settings</h3>
                <p className="text-sm text-muted-foreground">Configure application settings and preferences</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Limits</CardTitle>
                    <CardDescription>Configure plan limits and restrictions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Free Plan Daily Limit</label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Premium Plan Daily Limit</label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pro Plan Daily Limit</label>
                      <Input type="number" defaultValue="500" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Configuration</CardTitle>
                    <CardDescription>Manage subscription pricing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Premium Monthly Price ($)</label>
                      <Input type="number" defaultValue="29.99" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pro Monthly Price ($)</label>
                      <Input type="number" defaultValue="59.99" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Annual Discount (%)</label>
                      <Input type="number" defaultValue="20" />
                    </div>
                    <Button>Update Pricing</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>Configure email notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">SMTP Server</label>
                      <Input defaultValue="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From Email</label>
                      <Input defaultValue="noreply@grammarpro.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Support Email</label>
                      <Input defaultValue="support@grammarpro.com" />
                    </div>
                    <Button>Save Email Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session Timeout (minutes)</label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Login Attempts</label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password Min Length</label>
                      <Input type="number" defaultValue="8" />
                    </div>
                    <Button>Update Security</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
