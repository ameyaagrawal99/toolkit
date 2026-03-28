import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, TrendingDown, Award, Copy, RotateCcw, Info, Sparkles, Save, History, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentContext } from '@/contexts/AgentContext';

interface Product {
  id: number;
  name: string;
  weight: number;
  weightUnit: 'g' | 'kg' | 'ml' | 'l';
  mrp: number;
  currentPrice: number;
}

interface SavedComparison {
  id: string;
  name: string;
  timestamp: number;
  products: Product[];
}

const STORAGE_KEY = 'grocery-comparison-history';

export const GroceryPriceComparator = () => {
  const { toast } = useToast();
  const { pendingParams, consumeParams } = useAgentContext();
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Pack 1', weight: 500, weightUnit: 'g', mrp: 120, currentPrice: 100 },
    { id: 2, name: 'Pack 2', weight: 1000, weightUnit: 'g', mrp: 200, currentPrice: 180 },
  ]);
  const [nextId, setNextId] = useState(3);
  const [showInsights, setShowInsights] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedComparisons(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (pendingParams?.toolId === 'grocery-comparator') {
      const p = pendingParams.params;
      if (p.products && Array.isArray(p.products)) {
        let idCounter = 1;
        const mapped: Product[] = p.products.map((item: any) => ({
          id: idCounter++,
          name: item.name ?? `Product ${idCounter}`,
          weight: item.weight ?? 1,
          weightUnit: item.weightUnit ?? 'g',
          mrp: item.mrp ?? item.price ?? 0,
          currentPrice: item.price ?? 0,
        }));
        setProducts(mapped);
        setNextId(idCounter);
      }
      consumeParams();
    }
  }, [pendingParams]);

  // Show insights when we have valid comparison data
  useEffect(() => {
    const hasValidData = products.some(p => p.weight > 0 && p.currentPrice > 0);
    setShowInsights(hasValidData);
  }, [products]);

  const addProduct = () => {
    setProducts([...products, {
      id: nextId,
      name: `Pack ${nextId}`,
      weight: 0,
      weightUnit: 'g',
      mrp: 0,
      currentPrice: 0
    }]);
    setNextId(nextId + 1);
  };

  const removeProduct = (id: number) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Product removed",
        duration: 2000,
      });
    }
  };

  const duplicateProduct = (product: Product) => {
    const newProduct = {
      ...product,
      id: nextId,
      name: `${product.name} (Copy)`,
    };
    setProducts([...products, newProduct]);
    setNextId(nextId + 1);
    toast({
      title: "Product duplicated",
      description: "Edit the details to compare similar items",
      duration: 2000,
    });
  };

  const resetAllProducts = () => {
    setProducts([
      { id: nextId, name: 'Pack 1', weight: 0, weightUnit: 'g', mrp: 0, currentPrice: 0 },
    ]);
    setNextId(nextId + 1);
    toast({
      title: "Reset complete",
      description: "Start fresh with a new comparison",
      duration: 2000,
    });
  };

  const saveComparison = () => {
    if (!comparisonName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this comparison",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const newComparison: SavedComparison = {
      id: Date.now().toString(),
      name: comparisonName.trim(),
      timestamp: Date.now(),
      products: products,
    };

    const updated = [newComparison, ...savedComparisons];
    setSavedComparisons(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    setComparisonName('');
    setSaveDialogOpen(false);
    toast({
      title: "Comparison saved",
      description: `"${newComparison.name}" has been saved to history`,
      duration: 2000,
    });
  };

  const loadComparison = (comparison: SavedComparison) => {
    setProducts(comparison.products);
    const maxId = Math.max(...comparison.products.map(p => p.id));
    setNextId(maxId + 1);
    setHistoryDialogOpen(false);
    toast({
      title: "Comparison loaded",
      description: `"${comparison.name}" has been loaded`,
      duration: 2000,
    });
  };

  const deleteComparison = (id: string) => {
    const updated = savedComparisons.filter(c => c.id !== id);
    setSavedComparisons(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast({
      title: "Comparison deleted",
      duration: 2000,
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const updateProduct = (id: number, field: keyof Product, value: any) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        // Validate: MRP should be >= current price
        if (field === 'currentPrice' && updated.mrp > 0 && value > updated.mrp) {
          return { ...updated, currentPrice: updated.mrp };
        }
        if (field === 'mrp' && updated.currentPrice > 0 && value < updated.currentPrice) {
          return { ...updated, mrp: updated.currentPrice };
        }
        return updated;
      }
      return p;
    }));
  };

  // Convert all weights to base unit (grams or ml)
  const normalizeWeight = (weight: number, unit: string): number => {
    if (unit === 'kg') return weight * 1000;
    if (unit === 'l') return weight * 1000;
    return weight;
  };

  // Calculate price per base unit (MRP-based or Current Price-based)
  const calculateUnitPrice = (product: Product, useMRP: boolean = false) => {
    const normalizedWeight = normalizeWeight(product.weight, product.weightUnit);
    if (normalizedWeight === 0) return 0;
    
    const price = useMRP ? product.mrp : product.currentPrice;
    return price / normalizedWeight;
  };

  // Calculate MRP discount percentage
  const calculateMRPDiscount = (product: Product): number => {
    if (product.mrp === 0) return 0;
    return ((product.mrp - product.currentPrice) / product.mrp) * 100;
  };

  // Find the cheapest product
  const findBestDeal = (): { basedOnMRP: number; basedOnCurrentPrice: number } => {
    if (products.length === 0) return { basedOnMRP: -1, basedOnCurrentPrice: -1 };

    let minBasedOnMRP = 0;
    let minBasedOnCurrentPrice = 0;
    let minPriceMRP = calculateUnitPrice(products[0], true);
    let minPriceCurrent = calculateUnitPrice(products[0], false);

    products.forEach((product, index) => {
      const priceMRP = calculateUnitPrice(product, true);
      const priceCurrent = calculateUnitPrice(product, false);

      if (priceMRP > 0 && priceMRP < minPriceMRP) {
        minBasedOnMRP = index;
        minPriceMRP = priceMRP;
      }

      if (priceCurrent > 0 && priceCurrent < minPriceCurrent) {
        minBasedOnCurrentPrice = index;
        minPriceCurrent = priceCurrent;
      }
    });

    return { basedOnMRP: minBasedOnMRP, basedOnCurrentPrice: minBasedOnCurrentPrice };
  };

  const bestDeal = findBestDeal();

  // Calculate savings compared to most expensive
  const calculateSavings = (productIndex: number): number => {
    const prices = products.map(p => calculateUnitPrice(p, false)).filter(p => p > 0);
    if (prices.length === 0) return 0;
    
    const maxPrice = Math.max(...prices);
    const currentPrice = calculateUnitPrice(products[productIndex], false);
    
    if (currentPrice === 0) return 0;
    return ((maxPrice - currentPrice) / maxPrice) * 100;
  };

  // Get display unit (kg or L for base unit display)
  const getDisplayUnit = (unit: string): string => {
    if (unit === 'g' || unit === 'kg') return 'kg';
    return 'L';
  };

  // Calculate insights
  const getInsights = () => {
    if (!showInsights) return null;
    
    const validProducts = products.filter(p => p.weight > 0 && p.currentPrice > 0);
    if (validProducts.length === 0) return null;

    const bestProduct = products[bestDeal.basedOnCurrentPrice];
    const worstPrice = Math.max(...validProducts.map(p => calculateUnitPrice(p, false)));
    const bestPrice = Math.min(...validProducts.map(p => calculateUnitPrice(p, false)));
    const potentialSavings = ((worstPrice - bestPrice) / worstPrice) * 100;

    return {
      bestProduct,
      potentialSavings,
      productsCompared: validProducts.length,
    };
  };

  const insights = getInsights();

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-3 text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Grocery Price Comparator
          </h2>
          <p className="text-muted-foreground text-lg">Compare pack sizes to find the best value</p>
        </div>

        {/* Quick Insights Card */}
        {insights && (
          <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-green-600" />
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Best Deal</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{insights.bestProduct.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <p className="font-bold text-lg">
                    {insights.potentialSavings > 0 ? `${insights.potentialSavings.toFixed(1)}%` : 'Same price'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Products Compared</p>
                  <p className="font-bold text-lg">{insights.productsCompared}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Input Section */}
          <Card className="glass-card border-2 hover:border-primary/20 transition-colors">
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex-1">
                  <Label className="text-lg font-semibold">Products to Compare</Label>
                  <p className="text-sm text-muted-foreground mt-1">Add products with their pack sizes and prices</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="default"
                        variant="outline"
                        className="gap-2 flex-1 sm:flex-none relative"
                      >
                        <History className="h-4 w-4" />
                        History
                        {savedComparisons.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1.5 min-w-[20px] h-5">
                            {savedComparisons.length}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Saved Comparisons
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        {savedComparisons.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No saved comparisons yet</p>
                            <p className="text-sm mt-2">Save your first comparison to see it here</p>
                          </div>
                        ) : (
                          <div className="space-y-3 pr-4">
                            {savedComparisons.map((comparison) => (
                              <Card key={comparison.id} className="hover:shadow-md transition-shadow border-2">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-lg truncate">{comparison.name}</h3>
                                      <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{formatTimestamp(comparison.timestamp)}</span>
                                      </div>
                                      <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {comparison.products.length} products
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        onClick={() => loadComparison(comparison)}
                                        className="gap-2"
                                      >
                                        Load
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteComparison(comparison.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="default"
                        variant="outline"
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Save className="h-5 w-5" />
                          Save Comparison
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="comparison-name">Comparison Name</Label>
                          <Input
                            id="comparison-name"
                            placeholder="e.g., Rice brands comparison"
                            value={comparisonName}
                            onChange={(e) => setComparisonName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveComparison()}
                          />
                          <p className="text-xs text-muted-foreground">
                            Give your comparison a memorable name
                          </p>
                        </div>
                        <Button onClick={saveComparison} className="w-full gap-2">
                          <Save className="h-4 w-4" />
                          Save Comparison
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    onClick={resetAllProducts} 
                    size="default"
                    variant="outline"
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button 
                    onClick={addProduct} 
                    size="default" 
                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex-1 sm:flex-none"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>

              {products.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Start by adding products to compare their value per unit
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {products.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="p-5 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          className="font-semibold text-base bg-background/50 border-2"
                          placeholder="e.g., Brand 500g pack"
                        />
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => duplicateProduct(product)}
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 hover:bg-green-100 dark:hover:bg-green-900/30"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate product</TooltipContent>
                          </Tooltip>
                          {products.length > 1 && (
                            <Button
                              onClick={() => removeProduct(product.id)}
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Weight/Volume
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>Enter the pack size</TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            value={product.weight || ''}
                            onChange={(e) => updateProduct(product.id, 'weight', parseFloat(e.target.value) || 0)}
                            placeholder="e.g., 500"
                            className="bg-background border-2"
                            min="0"
                            step="any"
                          />
                        </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Unit</Label>
                        <Select 
                          value={product.weightUnit} 
                          onValueChange={(value) => updateProduct(product.id, 'weightUnit', value)}
                        >
                          <SelectTrigger className="bg-background border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g (grams)</SelectItem>
                            <SelectItem value="kg">kg (kilograms)</SelectItem>
                            <SelectItem value="ml">ml (milliliters)</SelectItem>
                            <SelectItem value="l">L (liters)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            MRP (₹)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>Maximum Retail Price</TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            value={product.mrp || ''}
                            onChange={(e) => updateProduct(product.id, 'mrp', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="bg-background border-2"
                            min="0"
                            step="any"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Current Price (₹)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>Actual selling price (after discount)</TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            value={product.currentPrice || ''}
                            onChange={(e) => updateProduct(product.id, 'currentPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="bg-background border-2"
                            min="0"
                            step="any"
                          />
                        </div>
                      </div>

                      {product.mrp > 0 && product.currentPrice > 0 && product.mrp > product.currentPrice && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 animate-fade-in">
                          <Badge className="bg-green-600 text-white">
                            {calculateMRPDiscount(product).toFixed(1)}% OFF
                          </Badge>
                          <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                            Save ₹{(product.mrp - product.currentPrice).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Real-time unit price preview */}
                      {product.weight > 0 && product.currentPrice > 0 && (
                        <div className="text-xs text-muted-foreground p-2 bg-background/50 rounded border animate-fade-in">
                          Rate: ₹{(calculateUnitPrice(product, false) * 1000).toFixed(2)}/{getDisplayUnit(product.weightUnit)}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="glass-card border-2 hover:border-primary/20 transition-colors">
            <CardContent className="pt-8 pb-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Price Comparison Results
                </h3>
                <p className="text-sm text-muted-foreground mt-2">Detailed breakdown of value per unit</p>
              </div>
            
              <div className="overflow-x-auto rounded-lg border-2">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Size</TableHead>
                      <TableHead className="font-semibold">MRP</TableHead>
                      <TableHead className="font-semibold">Current Price</TableHead>
                      <TableHead className="font-semibold">
                        Rate at MRP
                        <br/>
                        <span className="text-xs font-normal">(per {products.length > 0 ? getDisplayUnit(products[0].weightUnit) : 'unit'})</span>
                      </TableHead>
                      <TableHead className="font-semibold">
                        Rate at Current
                        <br/>
                        <span className="text-xs font-normal">(per {products.length > 0 ? getDisplayUnit(products[0].weightUnit) : 'unit'})</span>
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {products.map((product, index) => {
                    const normalizedWeight = normalizeWeight(product.weight, product.weightUnit);
                    const unitPriceAtMRP = calculateUnitPrice(product, true);
                    const unitPriceAtCurrent = calculateUnitPrice(product, false);
                    const mrpDiscount = calculateMRPDiscount(product);
                    const isBestAtMRP = index === bestDeal.basedOnMRP;
                    const isBestAtCurrent = index === bestDeal.basedOnCurrentPrice;
                    
                    return (
                      <TableRow 
                        key={product.id}
                        className={isBestAtCurrent ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 border-l-4 border-green-500' : 'hover:bg-muted/30'}
                      >
                        <TableCell className="font-semibold text-base">{product.name}</TableCell>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono">
                            {product.weight} {product.weightUnit}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-base">
                          <span className="text-muted-foreground line-through">₹{product.mrp.toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-base">
                          <div className="flex flex-col gap-1">
                            <span className="text-green-600 dark:text-green-400">₹{product.currentPrice.toFixed(2)}</span>
                            {mrpDiscount > 0 && (
                              <Badge className="bg-green-600 text-white w-fit">
                                {mrpDiscount.toFixed(0)}% OFF
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          <div className="flex flex-col gap-1">
                            <span>₹{(unitPriceAtMRP * 1000).toFixed(2)}</span>
                            {isBestAtMRP && normalizedWeight > 0 && product.mrp > 0 && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-500/30 w-fit">
                                Best at MRP
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-base">
                          <div className="flex flex-col gap-1">
                            <span className="text-green-600 dark:text-green-400">₹{(unitPriceAtCurrent * 1000).toFixed(2)}</span>
                            {isBestAtCurrent && normalizedWeight > 0 && (
                              <Badge className="bg-green-600 text-white flex items-center gap-1 w-fit">
                                <Award className="h-3 w-3" />
                                Cheapest
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isBestAtCurrent && normalizedWeight > 0 ? (
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm px-3 py-1">
                              ⭐ Best Value
                            </Badge>
                          ) : normalizedWeight > 0 && unitPriceAtCurrent > 0 ? (
                            <span className="text-sm text-muted-foreground font-medium">
                              +{calculateSavings(index).toFixed(1)}% cost
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {products.length > 0 && bestDeal.basedOnCurrentPrice >= 0 && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                      🎯 Best Deal: {products[bestDeal.basedOnCurrentPrice].name}
                    </p>
                    <p className="text-base text-green-700 dark:text-green-300 leading-relaxed">
                      At <span className="font-bold">₹{(calculateUnitPrice(products[bestDeal.basedOnCurrentPrice], false) * 1000).toFixed(2)}</span> per {getDisplayUnit(products[bestDeal.basedOnCurrentPrice].weightUnit)}, 
                      this offers the <span className="font-bold">best value for money</span> at current prices. 
                      {calculateSavings(bestDeal.basedOnCurrentPrice) > 0 && (
                        <span> You save up to <span className="font-bold">{calculateSavings(bestDeal.basedOnCurrentPrice).toFixed(1)}%</span> compared to other options!</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
};