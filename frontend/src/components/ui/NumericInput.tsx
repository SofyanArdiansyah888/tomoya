import React, { useEffect, useRef, useState } from 'react'
import { Input, InputProps } from './input'
import {
  formatNumericDisplay,
  normalizeNumericInput,
  parseNumericText,
} from '../../lib/numericInput'

type NumericInputBaseProps = Omit<InputProps, 'type' | 'value' | 'onChange' | 'inputMode' | 'defaultValue'> & {
  allowDecimal?: boolean
  allowNegative?: boolean
  emptyWhenZero?: boolean
}

type NumericInputNumberProps = NumericInputBaseProps & {
  asString?: false
  value: number
  onChange: (value: number) => void
}

type NumericInputStringProps = NumericInputBaseProps & {
  asString: true
  value: string
  onChange: (value: string) => void
}

export type NumericInputProps = NumericInputNumberProps | NumericInputStringProps

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      asString = false,
      allowDecimal = false,
      allowNegative = false,
      emptyWhenZero = true,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [text, setText] = useState(() =>
      formatNumericDisplay(value, emptyWhenZero),
    )
    const prevValueRef = useRef(value)

    useEffect(() => {
      if (value !== prevValueRef.current) {
        prevValueRef.current = value
        setText(formatNumericDisplay(value, emptyWhenZero))
      }
    }, [value, emptyWhenZero])

    const emitChange = (nextText: string) => {
      if (asString) {
        ;(onChange as (value: string) => void)(nextText)
        return
      }
      const numeric = parseNumericText(nextText, { allowDecimal, allowNegative })
      ;(onChange as (value: number) => void)(numeric)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizeNumericInput(e.target.value, {
        allowDecimal,
        allowNegative,
      })
      if (normalized === null) return
      setText(normalized)
      emitChange(normalized)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseNumericText(text, { allowDecimal, allowNegative })
      const display = emptyWhenZero && parsed === 0
        ? ''
        : (allowDecimal ? String(parsed) : String(parsed))

      setText(display)
      if (asString) {
        ;(onChange as (value: string) => void)(display)
      } else {
        ;(onChange as (value: number) => void)(parsed)
      }
      onBlur?.(e)
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    )
  },
)

NumericInput.displayName = 'NumericInput'
