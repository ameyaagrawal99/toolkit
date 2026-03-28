import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIndianRupees } from "@/utils/formatNumberToWords";
import { useEMICalculations } from './useEMICalculations';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface LoanOption {
  id: string;
  name: string;
  principal: string;
  interestRate: string;
  loanTerm: string;
  processingFee: string;
}

export const LoanComparison: React.FC = () => {
  const [loans, setLoans] = useState<LoanOption[]>([
    { id: '1', name: 'Bank A', principal: '5000000', interestRate: '8.5', loanTerm: '20', processingFee: '25000' },
    { id: '2', name: 'Bank B', principal: '5000000', interestRate: '9.0', loanTerm: '15', processingFee: '15000' },
  ]);

  const { calculateEMI, generateAmortizationSchedule, calculateIRR } = useEMICalculations();

  const addLoan = () => {
    if (loans.length >= 4) return;
    setLoans([...loans, {
      id: Date.now().toString(),
      name: `Option ${loans.length + 1}`,
      principal: '5000000',
      interestRate: '9',
      loanTerm: '20',
      processingFee: '20000'
    }]);
  };

  const removeLoan = (id: string) => {
    if (loans.length <= 2) return;
    setLoans(loans.filter(loan => loan.id !== id));
  };

  const updateLoan = (id: string, field: keyof LoanOption, value: string) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
  };

  const calculateLoanMetrics = (loan: LoanOption) => {
    const principal = parseFloat(loan.principal) || 0;
    const rate = parseFloat(loan.interestRate) || 0;
    const term = parseFloat(loan.loanTerm) || 0;
    const fee = parseFloat(loan.processingFee) || 0;

    if (principal <= 0 || rate <= 0 || term <= 0) {
      return null;
    }

    const months = term * 12;
    const emi = calculateEMI(principal, rate, months);
    const { schedule, totalInterest } = generateAmortizationSchedule(principal, rate, months);
    const totalPayment = principal + totalInterest + fee;
    const effectiveRate = calculateIRR(principal, schedule, fee);

    return {
      emi: parseFloat(emi.toFixed(2)),
      totalInterest,
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      effectiveRate,
      totalCost: totalInterest + fee
    };
  };

  const metrics = loans.map(loan => ({
    loan,
    metrics: calculateLoanMetrics(loan)
  }));

  const validMetrics = metrics.filter(m => m.metrics !== null);
  const lowestEMI = validMetrics.length > 0 ? Math.min(...validMetrics.map(m => m.metrics!.emi)) : 0;
  const lowestCost = validMetrics.length > 0 ? Math.min(...validMetrics.map(m => m.metrics!.totalCost)) : 0;
  const lowestEffectiveRate = validMetrics.length > 0 ? Math.min(...validMetrics.map(m => m.metrics!.effectiveRate)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Compare up to 4 loan options side by side
        </p>
        <Button onClick={addLoan} disabled={loans.length >= 4} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Option
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loans.map((loan, index) => (
          <Card key={loan.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Input
                  value={loan.name}
                  onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                  className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
                />
                {loans.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLoan(loan.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Loan Amount (₹)</label>
                <Input
                  type="number"
                  value={loan.principal}
                  onChange={(e) => updateLoan(loan.id, 'principal', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Interest Rate (%)</label>
                <Input
                  type="number"
                  value={loan.interestRate}
                  onChange={(e) => updateLoan(loan.id, 'interestRate', e.target.value)}
                  step="0.1"
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Term (Years)</label>
                <Input
                  type="number"
                  value={loan.loanTerm}
                  onChange={(e) => updateLoan(loan.id, 'loanTerm', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Processing Fee (₹)</label>
                <Input
                  type="number"
                  value={loan.processingFee}
                  onChange={(e) => updateLoan(loan.id, 'processingFee', e.target.value)}
                  className="h-8"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg">Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {loans.map(loan => (
                  <TableHead key={loan.id} className="text-center">{loan.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Monthly EMI</TableCell>
                {metrics.map(({ loan, metrics }) => (
                  <TableCell key={loan.id} className="text-center">
                    {metrics ? (
                      <div className="flex items-center justify-center gap-1">
                        {formatIndianRupees(metrics.emi, false)}
                        {metrics.emi === lowestEMI && (
                          <Trophy className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Interest</TableCell>
                {metrics.map(({ loan, metrics }) => (
                  <TableCell key={loan.id} className="text-center text-red-600 dark:text-red-400">
                    {metrics ? formatIndianRupees(metrics.totalInterest, false) : '-'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Processing Fee</TableCell>
                {loans.map(loan => (
                  <TableCell key={loan.id} className="text-center">
                    {formatIndianRupees(parseFloat(loan.processingFee) || 0, false)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">Total Cost (Interest + Fees)</TableCell>
                {metrics.map(({ loan, metrics }) => (
                  <TableCell key={loan.id} className="text-center font-semibold">
                    {metrics ? (
                      <div className="flex items-center justify-center gap-1">
                        {formatIndianRupees(metrics.totalCost, false)}
                        {metrics.totalCost === lowestCost && (
                          <Badge variant="secondary" className="ml-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            Best
                          </Badge>
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Effective Rate (APR)</TableCell>
                {metrics.map(({ loan, metrics }) => (
                  <TableCell key={loan.id} className="text-center">
                    {metrics ? (
                      <div className="flex items-center justify-center gap-1">
                        {metrics.effectiveRate}%
                        {metrics.effectiveRate === lowestEffectiveRate && (
                          <Trophy className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Payment</TableCell>
                {metrics.map(({ loan, metrics }) => (
                  <TableCell key={loan.id} className="text-center font-bold">
                    {metrics ? formatIndianRupees(metrics.totalPayment, false) : '-'}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
        <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-300">Understanding Effective Rate (APR)</h5>
        <p className="text-sm text-muted-foreground">
          The effective rate considers all costs including processing fees, giving you the true cost of borrowing. 
          A lower nominal interest rate might not be the best deal if it has high processing fees.
        </p>
      </div>
    </div>
  );
};
