
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Copy, Check, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatNumberToIndianWords, formatIndianNumber } from "@/utils/formatNumberToWords";
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { SliderInput } from "@/components/ui/slider-input";
import { PresetButtons } from "@/components/ui/preset-buttons";
import { Button } from "@/components/ui/button";
import { useAgentContext } from '@/contexts/AgentContext';

export function NumberToIndianFormat() {
  const { pendingParams, consumeParams } = useAgentContext();
  const [number, setNumber] = useState<number>(1000000);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (pendingParams?.toolId === 'indian-number-format') {
      const p = pendingParams.params;
      if (p.number !== undefined) setNumber(p.number);
      consumeParams();
    }
  }, [pendingParams]);

  const result = formatIndianNumber(number);
  const inWords = formatNumberToIndianWords(number);

  const copyToClipboard = () => {
    if (result) {
      const textToCopy = `₹${result} (${inWords})`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "Result copied successfully!",
        duration: 3000
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const presets = [
    { label: '₹1L', value: 100000 },
    { label: '₹10L', value: 1000000 },
    { label: '₹1Cr', value: 10000000 },
    { label: '₹10Cr', value: 100000000 },
    { label: '₹100Cr', value: 1000000000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gradient-purple">Indian Number Format</h2>
          <IndianRupee className="h-6 w-6 text-purple-500" />
        </div>
        <p className="text-muted-foreground">
          Convert numbers to Indian format with words (lakhs, crores) in real-time
        </p>
      </div>

      {/* Slider Input */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <SliderInput
            label="Enter Amount"
            icon={IndianRupee}
            value={number}
            onChange={setNumber}
            min={0}
            max={10000000000}
            step={100000}
            unit="₹"
            formatValue={(val) => `₹${formatIndianNumber(val)}`}
          />
          
          <PresetButtons
            options={presets}
            value={number}
            onChange={(val) => setNumber(val as number)}
          />
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BigResultCard
          label="In Digits"
          value={`₹${result}`}
          icon={IndianRupee}
          variant="primary"
          size="large"
        />
        <Card className="glass-card">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">In Words</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{inWords}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard} 
              className="mt-4 self-end"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Reference Card */}
      <Card className="glass-card bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Indian Number System Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">1,00,000</span>
                <span className="font-medium">One Lakh</span>
              </div>
              <div className="flex justify-between p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">10,00,000</span>
                <span className="font-medium">Ten Lakhs</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">1,00,00,000</span>
                <span className="font-medium">One Crore</span>
              </div>
              <div className="flex justify-between p-2 bg-background/50 rounded">
                <span className="text-muted-foreground">1,00,00,00,000</span>
                <span className="font-medium">One Hundred Crore</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProTip icon={Lightbulb} title="Did You Know?" variant="info">
        The Indian numbering system uses lakhs and crores, while the Western system uses millions and billions. 
        1 Crore = 10 Million, and 1 Lakh = 100 Thousand.
      </ProTip>
    </div>
  );
}
