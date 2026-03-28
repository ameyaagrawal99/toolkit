import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { X, Plus, RotateCcw, Sparkles, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgentContext } from '@/contexts/AgentContext';

interface Option {
  id: string;
  text: string;
  weight: number;
  color: string;
}

interface SavedDecision {
  name: string;
  options: Option[];
}

const COLORS = [
  'hsl(210, 95%, 55%)',   // blue
  'hsl(340, 82%, 62%)',   // pink
  'hsl(160, 84%, 40%)',   // green
  'hsl(45, 93%, 47%)',    // gold
  'hsl(280, 87%, 65%)',   // purple
  'hsl(15, 86%, 55%)',    // orange
  'hsl(195, 85%, 50%)',   // cyan
  'hsl(0, 84%, 60%)',     // red
];

const TEMPLATES = [
  {
    name: "What to Eat?",
    options: [
      { text: "Pizza", weight: 3 },
      { text: "Sushi", weight: 2 },
      { text: "Burger", weight: 3 },
      { text: "Pasta", weight: 2 },
      { text: "Salad", weight: 1 },
    ]
  },
  {
    name: "Movie Genre",
    options: [
      { text: "Action", weight: 3 },
      { text: "Comedy", weight: 3 },
      { text: "Drama", weight: 2 },
      { text: "Horror", weight: 1 },
      { text: "Sci-Fi", weight: 2 },
    ]
  },
  {
    name: "Weekend Activity",
    options: [
      { text: "Movie Night", weight: 3 },
      { text: "Hiking", weight: 2 },
      { text: "Gaming", weight: 3 },
      { text: "Reading", weight: 2 },
      { text: "Restaurant", weight: 2 },
    ]
  },
];

export const DecisionRoulette = () => {
  const { toast } = useToast();
  const { pendingParams, consumeParams } = useAgentContext();
  const [options, setOptions] = useState<Option[]>([
    { id: '1', text: 'Option 1', weight: 3, color: COLORS[0] },
    { id: '2', text: 'Option 2', weight: 3, color: COLORS[1] },
    { id: '3', text: 'Option 3', weight: 3, color: COLORS[2] },
  ]);
  const [newOption, setNewOption] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>([]);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    // Load history and saved decisions from localStorage
    const savedHistory = localStorage.getItem('decision-history');
    const saved = localStorage.getItem('saved-decisions');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (saved) setSavedDecisions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (pendingParams?.toolId === 'decision-roulette') {
      const p = pendingParams.params;
      if (p.options && Array.isArray(p.options)) {
        const mapped: Option[] = p.options.map((opt: any, i: number) => ({
          id: String(i + 1),
          text: opt.text ?? `Option ${i + 1}`,
          weight: opt.weight ?? 3,
          color: COLORS[i % COLORS.length],
        }));
        setOptions(mapped);
      }
      consumeParams();
    }
  }, [pendingParams]);

  const addOption = () => {
    if (!newOption.trim()) {
      toast({
        title: "Empty option",
        description: "Please enter an option text",
        variant: "destructive"
      });
      return;
    }

    const colorIndex = options.length % COLORS.length;
    const option: Option = {
      id: Date.now().toString(),
      text: newOption.trim(),
      weight: 3,
      color: COLORS[colorIndex]
    };
    setOptions([...options, option]);
    setNewOption('');
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: "Minimum options",
        description: "You need at least 2 options",
        variant: "destructive"
      });
      return;
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  const updateWeight = (id: string, weight: number) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, weight } : opt
    ));
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedOption(null);
    setShowConfetti(false);

    // Create weighted array
    const weightedOptions: Option[] = [];
    options.forEach(option => {
      for (let i = 0; i < option.weight; i++) {
        weightedOptions.push(option);
      }
    });

    // Random selection
    const selected = weightedOptions[Math.floor(Math.random() * weightedOptions.length)];
    
    // Calculate rotation (3-5 full spins plus position)
    const spins = 3 + Math.random() * 2;
    const selectedIndex = options.findIndex(opt => opt.id === selected.id);
    const segmentAngle = 360 / options.length;
    const targetAngle = (360 - (selectedIndex * segmentAngle)) + (segmentAngle / 2);
    const finalRotation = (spins * 360) + targetAngle;

    setRotation(rotation + finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedOption(selected);
      setShowConfetti(true);

      // Save to history
      const newHistory = [selected.text, ...history.slice(0, 9)];
      setHistory(newHistory);
      localStorage.setItem('decision-history', JSON.stringify(newHistory));

      toast({
        title: "Decision Made! 🎯",
        description: selected.text,
        duration: 3000
      });

      setTimeout(() => setShowConfetti(false), 3000);
    }, 4000);
  };

  const reset = () => {
    setOptions([
      { id: '1', text: 'Option 1', weight: 3, color: COLORS[0] },
      { id: '2', text: 'Option 2', weight: 3, color: COLORS[1] },
      { id: '3', text: 'Option 3', weight: 3, color: COLORS[2] },
    ]);
    setSelectedOption(null);
    setRotation(0);
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    const newOptions = template.options.map((opt, idx) => ({
      id: Date.now().toString() + idx,
      text: opt.text,
      weight: opt.weight,
      color: COLORS[idx % COLORS.length]
    }));
    setOptions(newOptions);
    setSelectedOption(null);
    setRotation(0);
    toast({
      title: "Template loaded",
      description: template.name,
    });
  };

  const saveDecision = () => {
    if (!saveName.trim()) {
      toast({
        title: "Enter a name",
        description: "Please enter a name for this decision set",
        variant: "destructive"
      });
      return;
    }

    const newSaved = [...savedDecisions, { name: saveName.trim(), options }];
    setSavedDecisions(newSaved);
    localStorage.setItem('saved-decisions', JSON.stringify(newSaved));
    setSaveName('');
    toast({
      title: "Saved!",
      description: `"${saveName}" has been saved`,
    });
  };

  const loadSaved = (saved: SavedDecision) => {
    setOptions(saved.options);
    setSelectedOption(null);
    setRotation(0);
    toast({
      title: "Loaded",
      description: saved.name,
    });
  };

  const deleteSaved = (name: string) => {
    const newSaved = savedDecisions.filter(s => s.name !== name);
    setSavedDecisions(newSaved);
    localStorage.setItem('saved-decisions', JSON.stringify(newSaved));
  };

  const segmentAngle = 360 / options.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Wheel Container */}
      <div className="relative flex justify-center items-center py-8">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping-slow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          <svg
            className="w-full h-full drop-shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
            }}
            viewBox="0 0 200 200"
          >
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {options.map((option, index) => {
              const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
              const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
              
              const x1 = 100 + 95 * Math.cos(startAngle);
              const y1 = 100 + 95 * Math.sin(startAngle);
              const x2 = 100 + 95 * Math.cos(endAngle);
              const y2 = 100 + 95 * Math.sin(endAngle);
              
              const largeArc = segmentAngle > 180 ? 1 : 0;
              
              const path = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              const textAngle = (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
              const textX = 100 + 60 * Math.cos(textAngle - Math.PI / 2);
              const textY = 100 + 60 * Math.sin(textAngle - Math.PI / 2);
              const rotation = index * segmentAngle + segmentAngle / 2;

              return (
                <g key={option.id}>
                  <path
                    d={path}
                    fill={option.color}
                    stroke="white"
                    strokeWidth="2"
                    filter="url(#shadow)"
                    className="transition-opacity"
                    style={{ opacity: isSpinning ? 0.9 : 1 }}
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${rotation}, ${textX}, ${textY})`}
                    className="pointer-events-none select-none"
                  >
                    {option.text.length > 12 ? option.text.substring(0, 10) + '...' : option.text}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx="100" cy="100" r="15" fill="white" stroke="hsl(var(--primary))" strokeWidth="3" />
          </svg>

          {/* Center button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {isSpinning ? (
              <div className="animate-spin">⟳</div>
            ) : (
              'SPIN'
            )}
          </button>
        </div>
      </div>

      {/* Result display */}
      {selectedOption && !isSpinning && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 animate-scale-in">
          <div className="flex items-center gap-3 justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-center">
              {selectedOption.text}
            </h3>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </Card>
      )}

      {/* Options management */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>Your Options</span>
          <span className="text-sm text-muted-foreground">({options.length})</span>
        </h3>

        <div className="flex gap-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
            placeholder="Add new option..."
            className="flex-1"
          />
          <Button onClick={addOption} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: option.color }}
              />
              <Input
                value={option.text}
                onChange={(e) => setOptions(options.map(opt => 
                  opt.id === option.id ? { ...opt, text: e.target.value } : opt
                ))}
                className="flex-1"
              />
              <div className="flex items-center gap-2 min-w-[180px]">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Weight: {option.weight}x
                </span>
                <Slider
                  value={[option.weight]}
                  onValueChange={([value]) => updateWeight(option.id, value)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-20"
                />
              </div>
              <Button
                onClick={() => removeOption(option.id)}
                size="icon"
                variant="ghost"
                className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={reset} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Save/Load */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Save & Load</h3>
        
        <div className="flex gap-2">
          <Input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Enter name to save current options..."
            className="flex-1"
          />
          <Button onClick={saveDecision}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        {savedDecisions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Saved Decisions:</p>
            {savedDecisions.map((saved) => (
              <div key={saved.name} className="flex items-center gap-2 p-2 rounded border bg-muted/30">
                <button
                  onClick={() => loadSaved(saved)}
                  className="flex-1 text-left hover:underline"
                >
                  {saved.name} ({saved.options.length} options)
                </button>
                <Button
                  onClick={() => deleteSaved(saved.name)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Templates */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((template) => (
            <Button
              key={template.name}
              onClick={() => loadTemplate(template)}
              variant="outline"
              className="h-auto py-3"
            >
              <div className="text-center">
                <div className="font-semibold">{template.name}</div>
                <div className="text-xs text-muted-foreground">
                  {template.options.length} options
                </div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-semibold">Recent Decisions</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-muted text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
