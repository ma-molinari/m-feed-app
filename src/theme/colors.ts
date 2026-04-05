export const colors = {
  background: '#ffffff',
  surface: '#f4f4f5',
  text: '#18181b',
  /** Muted body text on white — darkened for WCAG AA on small sizes */
  textMuted: '#52525b',
  primary: '#2563eb',
  primaryPressed: '#1d4ed8',
  /** Primary fill when action is disabled (WCAG-friendly vs opacity on whole control) */
  primaryDisabled: 'rgba(37, 99, 235, 0.42)',
  border: '#e4e4e7',
  error: '#dc2626',
  success: '#22c55e',
  /** Login handoff: primary text on sheet (mockup black) */
  loginText: '#000000',
  loginButton: '#000000',
  /** Subtle sheet handle — low emphasis (sheet is not draggable) */
  loginSheetHandle: '#e4e4e7',
  /** Placeholder on white — stronger than zinc-400 for contrast */
  loginPlaceholder: '#71717a',
  /** Very light fill behind auth inputs */
  loginInputFill: '#f9fafb',
  /** Darken hero slightly for logo legibility */
  loginHeroOverlay: 'rgba(0,0,0,0.14)',
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    /** Fundo do segmento ativo (For You / Explorar) e chips semelhantes */
    segmentActive: '#2C2C2E',
    text: '#FFFFFF',
    textMuted: '#8E8E93',
    likeActive: '#FF3B30',
    skeletonBase: '#2C2C2E',
    skeletonHighlight: '#3A3A3C',
    overlay: 'rgba(0,0,0,0.7)',
    border: '#2C2C2E',
    /** Search field icon — slightly above textMuted for icon legibility on black */
    searchBarIcon: '#9CA3AF',
    /** Row press feedback (aligned with segment chips) */
    listRowPressed: '#2C2C2E',
    /** Caption character counter on dark surfaces */
    captionCounter: '#8E8E93',
    /** @handle and profile meta on pure black — slightly above textMuted for small-text legibility */
    profileSecondary: '#AEAEB2',
    /** Form inputs on dark sheets — distinct from sheet surface and pure black */
    sheetInputFill: '#2C2C2E',
    /** Feed tab label when inactive — AA-friendly on pure black */
    feedTabInactive: '#AEAEB2',
    /** Grab indicator on bottom sheets */
    sheetHandle: '#48484A',
    /** Subtle top edge on elevated sheets */
    sheetBorderTop: '#38383A',
    /** Avatar placeholder (initial) on feed — brand-tinted */
    avatarFallbackBg: 'rgba(37, 99, 235, 0.28)',
    avatarFallbackText: '#BFDBFE',
    /** More-menu icon — readable on black without dominating */
    moreIcon: '#AEAEB2',
  },
} as const;

export type ColorName = keyof typeof colors;
