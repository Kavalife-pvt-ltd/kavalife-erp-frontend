# Frontend Button Behavior Contract

> Status: Active implementation contract  
> Scope: Manufacturing runtime first; extendable to inward, QA/QC, masters, sales, and inventory later  
> Purpose: Define what frontend buttons/actions are allowed to do, which APIs they call, and what they must never do.

---

## 1. Purpose

This document exists because button behavior is business logic.

A button is not just UI. In ERP workflows, one button may:

- change material state
- save process logs
- trigger QA/QC gates
- create official records
- move work to the next department
- affect audit history

Therefore, every important button must have a documented contract.

This prevents:

- hidden multi-action buttons
- duplicate record creation
- frontend moving workflow state incorrectly
- Codex/AI guessing action behavior
- accidental API misuse
- confusing shift handover behavior

---

## 2. Universal button rule

Every button should usually do exactly one of these:

```text
navigate
modify local UI/form state
call one backend action
open/close a dialog
refresh data
```

If a button must do more than one thing, that behavior must be explicitly documented.

Hidden multi-action behavior is not allowed.

---

## 3. Global interaction rules

## 3.1 Disable while loading

Buttons that call APIs must be disabled while the request is in progress.

Purpose:

```text
prevent duplicate submissions
```

Example:

```text
Save Progress clicked
  ↓
button disabled
  ↓
API returns
  ↓
button enabled
```

## 3.2 Show feedback

API buttons should provide feedback:

- loading state
- success toast/message
- error toast/message
- inline validation message where useful

## 3.3 Preserve audit truth

Buttons must not ask users to manually type trusted identity/date fields.

Backend owns:

- created_by
- updated_by
- checked_by
- approved_by
- verified_by
- started_at
- completed_at
- updated_at
- verified_at

Frontend may display these fields but should not treat them as editable trusted inputs.

## 3.4 Confirm destructive or final actions

Buttons that finalize or destroy important data should use confirmation dialogs.

Examples:

- Complete Process
- Verify QA/QC
- Reject QA/QC
- Delete Row if row already persisted later
- Deactivate master record

## 3.5 Dirty form protection

If a page has unsaved changes, navigation buttons should warn before leaving.

Example actions requiring dirty-state check:

- Back
- Close modal
- Switch route
- Refresh current data

---

## 4. Manufacturing runtime button contracts

Manufacturing runtime uses:

```text
lot_process_steps
  = workflow/runtime state tracker

process_executions
  = actual execution/log/form record
```

Frontend buttons must respect this boundary.

Frontend must not directly:

- create lot_process_steps
- activate next process steps
- mark workflow state completed manually
- decide QA/QC routing
- move material forward by itself

Backend owns workflow movement.

---

## 5. Process Board buttons

Applies to:

```text
/manufacturing/processes
/manufacturing/processes/:processCode
```

## 5.1 Open / Continue

Location:

```text
ProcessCard
```

Purpose:

```text
Open the process workspace for a runtime lot process step.
```

Behavior:

```text
navigate to /manufacturing/workspace/:stepId
```

API calls:

```text
none directly from button
```

Notes:

- workspace page will fetch step/execution/schema after navigation
- this button must not create process execution directly
- this button must not start or complete process steps

## 5.2 Process Tab Click

Location:

```text
ProcessTabs
```

Purpose:

```text
Filter board by process code.
```

Behavior:

```text
navigate to /manufacturing/processes/:processCode
```

API effect:

```http
GET /v2/process-steps/board?processCode=EXT
```

Notes:

- tab click itself is navigation/filtering
- it should not call write APIs
- process code must use backend code like EXT, STR, PUR, DEC, PKG

## 5.3 Search

Location:

```text
ProcessBoardPage
```

Purpose:

```text
Search process cards by batch, lot, product, or supported backend search fields.
```

Behavior:

```text
update search state
fetch board with search query
```

API:

```http
GET /v2/process-steps/board?search=<query>
```

Notes:

- debounce is recommended
- search should reset page to 1

## 5.4 Filter Status

Purpose:

```text
Show process cards by status.
```

API:

```http
GET /v2/process-steps/board?status=active,in_progress,awaiting_qaqc
```

Notes:

- no write API
- should reset page to 1

## 5.5 Pagination Controls

Purpose:

```text
Navigate through board results.
```

API:

```http
GET /v2/process-steps/board?page=2&limit=20
```

Notes:

- no write API
- preserve active filters while changing page

## 5.6 Refresh Board

Purpose:

```text
Re-fetch current board data.
```

API:

```http
GET /v2/process-steps/board
```

with current filters.

Notes:

- no write API
- should not clear filters unless explicitly designed

---

## 6. Process Workspace buttons

Applies to:

```text
/manufacturing/workspace/:stepId
```

## 6.1 Back

Purpose:

```text
Leave workspace and return to previous page/board.
```

Behavior:

```text
if form is dirty:
  show unsaved changes confirmation
else:
  navigate back
```

API:

```text
none
```

Confirmation options:

```text
Stay
Leave Without Saving
Save and Leave, optional future behavior
```

Notes:

- Back must not auto-save silently
- Back must not complete process

## 6.2 Save Progress

Purpose:

```text
Persist current process execution data without completing the process.
```

Runtime meaning:

```text
Save Progress = update process_executions.form_data and editable execution fields
```

API:

```http
PATCH /v2/process-executions/:id/progress
```

Expected payload shape:

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

Save Progress may update:

- formData
- quantityIn
- equipmentUsed
- operatorNotes

Save Progress must not:

- complete process
- move workflow forward
- activate next step
- create duplicate process execution
- place backend-owned metadata inside formData

Important execution rule:

```text
If process_execution does not exist, workspace load should create it once.
Save Progress should generally only PATCH existing execution.
```

If Save Progress must create execution as a fallback, it may do this only once:

```text
POST /v2/process-executions
  ↓
store returned execution id
  ↓
PATCH /v2/process-executions/:id/progress
```

But preferred behavior is:

```text
create/get execution during workspace load
Save Progress = PATCH only
```

## 6.3 Complete Process

Purpose:

```text
Finish the current process execution.
```

API:

```http
PATCH /v2/process-executions/:id/complete
```

Expected payload shape:

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

Complete Process must:

- require an existing execution id
- validate required completion fields
- show confirmation before submitting
- disable while loading
- refresh workspace/board after success

Complete Process must not:

- create execution implicitly at completion time
- call process-step movement APIs directly
- manually activate next step
- manually mark lot/batch completed

Backend decides:

```text
if QA/QC required:
  lot_process_step → awaiting_qaqc

else:
  lot_process_step → completed
  next pending step → active
```

## 6.4 Complete Stage

Purpose:

```text
Optional local stage marker inside a process form.
```

Current rule:

```text
Complete Stage is not a backend workflow action yet.
```

Until backend supports internal process stage state, this button should be:

- hidden, or
- disabled, or
- local form-state only

It must not:

- move lot_process_steps
- call complete process API
- activate next workflow step

## 6.5 Refresh Workspace

Purpose:

```text
Re-fetch current step/execution/schema data.
```

API:

```http
GET /v2/process-steps/:stepId
GET /v2/process-executions/step/:stepId
GET /v2/process-definitions/:processDefinitionId
```

Behavior:

- if form is dirty, warn first
- if not dirty, re-fetch directly

---

## 7. Dynamic form buttons

## 7.1 Add Row

Location:

```text
RepeatableTable
```

Purpose:

```text
Add a local repeatable log row.
```

Behavior:

```text
update local form state only
```

API:

```text
none immediately
```

Persisted by:

```text
Save Progress
Complete Process
```

Example:

```text
Add Wash Row
  → adds another object to formData.operation_logs locally
```

## 7.2 Delete Row

Purpose:

```text
Remove a local repeatable log row.
```

Behavior:

```text
update local form state only
```

API:

```text
none immediately
```

Persisted by:

```text
Save Progress
Complete Process
```

Notes:

- if row deletion becomes audit-sensitive later, backend should support explicit row-level history
- for now repeatable rows are part of formData JSON

## 7.3 Clear Field

Purpose:

```text
Clear one local field value.
```

API:

```text
none immediately
```

Persisted by Save Progress / Complete Process.

---

## 8. Confirmation dialog buttons

## 8.1 Confirm Complete Process

Triggered by:

```text
Complete Process
```

Buttons:

```text
Cancel
Confirm Complete
```

Cancel:

- closes dialog
- no API

Confirm Complete:

- calls `PATCH /v2/process-executions/:id/complete`
- disables while loading
- closes dialog on success
- refreshes data on success

## 8.2 Unsaved Changes Dialog

Triggered by:

- Back
- Refresh
- route change, where supported

Buttons:

```text
Stay
Leave Without Saving
Save and Leave, optional later
```

Stay:

- close dialog
- no API

Leave Without Saving:

- discard local unsaved state
- navigate away
- no API

Save and Leave:

- optional future behavior
- would call Save Progress first
- then navigate on success

---

## 9. QA/QC button contracts - high-level placeholder

Detailed QA/QC behavior belongs in:

```text
docs/frontend/03-qaqc-ui-contract.md
docs/frontend/qaqc/step-qaqc.md
```

High-level rules:

## 9.1 Open QA/QC

Behavior:

- navigate/open QA/QC screen
- no verification action immediately

## 9.2 Save QA/QC Draft

Behavior:

- save QA/QC form data if draft support exists
- otherwise hide until backend supports it

## 9.3 Approve QA/QC

Behavior:

- show confirmation
- call backend verify/approve endpoint
- backend moves process state forward

Frontend must not manually activate next step.

## 9.4 Reject QA/QC

Behavior:

- require rejection reason
- call backend reject endpoint
- backend marks target failed/rework as appropriate

## 9.5 Retest Required

Behavior:

- require retest reason
- call backend retest endpoint if supported
- backend controls status

---

## 10. Inward operation button contracts - high-level placeholder

Detailed VIR/GRN behavior belongs in:

```text
docs/frontend/02-inward-operations-ui-contract.md
docs/frontend/inward/vir.md
docs/frontend/inward/grn.md
docs/frontend/inward/grn-qaqc.md
```

High-level rules:

## 10.1 Create VIR

Purpose:

```text
Record truck/material arrival inspection.
```

This is a real create action.

## 10.2 Verify VIR

Purpose:

```text
Approve vehicle/material inspection so GRN can be created.
```

Backend should own checked_by/checked_at.

## 10.3 Create GRN

Purpose:

```text
Officially receive material from a completed VIR.
```

Backend should prevent duplicate GRN for same VIR.

## 10.4 Create GRN QA/QC

Purpose:

```text
Create QA/QC entry for received material.
```

Backend should prevent duplicate pending QA/QC for same GRN.

## 10.5 Create Batch from GRN

Purpose:

```text
Start manufacturing runtime after GRN QA/QC approval.
```

Backend creates:

- batch
- initial lot
- lot process steps
- first active step

Frontend must not create these runtime steps manually.

---

## 11. Masters button contracts - high-level placeholder

Detailed masters behavior belongs in:

```text
docs/frontend/04-masters-ui-contract.md
docs/frontend/masters/*
```

Masters buttons usually follow admin CRUD patterns:

- Create
- Edit
- Save
- Cancel
- Activate/Deactivate
- Search
- Filter
- Pagination

Important rules:

- prefer deactivate over hard delete for important business data
- show confirmation for deactivate/delete
- do not allow deleting records already used in runtime history unless backend supports safe archival

---

## 12. Button loading and disabled states

## 12.1 Save Progress

Disabled when:

- execution id missing and creation failed
- save request in progress
- form is read-only
- process is completed/locked

## 12.2 Complete Process

Disabled when:

- execution id missing
- completion request in progress
- required completion fields missing
- process is already completed
- process is awaiting QA/QC
- process is failed/rework unless backend allows action

## 12.3 Add Row

Disabled when:

- form is read-only
- max rows reached, if schema defines maxRows

## 12.4 Delete Row

Disabled when:

- form is read-only
- min rows would be violated, if schema defines minRows

## 12.5 Open / Continue

Disabled when:

- step id missing
- user does not have access
- process state is not openable

---

## 13. Button/access permission rules

Button visibility should be controlled by:

- user role
- user department
- process status
- backend permissions where available

Examples:

```text
Production employee
  → can open/save production process assigned to their department

QA/QC employee
  → can open QA/QC queue and verify tests

Admin/manager
  → can view broader runtime and reports
```

UI hiding is not security.

Backend must enforce permissions.

---

## 14. Anti-patterns

Do not do these:

```text
Save Progress creates a new process_execution every time
Complete Process creates execution if missing
Open / Continue starts workflow movement
Add Row immediately calls backend
Frontend manually activates next process step
Frontend manually marks QA/QC approved without backend verify endpoint
Frontend sends trusted created_by/updated_by/verified_by fields
Backend-owned timestamps are editable text boxes
A button silently calls 3 APIs without documentation
```

If one of these seems necessary, update this contract first and explain why.

---

## 15. Implementation checklist for new buttons

Before implementing a new button, answer:

```text
1. What is the button called?
2. Where does it appear?
3. Who can see it?
4. What state must exist before it is enabled?
5. Does it navigate, update local state, open dialog, refresh, or call API?
6. Which exact API does it call?
7. What request body does it send?
8. What happens on success?
9. What happens on error?
10. Should it be confirmed?
11. Should it be disabled after completion?
12. What must it never do?
```

If these are not clear, do not implement yet.

---

## 16. Current manufacturing runtime button summary

```text
Process Board
- Process Tab Click → navigate/filter, GET board
- Search → update filter, GET board
- Filter Status → update filter, GET board
- Pagination → GET board with page/limit
- Open / Continue → navigate to workspace, no write API

Process Workspace
- Back → navigate, no API, warn if dirty
- Save Progress → PATCH /v2/process-executions/:id/progress
- Complete Process → PATCH /v2/process-executions/:id/complete
- Complete Stage → not backend action yet
- Refresh → re-fetch, warn if dirty

Dynamic Form
- Add Row → local state only
- Delete Row → local state only
- Clear Field → local state only

Confirmation Dialogs
- Confirm Complete → complete API
- Cancel → close dialog, no API
- Leave Without Saving → navigate, no API
```
