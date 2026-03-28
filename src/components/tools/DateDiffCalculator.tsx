
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Calendar, Clock, Lightbulb } from "lucide-react";
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { useAgentContext } from '@/contexts/AgentContext';

export const DateDiffCalculator = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [difference, setDifference] = useState({
    days: 0,
    months: 0,
    years: 0,
    totalDays: 0
  });

  useEffect(() => {
    if (pendingParams?.toolId === 'date-diff') {
      const p = pendingParams.params;
      if (p.startDate !== undefined) setStartDate(p.startDate);
      if (p.endDate !== undefined) setEndDate(p.endDate);
      consumeParams();
    }
  }, [pendingParams]);

  useEffect(() => {
    if (startDate && endDate) {
      calculateDifference();
    }
  }, [startDate, endDate]);

  const calculateDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast({
        title: "Invalid date range",
        description: "Start date must be before end date",
        variant: "destructive"
      });
      return;
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const startDateCopy = new Date(start);
    startDateCopy.setFullYear(end.getFullYear());
    startDateCopy.setMonth(end.getMonth());
    
    if (start.getDate() > end.getDate()) {
      const daysInMonth = new Date(
        end.getFullYear(), 
        end.getMonth() + 1, 
        0
      ).getDate();
      
      const daysLeft = daysInMonth - start.getDate() + end.getDate();
      
      if (daysLeft >= daysInMonth) {
        months++;
        if (months === 12) {
          years++;
          months = 0;
        }
      }
    }
    
    const days = Math.abs(end.getDate() - start.getDate());
    
    setDifference({
      days,
      months,
      years,
      totalDays
    });
  };

  const handleToday = (field: 'start' | 'end') => {
    const today = new Date().toISOString().split('T')[0];
    if (field === 'start') {
      setStartDate(today);
    } else {
      setEndDate(today);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const quickActions = [
    {
      label: "1 Year from Today",
      action: () => {
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(nextYear.toISOString().split('T')[0]);
      }
    },
    {
      label: "1 Month from Today",
      action: () => {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(nextMonth.toISOString().split('T')[0]);
      }
    },
    {
      label: "1 Week from Today",
      action: () => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(nextWeek.toISOString().split('T')[0]);
      }
    },
    {
      label: "Days in Current Year",
      action: () => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        setStartDate(startOfYear.toISOString().split('T')[0]);
        setEndDate(endOfYear.toISOString().split('T')[0]);
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">Days Between Dates</h2>
        <p className="text-muted-foreground">
          Calculate the exact difference between two dates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Inputs */}
        <Card className="glass-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Start Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button variant="outline" onClick={() => handleToday('start')}>Today</Button>
              </div>
              {startDate && (
                <p className="text-xs text-muted-foreground">{formatDate(startDate)}</p>
              )}
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> End Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button variant="outline" onClick={() => handleToday('end')}>Today</Button>
              </div>
              {endDate && (
                <p className="text-xs text-muted-foreground">{formatDate(endDate)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {startDate && endDate && (
          <div className="space-y-4 animate-fade-in">
            <BigResultCard
              label="Total Days"
              value={difference.totalDays.toLocaleString()}
              subValue={`${Math.floor(difference.totalDays / 7)} weeks and ${difference.totalDays % 7} days`}
              icon={Calendar}
              variant="primary"
              size="large"
            />
            
            <div className="grid grid-cols-3 gap-3">
              <BigResultCard
                label="Years"
                value={difference.years.toString()}
                variant="default"
              />
              <BigResultCard
                label="Months"
                value={difference.months.toString()}
                variant="default"
              />
              <BigResultCard
                label="Days"
                value={difference.days.toString()}
                variant="default"
              />
            </div>

            <Card className="glass-card">
              <CardContent className="p-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Also equals to:</span>
                </div>
                <p className="text-sm">{(difference.totalDays * 24).toLocaleString()} hours</p>
                <p className="text-sm">{(difference.totalDays * 24 * 60).toLocaleString()} minutes</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Quick Calculations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button 
                key={action.label}
                variant="outline" 
                onClick={action.action}
                className="h-auto py-3"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tip */}
      <ProTip icon={Lightbulb} title="Did You Know?" variant="info">
        The average person lives about 27,375 days (75 years). Use this calculator to track milestones or plan ahead for important dates!
      </ProTip>
    </div>
  );
};
