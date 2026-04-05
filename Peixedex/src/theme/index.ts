export const THEME = {
  colors: {
    background: '#0D0D15',
    card: '#1A1A2E',
    primary: '#00FF9D', // Verde Neon
    secondary: '#FF0055', // Rosa Choque
    accent: '#7000FF', // Roxo Elétrico
    text: '#FFFFFF',
    textSecondary: '#A0A0B8',
    border: '#2A2A40',
    shadow: '#000000',
    rarity: {
      comum: '#4CAF50',
      raro: '#2196F3',
      epico: '#9C27B0',
      lendario: '#FF9800',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  typography: {
    fontFamily: 'System', // Idealmente usar uma fonte customizada via Expo Google Fonts
  },
  shadows: {
    hard: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 5,
    }
  }
};

export const GLOBAL_STYLES = {
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.colors.border ? 0 : 8, // Pode ser 0 para um visual mais 'pixel'
    borderWidth: 2,
    borderColor: THEME.colors.border,
    ...THEME.shadows.hard,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.md,
    borderWidth: 3,
    borderColor: '#000',
    ...THEME.shadows.hard,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
};
