import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, Target, TrendingUp } from "lucide-react"
import type { TextStatistics, WritingGoal } from "@/lib/text-analytics"

interface StatisticsPanelProps {
  statistics: TextStatistics
  goals?: WritingGoal[]
}

export function StatisticsPanel({ statistics, goals = [] }: StatisticsPanelProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Text Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{statistics.wordCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.characterCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.sentenceCount}</div>
              <div className="text-xs text-muted-foreground">Sentences</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.paragraphCount}</div>
              <div className="text-xs text-muted-foreground">Paragraphs</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Reading Time</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{statistics.readingTime} min</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Words/Sentence</span>
              <span className="text-sm font-medium">{statistics.averageWordsPerSentence}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Reading Difficulty</span>
              <Badge className={getDifficultyColor(statistics.difficulty)}>{statistics.difficulty}</Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Readability Score</span>
                <span className="text-sm font-medium">{statistics.fleschScore}/100</span>
              </div>
              <Progress value={statistics.fleschScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Writing Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">{goal.type.replace(/([A-Z])/g, " $1").trim()}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {goal.current}/{goal.target}
                    </span>
                    {goal.completed && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress value={Math.min(100, (goal.current / goal.target) * 100)} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
