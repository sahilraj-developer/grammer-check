"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Wand2, Target, Zap } from "lucide-react"
import type { StyleSuggestion } from "@/lib/premium-features"

interface StyleSuggestionsProps {
  suggestions: StyleSuggestion[]
  onApplySuggestion: (suggestion: StyleSuggestion) => void
}

export function StyleSuggestions({ suggestions, onApplySuggestion }: StyleSuggestionsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "clarity":
        return <Target className="h-4 w-4" />
      case "conciseness":
        return <Zap className="h-4 w-4" />
      case "engagement":
        return <Lightbulb className="h-4 w-4" />
      case "formality":
        return <Wand2 className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      clarity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      conciseness: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      engagement: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      formality: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }

    return (
      <Badge className={colors[type as keyof typeof colors] || colors.clarity}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Style Suggestions
          </CardTitle>
          <CardDescription>No style suggestions available for this text</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Style Suggestions
        </CardTitle>
        <CardDescription>Improve your writing style and clarity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              {getTypeBadge(suggestion.type)}
              <Button size="sm" onClick={() => onApplySuggestion(suggestion)}>
                Apply
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Original:</span>
                <code className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded text-red-800 dark:text-red-200">
                  {suggestion.original}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Suggested:</span>
                <code className="bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded text-green-800 dark:text-green-200">
                  {suggestion.suggestion}
                </code>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
