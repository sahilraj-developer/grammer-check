"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Star } from "lucide-react"
import { pricingPlans, type PricingPlan } from "@/lib/payments"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { PaymentDialog } from "./payment-dialog"

interface PricingCardsProps {
  onSelectPlan?: (planId: string) => void
}

export function PricingCards({ onSelectPlan }: PricingCardsProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      })
      return
    }

    if (plan.id === "free") {
      toast({
        title: "Already on free plan",
        description: "You're currently using the free plan.",
      })
      return
    }

    if (user?.plan === plan.id) {
      toast({
        title: "Current plan",
        description: `You're already subscribed to the ${plan.name} plan.`,
      })
      return
    }

    setSelectedPlan(plan)
    setShowPaymentDialog(true)
    onSelectPlan?.(plan.id)
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "premium":
        return <Crown className="h-5 w-5 text-blue-600" />
      case "pro":
        return <Star className="h-5 w-5 text-purple-600" />
      default:
        return <Zap className="h-5 w-5 text-gray-600" />
    }
  }

  const isCurrentPlan = (planId: string) => {
    return user?.plan === planId
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""} ${isCurrentPlan(plan.id) ? "ring-2 ring-green-500" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">Most Popular</Badge>
              </div>
            )}

            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1">Current Plan</Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">{getPlanIcon(plan.id)}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/{plan.interval}</span>}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">
                  {plan.corrections === 10000 ? "Unlimited" : plan.corrections.toLocaleString()} corrections
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrentPlan(plan.id)}
              >
                {isCurrentPlan(plan.id)
                  ? "Current Plan"
                  : plan.id === "free"
                    ? "Get Started"
                    : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <PaymentDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog} plan={selectedPlan} />
      )}
    </>
  )
}
