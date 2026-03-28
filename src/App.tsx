import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmbedTool from "./pages/EmbedTool";
import EmbedIndex from "./pages/EmbedIndex";
import { AgentProvider } from "./contexts/AgentContext";

const queryClient = new QueryClient();

const App = () => (
  <AgentProvider>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="toolbox-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/embed" element={<EmbedIndex />} />
            <Route path="/embed/:toolSlug" element={<EmbedTool />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </AgentProvider>
);

export default App;
