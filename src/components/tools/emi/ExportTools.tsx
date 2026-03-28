import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AmortizationItem, YearlyBreakdown } from './types';
import { Download, Copy, FileSpreadsheet } from 'lucide-react';

interface ExportToolsProps {
  schedule: AmortizationItem[];
  yearlyBreakdown: YearlyBreakdown[];
  loanDetails: {
    principal: number;
    interestRate: number;
    loanTerm: number;
    emi: number;
    totalInterest: number;
    totalPayment: number;
  };
}

export const ExportTools: React.FC<ExportToolsProps> = ({
  schedule,
  yearlyBreakdown,
  loanDetails
}) => {
  const generateCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const dataRows = data.map(row => 
      headers.map(header => {
        const key = header.toLowerCase().replace(/ /g, '');
        const value = row[key] ?? row[header] ?? '';
        return typeof value === 'number' ? value.toFixed(2) : value;
      }).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `${filename} is being downloaded`
    });
  };

  const exportMonthlySchedule = () => {
    const headers = ['Month', 'Beginning Balance', 'EMI', 'Principal', 'Interest', 'Ending Balance'];
    const data = schedule.map(item => ({
      month: item.month,
      'beginning balance': item.beginningBalance,
      emi: item.emi,
      principal: item.principal,
      interest: item.interest,
      'ending balance': item.endingBalance
    }));
    
    const csv = generateCSV(data, headers);
    downloadCSV(csv, 'amortization_schedule_monthly.csv');
  };

  const exportYearlyBreakdown = () => {
    const headers = ['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Cumulative Interest', 'Ending Balance'];
    const data = yearlyBreakdown.map(item => ({
      year: item.year,
      'principal paid': item.principalPaid,
      'interest paid': item.interestPaid,
      'total paid': item.totalPaid,
      'cumulative interest': item.cumulativeInterest,
      'ending balance': item.endingBalance
    }));
    
    const csv = generateCSV(data, headers);
    downloadCSV(csv, 'amortization_schedule_yearly.csv');
  };

  const exportSummary = () => {
    const summary = `Loan Summary Report
Generated on: ${new Date().toLocaleDateString()}

LOAN DETAILS
============
Loan Amount: ₹${loanDetails.principal.toLocaleString('en-IN')}
Interest Rate: ${loanDetails.interestRate}% p.a.
Loan Term: ${loanDetails.loanTerm} years (${loanDetails.loanTerm * 12} months)

PAYMENT DETAILS
===============
Monthly EMI: ₹${loanDetails.emi.toLocaleString('en-IN')}
Total Interest: ₹${loanDetails.totalInterest.toLocaleString('en-IN')}
Total Payment: ₹${loanDetails.totalPayment.toLocaleString('en-IN')}

INTEREST ANALYSIS
=================
Interest as % of Principal: ${((loanDetails.totalInterest / loanDetails.principal) * 100).toFixed(2)}%
Interest as % of Total Payment: ${((loanDetails.totalInterest / loanDetails.totalPayment) * 100).toFixed(2)}%
`;
    
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'loan_summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "loan_summary.txt is being downloaded"
    });
  };

  const copyToClipboard = async (type: 'monthly' | 'yearly') => {
    let text = '';
    
    if (type === 'monthly') {
      text = 'Month\tBeginning Balance\tEMI\tPrincipal\tInterest\tEnding Balance\n';
      text += schedule.map(item => 
        `${item.month}\t${item.beginningBalance}\t${item.emi}\t${item.principal}\t${item.interest}\t${item.endingBalance}`
      ).join('\n');
    } else {
      text = 'Year\tPrincipal Paid\tInterest Paid\tTotal Paid\tCumulative Interest\tEnding Balance\n';
      text += yearlyBreakdown.map(item => 
        `${item.year}\t${item.principalPaid}\t${item.interestPaid}\t${item.totalPaid}\t${item.cumulativeInterest}\t${item.endingBalance}`
      ).join('\n');
    }
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type === 'monthly' ? 'Monthly' : 'Yearly'} schedule copied. Paste in Excel or Google Sheets.`
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again or use the download option",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={exportMonthlySchedule}>
        <Download className="h-4 w-4 mr-1" /> Monthly CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportYearlyBreakdown}>
        <Download className="h-4 w-4 mr-1" /> Yearly CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportSummary}>
        <FileSpreadsheet className="h-4 w-4 mr-1" /> Summary
      </Button>
      <Button variant="outline" size="sm" onClick={() => copyToClipboard('monthly')}>
        <Copy className="h-4 w-4 mr-1" /> Copy Monthly
      </Button>
      <Button variant="outline" size="sm" onClick={() => copyToClipboard('yearly')}>
        <Copy className="h-4 w-4 mr-1" /> Copy Yearly
      </Button>
    </div>
  );
};
