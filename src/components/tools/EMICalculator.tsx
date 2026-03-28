import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calculator, IndianRupee, Calendar, TrendingUp, Scale, Clock, Download, BarChart3, Percent, Building2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatIndianRupees, formatNumberToIndianWords } from "@/utils/formatNumberToWords";
import { useEMICalculations } from './emi/useEMICalculations';
import { AmortizationItem, YearlyBreakdown } from './emi/types';
import { PrepaymentCalculator } from './emi/PrepaymentCalculator';
import { LoanComparison } from './emi/LoanComparison';
import { CashFlowAnalysis } from './emi/CashFlowAnalysis';
import { IRRCalculator } from './emi/IRRCalculator';
import { ExportTools } from './emi/ExportTools';
import { FinancialModelView } from './emi/FinancialModelView';

export const EMICalculator = () => {
  const [principal, setPrincipal] = useState('100000');
  const [interestRate, setInterestRate] = useState('10');
  const [loanTerm, setLoanTerm] = useState('5');
  const [inflationRate, setInflationRate] = useState('6');
  const [moratoriumMonths, setMoratoriumMonths] = useState('0');
  const [moratoriumType, setMoratoriumType] = useState<'none' | 'full' | 'interest-only'>('none');
  
  // View toggles
  const [scheduleView, setScheduleView] = useState<'monthly' | 'yearly'>('yearly');
  const [showFullTable, setShowFullTable] = useState(false);

  const { generateAmortizationSchedule, calculateYearlyBreakdown, calculateEMI } = useEMICalculations();

  // Calculate all values
  const calculations = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = parseFloat(interestRate) || 0;
    const n = (parseFloat(loanTerm) || 0) * 12;
    const inflation = (parseFloat(inflationRate) || 0) / 100;
    const moratMonths = parseInt(moratoriumMonths) || 0;
    const moratType = moratMonths > 0 ? moratoriumType : 'none';

    if (P <= 0 || r <= 0 || n <= 0) {
      return {
        emi: 0,
        totalInterest: 0,
        totalPayment: 0,
        futureValueOfMoney: 0,
        schedule: [] as AmortizationItem[],
        yearlyBreakdown: [] as YearlyBreakdown[],
        effectiveTenure: 0
      };
    }

    const { schedule, totalInterest, effectiveTenure } = generateAmortizationSchedule(
      P, r, n, moratMonths, moratType
    );

    const emi = schedule.length > moratMonths ? schedule[moratMonths]?.emi || 0 : 0;
    const totalPayment = P + totalInterest;
    
    // Calculate future value of money
    const presentValueOfTotalPayment = totalPayment / Math.pow(1 + inflation, parseFloat(loanTerm) || 1);
    const futureValueOfMoney = totalPayment - presentValueOfTotalPayment;

    const yearlyBreakdown = calculateYearlyBreakdown(schedule);

    return {
      emi,
      totalInterest,
      totalPayment,
      futureValueOfMoney,
      schedule,
      yearlyBreakdown,
      effectiveTenure
    };
  }, [principal, interestRate, loanTerm, inflationRate, moratoriumMonths, moratoriumType, generateAmortizationSchedule, calculateYearlyBreakdown]);

  // Generate chart data
  const chartData = useMemo(() => {
    return calculations.yearlyBreakdown.map((item, index) => ({
      year: item.year,
      principalPaid: item.principalPaid,
      interestPaid: item.interestPaid,
      principalRemaining: item.endingBalance,
      totalPaid: item.totalPaid
    }));
  }, [calculations.yearlyBreakdown]);

  const displayedSchedule = useMemo(() => {
    if (scheduleView === 'yearly') {
      return calculations.yearlyBreakdown;
    }
    return showFullTable ? calculations.schedule : calculations.schedule.slice(0, 12);
  }, [scheduleView, showFullTable, calculations]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">EMI Calculator</h2>
        <p className="text-muted-foreground">
          Complete loan analysis with EMI calculation, prepayment simulator, loan comparison, and cash flow projections.
        </p>
      </div>

      {/* Input Section */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Loan Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <IndianRupee className="h-4 w-4" /> Loan Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input 
                  type="number" 
                  value={principal} 
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="pl-8"
                  min="1"
                />
              </div>
              {parseFloat(principal) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatNumberToIndianWords(parseFloat(principal))}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Interest Rate (% p.a.)
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={interestRate} 
                  onChange={(e) => setInterestRate(e.target.value)} 
                  className="pr-8"
                  min="0.1"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Loan Term
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={loanTerm} 
                  onChange={(e) => setLoanTerm(e.target.value)}
                  min="1"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">years</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Inflation Rate (% p.a.)
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={inflationRate} 
                  onChange={(e) => setInflationRate(e.target.value)} 
                  className="pr-8"
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Moratorium Section */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Moratorium Period
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={moratoriumMonths} 
                    onChange={(e) => setMoratoriumMonths(e.target.value)}
                    min="0"
                    max="36"
                    className="w-32 pr-16"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">months</span>
                </div>
              </div>
              
              {parseInt(moratoriumMonths) > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moratorium Type</label>
                  <Select value={moratoriumType} onValueChange={(v) => setMoratoriumType(v as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interest-only">Interest Only</SelectItem>
                      <SelectItem value="full">Full (No payments)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {parseInt(moratoriumMonths) > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {moratoriumType === 'full' 
                  ? 'Interest will be added to principal during moratorium (increases total cost)'
                  : 'Only interest will be paid during moratorium period'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly EMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianRupees(calculations.emi, false)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumberToIndianWords(Math.round(calculations.emi))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatIndianRupees(calculations.totalInterest, false)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumberToIndianWords(Math.round(calculations.totalInterest))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianRupees(calculations.totalPayment, false)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumberToIndianWords(Math.round(calculations.totalPayment))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-400">Effect of Inflation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatIndianRupees(calculations.futureValueOfMoney, false)}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Loss of purchasing power
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Tools */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExportTools
            schedule={calculations.schedule}
            yearlyBreakdown={calculations.yearlyBreakdown}
            loanDetails={{
              principal: parseFloat(principal) || 0,
              interestRate: parseFloat(interestRate) || 0,
              loanTerm: parseFloat(loanTerm) || 0,
              emi: calculations.emi,
              totalInterest: calculations.totalInterest,
              totalPayment: calculations.totalPayment
            }}
          />
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto">
          <TabsTrigger value="visualization" className="flex-1 min-w-[100px]">Visualization</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 min-w-[100px]">Amortization</TabsTrigger>
          <TabsTrigger value="prepayment" className="flex-1 min-w-[100px]">Prepayment</TabsTrigger>
          <TabsTrigger value="comparison" className="flex-1 min-w-[100px]">Compare Loans</TabsTrigger>
          <TabsTrigger value="cashflow" className="flex-1 min-w-[100px]">Cash Flow</TabsTrigger>
          <TabsTrigger value="irr" className="flex-1 min-w-[100px]">IRR</TabsTrigger>
          <TabsTrigger value="financial-model" className="flex-1 min-w-[100px]">
            <Building2 className="h-4 w-4 mr-1" /> Financial Model
          </TabsTrigger>
        </TabsList>
        
        {/* Visualization Tab */}
        <TabsContent value="visualization" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Loan Breakdown Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value: any) => [formatIndianRupees(value, false), null]} labelFormatter={(label) => `Year ${label}`} />
                    <Legend />
                    <defs>
                      <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="principalPaid" stackId="1" stroke="#8884d8" fill="url(#colorPrincipal)" name="Principal Paid" />
                    <Area type="monotone" dataKey="interestPaid" stackId="1" stroke="#82ca9d" fill="url(#colorInterest)" name="Interest Paid" />
                    <Area type="monotone" dataKey="principalRemaining" stackId="2" stroke="#ffc658" fill="url(#colorRemaining)" name="Balance Remaining" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Amortization Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <CardTitle>Amortization Schedule</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="view-toggle" className="text-sm">Monthly</Label>
                    <Switch
                      id="view-toggle"
                      checked={scheduleView === 'yearly'}
                      onCheckedChange={(checked) => setScheduleView(checked ? 'yearly' : 'monthly')}
                    />
                    <Label htmlFor="view-toggle" className="text-sm">Yearly</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>{scheduleView === 'yearly' ? 'Year' : 'Month'}</TableHead>
                      <TableHead>{scheduleView === 'yearly' ? 'Principal Paid' : 'Beginning Balance'}</TableHead>
                      <TableHead>{scheduleView === 'yearly' ? 'Interest Paid' : 'EMI'}</TableHead>
                      <TableHead>{scheduleView === 'yearly' ? 'Total Paid' : 'Principal'}</TableHead>
                      <TableHead>{scheduleView === 'yearly' ? 'Cumulative Interest' : 'Interest'}</TableHead>
                      <TableHead>Ending Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleView === 'yearly' ? (
                      calculations.yearlyBreakdown.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">Year {row.year}</TableCell>
                          <TableCell>{formatIndianRupees(row.principalPaid, false)}</TableCell>
                          <TableCell className="text-orange-700 dark:text-orange-400">{formatIndianRupees(row.interestPaid, false)}</TableCell>
                          <TableCell>{formatIndianRupees(row.totalPaid, false)}</TableCell>
                          <TableCell className="text-red-700 dark:text-red-400 font-medium">{formatIndianRupees(row.cumulativeInterest, false)}</TableCell>
                          <TableCell className="text-blue-700 dark:text-blue-400">{formatIndianRupees(row.endingBalance, false)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      displayedSchedule.map((row: any) => (
                        <TableRow key={row.month}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell>{formatIndianRupees(row.beginningBalance, false)}</TableCell>
                          <TableCell>{formatIndianRupees(row.emi, false)}</TableCell>
                          <TableCell>{formatIndianRupees(row.principal, false)}</TableCell>
                          <TableCell>{formatIndianRupees(row.interest, false)}</TableCell>
                          <TableCell>{formatIndianRupees(row.endingBalance, false)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {scheduleView === 'monthly' && calculations.schedule.length > 12 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowFullTable(!showFullTable)}
                >
                  {showFullTable ? "Show Less" : `Show All ${calculations.schedule.length} Months`}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Prepayment Calculator Tab */}
        <TabsContent value="prepayment" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Prepayment Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrepaymentCalculator
                principal={parseFloat(principal) || 0}
                interestRate={parseFloat(interestRate) || 0}
                loanTerm={parseFloat(loanTerm) || 0}
                currentEMI={calculations.emi}
                totalInterestWithoutPrepay={calculations.totalInterest}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Loan Comparison Tab */}
        <TabsContent value="comparison" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" /> Loan Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoanComparison />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Cash Flow Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowAnalysis
                schedule={calculations.schedule}
                principal={parseFloat(principal) || 0}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* IRR Calculator Tab */}
        <TabsContent value="irr" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" /> Effective Interest Rate (IRR) Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IRRCalculator
                principal={parseFloat(principal) || 0}
                nominalRate={parseFloat(interestRate) || 0}
                schedule={calculations.schedule}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Model Tab */}
        <TabsContent value="financial-model" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Financial Model & Balance Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialModelView
                principal={parseFloat(principal) || 0}
                interestRate={parseFloat(interestRate) || 0}
                loanTerm={parseFloat(loanTerm) || 0}
                emi={calculations.emi}
                totalInterest={calculations.totalInterest}
                yearlyBreakdown={calculations.yearlyBreakdown}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
