export interface AmortizationItem {
  month: number;
  beginningBalance: number;
  emi: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

export interface PrepaymentItem {
  month: number;
  amount: number;
}

export interface LoanScenario {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  loanTerm: number;
  moratoriumMonths: number;
  moratoriumType: 'none' | 'full' | 'interest-only';
  prepayments: PrepaymentItem[];
  emi: number;
  totalInterest: number;
  totalPayment: number;
  effectiveTenure: number;
  amortizationSchedule: AmortizationItem[];
}

export interface YearlyBreakdown {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  cumulativeInterest: number;
  endingBalance: number;
}

export interface CashFlowItem {
  period: number;
  type: 'monthly' | 'yearly';
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

// Financial Model Types
export interface BalanceSheetItem {
  year: number;
  openingLoanBalance: number;
  principalRepaid: number;
  closingLoanBalance: number;
  interestExpense: number;
  taxShield: number;
}

export interface PLImpactItem {
  year: number;
  interestExpense: number;
  taxShield: number;
  netInterestCost: number;
  emiOutflow: number;
}

export interface DebtScheduleItem {
  year: number;
  openingBalance: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  closingBalance: number;
}

export interface DSCRCalculation {
  netOperatingIncome: number;
  totalDebtService: number;
  dscr: number;
  interestCoverageRatio: number;
  status: 'healthy' | 'adequate' | 'risky' | 'critical';
}

export interface FinancialModelData {
  balanceSheet: BalanceSheetItem[];
  plImpact: PLImpactItem[];
  debtSchedule: DebtScheduleItem[];
  dscr?: DSCRCalculation;
}
