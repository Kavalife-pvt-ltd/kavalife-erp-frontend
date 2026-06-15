# Frontend Form Data Contract

> Status: Active frontend implementation contract  
> Scope: Manufacturing runtime dynamic process data  
> Audience: Developers and AI coding agents

---

## 1. Purpose

This document defines:

- what belongs inside `process_executions.form_data`
- what must stay outside `formData`
- how dynamic manufacturing forms should store/process runtime data

`formData` exists for process-specific operational data only.

---

## 2. Runtime mental model

```text
lot_process_step
  = workflow eligibility slot

process_execution
  = actual operator process job/form/run

inventory_lot
  = material truth
```

Important:

```text
lot_process_step = workflow position
process_execution = actual work performed
```

`formData` belongs to:

```text
process_execution
```

NOT workflow/runtime orchestration.

---

## 3. Core rule

Dynamic manufacturing process data belongs inside:

```text
process_executions.form_data
```

`formData` should contain only:

- process-specific values
- operator-entered runtime readings
- repeatable logs/tables
- process section data
- operational notes specific to process sections

It must not contain:

- workflow state
- backend-owned audit metadata
- relation identifiers
- inventory state
- runtime orchestration fields

---

## 4. Allowed formData content

Allowed examples:

```text
material_details
operation_logs
wash_logs
heating_logs
solvent_recovery
process_readings
oprp_sections
section-level remarks
```

Example:

```json
{
  "material_details": {
    "input_quantity": 250,
    "solvent": "Ethanol",
    "equipment_code": "EXT-01"
  },
  "operation_logs": [
    {
      "wash_no": 1,
      "solvent_qty": 25,
      "temperature": 65,
      "remarks": "First wash completed"
    }
  ],
  "solvent_recovery": {
    "recovered_solvent_qty": 12,
    "remarks": "Recovery stable"
  }
}
```

---

## 5. Forbidden inside formData

These must NOT exist inside `formData`:

```text
startedAt
completedAt
verifiedBy
verifiedAt
createdAt
updatedAt
createdBy
updatedBy
lastUpdatedBy
completedBy
quantityIn
quantityOut
quantityLoss
yieldPercent
operatorNotes
supervisorNotes
equipmentUsed
lossReason
durationMinutes
status
lotProcessStepId
processExecutionId
processDefinitionId
batchId
batchNumber
lotId
lotNumber
productId
productName
processCode
processName
qaqcRequired
```

These belong elsewhere because they are:

- backend-owned metadata
- top-level execution fields
- workflow/runtime fields
- relation identifiers
- inventory/runtime state

---

## 6. Correct vs incorrect payload

## Correct

```json
{
  "quantityIn": 250,
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Night shift started",
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

---

## Incorrect

```json
{
  "formData": {
    "startedAt": "2026-05-15T18:38:24+05:30",
    "completedAt": null,
    "verifiedBy": null,
    "quantityIn": 250,
    "operatorNotes": "Night shift started",
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ]
  }
}
```

Reason:

```text
Execution metadata polluted dynamic process JSON.
```

---

## 7. Top-level execution fields

These belong outside `formData`:

```text
quantityIn
quantityOut
quantityLoss
lossReason
yieldPercent
equipmentUsed
operatorNotes
supervisorNotes
```

Example progress payload:

```json
{
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Work continued by night shift",
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

Example completion payload:

```json
{
  "quantityOut": 230,
  "quantityLoss": 20,
  "lossReason": "Normal process loss",
  "equipmentUsed": {
    "equipment_code": "EXT-01"
  },
  "operatorNotes": "Process completed",
  "supervisorNotes": "Reviewed",
  "formData": {
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ],
    "solvent_recovery": {
      "recovered_solvent_qty": 12
    }
  }
}
```

---

## 8. Backend-owned metadata

These are display-only:

```text
created_at
updated_at
created_by
updated_by
started_at
completed_at
completed_by
verified_by
verified_at
checked_by
checked_at
approved_by
approved_at
duration_minutes
yield_percent, if backend-calculated
```

Frontend may display them in:

- workspace header
- process card
- activity timeline
- metadata panel

Frontend must not trust user-entered values for them.

---

## 9. Relation/runtime fields

These should not exist inside `formData`:

```text
lotProcessStepId
processExecutionId
processDefinitionId
workflowStepId
batchId
batchNumber
lotId
lotNumber
productId
productName
processCode
processName
status
qaqcRequired
```

These belong in:

- route params
- top-level DTOs
- backend responses
- display state
- runtime context

---

## 10. Repeatable tables/logs

Repeatable rows live inside `formData` arrays.

Example:

```json
{
  "operation_logs": [
    {
      "wash_no": 1,
      "solvent_qty": 25,
      "temperature": 65,
      "remarks": "First wash"
    },
    {
      "wash_no": 2,
      "solvent_qty": 20,
      "temperature": 63,
      "remarks": "Second wash"
    }
  ]
}
```

Current v1 behavior:

```text
Add Row → local state only
Delete Row → local state only
Save Progress → persist entire formData
Complete Process → persist final formData
```

No separate row-level backend APIs currently exist.

---

## 11. Dynamic schema mapping

Schema source:

```text
process_definitions.default_form_schema
```

Example schema:

```json
{
  "key": "operation_logs",
  "label": "Operation Logs",
  "type": "repeatable_table",
  "fields": [
    {
      "key": "wash_no",
      "type": "number"
    },
    {
      "key": "solvent_qty",
      "type": "number"
    }
  ]
}
```

Expected `formData`:

```json
{
  "operation_logs": [
    {
      "wash_no": 1,
      "solvent_qty": 25
    }
  ]
}
```

---

## 12. Supported field types

Current supported field types:

```text
text
number
textarea
select
date
time
datetime
checkbox
repeatable_table
```

Unknown field types should:

- show safe fallback UI
- not crash the entire form
- clearly indicate unsupported field type

---

## 13. Workspace form lifecycle

```text
Open workspace
  ↓
Fetch step details
  ↓
Fetch existing execution
  ↓
Fetch process definition/schema
  ↓
Initialize local form state from execution.formData
  ↓
User edits local form state
  ↓
Save Progress persists formData
  ↓
Complete Process persists final formData + completion fields
```

Local edits should not call backend immediately.

---

## 14. Save Progress contract

API:

```http
PATCH /v2/process-executions/:id/progress
```

Save Progress:

- allows partial data
- persists `formData`
- persists editable top-level execution fields
- does not complete process
- does not move workflow forward
- does not create output inventory
- does not trigger QA/QC

---

## 15. Complete Process contract

API:

```http
PATCH /v2/process-executions/:id/complete
```

Complete Process may require:

- quantityOut
- quantityLoss if applicable
- required schema fields
- minimum repeatable rows if schema requires them
- lossReason if loss exists

Backend remains final validator.

Backend creates:

- output inventory
- produce transaction
- lineage
- downstream workflow progression

---

## 16. Naming conventions

Inside `formData`, prefer:

```text
snake_case
```

Good:

```json
{
  "operation_logs": [],
  "solvent_recovery": {},
  "material_details": {}
}
```

Avoid:

```text
random camelCase + snake_case mixing
```

Frontend TypeScript DTOs may still use camelCase externally.

---

## 17. Read-only states

Dynamic form becomes read-only when:

- process execution completed
- lot_process_step awaiting_qaqc
- lot_process_step completed
- workflow locked
- user lacks permission

Read-only mode means:

- fields disabled
- Add/Delete Row disabled
- Save Progress disabled
- Complete Process disabled

Inputs/outputs/summary remain visible.

---

## 18. Example process formData

## 18.1 Extraction

```json
{
  "material_details": {
    "input_quantity": 250,
    "solvent": "Ethanol",
    "equipment_code": "EXT-01"
  },
  "operation_logs": [
    {
      "wash_no": 1,
      "spraying_start_time": "10:30",
      "spraying_end_time": "11:15",
      "solvent_qty": 25,
      "miscella_qty": 18,
      "remarks": "Wash completed"
    }
  ],
  "solvent_recovery": {
    "recovered_solvent_qty": 12,
    "remarks": "Recovery stable"
  }
}
```

---

## 18.2 Stripping

```json
{
  "material_details": {
    "input_quantity": 230,
    "equipment_code": "STR-01"
  },
  "stripping_operations": [
    {
      "date": "2026-05-15",
      "starting_at": "15:00",
      "apply_vacuum": "15:20",
      "direct_steam_start": "15:30",
      "direct_steam_stop": "16:10",
      "remarks": "Normal stripping cycle"
    }
  ],
  "oprp_2": {
    "temperature": 80,
    "vacuum": 650,
    "product_obtained": 210,
    "remarks": "Within expected range"
  }
}
```

---

## 18.3 Purification

```json
{
  "material_details": {
    "input_weight": 210,
    "solvent": "Ethanol",
    "equipment_code": "PUR-01"
  },
  "operation_logs": [
    {
      "wash_no": 1,
      "start_time": "10:00",
      "end_time": "10:45",
      "collection_time": "11:00",
      "remarks": "First purification wash"
    }
  ]
}
```

---

## 19. Adapter responsibilities

Preferred flow:

```text
backend DTO
  ↓
processAdapters.ts
  ↓
frontend ProcessExecution type
  ↓
DynamicProcessForm
```

Adapter responsibilities:

- normalize backend data
- safely map snake_case/camelCase where required
- keep formData shape intact
- strip forbidden metadata before save
- map top-level execution fields correctly
- safely handle null/undefined values

---

## 20. Sanitize before save

Before Save Progress or Complete Process, frontend should sanitize `formData`.

Remove forbidden keys if they somehow entered local state:

```text
startedAt
completedAt
verifiedBy
verifiedAt
quantityIn
quantityOut
quantityLoss
yieldPercent
operatorNotes
supervisorNotes
status
lotProcessStepId
processExecutionId
```

This is a safety net.

Correct state design should prevent this already.

---

## 21. Anti-patterns

Do not do these:

```text
Store quantityIn inside formData
Store quantityOut inside formData
Store operatorNotes inside formData
Store workflow status inside formData
Store audit metadata inside formData
Create separate frontend log entities
Save every row immediately
Mix camelCase and snake_case randomly
Let unknown schema field types crash the form
Treat backend timestamps as editable inputs
```

---

## 22. Implementation checklist

Before modifying a dynamic process form, confirm:

```text
1. Which fields are top-level execution fields?
2. Which fields belong inside formData?
3. Are any fields backend-owned/read-only?
4. Are repeatable rows stored inside formData arrays?
5. Does Save Progress send only allowed payload fields?
6. Does Complete Process send only allowed payload fields?
7. Is formData sanitized before save?
8. Does read-only state disable editing?
9. Are unknown schema field types handled safely?
10. Are field names consistent?
```

---

## 23. Short locked summary

```text
- process_executions.form_data stores dynamic process-specific data only.
- Repeatable logs live inside formData arrays.
- Top-level execution fields stay outside formData.
- Backend-owned metadata is display-only.
- Save Progress persists runtime form data only.
- Complete Process persists final formData + completion fields.
- Add/Delete Row are local state actions until save.
- Frontend sanitizes formData before API calls.
- Frontend does not create separate row entities in v1.
```
