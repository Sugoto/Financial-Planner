import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers according to Indian numbering system
export function formatIndianNumber(num: number): string {
  if (num < 0) {
    return "-" + formatIndianNumber(-num);
  }
  
  // Round to remove decimals and convert to integer
  const roundedNum = Math.round(num);
  const numStr = roundedNum.toString();
  
  if (numStr.length <= 3) {
    return numStr;
  }
  
  // For numbers with more than 3 digits
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  
  return lastThree;
}
