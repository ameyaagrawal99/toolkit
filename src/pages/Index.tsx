import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AIAgent } from '@/components/AIAgent';
import { APIKeySettings } from '@/components/APIKeySettings';
import { useAgentContext } from '@/contexts/AgentContext';
import { CharacterCounter } from '@/components/tools/CharacterCounter';
import { ColorConverter } from '@/components/tools/ColorConverter';
import { AgeCalculator } from '@/components/tools/AgeCalculator';
import { UnitConverter } from '@/components/tools/UnitConverter';
import { BMICalculator } from '@/components/tools/BMICalculator';
import { TextDiffTool } from '@/components/tools/TextDiffTool';
import { EMICalculator } from '@/components/tools/EMICalculator';
import { ROICalculator } from '@/components/tools/ROICalculator';
import { SleepCycleCalculator } from '@/components/tools/SleepCycleCalculator';
import { DateDiffCalculator } from '@/components/tools/DateDiffCalculator';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { WhatsAppLinkGenerator } from '@/components/tools/WhatsAppLinkGenerator';
import { DiceRoller } from '@/components/tools/DiceRoller';
import { NumberToIndianFormat } from '@/components/tools/NumberToIndianFormat';
import { StopWatch } from '@/components/tools/StopWatch';
import { FinancialPlanner } from '@/components/tools/FinancialPlanner';
import { DiscountCalculator } from '@/components/tools/DiscountCalculator';
import { GroceryPriceComparator } from '@/components/tools/GroceryPriceComparator';
import { DecisionRoulette } from '@/components/tools/DecisionRoulette';
import { InterestCalculator } from '@/components/tools/InterestCalculator';
import OfflineIndicator from '@/components/OfflineIndicator';
import MobileFAB from '@/components/MobileFAB';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import {
  Calculator, FileText, Calendar, Scale, Percent,
  Moon, ArrowRight, ArrowLeft, Key, Send, Dices,
  Search, IndianRupee, Clock, TrendingUp, Menu, AppWindow, ShoppingCart, Target, CloudOff, Sparkles, ChevronLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import WelcomeAnimation from '@/components/animations/WelcomeAnimation';
import LottieAnimation from '@/components/animations/LottieAnimation';
import calculatorAnimation from '@/components/animations/animationData/calculatorAnimation';
import toolboxAnimation from '@/components/animations/animationData/toolboxAnimation';

// For PWA installation
const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    
    if (outcome === 'accepted') {
      toast({
        title: "App installed successfully!",
        description: "Welcome to ToolVault — your pocket toolkit!",
        duration: 3000
      });
    }
  };

  if (!isInstallable) return null;
  
  return (
    <Button 
      onClick={handleInstallClick} 
      variant="glow"
      size="sm"
      className="flex items-center gap-2"
    >
      <AppWindow className="h-4 w-4" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
};

const Index = () => {
  const { toast } = useToast();
  const { pendingParams } = useAgentContext();
  const [currentTool, setCurrentTool] = useState("character-counter");
  const [searchQuery, setSearchQuery] = useState("");
  const [toolsUsed, setToolsUsed] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const isMobile = useIsMobile();

  // Auto-navigate when AI agent triggers a tool
  useEffect(() => {
    if (pendingParams?.toolId) {
      setCurrentTool(pendingParams.toolId);
    }
  }, [pendingParams]);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
    };
    checkStandalone();
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const categories = [
    {
      category: "Text Tools",
      color: "category-emerald",
      icon: FileText,
      tools: [
        { id: "character-counter", name: "Character Counter", icon: FileText },
        { id: "text-diff", name: "Text Diff Tool", icon: FileText },
      ]
    },
    {
      category: "Utility Tools",
      color: "category-indigo",
      icon: Key,
      tools: [
        { id: "color-converter", name: "Color Converter", icon: ArrowRight },
        { id: "password-generator", name: "Password Generator", icon: Key },
        { id: "whatsapp-link", name: "WhatsApp Link Generator", icon: Send },
        { id: "dice-roller", name: "Dice Roller", icon: Dices },
        { id: "stopwatch", name: "Stopwatch", icon: Clock },
        { id: "decision-roulette", name: "Decision Roulette", icon: Target },
      ]
    },
    {
      category: "Health Tools",
      color: "category-rose",
      icon: Scale,
      tools: [
        { id: "bmi-calculator", name: "BMI Calculator", icon: Scale },
        { id: "sleep-calculator", name: "Sleep Cycle Calculator", icon: Moon },
      ]
    },
    {
      category: "Finance Tools",
      color: "category-amber",
      icon: Calculator,
      tools: [
        { id: "emi-calculator", name: "EMI Calculator", icon: Calculator },
        { id: "interest-calculator", name: "Interest Calculator", icon: Percent },
        { id: "roi-calculator", name: "ROI Calculator", icon: Percent },
        { id: "indian-number-format", name: "Indian Number Format", icon: IndianRupee },
        { id: "financial-planner", name: "Financial Planner", icon: TrendingUp },
        { id: "discount-calculator", name: "Discount Calculator", icon: Percent },
        { id: "grocery-comparator", name: "Grocery Price Comparator", icon: ShoppingCart },
      ]
    },
    {
      category: "Date & Time Tools",
      color: "category-blue",
      icon: Calendar,
      tools: [
        { id: "age-calculator", name: "Age Calculator", icon: Calendar },
        { id: "date-diff", name: "Days Between Dates", icon: Calendar },
      ]
    },
    {
      category: "Conversion Tools",
      color: "category-violet",
      icon: ArrowLeft,
      tools: [
        { id: "unit-converter", name: "Unit Converter", icon: ArrowLeft },
      ]
    }
  ];

  useEffect(() => {
    if (toolsUsed === 5) {
      toast({
        title: "You're on a productivity streak!",
        description: "You've used 5 different tools. You're a toolkit pro!",
        duration: 3000
      });
    }
  }, [toolsUsed, toast]);

  const handleToolSelect = (toolId: string) => {
    triggerHaptic();
    setCurrentTool(toolId);
    setNavOpen(false);
    
    if (!localStorage.getItem(`tool-used-${toolId}`)) {
      localStorage.setItem(`tool-used-${toolId}`, 'true');
      const usedTools = Object.keys(localStorage)
        .filter(key => key.startsWith('tool-used-'))
        .length;
      setToolsUsed(usedTools);
    }
  };

  const allTools = categories.flatMap(category => 
    category.tools.map(tool => ({...tool, categoryColor: category.color}))
  );

  const handleSwipeLeft = () => {
    const currentIndex = allTools.findIndex(t => t.id === currentTool);
    if (currentIndex < allTools.length - 1) {
      handleToolSelect(allTools[currentIndex + 1].id);
      toast({
        title: allTools[currentIndex + 1].name,
        description: "Swiped to next tool",
        duration: 1500
      });
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = allTools.findIndex(t => t.id === currentTool);
    if (currentIndex > 0) {
      handleToolSelect(allTools[currentIndex - 1].id);
      toast({
        title: allTools[currentIndex - 1].name,
        description: "Swiped to previous tool",
        duration: 1500
      });
    }
  };

  const swipeRef = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 75
  });

  const filteredTools = categories
    .map(category => ({
      ...category,
      tools: category.tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category => category.tools.length > 0);

  const getCurrentTool = () => {
    for (const category of categories) {
      const tool = category.tools.find(t => t.id === currentTool);
      if (tool) {
        return { ...tool, categoryColor: category.color, categoryIcon: category.icon, categoryName: category.category };
      }
    }
    return null;
  };

  const currentToolInfo = getCurrentTool();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center w-full">
      <OfflineIndicator />
      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between py-4 md:py-6 animate-fade-in">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Logo */}
            <div className="h-11 w-11 md:h-12 md:w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-lg">
              <div className="h-8 w-8 md:h-9 md:w-9 overflow-hidden rounded-lg">
                <LottieAnimation
                  animationData={toolboxAnimation}
                  className="scale-110"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                ToolVault
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm font-medium hidden sm:block">
                Simple tools, elegant design
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {isStandalone && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium">
                <CloudOff className="h-4 w-4" />
                <span>Offline Ready</span>
              </div>
            )}
            <InstallPWAButton />
            <APIKeySettings />
            <AIAgent onNavigate={setCurrentTool} />
            <ThemeToggle />
            {isMobile && (
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    onClick={triggerHaptic}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85%] max-w-xs py-6 px-4 bg-card border-r-0"
                >
                  <div className="mb-6 flex items-center justify-center">
                    <WelcomeAnimation />
                  </div>
                  <div className="space-y-5">
                    {filteredTools.map((category, catIndex) => (
                      <div key={category.category} className="space-y-2 stagger-item" style={{ animationDelay: `${catIndex * 0.08}s` }}>
                        <div className={`category-header ${category.color}`}>
                          <category.icon className="h-4 w-4" />
                          <span>{category.category}</span>
                        </div>
                        <div className="space-y-1 pl-1">
                          {category.tools.map((tool) => (
                            <button
                              key={tool.id}
                              onClick={() => {
                                triggerHaptic();
                                handleToolSelect(tool.id);
                              }}
                              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 text-left text-sm ${
                                currentTool === tool.id
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-foreground hover:bg-secondary"
                              }`}
                            >
                              <tool.icon className="h-4 w-4" />
                              <span>{tool.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>

        {/* Search */}
        <div className="mb-6 md:mb-8 animate-slide-in-bottom stagger-2">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-card border-border"
            />
          </div>
        </div>

        {/* Main responsive layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 flex-grow">
          {/* Sidebar for desktop/tablet */}
          <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              {filteredTools.map((category, categoryIndex) => (
                <Card
                  key={category.category}
                  variant="modern"
                  className="overflow-hidden stagger-item"
                  style={{ animationDelay: `${categoryIndex * 0.08}s` }}
                >
                  <div className={`category-header ${category.color} rounded-t-2xl`}>
                    <category.icon className="h-4 w-4" />
                    <span>{category.category}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 py-2 px-2">
                    {category.tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          triggerHaptic();
                          handleToolSelect(tool.id);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-sm ${
                          currentTool === tool.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <tool.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 w-full pb-24 md:pb-0" ref={isMobile ? swipeRef : null}>
            {/* Swipe indicator for mobile */}
            {isMobile && (
              <div className="md:hidden mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ArrowLeft className="h-3 w-3" />
                <span>Swipe to navigate</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
            
            <Card variant="modern" className="overflow-hidden animate-scale-in">
              {/* Tool Header with gradient */}
              {currentToolInfo && (
                <div className={`${currentToolInfo.categoryColor} px-5 md:px-8 py-4 md:py-5`}>
                  <div className="flex items-center gap-4">
                    {/* Back button on mobile */}
                    <button 
                      onClick={() => setNavOpen(true)}
                      className="md:hidden w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                          {currentToolInfo.categoryName}
                        </span>
                      </div>
                      <h2 className="text-lg md:text-xl font-display font-bold text-white">
                        {currentToolInfo.name}
                      </h2>
                    </div>
                    
                    {/* Tool icon */}
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      {currentTool === "emi-calculator" ||
                        currentTool === "roi-calculator" ||
                        currentTool === "financial-planner" ? (
                        <LottieAnimation
                          animationData={calculatorAnimation}
                          className="h-7 w-7"
                        />
                      ) : (
                        <currentToolInfo.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tool Content */}
              <CardContent className="p-5 md:p-8">
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="animate-spin h-10 w-10 border-3 border-primary/30 rounded-full border-t-primary" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  </div>
                }>
                  {currentTool === "character-counter" && <CharacterCounter />}
                  {currentTool === "color-converter" && <ColorConverter />}
                  {currentTool === "age-calculator" && <AgeCalculator />}
                  {currentTool === "unit-converter" && <UnitConverter />}
                  {currentTool === "bmi-calculator" && <BMICalculator />}
                  {currentTool === "text-diff" && <TextDiffTool />}
                  {currentTool === "emi-calculator" && <EMICalculator />}
                  {currentTool === "roi-calculator" && <ROICalculator />}
                  {currentTool === "sleep-calculator" && <SleepCycleCalculator />}
                  {currentTool === "date-diff" && <DateDiffCalculator />}
                  {currentTool === "password-generator" && <PasswordGenerator />}
                  {currentTool === "whatsapp-link" && <WhatsAppLinkGenerator />}
                  {currentTool === "dice-roller" && <DiceRoller />}
                  {currentTool === "indian-number-format" && <NumberToIndianFormat />}
                  {currentTool === "stopwatch" && <StopWatch />}
                  {currentTool === "financial-planner" && <FinancialPlanner />}
                  {currentTool === "discount-calculator" && <DiscountCalculator />}
                  {currentTool === "grocery-comparator" && <GroceryPriceComparator />}
                  {currentTool === "decision-roulette" && <DecisionRoulette />}
                  {currentTool === "interest-calculator" && <InterestCalculator />}
                </Suspense>
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 md:hidden z-30 bg-card border-t border-border">
            <div className="flex justify-between items-center gap-0.5 px-2 py-2">
              {allTools.slice(0, 5).map((tool) => {
                const ToolIcon = tool.icon;
                const isActive = currentTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      triggerHaptic();
                      handleToolSelect(tool.id);
                    }}
                    className={`flex flex-col items-center py-1.5 px-2 flex-1 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10" 
                        : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      <ToolIcon className="h-4 w-4" />
                    </div>
                    <span className={`text-[10px] font-medium truncate ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {tool.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Footer */}
        <footer className="mt-8 md:mt-12 text-center text-sm text-muted-foreground py-6 animate-fade-in">
          <p>© {new Date().getFullYear()} <span className="font-semibold text-foreground">ToolVault</span> — All tools, beautifully designed.</p>
          <p className="text-xs mt-2">
            Made by{" "}
            <a 
              href="https://www.linkedin.com/in/ameyaagrawal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Ameya Agrawal
            </a>
          </p>
        </footer>
      </div>

      {/* Mobile FAB */}
      <MobileFAB
        allTools={allTools}
        onToolSelect={handleToolSelect}
        currentTool={currentTool}
      />
    </div>
  );
};

export default Index;