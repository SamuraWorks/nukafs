export interface ValidationResult {
  valid: boolean
  message?: string
}

export function validateRequired(value: string, fieldLabel: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, message: `${fieldLabel} is required.` }
  }
  return { valid: true }
}

export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim()
  if (!trimmed) return { valid: false, message: "Email is required." }
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(trimmed)) {
    return { valid: false, message: "Enter a valid email address." }
  }
  return { valid: true }
}

export function validatePhone(value: string): ValidationResult {
  const trimmed = value.trim()
  if (!trimmed) return { valid: false, message: "Phone number is required." }
  const digits = trimmed.replace(/\D/g, "")
  if (digits.length < 8 || digits.length > 15) {
    return { valid: false, message: "Enter a valid phone number." }
  }
  return { valid: true }
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, message: "Password is required." }
  if (value.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." }
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return {
      valid: false,
      message: "Password must include letters and numbers.",
    }
  }
  return { valid: true }
}

export function validateLoginForm(
  emailOrPhone: string,
  password: string,
): ValidationResult {
  if (!emailOrPhone.trim()) {
    return { valid: false, message: "Email or phone number is required." }
  }
  if (!password) {
    return { valid: false, message: "Password is required." }
  }
  return { valid: true }
}

export function validateRegistrationForm(
  name: string,
  email: string,
  phone: string,
): ValidationResult {
  const nameCheck = validateRequired(name, "Full name")
  if (!nameCheck.valid) return nameCheck
  const emailCheck = validateEmail(email)
  if (!emailCheck.valid) return emailCheck
  return validatePhone(phone)
}
