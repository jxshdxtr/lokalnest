import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme, resolvedTheme } = useTheme()

  // When mounted on client, allow theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme change
  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme)

    // Force apply dark mode class immediately for a more responsive feel
    const html = document.documentElement
    const isDarkTheme = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDarkTheme) {
      html.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      html.classList.remove('dark')
      document.body.classList.remove('dark')
    }

    // Store theme in localStorage for immediate access on page load
    localStorage.setItem('lokalNest-ui-theme', newTheme)
    
    // Force a re-render of components by adding and removing a utility class
    document.body.classList.add('theme-change')
    setTimeout(() => {
      document.body.classList.remove('theme-change')
    }, 10)
  }

  // If not mounted yet, render a placeholder to avoid layout shift
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => toggleTheme("light")}
          className={theme === 'light' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => toggleTheme("dark")}
          className={theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => toggleTheme("system")}
          className={theme === 'system' ? 'bg-accent text-accent-foreground' : ''}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 