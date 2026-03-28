import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, Percent, TrendingUp, IndianRupee, Calculator, Lightbulb, Info } from "lucide-react";
import { formatIndianRupees, formatNumberToIndianWords } from "@/utils/formatNumberToWords";
import { SliderInput } from '@/components/ui/slider-input';
import { BigResultCard } from '@/components/ui/big-result-card';
import { ProTip } from '@/components/ui/pro-tip';

const investmentPresets = [
  { label: '10K', value: 10000 },
  { label: '50K', value: 50000 },
  { label: '1 Lakh', value: 100000 },
  { label: '5 Lakh', value: 500000 },
  { label: '10 Lakh', value: 1000000 },
];

const timePresets = [
  { label: '6M', value: 0.5 },
  { label: '1Y', value: 1 },
  { label: '2Y', value: 2 },
  { label: '3Y', value: 3 },
  { label: '5Y', value: 5 },
];

const formatLargeNumber = (value: number): string => {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)} K`;
  return value.toString();
};

export const ROICalculator = () => {
  const [calculationType, setCalculationType] = useState('simple');
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [finalValue, setFinalValue] = useState(120000);
  const [timePeriod, setTimePeriod] = useState(1);
  const [roi, setRoi] = useState(0);
  const [annualizedRoi, setAnnualizedRoi] = useState(0);
  const [gain, setGain] = useState(0);
  const [isProfit, setIsProfit] = useState(true);

  useEffect(() => {
    calculateROI();
  }, [initialInvestment, finalValue, timePeriod, calculationType]);

  const calculateROI = () => {
    const initial = initialInvestment;
    const final = finalValue;
    const time = timePeriod;
    
    if (initial === 0 || (calculationType === 'annualized' && time === 0)) {
      setRoi(0);
      setGain(0);
      setAnnualizedRoi(0);
      return;
    }
    
    const calculatedGain = final - initial;
    setGain(calculatedGain);
    setIsProfit(calculatedGain >= 0);
    
    const calculatedRoi = (calculatedGain / initial) * 100;
    setRoi(parseFloat(calculatedRoi.toFixed(2)));
    
    if (calculationType === 'annualized' && time > 0) {
      const calculatedAnnualizedRoi = (Math.pow((1 + (calculatedGain / initial)), (1 / time)) - 1) * 100;
      setAnnualizedRoi(parseFloat(calculatedAnnualizedRoi.toFixed(2)));
    } else {
      setAnnualizedRoi(0);
    }
  };

  const getProTip = () => {
    if (roi > 15) {
      return {
        title: "Strong Returns!",
        message: "Returns above 15% are excellent! Consider if this is sustainable or a one-time gain. Diversification can help maintain stable returns.",
        variant: "success" as const
      };
    }
    if (roi < 0) {
      return {
        title: "Learning Opportunity",
        message: "Losses are part of investing. Review what went wrong and consider if the investment thesis has changed or if it's a temporary dip.",
        variant: "warning" as const
      };
    }
    if (roi >= 0 && roi < 7) {
      return {
        title: "Consider Alternatives",
        message: "Returns below 7% may not beat inflation over time. Consider if other investment options might offer better risk-adjusted returns.",
        variant: "info" as const
      };
    }
    return {
      title: "Good Progress",
      message: "Your investment is performing well. Consider reinvesting gains to benefit from compounding over time.",
      variant: "primary" as const
    };
  };

  const proTip = getProTip();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ROI Calculator
        </h2>
        <p className="text-muted-foreground">Calculate Return on Investment (ROI) for your investments.</p>
      </div>

      <Tabs value={calculationType} onValueChange={setCalculationType}>
        <TabsList className="grid grid-cols-2 w-full h-12 rounded-xl p-1 bg-secondary/50">
          <TabsTrigger 
            value="simple" 
            className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Simple ROI
          </TabsTrigger>
          <TabsTrigger 
            value="annualized"
            className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Annualized ROI
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="modern-card p-6 md:p-8">
        <div className="space-y-8">
          <SliderInput
            label="Initial Investment"
            icon={IndianRupee}
            value={initialInvestment}
            onChange={setInitialInvestment}
            min={1000}
            max={10000000}
            step={1000}
            unit="₹"
            unitPosition="prefix"
            formatValue={formatLargeNumber}
            presets={investmentPresets}
            helperText={formatNumberToIndianWords(initialInvestment)}
          />

          <SliderInput
            label="Final Value"
            icon={IndianRupee}
            value={finalValue}
            onChange={setFinalValue}
            min={0}
            max={Math.max(20000000, initialInvestment * 3)}
            step={1000}
            unit="₹"
            unitPosition="prefix"
            formatValue={formatLargeNumber}
            helperText={formatNumberToIndianWords(finalValue)}
          />

          {calculationType === 'annualized' && (
            <SliderInput
              label="Time Period"
              icon={Percent}
              value={timePeriod}
              onChange={setTimePeriod}
              min={0.5}
              max={30}
              step={0.5}
              unit="yrs"
              unitPosition="suffix"
              presets={timePresets}
            />
          )}
        </div>
      </Card>

      {/* Pro Tip */}
      <ProTip icon={Lightbulb} title={proTip.title} variant={proTip.variant}>
        {proTip.message}
      </ProTip>

      {/* Results */}
      <div className={`grid gap-4 ${calculationType === 'annualized' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <BigResultCard
          label="ROI"
          value={`${roi}%`}
          subValue={calculationType === 'annualized' ? `Over ${timePeriod} year${timePeriod !== 1 ? 's' : ''}` : 'Total return'}
          variant={isProfit ? 'success' : 'danger'}
          icon={isProfit ? TrendingUp : ArrowDown}
          size="large"
        />
        
        {calculationType === 'annualized' && (
          <BigResultCard
            label="Annualized ROI"
            value={`${annualizedRoi}%`}
            subValue="Per year (CAGR)"
            variant={isProfit ? 'primary' : 'danger'}
            icon={Percent}
          />
        )}
        
        <BigResultCard
          label={isProfit ? 'Profit' : 'Loss'}
          value={`₹${formatIndianRupees(Math.abs(gain))}`}
          subValue={formatNumberToIndianWords(Math.abs(gain))}
          variant={isProfit ? 'success' : 'danger'}
          trend={isProfit ? 'up' : 'down'}
          trendValue={isProfit ? 'Gained' : 'Lost'}
        />
      </div>

      {/* How to use */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Info className="h-4 w-4 text-primary" />
            How to Calculate ROI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-primary/5 rounded-xl">
              <p className="text-sm font-bold text-primary mb-2">Simple ROI Formula</p>
              <p className="font-mono text-sm">ROI = (Final - Initial) / Initial × 100%</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl">
              <p className="text-sm font-bold text-primary mb-2">Annualized ROI (CAGR)</p>
              <p className="font-mono text-sm">CAGR = [(Final/Initial)^(1/n) - 1] × 100%</p>
            </div>
          </div>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Enter your <strong className="text-foreground">Initial Investment</strong> amount.</li>
            <li>Enter the <strong className="text-foreground">Final Value</strong> of your investment.</li>
            <li>For Annualized ROI, enter the <strong className="text-foreground">Time Period</strong> in years.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
