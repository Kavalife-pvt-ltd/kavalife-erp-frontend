# Kavalife ERP Frontend Architecture & Design Principles

## Goal

Revamp the manufacturing frontend into a dynamic, process-driven UI.

The frontend should not hardcode Extraction, Stripping, Purification, etc. as separate page systems.

Instead:

- one dynamic process board
- one common process card
- one process workspace page
- one dynamic form renderer
- one common dialog/modal system
- backend schema/data decides what is shown

## Core Design Split

## Global UI Requirements

The entire frontend must be responsive and support both light and dark themes.

Responsive targets:

- desktop layouts for admin/manager workflows
- tablet-first layouts for manufacturing floor operations
- mobile-friendly views for owners/managers checking analytics, approvals, or summaries

Theme requirements:

- all new common UI components must support light mode and dark mode
- avoid hardcoded colors where possible
- use Tailwind theme tokens/classes consistently
- status colors should remain clear in both themes
- manufacturing floor UI should maintain strong contrast in both themes

The UI should not assume one fixed screen size.

Layouts should gracefully adapt:

```text
Desktop → multi-column cards/tables
Tablet → large cards and large touch targets
Mobile → stacked cards and summary-first views
```

### 1. Manufacturing Floor UI

Used by plant employees wearing gloves/protective gear.

Design principles:

- big buttons
- large readable cards
- minimal text clutter
- touch/tablet friendly
- high contrast
- simple status indicators
- few actions per screen
- no dense tables
- clear “what do I do next?” flow

Floor UI should be card-based, not table-heavy.

Minimum floor UI sizing direction:

- large primary buttons
- comfortable touch targets
- readable text sizes
- spacious cards
- sticky action bars where useful
- avoid tiny icon-only actions for critical manufacturing work

### 2. Admin / Manager UI

Used for inventory, sales, masters, reports, analytics.

Design principles:

- modern dashboard UI
- tables where useful
- filters
- search
- charts
- compact information
- detailed views

## Manufacturing UX Model

Organize floor UI by process.

Example:

- Extraction
- Stripping
- Purification
- Decolorisation
- Packaging

Each process tab/page shows all runtime cards for that process.

A card represents material currently inside a runtime process step.

It is not permanently assigned to an employee.

Employees update the card during their shift, and backend records who updated what.

Important rule:

```text
The card belongs to the material/process state.
The action belongs to the employee.
```

## Shared Component System

Yes, the frontend should use common reusable components instead of one-off styling inside every page.

Create/maintain shared UI primitives under a common UI folder.

Recommended shared components:

```text
components/ui/
  Button.tsx
  Card.tsx
  Input.tsx
  Select.tsx
  Textarea.tsx
  Modal.tsx
  Dialog.tsx
  Badge.tsx
  StatusBadge.tsx
  DataTable.tsx
  Tabs.tsx
  EmptyState.tsx
  LoadingState.tsx
  ErrorState.tsx
  PageHeader.tsx
```

Important component rules:

- common components should be reusable across modules
- common components should support light/dark themes
- common components should support responsive layouts
- manufacturing-specific components should compose common UI primitives
- do not hardcode process-specific UI into shared components
- shared components should stay generic and dumb

Example:

```text
components/ui/Card.tsx
  = generic card shell

features/manufacturing/components/ProcessCard.tsx
  = manufacturing-specific card using the generic Card component
```

This keeps the design consistent without mixing business logic into base UI components.
