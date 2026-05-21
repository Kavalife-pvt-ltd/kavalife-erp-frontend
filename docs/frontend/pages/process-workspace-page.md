# Process Workspace Page

> Status: Active page contract  
> Route: `/manufacturing/workspace/:stepId`  
> Scope: Manufacturing runtime process execution workspace

---

## 1. Purpose

The Process Workspace Page is the main working screen for a manufacturing floor operator.

It opens one runtime `lot_process_step` and lets the operator:

- view process/batch/lot context
- view or create the related `process_execution`
- fill dynamic process form data
- add repeatable operation logs
- save progress
- complete the process execution
- view activity/history where available

This page is used for processes like:

- Extraction
- Stripping
- Purification
- Decolorisation
- Packaging

This page is not used for VIR/GRN creation.

---

## 2. Related docs

Read these before modifying this page:

```text
docs/frontend/00-frontend-overview.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/contracts/form-data-contract.md
docs/frontend/components/process-workspace-header.md
docs/frontend/components/process-action-bar.md
docs/frontend/components/dynamic-process-form.md
docs/frontend/components/repeatable-table.md
```

Backend reference:

```text
kavalife-erp-glossary-and-schema-v1.md
docs/testing/01-e2e-happy-path-testing.md
```

---

## 3. Route

```text
/manufacturing/workspace/:stepId
```

Example:

```text
/manufacturing/workspace/41
```

Meaning:

```text
Open lot_process_steps.id = 41
```

The route param is:

```ts
stepId: string;
```

It should be parsed/used to fetch the runtime process step.

---

## 4. Business model

This page works with two core backend concepts:

```text
lot_process_steps
  = workflow/runtime state tracker

process_executions
  = actual form/log/execution record
```

The page should never manually move workflow state.

It should only:

- read step state
- read/create process execution
- update process execution progress
- complete process execution

Backend decides:

- whether the step moves to `awaiting_qaqc`
- whether the step becomes `completed`
- whether next step becomes `active`
- whether batch/lot should close

---

## 5. High-level page layout

Recommended layout:

```text
ProcessWorkspacePage
  ├── Top Navigation / Back Area
  ├── ProcessWorkspaceHeader
  ├── Status / Context Banner
  ├── DynamicProcessForm
  │     ├── DynamicSection
  │     ├── DynamicField
  │     └── RepeatableTable
  ├── ProcessActivityTimeline
  └── ProcessActionBar
```

Visual direction:

```text
tablet-friendly
large touch targets
clear section grouping
sticky action area
minimal clutter
high contrast
responsive
```

---

## 6. Workspace load lifecycle

When the page opens:

```text
1. Read stepId from route
2. Fetch lot process step details
3. Fetch existing process execution by stepId
4. Fetch process definition/schema
5. If execution does not exist, create it once
6. Store execution id in state
7. Initialize form state from execution.formData
8. Render workspace
```

Recommended API calls:

```http
GET /v2/process-steps/:stepId
GET /v2/process-executions/step/:stepId
GET /v2/process-definitions/:processDefinitionId
```

If execution does not exist:

```http
POST /v2/process-executions
```

Example create body:

```json
{
  "lotProcessStepId": 41,
  "formData": {}
}
```

Important rules:

- execution creation should happen once per step
- do not create a new execution on every Save Progress click
- once execution exists, Save Progress should PATCH only
- Complete Process should require an existing execution id

---

## 7. Data required by page

The workspace should have access to:

## 7.1 Step details

- stepId
- status
- processDefinitionId
- processCode
- processName
- stepOrder
- qaqcRequired
- startedAt
- completedAt
- updatedAt

## 7.2 Batch/lot/product context

- batchId
- batchNumber
- lotId
- lotNumber
- productId
- productName
- quantity
- unit

## 7.3 Execution details

- executionId
- quantityIn
- quantityOut
- quantityLoss
- lossReason
- yieldPercent
- equipmentUsed
- operatorNotes
- supervisorNotes
- formData
- formDataVersion
- startedAt
- completedAt
- completedBy
- verifiedBy
- verifiedAt
- createdAt
- updatedAt

## 7.4 Process schema

From process definition:

- defaultFormSchema
- sections
- fields
- field types
- repeatable tables
- validation rules where available

---

## 8. Header behavior

Component:

```text
ProcessWorkspaceHeader
```

Should display:

- process name/code
- status badge
- batch number
- lot number
- product name
- current quantity/unit
- QA/QC required indicator
- last updated by/date if available

Header must not contain editable form fields.

Backend-owned metadata should be display-only.

---

## 9. Status/context banner

The page may show a banner under the header for important states.

Examples:

```text
This process is awaiting QA/QC. Editing is locked.
```

```text
This process has been completed. Form is read-only.
```

```text
This process is in rework. Check supervisor instructions.
```

```text
Unsaved changes present.
```

Banner should be visually clear but not noisy.

---

## 10. Dynamic form behavior

Component:

```text
DynamicProcessForm
```

It should:

- render schema sections
- initialize from `process_execution.formData`
- keep edits in local state
- support repeatable tables
- emit form state changes upward
- support read-only mode
- not call APIs directly

API calls should be owned by page/hook/action handlers, not individual field components.

---

## 11. Repeatable logs behavior

Component:

```text
RepeatableTable
```

Used for things like:

- wash logs
- heating cycles
- stripping operation rows
- purification wash rows
- solvent recovery rows, if repeatable

Rules:

```text
Add Row → local state only
Delete Row → local state only
Save Progress → persists full formData
Complete Process → persists final formData
```

Repeatable rows should not call backend immediately.

---

## 12. Action bar behavior

Component:

```text
ProcessActionBar
```

Recommended placement:

```text
sticky bottom on tablet/mobile
normal footer or sticky footer on desktop
```

Main actions:

- Back
- Save Progress
- Complete Process

Optional/future actions:

- Refresh
- Complete Stage, only if internal stage support exists

Buttons must follow:

```text
docs/frontend/contracts/button-behavior-contract.md
```

---

## 13. Back behavior

Button:

```text
Back
```

Behavior:

```text
if form is dirty:
  show unsaved changes dialog
else:
  navigate back
```

API:

```text
none
```

Back must not:

- auto-save silently
- complete process
- create execution
- move workflow

---

## 14. Save Progress behavior

Button:

```text
Save Progress
```

API:

```http
PATCH /v2/process-executions/:id/progress
```

Save Progress persists:

- current `formData`
- quantityIn if editable/available
- equipmentUsed if editable/available
- operatorNotes if editable/available

Example body:

```json
{
  "quantityIn": 250.5,
  "equipmentUsed": "EXT-01",
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

- complete process
- activate next step
- move workflow state
- create duplicate execution
- put backend-owned metadata inside formData

On success:

- update local execution state
- mark form as clean
- show success feedback
- optionally refresh board/workspace data

On error:

- keep local unsaved state
- show error feedback
- allow retry

---

## 15. Complete Process behavior

Button:

```text
Complete Process
```

API:

```http
PATCH /v2/process-executions/:id/complete
```

Complete Process should show confirmation before API call.

Example body:

```json
{
  "quantityOut": 230,
  "quantityLoss": 20.5,
  "lossReason": "Normal process loss",
  "equipmentUsed": "EXT-01",
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
  step → awaiting_qaqc
else:
  step → completed
  next pending step → active
```

Frontend must not manually activate next step.

On success:

- show success feedback
- refresh step/execution data
- redirect to process board if desired
- or show read-only completed state

On error:

- keep form data
- show error feedback
- allow retry

---

## 16. Dirty state behavior

Page must track whether local form state differs from last saved execution data.

Dirty state should become true when:

- any field changes
- repeatable row added
- repeatable row deleted
- notes/top-level editable fields change

Dirty state should become false when:

- Save Progress succeeds
- Complete Process succeeds
- data is reloaded and local state resets

Dirty state is used by:

- Back button
- Refresh button
- route leave warning, where supported

---

## 17. Read-only behavior

Workspace should become read-only when:

- process execution is completed
- lot process step is awaiting QA/QC
- lot process step is completed
- lot process step is failed, unless rework editing is allowed
- user lacks permission

In read-only mode:

- form fields disabled/read-only
- Add Row disabled
- Delete Row disabled
- Save Progress disabled
- Complete Process disabled
- metadata and timeline remain visible

---

## 18. Loading states

## 18.1 Initial loading

Show loading skeleton/state while fetching:

- step details
- execution
- process definition/schema

## 18.2 Save loading

While Save Progress is running:

- disable Save Progress
- optionally disable Complete Process
- show saving label/spinner

## 18.3 Complete loading

While Complete Process is running:

- disable Complete Process
- disable Save Progress
- show completing label/spinner

Avoid duplicate submissions.

---

## 19. Error states

## 19.1 Step not found

Show:

```text
Process step not found.
```

Actions:

- Back to board
- Retry

## 19.2 Execution create/read failed

Show clear error.

If execution cannot be created/read, disable Save Progress and Complete Process.

## 19.3 Schema failed

If schema fails but execution exists:

- show fallback form only in development if allowed
- otherwise show clear error

## 19.4 Save failed

Keep local state and allow retry.

## 19.5 Complete failed

Keep local state and allow retry.

---

## 20. Activity timeline

Component:

```text
ProcessActivityTimeline
```

Should show events such as:

- step created
- execution created
- progress saved
- process completed
- moved to awaiting QA/QC
- QA/QC approved/rejected
- next step activated

Current limitation:

If backend has no dedicated activity endpoint, frontend may synthesize limited timeline from timestamps, but should not pretend it is complete audit history.

---

## 21. Responsive behavior

## 21.1 Desktop

Desktop may use:

- wider layout
- form and timeline side-by-side if useful
- sticky header/action footer

## 21.2 Tablet

Tablet is the priority for floor UI.

Use:

- large cards/sections
- large buttons
- generous spacing
- sticky bottom action bar
- minimal dense tables

## 21.3 Mobile

Mobile should stack sections vertically.

Mobile is mainly for review/manager access, not ideal heavy process entry.

---

## 22. Permissions

Button visibility and editability should depend on:

- user role
- user department
- process status
- backend permissions where available

UI hiding is not security.

Backend must enforce permissions.

---

## 23. API summary

Required/expected APIs:

```http
GET /v2/process-steps/:stepId
GET /v2/process-executions/step/:stepId
GET /v2/process-definitions/:processDefinitionId
POST /v2/process-executions
PATCH /v2/process-executions/:id/progress
PATCH /v2/process-executions/:id/complete
```

Optional/future:

```http
GET /v2/process-steps/:stepId/activity
```

---

## 24. Anti-patterns

Do not do these:

```text
Save Progress creates a new process_execution every click
Complete Process creates execution if missing
Back silently saves progress
Add Row calls backend immediately
Delete Row calls backend immediately
formData contains startedAt/completedAt/verifiedBy
formData contains quantityIn/quantityOut/operatorNotes
Frontend manually activates next process step
Frontend manually sets lot_process_step completed
Complete Stage moves workflow state without backend support
```

---

## 25. Implementation checklist

Before modifying this page, confirm:

```text
1. Does workspace load fetch step, execution, and schema?
2. Does missing execution get created only once?
3. Does Save Progress PATCH existing execution only?
4. Does Complete Process require existing execution id?
5. Does formData exclude metadata/top-level execution fields?
6. Are Add/Delete Row local-only?
7. Is dirty state tracked?
8. Are read-only states enforced?
9. Are duplicate submissions prevented?
10. Does backend own workflow progression?
```

---

## 26. Short locked summary

```text
- ProcessWorkspacePage opens one lot_process_step.
- It reads/creates one process_execution for that step.
- Dynamic form edits are local until saved/completed.
- Save Progress PATCHes execution progress.
- Complete Process PATCHes execution complete.
- Add/Delete row are local state actions.
- Frontend never manually moves workflow forward.
- Backend decides QA/QC gating and next step activation.
- Page must be tablet-friendly, clear, and low-clutter.
```
