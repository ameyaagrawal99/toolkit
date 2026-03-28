
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Copy, Check, Send } from 'lucide-react';
import { useAgentContext } from '@/contexts/AgentContext';

export const WhatsAppLinkGenerator = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (pendingParams?.toolId === 'whatsapp-link') {
      const p = pendingParams.params;
      if (p.phoneNumber !== undefined) setPhoneNumber(p.phoneNumber);
      if (p.message !== undefined) setMessage(p.message);
      consumeParams();
    }
  }, [pendingParams]);

  useEffect(() => {
    // Generate link whenever inputs change
    if (phoneNumber) {
      let link = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;
      if (message) {
        link += `?text=${encodeURIComponent(message)}`;
      }
      setGeneratedLink(link);
    } else {
      setGeneratedLink('');
    }
  }, [phoneNumber, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to generate a link",
        variant: "destructive"
      });
      return;
    }
    
    // Show success toast
    toast({
      title: "Link generated! 🚀",
      description: "Your WhatsApp link is ready to share",
    });
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your WhatsApp link is ready to share.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const openWhatsApp = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">WhatsApp Link Generator</h2>
        <p className="text-gray-500 dark:text-gray-400">Create shareable WhatsApp message links with prefilled text.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number (with country code)</Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+91xxxxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">Include country code (e.g., +1 for US, +91 for India)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Hello! I'm reaching out to you regarding..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit">
            <span className="mr-2">Generate Link</span>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {generatedLink && (
        <Card className="overflow-hidden bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-green-700 dark:text-green-400">Your WhatsApp Link</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="pr-12 font-mono bg-white dark:bg-gray-800"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="absolute right-0 top-0 h-10"
                >
                  {copied ? <Check /> : <Copy />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={openWhatsApp} variant="outline" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-600">
                <span className="mr-2">Open in WhatsApp</span>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-xs text-center text-green-700 dark:text-green-400">
              This link will open WhatsApp with your prefilled message ready to send
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
