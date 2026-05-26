# Manufacturing Process Runtime Flow

> Status: Active frontend implementation contract  
> Scope: Process-specific operator UI for inventory-driven manufacturing  
> Applies to: Extraction, Stripping, Purification, Decolorisation, and future process modules

---

# 1. Purpose

This document defines the correct frontend mental model for manufacturing process runtime.

The backend now supports an inventory-driven manufacturing engine.

The frontend must therefore behave like a process operator interface, not like a workflow-table editor.

The desired operator experience is:

```text
Process Page
  ↓
Create New Process
  ↓
Select eligible input inventory
  ↓
Enter quantity to process
  ↓
Create process execution
  ↓
Open process form/workspace
  ↓
Save operational logs
  ↓
Complete process
  ↓
Backend creates output inventory
  ↓
QA/QC gate if required
  ↓
Output becomes available for next process
```

---

# 2. Core Runtime Terms

## Workflow Step

A workflow step is the allowed manufacturing stage in the product workflow.

Example:

```text
Ashwagandha Root workflow:
1. Extraction
2. Stripping
3. Purification
4. Decolorisation
```

Frontend meaning:

```text
This process is allowed next.
```

It does not mean work has already started.

---

## Lot Process Step

A `lot_process_step` is the backend runtime slot that says which process is currently allowed for a batch/material flow.

Frontend meaning:

```text
This batch/material is eligible for this process stage.
```

Important:

```text
lot_process_step = workflow eligibility slot
```

It is not the actual process job.

---

## Process Execution

A `process_execution` is the actual operator job/run/log/form.

Frontend meaning:

```text
This is the process job that the operator is running.
```

It is created only when the operator explicitly starts a process by selecting material and quantity.

Important:

```text
process_execution = actual manufacturing job
```

---

## Inventory Lot

An inventory lot is the actual material bucket.

Examples:

```text
RAW-ASH_ROOT-052026-001 → 500kg raw material
OUT-EXT-052026-001 → 250kg extraction output
```

Frontend meaning:

```text
This is selectable material.
```

Only inventory with `status = available` can be consumed.

---

## Output Inventory

Output inventory is the new material created when a process is completed.

Example:

```text
Extraction consumes raw Ashwagandha Root
  ↓
Extraction produces WIP Extraction Output
```

This output becomes input for the next eligible process after QA/QC if required.

---

# 3. Important Mental Model

The frontend must not treat an active workflow step as an already-started process.

Correct:

```text
active lot_process_step
= this process can be started
```

Incorrect:

```text
active lot_process_step
= process execution already exists
```

The operator must explicitly create a process job.

---

# 4. High-Level End-to-End Flow

```text
VIR
  ↓
GRN
  ↓
GRN QA/QC approval
  ↓
Raw inventory lot created
  ↓
Batch created
  ↓
Workflow slots created as lot_process_steps
  ↓
Process page shows eligible process stage
  ↓
Operator clicks Create New Process
  ↓
Operator selects inventory + quantity
  ↓
Backend creates process_execution and consumes inventory
  ↓
Operator fills process form/logs
  ↓
Operator completes process
  ↓
Backend creates output inventory lot
  ↓
QA/QC gate if required
  ↓
Output inventory becomes available
  ↓
Next process consumes output inventory
```

---

# 5. Process Page Pattern

Each manufacturing process should have a process-specific page.

Examples:

```text
/extraction
/stripping
/purification
/decolorisation
```

Each page should show:

- existing process logs/jobs for that process
- running/in-progress jobs
- awaiting QA/QC jobs
- completed jobs
- a `Create New {Process}` button

Example:

```text
Extraction Logs
[Create New Extraction]

- Extraction #1 | completed
- Extraction #2 | in progress
- Extraction #3 | awaiting QA/QC
```

This mirrors the current GRN mental model:

```text
GRN page
  ↓
Generate New GRN
  ↓
Popup shows eligible VIRs
  ↓
Fill basic GRN details
  ↓
Create GRN
```

Manufacturing should feel similar:

```text
Extraction page
  ↓
Create New Extraction
  ↓
Popup shows eligible inventory
  ↓
Fill basic start details
  ↓
Create process execution
  ↓
Open Extraction form
```

---

# 6. Create New Process Flow

## Example: Extraction

```text
Extraction page
  ↓
Click Create New Extraction
  ↓
Popup opens
  ↓
Shows eligible raw inventory lots
  ↓
Operator selects one or more lots
  ↓
Operator enters quantity to consume
  ↓
Operator fills basic start info
  ↓
Click Start Extraction
  ↓
POST /v2/process-executions
  ↓
Backend consumes inventory
  ↓
Extraction form/workspace opens
```

---

## Example: Stripping

```text
Stripping page
  ↓
Click Create New Stripping
  ↓
Popup opens
  ↓
Shows eligible Extraction output lots
  ↓
Operator selects one or more output lots
  ↓
Operator enters quantity to consume
  ↓
Click Start Stripping
  ↓
POST /v2/process-executions
  ↓
Backend consumes WIP inventory
  ↓
Stripping form/workspace opens
```

---

# 7. Create Process Popup

The popup should show eligible inventory in a clear selectable list.

## Required data display

For each available inventory lot:

- lot number
- product/material name
- available quantity
- unit of measure
- source type
- source GRN or source process execution if available
- current status
- current location if available

Example:

```text
RAW-ASH_ROOT-052026-001
Product: Ashwagandha Root
Available: 500kg
Source: GRN-052026-006
Status: Available
```

For downstream processes:

```text
OUT-EXT-052026-001
Product: Extraction Output
Available: 250kg
Source: Extraction Execution #21
Status: Available
```

---

## Quantity selection rule

The operator must explicitly enter the quantity to consume.

Do not auto-fill the full available quantity.

Example:

```text
Received: 500kg
Machine capacity: 250kg
Operator selects: 250kg
Remaining inventory: 250kg
```

This is one of the main reasons the inventory-driven runtime exists.

---

## Input payload rule

Frontend should send only:

```json
{
  "inventoryLotId": 17,
  "quantity": 250
}
```

Frontend should not send unit of measure for input consumption.

Backend derives and validates unit from the selected inventory lot.

---

# 8. Process Start API

## Endpoint

```http
POST /v2/process-executions
```

## Request example

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

## Backend side effects

Backend will:

- create process execution
- consume selected inventory
- create process_execution_inputs rows
- create consume inventory_transactions rows
- reduce inventory_lots.available_quantity
- keep remaining inventory available if quantity remains

---

# 9. Process Form / Workspace Flow

After process execution is created, open the process form/workspace.

The workspace is used for:

- operational details
- process logs
- repeatable cycle records
- equipment details
- operator notes
- save progress
- complete process

The workspace should not create a process execution automatically.

If a workspace is opened without an execution, show:

```text
No process job has been started for this step. Please start it from the process page.
```

---

# 10. Save Progress Flow

## Endpoint

```http
PATCH /v2/process-executions/:id/progress
```

## Purpose

Save Progress stores current form/log data.

It should not:

- consume inventory
- create output inventory
- complete the process
- advance workflow
- release QA/QC

## Request example

```json
{
  "formData": {
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25,
        "spraying_from": "10:00",
        "spraying_to": "10:30"
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

# 11. Complete Process Flow

When process work is done, the operator completes the process.

For completion, the operator should enter:

- output quantity
- output product/material if required
- output inventory type
- output location if known
- completion notes

The frontend can preview:

```text
loss = quantityIn - quantityOut
yield % = quantityOut / quantityIn * 100
```

But backend remains the source of truth.

Loss should be calculated automatically from input and output quantity where possible.

---

## Endpoint

```http
PATCH /v2/process-executions/:id/complete
```

## Request example

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

## Backend side effects

Backend will:

- mark process execution completed
- calculate/store output/loss/yield
- create output inventory lot
- create produce inventory transaction
- create process_execution_outputs row
- create lot_lineage rows
- move workflow step to awaiting QA/QC or completed depending on configuration

---

# 12. QA/QC Gated Output Flow

If the workflow step requires QA/QC:

```text
Process completed
  ↓
Output inventory status = under_qaqc
  ↓
Workflow step status = awaiting_qaqc
  ↓
QA/QC approval
  ↓
Output inventory status = available
  ↓
Next workflow step becomes active
```

Frontend display:

```text
Awaiting QA/QC Approval
```

Do not allow under-QA/QC inventory to be selected for downstream process creation.

Backend already enforces this by allowing only `status = available` inventory to be consumed.

---

# 13. Downstream Process Flow

After output inventory becomes available, it becomes input for the next process.

Example:

```text
Extraction output inventory
  ↓
Create New Stripping
  ↓
Select extraction output lot
  ↓
Start Stripping
  ↓
Fill Stripping form
  ↓
Complete Stripping
```

The process repeats for:

- Stripping
- Purification
- Decolorisation
- Packaging if added later

---

# 14. Page Responsibility Split

## Process List Page

Example:

```text
/extraction
```

Responsibilities:

- show extraction logs/jobs
- show statuses
- provide Create New Extraction button
- open create process popup
- navigate to existing process forms

---

## Create Process Popup

Responsibilities:

- show eligible inventory
- collect selected input quantities
- collect basic start information
- create process execution

---

## Process Workspace/Form Page

Example:

```text
/extraction/form/:executionId
```

or current route-compatible equivalent.

Responsibilities:

- show process execution details
- show consumed inputs
- render process-specific form
- save progress
- complete process
- show produced outputs
- show QA/QC status

---

# 15. Frontend Must Not Do These

Frontend must not:

- auto-start a process when opening a workspace
- auto-consume the full available lot quantity
- decide inventory eligibility
- decide QA/QC requirement
- mark output inventory available by itself
- optimistically reduce inventory
- optimistically advance workflow
- calculate final trusted yield/loss without backend confirmation
- create arbitrary process jobs without workflow/step context

---

# 16. Frontend Should Do These

Frontend should:

- show process-specific pages
- make Create New Process obvious
- show eligible inventory clearly
- require explicit quantity input
- show available quantity and unit
- show backend validation errors directly
- refresh after mutations
- keep operator flow simple
- hide technical database concepts where possible

Operator should think:

```text
I am starting Extraction using 250kg of this available material.
```

Not:

```text
I am editing lot_process_steps and process_execution_inputs.
```

---

# 17. Correct Example Flow

## Extraction

```text
1. User opens Extraction page.
2. User clicks Create New Extraction.
3. Popup shows available raw inventory lots.
4. User selects RAW-ASH_ROOT-052026-001.
5. User enters 250kg.
6. User clicks Start Extraction.
7. Backend creates process execution and consumes 250kg.
8. Frontend opens Extraction form.
9. User fills operation logs.
10. User clicks Save Progress as needed.
11. User enters output quantity, e.g. 240kg.
12. Frontend previews loss = 10kg.
13. User clicks Complete Process.
14. Backend creates OUT-EXT-052026-001.
15. If QA/QC required, output status is under_qaqc.
16. After QA/QC approval, output becomes available.
```

---

## Stripping

```text
1. User opens Stripping page.
2. User clicks Create New Stripping.
3. Popup shows available Extraction output lots.
4. User selects OUT-EXT-052026-001.
5. User enters quantity to consume.
6. User starts Stripping.
7. Backend consumes selected WIP inventory.
8. User fills Stripping form.
9. User completes Stripping.
10. Backend creates Stripping output inventory.
```

---

# 18. Current Implementation Correction

The previous frontend implementation incorrectly leaned toward:

```text
Process Board
  ↓
Open workflow slot
  ↓
Workspace creates/starts execution
```

The corrected implementation should be:

```text
Process-specific page
  ↓
Create New Process
  ↓
Select inventory + quantity
  ↓
Create execution
  ↓
Open workspace/form
```

This better matches operator expectations and the existing GRN popup pattern.

---

# 19. V1 Limitations

The following are intentionally not required in v1:

- arbitrary process scheduling without inventory
- reservation system
- progressive consumption
- multi-output process completion
- recursive lineage visualization
- advanced location/bin selector
- automatic machine capacity enforcement
- offline mode
- websocket sync

---

# 20. Short Locked Summary

```text
- Process pages should feel like GRN: list + Create New popup.
- Create New Process opens eligible inventory selection.
- Operator explicitly chooses quantity to consume.
- Frontend must not auto-consume full available quantity.
- Frontend must not auto-start execution from workspace load.
- Workspace/form is for an already-created process execution.
- Save Progress only saves form data.
- Complete Process creates output inventory through backend.
- Loss/yield can be previewed but backend owns final truth.
- QA/QC-gated output stays under_qaqc until approval.
- Downstream process pages consume available output inventory.
```
