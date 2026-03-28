import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, X } from 'lucide-react';
import EmbedLayout from '@/components/EmbedLayout';

// Import all tool components
import { CharacterCounter } from '@/components/tools/CharacterCounter';
import { TextDiffTool } from '@/components/tools/TextDiffTool';
import { ColorConverter } from '@/components/tools/ColorConverter';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { WhatsAppLinkGenerator } from '@/components/tools/WhatsAppLinkGenerator';
import { DiceRoller } from '@/components/tools/DiceRoller';
import { StopWatch } from '@/components/tools/StopWatch';
import { DecisionRoulette } from '@/components/tools/DecisionRoulette';
import { BMICalculator } from '@/components/tools/BMICalculator';
import { SleepCycleCalculator } from '@/components/tools/SleepCycleCalculator';
import { EMICalculator } from '@/components/tools/EMICalculator';
import { InterestCalculator } from '@/components/tools/InterestCalculator';
import { ROICalculator } from '@/components/tools/ROICalculator';
import { NumberToIndianFormat } from '@/components/tools/NumberToIndianFormat';
import { FinancialPlanner } from '@/components/tools/FinancialPlanner';
import { DiscountCalculator } from '@/components/tools/DiscountCalculator';
import { GroceryPriceComparator } from '@/components/tools/GroceryPriceComparator';
import { AgeCalculator } from '@/components/tools/AgeCalculator';
import { DateDiffCalculator } from '@/components/tools/DateDiffCalculator';
import { UnitConverter } from '@/components/tools/UnitConverter';

const tools = [
  { id: 'character-counter', name: 'Character Counter', component: CharacterCounter },
  { id: 'text-diff', name: 'Text Diff', component: TextDiffTool },
  { id: 'color-converter', name: 'Color Converter', component: ColorConverter },
  { id: 'password-generator', name: 'Password Generator', component: PasswordGenerator },
  { id: 'whatsapp-link', name: 'WhatsApp Link', component: WhatsAppLinkGenerator },
  { id: 'dice-roller', name: 'Dice Roller', component: DiceRoller },
  { id: 'stopwatch', name: 'Stopwatch', component: StopWatch },
  { id: 'decision-roulette', name: 'Decision Roulette', component: DecisionRoulette },
  { id: 'bmi-calculator', name: 'BMI Calculator', component: BMICalculator },
  { id: 'sleep-calculator', name: 'Sleep Calculator', component: SleepCycleCalculator },
  { id: 'emi-calculator', name: 'EMI Calculator', component: EMICalculator },
  { id: 'interest-calculator', name: 'Interest Calculator', component: InterestCalculator },
  { id: 'roi-calculator', name: 'ROI Calculator', component: ROICalculator },
  { id: 'indian-number-format', name: 'Indian Number Format', component: NumberToIndianFormat },
  { id: 'financial-planner', name: 'Financial Planner', component: FinancialPlanner },
  { id: 'discount-calculator', name: 'Discount Calculator', component: DiscountCalculator },
  { id: 'grocery-comparator', name: 'Grocery Comparator', component: GroceryPriceComparator },
  { id: 'age-calculator', name: 'Age Calculator', component: AgeCalculator },
  { id: 'date-diff', name: 'Date Difference', component: DateDiffCalculator },
  { id: 'unit-converter', name: 'Unit Converter', component: UnitConverter },
];

const EmbedIndex = () => {
  const [searchParams] = useSearchParams();
  const initialTool = searchParams.get('tool') || 'character-counter';
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTool = tools.find(t => t.id === selectedTool) || tools[0];
  const ToolComponent = currentTool.component;

  return (
    <EmbedLayout>
      <div className="flex h-[calc(100vh-2rem)] gap-4">
        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:w-48 lg:w-56
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <ScrollArea className="h-full py-4">
            <div className="px-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">ToolVault</h2>
            </div>
            <nav className="space-y-1 px-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${selectedTool === tool.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {tool.name}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto md:pl-0 pl-0">
          <ScrollArea className="h-full">
            <div className="pt-12 md:pt-0">
              <ToolComponent />
            </div>
          </ScrollArea>
        </div>
      </div>
    </EmbedLayout>
  );
};

export default EmbedIndex;
