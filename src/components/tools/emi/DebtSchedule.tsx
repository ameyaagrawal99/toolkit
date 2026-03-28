import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Copy, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatIndianRupees } from "@/utils/formatNumberToWords";
import { YearlyBreakdown, DebtScheduleItem } from './types';

interface DebtScheduleProps {
  yearlyBreakdown: YearlyBreakdown[];
  principal: number;
  emi: number;
  totalInterest: number;
}

export const DebtSchedule: React.FC<DebtScheduleProps> = ({
  yearlyBreakdown,
  principal,
  emi,
  totalInterest
}) => {
  // Generate debt schedule data
  const debtSchedule = useMemo((): DebtScheduleItem[] => {
    return yearlyBreakdown.map((year, index) => {
      const openingBalance = index === 0 ? principal : yearlyBreakdown[index - 1].endingBalance;
      
      return {
        year: year.year,
        openingBalance,
        principalPayment: year.principalPaid,
        interestPayment: year.interestPaid,
        totalPayment: year.totalPaid,
        closingBalance: year.endingBalance
      };
    });
  }, [yearlyBreakdown, principal]);

  // Export functions
  const exportToCSV = () => {
    const headers = ['Year', 'Opening Balance', 'Principal Payment', 'Interest Payment', 'Total Payment', 'Closing Balance'];
    const rows = debtSchedule.map(item => [
      item.year,
      item.openingBalance.toFixed(2),
      item.principalPayment.toFixed(2),
      item.interestPayment.toFixed(2),
      item.totalPayment.toFixed(2),
      item.closingBalance.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'debt_schedule.csv';
    link.click();
    
    toast({
      title: "Exported Successfully",
      description: "Debt schedule has been downloaded as CSV"
    });
  };

  const copyToClipboard = () => {
    const headers = ['Year', 'Opening Balance', 'Principal', 'Interest', 'Total Payment', 'Closing Balance'];
    const rows = debtSchedule.map(item => [
      `Year ${item.year}`,
      item.openingBalance.toFixed(2),
      item.principalPayment.toFixed(2),
      item.interestPayment.toFixed(2),
      item.totalPayment.toFixed(2),
      item.closingBalance.toFixed(2)
    ]);

    const content = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    navigator.clipboard.writeText(content);
    
    toast({
      title: "Copied to Clipboard",
      description: "Debt schedule ready to paste into Excel"
    });
  };

  const exportBalanceSheetFormat = () => {
    const content = `DEBT SCHEDULE FOR FINANCIAL MODEL
================================

LOAN SUMMARY
------------
Principal Amount: ${formatIndianRupees(principal, false)}
Total Interest: ${formatIndianRupees(totalInterest, false)}
Monthly EMI: ${formatIndianRupees(emi, false)}
Loan Term: ${yearlyBreakdown.length} years

YEARLY DEBT SCHEDULE
--------------------

Year\tOpening Balance\tPrincipal\tInterest\tTotal Payment\tClosing Balance
${debtSchedule.map(item => 
  `${item.year}\t${item.openingBalance.toFixed(0)}\t${item.principalPayment.toFixed(0)}\t${item.interestPayment.toFixed(0)}\t${item.totalPayment.toFixed(0)}\t${item.closingBalance.toFixed(0)}`
).join('\n')}

BALANCE SHEET ENTRIES (Year-wise)
---------------------------------
${debtSchedule.map(item => 
  `Year ${item.year}:
  - Liabilities: Long-term Debt = ₹${item.closingBalance.toFixed(0)}
  - P&L: Finance Costs = ₹${item.interestPayment.toFixed(0)}`
).join('\n\n')}

Note: Principal repayment reduces liability, Interest goes to P&L as finance cost.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'financial_model_debt_schedule.txt';
    link.click();
    
    toast({
      title: "Exported Successfully",
      description: "Financial model format has been downloaded"
    });
  };

  // Totals
  const totals = useMemo(() => ({
    principal: debtSchedule.reduce((sum, item) => sum + item.principalPayment, 0),
    interest: debtSchedule.reduce((sum, item) => sum + item.interestPayment, 0),
    total: debtSchedule.reduce((sum, item) => sum + item.totalPayment, 0)
  }), [debtSchedule]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle className="text-base">Debt Repayment Schedule</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Year-wise breakdown for financial modeling and projections
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportBalanceSheetFormat}>
              <FileSpreadsheet className="h-4 w-4 mr-1" /> Financial Model
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right">Principal Payment</TableHead>
                <TableHead className="text-right">Interest Payment</TableHead>
                <TableHead className="text-right">Total Payment</TableHead>
                <TableHead className="text-right">Closing Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtSchedule.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">Year {row.year}</TableCell>
                  <TableCell className="text-right">{formatIndianRupees(row.openingBalance, false)}</TableCell>
                  <TableCell className="text-right text-blue-600 dark:text-blue-400">
                    {formatIndianRupees(row.principalPayment, false)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {formatIndianRupees(row.interestPayment, false)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatIndianRupees(row.totalPayment, false)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatIndianRupees(row.closingBalance, false)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400">
                  {formatIndianRupees(totals.principal, false)}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  {formatIndianRupees(totals.interest, false)}
                </TableCell>
                <TableCell className="text-right">
                  {formatIndianRupees(totals.total, false)}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Quick Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Principal (Balance Sheet)</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatIndianRupees(principal, false)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Interest (P&L)</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatIndianRupees(totalInterest, false)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Cash Outflow</p>
            <p className="text-lg font-bold">
              {formatIndianRupees(principal + totalInterest, false)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
