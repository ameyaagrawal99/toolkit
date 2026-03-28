import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Percent, Calculator, TrendingUp, Info, IndianRupee, Calendar, Lightbulb, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { formatNumberToIndianWords, formatIndianRupees } from '@/utils/formatNumberToWords';
import { SliderInput } from '@/components/ui/slider-input';
import { BigResultCard } from '@/components/ui/big-result-card';
import { ProTip } from '@/components/ui/pro-tip';
import { PresetButtons } from '@/components/ui/preset-buttons';
import { Label } from '@/components/ui/label';
import { useAgentContext } from '@/contexts/AgentContext';

interface YearlyBreakdown {
  year: number;
  principal: number;
  simpleInterest: number;
  simpleTotal: number;
  compoundInterest: number;
  compoundTotal: number;
}

const principalPresets = [
  { label: '10K', value: 10000 },
  { label: '1 Lakh', value: 100000 },
  { label: '5 Lakh', value: 500000 },
  { label: '10 Lakh', value: 1000000 },
  { label: '50 Lakh', value: 5000000 },
  { label: '1 Crore', value: 10000000 },
];

const ratePresets = [
  { label: '6%', value: 6 },
  { label: '8%', value: 8 },
  { label: '10%', value: 10 },
  { label: '12%', value: 12 },
  { label: '15%', value: 15 },
];

const timePresets = [
  { label: '1Y', value: 1 },
  { label: '3Y', value: 3 },
  { label: '5Y', value: 5 },
  { label: '10Y', value: 10 },
  { label: '15Y', value: 15 },
  { label: '20Y', value: 20 },
];

const formatLargeNumber = (value: number): string => {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)} K`;
  return value.toString();
};

export const InterestCalculator = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  // Simple Interest State
  const [siPrincipal, setSiPrincipal] = useState<number>(100000);
  const [siRate, setSiRate] = useState<number>(10);
  const [siTime, setSiTime] = useState<number>(5);
  const [siTimeUnit, setSiTimeUnit] = useState<string>("years");
  const [activeTab, setActiveTab] = useState<string>("simple");

  // Compound Interest State
  const [ciPrincipal, setCiPrincipal] = useState<number>(100000);
  const [ciRate, setCiRate] = useState<number>(10);
  const [ciTime, setCiTime] = useState<number>(5);
  const [ciFrequency, setCiFrequency] = useState<string>("12");

  // Results
  const [siResult, setSiResult] = useState({ interest: 0, total: 0 });
  const [ciResult, setCiResult] = useState({ interest: 0, total: 0, extraEarnings: 0 });
  const [yearlyData, setYearlyData] = useState<YearlyBreakdown[]>([]);

  useEffect(() => {
    if (pendingParams?.toolId === 'interest-calculator') {
      const p = pendingParams.params;
      const isCompound = p.type === 'compound';
      if (isCompound) {
        if (p.principal !== undefined) setCiPrincipal(p.principal);
        if (p.rate !== undefined) setCiRate(p.rate);
        if (p.time !== undefined) setCiTime(p.time);
        if (p.frequency !== undefined) setCiFrequency(p.frequency);
        setActiveTab('compound');
      } else {
        if (p.principal !== undefined) setSiPrincipal(p.principal);
        if (p.rate !== undefined) setSiRate(p.rate);
        if (p.time !== undefined) setSiTime(p.time);
        setActiveTab('simple');
      }
      consumeParams();
    }
  }, [pendingParams]);

  // Calculate Simple Interest
  useEffect(() => {
    const p = siPrincipal || 0;
    const r = siRate || 0;
    let t = siTime || 0;
    
    if (siTimeUnit === "months") {
      t = t / 12;
    }
    
    const interest = (p * r * t) / 100;
    const total = p + interest;
    
    setSiResult({ interest, total });
  }, [siPrincipal, siRate, siTime, siTimeUnit]);

  // Calculate Compound Interest
  useEffect(() => {
    const p = ciPrincipal || 0;
    const r = ciRate || 0;
    const t = ciTime || 0;
    const n = parseFloat(ciFrequency) || 1;
    
    const rateDecimal = r / 100;
    const total = p * Math.pow((1 + rateDecimal / n), n * t);
    const interest = total - p;
    
    const simpleInterest = (p * r * t) / 100;
    const extraEarnings = interest - simpleInterest;
    
    setCiResult({ interest, total, extraEarnings });
    
    const breakdown: YearlyBreakdown[] = [];
    for (let year = 0; year <= t; year++) {
      const ciTotal = p * Math.pow((1 + rateDecimal / n), n * year);
      const siTotal = p + (p * r * year) / 100;
      breakdown.push({
        year,
        principal: p,
        simpleInterest: siTotal - p,
        simpleTotal: siTotal,
        compoundInterest: ciTotal - p,
        compoundTotal: ciTotal,
      });
    }
    setYearlyData(breakdown);
  }, [ciPrincipal, ciRate, ciTime, ciFrequency]);

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      "1": "Annually",
      "2": "Semi-Annually",
      "4": "Quarterly",
      "12": "Monthly",
      "365": "Daily",
    };
    return labels[freq] || freq;
  };

  const getProTip = () => {
    const freq = parseInt(ciFrequency);
    if (freq === 1 && ciTime > 3) {
      return {
        title: "Pro Tip",
        message: "Monthly compounding could earn you significantly more over this period! Consider switching to a monthly compounding option.",
        variant: "primary" as const
      };
    }
    if (ciPrincipal >= 1000000) {
      return {
        title: "Smart Investing",
        message: "For large investments like yours, consider tax-saving options like PPF (7.1% tax-free) or ELSS (market-linked with 80C benefits).",
        variant: "success" as const
      };
    }
    if (ciRate > 12) {
      return {
        title: "High Returns Alert",
        message: "Returns above 12% typically involve higher risk. Ensure you understand the investment risks involved.",
        variant: "warning" as const
      };
    }
    return {
      title: "Did You Know?",
      message: "The power of compounding increases exponentially with time. Even small increases in investment duration can lead to significantly larger returns.",
      variant: "info" as const
    };
  };

  const proTip = getProTip();

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-14 rounded-2xl p-1.5 bg-secondary/50 backdrop-blur-sm">
          <TabsTrigger 
            value="simple" 
            className="rounded-xl text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Simple Interest
          </TabsTrigger>
          <TabsTrigger 
            value="compound" 
            className="rounded-xl text-base font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Compound Interest
          </TabsTrigger>
        </TabsList>

        {/* Simple Interest Tab */}
        <TabsContent value="simple" className="space-y-6">
          <Card className="modern-card p-6 md:p-8">
            <div className="space-y-8">
              <SliderInput
                label="Principal Amount"
                icon={IndianRupee}
                value={siPrincipal}
                onChange={setSiPrincipal}
                min={1000}
                max={10000000}
                step={1000}
                unit="₹"
                unitPosition="prefix"
                formatValue={formatLargeNumber}
                presets={principalPresets}
                helperText={formatNumberToIndianWords(siPrincipal)}
              />

              <SliderInput
                label="Interest Rate"
                icon={Percent}
                value={siRate}
                onChange={setSiRate}
                min={1}
                max={30}
                step={0.5}
                unit="%"
                unitPosition="suffix"
                presets={ratePresets}
              />

              <div className="space-y-4">
                <SliderInput
                  label="Time Period"
                  icon={Calendar}
                  value={siTime}
                  onChange={setSiTime}
                  min={1}
                  max={siTimeUnit === "years" ? 30 : 360}
                  step={1}
                  unit={siTimeUnit === "years" ? "yrs" : "mo"}
                  unitPosition="suffix"
                  showInput={false}
                />
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Unit:</Label>
                  <Select value={siTimeUnit} onValueChange={setSiTimeUnit}>
                    <SelectTrigger className="w-32 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Simple Interest Results */}
          <div className="grid gap-4 sm:grid-cols-2">
            <BigResultCard
              label="Interest Earned"
              value={formatIndianRupees(siResult.interest, false)}
              subValue={formatNumberToIndianWords(siResult.interest)}
              variant="success"
              size="large"
            />
            <BigResultCard
              label="Total Amount"
              value={formatIndianRupees(siResult.total, false)}
              subValue={formatNumberToIndianWords(siResult.total)}
              variant="info"
              size="large"
            />
          </div>

          {/* Formula Section */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Info className="h-4 w-4 text-primary" />
                How Simple Interest Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-primary/5 rounded-xl">
                <p className="text-center font-mono text-lg font-black text-primary">
                  SI = (P × R × T) / 100
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-primary">P</p>
                  <p className="text-muted-foreground font-medium">Principal</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">R</p>
                  <p className="text-muted-foreground font-medium">Rate (%)</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">T</p>
                  <p className="text-muted-foreground font-medium">Time (years)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compound Interest Tab */}
        <TabsContent value="compound" className="space-y-6">
          <Card className="modern-card p-6 md:p-8">
            <div className="space-y-8">
              <SliderInput
                label="Principal Amount"
                icon={IndianRupee}
                value={ciPrincipal}
                onChange={setCiPrincipal}
                min={1000}
                max={10000000}
                step={1000}
                unit="₹"
                unitPosition="prefix"
                formatValue={formatLargeNumber}
                presets={principalPresets}
                helperText={formatNumberToIndianWords(ciPrincipal)}
              />

              <SliderInput
                label="Interest Rate"
                icon={Percent}
                value={ciRate}
                onChange={setCiRate}
                min={1}
                max={30}
                step={0.5}
                unit="%"
                unitPosition="suffix"
                presets={ratePresets}
              />

              <SliderInput
                label="Investment Period"
                icon={Calendar}
                value={ciTime}
                onChange={setCiTime}
                min={1}
                max={30}
                step={1}
                unit="yrs"
                unitPosition="suffix"
                presets={timePresets}
              />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Compounding Frequency
                </Label>
                <Select value={ciFrequency} onValueChange={setCiFrequency}>
                  <SelectTrigger className="h-12 text-base font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Annually (n=1)</SelectItem>
                    <SelectItem value="2">Semi-Annually (n=2)</SelectItem>
                    <SelectItem value="4">Quarterly (n=4)</SelectItem>
                    <SelectItem value="12">Monthly (n=12)</SelectItem>
                    <SelectItem value="365">Daily (n=365)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Currently: {getFrequencyLabel(ciFrequency)} compounding
                </p>
              </div>
            </div>
          </Card>

          {/* Pro Tip */}
          <ProTip 
            icon={Lightbulb} 
            title={proTip.title} 
            variant={proTip.variant}
          >
            {proTip.message}
          </ProTip>

          {/* Compound Interest Results */}
          <div className="grid gap-4 sm:grid-cols-3">
            <BigResultCard
              label="Interest Earned"
              value={formatIndianRupees(ciResult.interest, false)}
              subValue={formatNumberToIndianWords(ciResult.interest)}
              variant="primary"
            />
            <BigResultCard
              label="Maturity Amount"
              value={formatIndianRupees(ciResult.total, false)}
              subValue={formatNumberToIndianWords(ciResult.total)}
              variant="info"
            />
            <BigResultCard
              label="Extra vs Simple"
              value={`+${formatIndianRupees(ciResult.extraEarnings, false)}`}
              subValue="Compounding benefit"
              variant="success"
              trend="up"
              trendValue={`${((ciResult.extraEarnings / (ciResult.interest - ciResult.extraEarnings || 1)) * 100).toFixed(1)}% more`}
            />
          </div>

          {/* Growth Chart */}
          {yearlyData.length > 1 && (
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-base font-bold">Growth Comparison: SI vs CI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyData}>
                      <defs>
                        <linearGradient id="colorCI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="year" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`₹${formatIndianRupees(value)}`, '']}
                        labelFormatter={(label) => `Year ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="compoundTotal" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fill="url(#colorCI)"
                        name="Compound Interest"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="simpleTotal" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fill="url(#colorSI)"
                        name="Simple Interest"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Year-wise Breakdown Table */}
          {yearlyData.length > 1 && (
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-base font-bold">Year-wise Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-bold">Year</th>
                        <th className="text-right py-3 px-2 font-bold">CI Total</th>
                        <th className="text-right py-3 px-2 font-bold">SI Total</th>
                        <th className="text-right py-3 px-2 font-bold">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((row, index) => (
                        <tr key={row.year} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="py-2 px-2 font-semibold">{row.year}</td>
                          <td className="py-2 px-2 text-right font-mono text-violet-600 dark:text-violet-400">
                            ₹{formatIndianRupees(row.compoundTotal)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400">
                            ₹{formatIndianRupees(row.simpleTotal)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-primary font-bold">
                            +₹{formatIndianRupees(row.compoundTotal - row.simpleTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formula Section */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Info className="h-4 w-4 text-primary" />
                How Compound Interest Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-primary/5 rounded-xl">
                <p className="text-center font-mono text-lg font-black text-primary">
                  A = P(1 + r/n)^(nt)
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-primary">P</p>
                  <p className="text-muted-foreground font-medium">Principal</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">r</p>
                  <p className="text-muted-foreground font-medium">Rate (decimal)</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">n</p>
                  <p className="text-muted-foreground font-medium">Frequency</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">t</p>
                  <p className="text-muted-foreground font-medium">Time (years)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
