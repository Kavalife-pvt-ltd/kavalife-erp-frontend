# Process Workspace Page Contract

> Status: Active frontend implementation contract  
> Route: `/manufacturing/workspace/:stepId`  
> Scope: Existing process execution workspace/form  
> Audience: Developers and AI coding agents

---

## 1. Purpose

The Process Workspace Page is the operator form screen for an already-created manufacturing process execution.

It is used after the operator has already started a process from the process page/create popup.

Correct flow:

```text
Process Page
  ↓
Create New Process
  ↓
Select inventory + quantity
  ↓
POST /v2/process-executions
  ↓
Open workspace/form
```

Workspace must not auto-create process executions.

---

## 2. Core mental model

```text
lot_process_step
  = workflow eligibility slot
  = route context / process stage context

process_execution
  = actual operator job/form/run
  = must already exist before normal workspace use

inventory_lot
  = material truth
  = already consumed when execution was created
```

Important:

```text
active lot_process_step ≠ execution already exists
```

If no execution exists, show guidance and send user back to the process page.

---

## 3. Route

Current route:

```text
/manufacturing/workspace/:stepId
```

Meaning:

```text
stepId = lot_process_steps.id
```

Do not change this to `executionId` unless backend/frontend routing is intentionally refactored.

---

## 4. Related docs

Read before modifying this page:

```text
docs/frontend/process-runtime-flow.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/pages/process-board-page.md
docs/frontend/contracts/runtime-api-contract.md
docs/frontend/contracts/form-data-contract.md
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/hooks/use-process-execution.md
```

---

## 5. Page responsibilities

Workspace should:

- load step context
- load existing execution for the step
- load process definition/form schema
- show process execution summary
- show consumed inputs
- render dynamic process form
- save progress
- complete process
- show produced outputs
- show QA/QC/read-only state

Workspace should not:

- create process execution automatically
- show inventory selection as the primary creation flow
- consume inventory
- manually advance workflow state
- manually release QA/QC-gated output
- optimistically complete process

---

## 6. Load lifecycle

On page load:

```text
1. Read stepId from route
2. Fetch lot process step details
3. Fetch existing process execution by stepId
4. Fetch process definition/schema
5. Fetch execution inputs
6. Fetch execution outputs
7. Initialize form state from execution.formData
8. Render workspace
```

Expected APIs:

```http
GET /v2/process-steps/:stepId
GET /v2/process-executions/step/:stepId
GET /v2/process-definitions/:processDefinitionId
GET /v2/process-executions/:id/inputs
GET /v2/process-executions/:id/outputs
```

If no execution exists:

```text
No process job has been started for this step.
Please start it from the process page.
```

Do not call `POST /v2/process-executions` from workspace load.

---

## 7. Required display data

## 7.1 Step context

- stepId
- processCode
- processName
- processDefinitionId
- stepOrder
- status
- qaqcRequired

## 7.2 Batch/material context

- batchId
- batchNumber
- productId
- productName
- lot/process step reference if useful

## 7.3 Execution context

- executionId
- status
- quantityIn
- quantityOut
- quantityLoss
- yieldPercent
- formData
- equipmentUsed
- operatorNotes
- supervisorNotes
- startedAt
- completedAt

## 7.4 Inputs/outputs

Consumed inputs:

```text
GET /v2/process-executions/:id/inputs
```

Produced outputs:

```text
GET /v2/process-executions/:id/outputs
```

---

## 8. Layout

Recommended layout:

```text
ProcessWorkspacePage
  ├── Back / Navigation area
  ├── Header summary
  ├── Status banner
  ├── Consumed inputs section
  ├── Dynamic process form
  ├── Produced outputs section
  └── Sticky action bar
```

Priority:

```text
tablet-friendly
large buttons
low clutter
clear status
simple operator flow
```

---

## 9. Header

Header should display:

- process name/code
- execution status
- batch number
- product/material name
- quantity in
- quantity out if completed
- QA/QC required indicator
- started/completed time if available

Header fields are display-only.

---

## 10. Status banner

Show a clear banner for important states:

```text
Awaiting QA/QC approval
Completed - read only
Rework required
No process job started
Unsaved changes
```

For `awaiting_qaqc`, the form should be read-only.

---

## 11. Consumed inputs section

Show consumed material from:

```http
GET /v2/process-executions/:id/inputs
```

Display:

- lot number
- product/material
- quantity consumed
- unit
- source GRN/source execution if available

This section is read-only.

Inventory was already consumed during process execution creation.

---

## 12. Dynamic process form

Component:

```text
DynamicProcessForm
```

Responsibilities:

- render process definition schema
- initialize from `execution.formData`
- keep edits in local state
- support repeatable tables
- support read-only mode
- emit form state changes upward

Dynamic form components must not call APIs directly.

---

## 13. formData rules

`formData` contains process-specific operational data only.

Examples:

```json
{
  "material_details": {},
  "operation_logs": [],
  "solvent_recovery": {}
}
```

Do not put these in `formData`:

- quantityIn
- quantityOut
- quantityLoss
- yieldPercent
- createdAt
- updatedAt
- completedAt
- createdBy
- checkedBy
- verifiedBy
- operatorNotes
- supervisorNotes

Those are top-level execution/backend-owned fields.

---

## 14. Repeatable rows

Repeatable table behavior:

```text
Add Row → local state only
Delete Row → local state only
Save Progress → PATCH full formData
Complete Process → PATCH final formData + output data
```

Rows should not call backend individually.

---

## 15. Save Progress

Button:

```text
Save Progress
```

API:

```http
PATCH /v2/process-executions/:id/progress
```

Purpose:

```text
Save dynamic form data and notes only.
```

Allowed payload:

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

Save Progress must not:

- consume inventory
- create output inventory
- complete process
- advance workflow

On success:

- update execution state
- mark form clean
- show success feedback

---

## 16. Complete Process

Button:

```text
Complete Process
```

API:

```http
PATCH /v2/process-executions/:id/complete
```

Complete Process requires confirmation.

Payload includes:

- latest formData
- quantityOut
- quantityLoss
- lossReason if applicable
- output inventory details
- notes/equipment if applicable

Frontend may preview:

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

- completes process execution
- creates output inventory lot
- creates produce transaction
- creates process_execution_outputs row
- creates lot_lineage
- moves step to awaiting_qaqc or completed

Frontend must not manually move workflow forward.

---

## 17. Produced outputs section

Show outputs from:

```http
GET /v2/process-executions/:id/outputs
```

Display:

- output lot number
- product/material
- quantity produced
- unit
- inventory type
- status

Important statuses:

```text
under_qaqc → Awaiting QA/QC
available → Available for next process
```

This section is read-only.

---

## 18. Read-only states

Workspace should be read-only when:

- execution status is completed
- step status is awaiting_qaqc
- step status is completed
- output is under_qaqc
- user lacks permission

Read-only means:

- form fields disabled
- add/delete row disabled
- Save Progress disabled
- Complete Process disabled
- inputs/outputs/summary remain visible

---

## 19. Dirty state

Track local unsaved form changes.

Dirty becomes true when:

- field changes
- repeatable row added/deleted
- notes/equipment changes

Dirty becomes false when:

- Save Progress succeeds
- Complete Process succeeds
- form reloads from backend

Back/refresh should warn if dirty.

---

## 20. Back behavior

Back button:

```text
if dirty:
  show unsaved changes confirmation
else:
  navigate back to process page
```

Back must not:

- silently save
- complete process
- create execution
- move workflow

---

## 21. Loading/error states

Initial loading:

```text
loading step + execution + schema
```

No execution:

```text
No process job has been started for this step.
Please start it from the process page.
```

Save error:

```text
keep local state and allow retry
```

Complete error:

```text
keep local state and allow retry
```

Show backend error messages where safe.

---

## 22. Permissions

UI may hide/disable actions by role/department/status.

Backend remains security source of truth.

Do not rely on frontend hiding as security.

---

## 23. Anti-patterns

Do not do these:

```text
Workspace creates process execution on load
Workspace shows inventory selection as main creation flow
Save Progress creates execution
Complete Process creates execution if missing
Add/Delete row calls backend immediately
Frontend manually activates next step
Frontend manually releases QA/QC inventory
Frontend mutates inventory optimistically
formData contains audit metadata/top-level execution fields
```

---

## 24. AI implementation rules

Before editing workspace, read:

```text
docs/frontend/process-runtime-flow.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/pages/process-board-page.md
docs/frontend/contracts/runtime-api-contract.md
docs/frontend/contracts/form-data-contract.md
docs/frontend/contracts/button-behavior-contract.md
docs/frontend/hooks/use-process-execution.md
```

Rules:

- keep workspace as existing-execution operator form
- do not reintroduce auto-start behavior
- do not move create process flow back into workspace
- do not duplicate backend manufacturing rules
- report contract/API mismatches

---

## 25. Short locked summary

```text
- Workspace is for an existing process_execution.
- Route still uses stepId for v1.
- Workspace loads step + execution + schema + inputs + outputs.
- No execution means show guidance, do not auto-create.
- Save Progress only updates form/progress data.
- Complete Process creates output inventory through backend.
- Dynamic form data stays inside formData.
- Inputs/outputs are read-only runtime material sections.
- Backend owns workflow, inventory, QA/QC, lineage, and audit truth.
```
