import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatIndianRupees, formatNumberToIndianWords } from "@/utils/formatNumberToWords";
import { useEMICalculations } from './useEMICalculations';
import { TrendingDown, Clock, IndianRupee } from 'lucide-react';

interface PrepaymentCalculatorProps {
  principal: number;
  interestRate: number;
  loanTerm: number;
  currentEMI: number;
  totalInterestWithoutPrepay: number;
}

export const PrepaymentCalculator: React.FC<PrepaymentCalculatorProps> = ({
  principal,
  interestRate,
  loanTerm,
  currentEMI,
  totalInterestWithoutPrepay
}) => {
  const [prepaymentAmount, setPrepaymentAmount] = useState('100000');
  const [prepaymentMonth, setPrepaymentMonth] = useState(12);
  const [impact, setImpact] = useState<{
    interestSaved: number;
    tenureReduction: number;
    originalTotalInterest: number;
    newTotalInterest: number;
    originalTenure: number;
    newTenure: number;
  } | null>(null);

  const { calculatePrepaymentImpact } = useEMICalculations();

  const totalMonths = loanTerm * 12;

  useEffect(() => {
    if (principal > 0 && parseFloat(prepaymentAmount) > 0) {
      const result = calculatePrepaymentImpact(
        principal,
        interestRate,
        totalMonths,
        prepaymentMonth,
        parseFloat(prepaymentAmount)
      );
      setImpact(result);
    }
  }, [principal, interestRate, loanTerm, prepaymentAmount, prepaymentMonth, calculatePrepaymentImpact, totalMonths]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <IndianRupee className="h-4 w-4" /> Prepayment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                value={prepaymentAmount}
                onChange={(e) => setPrepaymentAmount(e.target.value)}
                className="pl-8"
                min="1000"
              />
            </div>
            {parseFloat(prepaymentAmount) > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatNumberToIndianWords(parseFloat(prepaymentAmount))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" /> Prepayment Month: {prepaymentMonth}
            </label>
            <Slider
              value={[prepaymentMonth]}
              onValueChange={([value]) => setPrepaymentMonth(value)}
              min={1}
              max={totalMonths - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Month 1</span>
              <span>Month {totalMonths - 1}</span>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {impact && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interest Saved:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatIndianRupees(impact.interestSaved, false)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tenure Reduction:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {impact.tenureReduction} months
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">New tenure:</span>
                    <span>{impact.newTenure} months ({(impact.newTenure / 12).toFixed(1)} years)</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {impact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-2">
              <div className="text-sm text-muted-foreground">Original Total Interest</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {formatIndianRupees(impact.originalTotalInterest, false)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-2">
              <div className="text-sm text-muted-foreground">New Total Interest</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatIndianRupees(impact.newTotalInterest, false)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardContent className="pt-4 space-y-2">
              <div className="text-sm text-amber-700 dark:text-amber-400">Savings Percentage</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {((impact.interestSaved / impact.originalTotalInterest) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
        <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-300">Tip</h5>
        <p className="text-sm text-muted-foreground">
          Making prepayments early in the loan term saves more interest because the outstanding principal is higher. 
          Try adjusting the prepayment month to see how timing affects your savings.
        </p>
      </div>
    </div>
  );
};
