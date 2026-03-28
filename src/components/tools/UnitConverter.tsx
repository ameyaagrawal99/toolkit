
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Copy, ArrowLeftRight } from "lucide-react";
import { useAgentContext } from '@/contexts/AgentContext';

export const UnitConverter = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('feet');
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');
  const [inputSearch, setInputSearch] = useState('');
  
  const categories = [
    { id: 'length', name: 'Length' },
    { id: 'area', name: 'Area' },
    { id: 'volume', name: 'Volume' },
    { id: 'mass', name: 'Mass' },
    { id: 'temperature', name: 'Temperature' },
    { id: 'time', name: 'Time' },
    { id: 'speed', name: 'Speed' },
    { id: 'currency', name: 'Currency' }
  ];

  const units = {
    length: [
      { id: 'nanometer', name: 'Nanometer (nm)' },
      { id: 'micrometer', name: 'Micrometer (μm)' },
      { id: 'millimeter', name: 'Millimeter (mm)' },
      { id: 'centimeter', name: 'Centimeter (cm)' },
      { id: 'meter', name: 'Meter (m)' },
      { id: 'kilometer', name: 'Kilometer (km)' },
      { id: 'inch', name: 'Inch (in)' },
      { id: 'feet', name: 'Feet (ft)' },
      { id: 'yard', name: 'Yard (yd)' },
      { id: 'mile', name: 'Mile (mi)' },
      { id: 'nautical_mile', name: 'Nautical Mile (nmi)' }
    ],
    area: [
      { id: 'sq_millimeter', name: 'Square Millimeter (mm²)' },
      { id: 'sq_centimeter', name: 'Square Centimeter (cm²)' },
      { id: 'sq_meter', name: 'Square Meter (m²)' },
      { id: 'hectare', name: 'Hectare (ha)' },
      { id: 'sq_kilometer', name: 'Square Kilometer (km²)' },
      { id: 'sq_inch', name: 'Square Inch (in²)' },
      { id: 'sq_feet', name: 'Square Feet (ft²)' },
      { id: 'sq_yard', name: 'Square Yard (yd²)' },
      { id: 'acre', name: 'Acre' },
      { id: 'sq_mile', name: 'Square Mile (mi²)' }
    ],
    volume: [
      { id: 'milliliter', name: 'Milliliter (mL)' },
      { id: 'liter', name: 'Liter (L)' },
      { id: 'cubic_meter', name: 'Cubic Meter (m³)' },
      { id: 'teaspoon', name: 'Teaspoon (tsp)' },
      { id: 'tablespoon', name: 'Tablespoon (tbsp)' },
      { id: 'fluid_ounce', name: 'Fluid Ounce (fl oz)' },
      { id: 'cup', name: 'Cup' },
      { id: 'pint', name: 'Pint (pt)' },
      { id: 'quart', name: 'Quart (qt)' },
      { id: 'gallon', name: 'Gallon (gal)' },
      { id: 'cubic_inch', name: 'Cubic Inch (in³)' },
      { id: 'cubic_foot', name: 'Cubic Foot (ft³)' }
    ],
    mass: [
      { id: 'milligram', name: 'Milligram (mg)' },
      { id: 'gram', name: 'Gram (g)' },
      { id: 'kilogram', name: 'Kilogram (kg)' },
      { id: 'metric_ton', name: 'Metric Ton (t)' },
      { id: 'ounce', name: 'Ounce (oz)' },
      { id: 'pound', name: 'Pound (lb)' },
      { id: 'stone', name: 'Stone (st)' },
      { id: 'us_ton', name: 'US Ton (ton)' },
      { id: 'imperial_ton', name: 'Imperial Ton (long ton)' }
    ],
    temperature: [
      { id: 'celsius', name: 'Celsius (°C)' },
      { id: 'fahrenheit', name: 'Fahrenheit (°F)' },
      { id: 'kelvin', name: 'Kelvin (K)' }
    ],
    time: [
      { id: 'nanosecond', name: 'Nanosecond (ns)' },
      { id: 'microsecond', name: 'Microsecond (μs)' },
      { id: 'millisecond', name: 'Millisecond (ms)' },
      { id: 'second', name: 'Second (s)' },
      { id: 'minute', name: 'Minute (min)' },
      { id: 'hour', name: 'Hour (h)' },
      { id: 'day', name: 'Day (d)' },
      { id: 'week', name: 'Week (wk)' },
      { id: 'month', name: 'Month (mo)' },
      { id: 'year', name: 'Year (yr)' },
      { id: 'decade', name: 'Decade' },
      { id: 'century', name: 'Century' }
    ],
    speed: [
      { id: 'meter_per_second', name: 'Meter per Second (m/s)' },
      { id: 'kilometer_per_hour', name: 'Kilometer per Hour (km/h)' },
      { id: 'feet_per_second', name: 'Feet per Second (ft/s)' },
      { id: 'mile_per_hour', name: 'Mile per Hour (mph)' },
      { id: 'knot', name: 'Knot (kn)' }
    ],
    currency: [
      { id: 'usd', name: 'US Dollar ($)' },
      { id: 'eur', name: 'Euro (€)' },
      { id: 'gbp', name: 'British Pound (£)' },
      { id: 'jpy', name: 'Japanese Yen (¥)' },
      { id: 'cny', name: 'Chinese Yuan (¥)' },
      { id: 'inr', name: 'Indian Rupee (₹)' },
      { id: 'cad', name: 'Canadian Dollar (C$)' },
      { id: 'aud', name: 'Australian Dollar (A$)' }
    ]
  };

  // Conversion functions
  const convert = () => {
    const value = parseFloat(fromValue);
    
    if (isNaN(value)) {
      setToValue('');
      return;
    }
    
    let result;
    
    // First convert from source unit to a base unit
    let baseValue = convertToBase(value, fromUnit, category);
    
    // Then convert from base unit to target unit
    result = convertFromBase(baseValue, toUnit, category);
    
    setToValue(result.toString());
  };

  // Convert to base unit (meters for length, etc.)
  const convertToBase = (value: number, unit: string, category: string): number => {
    if (category === 'temperature') {
      // Special case for temperature
      if (unit === 'celsius') return value;
      else if (unit === 'fahrenheit') return (value - 32) * 5 / 9;
      else if (unit === 'kelvin') return value - 273.15;
      return value; // Default case, should not happen
    }
    
    // For other categories, use conversion factors
    const factors: Record<string, Record<string, number>> = {
      length: {
        nanometer: 1e-9,
        micrometer: 1e-6,
        millimeter: 0.001,
        centimeter: 0.01,
        meter: 1,
        kilometer: 1000,
        inch: 0.0254,
        feet: 0.3048,
        yard: 0.9144,
        mile: 1609.344,
        nautical_mile: 1852
      },
      area: {
        sq_millimeter: 1e-6,
        sq_centimeter: 0.0001,
        sq_meter: 1,
        hectare: 10000,
        sq_kilometer: 1e6,
        sq_inch: 0.00064516,
        sq_feet: 0.09290304,
        sq_yard: 0.83612736,
        acre: 4046.8564224,
        sq_mile: 2589988.110336
      },
      mass: {
        milligram: 0.000001,
        gram: 0.001,
        kilogram: 1,
        metric_ton: 1000,
        ounce: 0.028349523125,
        pound: 0.45359237,
        stone: 6.35029318,
        us_ton: 907.18474,
        imperial_ton: 1016.0469088
      },
      // Add other categories as needed
      volume: {
        milliliter: 0.001,
        liter: 1,
        cubic_meter: 1000,
        teaspoon: 0.00492892159375,
        tablespoon: 0.01478676478125,
        fluid_ounce: 0.0295735295625,
        cup: 0.2365882365,
        pint: 0.473176473,
        quart: 0.946352946,
        gallon: 3.785411784,
        cubic_inch: 0.016387064,
        cubic_foot: 28.316846592
      },
      time: {
        nanosecond: 1e-9,
        microsecond: 1e-6,
        millisecond: 0.001,
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        month: 2629746,
        year: 31556952,
        decade: 315569520,
        century: 3155695200
      },
      speed: {
        meter_per_second: 1,
        kilometer_per_hour: 1/3.6,
        feet_per_second: 0.3048,
        mile_per_hour: 0.44704,
        knot: 0.514444444
      },
      // Currency conversion rates are usually pulled from an API
      // For simplicity, using fixed rates here (relative to USD)
      currency: {
        usd: 1,
        eur: 0.85,
        gbp: 0.75,
        jpy: 110,
        cny: 6.5,
        inr: 75,
        cad: 1.25,
        aud: 1.35
      }
    };
    
    return value * (factors[category as keyof typeof factors][unit] || 1);
  };

  // Convert from base unit to target unit
  const convertFromBase = (value: number, unit: string, category: string): number => {
    if (category === 'temperature') {
      // Special case for temperature
      if (unit === 'celsius') return value;
      else if (unit === 'fahrenheit') return (value * 9 / 5) + 32;
      else if (unit === 'kelvin') return value + 273.15;
      return value; // Default case, should not happen
    }
    
    // For other categories, use conversion factors
    const factors: Record<string, Record<string, number>> = {
      length: {
        nanometer: 1e9,
        micrometer: 1e6,
        millimeter: 1000,
        centimeter: 100,
        meter: 1,
        kilometer: 0.001,
        inch: 39.3700787402,
        feet: 3.280839895,
        yard: 1.0936132983,
        mile: 0.0006213712,
        nautical_mile: 0.0005399568
      },
      area: {
        sq_millimeter: 1e6,
        sq_centimeter: 10000,
        sq_meter: 1,
        hectare: 0.0001,
        sq_kilometer: 0.000001,
        sq_inch: 1550.0031,
        sq_feet: 10.7639104,
        sq_yard: 1.19599,
        acre: 0.000247105,
        sq_mile: 3.86102e-7
      },
      mass: {
        milligram: 1000000,
        gram: 1000,
        kilogram: 1,
        metric_ton: 0.001,
        ounce: 35.27396195,
        pound: 2.2046226218,
        stone: 0.1574731728,
        us_ton: 0.0011023113,
        imperial_ton: 0.0009842065
      },
      // Add other categories as needed
      volume: {
        milliliter: 1000,
        liter: 1,
        cubic_meter: 0.001,
        teaspoon: 202.884136,
        tablespoon: 67.628045,
        fluid_ounce: 33.814023,
        cup: 4.22675,
        pint: 2.11338,
        quart: 1.05669,
        gallon: 0.264172,
        cubic_inch: 61.0237441,
        cubic_foot: 0.0353147
      },
      time: {
        nanosecond: 1e9,
        microsecond: 1e6,
        millisecond: 1000,
        second: 1,
        minute: 1/60,
        hour: 1/3600,
        day: 1/86400,
        week: 1/604800,
        month: 1/2629746,
        year: 1/31556952,
        decade: 1/315569520,
        century: 1/3155695200
      },
      speed: {
        meter_per_second: 1,
        kilometer_per_hour: 3.6,
        feet_per_second: 3.28084,
        mile_per_hour: 2.23694,
        knot: 1.94384
      },
      // Currency conversion rates (inverse of the ones in convertToBase)
      currency: {
        usd: 1,
        eur: 1/0.85,
        gbp: 1/0.75,
        jpy: 1/110,
        cny: 1/6.5,
        inr: 1/75,
        cad: 1/1.25,
        aud: 1/1.35
      }
    };
    
    return value * (factors[category as keyof typeof factors][unit] || 1);
  };

  // Handle smart search input
  const handleSmartSearch = () => {
    // Parse input like "5 ft to cm" or "5 feet to centimeters"
    const pattern = /(\d+\.?\d*)\s*([a-zA-Z]+)\s*(?:to|in|->)?\s*([a-zA-Z]+)/;
    const match = inputSearch.match(pattern);
    
    if (match) {
      const value = match[1];
      const fromUnitText = match[2].toLowerCase();
      const toUnitText = match[3].toLowerCase();
      
      // Find matching category and units
      for (const cat in units) {
        const unitList = units[cat as keyof typeof units];
        
        // Find from unit
        const fromUnitObj = unitList.find(u => 
          u.id.includes(fromUnitText) || u.name.toLowerCase().includes(fromUnitText)
        );
        
        // Find to unit
        const toUnitObj = unitList.find(u => 
          u.id.includes(toUnitText) || u.name.toLowerCase().includes(toUnitText)
        );
        
        if (fromUnitObj && toUnitObj) {
          setCategory(cat);
          setFromUnit(fromUnitObj.id);
          setToUnit(toUnitObj.id);
          setFromValue(value);
          
          // Need to wait for state updates before converting
          setTimeout(() => {
            convert();
          }, 10);
          
          return;
        }
      }
    }
    
    // If no match, show error
    toast({
      title: "Invalid format",
      description: "Try something like '5 ft to m' or '10 kg to lb'",
      variant: "destructive"
    });
  };

  // Switch from and to units
  const handleSwitch = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    navigator.clipboard.writeText(toValue);
    toast({
      title: "Copied to clipboard!",
      description: "Result has been copied to your clipboard."
    });
  };

  useEffect(() => {
    if (pendingParams?.toolId === 'unit-converter') {
      const p = pendingParams.params;
      if (p.category !== undefined) setCategory(p.category);
      if (p.fromUnit !== undefined) setFromUnit(p.fromUnit);
      if (p.toUnit !== undefined) setToUnit(p.toUnit);
      if (p.value !== undefined) setFromValue(String(p.value));
      consumeParams();
    }
  }, [pendingParams]);

  // Update conversion when values change
  useEffect(() => {
    convert();
  }, [fromValue, fromUnit, toUnit, category]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Unit Converter</h2>
        <p className="text-gray-500 dark:text-gray-400">Convert between different units of measurement.</p>
      </div>

      <div className="space-y-6">
        {/* Smart search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Smart Search</label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. 5 ft to m" 
              value={inputSearch} 
              onChange={(e) => setInputSearch(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleSmartSearch}>Convert</Button>
          </div>
          <p className="text-xs text-gray-500">Try inputs like "5 ft to m" or "10 kg to lb"</p>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={setCategory}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full">
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* From Unit */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <select 
                      value={fromUnit} 
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {units[cat.id as keyof typeof units].map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                  <Input 
                    type="number" 
                    value={fromValue} 
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>

                {/* Switch Button */}
                <div className="flex items-center justify-center md:justify-start md:pl-4 md:-ml-10 md:-mr-10 z-10">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSwitch}
                    className="rounded-full h-10 w-10"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Unit */}
                <div className="space-y-4 md:-ml-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                    <select 
                      value={toUnit} 
                      onChange={(e) => setToUnit(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {units[cat.id as keyof typeof units].map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Input 
                      type="text" 
                      value={toValue} 
                      readOnly
                      className="pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0"
                      onClick={handleCopyResult}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
