import { useParams } from 'react-router-dom';
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

// Tool slug to component mapping
const toolMap: Record<string, React.ComponentType> = {
  'character-counter': CharacterCounter,
  'text-diff': TextDiffTool,
  'color-converter': ColorConverter,
  'password-generator': PasswordGenerator,
  'whatsapp-link': WhatsAppLinkGenerator,
  'dice-roller': DiceRoller,
  'stopwatch': StopWatch,
  'decision-roulette': DecisionRoulette,
  'bmi-calculator': BMICalculator,
  'sleep-calculator': SleepCycleCalculator,
  'emi-calculator': EMICalculator,
  'interest-calculator': InterestCalculator,
  'roi-calculator': ROICalculator,
  'indian-number-format': NumberToIndianFormat,
  'financial-planner': FinancialPlanner,
  'discount-calculator': DiscountCalculator,
  'grocery-comparator': GroceryPriceComparator,
  'age-calculator': AgeCalculator,
  'date-diff': DateDiffCalculator,
  'unit-converter': UnitConverter,
};

const EmbedTool = () => {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  
  const ToolComponent = toolSlug ? toolMap[toolSlug] : null;

  if (!ToolComponent) {
    return (
      <EmbedLayout showBadge={false}>
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Tool Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The tool "{toolSlug}" doesn't exist.
          </p>
          <p className="text-sm text-muted-foreground">
            Available tools: {Object.keys(toolMap).join(', ')}
          </p>
        </div>
      </EmbedLayout>
    );
  }

  return (
    <EmbedLayout>
      <ToolComponent />
    </EmbedLayout>
  );
};

export default EmbedTool;
