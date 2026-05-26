# Process Board / Process Page Contract

> Status: Active frontend implementation contract  
> Scope: Process-specific manufacturing pages  
> Audience: Developers and AI coding agents

---

## 1. Purpose

Process pages are the operator entry point for manufacturing work.

They should feel similar to the current GRN page pattern:

```text
Page shows existing records/logs
  ↓
User clicks Create New
  ↓
Popup shows eligible source records/material
  ↓
User fills basic start details
  ↓
System creates the runtime record
  ↓
User opens/fills the form
```

For manufacturing:

```text
Extraction Page
  ↓
Create New Extraction
  ↓
Select eligible inventory + quantity
  ↓
Create process execution
  ↓
Open Extraction workspace/form
```

---

## 2. Core mental model

```text
lot_process_step
  = workflow eligibility slot
  = this process is allowed to start

process_execution
  = actual process job/run/form
  = created only after inventory + quantity selection

inventory_lot
  = actual material bucket
  = selectable only when status=available
```

Important:

```text
active lot_process_step ≠ process execution already started
```

The board/page should not auto-start process executions.

---

## 3. Page variants

The same page pattern applies to:

```text
Extraction
Stripping
Purification
Decolorisation
Future process modules
```

Recommended route options:

```text
/manufacturing/processes/:processCode
```

or later process-specific aliases:

```text
/manufacturing/extraction
/manufacturing/stripping
```

Current route compatibility should be preserved unless intentionally refactored.

---

## 4. Page responsibilities

The process page should:

- show process jobs/logs for one process type
- show status filters and search
- show running/in-progress jobs
- show awaiting QA/QC jobs
- show completed jobs
- expose `Create New {Process}` button
- open create process popup
- navigate to workspace/form for existing jobs

The page should not:

- auto-create a process execution
- auto-consume inventory
- open workspace as a creation flow
- decide inventory eligibility beyond display filtering
- manually advance workflow state

---

## 5. Data source

Primary board API:

```http
GET /v2/process-steps/board
```

Use filters such as:

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

The returned cards represent workflow/runtime step slots and/or runtime jobs depending on backend response.

Frontend must clearly distinguish display states:

```text
Ready to Start
In Progress
Awaiting QA/QC
Completed
Rework
Failed
```

---

## 6. Card behavior

Each card should represent one process slot/job context.

A card should show:

- process name/code
- batch number
- lot/process step id if useful
- product/material name
- status
- quantity in/out if available
- operator/user if available
- updated/started/completed time if available

---

## 7. Card actions

## 7.1 Ready to Start / active slot

Show:

```text
Create Process Job
```

Action:

```text
open Create Process popup with card context
```

Do not navigate directly to workspace unless an execution already exists.

---

## 7.2 In Progress

Show:

```text
Continue Workspace
```

Action:

```text
navigate to workspace/form for existing execution
```

---

## 7.3 Awaiting QA/QC

Show:

```text
Awaiting QA/QC
```

Optional action:

```text
View Workspace / View Summary
```

Do not allow process editing unless backend allows it.

---

## 7.4 Completed

Show:

```text
View Summary
```

Action:

```text
open read-only workspace/summary
```

---

## 8. Create Process popup

The popup should be opened from:

```text
Create New {Process}
```

or from a `Ready to Start` card.

The popup must receive enough context to create the execution:

```text
batchId
lotProcessStepId
processCode
processDefinitionId
processName
batchNumber
```

The popup should ask the operator for:

- eligible inventory lot(s)
- quantity to consume per lot
- equipment/basic start info if needed
- optional operator notes

It should not ask for low-level workflow IDs if they are already known from the selected card/context.

---

## 9. Inventory selection rules

Fetch selectable inventory using:

```http
GET /v2/inventory-lots?status=available
```

Display:

- lot number
- product/material name
- available quantity
- unit
- source GRN/source execution
- location if available

Rules:

- quantity input defaults to empty or 0
- never auto-fill full available quantity
- prevent quantity <= 0 in UI
- prevent quantity > available quantity in UI
- backend remains final validator
- frontend must not send unit for input consumption

Input payload should contain only:

```json
{
  "inventoryLotId": 17,
  "quantity": 250
}
```

---

## 10. Create execution API

Endpoint:

```http
POST /v2/process-executions
```

Request shape:

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

After success:

- close popup
- refresh process page/board
- navigate to workspace/form for created execution
- do not optimistically mutate inventory

---

## 11. Workspace navigation

Current compatible route:

```text
/manufacturing/workspace/:stepId
```

The workspace should load the execution associated with the step.

If no execution exists:

```text
No process job has been started for this step. Please start it from the process page.
```

Workspace must not auto-create execution.

---

## 12. Filters

Minimum filters:

- search
- status
- process code if using shared page

Useful later:

- batch number
- product
- date range
- operator

Keep filters simple for v1.

---

## 13. Empty/loading/error states

Loading:

```text
Show skeleton or loading list.
```

Empty:

```text
No process jobs found for this filter.
```

No eligible inventory:

```text
No available inventory found for this process.
```

Error:

```text
Show backend error message and retry action.
```

---

## 14. AI implementation rules

Before editing this page, read:

```text
docs/frontend/process-runtime-flow.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/contracts/runtime-api-contract.md
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/hooks/use-process-execution.md
```

Rules:

- keep process page behavior aligned with GRN-style create popup pattern
- do not auto-start process executions
- do not auto-consume full inventory
- do not change route identity unless explicitly instructed
- do not duplicate backend manufacturing rules
- report any mismatch between board API data and required UI context

---

## 15. Short locked summary

```text
- Process page = list/jobs + Create New Process.
- Create New Process opens inventory selection popup.
- Operator explicitly selects inventory and quantity.
- POST /v2/process-executions creates the actual job.
- Workspace is only for existing process executions.
- active lot_process_step means ready to start, not already started.
- Backend owns inventory, workflow, QA/QC, and audit truth.
```
