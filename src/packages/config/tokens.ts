/**
 * Tech Inject Design Library — Design Tokens & Theme Configuration
 *
 * Strict Black + White / Grayscale Visual System.
 * Solid colors only. No gradients. No color accents.
 */

export const THEME_TOKENS = {
  colors: {
    background: '#090909',
    backgroundSubtle: '#0D0D0D',
    surface: '#111111',
    surfaceElevated: '#161616',
    surfaceHover: '#1c1c1c',
    surfaceActive: '#222222',
    border: '#262626',
    borderStrong: '#333333',
    borderSubtle: '#1a1a1a',
    primaryText: '#F5F5F5',
    secondaryText: '#A3A3A3',
    mutedText: '#737373',
    white: '#FFFFFF',
    black: '#000000',
    // Strict status representations in pure monochrome
    status: {
      neutral: '#A3A3A3',
      active: '#FFFFFF',
      subtle: '#262626',
      alert: '#E5E5E5',
    },
  },
  typography: {
    fontSans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
  },
  radii: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
} as const;

export const CSS_VARS_DECLARATION = `
  --background: ${THEME_TOKENS.colors.background};
  --background-subtle: ${THEME_TOKENS.colors.backgroundSubtle};
  --surface: ${THEME_TOKENS.colors.surface};
  --surface-elevated: ${THEME_TOKENS.colors.surfaceElevated};
  --surface-hover: ${THEME_TOKENS.colors.surfaceHover};
  --surface-active: ${THEME_TOKENS.colors.surfaceActive};
  --border: ${THEME_TOKENS.colors.border};
  --border-strong: ${THEME_TOKENS.colors.borderStrong};
  --border-subtle: ${THEME_TOKENS.colors.borderSubtle};
  --foreground: ${THEME_TOKENS.colors.primaryText};
  --foreground-secondary: ${THEME_TOKENS.colors.secondaryText};
  --foreground-muted: ${THEME_TOKENS.colors.mutedText};
  --white: ${THEME_TOKENS.colors.white};
  --black: ${THEME_TOKENS.colors.black};
  --radius-sm: ${THEME_TOKENS.radii.sm};
  --radius-md: ${THEME_TOKENS.radii.md};
  --radius-lg: ${THEME_TOKENS.radii.lg};
`;
