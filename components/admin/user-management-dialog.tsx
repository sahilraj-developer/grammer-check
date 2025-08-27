"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { userManagementService, type UserProfile, type UserActivity } from "@/lib/user-management"
import { User, Shield, Activity, Settings, AlertTriangle, CheckCircle, XCircle, Crown, Zap } from "lucide-react"

interface UserManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  onUserUpdated: () => void
}

export function UserManagementDialog({ open, onOpenChange, userId, onUserUpdated }: UserManagementDialogProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activity, setActivity] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()

  useEffect(() => {
    if (open && userId) {
      loadUserData()
    }
  }, [open, userId])

  const loadUserData = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const [userData, activityData] = await Promise.all([
        userManagementService.getUserById(userId),
        userManagementService.getUserActivity(userId),
      ])

      setUser(userData)
      setActivity(activityData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await userManagementService.updateUser(user.id, user)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSuspendUser = async () => {
    if (!user) return

    try {
      await userManagementService.suspendUser(user.id, "Suspended by admin")
      setUser({ ...user, status: "suspended" })
      toast({
        title: "Success",
        description: "User suspended successfully",
      })
      onUserUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      })
    }
  }

  const handleActivateUser = async () => {
    if (!user) return

    try {
      await userManagementService.activateUser(user.id)
      setUser({ ...user, status: "active" })
      toast({
        title: "Success",
        description: "User activated successfully",
      })
      onUserUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive",
      })
    }
  }

  const handleResetPassword = async () => {
    if (!user) return

    try {
      const tempPassword = await userManagementService.resetUserPassword(user.id)
      toast({
        title: "Password Reset",
        description: `Temporary password: ${tempPassword}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      })
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

  if (!user && !isLoading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isLoading ? "Loading..." : `Manage User: ${user?.name}`}
          </DialogTitle>
          <DialogDescription>View and edit user profile, permissions, and activity</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan">Plan</Label>
                      <Select value={user.plan} onValueChange={(value: any) => setUser({ ...user, plan: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={user.status} onValueChange={(value: any) => setUser({ ...user, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={user.profile.bio || ""}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            profile: { ...user.profile, bio: e.target.value },
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={user.profile.company || ""}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            profile: { ...user.profile, company: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={user.profile.location || ""}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            profile: { ...user.profile, location: e.target.value },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">{user.usage.corrections}</div>
                      <div className="text-sm text-muted-foreground">Corrections Used</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{user.usage.monthlyLimit}</div>
                      <div className="text-sm text-muted-foreground">Monthly Limit</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${user.totalSpent}</div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((user.usage.corrections / user.usage.monthlyLimit) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Usage Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    User Permissions
                  </CardTitle>
                  <CardDescription>Manage user roles and administrative privileges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isAdmin">Administrator Access</Label>
                      <p className="text-sm text-muted-foreground">Grant full system access</p>
                    </div>
                    <Switch
                      id="isAdmin"
                      checked={user.isAdmin}
                      onCheckedChange={(checked) => setUser({ ...user, isAdmin: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Current Plan & Status</Label>
                    <div className="flex gap-2">
                      {getPlanBadge(user.plan)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="flex gap-2">
                      {user.status === "active" ? (
                        <Button variant="destructive" size="sm" onClick={handleSuspendUser}>
                          Suspend User
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" onClick={handleActivateUser}>
                          Activate User
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleResetPassword}>
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>User activity log and system interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{item.action.replace("_", " ")}</div>
                          <div className="text-sm text-muted-foreground">{item.details}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                            {item.ipAddress && ` • ${item.ipAddress}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>User security configuration and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Two-Factor Authentication</Label>
                      <div className="flex items-center gap-2">
                        {user.security.twoFactorEnabled ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Last Password Change</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.security.lastPasswordChange).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Login Attempts</Label>
                      <div className="text-sm">{user.security.loginAttempts} failed attempts</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Preferences</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">System notifications</p>
                        </div>
                        <Switch
                          checked={user.preferences.emailNotifications}
                          onCheckedChange={(checked) =>
                            setUser({
                              ...user,
                              preferences: { ...user.preferences, emailNotifications: checked },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">Promotional content</p>
                        </div>
                        <Switch
                          checked={user.preferences.marketingEmails}
                          onCheckedChange={(checked) =>
                            setUser({
                              ...user,
                              preferences: { ...user.preferences, marketingEmails: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
