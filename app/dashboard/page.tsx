"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Crown, TrendingUp, Calendar, FileText, Zap, Settings, CreditCard, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PricingCards } from "@/components/pricing/pricing-cards"

interface UsageHistory {
  date: string
  corrections: number
  errors: number
  improvements: number
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock usage history data
  const usageHistory: UsageHistory[] = [
    { date: "2024-01-20", corrections: 5, errors: 12, improvements: 8 },
    { date: "2024-01-19", corrections: 3, errors: 7, improvements: 5 },
    { date: "2024-01-18", corrections: 8, errors: 15, improvements: 12 },
    { date: "2024-01-17", corrections: 2, errors: 4, improvements: 3 },
    { date: "2024-01-16", corrections: 6, errors: 11, improvements: 9 },
  ]

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return "text-blue-600"
      case "pro":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
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

  const usagePercentage = (user.usage.corrections / user.usage.monthlyLimit) * 100
  const totalErrors = usageHistory.reduce((sum, day) => sum + day.errors, 0)
  const totalImprovements = usageHistory.reduce((sum, day) => sum + day.improvements, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold font-work-sans">Dashboard</h1>
                <p className="text-xs text-muted-foreground">Manage your account and usage</p>
              </div>
            </div>
            <div className="flex items-center gap-2">{getPlanBadge(user.plan)}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h2>
            <p className="text-muted-foreground">Here's an overview of your writing improvement journey.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                        <p className={`text-2xl font-bold capitalize ${getPlanColor(user.plan)}`}>{user.plan}</p>
                      </div>
                      <Crown className={`h-8 w-8 ${getPlanColor(user.plan)}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">{user.usage.corrections}</p>
                        <p className="text-xs text-muted-foreground">corrections used</p>
                      </div>
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Errors Fixed</p>
                        <p className="text-2xl font-bold text-destructive">{totalErrors}</p>
                        <p className="text-xs text-muted-foreground">last 5 days</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Improvements</p>
                        <p className="text-2xl font-bold text-green-600">{totalImprovements}</p>
                        <p className="text-xs text-muted-foreground">last 5 days</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Usage</CardTitle>
                  <CardDescription>Track your grammar correction usage for this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Used: {user.usage.corrections}</span>
                    <span>Limit: {user.usage.monthlyLimit}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(usagePercentage)}% used</span>
                    <span>{user.usage.monthlyLimit - user.usage.corrections} remaining</span>
                  </div>
                  {usagePercentage > 80 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        You're approaching your monthly limit. Consider upgrading for unlimited access.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your account and upgrade your plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link href="/pricing">
                      <Button className="justify-start h-auto p-4 w-full bg-transparent" variant="outline">
                        <CreditCard className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Upgrade Plan</div>
                          <div className="text-sm text-muted-foreground">Get unlimited corrections</div>
                        </div>
                      </Button>
                    </Link>
                    <Button className="justify-start h-auto p-4 bg-transparent" variant="outline">
                      <Settings className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Account Settings</div>
                        <div className="text-sm text-muted-foreground">Update your preferences</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>Detailed breakdown of your grammar correction usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{user.usage.corrections}</div>
                        <div className="text-sm text-muted-foreground">Corrections This Month</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{Math.round(usagePercentage)}%</div>
                        <div className="text-sm text-muted-foreground">Usage Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.ceil((user.usage.monthlyLimit - user.usage.corrections) / (30 - new Date().getDate()))}
                        </div>
                        <div className="text-sm text-muted-foreground">Daily Average Remaining</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your grammar correction history from the last 5 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageHistory.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">{day.corrections} corrections made</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-destructive">{day.errors} errors fixed</div>
                          <div className="text-sm text-green-600">{day.improvements} improvements</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Billing & Subscription</h3>
                <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
              </div>

              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium capitalize">{user.plan} Plan</div>
                      <div className="text-sm text-muted-foreground">
                        {user.plan === "free" ? "No subscription required" : "Billed monthly"}
                      </div>
                    </div>
                    <div className="text-right">{getPlanBadge(user.plan)}</div>
                  </div>
                  {user.plan !== "free" && (
                    <div className="pt-4 border-t">
                      <Button variant="outline" size="sm">
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgrade Options */}
              {user.plan === "free" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold">Upgrade Your Plan</h4>
                    <p className="text-sm text-muted-foreground">Get more corrections and advanced features</p>
                  </div>
                  <PricingCards />
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <div className="mt-1 p-3 border rounded-lg bg-muted/50">{user.name}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="mt-1 p-3 border rounded-lg bg-muted/50">{user.email}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Current Plan</label>
                      <div className="mt-1 p-3 border rounded-lg bg-muted/50 flex items-center gap-2">
                        {getPlanBadge(user.plan)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Member Since</label>
                      <div className="mt-1 p-3 border rounded-lg bg-muted/50">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="mr-2 bg-transparent">
                      Edit Profile
                    </Button>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
