/**
 * Thème de l'application mobile - Annuaire des Lauréats
 * Basé sur le design fourni avec couleurs modernes et cohérentes
 */

import { Platform } from 'react-native';

// Couleurs principales - Alignées avec le thème web
export const Colors = {
  // Couleurs primaires (vert olive - identique au web)
  primary: '#6B7F5C',
  primaryDark: '#556448',
  primaryLight: '#8A9B7A',
  
  // Couleurs secondaires (conservées pour compatibilité)
  secondary: '#6B7F5C',
  secondaryDark: '#556448',
  secondaryLight: '#8A9B7A',
  
  // Couleurs tertiaires
  tertiary: '#FF9800',
  tertiaryDark: '#F57C00',
  tertiaryLight: '#FFF3E0',
  
  // Couleurs de statut
  success: '#4CAF50',
  successBg: '#E8F5E9',
  successText: '#2E7D32',
  
  warning: '#FF9800',
  warningBg: '#FFF3E0',
  warningText: '#E65100',
  
  error: '#F44336',
  errorBg: '#FFEBEE',
  errorText: '#C62828',
  
  info: '#2196F3',
  infoBg: '#E3F2FD',
  infoText: '#1565C0',
  
  // Couleurs neutres
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAF5',
  gray100: '#F5F5F0',
  gray200: '#F0F0F0',
  gray300: '#E0E0E0',
  gray400: '#CCCCCC',
  gray500: '#999999',
  gray600: '#666666',
  gray700: '#4D4D4D',
  gray800: '#2C2C2C',
  gray900: '#1A1A1A',
  
  // Couleurs de fond (identiques au web)
  background: '#F5F5F0',
  backgroundLight: '#FAFAF5',
  backgroundWhite: '#FFFFFF',
  backgroundSecondary: '#F5F5F0',
  
  // Couleurs de texte (identiques au web)
  text: '#2C2C2C',
  textPrimary: '#2C2C2C',
  textSecondary: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  
  // Couleurs de bordure
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Gradients (basés sur les couleurs primaires)
  gradientPrimary: ['#6B7F5C', '#556448'],
  gradientSecondary: ['#8A9B7A', '#6B7F5C'],
  gradientTertiary: ['#FF9800', '#F57C00'],
};

// Espacements
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// Rayons de bordure
export const BorderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 15,
  xxl: 20,
  round: 50,
  full: 9999,
};

// Ombres
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
};

// Typographie
export const Typography = {
  // Tailles de police
  fontSize: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  
  // Poids de police
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Familles de polices
  fontFamily: Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
    },
    android: {
      sans: 'normal',
      serif: 'serif',
    },
    web: {
      sans: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
    },
    default: {
      sans: 'normal',
      serif: 'serif',
    },
  }),
};

// Fonts - Familles de polices spécialisées
export const Fonts = {
  rounded: Platform.select({
    ios: 'system-ui',
    android: 'normal',
    web: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    default: 'normal',
  }) as string,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: "'Courier New', Courier, monospace",
    default: 'monospace',
  }) as string,
};

// Styles de composants réutilisables
export const ComponentStyles = {
  // Header d'écran
  screenHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    paddingBottom: Spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    ...Shadows.sm,
  },
  
  // Carte d'action
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  // Badge de statut
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Input
  input: {
    width: '100%',
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.white,
  },
  
  // Bouton primaire
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Shadows.sm,
  },
  
  // Bouton secondaire
  buttonSecondary: {
    backgroundColor: Colors.gray500,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
