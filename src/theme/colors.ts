export const colors = {
  background: '#ffffff',
  surface: '#f4f4f5',
  text: '#18181b',
  textMuted: '#71717a',
  primary: '#2563eb',
  primaryPressed: '#1d4ed8',
  border: '#e4e4e7',
  error: '#dc2626',
  success: '#22c55e',
  /** Login handoff: primary text on sheet (mockup black) */
  loginText: '#000000',
  loginButton: '#000000',
  loginSheetHandle: '#d4d4d8',
  loginPlaceholder: '#a1a1aa',
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textMuted: '#8E8E93',
    likeActive: '#FF3B30',
    skeletonBase: '#2C2C2E',
    skeletonHighlight: '#3A3A3C',
    overlay: 'rgba(0,0,0,0.7)',
    border: '#2C2C2E',
  },
} as const;

export type ColorName = keyof typeof colors;
