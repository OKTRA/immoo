
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PaymentFrequency } from "@/services/payment/types"
import { addDays, addMonths, addWeeks, addYears, format, isBefore, isAfter, startOfMonth, endOfMonth, getDaysInMonth, setDate } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'FCFA') {
  const safeAmount = Number(amount ?? 0);
  return `${safeAmount.toLocaleString()} ${currency}`;
}

export function generateUniqueId(prefix: string = ''): string {
  // Generate a timestamp-based unique ID
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
}

/**
 * Calculate the end date of a period based on frequency and start date
 */
export function calculatePeriodEndDate(startDate: Date, frequency: PaymentFrequency): Date {
  const { periodUnit, periodAmount } = frequency;
  
  switch (periodUnit) {
    case 'days':
      return addDays(startDate, periodAmount);
    case 'weeks':
      return addWeeks(startDate, periodAmount);
    case 'months':
      // For monthly payments, we calculate the actual end of the month
      if (periodUnit === 'months' && periodAmount === 1) {
        return endOfMonth(startDate);
      }
      return addMonths(startDate, periodAmount);
    case 'years':
      return addYears(startDate, periodAmount);
    default:
      return addMonths(startDate, 1); // Default to monthly
  }
}

/**
 * Calculate the next due date based on frequency, payment start date, and current date
 */
export function calculateNextDueDate(
  paymentStartDate: string | Date,
  frequencyValue: string,
  paymentDay?: number | null,
  referenceDate: Date = new Date()
): Date {
  // Convert string dates to Date objects
  const startDate = typeof paymentStartDate === 'string' ? new Date(paymentStartDate) : new Date(paymentStartDate);
  
  // Get the payment frequency details
  const paymentFrequency = getPaymentFrequency(frequencyValue);
  
  // Initialize the due date as a copy of the start date to avoid modifying the original
  let dueDate = new Date(startDate.getTime());
  
  if (paymentFrequency.periodUnit === 'months') {
    // For monthly, quarterly, biannually, and annual (all use months internally)
    
    // If payment day is specified, use it; otherwise, use the day from the start date
    const targetDay = paymentDay || startDate.getDate();
    
    // If the reference date is after or equal to the start date, calculate the next due date
    if (isAfter(referenceDate, startDate) || referenceDate.getTime() === startDate.getTime()) {
      // Calculate how many months have passed since the start date
      const monthsSinceStart = 
        (referenceDate.getFullYear() - startDate.getFullYear()) * 12 + 
        (referenceDate.getMonth() - startDate.getMonth());
      
      // Calculate how many payment periods have passed
      const periodsPassed = Math.floor(monthsSinceStart / paymentFrequency.periodAmount);
      
      // Calculate the next period
      const nextPeriod = periodsPassed + 1;
      
      // Calculate the next due date by adding the appropriate number of months to the start date
      dueDate = addMonths(startDate, nextPeriod * paymentFrequency.periodAmount);
      
      // Adjust to the specified payment day, accounting for months with fewer days
      const daysInMonth = getDaysInMonth(dueDate);
      dueDate.setDate(Math.min(targetDay, daysInMonth));
    } else {
      // If we're before the start date, the first due date is the start date
      // But we should still adjust for the payment day if specified
      if (paymentDay) {
        const daysInMonth = getDaysInMonth(dueDate);
        dueDate.setDate(Math.min(targetDay, daysInMonth));
      }
    }
    
    return dueDate;
  } else if (paymentFrequency.periodUnit === 'days') {
    // For daily payments
    if (isAfter(referenceDate, startDate) || referenceDate.getTime() === startDate.getTime()) {
      const daysSinceStart = Math.floor((referenceDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      const periodsPassed = Math.floor(daysSinceStart / paymentFrequency.periodAmount);
      const nextPeriod = periodsPassed + 1;
      return addDays(startDate, nextPeriod * paymentFrequency.periodAmount);
    }
    return dueDate;
  } else if (paymentFrequency.periodUnit === 'weeks') {
    // For weekly or biweekly payments
    if (isAfter(referenceDate, startDate) || referenceDate.getTime() === startDate.getTime()) {
      const weeksSinceStart = Math.floor((referenceDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const periodsPassed = Math.floor(weeksSinceStart / paymentFrequency.periodAmount);
      const nextPeriod = periodsPassed + 1;
      return addWeeks(startDate, nextPeriod * paymentFrequency.periodAmount);
    }
    return dueDate;
  } else if (paymentFrequency.periodUnit === 'years') {
    // For yearly payments
    if (isAfter(referenceDate, startDate) || referenceDate.getTime() === startDate.getTime()) {
      const yearsSinceStart = referenceDate.getFullYear() - startDate.getFullYear();
      const periodsPassed = Math.floor(yearsSinceStart / paymentFrequency.periodAmount);
      const nextPeriod = periodsPassed + 1;
      
      // Add the years
      dueDate = addYears(startDate, nextPeriod * paymentFrequency.periodAmount);
      
      // If payment day is specified, adjust the day accordingly
      if (paymentDay) {
        const daysInMonth = getDaysInMonth(dueDate);
        dueDate.setDate(Math.min(paymentDay, daysInMonth));
      }
      
      return dueDate;
    }
    return dueDate;
  }
  
  // Default case - return the calculated end date of the current period
  return calculatePeriodEndDate(referenceDate, paymentFrequency);
}

/**
 * Determine payment status based on due date, payment date, and grace period
 */
export function determinePaymentStatus(
  dueDate: string | Date | null,
  paymentDate: string | Date | null,
  gracePeriodDays: number = 5, // Grace period in days
  referenceDate: Date = new Date()
): 'paid' | 'pending' | 'late' | 'advanced' | 'cancelled' | 'undefined' {
  if (!dueDate) return 'undefined';
  
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const graceDate = addDays(dueDateObj, gracePeriodDays);
  
  // If payment date exists, it's been paid
  if (paymentDate) {
    const paymentDateObj = typeof paymentDate === 'string' ? new Date(paymentDate) : paymentDate;
    
    // Check if payment was made before due date
    if (isBefore(paymentDateObj, dueDateObj)) {
      return 'advanced'; // Paid in advance
    }
    
    return 'paid'; // Regular payment
  }
  
  // No payment yet - check if we're past the grace period
  if (isAfter(referenceDate, graceDate)) {
    return 'late'; // Past due and grace period
  }
  
  // No payment but still within grace period
  return 'pending';
}

/**
 * Get payment frequency object from string value
 */
export function getPaymentFrequency(value: string): PaymentFrequency {
  const PAYMENT_FREQUENCIES: PaymentFrequency[] = [
    { value: 'daily', label: 'Quotidien', daysInterval: 1, periodUnit: 'days', periodAmount: 1 },
    { value: 'weekly', label: 'Hebdomadaire', daysInterval: 7, periodUnit: 'weeks', periodAmount: 1 },
    { value: 'biweekly', label: 'Bi-hebdomadaire', daysInterval: 14, periodUnit: 'weeks', periodAmount: 2 },
    { value: 'monthly', label: 'Mensuel', daysInterval: 30, periodUnit: 'months', periodAmount: 1 },
    { value: 'quarterly', label: 'Trimestriel', daysInterval: 90, periodUnit: 'months', periodAmount: 3 },
    { value: 'biannually', label: 'Semestriel', daysInterval: 180, periodUnit: 'months', periodAmount: 6 },
    { value: 'annually', label: 'Annuel', daysInterval: 365, periodUnit: 'years', periodAmount: 1 },
  ];
  
  return PAYMENT_FREQUENCIES.find(f => f.value === value) || PAYMENT_FREQUENCIES[3]; // default to monthly
}

/**
 * Get translated status label
 */
export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return 'Payé';
    case 'pending':
      return 'En cours';
    case 'late':
      return 'Retard';
    case 'advanced':
      return 'Payé en avance';
    case 'cancelled':
      return 'Annulé';
    case 'undefined':
    default:
      return 'À définir';
  }
}
