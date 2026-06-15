# Kavalife ERP — Glossary and Schema v1

> Status: Active implementation reference — updated after successful E2E backend flow testing  
> Purpose: Shared vocabulary, architecture decisions, polished schema direction, and implementation reference for the Kavalife ERP system.

---

## Current implementation checkpoint — May 2026

The backend now has a working straight-line manufacturing flow from inward material receipt to runtime process execution and QA/QC-gated step progression.

> Important architecture note (May 2026 redesign direction)
>
> The currently implemented runtime engine is a successful straight-line proof-of-concept, but the long-term manufacturing model is evolving toward an inventory-driven material transformation engine.
>
> The future runtime direction is:
>
> ```text
> Inventory lots are consumed into processes.
> Processes produce new output lots.
> Output lots return to inventory.
> Future processes consume eligible inventory lots.
> ```
>
> This replaces the earlier assumption that lots automatically progress linearly from one process step to the next.

Tested happy-path flow:

```text
VIR created
  ↓
VIR verified
  ↓
GRN created
  ↓
GRN QA/QC created
  ↓
GRN QA/QC verified as approved
  ↓
Batch created from approved GRN
  ↓
Initial Lot created
  ↓
Workflow copied into Lot Process Steps
  ↓
First Lot Process Step becomes active
  ↓
Process Execution created for active step
  ↓
Process Execution completed
  ↓
If QA/QC is required, step moves to awaiting_qaqc
  ↓
Step QA/QC created
  ↓
Step QA/QC verified as approved
  ↓
Step becomes completed and next step becomes active
```

Completed E2E runtime chain:

```text
VIR → GRN → GRN QA/QC → Batch → Lot → Lot Process Steps → Process Execution → Step QA/QC → next step activation
```

Runtime IDs from May 2026 E2E:

```text
VIR: 25 / VIR-052026-001
GRN: 21 / GRN-052026-004
GRN QA/QC: 30 / processType=grn, processRef=GRN-052026-004
Batch: 14 / BATCH-1778584336
Initial Lot: 14 / LOT-1
Extraction Step: 41 / Execution 4 / Step QA/QC 32
Stripping Step: 42 / Execution 5 / Step QA/QC 33
Purification Step: 43 / Execution 6 / Step QA/QC 34
Decolorisation Step: 44 / Execution 7
```

Confirmed working modules/APIs:

- VIR create, verify, get one, get all
- GRN create and list/view
- generic QA/QC create, view, verify
- GRN QA/QC approval updates `grns.qaqc_status`
- batch create from QA/QC-approved GRN
- automatic workflow selection from product via GRN → VIR → product
- initial lot creation
- runtime lot process step creation from workflow steps
- active process step listing
- process step start
- process step complete
- process execution create, get by id, get by step, and complete
- process execution `form_data` persistence with repeatable `operation_logs`
- QA/QC-required step pause using `awaiting_qaqc`
- step QA/QC approval moves the process forward
- batch history view returning nested batch → lots → steps timeline

Important implementation notes:

- backend must own timestamps and logged-in user attribution
- frontend should not send trusted `created_by`, `checked_by`, `approved_by`, `created_at`, `checked_at`, or `approved_at` long-term
- duplicate batch creation is blocked, but currently returns `INTERNAL_ERROR` / HTTP 500 and should become `409 Conflict`
- current QA/QC implementation uses `qaqc_entries` generically with `process_type` + `process_ref`
- `process_type = grn` uses `process_ref = grn_number`
- `process_type = lot_process_step` uses `process_ref = lot_process_steps.id` as a string
- future stable model may evolve toward `qaqc_executions`, but `qaqc_entries` is the current working bridge

---

## 1. Purpose of this document

This document exists so that frontend, backend, database, and product discussions all use the same language.

It defines:

- core business terms
- locked architecture decisions
- final schema direction for the redesign
- table-by-table intent
- what to keep, polish, redesign, add, and decommission
- implementation order
- current working backend flow
- next implementation priorities

This should be treated as the source of truth for schema planning until a newer version replaces it.

---

## 2. Core terminology

## 2.1 Raw Material

Incoming physical material received from a vendor/supplier.

Examples:

- Ashwagandha Root
- Tulsi Leaves
- Neem Bark

Raw material enters the system through:

```text
VIR → GRN → GRN QA/QC → Batch
```

---

## 2.2 Finished Product

The final sellable or storable output after all required manufacturing processes and QA/QC are completed.

Examples:

- Ashwagandha Extract
- Tulsi Extract Oil

Finished product enters finished goods inventory only after final approval/output.

---

## 2.3 Product

Broad master entity representing a material/product in the system.

In v1, one master table represents:

- raw material
- intermediate material
- finished product

Use a `material_type` field to distinguish them.

Recommended values:

- `raw_material`
- `intermediate`
- `finished_product`

---

## 2.4 Vendor / Supplier

External party from whom raw materials are purchased.

Used in:

- VIR
- GRN
- procurement history

---

## 2.5 Customer / Client

External party to whom finished goods are sold.

Used in:

- sales orders
- stock allocation
- dispatch/fulfilment

---

## 2.6 Process

A top-level manufacturing stage or pod in the factory.

Examples:

- Extraction
- Stripping
- Purification
- Decolorisation
- Packaging

Important rules:

- processes are fixed/static in v1
- admin does not create processes in v1
- admin only selects which processes belong to a workflow

---

## 2.7 Process Master

Static list of all available top-level manufacturing processes in the plant.

This is developer-defined and seeded into the system.

Examples:

- `EXT` → Extraction
- `STR` → Stripping
- `PUR` → Purification
- `DEC` → Decolorisation
- `PKG` → Packaging

The Process Master maps to:

- frontend modules
- workflow builder
- batch execution logic

---

## 2.8 Workflow

Ordered sequence of processes required to produce a specific product/output.

Example:

```text
Extraction → Stripping → Purification → Packaging
```

Important rules:

- workflow is dynamic
- workflow is configured by admin
- workflow belongs to a product/material
- only one active workflow per product in v1
- workflow defines allowed/recommended process progression
- workflow does not automatically move inventory through processes

---

## 2.9 Workflow Step

One ordered process inside a workflow.

Example:

- step 1 = Extraction
- step 2 = Stripping
- step 3 = Purification

This is a definition/template row, not runtime execution.

---

## 2.10 Process Pod

Actual module/form/operational unit for a process.

Examples:

- Extraction module
- Purification module

A pod contains:

- process-specific fields
- QA/QC
- reruns/rework
- operator data

---

## 2.11 QA/QC

Quality check performed before batch creation and/or inside process steps.

Current working rule:

- GRN has QA/QC gate before batch creation
- each workflow step can optionally require QA/QC
- if a lot process step requires QA/QC, completion moves it to `awaiting_qaqc`
- QA/QC approval moves the step forward
- QA/QC rejection or retest blocks normal progression
- final usable output only counts after passing required checks

---

## 2.12 VIR

Vehicle Inspection Report.

Represents the incoming delivery/vehicle inspection event.

Used to capture:

- delivery arrival
- packaging/vehicle condition
- vendor linkage
- product/material linkage
- remarks
- inspection details

---

## 2.13 GRN

Goods Received Note.

Represents the actual receipt of material after inspection.

Used to capture:

- which VIR was received
- quantity
- invoice details
- packaging status
- received material details
- GRN-level QA/QC status

GRN is the bridge between inward operations and manufacturing.

Current v1 rule:

- one VIR creates one GRN
- GRN represents the full received quantity
- GRN must pass QA/QC before batch creation

---

## 2.14 Batch

Manufacturing umbrella/job/order created for a production objective.

Example:

- Batch `B001`

A batch represents:

- manufacturing grouping
- production intent
- operational tracking scope
- costing/reporting scope

A batch does not directly represent one physical quantity bucket.

Lots/material may:

- split
- merge
- blend
- partially move
  inside the same batch.

A batch may contain:

- many lots
- many process executions
- many inventory transformations

v1 rules:

- one GRN creates one batch
- batch starts with initial raw inventory derived from approved GRN quantity
- future processes consume inventory from eligible lots
- lineage must remain traceable back to source GRN/VIR/vendor

---

## 2.15 Lot

Traceable material unit used inside manufacturing.

A lot represents:

- physical material
- processable inventory
- traceable quantity movement
- audit lineage node

Examples:

- raw turmeric lot
- extracted WIP lot
- filtered output lot
- blended intermediate lot

Important rules:

- lots are immutable traceability identities
- every process output creates a new output lot
- lots may consume from multiple source lots
- remaining quantity stays in inventory unless consumed
- lots may later support split, merge, blend, transfer, hold, rework, and scrap flows

Important distinction:

- batch = manufacturing umbrella/job
- lot = physical traceable material node

## 2.15.1 Input Lot

Lot/material quantity consumed into a process execution.

Examples:

- 250kg from raw turmeric lot A
- 150kg from raw turmeric lot B

Input lots are selected from eligible available inventory.

---

## 2.15.2 Output Lot

New lot created as the output of a process execution.

Examples:

- extraction output lot
- filtration output lot
- final finished lot

Important rule:

- every completed manufacturing process creates one or more new output lots
- output lots become inventory for future processes

---

## 2.16 Lot Process Step

Workflow/runtime eligibility tracker for a lot.

This represents:

- which processes are allowed for a lot
- which process stage a lot currently belongs to
- whether QA/QC gates exist before next usage
- whether the lot is eligible for downstream consumption

Important distinction:

- workflow step = definition/template
- lot process step = runtime eligibility/state tracking
- process execution = actual work/log/form record

Original implementation model:

- batch creation copied workflow directly into runtime lot process steps
- completing one step automatically activated the next step

Revised long-term architecture direction:

- processes do not automatically push material forward
- completed process outputs become inventory
- future processes manually consume eligible inventory lots
- workflow controls allowed progression, not automatic runtime movement

Status examples:

- pending
- active
- awaiting_qaqc
- completed
- failed
- rework

---

## 2.17 Process Execution

Detailed execution record for a process pod/form.

This is where process-specific form data now lives.

Examples:

- temperature
- pressure
- equipment used
- solvent used
- start/end timings
- quantity in/out/loss
- operator/supervisor notes

Important rule:

- process form data should be stored flexibly using `form_data JSONB`
- repeatable process cycles are stored inside `form_data.operation_logs`
- do not hardcode separate Go structs for every process in v1

Current status:

- implemented
- E2E tested in May 2026 for Extraction, Stripping, Purification, and Decolorisation
- one `process_execution` record was created per runtime `lot_process_step`
- repeatable operation logs were persisted inside `form_data`

---

## 2.18 Raw Inventory

Available incoming raw material inventory derived from approved GRNs.

Examples:

- 1200kg Ashwagandha Root
- 500kg Turmeric Root

Raw inventory is selectable only for eligible starting processes defined by workflow.

---

## 2.19 Work In Progress (WIP)

Intermediate inventory produced during manufacturing.

Examples:

- extraction output
- filtered material
- partially processed intermediate material

WIP inventory:

- is not yet sellable
- may be consumed by future manufacturing processes
- remains traceable to source lots/GRNs/vendors

---

## 2.20 Finished Goods Inventory

Final approved output that is packed/stored and ready to sell or dispatch.

---

## 2.21 Inventory Ledger

Transaction-based source of truth for inventory movement.

Inventory movement examples:

- GRN receipt
- process consumption
- process output
- adjustment
- scrap
- hold
- release
- transfer
- shipment

Recommended architecture:

- inventory_lots = current inventory/material state
- inventory_transactions = historical movement ledger

Current quantity should be derived from controlled inventory mutations and/or ledger-backed calculations.

## 2.21.1 Inventory Lot

Current material/inventory bucket representing available quantity.

Examples:

- raw inventory lot
- WIP inventory lot
- finished goods lot

Recommended future fields:

- lot number
- product
- available quantity
- inventory type
- status
- source reference
- current location

Inventory lots are the main selectable material units during process creation.

---

## 2.22 Allocation / Reservation

Stock committed to a sales order but not yet shipped.

Used to prevent overselling.

---

## 2.23 Available To Promise (ATP)

Stock available for immediate new commitments.

Formula idea:

```text
ATP = Finished Stock - Reserved Stock
```

---

## 2.24 Lot Lineage

Future traceability graph showing how lots split, merge, blend, or transfer material.

Important because:

- a child lot can have many parent lots
- merged lots may come from different batches or GRNs
- finished output must be traceable back to source GRNs/vendors

Recommended future table: `lot_lineage`.

---

## 3. Locked architecture decisions (v1)

These are frozen unless intentionally revised.

### 3.1 Process Master

- static
- developer-defined
- not editable by admin in v1

### 3.2 Workflow Builder

- admin-configurable
- built using Process Master
- ordered sequence of process steps

### 3.3 Workflow Ownership

Workflow belongs to a product/material.

### 3.4 Batch Source Rule

In v1:

- one GRN creates one batch
- one batch has one source GRN
- GRN quantity is treated as the full received quantity
- splitting happens after batch creation at `batch_lots`
- no multi-GRN batch in v1
- future multi-GRN material combination must be represented through lot lineage or a derived/blended batch, not by attaching multiple GRNs directly to one v1 batch

### 3.5 Inventory Buckets

Three clear inventory buckets:

- raw inventory
- WIP
- finished goods

### 3.6 QA/QC

- GRN has QA/QC gate before batch creation
- each workflow step can optionally require QA/QC
- if a lot process step requires QA/QC, completion moves it to `awaiting_qaqc`
- QA/QC approval moves the step forward
- QA/QC rejection or retest blocks normal progression
- final usable output only counts after passing required checks

### 3.7 v1 Manufacturing Engine Scope

Initial implementation successfully proved:

- linear workflow progression
- QA/QC-gated runtime movement
- runtime process execution persistence
- batch/lot/runtime orchestration

However, the long-term architecture direction is now:

- inventory-driven manufacturing
- process executions consume inventory lots
- process executions produce output lots
- output lots return to inventory
- future processes consume eligible inventory lots
- workflow defines allowed progression, not automatic runtime movement
- split/merge/blend/rework must preserve lineage

### 3.8 Runtime Naming Rule

Use business-language runtime names:

- `batches`
- `batch_lots`
- `lot_process_steps`

Do not use vague runtime names like `workflow_instances` for the redesigned system.

### 3.9 Current duplicate/integrity rules to implement next

The happy-path flow works, and some duplicate prevention exists, but production safety still requires polished backend errors and DB constraints.

Locked v1 rules:

- one VIR can create only one GRN
- one GRN can create only one batch
- one target can have only one pending QA/QC at a time
- a target means `process_type + process_ref`
- frontend may disable buttons and show loaders, but backend and DB constraints must enforce truth

Recommended DB constraints/indexes:

```sql
ALTER TABLE public.grns
ADD CONSTRAINT grns_vir_id_unique UNIQUE (vir_id);

ALTER TABLE public.batches
ADD CONSTRAINT batches_source_grn_id_unique UNIQUE (source_grn_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_qaqc_one_pending_per_ref
ON public.qaqc_entries (process_type, process_ref)
WHERE status = 'pending_verification';
```

Recommended backend checks:

- before GRN insert, check whether a GRN already exists for the VIR and return the existing `grn_number` or a clear error
- before batch insert, check whether a batch already exists for the GRN and return the existing `batch_number` or a clear error
- before QA/QC insert, check whether a pending QA/QC already exists for the reference and return the existing QA/QC id or a clear error

Current observed limitation:

- duplicate batch creation is blocked correctly
- current response uses `INTERNAL_ERROR` / HTTP 500
- target response should be `409 Conflict`

---

## 4. Final redesign decision

The project is not live yet, so the schema is being redesigned cleanly instead of incrementally patched.

### Final decision

Use a **clean redesign** for the manufacturing and workflow engine.

That means:

- old workflow/manufacturing tables are reference only
- new schema becomes the single source of truth
- naming must match business reality
- overlapping runtime models are not carried forward

---

## 5. Keep / polish / redesign / add / decommission

## 5.1 Keep and polish

These features/tables are conceptually good and should remain, with cleanup where needed:

- `users`
- `new_user` flow (signup request + admin approval)
- `vendors`
- `notification_events`
- `sales_po` for now

Notes:

- login flow is acceptable
- passwords are already hashed with bcrypt
- auth is not the first rebuild target

---

## 5.2 Keep table name, but redesign/clean structure if needed

These names are acceptable and worth preserving, but their structures may be cleaned:

- `products`
- `process_definitions`
- `vir`
- `grns`
- `process_executions`
- `qaqc_executions`

---

## 5.3 Add new tables

These are required for the redesigned schema:

- `customers`
- `product_workflows`
- `product_workflow_steps`
- `batches`
- `batch_lots`
- `lot_process_steps`
- later `lot_lineage`
- later `inventory_transactions`
- later `inventory_allocations`

---

## 5.4 Decommission / stop using for future development

These should not drive the future model:

- `workflow_instances`
- `workflow_instance_steps`
- `manufacturing_runs`
- `process_steps`
- `process_templates`
- `process_masters`
- `process_master_steps`
- `production_lots`
- `qaqc_statuses`
- `new_user` as a table name long-term (concept stays; table can be renamed later if desired)

Important:

- decommission does not mean immediate delete
- these can remain temporarily as historical/reference structures
- no new feature work should depend on them

---

## 6. Final logical architecture

### 6.1 Static definition layer

This is configured by admin or seeded by developers.

```text
Product Master
    ↓
Process Master
    ↓
Product Workflow
    ↓
Product Workflow Steps
```

---

### 6.2 Runtime execution layer

This is created when actual material starts moving through the system.

```text
Vendor
  ↓
VIR
  ↓
GRN
  ↓
GRN QA/QC
  ↓
Raw Inventory Lots
  ↓
Batch
  ↓
Process Execution consumes eligible inventory lots
  ↓
Process Execution creates output lots
  ↓
Output lots return to WIP inventory
  ↓
Future processes consume eligible WIP inventory lots
  ↓
Finished Goods Inventory
```

---

### 6.3 Future inventory/sales layer

This will be built later on top of the runtime engine.

```text
Raw Inventory
WIP
Finished Goods Inventory
Inventory Ledger
Sales Orders
Allocations / Reservations
Shipments
```

---

## 7. Final table contract

## 7.1 Identity / access

### `users`

Purpose: application users/employees who log into ERP.

Current state:

- keep existing flow
- polish later if needed

Notable current columns:

- `id`
- `username`
- `role`
- `password`
- `phone_num`
- `email`
- `department`
- `department_role`
- `name`
- `approved_by`
- `created_at`

Future cleanup ideas:

- rename `password` to `password_hash`
- add `updated_at`
- add `is_active`
- clean duplicate unique constraints
- use authenticated user from middleware for trusted action attribution

---

### `new_user`

Purpose: pending signup requests awaiting admin approval.

Current state:

- keep flow for now
- concept is valid

Future cleanup ideas:

- rename table to something clearer like `user_registration_requests`
- add `status`, `reviewed_by`, `reviewed_at`, `rejection_reason`

---

## 7.2 Business masters

### `vendors`

Purpose: supplier/vendor profiles.

Current state:

- keep existing table
- expand later if more metadata is needed

---

### `customers`

Purpose: customer/client profiles for sales.

Recommended/current columns:

- `id`
- `customer_code`
- `customer_name`
- `contact_person`
- `phone`
- `email`
- `address_line_1`
- `address_line_2`
- `city`
- `state`
- `country`
- `pincode`
- `gst_number`
- `is_active`
- `created_at`
- `updated_at`

---

### `products`

Purpose: master table for all system materials/products.

This table represents:

- raw materials
- intermediate materials
- finished products

Recommended columns:

- `id`
- `code`
- `name`
- `material_type` (`raw_material`, `intermediate`, `finished_product`)
- `unit_of_measure`
- `description`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

Important note:

- this is the canonical material/product table
- `material_type` is the differentiator
- active workflow is tied to product

---

## 7.3 Process definition layer

### `process_definitions`

Purpose: static Process Master.

Recommended columns:

- `id`
- `code`
- `name`
- `module_key`
- `description`
- `default_department`
- `default_form_schema`
- `is_manufacturing_process`
- `is_active`
- `created_at`
- `updated_at`

Examples:

- `EXT` → Extraction
- `STR` → Stripping
- `PUR` → Purification
- `DEC` → Decolorisation
- `PKG` → Packaging

Recommended usage:

- only rows with `is_manufacturing_process = true` are used in manufacturing workflow builder
- process-specific forms should eventually be generated from `default_form_schema`

---

### `product_workflows`

Purpose: workflow header table.

Recommended/current columns:

- `id`
- `product_id` → FK to `products.id`
- `version`
- `name`
- `description`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

Meaning:

- one row = one workflow definition for one product/material

Rule:

- in v1, only one active workflow per product

---

### `product_workflow_steps`

Purpose: ordered list of processes inside a workflow definition.

Recommended/current columns:

- `id`
- `workflow_id` → FK to `product_workflows.id`
- `process_definition_id` → FK to `process_definitions.id`
- `step_order`
- `is_required`
- `qaqc_required`
- `notes`
- `created_at`
- `updated_at`

Important constraints:

- unique (`workflow_id`, `step_order`)
- explicit ordering, not arrays

Example:

```text
Ashwagandha Extract Workflow
1 → Extraction
2 → Stripping
3 → Purification
4 → Decolorisation
```

---

## 7.4 Inward flow

### `vir`

Purpose: vehicle inspection event for incoming material.

Recommended/current columns:

- `id`
- `vir_number`
- `vendor_id`
- `product_id`
- `checklist`
- `remarks`
- `created_by`
- `checked_by`
- `checked_at`
- `status`
- `created_at`

Current working behavior:

- create VIR with vendor/product/checklist
- verify VIR to mark as `completed`
- GRN can only be created after VIR is completed

Future cleanup:

- backend should auto-fill `created_by`, `created_at`, `checked_by`, and `checked_at`

---

### `grns`

Purpose: actual material receipt after inspection.

Recommended/current columns:

- `id`
- `grn_number`
- `vir_id`
- `vir_number` temporarily kept for display/legacy convenience
- `container_qty`
- `quantity`
- `invoice`
- `invoice_date`
- `invoice_img`
- `packaging_status`
- `qaqc_status`
- `created_by`
- `created_at`
- `updated_at`

Important note:

- `vir_id` is the relational link
- product/vendor are derived through `vir`
- `vir_number` may be kept temporarily for display/legacy convenience
- `qaqc_status` gates batch creation
- approved GRN QA/QC is required before creating a batch

Current working behavior:

- GRN can be created only from a completed VIR
- GRN starts with `qaqc_status = pending_verification`
- GRN QA/QC approval updates `qaqc_status = approved`

---

## 7.5 Manufacturing runtime

### `batches`

Purpose: manufacturing job/order created from GRN material.

Recommended/current columns:

- `id`
- `batch_number`
- `source_grn_id`
- `workflow_id`
- `product_id`
- `input_quantity`
- `current_quantity`
- `final_quantity`
- `yield_percent`
- `status`
- `created_by`
- `started_at`
- `completed_at`
- `created_at`
- `updated_at`

Status examples:

- `pending`
- `in_progress`
- `completed`
- `on_hold`
- `cancelled`

Current working behavior:

- created only from a GRN with `qaqc_status = approved`
- product is derived from GRN → VIR → product
- active product workflow is selected automatically
- workflow steps are copied into `lot_process_steps`
- first runtime step becomes `active`

---

### `batch_lots`

Purpose: traceable material lots grouped under a manufacturing batch.

Recommended/current columns:

- `id`
- `batch_id`
- `lot_number`
- `parent_lot_id`
- `quantity`
- `status`
- `current_location`
- `created_at`
- `updated_at`

Important rules:

- lots are traceable material nodes
- lots may later support split, merge, blend, transfer, rework, and hold flows
- every process output should eventually create a new output lot
- remaining quantity stays available unless consumed
- lineage must remain traceable back to source GRN/VIR/vendor

Future lineage rules:

- child lot quantities must not exceed available parent quantities
- split/merge operations require backend transaction safety and row locking
- merge lineage may involve multiple parent lots

---

### `lot_process_steps`

Purpose: runtime-generated process chain for each lot.

Recommended/current columns:

- `id`
- `lot_id`
- `workflow_step_id`
- `process_definition_id`
- `step_order`
- `status`
- `retry_count`
- `is_skipped`
- `skip_reason`
- `started_at`
- `completed_at`
- `created_at`
- `updated_at`

Status examples:

- `pending`
- `active`
- `awaiting_qaqc`
- `completed`
- `failed`
- `rework`

Important note:

- this is the runtime state tracker
- this is not where deep form data lives

Current working behavior:

- active step can be started
- active step can be completed
- if `qaqc_required = false`, next pending step becomes active immediately
- if `qaqc_required = true`, step becomes `awaiting_qaqc`
- QA/QC with `process_type = lot_process_step` and `process_ref = lot_process_steps.id` as a string controls next transition

---

### `process_executions`

Purpose: actual execution record for a process pod.

This is the actual runtime manufacturing ticket/work record.

A process execution:

- consumes inventory lots/material
- performs manufacturing work
- produces new output lots

Recommended/current columns:

- `id`
- `lot_process_step_id`
- `assigned_to`
- `assigned_by`
- `assigned_at`
- `assigned_department`
- `quantity_in`
- `quantity_out`
- `quantity_loss`
- `loss_reason`
- `yield_percent`
- `form_data`
- `form_data_version`
- `equipment_used`
- `started_at`
- `completed_at`
- `duration_minutes`
- `completed_by`
- `verified_by`
- `verified_at`
- `operator_notes`
- `supervisor_notes`
- `created_at`
- `updated_at`

Important note:

- execution belongs directly to one lot process step
- `process_executions.id` is the execution/log/form record id
- `lot_process_step_id` points back to `lot_process_steps.id`
- repeatable operation/cycle rows are stored inside `form_data.operation_logs`

Current status:

- implemented and E2E tested in May 2026
- create execution works for an active lot process step
- get execution by id works
- get executions by step id works
- complete execution persists quantity out, quantity loss, yield percent, loss reason, form data, equipment used, operator notes, and supervisor notes
- completing a QA/QC-required step moves the `lot_process_step` to `awaiting_qaqc`
- completing a non-QA/QC final step currently completes the step but does not yet close the batch/lot

---

### `qaqc_executions`

Purpose: future QA/QC execution layer linked to a process execution.

Recommended columns:

- `id`
- `process_execution_id`
- `status`
- `containers_sampled`
- `containers_total`
- `sampled_quantity`
- `sample_identifiers`
- `sampled_by`
- `sampled_at`
- `sampling_method`
- `ar_number`
- `test_results`
- `potency`
- `moisture_content`
- `yield_percent`
- `external_lab_name`
- `external_lab_report_url`
- `analysed_by`
- `analysed_at`
- `approved_by`
- `approved_at`
- `coa_generated`
- `coa_url`
- `is_retest`
- `retest_of_id`
- `retest_reason`
- `retry_count`
- `max_retries`
- `failure_reason`
- `retry_required`
- `is_blocked`
- `blocked_until`
- `analyst_remark`
- `supervisor_remark`
- `created_at`
- `updated_at`

Important note:

- QA/QC should eventually belong directly to one process execution

Current status:

- current working bridge uses `qaqc_entries` with `process_type` + `process_ref`
- `process_type = grn` uses `process_ref = grn_number`
- `process_type = lot_process_step` uses `process_ref = lot_process_steps.id` as a string
- future cleanup can migrate this into `qaqc_executions` once `process_executions` is stable

---

## 7.6 Inventory and sales (later)

### `inventory_transactions` (later)

Purpose: transaction-based inventory movement ledger.

Recommended future responsibilities:

- raw material receipt
- process consumption
- process output
- adjustment
- scrap
- hold/release
- shipment
- manual corrections

Recommended direction:

- one unified inventory transaction ledger
- all inventory mutations should create ledger entries
- inventory lots represent current state
- inventory transactions represent historical truth

### `inventory_lots` (later)

Purpose: current inventory/material buckets.

Recommended future responsibilities:

- represent available inventory quantity
- represent raw/WIP/finished inventory
- act as selectable inventory during process creation
- maintain current quantity visibility for operators
- preserve source and lineage references

Recommended future behavior:

- process executions consume inventory lots
- process executions produce new output lots
- output lots return to inventory

### `inventory_allocations` (later)

Purpose: reserved stock against sales commitments.

### `sales_orders` or evolved `sales_po` (later)

Purpose: customer demand and fulfilment.

---

## 7.7 Future lineage and analytics tables

### `lot_lineage` (later)

Purpose: track split and merge ancestry between lots.

Recommended columns:

- `id`
- `parent_lot_id`
- `child_lot_id`
- `quantity_contributed`
- `operation_type` (`split`, `merge`, `transfer`, `blend`)
- `created_by`
- `created_at`

Important rules:

- required for accurate split/merge tracking
- required when merging lots from different batches or GRNs
- avoids relying on a single `parent_lot_id`, which cannot represent many-parent merge cases

Analytics enabled by lineage:

- trace finished output back to source GRNs
- calculate contribution percentage from each source lot
- track vendor-wise yield and quality issues
- support future recalls and compliance reporting

---

## 8. Final runtime flow example

```text
Vendor
  ↓
VIR
  ↓
GRN
  ↓
GRN QA/QC approval
  ↓
Raw Inventory Lots
  ↓
Create Batch
  ↓
Create Process Execution
  ↓
Select eligible inventory lots/material
  ↓
Consume inventory quantities
  ↓
Run manufacturing process
  ↓
Create output lots
  ↓
Output lots return to WIP inventory
  ↓
Future processes consume eligible WIP inventory
  ↓
Finished Goods Inventory
```

Example:

```text
Raw Inventory:
- Turmeric Lot A → 500kg
- Turmeric Lot B → 400kg

Create Extraction:
Consumes:
- 250kg from Lot A
- 150kg from Lot B

Extraction Output:
- WIP Lot X → 360kg

Create Filtration:
Consumes:
- 200kg from WIP Lot X
```

---

## 9. Implementation order

## Phase 1 — Master + workflow backbone

Create or clean:

- `products`
- `process_definitions`
- `customers`
- `product_workflows`
- `product_workflow_steps`

Current status:

- v2 product APIs are implemented
- v2 workflow APIs are implemented
- v2 customer APIs are implemented

## Phase 2 — Inward flow cleanup

Create or clean:

- `vir`
- `grns`
- `qaqc_entries` bridge for GRN QA/QC

Current status:

- VIR create/verify/get works
- GRN create/list works
- GRN QA/QC create/verify works

## Phase 3 — Manufacturing runtime

Create:

- `batches`
- `batch_lots`
- `lot_process_steps`
- `process_executions`
- `qaqc_executions`

Current Phase 3 status:

- `batches`, `batch_lots`, `lot_process_steps`, and `process_executions` are implemented and tested in happy path
- batch creation works from QA/QC-approved GRN
- lot process step progression works
- process execution create/get/complete works
- process execution stores quantity in/out/loss, yield percent, equipment used, operator/supervisor notes, and flexible `form_data`
- QA/QC-gated process step progression works
- batch history works
- known limitation: final batch/lot closure after all runtime steps complete is not yet updating `batches.status` / `batch_lots.status`

## Phase 4 — Later

Create:

- `lot_lineage`
- `inventory_transactions`
- `inventory_allocations`
- `sales_orders` or evolve `sales_po`

---

## 10. Milestone 1 scope

Milestone 1 should focus on:

### 10.1 Foundation / master layer

- confirm role model (`admin`, `manager`, `user`)
- keep `users` and login flow
- keep `vendors`
- evolve `products` into the product/material master

### 10.2 Process Master

- use `process_definitions`
- seed or clean manufacturing processes there

### 10.3 Workflow Definition Layer

- create/use `product_workflows`
- create/use `product_workflow_steps`
- add APIs and admin UI to configure workflow by product/material

### 10.4 Runtime preparation

- clean `vir` and `grns`
- prepare for batch creation from GRN
- support runtime `batches`, `batch_lots`, and `lot_process_steps`

---

## 11. Explicitly out of scope for Milestone 1

Not part of Milestone 1:

- inventory ledger
- stock allocation/reservation
- advanced automated split/merge orchestration
- advanced lineage visualization trees
- `lot_lineage` implementation
- full lineage tree
- advanced analytics dashboards
- planning/forecasting
- costing/FIFO/valuation

---

## 11.1 Next planned implementation steps

Immediate next work:

1. Add duplicate/integrity protections:
   - one VIR → one GRN
   - one GRN → one batch
   - one pending QA/QC per target
2. Move trusted user/date fields fully to backend:
   - use auth middleware for user attribution
   - use backend timestamps for create/verify actions
3. Add `GET one GRN` API.
4. Polish process execution final-step behavior:
   - close `batch_lots.status` when final step completes
   - close `batches.status` when final lot completes
   - persist final quantity and final yield
5. Enhance batch history to include:
   - QA/QC details per step
   - process execution details per step
6. Later add lot split/merge with `lot_lineage`.

Frontend follow-up:

- derive available actions from backend state
- disable duplicate create buttons while requests are pending
- show existing GRN/batch/QAQC references when already created
- use toast messages for successful actions and duplicate/precondition responses

---

## 12. Short locked summary

```text
- Auth/login flow stays and is polished later, not rebuilt first.
- Process Master is static and developer-defined.
- `process_definitions` is the Process Master table.
- Admin builds workflows by selecting ordered process steps from Process Master.
- Workflow belongs to a product/material.
- `products` is the canonical material/product master using `material_type`.
- GRN derives product/vendor through VIR.
- GRN QA/QC approval is required before batch creation.
- One VIR creates one GRN.
- One GRN creates one batch in v1.
- Batch creation auto-selects the active workflow for the product.
- Runtime workflow is copied into `lot_process_steps`; it is not derived live from the master workflow after creation.
- Long-term manufacturing direction is inventory-driven, not auto-linear runtime progression.
- Process executions consume eligible inventory lots and produce new output lots.
- Output lots return to inventory and may later be consumed by downstream processes.
- Workflow defines allowed progression, not automatic movement.
- Batch = manufacturing umbrella/job.
- Lot = traceable material node.
- inventory_lots represent current material state.
- inventory_transactions represent historical inventory movement.
- Every process output should eventually create a new output lot.
- Full lineage should remain traceable back to source GRN/VIR/vendor.
- Current working runtime engine is:
  VIR → GRN → GRN QA/QC → Batch → Lot → Lot Process Steps → Process Execution → Step QA/QC → next step activation.
- `process_executions` is implemented and E2E tested as the execution/log/form record for a runtime step.
- `qaqc_entries.process_type = grn` uses `process_ref = grn_number`.
- `qaqc_entries.process_type = lot_process_step` uses `process_ref = lot_process_steps.id` as a string.
- `workflow_instances`, `workflow_instance_steps`, `manufacturing_runs`, and old `process_steps` are not part of the redesigned canonical model.
- Next major backend work is duplicate/error polish, backend-owned timestamps/users, GET one GRN, final batch/lot closure, and richer batch history.
```

---

## 13. Legacy/current database reference snapshot

These existing tables/views exist today and helped inform the redesign, but they are not all part of the forward model.

### Existing support/auth

- `users`
- `new_user`
- `vendors`
- `notification_events`

### Existing inward

- `vir`
- `grns`

### Existing manufacturing/workflow legacy set

- `workflow_instances`
- `workflow_instance_steps`
- `workflow_audit_log`
- `v_workflow_summary`
- `v_process_queue`
- `process_definitions`
- `process_executions`
- `process_templates`
- `process_masters`
- `process_master_steps`
- `process_steps`
- `manufacturing_runs`
- `production_lots`
- `qaqc_executions`
- `qaqc_statuses`

### Current working QA/QC bridge

- `qaqc_entries` is currently used as the working generic QA/QC table
- it links to targets through `process_type` + `process_ref`
- it should eventually be revisited once `process_executions` and `qaqc_executions` are finalized

### Existing sales

- `sales_po`
- `sales_po_status_log`

### Existing product master candidate

- `products`

---

## 14. Recommended file usage

This file should be used as:

- planning reference
- onboarding reference
- AI context reference
- schema discussion base document
- migration planning reference

Whenever schema decisions are updated, this file should be updated instead of relying only on chat history.
