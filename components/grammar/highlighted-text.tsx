"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import type { GrammarError } from "@/lib/grammar-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, AlertTriangle, Lightbulb } from "lucide-react"

interface HighlightedTextProps {
  text: string
  errors: GrammarError[]
  onApplyFix?: (error: GrammarError) => void
  className?: string
}

export function HighlightedText({ text, errors, onApplyFix, className }: HighlightedTextProps) {
  // Sort errors by start index to process them in order
  const sortedErrors = [...errors].sort((a, b) => a.startIndex - b.startIndex)

  const renderTextWithHighlights = () => {
    if (sortedErrors.length === 0) {
      return <span>{text}</span>
    }

    const elements: React.ReactNode[] = []
    let lastIndex = 0

    sortedErrors.forEach((error, index) => {
      // Add text before the error
      if (error.startIndex > lastIndex) {
        elements.push(<span key={`text-${index}`}>{text.slice(lastIndex, error.startIndex)}</span>)
      }

      // Add highlighted error text
      const errorText = text.slice(error.startIndex, error.endIndex)
      const highlightClass = cn("relative inline-block rounded px-1 cursor-pointer transition-all duration-200", {
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-b-2 border-red-400":
          error.type === "error",
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-b-2 border-yellow-400":
          error.type === "warning",
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-b-2 border-blue-400":
          error.type === "suggestion",
      })

      elements.push(
        <TooltipProvider key={`error-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={highlightClass}>{errorText}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm p-4" side="top">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  {error.type === "error" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                  {error.type === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  {error.type === "suggestion" && <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{error.message}</p>
                    <Badge variant="outline" className="text-xs">
                      {error.category}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Original: </span>
                    <span className="font-mono bg-muted px-1 rounded">{error.original}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Suggestion: </span>
                    <span className="font-mono bg-green-100 dark:bg-green-900/30 px-1 rounded text-green-800 dark:text-green-200">
                      {error.suggestion}
                    </span>
                  </div>
                </div>

                {onApplyFix && (
                  <Button size="sm" onClick={() => onApplyFix(error)} className="w-full">
                    <Check className="h-3 w-3 mr-1" />
                    Apply Fix
                  </Button>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      lastIndex = error.endIndex
    })

    // Add remaining text after the last error
    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.slice(lastIndex)}</span>)
    }

    return elements
  }

  return <div className={cn("leading-relaxed", className)}>{renderTextWithHighlights()}</div>
}
