import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayCircle, PauseCircle, RefreshCw, Flag, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const StopWatch = () => {
  const [time, setTime] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startStopwatch = () => {
    if (running) return;
    
    setRunning(true);
    startTimeRef.current = Date.now() - accumulatedTimeRef.current;
    
    intervalRef.current = window.setInterval(() => {
      setTime(Date.now() - startTimeRef.current);
    }, 10);
  };

  const stopStopwatch = () => {
    if (!running) return;
    
    clearInterval(intervalRef.current as number);
    accumulatedTimeRef.current = time;
    setRunning(false);
  };

  const resetStopwatch = () => {
    clearInterval(intervalRef.current as number);
    setTime(0);
    setLaps([]);
    setRunning(false);
    accumulatedTimeRef.current = 0;
  };

  const recordLap = () => {
    if (!running) return;
    setLaps([time, ...laps]);
  };

  const clearLaps = () => {
    setLaps([]);
    toast({
      title: "Laps cleared",
      description: "All lap records have been removed.",
    });
  };

  const exportData = () => {
    const data = {
      totalTime: formatTime(time),
      laps: laps.map((lapTime, index) => ({
        lapNumber: laps.length - index,
        splitTime: formatTime(calculateSplitTime(index)),
        totalTime: formatTime(lapTime)
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stopwatch-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Stopwatch data has been downloaded.",
    });
  };

  // Format time to hh:mm:ss.ms
  const formatTime = (time: number) => {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor(time / (1000 * 60 * 60));
    
    return `${hours > 0 ? hours.toString().padStart(2, '0') + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Calculate split time (time between consecutive laps)
  const calculateSplitTime = (index: number) => {
    if (index === laps.length - 1) return laps[index];
    return laps[index] - laps[index + 1];
  };

  // Find the fastest and slowest split times
  const findFastestSlowestSplit = () => {
    if (laps.length <= 1) return { fastest: -1, slowest: -1 };
    
    let fastest = 0;
    let slowest = 0;
    let fastestTime = calculateSplitTime(0);
    let slowestTime = calculateSplitTime(0);
    
    for (let i = 0; i < laps.length; i++) {
      const splitTime = calculateSplitTime(i);
      
      if (splitTime < fastestTime) {
        fastest = i;
        fastestTime = splitTime;
      }
      
      if (splitTime > slowestTime) {
        slowest = i;
        slowestTime = splitTime;
      }
    }
    
    return { fastest, slowest };
  };

  const { fastest, slowest } = findFastestSlowestSplit();

  // Calculate average split time
  const calculateAverageSplit = () => {
    if (laps.length === 0) return '00:00.00';
    const total = laps[0];
    const average = total / laps.length;
    return formatTime(average);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Stopwatch
        </h2>
        <p className="text-muted-foreground">Precision timing with lap tracking and split analysis.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card className="glass-card backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-xl border-2">
            <CardContent className="pt-10 pb-6 px-6">
              <div className="relative flex flex-col items-center">
                <div 
                  className={`text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 transition-all duration-300 ${running ? 'scale-105 animate-pulse' : 'scale-100'}`}
                >
                  {formatTime(time)}
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={running ? "default" : time > 0 ? "secondary" : "outline"}>
                    {running ? "Running" : time > 0 ? "Paused" : "Ready"}
                  </Badge>
                  {laps.length > 0 && (
                    <Badge variant="outline" className="bg-blue-500/10">
                      {laps.length} {laps.length === 1 ? 'Lap' : 'Laps'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-3 pb-8 flex-wrap">
              {!running ? (
                <Button 
                  onClick={startStopwatch} 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  size="icon"
                >
                  <PlayCircle className="h-8 w-8" />
                </Button>
              ) : (
                <Button 
                  onClick={stopStopwatch} 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                  size="icon"
                >
                  <PauseCircle className="h-8 w-8" />
                </Button>
              )}
              
              <Button 
                onClick={recordLap} 
                disabled={!running}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="icon"
              >
                <Flag className="h-6 w-6" />
              </Button>
              
              <Button 
                onClick={resetStopwatch} 
                disabled={time === 0}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="icon"
              >
                <RefreshCw className="h-6 w-6" />
              </Button>
            </CardFooter>
          </Card>

          {laps.length > 0 && (
            <Card className="glass-card mt-4">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Split</p>
                    <p className="text-xl font-mono font-bold">{calculateAverageSplit()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={exportData} 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button 
                      onClick={clearLaps} 
                      variant="outline" 
                      size="sm"
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex flex-col">
          <Card className="glass-card flex-1">
            <CardContent className="pt-6 pb-4">
              <h3 className="mb-4 font-semibold text-lg">Lap Times</h3>
              
              {laps.length > 0 ? (
                <div className="overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-20">Lap</TableHead>
                        <TableHead>Split Time</TableHead>
                        <TableHead>Total Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laps.map((lapTime, index) => (
                        <TableRow 
                          key={index} 
                          className={
                            index === fastest ? "bg-green-50/50 dark:bg-green-900/20" : 
                            index === slowest ? "bg-amber-50/50 dark:bg-amber-900/20" : ""
                          }
                        >
                          <TableCell className="font-medium">
                            #{laps.length - index}
                          </TableCell>
                          <TableCell className="font-mono font-semibold">
                            <div className="flex items-center gap-2">
                              {formatTime(calculateSplitTime(index))}
                              {index === fastest && laps.length > 1 && (
                                <Badge variant="outline" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs">
                                  Fastest
                                </Badge>
                              )}
                              {index === slowest && laps.length > 1 && (
                                <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
                                  Slowest
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {formatTime(lapTime)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Flag className="h-12 w-12 mb-3 opacity-30" />
                  <p className="font-medium">No laps recorded yet</p>
                  <p className="text-sm mt-1">Start the stopwatch and press the flag button to record laps</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};