
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
import { useAgentContext } from '@/contexts/AgentContext';

export const TextDiffTool = () => {
  const { pendingParams, consumeParams } = useAgentContext();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [viewMode, setViewMode] = useState('side-by-side');
  const [diffResult, setDiffResult] = useState<{left: string, right: string, inline: string}>({
    left: '',
    right: '',
    inline: ''
  });

  useEffect(() => {
    if (pendingParams?.toolId === 'text-diff') {
      const p = pendingParams.params;
      if (p.text1 !== undefined) setText1(p.text1);
      if (p.text2 !== undefined) setText2(p.text2);
      consumeParams();
    }
  }, [pendingParams]);

  // Function to find the differences between two texts
  const findDiff = () => {
    // Simple implementation for character-level diff
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    let leftResult = '';
    let rightResult = '';
    let inlineResult = '';
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 === line2) {
        // Lines are identical
        leftResult += `<div class="diff-line">${escapeHtml(line1)}</div>`;
        rightResult += `<div class="diff-line">${escapeHtml(line2)}</div>`;
        inlineResult += `<div class="diff-line">${escapeHtml(line1)}</div>`;
      } else {
        // Lines are different, highlight the differences
        const charDiff = compareCharacters(line1, line2);
        
        leftResult += `<div class="diff-line diff-removed">${charDiff.first}</div>`;
        rightResult += `<div class="diff-line diff-added">${charDiff.second}</div>`;
        inlineResult += `<div class="diff-line diff-changed">${charDiff.inline}</div>`;
      }
    }
    
    setDiffResult({
      left: leftResult,
      right: rightResult,
      inline: inlineResult
    });
  };

  // Escape HTML special characters
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/ /g, '&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  };

  // Compare characters in two strings and highlight the differences
  const compareCharacters = (str1: string, str2: string) => {
    let result1 = '';
    let result2 = '';
    let resultInline = '';
    
    // Find longest common subsequence 
    const lcs = findLCS(str1, str2);
    
    let i1 = 0, i2 = 0, iLcs = 0;
    
    while (i1 < str1.length || i2 < str2.length) {
      // Characters in LCS
      while (iLcs < lcs.length && 
             i1 < str1.length && 
             i2 < str2.length && 
             str1[i1] === lcs[iLcs] && 
             str2[i2] === lcs[iLcs]) {
        result1 += escapeHtml(str1[i1]);
        result2 += escapeHtml(str2[i2]);
        resultInline += escapeHtml(str1[i1]);
        i1++;
        i2++;
        iLcs++;
      }
      
      // Characters only in str1
      while (i1 < str1.length && (iLcs >= lcs.length || str1[i1] !== lcs[iLcs])) {
        result1 += `<span class="bg-red-200 dark:bg-red-900">${escapeHtml(str1[i1])}</span>`;
        resultInline += `<span class="bg-red-200 dark:bg-red-900">${escapeHtml(str1[i1])}</span>`;
        i1++;
      }
      
      // Characters only in str2
      while (i2 < str2.length && (iLcs >= lcs.length || str2[i2] !== lcs[iLcs])) {
        result2 += `<span class="bg-green-200 dark:bg-green-900">${escapeHtml(str2[i2])}</span>`;
        resultInline += `<span class="bg-green-200 dark:bg-green-900">${escapeHtml(str2[i2])}</span>`;
        i2++;
      }
    }
    
    return {
      first: result1,
      second: result2,
      inline: resultInline
    };
  };

  // Find Longest Common Subsequence
  const findLCS = (str1: string, str2: string) => {
    if (!str1 || !str2) return '';
    
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    // Fill dp table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find the LCS
    let lcs = '';
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (str1[i - 1] === str2[j - 1]) {
        lcs = str1[i - 1] + lcs;
        i--; j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return lcs;
  };

  // Handle the diff calculation when either text changes
  useEffect(() => {
    if (text1 && text2) {
      findDiff();
    }
  }, [text1, text2]);

  const handleCopyDiff = () => {
    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div');
    if (viewMode === 'side-by-side') {
      tempDiv.innerHTML = `Left:\n${text1}\n\nRight:\n${text2}`;
    } else {
      // For inline view, try to create a plain text representation
      const stripHtml = (html: string) => {
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
      };
      
      tempDiv.innerHTML = diffResult.inline;
      const plainText = stripHtml(diffResult.inline);
      tempDiv.innerHTML = `Diff Result:\n${plainText}`;
    }
    
    // Copy the text content
    navigator.clipboard.writeText(tempDiv.textContent || '');
    
    toast({
      title: "Copied!",
      description: "Diff result has been copied to your clipboard."
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Text Diff Tool</h2>
        <p className="text-gray-500 dark:text-gray-400">Compare two texts and highlight the differences.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Original Text</label>
            <Textarea 
              placeholder="Enter the original text here..." 
              value={text1} 
              onChange={(e) => setText1(e.target.value)}
              className="h-40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Modified Text</label>
            <Textarea 
              placeholder="Enter the modified text here..." 
              value={text2} 
              onChange={(e) => setText2(e.target.value)}
              className="h-40"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger value="inline">Inline</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" onClick={handleCopyDiff} disabled={!text1 || !text2}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Diff
          </Button>
        </div>

        {text1 && text2 && (
          <div className="border rounded-md overflow-hidden">
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
              <TabsContent value="side-by-side" className="m-0">
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-96">
                    <div className="font-mono text-sm whitespace-pre" 
                      dangerouslySetInnerHTML={{ __html: diffResult.left }} />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-96">
                    <div className="font-mono text-sm whitespace-pre" 
                      dangerouslySetInnerHTML={{ __html: diffResult.right }} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="inline" className="m-0">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-96">
                  <div className="font-mono text-sm whitespace-pre" 
                    dangerouslySetInnerHTML={{ __html: diffResult.inline }} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <div className="flex gap-2 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-200 dark:bg-red-900 mr-1"></span>
            <span>Removed</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-200 dark:bg-green-900 mr-1"></span>
            <span>Added</span>
          </div>
        </div>
      </div>
    </div>
  );
};
