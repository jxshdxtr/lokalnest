import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

// This script ensures the theme applies immediately without flash
const themeScript = `
  let isDarkMode = localStorage.getItem('lokalNest-ui-theme') === 'dark' || 
    (!localStorage.getItem('lokalNest-ui-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
`;

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'lokalNest-ui-theme',
  ...props
}: ThemeProviderProps) {
  // Apply the script to the document
  useEffect(() => {
    // Insert the script as a style element
    const styleEl = document.createElement('script');
    styleEl.innerHTML = themeScript;
    document.head.appendChild(styleEl);

    // Set up a MutationObserver to watch for changes to the HTML element's class
    // This ensures that the dark mode class is properly applied and maintained
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const htmlElement = document.documentElement;
          const darkMode = localStorage.getItem(storageKey) === 'dark';
          const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const shouldBeDark = darkMode || (!localStorage.getItem(storageKey) && systemDarkMode);
          
          if (shouldBeDark && !htmlElement.classList.contains('dark')) {
            htmlElement.classList.add('dark');
          } else if (!shouldBeDark && htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
          }
          
          // Also apply to body for components that might use body instead of html
          if (shouldBeDark) {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      document.head.removeChild(styleEl);
      observer.disconnect();
    };
  }, [storageKey]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// Re-export useTheme from next-themes
export { useTheme } from 'next-themes' 