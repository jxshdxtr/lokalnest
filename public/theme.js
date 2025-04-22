// Immediately invoked function to avoid globals
(function() {
  // Check if user has already set a preference
  const storedTheme = localStorage.getItem('lokalNest-ui-theme');
  const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // If the user has explicitly chosen a theme, use that
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } 
  // If the user has explicitly chosen light, use that
  else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } 
  // Otherwise, respect the system preference
  else if (userPrefersDark) {
    document.documentElement.classList.add('dark');
  }
})(); 