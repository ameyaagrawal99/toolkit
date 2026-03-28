import React, { useState } from 'react';
import { Star, Search, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Tool {
  id: string;
  name: string;
  icon: any;
  categoryColor: string;
}

interface MobileFABProps {
  allTools: Tool[];
  onToolSelect: (toolId: string) => void;
  currentTool: string;
}

const MobileFAB: React.FC<MobileFABProps> = ({ allTools, onToolSelect, currentTool }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteTools');
    return saved ? JSON.parse(saved) : [];
  });

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const toggleFavorite = (toolId: string) => {
    triggerHaptic();
    const newFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTools', JSON.stringify(newFavorites));
  };

  const handleToolSelect = (toolId: string) => {
    triggerHaptic();
    onToolSelect(toolId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const favoriteTools = allTools.filter(tool => favorites.includes(tool.id));
  const filteredTools = allTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* FAB Button - Enhanced with pulsing glow */}
      <button
        onClick={() => {
          triggerHaptic();
          setIsOpen(true);
        }}
        className="md:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 pulse-glow group"
      >
        <Sparkles className="h-6 w-6 group-hover:animate-wiggle transition-transform" />
        {favorites.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs border-2 border-white dark:border-gray-900 shadow-lg animate-bounce-gentle">
            {favorites.length}
          </Badge>
        )}
        {/* Outer glow ring */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-30 blur-md -z-10 group-hover:opacity-50 transition-opacity" />
      </button>

      {/* Favorites & Search Sheet - Enhanced */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-3xl border-t-0 glass-card-elevated overflow-hidden"
        >
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <SheetHeader className="mb-4 pt-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-bold text-shimmer flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-float-gentle" />
                {favorites.length > 0 ? 'Favorites & All Tools' : 'All Tools'}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:rotate-90 transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Search Bar - Enhanced */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 h-4 w-4" />
            <Input
              type="text"
              placeholder="✨ Search your favorite tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-2xl border-2 border-primary/20 focus-visible:border-primary/50 bg-white dark:bg-white"
            />
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(85vh-160px)] space-y-6 pb-8">
            {/* Favorites Section */}
            {favorites.length > 0 && searchQuery === '' && (
              <div className="stagger-item stagger-1">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 animate-float-gentle" />
                  FAVORITES
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {favoriteTools.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left card-hover-lift stagger-item ${
                          currentTool === tool.id
                            ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg shadow-primary/20'
                            : 'border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`h-11 w-11 rounded-xl ${tool.categoryColor} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <ToolIcon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-medium text-center line-clamp-2">{tool.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(tool.id);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        >
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 hover:scale-125 transition-transform" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Tools Section */}
            <div className="stagger-item stagger-2">
              {favorites.length > 0 && searchQuery === '' && (
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  ALL TOOLS
                </h3>
              )}
              <div className="space-y-2">
                {filteredTools.map((tool, index) => {
                  const ToolIcon = tool.icon;
                  const isFavorite = favorites.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 group stagger-item ${
                        currentTool === tool.id
                          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md'
                          : 'border-border/30 hover:border-primary/30 bg-card/30 backdrop-blur-sm hover:bg-card/60'
                      }`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className={`h-11 w-11 rounded-xl ${tool.categoryColor} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300`}>
                        <ToolIcon className="h-5 w-5 group-hover:animate-icon-bounce" />
                      </div>
                      <span className="flex-1 text-left font-medium">{tool.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-200"
                      >
                        <Star
                          className={`h-5 w-5 transition-all duration-200 ${
                            isFavorite
                              ? 'fill-amber-400 text-amber-400 scale-110'
                              : 'text-muted-foreground/40 hover:text-amber-400 hover:scale-110'
                          }`}
                        />
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileFAB;
