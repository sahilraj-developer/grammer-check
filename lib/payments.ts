export interface PricingPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  corrections: number
  popular?: boolean
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "requires_payment_method" | "requires_confirmation" | "succeeded" | "canceled"
  clientSecret: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: "active" | "canceled" | "past_due" | "incomplete"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    corrections: 10,
    features: ["10 grammar corrections per month", "Basic grammar checking", "Spelling correction", "Email support"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29.99,
    interval: "month",
    corrections: 1000,
    popular: true,
    features: [
      "1,000 grammar corrections per month",
      "Advanced grammar checking",
      "Style suggestions",
      "Plagiarism detection",
      "Priority support",
      "Export to multiple formats",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 59.99,
    interval: "month",
    corrections: 10000,
    features: [
      "Unlimited grammar corrections",
      "Advanced AI writing assistant",
      "Team collaboration",
      "Custom style guides",
      "API access",
      "Dedicated support",
      "Advanced analytics",
    ],
  },
]

export const paymentService = {
  async createPaymentIntent(planId: string, userId: string): Promise<PaymentIntent> {
    // Mock payment intent creation - replace with real Stripe integration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const plan = pricingPlans.find((p) => p.id === planId)
    if (!plan) throw new Error("Plan not found")

    return {
      id: `pi_${Date.now()}`,
      amount: Math.round(plan.price * 100), // Convert to cents
      currency: "usd",
      status: "requires_payment_method",
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    }
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    // Mock payment confirmation - replace with real Stripe integration
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success/failure
    const success = Math.random() > 0.1 // 90% success rate

    return {
      id: paymentIntentId,
      amount: 2999, // Mock amount
      currency: "usd",
      status: success ? "succeeded" : "requires_payment_method",
      clientSecret: `${paymentIntentId}_secret`,
    }
  },

  async createSubscription(userId: string, planId: string): Promise<Subscription> {
    // Mock subscription creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    return {
      id: `sub_${Date.now()}`,
      userId,
      planId,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      cancelAtPeriodEnd: false,
    }
  },

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    // Mock subscription cancellation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: subscriptionId,
      userId: "mock_user",
      planId: "premium",
      status: "active",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date().toISOString(),
      cancelAtPeriodEnd: true,
    }
  },

  async getSubscription(userId: string): Promise<Subscription | null> {
    // Mock get subscription
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return null for free users, mock subscription for others
    return Math.random() > 0.5
      ? {
          id: `sub_${userId}`,
          userId,
          planId: "premium",
          status: "active",
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
        }
      : null
  },
}
