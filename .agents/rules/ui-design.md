---
trigger: always_on
---

Restyle this project's UI theme to match Odoo's style — bright, minimal, utilitarian. Use Tailwind CSS only, including the existing dark: variant pattern for dark mode. Do not modify any business logic, state, hooks, API calls, data fetching, routing, or component behavior — visual changes only.

Theme Direction

Colors:

Light background throughout — white/very light gray (bg-white, bg-gray-50) as the base
One primary accent color:
#714B67 (muted plum/violet) — used sparingly on primary buttons, active nav items, links, small accents only. Not on large surfaces/backgrounds.
Add it to tailwind.config.js as a named token instead of hardcoding hex values:
js
theme: {
extend: {
colors: {
primary: {
DEFAULT: '#714B67',
hover: '#5f3f56',
light: '#f4eef2',
dark: '#8a6280', // for dark mode, better contrast on dark bg
},
},
},
}

Use bg-primary, text-primary, hover:bg-primary-hover, etc. across components — not inline hex.

Neutral grays for borders, secondary text, dividers (border-gray-200, text-gray-500)
No gradients, glassmorphism, colored shadows, or multi-color palettes — one accent + neutrals only

Layout / components:

Flat design — minimal/no drop shadows; use thin border instead of shadow to separate cards/panels
Sharp-ish corners — rounded or rounded-md max; avoid rounded-xl/rounded-2xl/pill shapes
Dense, functional spacing — avoid excessive padding common in marketing-style UIs; should feel like a business app
Buttons: solid flat fill for primary, simple outline/ghost for secondary — no gradients

Interactions/animations:

Remove decorative hover effects — no hover:scale-\*, hover:shadow-lg, transition-heavy states
Only functional hover states allowed (e.g. hover:bg-gray-50 on rows, hover:bg-primary-hover on buttons) — nothing animated/bouncy
Remove transition-all, long-duration easing, fade-ins, entrance animations unless functionally necessary (dropdown open/close is fine; decorative motion is not)
No skeleton shimmer, parallax, or scroll-triggered animations

Dark mode: apply the same bright/minimal/flat philosophy to dark: variants — dark backgrounds, same restrained accent use (primary-dark instead of
#714B67 directly), same flat/no-animation rules. Every element must keep both light and dark: styling in sync.

Approach

Update className strings across components for the new palette/spacing/borders. For every color/style utility changed, update both the light class and its paired dark: class together. Update shared tokens in tailwind.config.js (theme.extend.colors, borderRadius, fontFamily, etc.) for any new custom values, so they're centralized rather than scattered.

Do Not Touch
Any logic outside className values — conditionals, state, props, hooks, event handlers, API calls
The condition/logic inside cn()/clsx()/ternaries — only the class value strings themselves
Classes used as JS selectors or test hooks (data-testid, classes queried in tests)
The dark-mode toggle mechanism itself (useTheme hook, localStorage logic, class on <html>) — only its resulting styling
tailwind.config.js's darkMode setting, content, plugins fields
File/folder structure, component names, imports/exports, function signatures, prop interfaces
Any backend code, env variables, service/API files
Constraints
App must behave identically — same functionality, only different appearance
Every element with existing dark mode support must retain both light and dark styling after changes
Actively strip existing decorative animations/hover effects — don't just avoid adding new ones. Remove existing transition-transform hover:scale-105-type patterns as part of this restyle
If a file mixes styling and logic, touch only the JSX className/style parts — nothing above/below it
If unsure whether a change affects logic or behavior, skip it and flag it instead of guessing
Work on a separate branch; commit only style-related changes
List every file modified at the end for review
