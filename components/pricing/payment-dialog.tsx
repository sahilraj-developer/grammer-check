"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Loader2 } from "lucide-react"
import { type PricingPlan, paymentService } from "@/lib/payments"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PricingPlan
}

export function PaymentDialog({ open, onOpenChange, plan }: PaymentDialogProps) {
  const { user, updateUsage } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    email: user?.email || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handlePayment = async () => {
    if (!user) return

    setIsProcessing(true)
    try {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(plan.id, user.id)

      // Simulate payment confirmation
      const confirmedPayment = await paymentService.confirmPayment(paymentIntent.id, "pm_mock_payment_method")

      if (confirmedPayment.status === "succeeded") {
        // Create subscription
        await paymentService.createSubscription(user.id, plan.id)

        // Update user's plan and usage limits (mock update)
        const newUser = {
          ...user,
          plan: plan.id as "free" | "premium" | "pro",
          usage: {
            corrections: user.usage.corrections,
            monthlyLimit: plan.corrections,
          },
        }

        // Update local storage (in real app, this would be handled by the auth service)
        localStorage.setItem("auth_user", JSON.stringify(newUser))

        toast({
          title: "Payment successful!",
          description: `You've successfully upgraded to the ${plan.name} plan.`,
        })

        onOpenChange(false)

        // Refresh the page to update the UI
        window.location.reload()
      } else {
        throw new Error("Payment failed")
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid =
    paymentForm.cardNumber.length >= 19 &&
    paymentForm.expiryDate.length === 5 &&
    paymentForm.cvv.length >= 3 &&
    paymentForm.name.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Upgrade to {plan.name}
          </DialogTitle>
          <DialogDescription>Complete your payment to upgrade your account</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{plan.name} Plan</div>
                  <div className="text-sm text-muted-foreground">
                    {plan.corrections === 10000 ? "Unlimited" : plan.corrections.toLocaleString()} corrections/month
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${plan.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={paymentForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={paymentForm.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handlePayment} disabled={!isFormValid || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${plan.price}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
