# Manufacturing Runtime API Contract

> Status: Active implemented contract  
> Scope: Frontend ↔ Backend runtime integration  
> Audience: Developers and AI coding agents

---

## 1. Purpose

This document defines the active frontend/backend contract for the inventory-driven manufacturing runtime.

The runtime flow is:

```text
Create New Process
  ↓
Select inventory + quantity
  ↓
Create process execution
  ↓
Consume inventory
  ↓
Open workspace/form
  ↓
Save progress
  ↓
Complete process
  ↓
Create output inventory
  ↓
QA/QC gate if required
  ↓
Output becomes available for downstream process
```

Backend remains the source of truth for:

- inventory mutation
- workflow progression
- QA/QC gating
- lineage
- audit metadata
- timestamps

---

## 2. Runtime mental model

```text
lot_process_step
  = workflow eligibility slot
  = this process is allowed to start

process_execution
  = actual operator process job

inventory_lot
  = material truth

process_execution_inputs
  = consumed inventory

process_execution_outputs
  = produced inventory
```

Important:

```text
active lot_process_step ≠ execution already exists
```

Frontend must not auto-create execution during workspace load.

---

## 3. Runtime lifecycle

## 3.1 Inward flow

```text
VIR
  ↓
GRN
  ↓
GRN QA/QC approved
  ↓
Raw inventory created
  ↓
Batch created
```

GRN QA/QC approval creates:

- raw `inventory_lot`
- `receipt` inventory transaction

---

## 3.2 Process runtime flow

```text
Operator opens process page
  ↓
Create New Process
  ↓
Select eligible inventory + quantity
  ↓
POST /v2/process-executions
  ↓
Backend consumes inventory
  ↓
Workspace/form opens
  ↓
PATCH progress API while working
  ↓
PATCH complete API when done
  ↓
Backend creates output inventory
  ↓
Output inventory becomes next process input
```

---

## 4. Create process execution

## POST /v2/process-executions

Purpose:

- create process execution
- consume inventory
- create consume transactions
- create process_execution_inputs

Request:

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

Important frontend rules:

- operator must explicitly enter quantity
- frontend must not auto-fill full available quantity
- frontend must not send unit for input consumption
- backend derives unit from inventory lot

Correct input payload:

```json
{
  "inventoryLotId": 17,
  "quantity": 250
}
```

Response:

```json
{
  "success": true,
  "message": "Process execution created successfully",
  "data": {
    "id": 21,
    "lotProcessStepId": 79,
    "quantityIn": 250,
    "status": "in_progress",
    "createdAt": "2026-05-21T10:00:00Z",
    "inputs": [
      {
        "inventoryLotId": 17,
        "lotNumber": "RAW-ASH_ROOT-052026-002",
        "productId": 1,
        "productName": "Ashwagandha Root",
        "quantityConsumed": 250,
        "balanceAfter": 250,
        "unitOfMeasure": "kg",
        "inventoryTransactionId": 17
      }
    ]
  }
}
```

Backend side effects:

- reduces `inventory_lots.available_quantity`
- marks lot `consumed` if balance becomes zero
- creates `inventory_transactions.transaction_type = consume`
- creates `process_execution_inputs`
- updates `process_executions.quantity_in`

---

## 5. Save progress

## PATCH /v2/process-executions/:id/progress

Purpose:

```text
Save runtime form/process data only.
```

Request:

```json
{
  "formData": {
    "material_details": {},
    "operation_logs": [],
    "solvent_recovery": {}
  },
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Extraction in progress"
}
```

Response:

```json
{
  "success": true,
  "message": "Process execution progress updated successfully",
  "data": {
    "id": 21,
    "status": "in_progress",
    "updatedAt": "2026-05-21T10:15:00Z"
  }
}
```

This endpoint must not:

- consume inventory
- create outputs
- advance workflow
- complete process
- create lineage

---

## 6. Complete process execution

## PATCH /v2/process-executions/:id/complete

Purpose:

- complete process execution
- create output inventory
- create produce transaction
- create lineage
- move workflow forward

Request:

```json
{
  "quantityOut": 240,
  "quantityLoss": 10,
  "lossReason": "Normal extraction loss",
  "formData": {
    "material_details": {},
    "operation_logs": [],
    "solvent_recovery": {}
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

Response:

```json
{
  "success": true,
  "message": "Process execution completed successfully",
  "data": {
    "id": 21,
    "quantityIn": 250,
    "quantityOut": 240,
    "quantityLoss": 10,
    "yieldPercent": 96,
    "status": "completed",
    "completedAt": "2026-05-21T10:30:00Z",
    "outputs": [
      {
        "inventoryLotId": 18,
        "lotNumber": "OUT-EXT-052026-002",
        "productId": 1,
        "productName": "Ashwagandha Root",
        "quantityProduced": 240,
        "unitOfMeasure": "kg",
        "inventoryType": "wip",
        "status": "under_qaqc",
        "inventoryTransactionId": 18
      }
    ],
    "lineageCount": 1
  }
}
```

Backend side effects:

- completes process execution
- creates output `inventory_lot`
- creates `produce` transaction
- creates `process_execution_outputs`
- creates `lot_lineage`
- updates workflow step state

---

## 7. QA/QC-gated output behavior

If process requires QA/QC:

```text
process completed
  ↓
output inventory status = under_qaqc
  ↓
workflow step = awaiting_qaqc
  ↓
QA/QC approval
  ↓
output inventory status = available
  ↓
next process step activates
```

Frontend rules:

- `under_qaqc` inventory must not be selectable
- only `status = available` inventory may be consumed
- frontend must not manually release inventory

Backend enforces these rules.

---

## 8. Runtime read APIs

## 8.1 Inventory lots

```http
GET /v2/inventory-lots
```

Used for:

- inventory browser
- process input selection
- inventory visibility

For process input selection:

```http
GET /v2/inventory-lots?status=available
```

---

## 8.2 Inventory transactions

```http
GET /v2/inventory-transactions
```

Used for:

- ledger view
- audit/history
- inventory mutation history

Runtime creates:

```text
receipt
consume
produce
```

transactions.

---

## 8.3 Execution inputs

```http
GET /v2/process-executions/:id/inputs
```

Used to display:

- consumed lots
- quantities consumed
- source inventory

---

## 8.4 Execution outputs

```http
GET /v2/process-executions/:id/outputs
```

Used to display:

- produced lots
- quantities produced
- QA/QC state

---

## 8.5 Lineage

```http
GET /v2/inventory-lots/:id/lineage
```

Returns non-recursive lineage:

- selected lot
- direct parent lots
- direct child lots

---

## 8.6 Process board

```http
GET /v2/process-steps/board
```

Used for:

- process pages
- process runtime cards
- filtering/search
- workflow visibility

Example filters:

```text
processCode
status
batchNumber
lotNumber
productId
search
```

---

## 9. Inventory status rules

| Backend Status | Selectable As Input | Suggested UI Label |
| :------------- | :------------------ | :----------------- |
| `available`    | Yes                 | Available          |
| `under_qaqc`   | No                  | Under QA/QC        |
| `consumed`     | No                  | Consumed           |
| `scrapped`     | No                  | Scrapped           |
| `rejected`     | No                  | Rejected           |

Frontend must not allow non-available lots to be selected.

---

## 10. Runtime UI rules

Frontend must:

- explicitly ask operator for quantity
- show available quantity clearly
- refresh backend truth after mutations
- display backend manufacturing errors clearly
- treat workspace as existing execution only

Frontend must not:

- auto-start execution on workspace load
- auto-consume full inventory quantity
- manually mutate inventory
- manually advance workflow
- optimistically release QA/QC inventory
- trust frontend audit fields

---

## 11. Audit integrity rules

Audit metadata is backend-owned.

Frontend must not trust or persist:

```text
createdBy
createdAt
updatedBy
updatedAt
checkedBy
checkedAt
approvedBy
approvedAt
verifiedBy
verifiedAt
```

Backend derives:

- authenticated user
- timestamps
- workflow actors

from auth context and backend time.

---

## 12. Current v1 limitations

Current implemented limitations:

- one output item only
- no recursive lineage graph
- no reservation layer
- no progressive consumption
- no multi-output completion
- no advanced inventory allocation
- no create process definition API yet
- `process_execution` still internally bridges through `lot_process_step_id`
- legacy request shapes still temporarily supported

---

## 13. AI implementation rules

Before implementing runtime UI, read:

```text
docs/frontend/process-runtime-flow.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/pages/process-board-page.md
docs/frontend/pages/process-workspace-page.md
docs/frontend/hooks/use-process-execution.md
```

Rules:

- keep docs concise and AI-readable
- keep backend as runtime truth
- do not silently change runtime flow
- do not duplicate backend manufacturing logic
- report API/contract mismatches clearly

---

## 14. Short locked summary

```text
- Process execution creation consumes inventory immediately.
- Workspace operates existing executions only.
- Save Progress only updates runtime form data.
- Complete Process creates output inventory.
- QA/QC-gated output stays under_qaqc until approval.
- Only available inventory can be consumed.
- Backend owns workflow, inventory, lineage, QA/QC, and audit truth.
```
