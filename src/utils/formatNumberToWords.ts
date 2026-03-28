
/**
 * Format a number to Indian system words (lakhs, crores)
 */
export const formatNumberToIndianWords = (num: number): string => {
  // Handle zero case
  if (num === 0) return "Zero";
  
  // Handle negative numbers
  const isNegative = num < 0;
  num = Math.abs(num);
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  // For numbers less than 100
  const lessThan100 = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  };
  
  // For lakhs and crores
  if (num >= 10000000) { // Crores
    const crore = Math.floor(num / 10000000);
    return (isNegative ? "Negative " : "") + 
           (crore > 99 ? formatNumberToIndianWords(crore) + " Crore" : lessThan100(crore) + " Crore") + 
           (num % 10000000 === 0 ? "" : " " + formatNumberToIndianWords(num % 10000000));
  } else if (num >= 100000) { // Lakhs
    const lakh = Math.floor(num / 100000);
    return (isNegative ? "Negative " : "") + 
           lessThan100(lakh) + " Lakh" + 
           (num % 100000 === 0 ? "" : " " + formatNumberToIndianWords(num % 100000));
  } else if (num >= 1000) { // Thousands
    const thousand = Math.floor(num / 1000);
    return (isNegative ? "Negative " : "") + 
           lessThan100(thousand) + " Thousand" + 
           (num % 1000 === 0 ? "" : " " + formatNumberToIndianWords(num % 1000));
  } else if (num >= 100) { // Hundreds
    return (isNegative ? "Negative " : "") + 
           ones[Math.floor(num / 100)] + " Hundred" + 
           (num % 100 === 0 ? "" : " " + lessThan100(num % 100));
  } else {
    return (isNegative ? "Negative " : "") + lessThan100(num);
  }
};

/**
 * Format a number with commas according to Indian numbering system
 */
export const formatIndianNumber = (num: number): string => {
  const parts = num.toString().split('.');
  const integerPart = parts[0];
  
  // Apply Indian numbering system (commas after 3 digits from right, then every 2 digits)
  let formattedInteger = '';
  const numStr = integerPart;
  
  if (numStr.length > 3) {
    const lastThree = numStr.substring(numStr.length - 3);
    const remaining = numStr.substring(0, numStr.length - 3);
    formattedInteger = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    formattedInteger = numStr;
  }
  
  return parts.length > 1 ? formattedInteger + '.' + parts[1] : formattedInteger;
};

/**
 * Format currency in Indian Rupees with words
 */
export const formatIndianRupees = (value: number, includeWords: boolean = true): string => {
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
  
  if (!includeWords) return formattedNumber;
  
  const words = formatNumberToIndianWords(value);
  return `${formattedNumber} (${words})`;
};
