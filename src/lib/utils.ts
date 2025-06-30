import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDateInMonthYear(date: Date | string | null | undefined, month: number, year: number): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getFullYear() === year && d.getMonth() === month
}