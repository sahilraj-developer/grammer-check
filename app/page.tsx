"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  Copy,
  RotateCcw,
  FileText,
  Zap,
  Upload,
  User,
  LogOut,
  Crown,
  Settings,
  Wand2,
  Search,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Save,
  Undo2,
  Redo2,
  Target,
  AlertCircle,
  FileDown,
  Keyboard,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginDialog } from "@/components/auth/login-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deepSeekService, type DeepSeekResponse } from "@/lib/deepseek-service"
import {
  premiumGrammarService,
  type StyleSuggestion,
  type PlagiarismResult,
  type AdvancedStats,
} from "@/lib/premium-features"
import { StyleSuggestions } from "@/components/premium/style-suggestions"
import { PlagiarismChecker } from "@/components/premium/plagiarism-checker"
import { AdvancedAnalytics } from "@/components/premium/advanced-analytics"
import { TextAnalytics, type TextStatistics, type WritingGoal } from "@/lib/text-analytics"
import { TextValidator, type ValidationResult } from "@/lib/validation"
import { StatisticsPanel } from "@/components/text-analytics/statistics-panel"

export default function GrammarAssistant() {
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<DeepSeekResponse | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([])
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null)
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [textStatistics, setTextStatistics] = useState<TextStatistics | null>(null)
  const [writingGoals, setWritingGoals] = useState<WritingGoal[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [newGoal, setNewGoal] = useState({ type: "wordCount" as const, target: 500 })

  const { toast } = useToast()
  const { user, isAuthenticated, logout, updateUsage, anonymousUsage, updateAnonymousUsage, canUseAnonymous } =
    useAuth()

  useEffect(() => {
    if (autoSaveEnabled && inputText) {
      const timer = setTimeout(() => {
        localStorage.setItem("grammar-assistant-draft", inputText)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [inputText, autoSaveEnabled])

  useEffect(() => {
    const draft = localStorage.getItem("grammar-assistant-draft")
    if (draft && !inputText) {
      setInputText(draft)
    }
  }, [])

  useEffect(() => {
    if (inputText.trim()) {
      const stats = TextAnalytics.calculateStatistics(inputText)
      setTextStatistics(stats)

      // Update writing goals progress
      setWritingGoals((prev) => prev.map((goal) => TextAnalytics.updateGoalProgress(goal, stats)))

      // Validate text
      const validation = TextValidator.validateText(inputText)
      setValidationResult(validation)
    } else {
      setTextStatistics(null)
      setValidationResult(null)
    }
  }, [inputText])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault()
            handleCorrect()
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
          case "z":
            if (e.shiftKey) {
              e.preventDefault()
              handleRedo()
            } else {
              e.preventDefault()
              handleUndo()
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [inputText, history, historyIndex])

  const addToHistory = useCallback(
    (text: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(text)
        return newHistory.slice(-50) // Keep last 50 entries
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex],
  )

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      setInputText(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      setInputText(history[historyIndex + 1])
    }
  }

  const handleSave = () => {
    localStorage.setItem("grammar-assistant-saved", inputText)
    toast({
      title: "Saved!",
      description: "Your text has been saved locally.",
    })
  }

  const handleCorrect = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to correct",
        description: "Please enter some text to check for grammar errors.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Starting grammar correction for text:", inputText)

    const validation = TextValidator.validateText(inputText)
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      })
      return
    }

    if (validation.warnings.length > 0) {
      toast({
        title: "Warning",
        description: validation.warnings[0],
      })
    }

    if (!isAuthenticated) {
      if (!canUseAnonymous()) {
        toast({
          title: "Usage limit reached",
          description: `You've used all ${anonymousUsage.limit} free corrections. Sign up for 30 free corrections per month!`,
          variant: "destructive",
        })
        setShowLoginDialog(true)
        return
      }
    } else if (user && user.usage.corrections >= user.usage.monthlyLimit) {
      toast({
        title: "Usage limit reached",
        description: `You've reached your monthly limit of ${user.usage.monthlyLimit} corrections. Upgrade for unlimited access.`,
        variant: "destructive",
      })
      return
    }

    addToHistory(inputText)

    setIsProcessing(true)
    try {
      const sanitizedText = TextValidator.sanitizeText(inputText)
      console.log("[v0] Sanitized text:", sanitizedText)

      console.log("[v0] About to call deepSeekService.correctGrammar...")
      const grammarResult = await deepSeekService.correctGrammar(sanitizedText)
      console.log("[v0] Raw grammar result received:", grammarResult)
      console.log("[v0] Grammar result type:", typeof grammarResult)
      console.log("[v0] Grammar result keys:", grammarResult ? Object.keys(grammarResult) : "null/undefined")

      if (!grammarResult) {
        console.log("[v0] ERROR: Grammar result is null/undefined!")
        throw new Error("DeepSeek service returned null result")
      }

      if (!grammarResult.errors) {
        console.log("[v0] ERROR: Grammar result has no errors array!")
        console.log("[v0] Grammar result structure:", JSON.stringify(grammarResult, null, 2))
      }

      console.log("[v0] Number of errors found:", grammarResult.errors?.length || 0)
      console.log("[v0] Errors array:", grammarResult.errors)
      console.log(
        "[v0] Errors by type:",
        grammarResult.errors?.reduce(
          (acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {},
      )

      console.log("[v0] About to setResult with:", grammarResult)
      setResult(grammarResult)
      console.log("[v0] setResult called successfully")

      const hasPremiumFeatures = user?.plan === "premium" || user?.plan === "pro"
      if (hasPremiumFeatures) {
        const premiumResult = await premiumGrammarService.advancedCorrection(sanitizedText, user?.plan || "free")

        if (premiumResult.styleSuggestions) {
          setStyleSuggestions(premiumResult.styleSuggestions)
        }
        if (premiumResult.plagiarismResult) {
          setPlagiarismResult(premiumResult.plagiarismResult)
        }
        if (premiumResult.advancedStats) {
          setAdvancedStats(premiumResult.advancedStats)
        }
      }

      if (isAuthenticated && user) {
        updateUsage(user.usage.corrections + 1)
      } else {
        updateAnonymousUsage(anonymousUsage.corrections + 1)
      }

      toast({
        title: "Analysis complete!",
        description: `Found ${grammarResult.errors?.length || 0} issues. Powered by DeepSeek AI`,
      })
    } catch (error) {
      console.log("[v0] Error during grammar correction:", error)
      console.log("[v0] Error type:", typeof error)
      console.log("[v0] Error message:", error instanceof Error ? error.message : "Unknown error")
      console.log("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to correct grammar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      console.log("[v0] Grammar correction process completed")
    }
  }

  const handleApplyFix = (errorIndex: number) => {
    if (!result) return

    const error = result.errors[errorIndex]
    const newText = inputText.replace(error.original, error.suggestion)
    addToHistory(inputText)
    setInputText(newText)

    // Remove the applied error from results
    const newErrors = result.errors.filter((_, index) => index !== errorIndex)
    setResult({ ...result, errors: newErrors })

    toast({
      title: "Fix applied",
      description: `Replaced "${error.original}" with "${error.suggestion}"`,
    })
  }

  const handleCopy = async () => {
    if (result?.corrected) {
      await navigator.clipboard.writeText(result.corrected)
      toast({
        title: "Copied!",
        description: "Corrected text has been copied to clipboard.",
      })
    }
  }

  const handleReset = () => {
    addToHistory(inputText)
    setInputText("")
    setResult(null)
    setStyleSuggestions([])
    setPlagiarismResult(null)
    setAdvancedStats(null)
    setTextStatistics(null)
    setValidationResult(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = TextValidator.validateFile(file)
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.errors[0],
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const sanitizedContent = TextValidator.sanitizeText(content)
      addToHistory(inputText)
      setInputText(sanitizedContent)
    }
    reader.readAsText(file)
  }

  const handleDownload = (format: "txt" | "rtf" = "txt") => {
    const content = result?.corrected || inputText
    if (!content) return

    let blob: Blob
    let filename: string

    if (format === "rtf") {
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${content.replace(/\n/g, "\\par ")}}`
      blob = new Blob([rtfContent], { type: "application/rtf" })
      filename = "corrected-text.rtf"
    } else {
      blob = new Blob([content], { type: "text/plain" })
      filename = "corrected-text.txt"
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    })
  }

  const handleAddGoal = () => {
    const goal = TextAnalytics.createWritingGoal(newGoal.type, newGoal.target)
    setWritingGoals((prev) => [...prev, goal])
    setShowGoalDialog(false)
    toast({
      title: "Goal added!",
      description: `New ${newGoal.type} goal of ${newGoal.target} created.`,
    })
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

  const hasPremiumFeatures = user?.plan === "premium" || user?.plan === "pro"
  const errorsByType =
    result?.errors.reduce(
      (acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  console.log("[v0] Current errorsByType:", errorsByType)
  console.log("[v0] Current result:", result)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GrammarPro</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Writing Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>Speed up your workflow with these shortcuts</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Check Grammar</span>
                      <Badge variant="outline">Ctrl/Cmd + Enter</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Save</span>
                      <Badge variant="outline">Ctrl/Cmd + S</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Undo</span>
                      <Badge variant="outline">Ctrl/Cmd + Z</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Redo</span>
                      <Badge variant="outline">Ctrl/Cmd + Shift + Z</Badge>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {isAuthenticated && user ? (
                <>
                  {getPlanBadge(user.plan)}
                  <div className="hidden sm:flex text-xs text-muted-foreground">
                    {user.usage.corrections}/{user.usage.monthlyLimit} used
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">{user.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      {user.isAdmin && (
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          <Link href="/admin">Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <div className="hidden sm:flex text-xs text-muted-foreground">
                    {anonymousUsage.corrections}/{anonymousUsage.limit} free checks
                  </div>
                  <Button onClick={() => setShowLoginDialog(true)} size="sm">
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <section className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Perfect Your Writing with AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced grammar correction powered by DeepSeek AI. Get 5 free checks, then sign up for 30 free monthly
            corrections!
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Text</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                    {textStatistics && (
                      <Badge variant="outline" className="text-xs">
                        {textStatistics.wordCount} words
                      </Badge>
                    )}
                    <input
                      type="file"
                      accept=".txt,.rtf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Enter your text to check for grammar, spelling, and style issues.
                  {hasPremiumFeatures && (
                    <span className="block mt-1 text-blue-600 dark:text-blue-400">
                      Premium features enabled: Style suggestions, plagiarism detection, and advanced analytics.
                    </span>
                  )}
                  {validationResult?.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-1 mt-1 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs">{warning}</span>
                    </div>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="She dont like playing football becaus she think it boring..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] resize-none text-base leading-relaxed"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCorrect}
                    disabled={isProcessing || !inputText.trim() || (validationResult && !validationResult.isValid)}
                    className="flex-1"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing with DeepSeek AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {hasPremiumFeatures ? "Advanced Check" : "Check Grammar"}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleReset} disabled={!inputText && !result}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg">
                        <Target className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Writing Goal</DialogTitle>
                        <DialogDescription>Set a target to track your progress</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="goal-type">Goal Type</Label>
                          <select
                            id="goal-type"
                            className="w-full p-2 border rounded"
                            value={newGoal.type}
                            onChange={(e) => setNewGoal((prev) => ({ ...prev, type: e.target.value as any }))}
                          >
                            <option value="wordCount">Word Count</option>
                            <option value="sentences">Sentences</option>
                            <option value="readingTime">Reading Time (minutes)</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="goal-target">Target</Label>
                          <Input
                            id="goal-target"
                            type="number"
                            value={newGoal.target}
                            onChange={(e) =>
                              setNewGoal((prev) => ({ ...prev, target: Number.parseInt(e.target.value) || 0 }))
                            }
                          />
                        </div>
                        <Button onClick={handleAddGoal} className="w-full">
                          Add Goal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {result && result.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Issues Found ({result.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.errors.map((error, index) => (
                    <div key={index} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              error.type === "grammar"
                                ? "destructive"
                                : error.type === "spelling"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {error.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            "{error.original}" → "{error.suggestion}"
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{error.explanation}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleApplyFix(index)} className="ml-2">
                        Apply
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Corrected Text</span>
                  {result && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileDown className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDownload("txt")}>Download as TXT</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload("rtf")}>Download as RTF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[300px] p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20">
                  {isProcessing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">DeepSeek AI is analyzing your text...</p>
                      </div>
                    </div>
                  ) : result?.corrected ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-base">{result.corrected}</p>
                  ) : (
                    <p className="text-muted-foreground italic text-center mt-20">
                      Your corrected text will appear here...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {result && result.improvements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Writing Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Statistics and Results Sidebar */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{errorsByType.grammar || 0}</div>
                  <div className="text-xs text-muted-foreground">Grammar</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{errorsByType.spelling || 0}</div>
                  <div className="text-xs text-muted-foreground">Spelling</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{errorsByType.style || 0}</div>
                  <div className="text-xs text-muted-foreground">Style</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{result?.readabilityScore || 0}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </CardContent>
              </Card>
            </div>

            {textStatistics && <StatisticsPanel statistics={textStatistics} goals={writingGoals} />}
          </div>
        </div>

        {hasPremiumFeatures && (styleSuggestions.length > 0 || plagiarismResult || advancedStats) && (
          <div className="space-y-6">
            <Separator />
            <h3 className="text-2xl font-bold text-center">Premium Features</h3>

            <div className="grid gap-6 lg:grid-cols-3">
              {styleSuggestions.length > 0 && (
                <StyleSuggestions
                  suggestions={styleSuggestions}
                  onApplySuggestion={(suggestion) => {
                    if (result) {
                      const newCorrected = result.corrected.replace(suggestion.original, suggestion.suggestion)
                      setResult({ ...result, corrected: newCorrected })
                      setStyleSuggestions((prev) => prev.filter((s) => s !== suggestion))
                    }
                  }}
                />
              )}

              {plagiarismResult && <PlagiarismChecker result={plagiarismResult} />}

              {advancedStats && <AdvancedAnalytics stats={advancedStats} />}
            </div>
          </div>
        )}

        {!hasPremiumFeatures && (
          <section className="space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-2xl font-bold">Unlock Premium Features</h3>
              <p className="text-muted-foreground mt-2">Get advanced writing assistance with our premium plans</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="text-center border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Style Suggestions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get AI-powered suggestions to improve clarity, conciseness, and engagement
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Premium</Badge>
                </CardContent>
              </Card>

              <Card className="text-center border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Plagiarism Detection</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check your content against billions of web pages for originality
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Premium</Badge>
                </CardContent>
              </Card>

              <Card className="text-center border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get detailed insights into tone, formality, and writing complexity
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Premium</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link href="/pricing">
                <Button size="lg" className="mt-4">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-card/50 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">GrammarPro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional AI-powered grammar correction and writing assistance
            </p>
            <p className="text-xs text-muted-foreground">© 2024 GrammarPro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}
