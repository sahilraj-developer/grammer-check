"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingCards } from "@/components/pricing/pricing-cards"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-bold font-work-sans">Pricing Plans</h1>
              <p className="text-xs text-muted-foreground">Choose the perfect plan for your needs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight font-work-sans">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your writing needs. Upgrade or downgrade at any time.
            </p>
          </div>

          {/* Pricing Cards */}
          <PricingCards />

          {/* FAQ Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold font-work-sans">Frequently Asked Questions</h3>
              <p className="text-muted-foreground mt-2">Everything you need to know about our pricing</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll
                    prorate any billing differences.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens if I exceed my limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    If you reach your monthly correction limit, you'll need to upgrade to continue using the service or
                    wait until your limit resets next month.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there a free trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our free plan gives you 10 corrections per month to try our service. No credit card required to get
                    started.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How secure are my payments?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We use industry-standard encryption and secure payment processing. Your payment information is never
                    stored on our servers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 py-12">
            <h3 className="text-2xl font-bold font-work-sans">Ready to improve your writing?</h3>
            <p className="text-muted-foreground">
              Join thousands of users who trust GrammarPro for their writing needs
            </p>
            <Link href="/">
              <Button size="lg" className="mt-4">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
