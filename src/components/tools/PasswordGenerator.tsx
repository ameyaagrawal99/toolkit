
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Copy, Check, RefreshCw, Shield, Key, Lightbulb } from 'lucide-react';
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { SliderInput } from "@/components/ui/slider-input";
import { PresetButtons } from "@/components/ui/preset-buttons";
import { useAgentContext } from '@/contexts/AgentContext';

export const PasswordGenerator = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [password, setPassword] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [autoDestruct, setAutoDestruct] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    strength += Math.min(password.length / 2, 5);
    if (/[A-Z]/.test(password)) strength += 2;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 2;
    if (/[^A-Za-z0-9]/.test(password)) strength += 3;
    const uniqueChars = new Set(password).size;
    strength += uniqueChars / password.length * 3;
    
    setPasswordStrength(Math.min(Math.round(strength), 10));
  }, [password]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoDestruct && password) {
      timer = setTimeout(() => {
        setPassword('');
        toast({
          title: "Password auto-destructed! 💥",
          description: "Your secure password has been cleared from memory.",
        });
      }, 10000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoDestruct, password]);

  useEffect(() => {
    if (pendingParams?.toolId === 'password-generator') {
      const p = pendingParams.params;
      if (p.length !== undefined) setPasswordLength(p.length);
      if (p.uppercase !== undefined) setIncludeUppercase(p.uppercase);
      if (p.numbers !== undefined) setIncludeNumbers(p.numbers);
      if (p.symbols !== undefined) setIncludeSymbols(p.symbols);
      consumeParams();
    }
  }, [pendingParams]);

  const generatePassword = () => {
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let validChars = lowerChars;
    if (includeUppercase) validChars += upperChars;
    if (includeNumbers) validChars += numbers;
    if (includeSymbols) validChars += symbols;
    
    if (validChars === lowerChars) {
      toast({
        title: "Warning",
        description: "You should include more character types for a stronger password!",
        variant: "destructive",
      });
    }
    
    let newPassword = '';
    const randomArray = new Uint8Array(passwordLength);
    window.crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < passwordLength; i++) {
      newPassword += validChars[randomArray[i] % validChars.length];
    }
    
    setPassword(newPassword);
    setCopied(false);
  };
  
  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your secure password is ready to use.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getStrengthVariant = (): 'success' | 'warning' | 'danger' => {
    if (passwordStrength >= 8) return 'success';
    if (passwordStrength >= 5) return 'warning';
    return 'danger';
  };
  
  const getStrengthLabel = () => {
    if (passwordStrength >= 8) return "Strong 💪";
    if (passwordStrength >= 5) return "Medium ⚠️";
    return "Weak ❌";
  };

  const getProTip = () => {
    if (passwordLength < 12) {
      return "Passwords under 12 characters can be cracked in hours. Aim for 16+ characters for maximum security.";
    }
    if (!includeSymbols) {
      return "Adding special characters (!@#$%) exponentially increases password strength against brute-force attacks.";
    }
    if (passwordStrength >= 8) {
      return "This password would take centuries to crack! Consider using a password manager to store it securely.";
    }
    return "Mix uppercase, lowercase, numbers, and symbols for the strongest passwords.";
  };

  const lengthPresets = [
    { label: '8', value: 8 },
    { label: '12', value: 12 },
    { label: '16', value: 16 },
    { label: '24', value: 24 },
    { label: '32', value: 32 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">Password Generator</h2>
        <p className="text-muted-foreground">Create strong, secure passwords with custom options.</p>
      </div>

      <div className="space-y-6">
        {/* Password Display */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-6">
            <div className="relative">
              <Input
                type="text"
                value={password}
                readOnly
                className="pr-12 text-lg font-mono h-14 text-center"
                placeholder="Click generate to create a password"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={copyToClipboard}
                disabled={!password}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {copied ? <Check className="text-green-500" /> : <Copy />}
              </Button>
            </div>
            
            {autoDestruct && password && (
              <div className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400 animate-pulse font-medium">
                🔥 Password will auto-destruct in 10 seconds!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strength Display */}
        {password && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <BigResultCard
              label="Password Strength"
              value={getStrengthLabel()}
              subValue={`${passwordStrength * 10}% security score`}
              icon={Shield}
              variant={getStrengthVariant()}
            />
            <BigResultCard
              label="Password Length"
              value={password.length.toString()}
              subValue="characters"
              icon={Key}
              variant="default"
            />
          </div>
        )}

        {/* Length Slider */}
        <div className="space-y-4">
          <SliderInput
            label="Password Length"
            icon={Key}
            value={passwordLength}
            onChange={setPasswordLength}
            min={4}
            max={64}
            step={1}
            unit="chars"
          />
          <PresetButtons
            options={lengthPresets}
            value={passwordLength}
            onChange={(val) => setPasswordLength(val as number)}
          />
        </div>
        
        {/* Options */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Character Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
                <Switch 
                  id="uppercase" 
                  checked={includeUppercase}
                  onCheckedChange={setIncludeUppercase}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
                <Switch 
                  id="numbers" 
                  checked={includeNumbers}
                  onCheckedChange={setIncludeNumbers}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$)</Label>
                <Switch 
                  id="symbols" 
                  checked={includeSymbols}
                  onCheckedChange={setIncludeSymbols}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Label htmlFor="auto-destruct" className="cursor-pointer text-amber-700 dark:text-amber-400">
                  Auto-destruct (10s)
                </Label>
                <Switch 
                  id="auto-destruct" 
                  checked={autoDestruct}
                  onCheckedChange={setAutoDestruct}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button 
            onClick={generatePassword}
            className="relative overflow-hidden group px-8 py-6 text-lg"
            size="lg"
          >
            <span className="mr-2">Generate Password</span>
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </div>

        {/* Pro Tip */}
        <ProTip icon={Lightbulb} title="Security Tip" variant="info">
          {getProTip()}
        </ProTip>
      </div>
    </div>
  );
};
