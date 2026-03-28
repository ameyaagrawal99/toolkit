import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Percent, IndianRupee, Plus, Trash2, Lightbulb, Tag, ShoppingBag } from "lucide-react";
import { SliderInput } from '@/components/ui/slider-input';
import { BigResultCard } from '@/components/ui/big-result-card';
import { ProTip } from '@/components/ui/pro-tip';

interface Discount {
  id: number;
  type: 'percentage' | 'amount';
  value: number;
}

const pricePresets = [
  { label: '₹500', value: 500 },
  { label: '₹1,000', value: 1000 },
  { label: '₹2,500', value: 2500 },
  { label: '₹5,000', value: 5000 },
  { label: '₹10,000', value: 10000 },
];

export const DiscountCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState<number>(1000);
  const [discounts, setDiscounts] = useState<Discount[]>([
    { id: 1, type: 'percentage', value: 20 }
  ]);
  const [nextId, setNextId] = useState(2);

  const addDiscount = () => {
    setDiscounts([...discounts, { id: nextId, type: 'percentage', value: 10 }]);
    setNextId(nextId + 1);
  };

  const removeDiscount = (id: number) => {
    if (discounts.length > 1) {
      setDiscounts(discounts.filter(d => d.id !== id));
    }
  };

  const updateDiscount = (id: number, field: 'type' | 'value', value: any) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const calculateFinalPrice = () => {
    let price = originalPrice || 0;
    const steps = [{ stage: 'Original Price', price, discount: 0 }];

    discounts.forEach((discount, index) => {
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (price * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
      price = Math.max(0, price - discountAmount);
      steps.push({
        stage: `After Discount ${index + 1}`,
        price,
        discount: discountAmount
      });
    });

    return { finalPrice: price, steps };
  };

  const result = calculateFinalPrice();
  const totalSavings = (originalPrice || 0) - result.finalPrice;
  const savingsPercentage = originalPrice ? ((totalSavings / originalPrice) * 100).toFixed(1) : '0';

  const getProTip = () => {
    if (discounts.length >= 2) {
      return {
        title: "Stacking Tip",
        message: "When stacking discounts, percentage discounts applied first on higher amounts give better results. Try reordering your discounts!",
        variant: "primary" as const
      };
    }
    if (parseFloat(savingsPercentage) > 50) {
      return {
        title: "Great Deal!",
        message: "You're saving more than 50%! This is an excellent discount. Make sure the original price is accurate for realistic savings.",
        variant: "success" as const
      };
    }
    return {
      title: "Pro Tip",
      message: "Add multiple discounts to see how stacking coupons, cashback, and offers can maximize your savings!",
      variant: "info" as const
    };
  };

  const proTip = getProTip();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Discount Calculator
        </h2>
        <p className="text-muted-foreground">Calculate final prices with single or multiple discounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="modern-card p-6">
            <div className="space-y-6">
              <SliderInput
                label="Original Price"
                icon={IndianRupee}
                value={originalPrice}
                onChange={setOriginalPrice}
                min={100}
                max={100000}
                step={100}
                unit="₹"
                unitPosition="prefix"
                presets={pricePresets}
              />
            </div>
          </Card>

          <Card className="modern-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-bold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Discounts
              </Label>
              <Button 
                onClick={addDiscount} 
                size="sm" 
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-4">
              {discounts.map((discount, index) => (
                <Card key={discount.id} className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-amber-700 dark:text-amber-400">
                        Discount {index + 1}
                      </Label>
                      {discounts.length > 1 && (
                        <Button
                          onClick={() => removeDiscount(discount.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <Tabs 
                      value={discount.type} 
                      onValueChange={(value) => updateDiscount(discount.id, 'type', value as 'percentage' | 'amount')}
                    >
                      <TabsList className="grid w-full grid-cols-2 h-10">
                        <TabsTrigger value="percentage" className="text-sm font-semibold">
                          <Percent className="h-3 w-3 mr-1" />
                          Percentage
                        </TabsTrigger>
                        <TabsTrigger value="amount" className="text-sm font-semibold">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          Fixed
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="relative">
                      <Input
                        type="number"
                        value={discount.value}
                        onChange={(e) => updateDiscount(discount.id, 'value', parseFloat(e.target.value) || 0)}
                        className="pr-10 h-12 text-lg font-semibold"
                        placeholder={discount.type === 'percentage' ? 'Enter %' : 'Enter ₹'}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {discount.type === 'percentage' ? <Percent className="h-5 w-5" /> : <IndianRupee className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Main Result */}
          <BigResultCard
            label="Final Price"
            value={`₹${result.finalPrice.toFixed(2)}`}
            variant="success"
            size="large"
            icon={ShoppingBag}
          />

          <div className="grid grid-cols-2 gap-4">
            <BigResultCard
              label="You Save"
              value={`₹${totalSavings.toFixed(2)}`}
              subValue={`${savingsPercentage}% OFF`}
              variant="danger"
              trend="down"
              trendValue="Price dropped"
            />
            <BigResultCard
              label="Original"
              value={`₹${originalPrice.toFixed(2)}`}
              subValue="Base price"
              variant="default"
            />
          </div>

          {/* Pro Tip */}
          <ProTip icon={Lightbulb} title={proTip.title} variant={proTip.variant}>
            {proTip.message}
          </ProTip>

          {/* Breakdown */}
          <Card className="glass-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      index === result.steps.length - 1 
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/20 font-bold' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <span className="text-sm font-medium">{step.stage}</span>
                    <div className="text-right">
                      <p className="font-mono font-bold">₹{step.price.toFixed(2)}</p>
                      {step.discount > 0 && (
                        <p className="text-xs text-red-600 font-semibold">-₹{step.discount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
