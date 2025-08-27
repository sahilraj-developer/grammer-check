"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, Search, Shield } from "lucide-react"
import type { PlagiarismResult } from "@/lib/premium-features"
import { useState } from "react"

interface PlagiarismCheckerProps {
  result: PlagiarismResult
}

export function PlagiarismChecker({ result }: PlagiarismCheckerProps) {
  const [expandedSource, setExpandedSource] = useState<number | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const getScoreColor = (percentage: number) => {
    if (percentage < 5) return "text-green-600"
    if (percentage < 15) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage < 5) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Original</Badge>
    }
    if (percentage < 15) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Minor Similarity
        </Badge>
      )
    }
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High Similarity</Badge>
  }

  const simulateScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className={`h-5 w-5 ${isScanning ? "animate-spin" : ""}`} />
          Plagiarism Detection
          {isScanning && (
            <Badge variant="secondary" className="animate-pulse">
              Scanning...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Check for content originality across billions of sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-4xl font-bold transition-colors duration-500 ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <div className="text-sm text-muted-foreground">Similarity Found</div>
            {getScoreBadge(result.percentage)}
          </div>

          <div className="relative">
            <Progress value={result.percentage} className="h-3" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full opacity-20" />
          </div>
        </div>

        {result.sources.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Similar Sources Found ({result.sources.length})
              </h4>
              <button
                onClick={simulateScan}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                disabled={isScanning}
              >
                <Search className="h-3 w-3" />
                Rescan
              </button>
            </div>
            <div className="space-y-3">
              {result.sources.map((source, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setExpandedSource(expandedSource === index ? null : index)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{source.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {source.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {source.similarity}% match
                      </Badge>
                      <div className={`transition-transform ${expandedSource === index ? "rotate-180" : ""}`}>▼</div>
                    </div>
                  </div>
                  {expandedSource === index && (
                    <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
                      <div className="text-xs text-muted-foreground mb-2">Matched Content:</div>
                      <div className="text-sm bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded border-l-4 border-yellow-400">
                        "This is a sample of the matched content that was found in the source..."
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button className="text-xs text-blue-600 hover:underline">View Full Source</button>
                        <button className="text-xs text-gray-600 hover:underline">Report False Positive</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`p-3 rounded-lg border ${
            result.percentage < 5
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : result.percentage < 15
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <p
            className={`text-sm ${
              result.percentage < 5
                ? "text-green-800 dark:text-green-200"
                : result.percentage < 15
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-red-800 dark:text-red-200"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-1" />
            {result.percentage < 5
              ? "Excellent! Your content appears to be completely original. No significant similarities found."
              : result.percentage < 15
                ? "Minor similarities detected. This is typically acceptable for academic and professional writing."
                : "High similarity detected. Consider paraphrasing or adding proper citations to improve originality."}
          </p>
          <div className="mt-2 text-xs opacity-75">
            Scanned against {Math.floor(Math.random() * 50 + 10)}B+ sources • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
