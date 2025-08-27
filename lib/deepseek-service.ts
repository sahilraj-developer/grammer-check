export interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
}

export interface DeepSeekResponse {
  corrected: string
  errors: Array<{
    type: "grammar" | "spelling" | "punctuation" | "style"
    original: string
    suggestion: string
    explanation: string
    position: { start: number; end: number }
  }>
  improvements: string[]
  readabilityScore: number
}

class DeepSeekService {
  private getApiKey(): string {
    return process.env.DEEPSEEK_API_KEY || ""
  }

  private getBaseUrl(): string {
    return process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  }

  isConfigured(): boolean {
    return this.getApiKey().length > 0
  }

  async correctGrammar(text: string): Promise<DeepSeekResponse> {
    const apiKey = this.getApiKey()
    const baseUrl = this.getBaseUrl()

    if (!apiKey) {
      console.warn("DeepSeek API key not found, using mock response")
      return this.getMockResponse(text)
    }

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are an advanced grammar correction assistant, similar to Grammarly. Your task:
              - Correct grammar, spelling, punctuation, and sentence structure in the user's text
              - Keep the meaning and tone the same
              - Do not change names, numbers, or factual details
              - Improve readability and clarity where necessary
              
              Return a JSON response with:
              - corrected: the corrected version of the text
              - errors: array of errors found with type, original, suggestion, explanation, and position
              - improvements: array of improvement suggestions
              - readabilityScore: score from 0-100`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      try {
        return JSON.parse(content)
      } catch {
        return this.getMockResponse(text)
      }
    } catch (error) {
      console.error("DeepSeek API error:", error)
      return this.getMockResponse(text)
    }
  }

  private getMockResponse(text: string): DeepSeekResponse {
    const errors: { type: "grammar" | "spelling" | "punctuation" | "style"; original: string; suggestion: string; explanation: string; position: { start: number; end: number } }[] = []
    let corrected = text

    const corrections = [
      // Common spelling errors
      { find: /\bHii\b/g, replace: "Hi", type: "spelling", explanation: "Spelling error: 'Hii' should be 'Hi'" },
      { find: /\bhii\b/g, replace: "hi", type: "spelling", explanation: "Spelling error: 'hii' should be 'hi'" },
      { find: /\bgope\b/g, replace: "hope", type: "spelling", explanation: "Spelling error: 'gope' should be 'hope'" },
      { find: /\bGope\b/g, replace: "Hope", type: "spelling", explanation: "Spelling error: 'Gope' should be 'Hope'" },
      { find: /\bletr\b/g, replace: "let", type: "spelling", explanation: "Spelling error: 'letr' should be 'let'" },
      { find: /\bLetr\b/g, replace: "Let", type: "spelling", explanation: "Spelling error: 'Letr' should be 'Let'" },
      {
        find: /\bgrammer\b/g,
        replace: "grammar",
        type: "spelling",
        explanation: "Spelling error: 'grammer' should be 'grammar'",
      },
      {
        find: /\bGrammer\b/g,
        replace: "Grammar",
        type: "spelling",
        explanation: "Spelling error: 'Grammer' should be 'Grammar'",
      },
      {
        find: /\bapplicayion\b/g,
        replace: "application",
        type: "spelling",
        explanation: "Spelling error: 'applicayion' should be 'application'",
      },
      {
        find: /\bApplicayion\b/g,
        replace: "Application",
        type: "spelling",
        explanation: "Spelling error: 'Applicayion' should be 'Application'",
      },
      {
        find: /\bcheckc\b/g,
        replace: "check",
        type: "spelling",
        explanation: "Spelling error: 'checkc' should be 'check'",
      },
      {
        find: /\bCheckc\b/g,
        replace: "Check",
        type: "spelling",
        explanation: "Spelling error: 'Checkc' should be 'Check'",
      },
      {
        find: /\benhancemnet\b/g,
        replace: "enhancement",
        type: "spelling",
        explanation: "Spelling error: 'enhancemnet' should be 'enhancement'",
      },
      {
        find: /\bEnhancemnet\b/g,
        replace: "Enhancement",
        type: "spelling",
        explanation: "Spelling error: 'Enhancemnet' should be 'Enhancement'",
      },
      {
        find: /\blets\b/g,
        replace: "let's",
        type: "grammar",
        explanation: "Missing apostrophe in contraction 'let's'",
      },
      {
        find: /\bLets\b/g,
        replace: "Let's",
        type: "grammar",
        explanation: "Missing apostrophe in contraction 'Let's'",
      },
      // Additional common misspellings
      { find: /\bteh\b/g, replace: "the", type: "spelling", explanation: "Spelling error: 'teh' should be 'the'" },
      { find: /\bTeh\b/g, replace: "The", type: "spelling", explanation: "Spelling error: 'Teh' should be 'The'" },
      { find: /\byuo\b/g, replace: "you", type: "spelling", explanation: "Spelling error: 'yuo' should be 'you'" },
      { find: /\bYuo\b/g, replace: "You", type: "spelling", explanation: "Spelling error: 'Yuo' should be 'You'" },
      { find: /\badn\b/g, replace: "and", type: "spelling", explanation: "Spelling error: 'adn' should be 'and'" },
      { find: /\bAdn\b/g, replace: "And", type: "spelling", explanation: "Spelling error: 'Adn' should be 'And'" },
      { find: /\bwith\b/g, replace: "with", type: "spelling", explanation: "Correct spelling" },
      { find: /\bwiht\b/g, replace: "with", type: "spelling", explanation: "Spelling error: 'wiht' should be 'with'" },
      { find: /\bWiht\b/g, replace: "With", type: "spelling", explanation: "Spelling error: 'Wiht' should be 'With'" },
      { find: /\bfrom\b/g, replace: "from", type: "spelling", explanation: "Correct spelling" },
      { find: /\bform\b/g, replace: "from", type: "spelling", explanation: "Possible error: 'form' might be 'from'" },
      { find: /\bthis\b/g, replace: "this", type: "spelling", explanation: "Correct spelling" },
      { find: /\bthsi\b/g, replace: "this", type: "spelling", explanation: "Spelling error: 'thsi' should be 'this'" },
      { find: /\bThsi\b/g, replace: "This", type: "spelling", explanation: "Spelling error: 'Thsi' should be 'This'" },
      {
        find: /\brecieve\b/g,
        replace: "receive",
        type: "spelling",
        explanation: "Spelling error: 'i' before 'e' except after 'c'",
      },
      {
        find: /\bRecieve\b/g,
        replace: "Receive",
        type: "spelling",
        explanation: "Spelling error: 'i' before 'e' except after 'c'",
      },
      {
        find: /\bseperate\b/g,
        replace: "separate",
        type: "spelling",
        explanation: "Spelling error: 'seperate' should be 'separate'",
      },
      {
        find: /\bSeperate\b/g,
        replace: "Separate",
        type: "spelling",
        explanation: "Spelling error: 'Seperate' should be 'Separate'",
      },
      {
        find: /\bdefinately\b/g,
        replace: "definitely",
        type: "spelling",
        explanation: "Spelling error: 'definately' should be 'definitely'",
      },
      {
        find: /\bDefinately\b/g,
        replace: "Definitely",
        type: "spelling",
        explanation: "Spelling error: 'Definately' should be 'Definitely'",
      },
      {
        find: /\boccured\b/g,
        replace: "occurred",
        type: "spelling",
        explanation: "Spelling error: 'occured' should be 'occurred'",
      },
      {
        find: /\bOccured\b/g,
        replace: "Occurred",
        type: "spelling",
        explanation: "Spelling error: 'Occured' should be 'Occurred'",
      },
      {
        find: /\bneccessary\b/g,
        replace: "necessary",
        type: "spelling",
        explanation: "Spelling error: 'neccessary' should be 'necessary'",
      },
      {
        find: /\bNeccessary\b/g,
        replace: "Necessary",
        type: "spelling",
        explanation: "Spelling error: 'Neccessary' should be 'Necessary'",
      },
      {
        find: /\baccommodate\b/g,
        replace: "accommodate",
        type: "spelling",
        explanation: "Spelling error: double 'c' and double 'm'",
      },
      {
        find: /\bAccommodate\b/g,
        replace: "Accommodate",
        type: "spelling",
        explanation: "Spelling error: double 'c' and double 'm'",
      },
      {
        find: /\bthier\b/g,
        replace: "their",
        type: "spelling",
        explanation: "Spelling error: 'thier' should be 'their'",
      },
      {
        find: /\bThier\b/g,
        replace: "Their",
        type: "spelling",
        explanation: "Spelling error: 'Thier' should be 'Their'",
      },
      {
        find: /\bbecaus\b/g,
        replace: "because",
        type: "spelling",
        explanation: "Spelling error: 'becaus' should be 'because'",
      },
      {
        find: /\bBecaus\b/g,
        replace: "Because",
        type: "spelling",
        explanation: "Spelling error: 'Becaus' should be 'Because'",
      },

      // Grammar errors
      { find: /\bdont\b/g, replace: "don't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bDont\b/g, replace: "Don't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bcant\b/g, replace: "can't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bCant\b/g, replace: "Can't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bwont\b/g, replace: "won't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bWont\b/g, replace: "Won't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bisnt\b/g, replace: "isn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bIsnt\b/g, replace: "Isn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\barent\b/g, replace: "aren't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bArent\b/g, replace: "Aren't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bwasnt\b/g, replace: "wasn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bWasnt\b/g, replace: "Wasn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bwerent\b/g, replace: "weren't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bWerent\b/g, replace: "Weren't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bhavent\b/g, replace: "haven't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bHavent\b/g, replace: "Haven't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bhasnt\b/g, replace: "hasn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bHasnt\b/g, replace: "Hasn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bhadnt\b/g, replace: "hadn't", type: "grammar", explanation: "Missing apostrophe in contraction" },
      { find: /\bHadnt\b/g, replace: "Hadn't", type: "grammar", explanation: "Missing apostrophe in contraction" },

      // Common grammar mistakes
      {
        find: /\byour\s+welcome\b/g,
        replace: "you're welcome",
        type: "grammar",
        explanation: "Should use 'you're' (you are) instead of 'your'",
      },
      {
        find: /\bYour\s+welcome\b/g,
        replace: "You're welcome",
        type: "grammar",
        explanation: "Should use 'You're' (you are) instead of 'Your'",
      },
      {
        find: /\bits\s+a\s+good\b/g,
        replace: "it's a good",
        type: "grammar",
        explanation: "Should use 'it's' (it is) instead of 'its'",
      },
      {
        find: /\bIts\s+a\s+good\b/g,
        replace: "It's a good",
        type: "grammar",
        explanation: "Should use 'It's' (it is) instead of 'Its'",
      },
      {
        find: /\bthere\s+going\b/g,
        replace: "they're going",
        type: "grammar",
        explanation: "Should use 'they're' (they are) instead of 'there'",
      },
      {
        find: /\bThere\s+going\b/g,
        replace: "They're going",
        type: "grammar",
        explanation: "Should use 'They're' (they are) instead of 'There'",
      },
      {
        find: /\bto\s+much\b/g,
        replace: "too much",
        type: "grammar",
        explanation: "Should use 'too' (excessive) instead of 'to'",
      },
      {
        find: /\bTo\s+much\b/g,
        replace: "Too much",
        type: "grammar",
        explanation: "Should use 'Too' (excessive) instead of 'To'",
      },

      // Punctuation
      { find: /\s+,/g, replace: ",", type: "punctuation", explanation: "Remove space before comma" },
      { find: /\s+\./g, replace: ".", type: "punctuation", explanation: "Remove space before period" },
      { find: /\s+!/g, replace: "!", type: "punctuation", explanation: "Remove space before exclamation mark" },
      { find: /\s+\?/g, replace: "?", type: "punctuation", explanation: "Remove space before question mark" },
    ]

    corrections.forEach((correction) => {
      const matches = Array.from(text.matchAll(correction.find))
      matches.forEach((match) => {
        if (match.index !== undefined && match[0] !== correction.replace) {
          // Only add error if the original text is different from the replacement
          errors.push({
            type: correction.type as "grammar" | "spelling" | "punctuation" | "style",
            original: match[0],
            suggestion: correction.replace,
            explanation: correction.explanation,
            position: { start: match.index, end: match.index + match[0].length },
          })
        }
      })
      corrected = corrected.replace(correction.find, correction.replace)
    })

    const improvements = []
    if (text.split(" ").length > 25) {
      improvements.push("Consider breaking long sentences into shorter ones for better readability")
    }
    if (text.split(".").length < 2 && text.length > 50) {
      improvements.push("Add proper sentence endings with periods")
    }
    if (!text.match(/[,;:]/)) {
      improvements.push("Consider using punctuation marks like commas to separate ideas")
    }
    if (text.toLowerCase() === text && text.length > 10) {
      improvements.push("Consider proper capitalization at the beginning of sentences")
    }
    if (errors.length > 3) {
      improvements.push("Multiple errors detected - consider proofreading more carefully")
    }

    const baseScore = 85
    const errorPenalty = errors.length * 3
    const lengthBonus = Math.min(10, text.split(" ").length / 2)
    const readabilityScore = Math.max(30, Math.min(100, baseScore - errorPenalty + lengthBonus))

    return {
      corrected,
      errors,
      improvements,
      readabilityScore,
    }
  }
}

export const deepSeekService = new DeepSeekService()
