import React, { useState, useEffect } from 'react'
import { Input } from './input'

interface CurrencyInputProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "Masukkan harga",
  className = "",
  required = false,
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState('')

  // Format number to Rupiah display
  const formatToRupiah = (num: number | string): string => {
    if (!num || num === '') return ''
    const numericValue = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(numericValue)) return ''
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue)
  }

  // Sanitize Rupiah string to number
  const sanitizeToNumber = (rupiahString: string): number => {
    if (!rupiahString) return 0
    // Remove all non-numeric characters except decimal point
    const cleanString = rupiahString.replace(/[^\d]/g, '')
    return parseFloat(cleanString) || 0
  }

  // Initialize display value when component mounts or value changes
  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      const numericValue = typeof value === 'string' ? parseFloat(value) : value
      if (!isNaN(numericValue)) {
        setDisplayValue(formatToRupiah(numericValue))
      }
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // If input is empty, clear everything
    if (!inputValue) {
      setDisplayValue('')
      onChange(0)
      return
    }

    // Remove all non-numeric characters except decimal point
    const cleanValue = inputValue.replace(/[^\d]/g, '')
    
    if (cleanValue === '') {
      setDisplayValue('')
      onChange(0)
      return
    }

    const numericValue = parseFloat(cleanValue)
    
    if (!isNaN(numericValue)) {
      setDisplayValue(formatToRupiah(numericValue))
      onChange(numericValue)
    }
  }

  const handleBlur = () => {
    // Ensure the value is properly formatted on blur
    const numericValue = sanitizeToNumber(displayValue)
    setDisplayValue(formatToRupiah(numericValue))
    onChange(numericValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focused for easy editing
    e.target.select()
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
      required={required}
      disabled={disabled}
    />
  )
}
