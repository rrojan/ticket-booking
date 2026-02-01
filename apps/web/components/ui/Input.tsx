'use client'

import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string
  error?: string
  value: number
  onChange: (value: number) => void
}

export const Input = ({
  label,
  error,
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
  className,
  ...props
}: InputProps) => {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, Number(max))
    onChange(newValue)
    setInputValue(newValue.toString())
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, Number(min))
    onChange(newValue)
    setInputValue(newValue.toString())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    const numVal = parseInt(val, 10)
    if (!isNaN(numVal) && numVal >= Number(min) && numVal <= Number(max)) {
      onChange(numVal)
    }
  }

  const handleBlur = () => {
    const numVal = parseInt(inputValue, 10)
    if (isNaN(numVal) || numVal < Number(min)) {
      setInputValue(min.toString())
      onChange(Number(min))
    } else if (numVal > Number(max)) {
      setInputValue(max.toString())
      onChange(Number(max))
    }
  }

  return (
    <div className={cn('', className)}>
      {label && <label className="block text-sm font-medium text-text mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= Number(min)}
          className={cn(
            'w-10 h-10 rounded-md border-2 border-border bg-surface font-semibold text-lg',
            'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          −
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          min={min}
          max={max}
          className={cn(
            'w-20 h-10 text-center rounded-md border-2 border-border text-lg font-medium',
            'focus:border-primary focus:outline-none'
          )}
          {...props}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= Number(max)}
          className={cn(
            'w-10 h-10 rounded-md border-2 border-border bg-surface font-semibold text-lg',
            'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          +
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}
