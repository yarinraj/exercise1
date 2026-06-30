export const Colors = {
  // Light mode color palette (Day mode configurations)
  light: {
    background: '#f8f5ef', // Main application background color for day mode
    card: '#ffffff',       // Background color for cards and containers
    text: '#202125',       // Primary text color for headers and titles
    textMuted: '#7b8490',  // Muted text color for subtitles and descriptions
    border: '#eaeaea',     // Border color for dividers and separators
    inputBg: '#f1f3f5',    // Background color for input fields and search bars
    inputBorder: '#eee',   // Border color for inactive input fields
    primary: '#00c2e8',    // Brand primary theme color (cyan)
    danger: '#d62828',     // Color for logout actions or error indicators
  },
  
  // Dark mode color palette (Night mode configurations matching the web CSS)
  dark: {
    background: '#121212', // Standard dark background color for the application
    card: '#1e1e1e',       // Background for cards and list items (.card in CSS)
    text: '#ffffff',       // Force text to be white (.text-dark, h1, h2, labels)
    textMuted: '#ced4da',  // Lightened muted text for descriptions and prices
    border: '#333333',     // Border color for dark cards and list items
    inputBg: '#2a2a2a',    // Background color for input fields (.wolt-input)
    inputBorder: '#444444',// Border color for inactive dark input fields
    primary: '#00c2e8',    // Brand primary color remains consistent in both modes
    danger: '#ff4a4a',     // Slightly brighter red for high contrast in dark mode
  }
};