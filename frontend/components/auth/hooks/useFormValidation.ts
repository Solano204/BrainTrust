// hooks/useFormValidation.ts
import { useState, useCallback } from 'react'
import { ZodSchema, ZodError } from 'zod'

interface ValidationErrors {
  [key: string]: string
}

interface UseFormValidationReturn<T> {
  values: T
  errors: ValidationErrors
  touched: Record<keyof T, boolean>
  isValid: boolean
  setFieldValue: (field: keyof T, value: any) => void
  setFieldTouched: (field: keyof T) => void
  validateField: (field: keyof T) => Promise<boolean>
  validateForm: () => Promise<boolean>
  resetForm: (newValues?: Partial<T>) => void
  clearErrors: () => void
  clearFieldError: (field: keyof T) => void
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  schema: ZodSchema<T>
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }, [])

  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    try {
      // Validate single field using schema
      const fieldSchema = schema.shape[field as string]
      if (fieldSchema) {
        await fieldSchema.parseAsync(values[field])
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field as string]
          return newErrors
        })
        return true
      }
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        setErrors(prev => ({
          ...prev,
          [field as string]: error.errors[0]?.message || 'Invalid value'
        }))
        return false
      }
      return false
    }
  }, [schema, values])

  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await schema.parseAsync(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: ValidationErrors = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
        return false
      }
      return false
    }
  }, [schema, values])

  const resetForm = useCallback((newValues?: Partial<T>) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }))
    setErrors({})
    setTouched({} as Record<keyof T, boolean>)
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field as string]
      return newErrors
    })
  }, [])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    clearErrors,
    clearFieldError
  }
}

// Example usage in component:
/*
const {
  values: personalInfo,
  errors: personalInfoErrors,
  touched,
  setFieldValue,
  setFieldTouched,
  validateField,
  validateForm,
  clearFieldError
} = useFormValidation(
  {
    firstName: "",
    lastName: "",
    gender: "OTHER",
    phone: "",
  },
  personalInfoSchema
)

// In input onChange:
onChange={(e) => {
  setFieldValue('firstName', e.target.value)
  clearFieldError('firstName')
}}

// In input onBlur:
onBlur={() => {
  setFieldTouched('firstName')
  validateField('firstName')
}}

// On form submit:
const handleSubmit = async () => {
  const isValid = await validateForm()
  if (isValid) {
    // Submit form
  }
}
*/