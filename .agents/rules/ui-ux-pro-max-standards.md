# UI/UX Pro Max Standards — Senior Frontend Quality Rules

These standards apply to every UI, component, layout, and visual interaction task in this project. Whenever modifying or creating UI code, the agent MUST adhere to these rules and utilize the installed `.agents/skills/` (`ui-ux-pro-max`, `design-system`, `ui-styling`, `banner-design`).

---

## 1. Design Intelligence & Skills Invocation

Whenever designing a new screen, refining styling, or solving interaction issues:
- **Design System & Strategy**: Run `node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<topic>" --design-system -p "SmartInvite"`
- **Domain UX & A11y Guidelines**: Run `node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<topic>" --domain ux`
- **Stack Specifics (Next.js 16 / React 19)**: Run `node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<topic>" --stack nextjs`
- **Component & Layout Patterns**: Refer to `.agents/skills/ui-styling/references/` and `.agents/skills/design-system/references/`
- **Invitation Cards & Visual Passes**: Refer to `.agents/skills/banner-design/SKILL.md` for aspect ratios, badge placement, typography hierarchy, and reveal animations.

---

## 2. Senior UI/UX Quality Invariants

### A. Accessibility (WCAG 2.1 AA — Critical)
1. **Color Contrast**: Minimum 4.5:1 for body text against backgrounds; minimum 3:1 for large text (>= 24px or bold >= 18.5px) and functional UI borders.
2. **Focus Visibility**: NEVER set `outline: none` or remove focus rings without providing an accessible `:focus-visible` ring (e.g. `outline: 2px solid var(--color-gold); outline-offset: 2px;`).
3. **Screen Readers & Semantic HTML**: All icon-only buttons must have an explicit `aria-label` or visually hidden text (`sr-only`). Decorative SVGs must have `aria-hidden="true"`.
4. **Form Labels & Error Association**: Every input must have an associated visible `<label>`. Error messages must be placed directly adjacent to the relevant field with `aria-describedby` or clear semantic linkage.

### B. Touch & Interaction (Critical)
1. **Target Size**: Minimum clickable/tappable area is **44×44px** on all interactive elements (buttons, links, chips, toggles, icon triggers).
2. **Spacing**: Minimum **8px gap** between adjacent touch targets to prevent mis-clicks on mobile devices.
3. **Interactive Cursors**: Every clickable element MUST have `cursor: pointer`. Non-interactive elements (cards, containers) must NOT have `cursor: pointer`.
4. **Immediate Feedback**: Hover, focus, active, and disabled states must be distinctly visible and responsive.

### C. Responsive Layouts & Viewports (High)
1. **Mandatory Breakpoint Checks**: Verify layouts at **360px (compact mobile), 390px (standard mobile), 768px (tablet), and 1280px (desktop)**.
2. **Zero Horizontal Overflow**: The page and root containers must never scroll horizontally (`overflow-x: hidden` / wrapping text). Text, chips, and table cells must wrap gracefully without truncation unless intentionally paired with a tooltip.
3. **Mobile-First Flexibility**: Use CSS Grid and Flexbox with responsive wrapping (`flex-wrap: wrap`, `grid-template-columns: repeat(auto-fit, minmax(...))`) rather than rigid fixed pixel widths.

### D. Token Architecture & Aesthetic Harmony (High)
1. **Design Tokens Over Magic Numbers**: Never hardcode arbitrary hex colors (`#1a2b3c`) or ad-hoc pixel values in components. Always use established CSS variables from `src/app/globals.css`:
   - Primary navy / slate: `--color-navy`, `--color-slate-900`, `--color-slate-800`
   - Ivory backgrounds: `--color-ivory`, `--color-ivory-warm`, `--color-background`
   - Gold accent & CTA: `--color-gold`, `--color-gold-hover`, `--color-gold-muted`
   - Status tokens: `--color-success`, `--color-warning`, `--color-danger`, `--color-info`
2. **Typography Scale**: Maintain a coherent typographic hierarchy:
   - Display/Hero: 32px - 40px (Playfair Display / Serif elegance for invitations)
   - H1/H2: 24px - 28px
   - H3/Titles: 18px - 20px
   - Body: 15px - 16px with line-height 1.5 - 1.6
   - Captions/Badges: 12px - 13px with font-weight 500+
3. **No Raw Emojis as Functional Icons**: Always use semantic SVGs (e.g. Lucide/Heroicons SVG paths) with appropriate stroke width and accessible labels.

### E. Micro-Animations & Motion (Medium)
1. **Reduced Motion**: All animations, card transitions, envelope unfolds, and dropdowns MUST respect `@media (prefers-reduced-motion: reduce)`.
2. **Context-Aware Duration**:
   - Micro-interactions (hover, active, toggle): 150ms – 200ms `ease-out`
   - Modal dialogs, drawer transitions: 250ms – 300ms `cubic-bezier(0.16, 1, 0.3, 1)`
   - Never use sluggish durations (> 400ms) for routine interface navigation.

---

## 3. Pre-Delivery Quality Checklist (Mandatory)

Before completing any UI task, verify:
- [ ] Responsive across 360px, 390px, 768px, 1280px.
- [ ] Contrast meets 4.5:1 ratio; text is clearly readable.
- [ ] Minimum 44×44px touch targets on buttons, tabs, links, and action icons.
- [ ] Keyboard navigation: TAB order is logical, modals trap focus, ESC closes dialogs.
- [ ] Empty state, loading state, and error feedback are fully provided.
- [ ] `prefers-reduced-motion` is honored.
- [ ] Code passes `npm run typecheck` and `npm run test` with 0 errors.
