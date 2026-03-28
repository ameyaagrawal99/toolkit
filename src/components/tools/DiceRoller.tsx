import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Dices, Coins, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAgentContext } from '@/contexts/AgentContext';

export const DiceRoller = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [diceType, setDiceType] = useState<'coin' | 'd6' | 'd20'>('coin');
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingParams?.toolId === 'dice-roller') {
      const p = pendingParams.params;
      if (p.diceType !== undefined) setDiceType(p.diceType);
      consumeParams();
    }
  }, [pendingParams]);

  const rollDice = () => {
    if (rolling) return;
    
    setRolling(true);
    
    // Play animation through multiple values
    const animationDuration = 1500;
    const updateInterval = 100;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Generate random results during animation
      if (progress < 1) {
        if (diceType === 'coin') {
          setResult(Math.floor(Math.random() * 2) + 1);
        } else if (diceType === 'd6') {
          setResult(Math.floor(Math.random() * 6) + 1);
        } else if (diceType === 'd20') {
          setResult(Math.floor(Math.random() * 20) + 1);
        }
        
        setTimeout(animate, updateInterval);
      } else {
        // Final result
        const finalResult = diceType === 'coin' 
          ? Math.floor(Math.random() * 2) + 1
          : diceType === 'd6'
            ? Math.floor(Math.random() * 6) + 1
            : Math.floor(Math.random() * 20) + 1;
            
        setResult(finalResult);
        setRolling(false);
        
        // Create vibration if supported
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Show toast for special results
        if (diceType === 'd20' && finalResult === 20) {
          toast({
            title: "Critical Hit! 🎯",
            description: "You rolled a natural 20!",
          });
        } else if (diceType === 'd20' && finalResult === 1) {
          toast({
            title: "Critical Miss! 😱",
            description: "You rolled a natural 1!",
          });
        }
      }
    };
    
    animate();
    
    // Simple sound effect (if supported)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(0.2);
    } catch (e) {
      console.log('Audio not supported');
    }
  };
  
  const getDiceIcon = () => {
    if (diceType === 'coin') {
      return <Coins className="w-20 h-20" />;
    } else if (diceType === 'd6') {
      switch (result) {
        case 1: return <Dice1 className="w-20 h-20" />;
        case 2: return <Dice2 className="w-20 h-20" />;
        case 3: return <Dice3 className="w-20 h-20" />;
        case 4: return <Dice4 className="w-20 h-20" />;
        case 5: return <Dice5 className="w-20 h-20" />;
        case 6: return <Dice6 className="w-20 h-20" />;
        default: return <Dices className="w-20 h-20" />;
      }
    } else {
      return <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
        {result || 'D20'}
      </div>;
    }
  };
  
  const getResultText = () => {
    if (result === null) return '';
    
    if (diceType === 'coin') {
      return result === 1 ? 'Heads' : 'Tails';
    } else {
      return result.toString();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Decision Maker</h2>
        <p className="text-gray-500 dark:text-gray-400">Toss a coin or roll dice to make decisions.</p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button 
          onClick={() => setDiceType('coin')}
          variant={diceType === 'coin' ? 'default' : 'outline'}
          className={diceType === 'coin' ? 'animate-pulse-soft' : ''}
        >
          <Coins className="mr-2 h-4 w-4" />
          Coin
        </Button>
        <Button 
          onClick={() => setDiceType('d6')}
          variant={diceType === 'd6' ? 'default' : 'outline'}
          className={diceType === 'd6' ? 'animate-pulse-soft' : ''}
        >
          <Dices className="mr-2 h-4 w-4" />
          D6
        </Button>
        <Button 
          onClick={() => setDiceType('d20')}
          variant={diceType === 'd20' ? 'default' : 'outline'}
          className={diceType === 'd20' ? 'animate-pulse-soft' : ''}
        >
          <Dices className="mr-2 h-4 w-4" />
          D20
        </Button>
      </div>

      <div className="flex justify-center">
        <Card className="overflow-hidden w-full max-w-md glass-card">
          <CardContent className="p-8">
            <div 
              ref={containerRef}
              className={`flex flex-col items-center justify-center space-y-6 transition-all ${
                rolling ? 'animate-[pulse_0.3s_ease-in-out_infinite]' : 'animate-float'
              }`}
            >
              <div className={`transition-transform duration-300 ${rolling ? 'animate-[spin_0.3s_ease-in-out_infinite]' : ''}`}>
                {getDiceIcon()}
              </div>
              
              {result !== null && (
                <div className="text-center animate-fade-in">
                  <p className="text-4xl font-bold">{getResultText()}</p>
                  {diceType === 'd20' && (
                    <p className={`text-sm mt-1 ${
                      result === 20 ? 'text-green-500' : 
                      result === 1 ? 'text-red-500' : ''
                    }`}>
                      {result === 20 ? 'Critical Success!' : 
                       result === 1 ? 'Critical Failure!' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={rollDice}
          disabled={rolling}
          size="lg"
          className={`relative overflow-hidden hover-scale ${
            rolling ? 'animate-pulse' : ''
          }`}
        >
          <span className="mr-2">{rolling ? 'Rolling...' : diceType === 'coin' ? 'Toss Coin' : `Roll ${diceType.toUpperCase()}`}</span>
          <Dices className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Need to make a decision? Let chance decide for you!</p>
      </div>
    </div>
  );
};
