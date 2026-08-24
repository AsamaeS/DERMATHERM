---
name: Dermatherm Research Systems
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  panel-gap: 12px
  compact-margin: 8px
---

## Brand & Style

The design system is engineered for high-fidelity computational physics and AI research. It prioritizes information density, precision, and cognitive clarity over decorative aesthetics. The brand personality is authoritative, systematic, and rigorously academic.

The visual style is **Corporate Modern with a Technical Edge**. It utilizes high-contrast typography, a strict grid-based structure, and a restrained application of color to focus the user's attention on complex data visualizations and algorithmic outputs. Every element must feel "calculated"—avoiding soft edges or whimsical transitions in favor of mechanical accuracy and professional reliability.

## Colors

The palette is rooted in a "Laboratory White" foundation to provide maximum legibility for dense text and complex charting. 

- **Primary:** Dark Navy (#0F172A) is used for core structural elements, navigation headers, and primary headings to establish authority.
- **Scientific Accents:** Blues (#2563EB and #3B82F6) are reserved strictly for interactive actions, primary buttons, and indicating "active" states in data models.
- **Typography:** Charcoal (#334155) is used for secondary body text to reduce eye strain during long-form research reading, while Navy is used for high-contrast headers.
- **Technical Grays:** Used for 1px borders and subtle background layering to separate data panels without adding visual "weight."

## Typography

This design system employs a dual-typeface strategy to distinguish between UI orchestration and scientific data.

1.  **Geist & Inter:** Used for all interface chrome, headings, and instructional text. Geist provides a sharp, technical geometric feel for headings, while Inter ensures maximum readability for dense documentation.
2.  **JetBrains Mono:** This is the "functional" typeface. It must be used for all numerical data, scientific notation, code snippets, and table cell values. This ensures that columns of numbers align vertically (tabular lining) and are easily scannable for anomalies.

**Scale Strategy:** Sizes are kept relatively small to support high information density. Mobile views should collapse `headline-lg` to 24px to maintain professional proportions.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Navigation and side-panels for parameter controls are fixed-width (typically 280px), while the central "Observation Deck" (where charts and models live) is fluid.

- **Grid:** A 12-column system is used for dashboard layouts.
- **Information Density:** Use a 4px base unit. For data-rich tables and property inspectors, use "Compact" spacing (8px padding). For reading-heavy research papers, use "Relaxed" spacing (16px–24px).
- **Responsive Behavior:** On tablet, sidebars should collapse into icons. On mobile, data tables should trigger horizontal scroll with pinned first columns to preserve data integrity.

## Elevation & Depth

To maintain a flat, "engineering schematic" feel, this design system avoids heavy shadows. 

- **Low-Contrast Outlines:** Primary depth is achieved through 1px borders (#E2E8F0).
- **Tonal Layering:** Use background color shifts (#F1F5F9) to denote nested containers or "well" components.
- **Minimal Shadows:** Only the highest level of hierarchy (e.g., Modals or Context Menus) should use a shadow. Use a very diffused, 10% opacity navy shadow: `0 4px 12px rgba(15, 23, 42, 0.1)`.
- **Active State:** Selected items in a list should use a 2px left-border accent of Primary Blue rather than a heavy drop shadow.

## Shapes

The shape language is **Soft (0.25rem)**. This provides just enough curvature to prevent the UI from feeling aggressive or dated (Brutalist), while remaining sharp enough to feel professional and technical. 

- **Standard Elements:** Buttons, Input fields, and Chips use a 4px (0.25rem) radius.
- **Large Containers:** Data cards and panels can scale up to 8px (0.5rem) to provide a clear container hierarchy.
- **Charts:** Interior elements of charts (bar graphs, etc.) should remain sharp (0px) to maintain mathematical accuracy.

## Components

- **Buttons:** Primary buttons use Navy (#0F172A) with white text. Secondary buttons use a 1px border (#E2E8F0) with Navy text. Hover states should involve a subtle background shift to #1E293B.
- **Input Fields:** Use 1px borders. Focus states must use a 1px Primary Blue outline with a subtle 2px blue "glow" (shadow) to ensure the user knows exactly where data is being entered.
- **Data Tables:** These are the core of the system. Use a "Zebra Stripe" approach with #F8FAFC and #FFFFFF. Headers must be in `data-label` (JetBrains Mono) with a subtle bottom border.
- **Scientific Charts:** Line weights should be 1.5px. Use a palette of Primary Blue, Emerald 600, and Amber 500 for multi-series data. Avoid gradients under area charts; use solid low-opacity fills instead.
- **Status Chips:** Use small, square-ish badges with `data-label` typography. Success = Green text/bg, Error = Red text/bg, Processing = Blue text/bg. All should be desaturated to fit the professional tone.
- **Property Inspectors:** A right-aligned panel for fine-tuning AI parameters. Use "Compact" spacing and Geist Mono for all numeric inputs.