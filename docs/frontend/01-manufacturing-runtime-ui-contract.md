# Manufacturing Runtime UI Contract

> Status: Active implementation contract  
> Scope: Dynamic manufacturing runtime frontend only  
> Applies to: Process Board, Process Cards, Process Workspace, Dynamic Process Form, Process Execution actions

---

## 1. Purpose

This document defines the frontend contract for the manufacturing runtime UI.

It explains:

- which screens exist
- how manufacturing runtime data moves through the UI
- what each button does
- which APIs are called
- what frontend is allowed to do
- what frontend must never do
- how process executions are created, saved, and completed
- how shift handover should work

This document should be read before modifying:

```text
src/pages/manufacturing/ProcessBoardPage.tsx
src/pages/manufacturing/ProcessWorkspacePage.tsx
src/features/manufacturing/components/*
src/features/manufacturing/dynamic-form/*
src/features/manufacturing/hooks/*
src/api/manufacturing/*
```

---

## 2. What this document does NOT cover

This document does not define VIR, GRN, GRN QA/QC, masters, sales, or inventory UI.

These are separate frontend modules.

```text
VIR / GRN
  = inward operations

QA/QC
  = testing and approval gates

Masters
  = configuration/admin data

Manufacturing runtime
  = material transformation through process steps
```

Manufacturing runtime starts after a GRN has passed QA/QC and a batch has been created.

---

## 3. Runtime business flow reference

Backend manufacturing runtime follows this chain:

```text
VIR
  ↓
VIR verified
  ↓
GRN created
  ↓
GRN QA/QC approved
  ↓
Batch created
  ↓
Initial Lot created
  ↓
Workflow copied into Lot Process Steps
  ↓
First Lot Process Step becomes active
  ↓
Process Execution created for active step
  ↓
Process Execution saved/completed
  ↓
If QA/QC required → step moves to awaiting_qaqc
  ↓
Step QA/QC approved
  ↓
Step completed and next step activated
```

Frontend manufacturing screens work mainly with:

```text
lot_process_steps
process_executions
process_definitions
batches
batch_lots
```

---

## 4. Core runtime model

## 4.1 Lot Process Step

```text
lot_process_steps
  = workflow/runtime state tracker
```

It tells the system:

- which process a lot is currently in
- whether that process is pending, active, in progress, awaiting QA/QC, completed, failed, or rework
- which process should happen next

The frontend must not manually create or move `lot_process_steps`.

Runtime steps are created by backend when a batch is created and the active product workflow is copied into runtime state.

## 4.2 Process Execution

```text
process_executions
  = actual execution/log/form record
```

It stores:

- dynamic form data
- repeatable operation logs
- equipment used
- quantity in/out/loss
- operator notes
- supervisor notes
- completion information

A `process_execution` belongs to exactly one `lot_process_step`.

## 4.3 Golden rule

```text
lot_process_step = where the material is in workflow
process_execution = what happened during that process
```

---

## 5. Frontend ownership boundaries

## 5.1 Frontend may do

Frontend may:

- show process board cards
- filter process board by process/status/search/date
- open a process workspace
- fetch a step's existing execution
- create one execution for an existing step when needed
- save progress into the execution
- complete the execution
- display backend-owned metadata
- refresh state after backend actions

## 5.2 Frontend must not do

Frontend must not directly:

- create runtime `lot_process_steps`
- activate next process steps
- mark workflow steps completed manually
- decide whether QA/QC is required
- move material forward by itself
- create separate runtime log entities unless backend explicitly supports them
- put backend-owned user/date fields into editable `form_data`

Backend owns workflow progression.

Frontend requests actions. Backend decides movement.

---

## 6. Main frontend screens

## 6.1 Process Board Page

Route examples:

```text
/manufacturing/processes
/manufacturing/processes/:processCode
```

Purpose:

```text
Show runtime manufacturing process cards.
```

Examples:

```text
/manufacturing/processes/EXT
  → show Extraction cards

/manufacturing/processes/STR
  → show Stripping cards
```

The board should use:

```http
GET /v2/process-steps/board
```

with filters where applicable:

```text
processCode
status
batchNumber
lotNumber
productId
search
fromDate
toDate
page
limit
sortBy
sortOrder
```

Expected behavior:

- show only manufacturing runtime cards
- do not include VIR/GRN cards
- process tabs should be based on process definitions/codes
- route param `processCode` must be passed to backend as `processCode`
- no write API should be called from the board just by viewing it

## 6.2 Process Workspace Page

Route:

```text
/manufacturing/workspace/:stepId
```

Purpose:

```text
Open one runtime process step and allow operators to view, save, and complete its process execution.
```

The workspace shows:

- process summary/header
- batch/lot/product details
- status
- dynamic form
- repeatable logs
- activity timeline
- action bar

---

## 7. Process Board behavior

## 7.1 Data shown on each card

A process card should show:

- step id
- process code
- process name
- batch number
- lot number
- product name
- quantity and unit
- status
- current stage, if available
- last updated by
- last updated at
- QA/QC required indicator, if useful

## 7.2 Card meaning

A process card represents:

```text
material currently inside a runtime process step
```

It does not represent permanent ownership by one employee.

## 7.3 Shift handover rule

```text
The card belongs to the material/process state.
The action belongs to the employee.
```

If one employee starts or updates a process and another employee continues it in the next shift, the same process execution should be updated.

Backend should record who updated what and when.

## 7.4 Open / Continue action

Button:

```text
Open / Continue
```

Behavior:

- no write API call
- navigate to `/manufacturing/workspace/:stepId`

API calls happen after the workspace loads.

---

## 8. Workspace load lifecycle

When opening:

```text
/manufacturing/workspace/:stepId
```

the frontend should perform this lifecycle:

```text
1. Read step details
2. Read existing process execution by step id
3. Read process definition/schema if needed
4. If no execution exists, create one execution once
5. Store execution id in state
6. Render form with existing data or empty defaults
```

Recommended API sequence:

```http
GET /v2/process-steps/:stepId
GET /v2/process-executions/step/:stepId
GET /v2/process-definitions/:processDefinitionId
```

If no execution exists:

```http
POST /v2/process-executions
```

with:

```json
{
  "lotProcessStepId": 33,
  "formData": {}
}
```

Important:

- execution creation should happen once per `lotProcessStepId`
- do not create a new execution on every Save Progress click
- once execution exists, Save Progress should only update it

Preferred UX:

```text
Workspace load creates/gets execution
Save Progress only saves progress
```

This avoids a single button feeling like it has two secret jobs.

---

## 9. Workspace actions

## 9.1 Back button

Button:

```text
Back
```

Behavior:

- navigate back to previous page or process board
- no backend API call
- if unsaved changes exist, show confirmation dialog

API:

```text
none
```

## 9.2 Save Progress

Button:

```text
Save Progress
```

Meaning:

```text
Persist current process execution data without completing the process.
```

API:

```http
PATCH /v2/process-executions/:id/progress
```

Allowed payload fields:

```json
{
  "quantityIn": 250.5,
  "equipmentUsed": "Extractor-1",
  "operatorNotes": "Shift note here",
  "formData": {
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ]
  }
}
```

Save Progress must not:

- complete the process
- move the workflow forward
- activate next step
- create a new execution if one already exists
- put backend-owned metadata into `formData`

## 9.3 Complete Process

Button:

```text
Complete Process
```

Meaning:

```text
Finish the current process execution.
```

API:

```http
PATCH /v2/process-executions/:id/complete
```

Example payload:

```json
{
  "quantityOut": 230,
  "quantityLoss": 20.5,
  "lossReason": "Normal process loss",
  "equipmentUsed": "Extractor-1",
  "operatorNotes": "Completed by night shift",
  "supervisorNotes": "Reviewed output",
  "formData": {
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ]
  }
}
```

Backend decides after completion:

```text
if QA/QC required:
  lot_process_step → awaiting_qaqc

else:
  lot_process_step → completed
  next pending step → active
```

Frontend must refresh data after completion.

Complete Process must not:

- directly call process step complete APIs if process execution complete endpoint is the intended runtime action
- manually activate next steps
- manually mark lot/batch complete
- create execution implicitly at completion time

## 9.4 Complete Stage

Button:

```text
Complete Stage
```

Current status:

```text
Not required as a backend workflow action yet.
```

Internal stages like washing, heating, recovery, etc. are currently represented as dynamic form sections or repeatable logs inside `formData`.

Until backend explicitly supports internal process stage state, Complete Stage should either:

- be hidden
- be disabled
- or update local form state only

It must not move `lot_process_steps`.

## 9.5 Add Row

Used in repeatable tables like wash logs.

Behavior:

- modifies local form state only
- no backend API call
- persisted only when Save Progress or Complete Process is clicked

## 9.6 Delete Row

Used in repeatable tables like wash logs.

Behavior:

- modifies local form state only
- no backend API call immediately
- persisted only when Save Progress or Complete Process is clicked

## 9.7 Refresh

Behavior:

- re-fetch current workspace or board data
- warn if unsaved changes exist

---

## 10. Dynamic form behavior

Dynamic process forms are driven by process schema where available.

Schema may come from:

```text
process_definitions.default_form_schema
```

Supported initial field types:

- text
- number
- textarea
- select
- date
- time
- datetime
- checkbox
- repeatable_table

Dynamic form structure:

```text
DynamicProcessForm
  ↓
DynamicSection
  ↓
DynamicField
  ↓
field renderer / RepeatableTable
```

The form should support:

- loading existing `process_execution.form_data`
- editing fields locally
- adding/removing repeatable rows locally
- saving progress via process execution progress API
- completing process via process execution complete API

---

## 11. formData contract summary

`formData` stores dynamic process-specific fields and repeatable logs.

Allowed examples:

```json
{
  "material_details": {
    "input_weight": 250.5,
    "solvent": "Ethanol"
  },
  "operation_logs": [
    {
      "wash_no": 1,
      "solvent_qty": 25,
      "remarks": "First wash completed"
    }
  ],
  "solvent_recovery": {
    "recovered_qty": 12
  }
}
```

Do not put these inside `formData`:

- startedAt
- completedAt
- verifiedBy
- verifiedAt
- createdAt
- updatedAt
- quantityIn
- quantityOut
- quantityLoss
- yieldPercent
- operatorNotes
- supervisorNotes

These are top-level execution fields or backend-owned fields.

---

## 12. Backend-owned display fields

These fields may be displayed but should not be editable in the process form:

- created_at
- updated_at
- created_by
- updated_by
- last_updated_by
- started_at
- completed_at
- completed_by
- verified_by
- verified_at
- yield_percent, if calculated by backend

Frontend should not trust itself as the source of truth for these fields.

---

## 13. Status handling

Backend statuses may include:

- pending
- active
- in_progress
- awaiting_qaqc
- completed
- failed
- rework

Frontend display labels may normalize these for UI:

```text
active → Active
in_progress → In Progress
awaiting_qaqc → Awaiting QA/QC
completed → Completed
failed → Failed
rework → Rework
```

Frontend should not invent workflow statuses that backend does not understand.

If frontend uses display aliases like `qa_pending`, adapters must map them clearly and consistently.

---

## 14. Loading, empty, and error states

## 14.1 Board loading

Show skeleton cards or loading state.

## 14.2 Board empty

Example:

```text
No active Stripping work found.
```

Empty state should reflect current filters.

## 14.3 Board error

Show clear error and retry option.

Do not silently show mock data in production mode.

Mock fallback should only be used during development and clearly marked.

## 14.4 Workspace loading

Show loading state while fetching step/execution/schema.

## 14.5 Workspace error

Show:

- what failed
- retry action
- back action

## 14.6 Save/complete loading

Disable relevant action buttons while request is in progress.

Avoid duplicate submissions.

---

## 15. Validation rules

Save Progress should allow partial data.

Complete Process should require minimum completion fields.

Suggested minimum for Complete Process:

- execution id exists
- quantityOut is provided where required
- quantityLoss is valid if provided
- required schema fields are filled
- repeatable required rows are valid

Frontend validation helps UX.

Backend validation remains the source of truth.

---

## 16. Unsaved changes behavior

Workspace should track dirty state.

If user changes form data and tries to:

- go back
- switch route
- refresh manually

then show a confirmation dialog.

Confirmation actions:

```text
Stay
Leave Without Saving
Save and Leave, optional later
```

---

## 17. Shift handover behavior

Process executions may span multiple shifts.

Therefore:

- save progress should preserve current state
- next employee should see latest saved execution data
- activity timeline should show updates where backend supports it
- last updated by/date should come from backend
- operator fields should not be manually typed as trusted identity

Ideal card text:

```text
Last updated by Ramesh at 8:42 PM
```

If backend does not provide this yet, frontend should show fallback gracefully.

---

## 18. Activity timeline

Activity timeline should show manufacturing runtime events such as:

- step created
- step started
- execution created
- progress saved
- process completed
- moved to awaiting QA/QC
- QA/QC approved/rejected/rework
- next step activated

Current limitation:

If backend does not provide a dedicated activity endpoint, frontend may synthesize minimal timeline from timestamps, but should mark this as limited.

Future ideal:

```http
GET /v2/process-steps/:id/activity
```

or include activity in batch history.

---

## 19. API reference summary

Board:

```http
GET /v2/process-steps/board
```

Step details:

```http
GET /v2/process-steps/:id
```

Execution by step:

```http
GET /v2/process-executions/step/:stepId
```

Create execution:

```http
POST /v2/process-executions
```

Save progress:

```http
PATCH /v2/process-executions/:id/progress
```

Complete execution:

```http
PATCH /v2/process-executions/:id/complete
```

Process definition/schema:

```http
GET /v2/process-definitions/:id
GET /v2/process-definitions
```

Batch history:

```http
GET /v2/batches/:id/history
```

---

## 20. Current implementation notes

Current implemented frontend direction:

- dynamic manufacturing skeleton exists
- process board page exists
- process workspace page exists
- dynamic form components exist
- board is wired to `/v2/process-steps/board`
- save progress is wired to `/v2/process-executions/:id/progress`
- complete process is wired to `/v2/process-executions/:id/complete`
- old hardcoded process pages still exist as reference

Known concern to avoid:

```text
Save Progress should not create duplicate process_executions.
```

Execution creation should happen once when workspace loads if no execution exists.

---

## 21. Implementation rules for Codex/AI

Before modifying manufacturing runtime code, read:

```text
docs/frontend/00-frontend-overview.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/contracts/form-data-contract.md
kavalife-erp-glossary-and-schema-v1.md
docs/testing/01-e2e-happy-path-testing.md
```

If docs and code differ:

```text
Trust working code for exact current endpoint names.
Mention the mismatch in the summary.
Update docs if required.
```

Do not guess hidden behavior.

Do not combine multiple backend actions into one button unless this contract explicitly allows it.

---

## 22. Short locked summary

```text
- Manufacturing runtime starts after batch creation.
- VIR/GRN are not part of this UI contract.
- Process board shows runtime lot_process_steps as process cards.
- Process card belongs to material/process state, not one employee.
- Workspace opens one lot_process_step.
- Workspace reads or creates one process_execution for that step.
- Save Progress updates process_execution progress.
- Complete Process completes process_execution.
- Repeatable logs live inside process_execution.form_data.
- Add/Delete row are local state actions until saved.
- Frontend never manually activates next steps.
- Backend owns workflow progression and QA/QC gating.
- Backend-owned user/date fields are display-only.
```
