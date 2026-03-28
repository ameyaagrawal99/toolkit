import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatIndianRupees } from "@/utils/formatNumberToWords";
import { useEMICalculations } from './useEMICalculations';
import { AmortizationItem } from './types';
import { Calculator, Percent, AlertTriangle } from 'lucide-react';

interface IRRCalculatorProps {
  principal: number;
  nominalRate: number;
  schedule: AmortizationItem[];
}

export const IRRCalculator: React.FC<IRRCalculatorProps> = ({
  principal,
  nominalRate,
  schedule
}) => {
  const [processingFee, setProcessingFee] = useState('25000');
  const [insuranceFee, setInsuranceFee] = useState('0');
  const [otherCharges, setOtherCharges] = useState('0');

  const { calculateIRR } = useEMICalculations();

  const totalFees = useMemo(() => 
    (parseFloat(processingFee) || 0) + 
    (parseFloat(insuranceFee) || 0) + 
    (parseFloat(otherCharges) || 0),
    [processingFee, insuranceFee, otherCharges]
  );

  const effectiveRate = useMemo(() => {
    if (schedule.length === 0 || principal <= 0) return 0;
    return calculateIRR(principal, schedule, totalFees);
  }, [principal, schedule, totalFees, calculateIRR]);

  const rateDifference = effectiveRate - nominalRate;
  const netLoanAmount = principal - totalFees;
  const feePercentage = (totalFees / principal) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Processing Fee (₹)</label>
          <Input
            type="number"
            value={processingFee}
            onChange={(e) => setProcessingFee(e.target.value)}
            min="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Insurance Premium (₹)</label>
          <Input
            type="number"
            value={insuranceFee}
            onChange={(e) => setInsuranceFee(e.target.value)}
            min="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Other Charges (₹)</label>
          <Input
            type="number"
            value={otherCharges}
            onChange={(e) => setOtherCharges(e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatIndianRupees(principal, false)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Fees & Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatIndianRupees(totalFees, false)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {feePercentage.toFixed(2)}% of loan amount
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-400">Net Amount Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {formatIndianRupees(netLoanAmount, false)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Percent className="h-4 w-4" /> Effective Rate (APR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {effectiveRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {nominalRate}% nominal
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Rate Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Nominal Interest Rate</div>
              <div className="text-2xl font-bold">{nominalRate}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                The advertised rate - does not include fees
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg">
              <div className="text-sm text-amber-700 dark:text-amber-400 mb-1">Effective Interest Rate</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{effectiveRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                True cost including all fees & charges
              </p>
            </div>
          </div>

          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-blue-500 rounded-l-full"
              style={{ width: `${(nominalRate / effectiveRate) * 100}%` }}
            />
            <div 
              className="absolute h-full bg-amber-500"
              style={{ 
                left: `${(nominalRate / effectiveRate) * 100}%`,
                width: `${((effectiveRate - nominalRate) / effectiveRate) * 100}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Nominal: {nominalRate}%</span>
            <span className="text-amber-600 dark:text-amber-400">
              +{rateDifference.toFixed(2)}% due to fees
            </span>
            <span>Effective: {effectiveRate.toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>

      {rateDifference > 1 && (
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h5 className="font-medium text-amber-800 dark:text-amber-300">High Fee Impact</h5>
            <p className="text-sm text-muted-foreground mt-1">
              The fees add {rateDifference.toFixed(2)}% to your effective interest rate. Consider negotiating lower processing fees 
              or comparing with other lenders who may offer lower upfront costs.
            </p>
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
        <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-300">What is Effective Interest Rate (APR)?</h5>
        <p className="text-sm text-muted-foreground">
          The Annual Percentage Rate (APR) or Effective Interest Rate represents the true annual cost of borrowing, 
          including all fees and charges. Unlike the nominal rate, it accounts for processing fees, insurance premiums, 
          and other upfront costs, giving you a more accurate picture of the loan's total cost.
        </p>
      </div>
    </div>
  );
};
