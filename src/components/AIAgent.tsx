import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, AlertCircle, Wrench, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAgentContext } from '@/contexts/AgentContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolUsed?: { id: string; name: string; params: Record<string, any> };
}

const TOOL_NAMES: Record<string, string> = {
  'character-counter': 'Character Counter',
  'text-diff': 'Text Diff Tool',
  'color-converter': 'Color Converter',
  'password-generator': 'Password Generator',
  'whatsapp-link': 'WhatsApp Link Generator',
  'dice-roller': 'Dice Roller',
  'decision-roulette': 'Decision Roulette',
  'age-calculator': 'Age Calculator',
  'date-diff': 'Days Between Dates',
  'unit-converter': 'Unit Converter',
  'sleep-calculator': 'Sleep Cycle Calculator',
  'financial-planner': 'Financial Planner',
  'indian-number-format': 'Indian Number Format',
  'bmi-calculator': 'BMI Calculator',
  'roi-calculator': 'ROI Calculator',
  'interest-calculator': 'Interest Calculator',
  'grocery-comparator': 'Grocery Price Comparator',
  'discount-calculator': 'Discount Calculator',
  'emi-calculator': 'EMI Calculator',
  'plant-health-detector': 'Plant Health Detector',
};

const OPENAI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'count_characters',
      description: 'Count characters, words, sentences and paragraphs in a piece of text',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The text to analyze' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'diff_text',
      description: 'Compare two pieces of text and highlight the differences',
      parameters: {
        type: 'object',
        properties: {
          text1: { type: 'string', description: 'Original text' },
          text2: { type: 'string', description: 'Modified/new text' },
        },
        required: ['text1', 'text2'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'convert_color',
      description: 'Convert a color between HEX, RGB, and HSL formats',
      parameters: {
        type: 'object',
        properties: {
          hex: { type: 'string', description: 'Hex color code (e.g. #3498db or 3498db)' },
        },
        required: ['hex'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_password',
      description: 'Generate a secure random password with specified options',
      parameters: {
        type: 'object',
        properties: {
          length: { type: 'number', description: 'Password length (4-64, default 16)' },
          uppercase: { type: 'boolean', description: 'Include uppercase letters' },
          numbers: { type: 'boolean', description: 'Include numbers' },
          symbols: { type: 'boolean', description: 'Include special symbols' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_whatsapp_link',
      description: 'Create a WhatsApp click-to-chat link for a phone number with optional pre-filled message',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: { type: 'string', description: 'Phone number with country code (e.g. +919876543210)' },
          message: { type: 'string', description: 'Optional pre-filled message text' },
        },
        required: ['phoneNumber'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'roll_dice',
      description: 'Roll a dice or flip a coin',
      parameters: {
        type: 'object',
        properties: {
          diceType: {
            type: 'string',
            enum: ['coin', 'd6', 'd20'],
            description: 'Type of dice: coin (heads/tails), d6 (6-sided), d20 (20-sided)',
          },
        },
        required: ['diceType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'spin_decision_roulette',
      description: 'Set up a decision roulette wheel with options and spin it to make a random decision',
      parameters: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'Option label' },
                weight: { type: 'number', description: 'Relative weight/probability (default 1)' },
              },
              required: ['text'],
            },
            description: 'List of options for the roulette wheel',
          },
        },
        required: ['options'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_age',
      description: 'Calculate age, zodiac sign, and days until next birthday from a birthdate',
      parameters: {
        type: 'object',
        properties: {
          birthdate: { type: 'string', description: 'Date of birth in YYYY-MM-DD format' },
        },
        required: ['birthdate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_date_difference',
      description: 'Calculate the number of days, months, and years between two dates',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
          endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'convert_units',
      description: 'Convert a value from one unit to another (length, weight, temperature, speed, volume, area, time)',
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Numeric value to convert' },
          fromUnit: { type: 'string', description: 'Source unit (e.g. km, kg, celsius, mph)' },
          toUnit: { type: 'string', description: 'Target unit (e.g. miles, lb, fahrenheit, kph)' },
          category: {
            type: 'string',
            enum: ['length', 'area', 'volume', 'mass', 'temperature', 'time', 'speed'],
            description: 'Category of unit conversion',
          },
        },
        required: ['value', 'fromUnit', 'toUnit', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_sleep_cycles',
      description: 'Calculate optimal sleep or wake times based on 90-minute sleep cycles',
      parameters: {
        type: 'object',
        properties: {
          calculationType: {
            type: 'string',
            enum: ['bedtime', 'waketime'],
            description: 'bedtime: given wake time, find when to sleep. waketime: given bed time, find when to wake',
          },
          wakeUpTime: { type: 'string', description: 'Desired wake time in HH:MM format (for bedtime calculation)' },
          bedTime: { type: 'string', description: 'Desired bed time in HH:MM format (for waketime calculation)' },
          fallAsleepMinutes: { type: 'number', description: 'Minutes to fall asleep (default 15)' },
        },
        required: ['calculationType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'plan_finances',
      description: 'Create a financial forecast plan with goal tracking, monthly contributions, and inflation-adjusted projections',
      parameters: {
        type: 'object',
        properties: {
          targetAmount: { type: 'number', description: 'Financial goal amount in rupees' },
          initialInvestment: { type: 'number', description: 'Starting capital in rupees' },
          monthlyContribution: { type: 'number', description: 'Monthly savings/investment amount in rupees' },
          annualReturnRate: { type: 'number', description: 'Expected annual return rate as percentage (e.g. 12)' },
          inflationRate: { type: 'number', description: 'Expected inflation rate as percentage (e.g. 6)' },
          yearsToForecast: { type: 'number', description: 'Number of years to forecast (1-50)' },
        },
        required: ['targetAmount', 'initialInvestment', 'monthlyContribution', 'annualReturnRate', 'yearsToForecast'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'format_indian_number',
      description: 'Format a number into Indian numbering system (lakhs, crores) with words',
      parameters: {
        type: 'object',
        properties: {
          number: { type: 'number', description: 'The number to format' },
        },
        required: ['number'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_bmi',
      description: 'Calculate BMI (Body Mass Index) and get weight category and ideal weight range',
      parameters: {
        type: 'object',
        properties: {
          weight: { type: 'number', description: 'Weight value' },
          height: { type: 'number', description: 'Height value' },
          unit: { type: 'string', enum: ['metric', 'imperial'], description: 'metric (kg/cm) or imperial (lb/inch)' },
        },
        required: ['weight', 'height'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_roi',
      description: 'Calculate Return on Investment (ROI) and CAGR for an investment over time',
      parameters: {
        type: 'object',
        properties: {
          initialInvestment: { type: 'number', description: 'Amount invested initially in rupees' },
          growthRate: { type: 'number', description: 'Annual growth rate as percentage (e.g. 10 for 10%)' },
          timePeriod: { type: 'number', description: 'Investment duration in years' },
        },
        required: ['initialInvestment', 'growthRate', 'timePeriod'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_interest',
      description: 'Calculate simple or compound interest on a principal amount',
      parameters: {
        type: 'object',
        properties: {
          principal: { type: 'number', description: 'Principal amount in rupees' },
          rate: { type: 'number', description: 'Annual interest rate as percentage (e.g. 8.5)' },
          time: { type: 'number', description: 'Time period in years' },
          type: { type: 'string', enum: ['simple', 'compound'], description: 'Type of interest calculation' },
          frequency: {
            type: 'string',
            enum: ['1', '2', '4', '12', '365'],
            description: 'Compounding frequency: 1=annually, 2=semi-annually, 4=quarterly, 12=monthly, 365=daily',
          },
        },
        required: ['principal', 'rate', 'time', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_grocery_prices',
      description: 'Compare grocery/product prices by calculating cost per unit (per gram/ml) to find the best deal',
      parameters: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Product name or description' },
                weight: { type: 'number', description: 'Quantity/weight value' },
                weightUnit: { type: 'string', enum: ['g', 'kg', 'ml', 'l'], description: 'Unit of quantity' },
                price: { type: 'number', description: 'Selling/current price in rupees' },
                mrp: { type: 'number', description: 'MRP/original price in rupees (optional)' },
              },
              required: ['name', 'weight', 'weightUnit', 'price'],
            },
            description: 'List of products to compare',
          },
        },
        required: ['products'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_discount',
      description: 'Calculate final price after applying one or more discounts (percentage or fixed amount)',
      parameters: {
        type: 'object',
        properties: {
          originalPrice: { type: 'number', description: 'Original price in rupees' },
          discounts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['percentage', 'amount'], description: 'Discount type' },
                value: { type: 'number', description: 'Discount value (% or fixed amount)' },
              },
              required: ['type', 'value'],
            },
            description: 'List of discounts to apply sequentially',
          },
        },
        required: ['originalPrice', 'discounts'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_emi',
      description: 'Calculate EMI (Equated Monthly Installment) for a loan with amortization schedule',
      parameters: {
        type: 'object',
        properties: {
          principal: { type: 'number', description: 'Loan principal amount in rupees' },
          interestRate: { type: 'number', description: 'Annual interest rate as percentage (e.g. 8.5)' },
          loanTerm: { type: 'number', description: 'Loan tenure in years' },
        },
        required: ['principal', 'interestRate', 'loanTerm'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_plant_health_detector',
      description: 'Open the Plant Health Detector tool to scan a plant with the camera and analyze its health using GPT-4o Vision',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

// Map function name → tool ID
const FUNCTION_TO_TOOL: Record<string, string> = {
  count_characters: 'character-counter',
  diff_text: 'text-diff',
  convert_color: 'color-converter',
  generate_password: 'password-generator',
  create_whatsapp_link: 'whatsapp-link',
  roll_dice: 'dice-roller',
  spin_decision_roulette: 'decision-roulette',
  calculate_age: 'age-calculator',
  calculate_date_difference: 'date-diff',
  convert_units: 'unit-converter',
  calculate_sleep_cycles: 'sleep-calculator',
  plan_finances: 'financial-planner',
  format_indian_number: 'indian-number-format',
  calculate_bmi: 'bmi-calculator',
  calculate_roi: 'roi-calculator',
  calculate_interest: 'interest-calculator',
  compare_grocery_prices: 'grocery-comparator',
  calculate_discount: 'discount-calculator',
  calculate_emi: 'emi-calculator',
  open_plant_health_detector: 'plant-health-detector',
};

const EXAMPLE_PROMPTS = [
  'ROI on ₹15,000 at 10% for 10 years',
  '1kg at ₹1500 vs 800g at ₹400 — which is better?',
  'EMI for ₹50 lakh at 8.5% for 20 years',
  'Convert 100 km to miles',
  'BMI for 70kg, 175cm',
  'Roll a d20',
];

interface AIAgentProps {
  onNavigate: (toolId: string) => void;
}

export const AIAgent = ({ onNavigate }: AIAgentProps) => {
  const { apiKey, triggerTool, isAgentOpen, setIsAgentOpen } = useAgentContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI assistant for ToolVault, a toolkit app. When the user asks you to perform a calculation or task that matches one of the available tools, call the appropriate function with the extracted parameters. Extract all relevant numbers and options from the user\'s message. For dates, use YYYY-MM-DD format. For unit conversions, identify the correct category. If the user asks something unrelated to the tools, answer conversationally.',
            },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          tools: OPENAI_TOOLS,
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `API error ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (choice?.message?.tool_calls?.length) {
        const toolCall = choice.message.tool_calls[0];
        const fnName = toolCall.function.name;
        const params = JSON.parse(toolCall.function.arguments ?? '{}');
        const toolId = FUNCTION_TO_TOOL[fnName];
        const toolName = TOOL_NAMES[toolId] ?? fnName;

        // Trigger the tool and navigate
        triggerTool(toolId, params);
        onNavigate(toolId);

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `I've opened **${toolName}** with your values. The results are displayed in the tool panel.`,
            toolUsed: { id: toolId, name: toolName, params },
          },
        ]);
      } else {
        const text = choice?.message?.content ?? 'Sorry, I could not process that request.';
        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message ?? 'Something went wrong. Please try again.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button — also exported as part of this module for use in header */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsAgentOpen(true)}
        title="AI Assistant"
        className="relative"
      >
        <Bot className="h-5 w-5" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-background" />
      </Button>

      <Sheet open={isAgentOpen} onOpenChange={setIsAgentOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-indigo-500" />
              AI Assistant
              <span className="ml-auto text-xs font-normal text-muted-foreground">powered by GPT-4o mini</span>
            </SheetTitle>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {!apiKey && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Add your OpenAI API key in <strong>Settings ⚙</strong> to enable AI features.
                </span>
              </div>
            )}

            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Ask me anything — I'll use the right tool and fill in the values for you.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {EXAMPLE_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => handleSend(p)}
                      disabled={!apiKey}
                      className="text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-indigo-600 text-white px-3 py-2 text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] space-y-2">
                    {msg.toolUsed ? (
                      <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                          <Wrench className="h-4 w-4" />
                          {msg.toolUsed.name}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Opened with your values. See the results in the tool panel.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-indigo-300 dark:border-indigo-700"
                          onClick={() => {
                            onNavigate(msg.toolUsed!.id);
                            setIsAgentOpen(false);
                          }}
                        >
                          View Tool <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t px-3 py-3 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder={apiKey ? 'Ask me to use any tool...' : 'Add API key to start...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!apiKey || isLoading}
                rows={1}
                className="resize-none min-h-[40px] max-h-[120px] text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!apiKey || !input.trim() || isLoading}
                className="h-10 w-10 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
