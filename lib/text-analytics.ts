export interface TextStatistics {
  wordCount: number
  characterCount: number
  characterCountNoSpaces: number
  sentenceCount: number
  paragraphCount: number
  averageWordsPerSentence: number
  readingTime: number // in minutes
  difficulty: "Easy" | "Medium" | "Hard"
  fleschScore: number
}

export interface WritingGoal {
  id: string
  type: "wordCount" | "readingTime" | "sentences"
  target: number
  current: number
  completed: boolean
}

export class TextAnalytics {
  static calculateStatistics(text: string): TextStatistics {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

    const wordCount = words.length
    const characterCount = text.length
    const characterCountNoSpaces = text.replace(/\s/g, "").length
    const sentenceCount = sentences.length
    const paragraphCount = Math.max(paragraphs.length, 1)
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const readingTime = Math.ceil(wordCount / 200) // 200 words per minute average

    // Simplified Flesch Reading Ease Score
    const avgSentenceLength = averageWordsPerSentence
    const avgSyllables = this.estimateAverageSyllables(words)
    const fleschScore = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllables))

    let difficulty: "Easy" | "Medium" | "Hard"
    if (fleschScore >= 60) difficulty = "Easy"
    else if (fleschScore >= 30) difficulty = "Medium"
    else difficulty = "Hard"

    return {
      wordCount,
      characterCount,
      characterCountNoSpaces,
      sentenceCount,
      paragraphCount,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      readingTime,
      difficulty,
      fleschScore: Math.round(fleschScore),
    }
  }

  private static estimateAverageSyllables(words: string[]): number {
    if (words.length === 0) return 0

    const totalSyllables = words.reduce((total, word) => {
      return total + this.countSyllables(word.toLowerCase())
    }, 0)

    return totalSyllables / words.length
  }

  private static countSyllables(word: string): number {
    word = word.replace(/[^a-z]/g, "")
    if (word.length === 0) return 0
    if (word.length <= 3) return 1

    const vowels = "aeiouy"
    let syllables = 0
    let previousWasVowel = false

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        syllables++
      }
      previousWasVowel = isVowel
    }

    // Handle silent e
    if (word.endsWith("e") && syllables > 1) {
      syllables--
    }

    return Math.max(1, syllables)
  }

  static createWritingGoal(type: WritingGoal["type"], target: number): WritingGoal {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      target,
      current: 0,
      completed: false,
    }
  }

  static updateGoalProgress(goal: WritingGoal, stats: TextStatistics): WritingGoal {
    let current = 0
    switch (goal.type) {
      case "wordCount":
        current = stats.wordCount
        break
      case "readingTime":
        current = stats.readingTime
        break
      case "sentences":
        current = stats.sentenceCount
        break
    }

    return {
      ...goal,
      current,
      completed: current >= goal.target,
    }
  }
}
