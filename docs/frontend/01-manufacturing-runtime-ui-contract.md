# Manufacturing Runtime UI Contract

> Status: Active frontend implementation contract  
> Scope: Inventory-driven manufacturing runtime UI  
> Audience: Developers and AI coding agents

---

## 1. Purpose

This document defines the frontend contract for manufacturing runtime screens.

The frontend should follow this mental model:

```text
Process Page
  ↓
Create New Process
  ↓
Select eligible inventory + quantity
  ↓
Create process execution
  ↓
Open process workspace/form
  ↓
Save progress
  ↓
Complete process
  ↓
Backend creates output inventory
```

The frontend must behave like an operator workflow, not a database/workflow-step editor.

---

## 2. Runtime starts after inward flow

Manufacturing runtime begins only after:

```text
VIR
  ↓
GRN
  ↓
GRN QA/QC approved
  ↓
Batch created
```

After batch creation, backend creates workflow slots as `lot_process_steps`.

---

## 3. Core runtime model

```text
lot_process_step
  = workflow eligibility slot
  = this process can be started for this batch/material

process_execution
  = actual operator job/run/form
  = created only after selecting inventory + quantity

inventory_lot
  = actual material bucket
  = only status=available lots can be consumed

process_execution_inputs
  = inventory consumed by a process execution

process_execution_outputs
  = inventory produced by a process execution
```

Important:

```text
active lot_process_step ≠ process already started
```

---

## 4. Correct frontend flow

## 4.1 Process page

Each process should feel like the GRN page pattern.

Examples:

```text
Extraction page
Stripping page
Purification page
Decolorisation page
```

Responsibilities:

- show existing jobs/logs for that process
- show status filters/search
- show `Create New {Process}` button
- open create process popup
- navigate to existing process workspace/form

Example:

```text
Extraction Page
  ↓
Create New Extraction
  ↓
Popup shows eligible raw inventory lots
  ↓
Operator selects lot(s) + quantity
  ↓
Start Extraction
  ↓
Open Extraction form/workspace
```

---

## 4.2 Create process popup

Purpose:

```text
Create a process_execution by consuming selected inventory.
```

The popup must show eligible inventory:

- lot number
- product/material name
- available quantity
- unit
- source GRN or source process execution
- status
- location if available

Operator must explicitly enter quantity.

Do not auto-fill full available quantity.

Example:

```text
Inventory lot available: 500kg
Machine capacity/current run: 250kg
Operator enters: 250kg
Remaining inventory: 250kg
```

Input payload must send only:

```json
{
  "inventoryLotId": 17,
  "quantity": 250
}
```

Do not send unit for input consumption. Backend derives unit from the selected inventory lot.

---

## 4.3 Process workspace/form

Purpose:

```text
Operate an already-created process_execution.
```

Workspace responsibilities:

- show process execution summary
- show consumed inputs
- render dynamic process form
- save progress
- complete process
- show produced outputs
- show QA/QC state

Workspace must not auto-create process executions.

If no execution exists for the opened step/form:

```text
No process job has been started for this step. Please start it from the process page.
```

---

## 5. Frontend ownership boundaries

Frontend may:

- show process pages/logs/cards
- show eligible inventory
- collect operator input quantity
- create process executions
- save process progress
- complete process executions
- display backend statuses and errors
- refresh runtime state after mutations

Frontend must not:

- auto-start process execution on workspace load
- auto-consume full inventory quantity
- decide inventory eligibility
- decide QA/QC requirement
- manually activate next workflow step
- manually release QA/QC-gated inventory
- optimistically mutate inventory
- trust frontend user/date audit fields

Backend owns:

- inventory eligibility
- inventory mutation
- workflow progression
- QA/QC gating
- output inventory creation
- lineage creation
- trusted audit metadata

---

## 6. API summary

## 6.1 Process board / process pages

```http
GET /v2/process-steps/board
```

Used to show process cards/logs with filters such as:

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

---

## 6.2 Inventory lots

```http
GET /v2/inventory-lots?status=available
```

Used by Create Process popup to show selectable material.

Only `status=available` inventory can be consumed.

---

## 6.3 Create process execution

```http
POST /v2/process-executions
```

Example:

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

Backend side effects:

- creates `process_execution`
- consumes inventory
- creates `process_execution_inputs`
- creates consume `inventory_transactions`
- updates `inventory_lots.available_quantity`

---

## 6.4 Save progress

```http
PATCH /v2/process-executions/:id/progress
```

Save Progress stores dynamic process data only.

It must not:

- consume inventory
- create output inventory
- complete process
- advance workflow

Example:

```json
{
  "formData": {
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ]
  },
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "First wash completed"
}
```

---

## 6.5 Complete process

```http
PATCH /v2/process-executions/:id/complete
```

Complete Process creates output inventory through backend.

Frontend can preview:

```text
quantityLoss = quantityIn - quantityOut
yieldPercent = quantityOut / quantityIn * 100
```

Backend owns final persisted values.

Example:

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

Backend side effects:

- completes `process_execution`
- creates output `inventory_lot`
- creates produce `inventory_transaction`
- creates `process_execution_outputs`
- creates `lot_lineage`
- moves workflow to `awaiting_qaqc` or `completed`

---

## 6.6 Inputs / outputs

```http
GET /v2/process-executions/:id/inputs
GET /v2/process-executions/:id/outputs
```

Used to display consumed material and produced material.

---

## 7. Dynamic form contract

`formData` stores process-specific operational data only.

Allowed:

```json
{
  "material_details": {},
  "operation_logs": [],
  "solvent_recovery": {}
}
```

Do not put these inside `formData`:

- quantityIn
- quantityOut
- quantityLoss
- yieldPercent
- createdAt
- updatedAt
- startedAt
- completedAt
- createdBy
- checkedBy
- verifiedBy
- operatorNotes
- supervisorNotes

These are top-level execution fields or backend-owned fields.

---

## 8. Button meanings

## Create New Process

Opens inventory selection popup.

Does not call API by itself.

---

## Start Process

Calls:

```http
POST /v2/process-executions
```

Consumes selected inventory.

Must prevent double submit.

---

## Save Progress

Calls:

```http
PATCH /v2/process-executions/:id/progress
```

No confirmation required.

Does not mutate inventory.

---

## Complete Process

Calls:

```http
PATCH /v2/process-executions/:id/complete
```

Requires confirmation.

Creates output inventory through backend.

---

## Add/Delete row

Local form state only.

Persisted only on Save Progress or Complete Process.

---

## 9. QA/QC-gated output

If process step requires QA/QC:

```text
process completed
  ↓
output inventory status = under_qaqc
  ↓
lot_process_step status = awaiting_qaqc
  ↓
QA/QC approval
  ↓
output inventory status = available
  ↓
next process step becomes active
```

Frontend must not allow `under_qaqc` inventory to be selected.

Backend also enforces this.

---

## 10. Status labels

Backend statuses may include:

```text
pending
active
in_progress
awaiting_qaqc
completed
failed
rework
```

Recommended display labels:

```text
active → Ready to Start
in_progress → In Progress
awaiting_qaqc → Awaiting QA/QC
completed → Completed
failed → Failed
rework → Rework
```

Frontend should not invent backend workflow statuses.

---

## 11. Empty/loading/error states

Process page:

- loading: show skeleton/list loading
- empty: show no jobs/logs for current filters
- error: show retry option

Create Process popup:

- no inventory: show no available material
- submitting: disable Start Process
- backend error: show backend message directly

Workspace:

- loading: show form loading
- no execution: tell user to start from process page
- saving/completing: disable relevant buttons

---

## 12. Current backend limitations to respect

Current v1 limitations:

- no create process definition API yet
- process definitions are updated through form schema update endpoint only
- one output per process completion
- no reservation system
- no progressive consumption
- no recursive lineage graph
- no advanced location/bin selector
- process execution still bridges through `lot_process_step_id`

TODO:

```text
Create process definition API later.
```

---

## 13. AI implementation rules

Before editing manufacturing runtime UI, read:

```text
docs/frontend/process-runtime-flow.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/contracts/runtime-api-contract.md
docs/frontend/contracts/form-data-contract.md
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/hooks/use-process-execution.md
```

Rules:

- keep docs concise and AI-readable
- prefer backend truth over frontend assumptions
- do not silently change runtime mental model
- do not combine multiple backend mutations into one hidden button
- report mismatches between docs and implementation

---

## 14. Short locked summary

```text
- Process pages should feel like GRN: list + Create New popup.
- lot_process_step is eligibility, not the actual job.
- process_execution is the actual job.
- inventory_lot is material truth.
- Create New Process opens inventory selection.
- Operator explicitly enters quantity to consume.
- Workspace never auto-starts execution.
- Save Progress only saves form data.
- Complete Process creates output inventory via backend.
- Backend owns inventory, workflow, QA/QC, lineage, and audit truth.
```
