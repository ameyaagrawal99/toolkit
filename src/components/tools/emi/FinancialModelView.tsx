import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Building2, FileText, Calculator, IndianRupee } from "lucide-react";
import { formatIndianRupees, formatNumberToIndianWords } from "@/utils/formatNumberToWords";
import { YearlyBreakdown, BalanceSheetItem, PLImpactItem, DSCRCalculation } from './types';
import { DebtSchedule } from './DebtSchedule';

interface FinancialModelViewProps {
  principal: number;
  interestRate: number;
  loanTerm: number;
  emi: number;
  totalInterest: number;
  yearlyBreakdown: YearlyBreakdown[];
}

export const FinancialModelView: React.FC<FinancialModelViewProps> = ({
  principal,
  interestRate,
  loanTerm,
  emi,
  totalInterest,
  yearlyBreakdown
}) => {
  const [taxRate, setTaxRate] = useState('30');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [operatingExpenses, setOperatingExpenses] = useState('');

  // Calculate Balance Sheet data
  const balanceSheetData = useMemo((): BalanceSheetItem[] => {
    const taxRateDecimal = parseFloat(taxRate) / 100 || 0;
    
    return yearlyBreakdown.map((year, index) => {
      const openingBalance = index === 0 ? principal : yearlyBreakdown[index - 1].endingBalance;
      const taxShield = year.interestPaid * taxRateDecimal;
      
      return {
        year: year.year,
        openingLoanBalance: openingBalance,
        principalRepaid: year.principalPaid,
        closingLoanBalance: year.endingBalance,
        interestExpense: year.interestPaid,
        taxShield
      };
    });
  }, [yearlyBreakdown, principal, taxRate]);

  // Calculate P&L Impact
  const plImpactData = useMemo((): PLImpactItem[] => {
    const taxRateDecimal = parseFloat(taxRate) / 100 || 0;
    
    return yearlyBreakdown.map(year => {
      const taxShield = year.interestPaid * taxRateDecimal;
      
      return {
        year: year.year,
        interestExpense: year.interestPaid,
        taxShield,
        netInterestCost: year.interestPaid - taxShield,
        emiOutflow: year.totalPaid
      };
    });
  }, [yearlyBreakdown, taxRate]);

  // Calculate DSCR
  const dscrCalculation = useMemo((): DSCRCalculation | null => {
    const revenue = parseFloat(annualRevenue) || 0;
    const opex = parseFloat(operatingExpenses) || 0;
    const annualEMI = emi * 12;
    
    if (revenue <= 0 || annualEMI <= 0) return null;
    
    const netOperatingIncome = revenue - opex;
    const avgInterest = totalInterest / loanTerm;
    
    const dscr = netOperatingIncome / annualEMI;
    const interestCoverageRatio = netOperatingIncome / avgInterest;
    
    let status: DSCRCalculation['status'] = 'critical';
    if (dscr >= 1.5) status = 'healthy';
    else if (dscr >= 1.25) status = 'adequate';
    else if (dscr >= 1.0) status = 'risky';
    
    return {
      netOperatingIncome,
      totalDebtService: annualEMI,
      dscr,
      interestCoverageRatio,
      status
    };
  }, [annualRevenue, operatingExpenses, emi, totalInterest, loanTerm]);

  // Chart data for Balance Sheet visualization
  const balanceChartData = useMemo(() => {
    return balanceSheetData.map(item => ({
      year: `Year ${item.year}`,
      'Opening Balance': item.openingLoanBalance,
      'Principal Repaid': item.principalRepaid,
      'Closing Balance': item.closingLoanBalance
    }));
  }, [balanceSheetData]);

  // Total tax shield
  const totalTaxShield = useMemo(() => {
    return balanceSheetData.reduce((sum, item) => sum + item.taxShield, 0);
  }, [balanceSheetData]);

  const getDSCRStatusColor = (status: DSCRCalculation['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'adequate': return 'bg-yellow-500';
      case 'risky': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getDSCRStatusIcon = (status: DSCRCalculation['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'adequate': return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      case 'risky': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'critical': return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tax Rate Input */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Tax Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <div className="relative w-32">
                <Input
                  id="tax-rate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min="0"
                  max="50"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-end">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Tax Shield Benefit</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatIndianRupees(totalTaxShield, false)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs for Financial Model */}
      <Tabs defaultValue="balance-sheet" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto">
          <TabsTrigger value="balance-sheet" className="flex-1 min-w-[100px]">
            <Building2 className="h-4 w-4 mr-1" /> Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="pl-impact" className="flex-1 min-w-[100px]">
            <FileText className="h-4 w-4 mr-1" /> P&L Impact
          </TabsTrigger>
          <TabsTrigger value="debt-schedule" className="flex-1 min-w-[100px]">
            <IndianRupee className="h-4 w-4 mr-1" /> Debt Schedule
          </TabsTrigger>
          <TabsTrigger value="dscr" className="flex-1 min-w-[100px]">
            <TrendingUp className="h-4 w-4 mr-1" /> DSCR
          </TabsTrigger>
        </TabsList>

        {/* Balance Sheet Tab */}
        <TabsContent value="balance-sheet" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liability Movement (Loan Balance)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={balanceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value: any) => [formatIndianRupees(value, false), null]} />
                    <Legend />
                    <Bar dataKey="Opening Balance" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="Principal Repaid" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="Closing Balance" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Opening Loan (Liability)</TableHead>
                      <TableHead className="text-right">Principal Repaid</TableHead>
                      <TableHead className="text-right">Closing Loan (Liability)</TableHead>
                      <TableHead className="text-right">Interest Expense</TableHead>
                      <TableHead className="text-right">Tax Shield</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceSheetData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-medium">Year {row.year}</TableCell>
                        <TableCell className="text-right">{formatIndianRupees(row.openingLoanBalance, false)}</TableCell>
                        <TableCell className="text-right text-blue-600 dark:text-blue-400">
                          {formatIndianRupees(row.principalRepaid, false)}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatIndianRupees(row.closingLoanBalance, false)}</TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          {formatIndianRupees(row.interestExpense, false)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          {formatIndianRupees(row.taxShield, false)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L Impact Tab */}
        <TabsContent value="pl-impact" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profit & Loss Statement Impact</CardTitle>
              <p className="text-sm text-muted-foreground">
                Interest expense is a finance cost in P&L. Principal repayment affects only Balance Sheet.
              </p>
            </CardHeader>
            <CardContent>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Interest Expense (P&L)</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatIndianRupees(totalInterest, false)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Finance Costs in P&L</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Tax Shield Benefit</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatIndianRupees(totalTaxShield, false)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Interest is tax-deductible</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Net Interest Cost</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatIndianRupees(totalInterest - totalTaxShield, false)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">After tax benefit</p>
                </div>
              </div>

              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Interest Expense</TableHead>
                      <TableHead className="text-right">Tax Shield ({taxRate}%)</TableHead>
                      <TableHead className="text-right">Net Interest Cost</TableHead>
                      <TableHead className="text-right">Total EMI Outflow</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plImpactData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-medium">Year {row.year}</TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          {formatIndianRupees(row.interestExpense, false)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          {formatIndianRupees(row.taxShield, false)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatIndianRupees(row.netInterestCost, false)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatIndianRupees(row.emiOutflow, false)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debt Schedule Tab */}
        <TabsContent value="debt-schedule" className="mt-4">
          <DebtSchedule
            yearlyBreakdown={yearlyBreakdown}
            principal={principal}
            emi={emi}
            totalInterest={totalInterest}
          />
        </TabsContent>

        {/* DSCR Calculator Tab */}
        <TabsContent value="dscr" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Debt Service Coverage Ratio (DSCR) Calculator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your projected revenue and expenses to calculate loan affordability
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="annual-revenue">Annual Revenue/Income (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="annual-revenue"
                      type="number"
                      value={annualRevenue}
                      onChange={(e) => setAnnualRevenue(e.target.value)}
                      className="pl-8"
                      placeholder="Enter annual revenue"
                    />
                  </div>
                  {parseFloat(annualRevenue) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatNumberToIndianWords(parseFloat(annualRevenue))}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operating-expenses">Operating Expenses (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="operating-expenses"
                      type="number"
                      value={operatingExpenses}
                      onChange={(e) => setOperatingExpenses(e.target.value)}
                      className="pl-8"
                      placeholder="Excluding EMI"
                    />
                  </div>
                  {parseFloat(operatingExpenses) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatNumberToIndianWords(parseFloat(operatingExpenses))}
                    </p>
                  )}
                </div>
              </div>

              {dscrCalculation ? (
                <div className="space-y-6">
                  {/* DSCR Result */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-lg border-2 border-dashed">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">DSCR</p>
                          <p className="text-4xl font-bold">{dscrCalculation.dscr.toFixed(2)}x</p>
                        </div>
                        {getDSCRStatusIcon(dscrCalculation.status)}
                      </div>
                      <Badge className={`${getDSCRStatusColor(dscrCalculation.status)} text-white`}>
                        {dscrCalculation.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {dscrCalculation.status === 'healthy' && 'Excellent! Your income comfortably covers debt.'}
                        {dscrCalculation.status === 'adequate' && 'Good. You have reasonable margin for debt service.'}
                        {dscrCalculation.status === 'risky' && 'Caution: Thin margin for debt service.'}
                        {dscrCalculation.status === 'critical' && 'Warning: Income may not cover debt payments.'}
                      </p>
                    </div>

                    <div className="p-6 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Interest Coverage Ratio</p>
                      <p className="text-3xl font-bold">{dscrCalculation.interestCoverageRatio.toFixed(2)}x</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        How many times your NOI covers the annual interest
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Net Operating Income</p>
                      <p className="text-xl font-bold">{formatIndianRupees(dscrCalculation.netOperatingIncome, false)}</p>
                      <p className="text-xs text-muted-foreground">Revenue - Operating Expenses</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Annual Debt Service</p>
                      <p className="text-xl font-bold">{formatIndianRupees(dscrCalculation.totalDebtService, false)}</p>
                      <p className="text-xs text-muted-foreground">EMI × 12 months</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Surplus/Deficit</p>
                      <p className={`text-xl font-bold ${dscrCalculation.netOperatingIncome - dscrCalculation.totalDebtService >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatIndianRupees(dscrCalculation.netOperatingIncome - dscrCalculation.totalDebtService, false)}
                      </p>
                      <p className="text-xs text-muted-foreground">After debt service</p>
                    </div>
                  </div>

                  {/* Visual Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Debt Service Coverage</span>
                      <span>{Math.min(dscrCalculation.dscr * 100 / 2, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(dscrCalculation.dscr * 100 / 2, 100)} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Critical (&lt;1x)</span>
                      <span>Healthy (&gt;1.5x)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter revenue and expenses to calculate DSCR</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
