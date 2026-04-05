# Mobile app engineering contract (M-FEED)

Single source for implementing Expo/React Native screens in this repo. When a design handoff exists, **layout and visual fidelity come first**; wire logic after the shell matches.

## Stack

- **Expo** ~54, **React Native** 0.81, **React** 19
- **React Navigation** (native stack)
- **Theming**: `src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `radii.ts` — extend these for new semantics instead of scattering literals.

## Fidelity rule

1. Implement structure, spacing, typography, and colors from the handoff.
2. Map handoff tokens into theme files (e.g. `loginText`, `loginButton`, `radii.sheetTop`). If a token is login-specific, prefix with `login` in `colors` / `typography` as needed.
3. **Bottom sheet in mocks**: default to a **static** bottom panel (rounded top, handle, ~55–65% height). Add `@gorhom/bottom-sheet` or drag only if product explicitly requires it.

## Layered screen pattern

1. Root `View` with `flex: 1`.
2. **Background**: full-bleed image (`expo-image`, `contentFit="cover"`) or `ImageBackground`; optional dark overlay if spec says so.
3. **Foreground**: brand / chrome above the sheet (e.g. safe-area-aware logo text).
4. **Sheet**: anchored to the bottom (`useWindowDimensions` × ~0.6 height), `borderTopLeftRadius` / `borderTopRightRadius`, white surface, subtle shadow/elevation, optional handle pill at top.
5. **Form**: `KeyboardAvoidingView` (`behavior="padding"` on iOS) + `ScrollView` with `keyboardShouldPersistTaps="handled"` and bottom padding using `useSafeAreaInsets()` so submit stays reachable on small phones.

## Forms and accessibility

- **Touch targets**: at least **44×44** pt for primary actions, links, and tappable fields.
- **Contrast**: WCAG AA for text and the link color on white (project link color: `colors.primary`).
- Set `accessibilityLabel` / `accessibilityRole` on `TextInput`, `Pressable` submit, and nav links; use `secureTextEntry` for passwords.

## Assets

- Bundled images live under `assets/` (e.g. `assets/images/login-hero.png`). Reference with `require('../../../../assets/images/...')` from feature screens or add a path alias later if the team standardizes it.

## Tests

- Update `__tests__` when copy or roles change: assert visible strings, navigation (e.g. Sign up → `Register`), and critical actions (submit → auth) using Testing Library queries aligned with `accessibilityLabel` / text.
