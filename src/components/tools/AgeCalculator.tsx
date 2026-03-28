
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star, Cake, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { useAgentContext } from '@/contexts/AgentContext';

export const AgeCalculator = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState({ years: 0, months: 0, days: 0 });
  const [nextBirthday, setNextBirthday] = useState({ days: 0 });
  const [zodiacSign, setZodiacSign] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');

  useEffect(() => {
    if (pendingParams?.toolId === 'age-calculator') {
      const p = pendingParams.params;
      if (p.birthdate !== undefined) setBirthdate(p.birthdate);
      consumeParams();
    }
  }, [pendingParams]);

  useEffect(() => {
    if (birthdate) {
      calculateAge();
    }
  }, [birthdate]);

  const calculateAge = () => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setAge({ years, months, days });

    const nextBirthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthdayThisYear < today) {
      nextBirthdayThisYear.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setNextBirthday({ days: daysUntilBirthday });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setDayOfWeek(daysOfWeek[birthDate.getDay()]);

    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    let zodiac = '';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiac = 'Aries ♈';
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiac = 'Taurus ♉';
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiac = 'Gemini ♊';
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiac = 'Cancer ♋';
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiac = 'Leo ♌';
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiac = 'Virgo ♍';
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiac = 'Libra ♎';
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiac = 'Scorpio ♏';
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiac = 'Sagittarius ♐';
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiac = 'Capricorn ♑';
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiac = 'Aquarius ♒';
    else zodiac = 'Pisces ♓';
    
    setZodiacSign(zodiac);

    if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
      toast({
        title: "🎂 Happy Birthday!",
        description: "Today is your birthday! Have a great day!"
      });
    }
  };

  const getTotalDaysLived = () => {
    if (!birthdate) return 0;
    const birthDate = new Date(birthdate);
    const today = new Date();
    return Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getZodiacTip = () => {
    const sign = zodiacSign.split(' ')[0];
    const tips: Record<string, string> = {
      'Aries': 'Bold and ambitious, Aries dives headfirst into challenging situations.',
      'Taurus': 'Reliable and patient, Taurus enjoys the finer things in life.',
      'Gemini': 'Expressive and quick-witted, Gemini represents two personalities.',
      'Cancer': 'Intuitive and sentimental, Cancer is deeply connected to home and family.',
      'Leo': 'Creative and passionate, Leo loves to be in the spotlight.',
      'Virgo': 'Practical and analytical, Virgo pays attention to the smallest details.',
      'Libra': 'Diplomatic and gracious, Libra values harmony and balance.',
      'Scorpio': 'Resourceful and brave, Scorpio is a passionate and assertive sign.',
      'Sagittarius': 'Generous and idealistic, Sagittarius has a great sense of humor.',
      'Capricorn': 'Responsible and disciplined, Capricorn is the master of self-control.',
      'Aquarius': 'Progressive and original, Aquarius is a humanitarian at heart.',
      'Pisces': 'Compassionate and intuitive, Pisces is the most artistic sign.'
    };
    return tips[sign] || 'Discover the unique traits of your zodiac sign!';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">Age Calculator</h2>
        <p className="text-muted-foreground">Calculate your exact age and discover interesting facts about your birthdate.</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Date of Birth
            </label>
            <Input 
              type="date" 
              value={birthdate} 
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {birthdate && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Age Display */}
          <div className="grid grid-cols-3 gap-4">
            <BigResultCard
              label="Years"
              value={age.years.toString()}
              variant="primary"
              size="large"
            />
            <BigResultCard
              label="Months"
              value={age.months.toString()}
              variant="default"
            />
            <BigResultCard
              label="Days"
              value={age.days.toString()}
              variant="default"
            />
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BigResultCard
              label="Next Birthday"
              value={nextBirthday.days === 0 ? "Today! 🎉" : nextBirthday.days.toString()}
              subValue={nextBirthday.days === 0 ? "Happy Birthday!" : "days to go"}
              icon={Cake}
              variant={nextBirthday.days <= 7 ? "warning" : "default"}
            />
            <BigResultCard
              label="Zodiac Sign"
              value={zodiacSign}
              icon={Star}
              variant="info"
            />
            <BigResultCard
              label="Born On"
              value={dayOfWeek}
              icon={Clock}
              variant="default"
            />
          </div>

          {/* Total Days Lived */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Days Lived</p>
                <p className="text-4xl md:text-5xl font-black text-gradient-blue">
                  {getTotalDaysLived().toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  That's {Math.floor(getTotalDaysLived() * 24).toLocaleString()} hours of life experiences!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Zodiac Pro Tip */}
          <ProTip icon={Star} title={`${zodiacSign.split(' ')[0]} Traits`} variant="info">
            {getZodiacTip()}
          </ProTip>
        </div>
      )}
    </div>
  );
};
