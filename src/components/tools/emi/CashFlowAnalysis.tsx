import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { formatIndianRupees } from "@/utils/formatNumberToWords";
import { useEMICalculations } from './useEMICalculations';
import { AmortizationItem } from './types';
import { TrendingDown, ArrowDown } from 'lucide-react';

interface CashFlowAnalysisProps {
  schedule: AmortizationItem[];
  principal: number;
}

export const CashFlowAnalysis: React.FC<CashFlowAnalysisProps> = ({
  schedule,
  principal
}) => {
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('yearly');
  const { calculateCashFlow } = useEMICalculations();

  const cashFlowData = useMemo(() => 
    calculateCashFlow(schedule, viewType),
    [schedule, viewType, calculateCashFlow]
  );

  const chartData = useMemo(() => {
    if (viewType === 'yearly') {
      return cashFlowData.map(item => ({
        period: `Year ${item.period}`,
        outflow: item.outflow,
        cumulative: Math.abs(item.cumulativeFlow)
      }));
    }
    // For monthly, show first 24 months or all if less
    return cashFlowData.slice(0, 24).map(item => ({
      period: `M${item.period}`,
      outflow: item.outflow,
      cumulative: Math.abs(item.cumulativeFlow)
    }));
  }, [cashFlowData, viewType]);

  const totalOutflow = cashFlowData.reduce((sum, item) => sum + item.outflow, 0);
  const peakMonthlyOutflow = schedule.length > 0 ? schedule[0].emi : 0;
  const avgMonthlyOutflow = totalOutflow / schedule.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <ArrowDown className="h-4 w-4" /> Total Cash Outflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {formatIndianRupees(totalOutflow, false)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Over {schedule.length} months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly EMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIndianRupees(peakMonthlyOutflow, false)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fixed monthly payment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Yearly Outflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIndianRupees(peakMonthlyOutflow * 12, false)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Annual budget required
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Cash Flow Projection</CardTitle>
            <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'monthly' | 'yearly')}>
              <TabsList className="h-8">
                <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: any) => [formatIndianRupees(value, false), null]}
                />
                <Legend />
                <Bar
                  dataKey="outflow"
                  fill="hsl(var(--destructive))"
                  name="Period Outflow"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Cash Flow Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>{viewType === 'yearly' ? 'Year' : 'Month'}</TableHead>
                  <TableHead className="text-right">Outflow</TableHead>
                  <TableHead className="text-right">Cumulative Outflow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlowData.slice(0, viewType === 'yearly' ? undefined : 36).map((item) => (
                  <TableRow key={item.period}>
                    <TableCell className="font-medium">
                      {viewType === 'yearly' ? `Year ${item.period}` : `Month ${item.period}`}
                    </TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">
                      {formatIndianRupees(item.outflow, false)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatIndianRupees(Math.abs(item.cumulativeFlow), false)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
        <h5 className="font-medium mb-2 text-amber-800 dark:text-amber-300">Cash Flow Planning Tip</h5>
        <p className="text-sm text-muted-foreground">
          Ensure your projected income can comfortably cover the yearly outflow of {formatIndianRupees(peakMonthlyOutflow * 12, false)}. 
          Financial experts recommend that EMI should not exceed 40% of your monthly income.
        </p>
      </div>
    </div>
  );
};
