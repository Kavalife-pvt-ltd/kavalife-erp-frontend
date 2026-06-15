# Frontend Button Behavior Contract

> Status: Active frontend implementation contract  
> Scope: Manufacturing runtime first; extendable to inward, QA/QC, masters, sales, and inventory later  
> Audience: Developers and AI coding agents

---

## 1. Purpose

Button behavior is business logic.

In the manufacturing runtime, a button may:

- create an official process job
- consume inventory
- save process logs
- complete a process
- create output inventory
- trigger QA/QC gates
- affect audit history

Every important button must have a clear contract.

---

## 2. Universal button rule

A button should usually do exactly one of these:

```text
navigate
modify local UI/form state
open/close dialog
refresh data
call one backend action
```

If a button does more than one thing, the behavior must be explicit.

Hidden multi-action buttons are not allowed.

---

## 3. Runtime mental model

```text
lot_process_step
  = workflow eligibility slot
  = process can be started

process_execution
  = actual process job/form/run
  = created only after selecting inventory + quantity

inventory_lot
  = material truth
  = only status=available can be consumed
```

Important:

```text
active lot_process_step ≠ process already started
```

Buttons must not blur this distinction.

---

## 4. Global button rules

## 4.1 Disable while loading

Any button calling an API must be disabled while the request is in progress.

Purpose:

```text
prevent duplicate submissions
```

---

## 4.2 Show feedback

API buttons should show:

- loading state
- success feedback
- backend error message where safe
- validation message where useful

---

## 4.3 Preserve backend truth

Buttons must not let users manually type trusted audit fields.

Backend owns:

- created_by
- updated_by
- checked_by
- approved_by
- verified_by
- created_at
- updated_at
- checked_at
- approved_at
- verified_at
- completed_at

Frontend may display these fields only.

---

## 4.4 Confirm final/destructive actions

Use confirmation dialogs for:

- Complete Process
- Approve QA/QC
- Reject QA/QC
- Delete persisted record, if supported later
- Deactivate master record

---

## 4.5 Protect dirty forms

If there are unsaved changes, navigation/close buttons should warn before leaving.

Examples:

- Back
- Close modal
- Refresh workspace
- Switch route

---

## 5. Process page buttons

Applies to:

```text
/manufacturing/processes
/manufacturing/processes/:processCode
future process-specific pages like /manufacturing/extraction
```

---

## 5.1 Create New Process

Examples:

```text
Create New Extraction
Create New Stripping
Create New Purification
```

Purpose:

```text
Open create process popup.
```

Behavior:

```text
open modal/drawer
```

API:

```text
none directly
```

Must not:

- create process execution directly
- consume inventory
- auto-select full inventory quantity
- navigate to workspace directly

---

## 5.2 Start Process

Location:

```text
Create Process popup
```

Purpose:

```text
Create the actual process_execution by consuming selected inventory.
```

API:

```http
POST /v2/process-executions
```

Request must include selected input quantities:

```json
{
  "batchId": 37,
  "processCode": "EXT",
  "processDefinitionId": 1,
  "lotProcessStepId": 79,
  "inputs": [
    {
      "inventoryLotId": 17,
      "quantity": 250
    }
  ],
  "formData": {},
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Starting extraction"
}
```

Rules:

- require explicit quantity input
- quantity must not default to full available quantity
- frontend must not send unit for input consumption
- disable while submitting
- show backend errors directly where safe

On success:

- close popup
- refresh process page/board
- navigate/open workspace for created execution/step

Must not:

- optimistically reduce inventory
- manually move workflow state
- create multiple executions from double click

---

## 5.3 Open / Continue Workspace

Purpose:

```text
Open an existing process execution workspace/form.
```

Behavior:

```text
navigate to /manufacturing/workspace/:stepId
```

API:

```text
none directly from button
```

Workspace will fetch runtime data after navigation.

Must not:

- create process execution
- consume inventory
- complete process
- activate next step

---

## 5.4 Search / Filter / Tabs / Pagination

Purpose:

```text
Change visible process cards/logs.
```

API:

```http
GET /v2/process-steps/board
```

Examples:

```http
GET /v2/process-steps/board?processCode=EXT
GET /v2/process-steps/board?status=in_progress
GET /v2/process-steps/board?search=BATCH-123
GET /v2/process-steps/board?page=2&limit=20
```

Must not call write APIs.

---

## 5.5 Refresh Process Page

Purpose:

```text
Re-fetch current process page data.
```

API:

```http
GET /v2/process-steps/board
```

with current filters.

Must not clear filters unless explicitly designed.

---

## 6. Create Process popup buttons

## 6.1 Select inventory row

Purpose:

```text
Select or unselect one available inventory lot locally.
```

API:

```text
none
```

Rules:

- only display/select `status=available` lots
- show available quantity and unit
- do not transform unit text
- do not send unit in create payload

---

## 6.2 Quantity input

Purpose:

```text
Set quantity to consume from selected lot.
```

API:

```text
none until Start Process
```

Rules:

- default empty or 0
- must be explicitly entered
- prevent quantity <= 0
- prevent quantity > available quantity in UI
- backend remains final validator

---

## 6.3 Cancel create popup

Purpose:

```text
Close popup without creating execution.
```

API:

```text
none
```

If popup has unsaved input, optional confirmation is allowed.

Must not consume inventory.

---

## 7. Process workspace buttons

Applies to:

```text
/manufacturing/workspace/:stepId
```

Workspace is for existing process executions only.

---

## 7.1 Back

Purpose:

```text
Leave workspace and return to process page/board.
```

Behavior:

```text
if dirty:
  show unsaved changes confirmation
else:
  navigate back
```

API:

```text
none
```

Must not:

- silently save
- create execution
- complete process
- move workflow

---

## 7.2 Save Progress

Purpose:

```text
Persist runtime form/process data without completing the process.
```

API:

```http
PATCH /v2/process-executions/:id/progress
```

Expected payload:

```json
{
  "formData": {
    "operation_logs": []
  },
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "First wash completed"
}
```

May update:

- formData
- equipmentUsed
- operatorNotes

Must not:

- create process execution
- consume inventory
- create output inventory
- complete process
- move workflow forward
- activate next step
- put audit metadata inside formData

---

## 7.3 Complete Process

Purpose:

```text
Finish the current process execution and create output inventory.
```

API:

```http
PATCH /v2/process-executions/:id/complete
```

Requires confirmation.

Expected payload:

```json
{
  "quantityOut": 240,
  "quantityLoss": 10,
  "lossReason": "Normal process loss",
  "formData": {
    "operation_logs": []
  },
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Extraction completed",
  "outputs": [
    {
      "productId": 1,
      "quantity": 240,
      "unitOfMeasure": "kg",
      "inventoryType": "wip",
      "currentLocation": "WIP Storage"
    }
  ]
}
```

Frontend may preview:

```text
quantityLoss = quantityIn - quantityOut
yieldPercent = quantityOut / quantityIn * 100
```

Backend owns final persisted values.

Must:

- require existing execution id
- validate required completion fields
- disable while completing
- refresh execution/outputs/page after success

Must not:

- create execution implicitly
- call process-step movement APIs directly
- manually activate next step
- manually release QA/QC inventory
- optimistically mark complete before backend response

---

## 7.4 Refresh Workspace

Purpose:

```text
Re-fetch current workspace data.
```

APIs:

```http
GET /v2/process-steps/:stepId
GET /v2/process-executions/step/:stepId
GET /v2/process-definitions/:processDefinitionId
GET /v2/process-executions/:id/inputs
GET /v2/process-executions/:id/outputs
```

If dirty, warn before refreshing.

---

## 8. Dynamic form buttons

## 8.1 Add Row

Purpose:

```text
Add local repeatable form row.
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

---

## 8.2 Delete Row

Purpose:

```text
Remove local repeatable form row.
```

API:

```text
none immediately
```

Persisted by Save Progress / Complete Process.

If row-level audit becomes required later, backend should add explicit row APIs.

---

## 8.3 Clear Field

Purpose:

```text
Clear local field value.
```

API:

```text
none immediately
```

Persisted by Save Progress / Complete Process.

---

## 9. Confirmation dialogs

## 9.1 Confirm Complete Process

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

- calls complete API
- disables while loading
- closes dialog on success
- refreshes runtime data

---

## 9.2 Unsaved Changes Dialog

Triggered by:

- Back
- Close modal
- Refresh
- route change where supported

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
- navigate/close
- no API

Save and Leave:

- optional future behavior
- would call Save Progress first
- navigate only after success

---

## 10. QA/QC buttons - high-level

Detailed QA/QC docs can be separate.

## Open QA/QC

Navigate/open QA/QC screen.

No verification action immediately.

---

## Approve QA/QC

Must:

- show confirmation
- call backend verify/approve endpoint
- let backend move workflow and release inventory

Must not:

- manually activate next step
- manually set inventory available

---

## Reject QA/QC

Must:

- require rejection reason
- call backend reject endpoint
- let backend control resulting status

---

## 11. Inward operation buttons - high-level

## Create VIR

Creates vehicle inspection record.

Backend owns created_by/created_at.

---

## Verify VIR

Approves inspection so GRN can be created.

Backend owns checked_by/checked_at.

---

## Create GRN

Officially receives material from verified VIR.

Backend prevents duplicate invalid flows.

---

## Create GRN QA/QC

Creates QA/QC entry for received material.

---

## Approve GRN QA/QC

Backend:

- approves GRN QA/QC
- creates raw inventory lot
- creates receipt inventory transaction

Frontend must not create raw inventory manually.

---

## Create Batch from GRN

Starts manufacturing runtime after GRN QA/QC approval.

Backend creates:

- batch
- runtime lot/step structure
- first active step

Frontend must not create these manually.

---

## 12. Button disabled rules

## Start Process disabled when

- no inventory selected
- selected quantity <= 0
- quantity exceeds available quantity
- submit in progress
- required context missing

---

## Save Progress disabled when

- execution id missing
- save in progress
- workspace read-only
- execution completed/locked

---

## Complete Process disabled when

- execution id missing
- complete in progress
- required completion fields missing
- execution already completed
- workflow awaiting QA/QC
- workspace read-only

---

## Add/Delete Row disabled when

- form read-only
- schema min/max row rule would be violated

---

## Open/Continue disabled when

- step id missing
- user lacks access
- backend says state is not openable

---

## 13. Permissions

Button visibility may depend on:

- user role
- user department
- process status
- backend permissions

Frontend hiding is not security.

Backend must enforce permissions.

---

## 14. Anti-patterns

Do not do these:

```text
Open workspace starts process execution
Save Progress creates process execution
Complete Process creates execution if missing
Create New Process consumes inventory before Start Process
Start Process auto-consumes full available quantity
Frontend sends trusted audit fields
Frontend sends unit for input consumption
Frontend manually activates next process step
Frontend manually marks QA/QC approved without verify endpoint
Frontend manually releases under_qaqc inventory
Add Row immediately calls backend
A button silently calls multiple write APIs without documentation
```

If any of these seem necessary, update this contract first and explain why.

---

## 15. New button checklist

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

If unclear, do not implement yet.

---

## 16. Current manufacturing runtime button summary

```text
Process Page
- Create New Process → opens popup, no API
- Start Process → POST /v2/process-executions
- Open/Continue → navigate workspace, no write API
- Search/Filter/Pagination → GET board/list only
- Refresh → GET current data only

Create Process Popup
- Select Inventory → local state only
- Quantity Input → local state only
- Cancel → close popup, no API

Workspace
- Back → navigate, warn if dirty
- Save Progress → PATCH /v2/process-executions/:id/progress
- Complete Process → PATCH /v2/process-executions/:id/complete
- Refresh → re-fetch, warn if dirty

Dynamic Form
- Add Row → local state only
- Delete Row → local state only
- Clear Field → local state only

QA/QC
- Approve/Reject → backend verify endpoint only
- frontend never releases inventory manually
```
