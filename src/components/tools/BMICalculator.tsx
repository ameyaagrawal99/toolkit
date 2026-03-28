
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Scale, Heart, Target, Activity } from "lucide-react";
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { SliderInput } from "@/components/ui/slider-input";

export const BMICalculator = () => {
  const [unit, setUnit] = useState('metric');
  const [height, setHeight] = useState({ cm: '170', ft: '5', inch: '10' });
  const [weight, setWeight] = useState({ kg: '70', lb: '154' });
  const [bmi, setBmi] = useState(0);
  const [category, setCategory] = useState('');
  const [idealWeightRange, setIdealWeightRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    calculateBMI();
  }, [height, weight, unit]);

  const calculateBMI = () => {
    let calculatedBMI = 0;
    
    if (unit === 'metric') {
      const heightInM = parseFloat(height.cm) / 100;
      const weightInKg = parseFloat(weight.kg);
      
      if (heightInM > 0 && weightInKg > 0) {
        calculatedBMI = weightInKg / (heightInM * heightInM);
      }
    } else {
      const heightInInches = (parseFloat(height.ft) * 12) + parseFloat(height.inch);
      const weightInLbs = parseFloat(weight.lb);
      
      if (heightInInches > 0 && weightInLbs > 0) {
        calculatedBMI = (weightInLbs * 703) / (heightInInches * heightInInches);
      }
    }
    
    setBmi(parseFloat(calculatedBMI.toFixed(1)));
    
    let minWeight, maxWeight;
    
    if (unit === 'metric') {
      const heightInM = parseFloat(height.cm) / 100;
      minWeight = 18.5 * (heightInM * heightInM);
      maxWeight = 24.9 * (heightInM * heightInM);
    } else {
      const heightInInches = (parseFloat(height.ft) * 12) + parseFloat(height.inch);
      minWeight = (18.5 * (heightInInches * heightInInches)) / 703;
      maxWeight = (24.9 * (heightInInches * heightInInches)) / 703;
    }
    
    setIdealWeightRange({
      min: parseFloat(minWeight.toFixed(1)),
      max: parseFloat(maxWeight.toFixed(1))
    });
    
    if (calculatedBMI < 18.5) {
      setCategory('Underweight');
    } else if (calculatedBMI >= 18.5 && calculatedBMI < 25) {
      setCategory('Normal weight');
    } else if (calculatedBMI >= 25 && calculatedBMI < 30) {
      setCategory('Overweight');
    } else if (calculatedBMI >= 30 && calculatedBMI < 35) {
      setCategory('Obesity class I');
    } else if (calculatedBMI >= 35 && calculatedBMI < 40) {
      setCategory('Obesity class II');
    } else if (calculatedBMI >= 40) {
      setCategory('Obesity class III');
    } else {
      setCategory('');
    }
  };

  const getBMIVariant = (): 'success' | 'warning' | 'danger' | 'info' => {
    if (category === 'Normal weight') return 'success';
    if (category === 'Underweight') return 'info';
    if (category === 'Overweight') return 'warning';
    return 'danger';
  };

  const getProTip = () => {
    switch (category) {
      case 'Underweight':
        return {
          icon: Heart,
          title: 'Health Tip',
          text: 'Focus on nutrient-dense foods like nuts, avocados, and whole grains. Consider consulting a nutritionist for a personalized plan.',
          variant: 'info' as const
        };
      case 'Normal weight':
        return {
          icon: Activity,
          title: 'Great Job!',
          text: 'Maintain your healthy lifestyle with regular exercise (150+ minutes/week) and a balanced diet rich in fruits and vegetables.',
          variant: 'success' as const
        };
      case 'Overweight':
        return {
          icon: Target,
          title: 'Action Plan',
          text: 'Small changes add up! Try reducing portion sizes, walking 30 minutes daily, and cutting sugary drinks.',
          variant: 'warning' as const
        };
      default:
        return {
          icon: Heart,
          title: 'Consult a Professional',
          text: 'Consider speaking with a healthcare provider for personalized guidance on achieving a healthier weight safely.',
          variant: 'primary' as const
        };
    }
  };

  const getWeightDifference = () => {
    const currentWeight = unit === 'metric' ? parseFloat(weight.kg) : parseFloat(weight.lb);
    const unitLabel = unit === 'metric' ? 'kg' : 'lb';
    
    if (currentWeight > idealWeightRange.max) {
      return `${(currentWeight - idealWeightRange.max).toFixed(1)} ${unitLabel} to lose`;
    } else if (currentWeight < idealWeightRange.min) {
      return `${(idealWeightRange.min - currentWeight).toFixed(1)} ${unitLabel} to gain`;
    }
    return "Within ideal range";
  };

  const proTip = getProTip();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">BMI Calculator</h2>
        <p className="text-muted-foreground">Calculate your Body Mass Index and get personalized health insights.</p>
      </div>

      <Tabs defaultValue={unit} value={unit} onValueChange={setUnit}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="metric">Metric (cm/kg)</TabsTrigger>
          <TabsTrigger value="imperial">Imperial (ft/lb)</TabsTrigger>
        </TabsList>

        <TabsContent value="metric" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SliderInput
              label="Height"
              icon={Scale}
              value={parseFloat(height.cm) || 0}
              onChange={(val) => setHeight({ ...height, cm: val.toString() })}
              min={100}
              max={250}
              step={1}
              unit="cm"
            />
            <SliderInput
              label="Weight"
              icon={Scale}
              value={parseFloat(weight.kg) || 0}
              onChange={(val) => setWeight({ ...weight, kg: val.toString() })}
              min={30}
              max={200}
              step={0.5}
              unit="kg"
            />
          </div>
        </TabsContent>

        <TabsContent value="imperial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Height (ft)</label>
              <Input
                type="number"
                placeholder="Feet"
                value={height.ft}
                onChange={(e) => setHeight({ ...height, ft: e.target.value })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Height (in)</label>
              <Input
                type="number"
                placeholder="Inches"
                value={height.inch}
                onChange={(e) => setHeight({ ...height, inch: e.target.value })}
                min="0"
                max="11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (lb)</label>
              <Input
                type="number"
                placeholder="Weight in pounds"
                value={weight.lb}
                onChange={(e) => setWeight({ ...weight, lb: e.target.value })}
                min="0"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {bmi > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BigResultCard
              label="Your BMI"
              value={bmi.toFixed(1)}
              subValue={category}
              icon={Scale}
              variant={getBMIVariant()}
              size="large"
            />
            <BigResultCard
              label="Ideal Weight Range"
              value={`${idealWeightRange.min} - ${idealWeightRange.max}`}
              subValue={`${unit === 'metric' ? 'kg' : 'lb'} • ${getWeightDifference()}`}
              icon={Target}
              variant="default"
            />
          </div>

          {/* BMI Scale Visualization */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">BMI Scale</h3>
                <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (bmi / 40) * 100)}%`,
                      background: `linear-gradient(to right, 
                        hsl(210, 100%, 50%) 0%, 
                        hsl(210, 100%, 50%) ${(18.5 / 40) * 100}%, 
                        hsl(142, 76%, 36%) ${(18.5 / 40) * 100}%, 
                        hsl(142, 76%, 36%) ${(25 / 40) * 100}%, 
                        hsl(48, 96%, 53%) ${(25 / 40) * 100}%, 
                        hsl(48, 96%, 53%) ${(30 / 40) * 100}%, 
                        hsl(25, 95%, 53%) ${(30 / 40) * 100}%, 
                        hsl(25, 95%, 53%) ${(35 / 40) * 100}%, 
                        hsl(0, 84%, 60%) ${(35 / 40) * 100}%, 
                        hsl(0, 84%, 60%) 100%)`
                    }}
                  />
                  {/* BMI Marker */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-foreground rounded-full shadow-lg transition-all duration-500"
                    style={{ left: `calc(${Math.min(100, (bmi / 40) * 100)}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tip */}
          <ProTip icon={proTip.icon} title={proTip.title} variant={proTip.variant}>
            {proTip.text}
          </ProTip>
        </div>
      )}
    </div>
  );
};
