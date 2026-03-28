import { useState } from 'react';
import { Settings, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAgentContext } from '@/contexts/AgentContext';

export const APIKeySettings = () => {
  const { apiKey, setApiKey } = useAgentContext();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleOpen = () => {
    setInputValue(apiKey);
    setSaved(false);
    setOpen(true);
  };

  const handleSave = () => {
    setApiKey(inputValue.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputValue('');
    setApiKey('');
    setSaved(false);
  };

  const maskedKey = apiKey ? `sk-...${apiKey.slice(-6)}` : '';

  return (
    <>
      <Button variant="ghost" size="icon" onClick={handleOpen} title="API Key Settings" className="relative">
        <Settings className="h-5 w-5" />
        {!apiKey && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-yellow-400" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              OpenAI API Key
            </DialogTitle>
            <DialogDescription>
              Your API key is stored locally in your browser and never sent anywhere except directly to OpenAI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {apiKey && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>Key saved: <span className="font-mono">{maskedKey}</span></span>
              </div>
            )}
            {!apiKey && (
              <div className="flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>No API key configured — AI features are disabled.</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="pr-10 font-mono text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowKey(v => !v)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your key at{' '}
                <span className="font-mono text-primary">platform.openai.com/api-keys</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1" disabled={!inputValue.trim()}>
                {saved ? <><Check className="h-4 w-4 mr-1" /> Saved!</> : 'Save Key'}
              </Button>
              {apiKey && (
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
