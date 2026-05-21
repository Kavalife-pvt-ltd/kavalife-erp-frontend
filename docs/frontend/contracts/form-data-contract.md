# Frontend Form Data Contract

> Status: Active implementation contract  
> Scope: Manufacturing runtime form data first  
> Purpose: Define what belongs inside `process_executions.form_data`, what stays outside it, and how dynamic process forms should read/write data.

---

## 1. Core rule

Dynamic manufacturing form data belongs inside:

```text
process_executions.form_data

formData stores only process-specific fields and repeatable logs.

It must not store:

* workflow state
* trusted user/date metadata
* relation IDs
* top-level execution fields

⸻

2. Runtime model

lot_process_steps
  = workflow/runtime state tracker
process_executions
  = actual execution/log/form record

Golden rule:

lot_process_step = where material is in the workflow
process_execution = what happened during that process

⸻

3. What belongs inside formData

Allowed:

material_details
operation_logs
wash logs
heating logs
solvent recovery logs
process-specific remarks
process-specific readings
section-level values

Example:

{
  "material_details": {
    "input_weight": 250.5,
    "solvent": "Ethanol",
    "equipment_code": "EXT-01"
  },
  "operation_logs": [
    {
      "wash_no": 1,
      "start_time": "10:30",
      "end_time": "11:15",
      "solvent_qty": 25,
      "temperature": 65,
      "remarks": "First wash completed"
    }
  ],
  "solvent_recovery": {
    "recovered_qty": 12,
    "recovery_temperature": 78,
    "remarks": "Recovery stable"
  }
}

⸻

4. What must NOT go inside formData

Do not put these inside formData:

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
lotId

These are either:

* backend-owned metadata
* top-level execution fields
* relation identifiers
* workflow state fields

⸻

5. Correct vs incorrect payload

Correct:

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

Incorrect:

{
  "formData": {
    "startedAt": "2026-05-15T18:38:24+05:30",
    "completedAt": null,
    "verifiedBy": null,
    "quantityIn": 250.5,
    "operatorNotes": "Shift note here",
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ]
  }
}

The incorrect version pollutes dynamic JSON with execution metadata.

⸻

6. Top-level execution fields

These belong outside formData:

quantityIn
quantityOut
quantityLoss
lossReason
yieldPercent
equipmentUsed
operatorNotes
supervisorNotes

Progress payload:

{
  "quantityIn": 250.5,
  "equipmentUsed": "EXT-01",
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

Completion payload:

{
  "quantityOut": 230,
  "quantityLoss": 20.5,
  "lossReason": "Normal process loss",
  "equipmentUsed": "EXT-01",
  "operatorNotes": "Completed by operator",
  "supervisorNotes": "Output reviewed",
  "formData": {
    "operation_logs": [
      {
        "wash_no": 1,
        "solvent_qty": 25
      }
    ],
    "solvent_recovery": {
      "recovered_qty": 12
    }
  }
}

⸻

7. Backend-owned metadata

These are display-only:

created_at
updated_at
created_by
updated_by
last_updated_by
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
yield_percent, if calculated by backend

Frontend may show them in:

* process card
* workspace header
* activity timeline
* read-only metadata panel

Frontend must not ask users to type these as trusted values.

⸻

8. Relation and workflow fields

These should not be inside formData:

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

They belong in:

* route params
* API path/query params
* top-level DTOs
* read-only display props

⸻

9. Repeatable logs

Repeatable rows live inside formData arrays.

Example:

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

Current rule:

Add Row → local form state only
Delete Row → local form state only
Save Progress / Complete Process → persist entire formData

Do not create separate frontend log entities unless backend explicitly adds row-level APIs later.

⸻

10. Dynamic schema mapping

Schema may come from:

process_definitions.default_form_schema

Example schema:

{
  "key": "operation_logs",
  "label": "Operation Logs",
  "type": "repeatable_table",
  "fields": [
    {
      "key": "wash_no",
      "label": "Wash No",
      "type": "number"
    },
    {
      "key": "solvent_qty",
      "label": "Solvent Quantity",
      "type": "number",
      "unit": "L"
    }
  ]
}

Expected formData:

{
  "operation_logs": [
    {
      "wash_no": 1,
      "solvent_qty": 25
    }
  ]
}

⸻

11. Supported field types

Initial supported field types:

text
number
textarea
select
date
time
datetime
checkbox
repeatable_table

Unknown field types should:

* show safe fallback UI
* not crash the whole form
* be clearly marked for developers

⸻

12. Form state lifecycle

Open workspace
  ↓
Fetch step details
  ↓
Fetch existing process execution
  ↓
Fetch process definition/schema
  ↓
Initialize form state from process_execution.form_data
  ↓
User edits local form state
  ↓
Save Progress persists formData
  ↓
Complete Process persists final formData + completion fields

Local edits should not call backend immediately.

⸻

13. Save Progress

Save Progress calls:

PATCH /v2/process-executions/:id/progress

Save Progress:

* allows partial data
* saves formData and editable top-level fields
* does not complete the process
* does not move workflow forward
* does not call QA/QC APIs
* does not activate next step

⸻

14. Complete Process

Complete Process calls:

PATCH /v2/process-executions/:id/complete

Complete Process may require:

* quantityOut
* quantityLoss, if applicable
* required schema fields
* minimum repeatable rows, if schema requires them
* lossReason when loss is non-zero or abnormal

Backend remains final validator.

⸻

15. Naming conventions

Prefer snake_case keys inside formData.

Good:

{
  "operation_logs": [],
  "solvent_recovery": {},
  "material_details": {}
}

Avoid mixing camelCase and snake_case inside the same formData object.

Frontend TypeScript may use camelCase for DTOs, but adapters should map clearly.

⸻

16. Versioning direction

Future field:

form_data_version

Purpose:

* support schema changes over time
* preserve old execution records
* allow process form evolution without breaking history

Current frontend should not overbuild versioning yet.

⸻

17. Read-only / locked states

Dynamic form should become read-only when:

* process execution is completed
* lot process step is awaiting QA/QC
* lot process step is completed
* lot process step is failed, unless rework editing is allowed
* user lacks permission

In read-only state:

* fields are disabled or rendered as text
* Add Row/Delete Row are disabled
* Save Progress is disabled
* Complete Process is disabled

⸻

18. Process examples

18.1 Extraction

{
  "material_details": {
    "charging_quantity": 250.5,
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
    "recovery_start_time": "12:00",
    "recovery_end_time": "13:00",
    "recovered_solvent_qty": 12,
    "remarks": "Recovery stable"
  }
}

18.2 Stripping

{
  "material_details": {
    "input_quantity": 230,
    "equipment_code": "STR-01"
  },
  "operation_logs": [
    {
      "date": "2026-05-15",
      "start_time": "15:00",
      "vacuum_time": "15:20",
      "direct_steam_start": "15:30",
      "direct_steam_end": "16:10",
      "remarks": "Normal stripping cycle"
    }
  ],
  "opr_details": {
    "temperature": 80,
    "vacuum": 650,
    "product_obtained": 210,
    "remarks": "Within expected range"
  }
}

18.3 Purification

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

⸻

19. Adapter rules

Preferred flow:

backend DTO
  ↓
processAdapters.ts
  ↓
frontend ProcessExecution type
  ↓
DynamicProcessForm

Adapter responsibilities:

* map backend snake_case to frontend camelCase where needed
* keep formData shape intact unless cleanup is required
* strip forbidden metadata from formData before save
* map top-level fields to API payload correctly
* normalize null/undefined values safely

⸻

20. Sanitize before save

Before Save Progress or Complete Process, frontend should sanitize formData.

Remove forbidden keys if they somehow entered local state:

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

This is a safety net, not a substitute for correct state design.

⸻

21. Anti-patterns

Do not do these:

Store startedAt inside formData
Store quantityIn inside formData
Store operatorNotes inside formData
Store status inside formData
Create separate frontend log entities for operation rows
Save every row immediately unless backend explicitly supports row APIs
Mix camelCase and snake_case randomly inside formData
Let unknown schema field types crash the form
Treat backend-owned timestamps as editable text boxes

⸻

22. Implementation checklist

Before modifying a dynamic process form, confirm:

1. Which fields are top-level execution fields?
2. Which fields belong inside formData?
3. Are any fields backend-owned/read-only?
4. Are repeatable rows stored as arrays inside formData?
5. Does Save Progress send only allowed payload fields?
6. Does Complete Process send final allowed payload fields?
7. Is formData sanitized before save/complete?
8. Does read-only state disable editing correctly?
9. Are unknown schema fields handled safely?
10. Are field names consistent?

⸻

23. Short locked summary

- process_executions.form_data stores dynamic process-specific data.
- Repeatable logs live inside formData arrays.
- Top-level execution fields stay outside formData.
- Backend-owned metadata is display-only.
- Save Progress PATCHes progress with formData and editable top-level fields.
- Complete Process PATCHes complete with final formData and completion fields.
- Add/Delete row are local state actions until save/complete.
- Frontend sanitizes formData before API calls.
- Frontend does not create separate log entities unless backend explicitly supports them.
```
