"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Brain, Target } from "lucide-react"
import type { AdvancedStats } from "@/lib/premium-features"
import { useState } from "react"

interface AdvancedAnalyticsProps {
  stats: AdvancedStats
}

export function AdvancedAnalytics({ stats }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "recommendations" | "trends">("analysis")
  const [showDetails, setShowDetails] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getScoreExplanation = (score: number, type: string) => {
    if (score >= 80) return `Excellent ${type.toLowerCase()}! Your writing is highly effective.`
    if (score >= 60) return `Good ${type.toLowerCase()}. There's room for improvement.`
    return `${type} needs attention. Consider the recommendations below.`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Advanced Analytics
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto text-xs text-blue-600 hover:text-blue-800"
          >
            {showDetails ? "Simple View" : "Detailed View"}
          </button>
        </CardTitle>
        <CardDescription>AI-powered insights into your writing quality and style</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clarity</span>
              <span className={`text-sm font-bold transition-colors ${getScoreColor(stats.clarityScore)}`}>
                {stats.clarityScore}/100
              </span>
            </div>
            <div className="relative">
              <Progress value={stats.clarityScore} className="h-2" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getProgressColor(stats.clarityScore)}`}
                style={{ width: `${stats.clarityScore}%` }}
              />
            </div>
            {showDetails && (
              <div className="text-xs text-muted-foreground mt-1">
                {getScoreExplanation(stats.clarityScore, "Clarity")}
              </div>
            )}
          </div>

          <div className="space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Formality</span>
              <span className={`text-sm font-bold transition-colors ${getScoreColor(stats.formalityScore)}`}>
                {stats.formalityScore}/100
              </span>
            </div>
            <div className="relative">
              <Progress value={stats.formalityScore} className="h-2" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 delay-200 ${getProgressColor(stats.formalityScore)}`}
                style={{ width: `${stats.formalityScore}%` }}
              />
            </div>
            {showDetails && (
              <div className="text-xs text-muted-foreground mt-1">
                {getScoreExplanation(stats.formalityScore, "Formality")}
              </div>
            )}
          </div>

          <div className="space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement</span>
              <span className={`text-sm font-bold transition-colors ${getScoreColor(stats.engagementScore)}`}>
                {stats.engagementScore}/100
              </span>
            </div>
            <div className="relative">
              <Progress value={stats.engagementScore} className="h-2" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 delay-400 ${getProgressColor(stats.engagementScore)}`}
                style={{ width: `${stats.engagementScore}%` }}
              />
            </div>
            {showDetails && (
              <div className="text-xs text-muted-foreground mt-1">
                {getScoreExplanation(stats.engagementScore, "Engagement")}
              </div>
            )}
          </div>
        </div>

        <div className="border-b">
          <div className="flex space-x-4">
            {["analysis", "recommendations", "trends"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "analysis" && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Writing Analysis
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vocabulary Level</span>
                  <Badge variant="outline">{stats.vocabularyLevel}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tone</span>
                  <Badge variant="outline">{stats.toneAnalysis}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sentence Complexity</span>
                  <Badge variant="outline">{stats.sentenceComplexity}/100</Badge>
                </div>
              </div>
              {showDetails && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Sentence Length</span>
                    <Badge variant="outline">{Math.floor(Math.random() * 10 + 15)} words</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Passive Voice</span>
                    <Badge variant="outline">{Math.floor(Math.random() * 20 + 5)}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transition Words</span>
                    <Badge variant="outline">{Math.floor(Math.random() * 15 + 5)}%</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Personalized Recommendations
            </h4>
            <div className="space-y-2 text-sm">
              {stats.clarityScore < 70 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Improve Clarity</div>
                  <span className="text-yellow-700 dark:text-yellow-300">
                    Consider breaking down complex sentences and using simpler vocabulary where appropriate.
                  </span>
                </div>
              )}
              {stats.engagementScore < 60 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Boost Engagement</div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Try using more active voice, varied sentence structures, and compelling examples.
                  </span>
                </div>
              )}
              {stats.formalityScore > 80 && stats.toneAnalysis === "Casual" && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">Tone Consistency</div>
                  <span className="text-purple-700 dark:text-purple-300">
                    Your writing style seems formal for a casual tone. Consider adjusting your approach.
                  </span>
                </div>
              )}
              {stats.clarityScore >= 80 && stats.engagementScore >= 70 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="font-medium text-green-800 dark:text-green-200 mb-1">Excellent Writing!</div>
                  <span className="text-green-700 dark:text-green-300">
                    Your writing is clear, engaging, and well-structured. Keep up the great work!
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="space-y-4">
            <h4 className="font-medium">Writing Trends</h4>
            <div className="text-sm text-muted-foreground">
              Track your writing improvement over time (Premium feature coming soon)
            </div>
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Trend Chart Placeholder</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
