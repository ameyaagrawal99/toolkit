
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const ColorConverter = () => {
  const [hex, setHex] = useState('#3498db');
  const [rgb, setRgb] = useState({ r: 52, g: 152, b: 219 });
  const [hsl, setHsl] = useState({ h: 204, s: 70, l: 53 });
  const [isValidColor, setIsValidColor] = useState(true);

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    }
    
    return null;
  };

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r = 0, g = 0, b = 0;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Update RGB and HSL when HEX changes
  useEffect(() => {
    if (hex.match(/^#([A-Fa-f0-9]{3}){1,2}$/)) {
      setIsValidColor(true);
      const rgbValue = hexToRgb(hex);
      if (rgbValue) {
        setRgb(rgbValue);
        setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
      }
    } else {
      setIsValidColor(false);
    }
  }, [hex]);

  // Update HEX and HSL when RGB changes
  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [component]: value };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  // Update HEX and RGB when HSL changes
  const handleHslChange = (component: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hsl, [component]: value };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `Copied ${type} value!`,
      description: "Color value has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Color Converter</h2>
        <p className="text-gray-500 dark:text-gray-400">Convert colors between HEX, RGB, and HSL formats.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Color Preview */}
          <div 
            className="w-full h-32 rounded-md transition-colors duration-300 shadow-inner"
            style={{ backgroundColor: isValidColor ? hex : '#ff0000' }}
          />

          {/* HEX Input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">HEX</label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(hex, 'HEX')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Input 
              value={hex} 
              onChange={(e) => setHex(e.target.value)}
              className={!isValidColor ? "border-red-500" : ""}
              placeholder="#000000"
            />
            {!isValidColor && (
              <p className="text-red-500 text-xs">Please enter a valid HEX color</p>
            )}
          </div>

          {/* RGB Inputs */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">RGB</label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">R</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="255"
                  value={rgb.r} 
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">G</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="255" 
                  value={rgb.g} 
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">B</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="255" 
                  value={rgb.b} 
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>

          {/* HSL Inputs */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">HSL</label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">H</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="360"
                  value={hsl.h} 
                  onChange={(e) => handleHslChange('h', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">S %</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={hsl.s} 
                  onChange={(e) => handleHslChange('s', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">L %</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={hsl.l} 
                  onChange={(e) => handleHslChange('l', parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
