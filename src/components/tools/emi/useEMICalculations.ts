import { useState, useCallback } from 'react';
import { AmortizationItem, PrepaymentItem, LoanScenario, YearlyBreakdown, CashFlowItem } from './types';

export const useEMICalculations = () => {
  // Calculate EMI
  const calculateEMI = useCallback((principal: number, annualRate: number, months: number): number => {
    const r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  }, []);

  // Generate amortization schedule with prepayments and moratorium
  const generateAmortizationSchedule = useCallback((
    principal: number,
    annualRate: number,
    months: number,
    moratoriumMonths: number = 0,
    moratoriumType: 'none' | 'full' | 'interest-only' = 'none',
    prepayments: PrepaymentItem[] = []
  ): { schedule: AmortizationItem[]; totalInterest: number; effectiveTenure: number } => {
    const schedule: AmortizationItem[] = [];
    const r = annualRate / 12 / 100;
    let balance = principal;
    let totalInterest = 0;
    let month = 0;

    // Handle moratorium period
    if (moratoriumMonths > 0 && moratoriumType !== 'none') {
      for (let i = 1; i <= moratoriumMonths; i++) {
        month++;
        const interestPayment = balance * r;
        
        if (moratoriumType === 'full') {
          // Full moratorium - interest is added to principal
          balance += interestPayment;
          schedule.push({
            month,
            beginningBalance: balance - interestPayment,
            emi: 0,
            principal: 0,
            interest: 0,
            endingBalance: balance
          });
        } else {
          // Interest-only moratorium
          totalInterest += interestPayment;
          schedule.push({
            month,
            beginningBalance: balance,
            emi: interestPayment,
            principal: 0,
            interest: interestPayment,
            endingBalance: balance
          });
        }
      }
    }

    // Calculate EMI for remaining period
    const remainingMonths = months;
    const emi = calculateEMI(balance, annualRate, remainingMonths);

    // Regular EMI period
    const prepaymentMap = new Map(prepayments.map(p => [p.month, p.amount]));
    
    while (balance > 0.01 && month < months + moratoriumMonths + 120) { // Safety limit
      month++;
      const beginningBalance = balance;
      const interestPayment = balance * r;
      let principalPayment = emi - interestPayment;
      
      // Apply prepayment if any
      const prepayment = prepaymentMap.get(month) || 0;
      principalPayment += prepayment;
      
      // Ensure we don't overpay
      principalPayment = Math.min(principalPayment, balance);
      balance = Math.max(0, balance - principalPayment);
      totalInterest += interestPayment;

      schedule.push({
        month,
        beginningBalance: parseFloat(beginningBalance.toFixed(2)),
        emi: parseFloat((emi + prepayment).toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        endingBalance: parseFloat(balance.toFixed(2))
      });

      if (balance <= 0.01) break;
    }

    return {
      schedule,
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      effectiveTenure: month
    };
  }, [calculateEMI]);

  // Calculate yearly breakdown
  const calculateYearlyBreakdown = useCallback((schedule: AmortizationItem[]): YearlyBreakdown[] => {
    const yearlyData: YearlyBreakdown[] = [];
    const years = Math.ceil(schedule.length / 12);

    for (let year = 1; year <= years; year++) {
      const yearStart = (year - 1) * 12;
      const yearEnd = Math.min(year * 12, schedule.length);
      const yearData = schedule.slice(yearStart, yearEnd);

      const principalPaid = yearData.reduce((sum, item) => sum + item.principal, 0);
      const interestPaid = yearData.reduce((sum, item) => sum + item.interest, 0);
      const cumulativeInterest = schedule.slice(0, yearEnd).reduce((sum, item) => sum + item.interest, 0);
      const endingBalance = yearData[yearData.length - 1]?.endingBalance || 0;

      yearlyData.push({
        year,
        principalPaid: parseFloat(principalPaid.toFixed(2)),
        interestPaid: parseFloat(interestPaid.toFixed(2)),
        totalPaid: parseFloat((principalPaid + interestPaid).toFixed(2)),
        cumulativeInterest: parseFloat(cumulativeInterest.toFixed(2)),
        endingBalance: parseFloat(endingBalance.toFixed(2))
      });
    }

    return yearlyData;
  }, []);

  // Calculate prepayment impact
  const calculatePrepaymentImpact = useCallback((
    principal: number,
    annualRate: number,
    months: number,
    prepaymentMonth: number,
    prepaymentAmount: number
  ) => {
    // Without prepayment
    const withoutPrepay = generateAmortizationSchedule(principal, annualRate, months);
    
    // With prepayment
    const withPrepay = generateAmortizationSchedule(
      principal, annualRate, months, 0, 'none',
      [{ month: prepaymentMonth, amount: prepaymentAmount }]
    );

    const interestSaved = withoutPrepay.totalInterest - withPrepay.totalInterest;
    const tenureReduction = withoutPrepay.effectiveTenure - withPrepay.effectiveTenure;

    return {
      interestSaved: parseFloat(interestSaved.toFixed(2)),
      tenureReduction,
      originalTotalInterest: withoutPrepay.totalInterest,
      newTotalInterest: withPrepay.totalInterest,
      originalTenure: withoutPrepay.effectiveTenure,
      newTenure: withPrepay.effectiveTenure
    };
  }, [generateAmortizationSchedule]);

  // Calculate cash flow
  const calculateCashFlow = useCallback((
    schedule: AmortizationItem[],
    viewType: 'monthly' | 'yearly'
  ): CashFlowItem[] => {
    if (viewType === 'monthly') {
      let cumulative = 0;
      return schedule.map(item => {
        cumulative -= item.emi;
        return {
          period: item.month,
          type: 'monthly',
          inflow: 0,
          outflow: item.emi,
          netFlow: -item.emi,
          cumulativeFlow: parseFloat(cumulative.toFixed(2))
        };
      });
    }

    // Yearly view
    const yearly: CashFlowItem[] = [];
    const years = Math.ceil(schedule.length / 12);
    let cumulative = 0;

    for (let year = 1; year <= years; year++) {
      const yearStart = (year - 1) * 12;
      const yearEnd = Math.min(year * 12, schedule.length);
      const yearData = schedule.slice(yearStart, yearEnd);
      const totalOutflow = yearData.reduce((sum, item) => sum + item.emi, 0);
      cumulative -= totalOutflow;

      yearly.push({
        period: year,
        type: 'yearly',
        inflow: 0,
        outflow: parseFloat(totalOutflow.toFixed(2)),
        netFlow: parseFloat((-totalOutflow).toFixed(2)),
        cumulativeFlow: parseFloat(cumulative.toFixed(2))
      });
    }

    return yearly;
  }, []);

  // Calculate IRR/XIRR (simplified IRR for regular payments)
  const calculateIRR = useCallback((
    principal: number,
    schedule: AmortizationItem[],
    processingFee: number = 0,
    otherCharges: number = 0
  ): number => {
    // Net loan amount received
    const netLoanAmount = principal - processingFee - otherCharges;
    
    // Total payments made
    const totalPayments = schedule.reduce((sum, item) => sum + item.emi, 0);
    
    // Simple effective rate calculation using Newton-Raphson approximation
    let rate = 0.01; // Initial guess (1% monthly)
    const months = schedule.length;
    
    for (let i = 0; i < 100; i++) {
      let npv = -netLoanAmount;
      let dnpv = 0;
      
      schedule.forEach((item, idx) => {
        const t = idx + 1;
        npv += item.emi / Math.pow(1 + rate, t);
        dnpv -= t * item.emi / Math.pow(1 + rate, t + 1);
      });
      
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 0.0000001) {
        rate = newRate;
        break;
      }
      rate = newRate;
    }
    
    // Convert monthly rate to annual
    const annualRate = (Math.pow(1 + rate, 12) - 1) * 100;
    return parseFloat(annualRate.toFixed(2));
  }, []);

  return {
    calculateEMI,
    generateAmortizationSchedule,
    calculateYearlyBreakdown,
    calculatePrepaymentImpact,
    calculateCashFlow,
    calculateIRR
  };
};
