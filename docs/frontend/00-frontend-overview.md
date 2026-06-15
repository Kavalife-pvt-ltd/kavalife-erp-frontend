# Kavalife ERP Frontend Overview

> Status: Active frontend planning reference  
> Purpose: Shared frontend architecture, UI philosophy, module boundaries, and documentation standards for the Kavalife ERP frontend.

---

## 1. Purpose of this document

This document is the top-level frontend reference for the Kavalife ERP application.

It defines:

- frontend design philosophy
- module boundaries
- user experience rules
- responsive behavior
- light/dark theme expectations
- shared component strategy
- documentation structure
- implementation principles for future frontend work

Detailed behavior for individual screens/components should be documented in separate files under `docs/frontend/`.

This file should stay high-level. It should not become a dumping ground for every button and API call.

---

## 2. Frontend mental model

The ERP frontend should not feel like one giant universal dashboard shown to every employee.

The frontend should be:

```text
role-aware
department-aware
task-first
responsive
process-driven where needed
simple for floor employees
powerful for admins/managers
```

Main rule:

```text
The user should see what they need to act on, not the entire ERP maze.
```

After login:

```text
User logs in
  ↓
Auth context stores role + department + user information
  ↓
Sidebar/dashboard show only relevant modules
  ↓
User acts on current work
```

---

## 3. Core UI split

Kavalife ERP has two different UI modes.

### 3.1 Manufacturing floor UI

Used by plant/factory employees, often on the floor, possibly using tablets, gloves, or protective gear.

This UI should optimize for:

- speed
- clarity
- big touch targets
- low cognitive load
- shift handover
- minimal clutter
- clear status visibility
- obvious next action

Floor UI should be:

```text
card-based
touch-friendly
tablet-first
high-contrast
state-driven
minimal
```

Avoid:

- dense tables
- tiny buttons
- icon-only critical actions
- excessive fields visible at once
- making operators hunt for the next action

The screen should answer within two seconds:

```text
What is happening?
What needs action?
What happens next?
```

### 3.2 Admin / manager UI

Used for inventory, sales, masters, reports, analytics, workflow configuration, and employee management.

This UI can follow modern dashboard patterns:

- tables
- filters
- search
- charts
- side panels
- compact data
- create/edit forms
- drill-down views

Admin UI can be denser than floor UI because the user is usually working from a desktop/laptop.

---

## 4. Responsive and theme requirements

The entire frontend must be responsive.

Supported usage targets:

```text
Desktop → admin/manager workflows, tables, reports
Tablet  → manufacturing floor operations
Mobile  → owner/manager summaries, approvals, analytics snapshots
```

The frontend must support both light and dark mode.

Rules:

- use Tailwind theme classes consistently
- avoid hardcoded colors where possible
- status colors must remain readable in both themes
- shared components must work in both themes
- manufacturing floor UI must preserve strong contrast in both themes
- layouts must not assume one fixed screen size

Layout direction:

```text
Desktop → multi-column layouts, tables where useful
Tablet  → large cards, large buttons, fewer columns
Mobile  → stacked cards, summary-first content
```

---

## 5. Module boundaries

Frontend modules should be separated by business meaning, not by random UI similarity.

### 5.1 Inward operations

Includes:

- VIR
- GRN
- GRN QA/QC

Meaning:

```text
Material arrival, inspection, receipt, and incoming approval.
```

VIR/GRN are not manufacturing process execution screens.

They should have their own UI contracts under:

```text
docs/frontend/inward/
docs/frontend/02-inward-operations-ui-contract.md
```

### 5.2 Manufacturing runtime

Includes:

- Extraction
- Stripping
- Purification
- Decolorisation
- Packaging
- any future process driven by `process_definitions`

Meaning:

```text
Material transformation inside the plant.
```

Manufacturing runtime should use the dynamic process architecture:

```text
Process Board
  ↓
Process Card
  ↓
Process Workspace
  ↓
Dynamic Process Form
  ↓
Process Execution APIs
```

Manufacturing runtime is documented under:

```text
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/pages/
docs/frontend/components/
docs/frontend/hooks/
docs/frontend/api/
docs/frontend/contracts/
```

### 5.3 QA/QC

Includes:

- GRN QA/QC queue
- process step QA/QC queue
- QA/QC verification screens
- approval/rejection/retest flows

Meaning:

```text
Testing and approval gates that control whether material can move forward.
```

QA/QC is related to manufacturing, but should not be mixed into the process workspace architecture blindly.

QA/QC documentation belongs under:

```text
docs/frontend/03-qaqc-ui-contract.md
docs/frontend/qaqc/
```

### 5.4 Masters

Includes:

- Products
- Vendors
- Customers
- Process Definitions
- Product Workflows
- Users/Employees where applicable

Meaning:

```text
Configuration and master data used by the ERP.
```

Masters should use normal admin dashboard UI patterns.

Masters documentation belongs under:

```text
docs/frontend/04-masters-ui-contract.md
docs/frontend/masters/
```

### 5.5 Sales / inventory / reports

These are separate business modules and should get their own frontend contracts when actively redesigned.

They should not be forced into the manufacturing runtime architecture.

---

## 6. Manufacturing runtime frontend rules

Manufacturing runtime follows the backend runtime engine:

```text
VIR → GRN → GRN QA/QC → Batch → Lot → Lot Process Steps → Process Execution → Step QA/QC → next step activation
```

Frontend manufacturing screens start from `lot_process_steps` and `process_executions`.

Important distinction:

```text
lot_process_steps
  = workflow/runtime state tracker

process_executions
  = actual execution/log/form record
```

Frontend must not create runtime process steps manually.

Runtime `lot_process_steps` are created by backend when a batch is created and the product workflow is copied into runtime state.

Frontend may:

- view process board cards
- open a process workspace
- create/get a process execution for an existing step
- save progress into process execution
- complete a process execution

Frontend must not directly:

- create lot process steps
- activate next process steps
- mark workflow state completed manually
- decide whether QA/QC is required
- move material forward by itself

Backend owns workflow progression.

---

## 7. Manufacturing process board model

Manufacturing process tabs/pages are dynamic.

Do not create independent page systems like:

```text
ExtractionPage
StrippingPage
PurificationPage
ExtractionCard
StrippingCard
PurificationCard
```

Instead use:

```text
ProcessBoardPage
ProcessCard
ProcessWorkspacePage
DynamicProcessForm
```

A process card represents:

```text
material currently inside a runtime process step
```

It does not represent a task permanently assigned to one employee.

Shift handover rule:

```text
The card belongs to the material/process state.
The action belongs to the employee.
```

Employees update the same process execution across shifts. Backend should record who updated what and when.

---

## 8. Shared component system

Shared UI primitives live under:

```text
src/components/ui/
```

These are generic/dumb components.

Examples:

- Button
- Card
- Input
- Select
- Textarea
- Dialog/Modal
- Badge
- Tabs
- Table
- Skeleton
- Scroll Area

Rules:

- shared UI components must not contain business logic
- shared UI components must not know about manufacturing, VIR, GRN, QA/QC, products, etc.
- feature components compose shared UI primitives
- shared components must support light/dark themes
- shared components must be responsive

Example:

```text
src/components/ui/card.tsx
  = generic card shell

src/features/manufacturing/components/ProcessCard.tsx
  = manufacturing-specific card using generic Card/Button/Badge primitives
```

---

## 9. Feature folder strategy

Feature-specific frontend logic should live close to the feature.

Recommended pattern:

```text
src/features/<feature>/
  components/
  hooks/
  types/
  utils/
```

Manufacturing example:

```text
src/features/manufacturing/
  components/
  dynamic-form/
  hooks/
  types/
  utils/
```

Route-level pages should live under:

```text
src/pages/
```

API callers should live under:

```text
src/api/
```

UI primitives should live under:

```text
src/components/ui/
```

Layout components should live under:

```text
src/components/layout/
```

---

## 10. API and adapter rules

UI components should not depend directly on raw backend response shapes.

Use API files and adapters.

Preferred flow:

```text
API response
  ↓
adapter / mapper
  ↓
frontend type
  ↓
component props
```

Rules:

- keep backend DTO mapping outside components
- document endpoint behavior in `docs/frontend/api/`
- if backend and docs differ, trust code but update docs
- do not guess API contracts if docs exist
- add TODO comments when backend fields are missing

Manufacturing currently uses endpoints such as:

- `GET /v2/process-steps/board`
- `GET /v2/process-steps/:id`
- `GET /v2/process-executions/step/:stepId`
- `POST /v2/process-executions`
- `PATCH /v2/process-executions/:id/progress`
- `PATCH /v2/process-executions/:id/complete`

Exact button behavior is documented in:

```text
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
```

---

## 11. Backend-owned field rule

Frontend should not send trusted user/date fields long-term.

Backend should own:

- created_at
- updated_at
- created_by
- updated_by
- last_updated_by
- started_at
- completed_at
- verified_by
- verified_at
- checked_by
- checked_at
- approved_by
- approved_at

Frontend may display these fields, but they should be non-editable.

In forms, these fields should be treated as display-only metadata if shown.

---

## 12. Form data rule

Dynamic manufacturing process form data belongs inside:

```text
process_executions.form_data
```

`form_data` should contain dynamic process-specific form values and repeatable logs.

Examples:

- material details
- operation logs
- wash logs
- heating logs
- solvent recovery logs
- remarks sections

`form_data` should not contain backend-owned timestamps/users or top-level execution fields.

Do not put these inside `form_data`:

- startedAt
- completedAt
- verifiedBy
- verifiedAt
- quantityIn
- quantityOut
- quantityLoss
- yieldPercent
- operatorNotes
- supervisorNotes

These are top-level execution fields or backend-owned fields.

Detailed rules belong in:

```text
docs/frontend/contracts/form-data-contract.md
```

---

## 13. Button behavior rule

Every button should have a documented purpose.

A button should usually do exactly one of these:

```text
navigate
modify local UI/form state
call one backend action
open/close a dialog
```

Critical manufacturing examples:

```text
Open / Continue
  → navigate to process workspace

Back
  → navigate back, no API call

Save Progress
  → PATCH process_execution progress

Complete Process
  → PATCH process_execution complete

Add Row
  → local form state only

Delete Row
  → local form state only
```

Avoid hidden multi-action buttons unless explicitly documented.

Detailed button behavior belongs in:

```text
docs/frontend/contracts/button-behavior-contract.md
```

---

## 14. Documentation rules

Every major frontend feature should have docs before or alongside implementation.

Docs should explain:

- what the page/component does
- who uses it
- what data it shows
- which buttons/actions exist
- which APIs are called
- what should not happen
- edge cases
- loading/error/empty states

Recommended docs structure:

```text
docs/frontend/
  00-frontend-overview.md
  01-manufacturing-runtime-ui-contract.md
  02-inward-operations-ui-contract.md
  03-qaqc-ui-contract.md
  04-masters-ui-contract.md

  contracts/
    button-behavior-contract.md
    form-data-contract.md

  pages/
    process-board-page.md
    process-workspace-page.md
    batch-history-page.md

  components/
    process-card.md
    process-action-bar.md
    dynamic-process-form.md
    repeatable-table.md

  inward/
    vir.md
    grn.md
    grn-qaqc.md

  qaqc/
    step-qaqc.md

  masters/
    products.md
    vendors.md
    customers.md
    process-definitions.md
    product-workflows.md
```

---

## 15. Current frontend implementation direction

Current direction:

```text
Build reusable UI primitives
  ↓
Build dynamic manufacturing skeleton
  ↓
Wire real backend read APIs
  ↓
Wire process execution save/complete APIs
  ↓
Document exact UI behavior
  ↓
Refine forms and migrate old hardcoded process pages
```

Old hardcoded process-specific screens should remain as reference until the dynamic manufacturing flow is fully stable.

Once dynamic flow is confirmed with one process, migrate remaining process screens and remove the old hardcoded pages/cards/forms.

---

## 16. Implementation safety rules

When asking AI/Codex to modify frontend code:

- make it read this overview first
- make it read the specific page/component contract first
- give it the exact files to inspect
- avoid broad rewrite prompts
- prefer one phase at a time
- do not let it infer hidden button behavior
- do not let it invent backend routes when docs/code exist
- ask for summary of files changed and assumptions made

Good implementation style:

```text
small phase
clear contract
exact files
run lint/build
summarize changes
```

Bad implementation style:

```text
make frontend dynamic bro
```

---

## 17. Short locked summary

```text
- Frontend is role-aware and department-aware.
- Floor UI and admin UI have different design needs.
- Manufacturing floor UI is card-based, big, touch-friendly, and state-driven.
- Admin/manager UI can use tables, filters, and dense dashboard patterns.
- VIR/GRN are inward operations, not manufacturing process workspaces.
- Manufacturing runtime uses dynamic ProcessBoardPage, ProcessCard, ProcessWorkspacePage, and DynamicProcessForm.
- Process tabs are dynamic and based on process definitions/codes.
- lot_process_steps track workflow state.
- process_executions store actual form/log execution data.
- Frontend does not move workflow forward directly; backend owns progression.
- Save Progress updates process_execution progress.
- Complete Process completes process_execution.
- Shared UI primitives are generic and business-logic free.
- Feature components compose shared UI primitives.
- Backend-owned user/date fields are display-only in frontend.
- Every major page/component/action should have frontend documentation.
```
