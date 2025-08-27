export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class TextValidator {
  private static readonly MAX_TEXT_LENGTH = 50000 // 50k characters
  private static readonly MIN_TEXT_LENGTH = 1
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  static validateText(text: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Length validation
    if (text.length < this.MIN_TEXT_LENGTH) {
      errors.push("Text cannot be empty")
    }

    if (text.length > this.MAX_TEXT_LENGTH) {
      errors.push(`Text is too long. Maximum ${this.MAX_TEXT_LENGTH.toLocaleString()} characters allowed.`)
    }

    // Content warnings
    if (text.length > 10000) {
      warnings.push("Large text may take longer to process")
    }

    // Check for suspicious content
    const suspiciousPatterns = [
      /(.)\1{20,}/g, // Repeated characters
      /\s{10,}/g, // Excessive whitespace
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        warnings.push("Text contains unusual patterns that may affect analysis quality")
        break
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static validateFile(file: File): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // File size validation
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File is too large. Maximum ${this.MAX_FILE_SIZE / (1024 * 1024)}MB allowed.`)
    }

    // File type validation
    const allowedTypes = ["text/plain", "application/rtf"]
    if (!allowedTypes.includes(file.type)) {
      errors.push("Only .txt and .rtf files are supported")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static sanitizeText(text: string): string {
    // Remove potentially harmful content while preserving formatting
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n")
      .trim()
  }
}
