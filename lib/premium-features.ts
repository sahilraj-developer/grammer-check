export interface PremiumFeature {
  id: string
  name: string
  description: string
  requiredPlan: "free" | "premium" | "pro"
  icon: string
}

export interface StyleSuggestion {
  type: "clarity" | "conciseness" | "engagement" | "formality"
  original: string
  suggestion: string
  explanation: string
  position: { start: number; end: number }
}

export interface PlagiarismResult {
  percentage: number
  sources: Array<{
    url: string
    title: string
    similarity: number
  }>
}

export interface AdvancedStats {
  sentenceComplexity: number
  vocabularyLevel: string
  toneAnalysis: string
  formalityScore: number
  clarityScore: number
  engagementScore: number
}

export const premiumFeatures: PremiumFeature[] = [
  {
    id: "advanced-grammar",
    name: "Advanced Grammar Checking",
    description: "Detect complex grammatical errors and contextual mistakes",
    requiredPlan: "premium",
    icon: "shield",
  },
  {
    id: "style-suggestions",
    name: "Style & Tone Suggestions",
    description: "Improve clarity, conciseness, and writing style",
    requiredPlan: "premium",
    icon: "wand",
  },
  {
    id: "plagiarism-detection",
    name: "Plagiarism Detection",
    description: "Check for originality against billions of web pages",
    requiredPlan: "premium",
    icon: "search",
  },
  {
    id: "advanced-analytics",
    name: "Advanced Writing Analytics",
    description: "Detailed insights into writing complexity and tone",
    requiredPlan: "premium",
    icon: "chart",
  },
  {
    id: "custom-style-guide",
    name: "Custom Style Guides",
    description: "Create and apply custom writing style preferences",
    requiredPlan: "pro",
    icon: "book",
  },
  {
    id: "team-collaboration",
    name: "Team Collaboration",
    description: "Share documents and collaborate with team members",
    requiredPlan: "pro",
    icon: "users",
  },
  {
    id: "api-access",
    name: "API Access",
    description: "Integrate grammar checking into your applications",
    requiredPlan: "pro",
    icon: "code",
  },
]

export const premiumGrammarService = {
  async advancedCorrection(
    text: string,
    userPlan: string,
  ): Promise<{
    corrected: string
    stats: any
    styleSuggestions?: StyleSuggestion[]
    plagiarismResult?: PlagiarismResult
    advancedStats?: AdvancedStats
  }> {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    let corrected = text
    let errorCount = 0
    let improvementCount = 0

    // Basic corrections (available to all users)
    const basicCorrections = [
      { pattern: /\bdont\b/g, replacement: "don't" },
      { pattern: /\bcant\b/g, replacement: "can't" },
      { pattern: /\bwont\b/g, replacement: "won't" },
      { pattern: /\bim\b/gi, replacement: "I'm" },
      { pattern: /\bits\s+boring\b/g, replacement: "it's boring" },
      { pattern: /\bbecaus\b/g, replacement: "because" },
      { pattern: /\bthink\s+it\s+boring\b/g, replacement: "thinks it's boring" },
      { pattern: /\bShe\s+dont\b/g, replacement: "She doesn't" },
      { pattern: /\bi\b/g, replacement: "I" },
      { pattern: /\bteh\b/g, replacement: "the" },
      { pattern: /\brecieve\b/g, replacement: "receive" },
      { pattern: /\boccured\b/g, replacement: "occurred" },
      { pattern: /\bseperate\b/g, replacement: "separate" },
    ]

    // Advanced corrections (premium/pro only)
    const advancedCorrections = [
      { pattern: /\bwhich\s+is\s+why\b/g, replacement: "therefore" },
      { pattern: /\bin\s+order\s+to\b/g, replacement: "to" },
      { pattern: /\bdue\s+to\s+the\s+fact\s+that\b/g, replacement: "because" },
      { pattern: /\bat\s+this\s+point\s+in\s+time\b/g, replacement: "now" },
      { pattern: /\bfor\s+the\s+purpose\s+of\b/g, replacement: "to" },
      { pattern: /\bin\s+the\s+event\s+that\b/g, replacement: "if" },
      { pattern: /\bwith\s+regard\s+to\b/g, replacement: "regarding" },
      { pattern: /\bin\s+spite\s+of\s+the\s+fact\s+that\b/g, replacement: "although" },
    ]

    // Apply basic corrections
    basicCorrections.forEach(({ pattern, replacement }) => {
      const matches = corrected.match(pattern)
      if (matches) {
        errorCount += matches.length
        corrected = corrected.replace(pattern, replacement)
      }
    })

    // Apply advanced corrections for premium/pro users
    if (userPlan === "premium" || userPlan === "pro") {
      advancedCorrections.forEach(({ pattern, replacement }) => {
        const matches = corrected.match(pattern)
        if (matches) {
          errorCount += matches.length
          corrected = corrected.replace(pattern, replacement)
        }
      })
    }

    // Capitalize sentences
    corrected = corrected.replace(/(^|\. )([a-z])/g, (match, p1, p2) => {
      improvementCount++
      return p1 + p2.toUpperCase()
    })

    // Add missing periods
    if (corrected && !corrected.match(/[.!?]$/)) {
      corrected += "."
      improvementCount++
    }

    const wordCount = corrected.split(/\s+/).filter((word) => word.length > 0).length
    const readabilityScore = Math.min(100, Math.max(0, 100 - (corrected.length / wordCount) * 2))

    const result: any = {
      corrected,
      stats: {
        errors: errorCount,
        improvements: improvementCount,
        readabilityScore: Math.round(readabilityScore),
        wordCount,
      },
    }

    // Add premium features
    if (userPlan === "premium" || userPlan === "pro") {
      result.styleSuggestions = [
        {
          type: "clarity",
          original: "very good",
          suggestion: "excellent",
          explanation: "Use more specific adjectives for clearer communication",
          position: { start: 0, end: 9 },
        },
        {
          type: "conciseness",
          original: "in order to",
          suggestion: "to",
          explanation: "Remove unnecessary words to improve conciseness",
          position: { start: 20, end: 31 },
        },
      ]

      result.plagiarismResult = {
        percentage: Math.floor(Math.random() * 15), // 0-15% similarity
        sources: [
          {
            url: "https://example.com/article1",
            title: "Similar Content Found",
            similarity: 8,
          },
        ],
      }

      result.advancedStats = {
        sentenceComplexity: Math.floor(Math.random() * 100),
        vocabularyLevel: ["Elementary", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
        toneAnalysis: ["Formal", "Casual", "Professional", "Academic"][Math.floor(Math.random() * 4)],
        formalityScore: Math.floor(Math.random() * 100),
        clarityScore: Math.floor(Math.random() * 100),
        engagementScore: Math.floor(Math.random() * 100),
      }
    }

    return result
  },

  hasFeatureAccess(featureId: string, userPlan: string): boolean {
    const feature = premiumFeatures.find((f) => f.id === featureId)
    if (!feature) return false

    switch (feature.requiredPlan) {
      case "free":
        return true
      case "premium":
        return userPlan === "premium" || userPlan === "pro"
      case "pro":
        return userPlan === "pro"
      default:
        return false
    }
  },
}
