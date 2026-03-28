import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, PiggyBank, TrendingUp, Clock } from "lucide-react";
import { useAgentContext } from '@/contexts/AgentContext';

export const FinancialPlanner = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [targetAmount, setTargetAmount] = useState<number>(1000000);
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(10000);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [yearsToForecast, setYearsToForecast] = useState<number>(20);
  const [showInflation, setShowInflation] = useState<boolean>(true);
  const [results, setResults] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);

  // Calculate financial forecast
  const calculateForecast = () => {
    try {
      // Convert annual rates to monthly
      const monthlyReturnRate = (1 + annualReturnRate / 100) ** (1 / 12) - 1;
      const monthlyInflationRate = (1 + inflationRate / 100) ** (1 / 12) - 1;
      
      let currentSavings = initialInvestment;
      let targetReachedMonth = -1;
      const data = [];
      
      // Calculate for the forecast period (years * 12 months)
      for (let month = 0; month <= yearsToForecast * 12; month++) {
        // Add monthly contribution
        if (month > 0) {
          currentSavings += monthlyContribution;
        }
        
        // Apply monthly return
        currentSavings *= (1 + monthlyReturnRate);
        
        // Check if target is reached
        if (targetReachedMonth === -1 && currentSavings >= targetAmount) {
          targetReachedMonth = month;
        }
        
        // Only add yearly data points to keep the chart manageable
        if (month % 12 === 0) {
          const year = month / 12;
          
          // Calculate inflation-adjusted value
          const inflationFactor = (1 + monthlyInflationRate) ** month;
          const inflationAdjustedValue = currentSavings / inflationFactor;
          
          data.push({
            year,
            nominal: Math.round(currentSavings),
            adjusted: Math.round(inflationAdjustedValue)
          });
        }
      }
      
      // Calculate target reach time
      let targetReachTime = null;
      let inflationAdjustedTargetReachTime = null;
      
      if (targetReachedMonth !== -1) {
        const years = Math.floor(targetReachedMonth / 12);
        const months = targetReachedMonth % 12;
        targetReachTime = { years, months };
        
        // Adjust target for inflation and recalculate
        let adjustedTarget = targetAmount;
        let currentAdjustedSavings = initialInvestment;
        let adjustedMonth = -1;
        
        for (let month = 0; month <= yearsToForecast * 12; month++) {
          // Increase target with inflation
          adjustedTarget *= (1 + monthlyInflationRate);
          
          // Add monthly contribution
          if (month > 0) {
            currentAdjustedSavings += monthlyContribution;
          }
          
          // Apply monthly return
          currentAdjustedSavings *= (1 + monthlyReturnRate);
          
          // Check if inflation-adjusted target is reached
          if (adjustedMonth === -1 && currentAdjustedSavings >= adjustedTarget) {
            adjustedMonth = month;
          }
        }
        
        if (adjustedMonth !== -1) {
          const adjustedYears = Math.floor(adjustedMonth / 12);
          const adjustedMonths = adjustedMonth % 12;
          inflationAdjustedTargetReachTime = { years: adjustedYears, months: adjustedMonths };
        }
      }
      
      // Calculate final values
      const finalNominal = data[data.length - 1].nominal;
      const finalAdjusted = data[data.length - 1].adjusted;
      
      setResults({
        finalNominal,
        finalAdjusted,
        targetReachTime,
        inflationAdjustedTargetReachTime,
        targetAmount
      });
      
      setForecastData(data);
      
      toast({
        title: "Forecast calculated",
        description: "Your financial forecast has been calculated successfully.",
      });
    } catch (error) {
      console.error("Error calculating forecast:", error);
      toast({
        title: "Calculation error",
        description: "There was an error calculating your forecast. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  // Format currency in Indian Rupees
  const formatIndianRupees = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format time period
  const formatPeriod = (years: number, months: number) => {
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
  };

  useEffect(() => {
    if (pendingParams?.toolId === 'financial-planner') {
      const p = pendingParams.params;
      if (p.targetAmount !== undefined) setTargetAmount(p.targetAmount);
      if (p.initialInvestment !== undefined) setInitialInvestment(p.initialInvestment);
      if (p.monthlyContribution !== undefined) setMonthlyContribution(p.monthlyContribution);
      if (p.annualReturnRate !== undefined) setAnnualReturnRate(p.annualReturnRate);
      if (p.inflationRate !== undefined) setInflationRate(p.inflationRate);
      if (p.yearsToForecast !== undefined) setYearsToForecast(p.yearsToForecast);
      consumeParams();
    }
  }, [pendingParams]);

  // Calculate on initial load and when inputs change
  useEffect(() => {
    calculateForecast();
  }, [
    initialInvestment,
    monthlyContribution,
    annualReturnRate, 
    inflationRate, 
    yearsToForecast, 
    targetAmount
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">Financial Goal Planner</h2>
        <p className="text-muted-foreground">Plan and visualize your journey to financial goals.</p>
      </div>
      
      <Tabs defaultValue="inputs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inputs" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Inputs</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inputs" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-amber-500" />
                Investment Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount (₹)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    min="0"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your financial goal amount
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initial-investment">Initial Investment (₹)</Label>
                  <Input
                    id="initial-investment"
                    type="number"
                    min="0"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount you already have invested
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly-contribution">Monthly Contribution (₹)</Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    min="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount you can save each month
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="years">Years to Forecast</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="years"
                      min={1}
                      max={50}
                      step={1}
                      value={[yearsToForecast]}
                      onValueChange={(vals) => setYearsToForecast(vals[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{yearsToForecast}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="return-rate">Expected Annual Return (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="return-rate"
                      min={1}
                      max={30}
                      step={0.5}
                      value={[annualReturnRate]}
                      onValueChange={(vals) => setAnnualReturnRate(vals[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{annualReturnRate}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inflation-rate">Expected Inflation Rate (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="inflation-rate"
                      min={0}
                      max={15}
                      step={0.5}
                      value={[inflationRate]}
                      onValueChange={(vals) => setInflationRate(vals[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{inflationRate}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="show-inflation"
                  checked={showInflation}
                  onCheckedChange={setShowInflation}
                />
                <Label htmlFor="show-inflation">Show inflation-adjusted values</Label>
              </div>
              
              <Button onClick={calculateForecast} className="w-full">
                Calculate Forecast
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          {results ? (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Target Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.targetReachTime ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md space-y-2">
                          <div className="text-sm font-medium text-green-800 dark:text-green-300">Nominal Value</div>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                            Target Reached in {formatPeriod(results.targetReachTime.years, results.targetReachTime.months)}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-300">
                            Target: {formatIndianRupees(results.targetAmount)}
                          </div>
                        </div>
                        
                        {showInflation && results.inflationAdjustedTargetReachTime && (
                          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md space-y-2">
                            <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Inflation Adjusted</div>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                              {results.inflationAdjustedTargetReachTime ? (
                                <>Target Reached in {formatPeriod(results.inflationAdjustedTargetReachTime.years, results.inflationAdjustedTargetReachTime.months)}</>
                              ) : (
                                <>Target not reached within forecast period</>
                              )}
                            </div>
                            <div className="text-sm text-amber-600 dark:text-amber-300">
                              Accounts for {inflationRate}% yearly inflation
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>
                          The Time Value of Money calculation shows that due to inflation, your target of {formatIndianRupees(results.targetAmount)} today 
                          will be worth approximately {formatIndianRupees(results.targetAmount * (1 + inflationRate/100) ** results.targetReachTime.years)} 
                          after {results.targetReachTime.years} years at {inflationRate}% inflation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                      <div className="text-xl font-medium text-amber-800 dark:text-amber-300">
                        Target not reached within forecast period
                      </div>
                      <p className="mt-2 text-amber-600 dark:text-amber-400">
                        Consider increasing your monthly contribution, initial investment, or extending your time horizon.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Investment Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={forecastData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                          label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatIndianRupees(value), ""]}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="nominal" 
                          name="Nominal Value" 
                          stroke="#4f46e5" 
                          strokeWidth={2} 
                          dot={{ r: 2 }} 
                          activeDot={{ r: 6 }} 
                        />
                        {showInflation && (
                          <Line 
                            type="monotone" 
                            dataKey="adjusted" 
                            name="Inflation Adjusted" 
                            stroke="#f59e0b" 
                            strokeWidth={2} 
                            dot={{ r: 2 }} 
                            activeDot={{ r: 6 }} 
                            strokeDasharray="5 5"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-md bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Final Portfolio Value (Nominal)</div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {formatIndianRupees(results.finalNominal)}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                        After {yearsToForecast} years of investing
                      </div>
                    </div>
                    
                    {showInflation && (
                      <div className="p-4 rounded-md bg-teal-50 dark:bg-teal-900/20">
                        <div className="text-sm font-medium text-teal-800 dark:text-teal-300">Final Value (Inflation Adjusted)</div>
                        <div className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                          {formatIndianRupees(results.finalAdjusted)}
                        </div>
                        <div className="text-sm text-teal-600 dark:text-teal-300 mt-1">
                          In today's purchasing power
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No forecast data available</h3>
                <p className="text-muted-foreground mt-2">
                  Fill in your investment parameters and calculate a forecast first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
