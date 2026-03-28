
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Moon, Sun, Clock, Lightbulb, Bed, AlarmClock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { SliderInput } from "@/components/ui/slider-input";
import { useAgentContext } from '@/contexts/AgentContext';

export const SleepCycleCalculator = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [calculationType, setCalculationType] = useState('bedtime');
  const [wakeUpTime, setWakeUpTime] = useState<Date | null>(null);
  const [bedTime, setBedTime] = useState<Date | null>(null);
  const [fallAsleepTime, setFallAsleepTime] = useState(15);
  const [sleepCycles, setSleepCycles] = useState<Date[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const SLEEP_CYCLE_LENGTH = 90;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pendingParams?.toolId === 'sleep-calculator') {
      const p = pendingParams.params;
      if (p.calculationType !== undefined) setCalculationType(p.calculationType);
      if (p.fallAsleepMinutes !== undefined) setFallAsleepTime(p.fallAsleepMinutes);
      if (p.wakeUpTime) {
        const [h, m] = p.wakeUpTime.split(':').map(Number);
        const d = new Date(); d.setHours(h, m, 0, 0);
        setWakeUpTime(d);
      }
      if (p.bedTime) {
        const [h, m] = p.bedTime.split(':').map(Number);
        const d = new Date(); d.setHours(h, m, 0, 0);
        setBedTime(d);
      }
      consumeParams();
    }
  }, [pendingParams]);

  const calculateSleepCycles = () => {
    const cycles: Date[] = [];
    
    if (calculationType === 'bedtime' && wakeUpTime) {
      for (let i = 6; i > 0; i--) {
        const cycleTime = new Date(wakeUpTime);
        cycleTime.setMinutes(cycleTime.getMinutes() - (SLEEP_CYCLE_LENGTH * i) - fallAsleepTime);
        cycles.push(cycleTime);
      }
    } else if (calculationType === 'waketime' && bedTime) {
      for (let i = 4; i <= 6; i++) {
        const cycleTime = new Date(bedTime);
        cycleTime.setMinutes(cycleTime.getMinutes() + (SLEEP_CYCLE_LENGTH * i) + fallAsleepTime);
        cycles.push(cycleTime);
      }
    }
    
    setSleepCycles(cycles);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSetDefaultWakeTime = () => {
    const defaultWakeTime = new Date();
    defaultWakeTime.setHours(7, 0, 0, 0);
    if (defaultWakeTime < currentTime) {
      defaultWakeTime.setDate(defaultWakeTime.getDate() + 1);
    }
    setWakeUpTime(defaultWakeTime);
  };

  const handleSetDefaultBedTime = () => {
    const defaultBedTime = new Date();
    defaultBedTime.setHours(22, 0, 0, 0);
    if (defaultBedTime < currentTime) {
      defaultBedTime.setDate(defaultBedTime.getDate() + 1);
    }
    setBedTime(defaultBedTime);
  };

  const handleSetCurrentTime = (type: 'bed' | 'wake') => {
    if (type === 'bed') {
      setBedTime(new Date());
    } else {
      setWakeUpTime(new Date());
    }
  };

  const handleTimeChange = (time: string, type: 'bed' | 'wake') => {
    if (!time) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hours, minutes, 0, 0);
    
    if (newDate < currentTime) {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    if (type === 'bed') {
      setBedTime(newDate);
    } else {
      setWakeUpTime(newDate);
    }
  };

  const formatTimeForInput = (date: Date | null) => {
    if (!date) return '';
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if ((calculationType === 'bedtime' && wakeUpTime) || 
        (calculationType === 'waketime' && bedTime)) {
      calculateSleepCycles();
    }
  }, [calculationType, wakeUpTime, bedTime, fallAsleepTime]);

  useEffect(() => {
    if (calculationType === 'bedtime' && !wakeUpTime) {
      handleSetDefaultWakeTime();
    } else if (calculationType === 'waketime' && !bedTime) {
      handleSetDefaultBedTime();
    }
  }, [calculationType]);

  const getSleepQualityMessage = (cycleIndex: number): string => {
    if (calculationType === 'bedtime') {
      if (cycleIndex === 0) return "6 cycles • 9 hours";
      if (cycleIndex === 1) return "5 cycles • 7.5 hours";
      if (cycleIndex === 2) return "4 cycles • 6 hours";
      return `${6 - cycleIndex} cycles`;
    } else {
      if (cycleIndex === 0) return "4 cycles • 6 hours";
      if (cycleIndex === 1) return "5 cycles • 7.5 hours";
      if (cycleIndex === 2) return "6 cycles • 9 hours";
      return `${cycleIndex + 4} cycles`;
    }
  };

  const getRecommendedIndex = () => {
    return calculationType === 'bedtime' ? 1 : 1; // 5 cycles is recommended
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">Sleep Cycle Calculator</h2>
        <p className="text-muted-foreground">
          Plan your sleep schedule based on 90-minute cycles to wake up feeling refreshed.
        </p>
      </div>

      <Tabs value={calculationType} onValueChange={setCalculationType}>
        <TabsList className="grid grid-cols-2 w-full h-auto">
          <TabsTrigger value="bedtime" className="py-3">
            <Moon className="mr-2 h-4 w-4" />
            I want to wake up at...
          </TabsTrigger>
          <TabsTrigger value="waketime" className="py-3">
            <Sun className="mr-2 h-4 w-4" />
            I want to go to bed at...
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bedtime" className="mt-6 space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <AlarmClock className="h-4 w-4" /> Wake up time
                </label>
                <div className="flex gap-2">
                  <input 
                    type="time" 
                    value={formatTimeForInput(wakeUpTime)} 
                    onChange={(e) => handleTimeChange(e.target.value, 'wake')}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button variant="outline" onClick={() => handleSetCurrentTime('wake')}>Now</Button>
                </div>
              </div>
              
              <SliderInput
                label="Time to fall asleep"
                icon={Clock}
                value={fallAsleepTime}
                onChange={setFallAsleepTime}
                min={5}
                max={45}
                step={5}
                unit="min"
              />
            </CardContent>
          </Card>

          {sleepCycles.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Go to bed at one of these times:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sleepCycles.slice(0, 3).map((time, i) => (
                  <BigResultCard
                    key={i}
                    label={getSleepQualityMessage(i)}
                    value={formatTime(time)}
                    variant={i === getRecommendedIndex() ? 'success' : 'default'}
                    size={i === getRecommendedIndex() ? 'large' : 'default'}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="waketime" className="mt-6 space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bed className="h-4 w-4" /> Bedtime
                </label>
                <div className="flex gap-2">
                  <input 
                    type="time" 
                    value={formatTimeForInput(bedTime)} 
                    onChange={(e) => handleTimeChange(e.target.value, 'bed')}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button variant="outline" onClick={() => handleSetCurrentTime('bed')}>Now</Button>
                </div>
              </div>
              
              <SliderInput
                label="Time to fall asleep"
                icon={Clock}
                value={fallAsleepTime}
                onChange={setFallAsleepTime}
                min={5}
                max={45}
                step={5}
                unit="min"
              />
            </CardContent>
          </Card>

          {sleepCycles.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlarmClock className="h-5 w-5" />
                Wake up at one of these times:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sleepCycles.map((time, i) => (
                  <BigResultCard
                    key={i}
                    label={getSleepQualityMessage(i)}
                    value={formatTime(time)}
                    variant={i === getRecommendedIndex() ? 'success' : 'default'}
                    size={i === getRecommendedIndex() ? 'large' : 'default'}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pro Tip */}
      <ProTip icon={Lightbulb} title="Sleep Hygiene Tips" variant="info">
        For best results, maintain a consistent sleep schedule, avoid screens 1 hour before bed, 
        keep your room cool (60-67°F), and limit caffeine after 2 PM. Adults need 7-9 hours of sleep per night.
      </ProTip>
    </div>
  );
};
