export interface GrammarError {
  id: string
  type: "error" | "warning" | "suggestion"
  message: string
  original: string
  suggestion: string
  startIndex: number
  endIndex: number
  category: "grammar" | "spelling" | "punctuation" | "style" | "clarity"
}

export interface GrammarResult {
  corrected: string
  errors: GrammarError[]
  stats: {
    errors: number
    improvements: number
    readabilityScore: number
    wordCount: number
  }
}

// Mock DeepSeek API service
export const grammarService = {
  async checkGrammar(text: string): Promise<GrammarResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const errors: GrammarError[] = []
    let corrected = text
    let errorCount = 0
    let improvementCount = 0

    // Common grammar patterns to detect
    const patterns = [
      {
        regex: /\bdont\b/gi,
        replacement: "don't",
        type: "error" as const,
        category: "grammar" as const,
        message: "Missing apostrophe in contraction",
      },
      {
        regex: /\bcant\b/gi,
        replacement: "can't",
        type: "error" as const,
        category: "grammar" as const,
        message: "Missing apostrophe in contraction",
      },
      {
        regex: /\bwont\b/gi,
        replacement: "won't",
        type: "error" as const,
        category: "grammar" as const,
        message: "Missing apostrophe in contraction",
      },
      {
        regex: /\bbecaus\b/gi,
        replacement: "because",
        type: "error" as const,
        category: "spelling" as const,
        message: "Spelling error",
      },
      {
        regex: /\brecieve\b/gi,
        replacement: "receive",
        type: "error" as const,
        category: "spelling" as const,
        message: "Common spelling mistake: 'i' before 'e' except after 'c'",
      },
      {
        regex: /\btheir\s+is\b/gi,
        replacement: "there is",
        type: "error" as const,
        category: "grammar" as const,
        message: "Incorrect use of 'their' instead of 'there'",
      },
      {
        regex: /\byour\s+(going|coming|running)\b/gi,
        replacement: (match: string) => match.replace("your", "you're"),
        type: "error" as const,
        category: "grammar" as const,
        message: "Use 'you're' (you are) instead of 'your' (possessive)",
      },
      {
        regex: /\bits\s+(going|coming|running)\b/gi,
        replacement: (match: string) => match.replace("its", "it's"),
        type: "error" as const,
        category: "grammar" as const,
        message: "Use 'it's' (it is) instead of 'its' (possessive)",
      },
      {
        regex: /\b(he|she|it)\s+(think|like|want|need|have)\b/gi,
        replacement: (match: string) => {
          const parts = match.split(" ")
          const verb = parts[1]
          let correctedVerb = verb
          if (verb.endsWith("e")) {
            correctedVerb = verb + "s"
          } else if (verb === "have") {
            correctedVerb = "has"
          } else {
            correctedVerb = verb + "s"
          }
          return `${parts[0]} ${correctedVerb}`
        },
        type: "error" as const,
        category: "grammar" as const,
        message: "Subject-verb disagreement: third person singular requires 's'",
      },
      {
        regex: /\b(very|really|quite)\s+(good|bad|nice|great)\b/gi,
        replacement: (match: string) => {
          const adjective = match.split(" ")[1].toLowerCase()
          const betterWords: Record<string, string> = {
            good: "excellent",
            bad: "terrible",
            nice: "wonderful",
            great: "outstanding",
          }
          return betterWords[adjective] || match
        },
        type: "suggestion" as const,
        category: "style" as const,
        message: "Consider using a stronger adjective instead of intensifier + basic adjective",
      },
      {
        regex: /\bthat\s+that\b/gi,
        replacement: "that",
        type: "warning" as const,
        category: "style" as const,
        message: "Redundant word repetition",
      },
      {
        regex: /\bin\s+order\s+to\b/gi,
        replacement: "to",
        type: "suggestion" as const,
        category: "clarity" as const,
        message: "Simplify: 'to' is more concise than 'in order to'",
      },
    ]

    // Find and fix errors
    patterns.forEach((pattern) => {
      let match
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags)

      while ((match = regex.exec(text)) !== null) {
        const original = match[0]
        const suggestion =
          typeof pattern.replacement === "function" ? pattern.replacement(original) : pattern.replacement

        if (original.toLowerCase() !== suggestion.toLowerCase()) {
          errors.push({
            id: `error-${errors.length}`,
            type: pattern.type,
            message: pattern.message,
            original,
            suggestion,
            startIndex: match.index,
            endIndex: match.index + original.length,
            category: pattern.category,
          })

          if (pattern.type === "error") errorCount++
          else improvementCount++

          // Apply correction to the text
          corrected = corrected.replace(original, suggestion)
        }

        // Reset regex to avoid infinite loop
        regex.lastIndex = 0
      }
    })

    // Calculate readability score (simplified)
    const words = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).length
    const avgWordsPerSentence = words / Math.max(sentences, 1)
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2))

    return {
      corrected,
      errors,
      stats: {
        errors: errorCount,
        improvements: improvementCount,
        readabilityScore: Math.round(readabilityScore),
        wordCount: words,
      },
    }
  },
}
