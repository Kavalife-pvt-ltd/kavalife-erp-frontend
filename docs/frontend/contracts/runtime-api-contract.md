# Manufacturing Runtime API Contract

> Status: Active implemented contract  
> Scope: Frontend ↔ Backend integration for the inventory-driven manufacturing runtime  
> Purpose: Single source of truth for request payloads, response payloads, runtime statuses, and frontend behavior.

---

# 1. Runtime Overview

The manufacturing runtime is inventory-driven.

Current implemented flow:

1. GRN QA/QC approval creates a raw `inventory_lot` and a `receipt` transaction.
2. `POST /v2/process-executions` with `inputs` consumes selected inventory immediately.
3. `PATCH /v2/process-executions/:id/progress` saves progress only.
4. `PATCH /v2/process-executions/:id/complete` with `outputs` creates output inventory, a `produce` transaction, `process_execution_outputs`, and `lot_lineage`.
5. If the process step requires QA/QC, output inventory is created as `under_qaqc`.
6. QA/QC approval for `process_type = lot_process_step` releases that output inventory to `available`.

The backend remains the source of truth for inventory mutation, workflow progression, QA/QC gating, audit fields, and timestamps.

---

# 2. Create Process Execution

## POST /v2/process-executions

Creates a process execution. When `inputs` is supplied, inventory is consumed immediately in the same transaction.

Request:

```json
{
  "batchId": 33,
  "processCode": "EXT",
  "processDefinitionId": 1,
  "inputs": [
    {
      "inventoryLotId": 17,
      "quantity": 5
    }
  ],
  "formData": {
    "runId": "E2E-1779358227",
    "stage": "extraction"
  },
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Starting extraction"
}
```

Response:

```json
{
  "success": true,
  "message": "Process execution created successfully",
  "data": {
    "id": 21,
    "lotProcessStepId": 63,
    "quantityIn": 5,
    "status": "in_progress",
    "createdAt": "2026-05-21T10:00:00Z",
    "inputs": [
      {
        "id": 7,
        "inventoryLotId": 17,
        "lotNumber": "RAW-ASH_ROOT-052026-002",
        "productId": 1,
        "productName": "Ashwagandha Root",
        "batchId": 33,
        "quantityConsumed": 5,
        "balanceAfter": 7.5,
        "unitOfMeasure": "kg",
        "inventoryTransactionId": 17
      }
    ]
  }
}
```

Backend side effects:

- decreases `inventory_lots.available_quantity`
- changes input lot status to `consumed` when the new balance is zero
- creates `inventory_transactions.transaction_type = consume`
- creates `process_execution_inputs`
- sets `process_executions.quantity_in` to the sum of inputs

Legacy request still supported:

```json
{
  "lotProcessStepId": 63,
  "formData": {}
}
```

If `inputs` is omitted, the legacy frontend flow continues and inventory is not consumed by this call.

---

# 3. Save Progress

## PATCH /v2/process-executions/:id/progress

Saves in-progress process data only.

Request:

```json
{
  "quantityIn": 5,
  "formData": {
    "runId": "E2E-1779358227",
    "stage": "extraction",
    "temperature": "65C"
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
    "lotProcessStepId": 63,
    "status": "in_progress",
    "quantityIn": 5,
    "formData": {
      "runId": "E2E-1779358227",
      "stage": "extraction",
      "temperature": "65C"
    },
    "equipmentUsed": {
      "equipment_code": "EXT-01"
    },
    "operatorNotes": "Extraction in progress",
    "updatedAt": "2026-05-21T10:15:00Z"
  }
}
```

Frontend rule: this endpoint does not mutate inventory, create output lots, create lineage, or advance workflow status.

---

# 4. Complete Process Execution

## PATCH /v2/process-executions/:id/complete

Completes the process execution. When `outputs` is supplied, output inventory is produced.

Request:

```json
{
  "quantityOut": 4,
  "quantityLoss": 1,
  "lossReason": "Normal extraction loss",
  "formData": {
    "runId": "E2E-1779358227",
    "stage": "extraction",
    "completed": true
  },
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Completed extraction",
  "supervisorNotes": "Checked",
  "outputs": [
    {
      "productId": 1,
      "quantity": 4,
      "unitOfMeasure": "kg",
      "inventoryType": "wip",
      "currentLocation": "E2E WIP Storage",
      "notes": "Extraction output"
    }
  ]
}
```

Response when the step requires QA/QC:

```json
{
  "success": true,
  "message": "Process execution completed successfully",
  "data": {
    "id": 21,
    "quantityIn": 5,
    "quantityOut": 4,
    "quantityLoss": 1,
    "yieldPercent": 80,
    "status": "completed",
    "completedAt": "2026-05-21T10:30:00Z",
    "outputs": [
      {
        "inventoryLotId": 18,
        "lotNumber": "OUT-EXT-052026-002",
        "productId": 1,
        "productName": "Ashwagandha Root",
        "quantityProduced": 4,
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

- updates process execution completion fields
- creates one output `inventory_lot`
- creates one `inventory_transactions.transaction_type = produce`
- creates one `process_execution_outputs` row
- creates `lot_lineage` rows from consumed input lots to the output lot
- updates `lot_process_steps` using existing workflow rules

Quantity example:

```text
quantityIn  = 5
quantityOut = 4
quantityLoss = 1
yieldPercent = 80
```

Legacy completion without `outputs` remains supported and does not create output inventory artifacts.

---

# 5. QA/QC-Gated Output Availability

If the process step requires QA/QC:

- output lot is created with `status = under_qaqc`
- the lot must not be selectable as a downstream input
- `lot_process_step` moves through the existing QA/QC path

After QA/QC approval for `process_type = lot_process_step`:

- matching output lots where `source_type = process_execution` and `status = under_qaqc` become `available`
- consumed, scrapped, and rejected lots are not modified
- retrying approval is safe and should not duplicate inventory rows

Frontend rule: only `status = available` lots may be offered as process inputs.

---

# 6. Read APIs Used By Runtime UI

## GET /v2/inventory-lots

Use for inventory browser and input selection. For process input selection, filter or display only `status = available`.

## GET /v2/inventory-transactions

Use for ledger/audit views. Runtime creates `receipt`, `consume`, and `produce` rows.

## GET /v2/process-executions/:id/inputs

Returns lots consumed by one execution.

## GET /v2/process-executions/:id/outputs

Returns output lots produced by one execution.

## GET /v2/inventory-lots/:id/lineage

Returns non-recursive lineage:

- selected lot
- direct parent lots
- direct child lots

---

# 7. Inventory Status UI Rules

| Backend Status | Selectable As Input | Suggested UI Label |
| :--- | :--- | :--- |
| `available` | Yes | Available |
| `under_qaqc` | No | Under QA/QC |
| `consumed` | No | Consumed |
| `scrapped` | No | Scrapped |
| `rejected` | No | Rejected |

---

# 8. Frontend Must Not

- manually mutate inventory quantities
- optimistically mark output lots available
- manually progress `lot_process_steps`
- trust client-side `createdBy`, `createdAt`, `checkedBy`, `checkedAt`, or `approvedBy`
- make `under_qaqc`, `consumed`, `scrapped`, or `rejected` lots selectable as inputs
- retry process execution create blindly after a network error without checking server state

Audit fields and timestamps for VIR, GRN, and QA/QC flows are derived from backend auth context and backend time.

---

# 9. Known v1 Limitations

- one output item only
- no recursive lineage graph
- no reservation layer
- basic inventory eligibility only
- `process_executions` still requires the `lot_process_step_id` bridge internally
- legacy request shapes remain supported during frontend migration
