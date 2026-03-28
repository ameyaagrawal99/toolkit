
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash2, Type, FileText, MessageSquare, AlignLeft, Lightbulb } from "lucide-react";
import { BigResultCard } from "@/components/ui/big-result-card";
import { ProTip } from "@/components/ui/pro-tip";
import { PresetButtons } from "@/components/ui/preset-buttons";

export const CharacterCounter = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0
  });
  const [charLimit, setCharLimit] = useState(280);

  useEffect(() => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n+/).filter(s => s.trim().length > 0).length;
    
    setStats({
      chars: text.length,
      words,
      sentences,
      paragraphs
    });

    if (words === 100 && text.trim() !== '') {
      toast({
        title: "You've hit 100 words! 🥳",
        description: "Keep the creativity flowing!"
      });
    }

    if (text.length > charLimit * 0.95 && text.length <= charLimit) {
      toast({
        title: "Careful! ⚠️",
        description: "You're at 95% of your character limit!"
      });
    }
  }, [text, charLimit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Your text is now ready to paste anywhere."
    });
  };

  const handleClear = () => {
    setText('');
    toast({
      title: "All clear!",
      description: "Ready for new thoughts."
    });
  };

  const limitPresets = [
    { label: 'SMS (160)', value: 160 },
    { label: 'Twitter (280)', value: 280 },
    { label: 'Meta (500)', value: 500 },
    { label: 'Instagram (2200)', value: 2200 },
  ];

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(stats.words / wordsPerMinute);
    return minutes < 1 ? 'Less than 1 min' : `${minutes} min read`;
  };

  const getCharVariant = (): 'success' | 'warning' | 'danger' | 'default' => {
    const percentage = (stats.chars / charLimit) * 100;
    if (percentage > 100) return 'danger';
    if (percentage > 90) return 'warning';
    if (percentage > 50) return 'success';
    return 'default';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient-blue">Character Counter</h2>
        <p className="text-muted-foreground">Count characters, words, sentences and paragraphs as you type.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BigResultCard
          label="Characters"
          value={stats.chars.toLocaleString()}
          icon={Type}
          variant={getCharVariant()}
        />
        <BigResultCard
          label="Words"
          value={stats.words.toLocaleString()}
          icon={FileText}
          variant="default"
        />
        <BigResultCard
          label="Sentences"
          value={stats.sentences.toLocaleString()}
          icon={MessageSquare}
          variant="default"
        />
        <BigResultCard
          label="Paragraphs"
          value={stats.paragraphs.toLocaleString()}
          icon={AlignLeft}
          variant="default"
        />
      </div>

      {/* Character Limit */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Character Limit</h3>
              <PresetButtons
                options={limitPresets}
                value={charLimit}
                onChange={(val) => setCharLimit(val as number)}
                size="sm"
              />
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${stats.chars > charLimit ? 'text-red-500' : 'text-foreground'}`}>
                {stats.chars}/{charLimit}
              </p>
              <p className="text-sm text-muted-foreground">{getReadingTime()}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                stats.chars > charLimit 
                  ? 'bg-red-500' 
                  : stats.chars > charLimit * 0.9 
                    ? 'bg-amber-500' 
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, (stats.chars / charLimit) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Area */}
      <div className="space-y-4">
        <Textarea 
          placeholder="Start typing here..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className={`min-h-[200px] text-base ${stats.chars > charLimit ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCopy} disabled={!text}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={!text}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Pro Tip */}
      <ProTip icon={Lightbulb} title="Writing Tips" variant="info">
        Optimal social media lengths: Twitter 71-100 chars for engagement, LinkedIn 50-100 words for posts, 
        and Instagram 138-150 characters for captions.
      </ProTip>
    </div>
  );
};
