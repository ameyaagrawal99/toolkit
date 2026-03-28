import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        
        toast({
          title: `${newTheme === 'dark' ? '🌙' : '☀️'} Theme Changed`,
          description: `Switched to ${newTheme} mode`,
          duration: 2000
        });
      }}
      className="rounded-full h-10 w-10 bg-white dark:bg-gray-800 shadow-md border-2 border-gray-100 dark:border-gray-700"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
