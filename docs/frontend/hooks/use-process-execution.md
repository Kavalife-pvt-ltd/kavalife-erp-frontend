# useProcessExecution Hook

## Purpose

`useProcessExecution` is the primary frontend orchestration hook for the manufacturing runtime.

This hook is responsible for:

- creating process executions
- loading execution details
- saving execution progress
- completing executions
- fetching execution inputs/outputs
- managing loading/error states
- handling optimistic UI updates safely
- syncing runtime state with backend truth

The frontend should NOT contain manufacturing business logic.

The backend remains the source of truth for:

- inventory eligibility
- workflow progression
- QA/QC requirements
- inventory availability
- process validity
- lineage creation
- audit tracking

The hook should behave like a runtime controller, not a rules engine.

---

# Hook Responsibilities

## The hook owns

### Runtime API orchestration

- create process execution
- update progress
- complete process
- fetch inputs
- fetch outputs
- refresh execution state

### UI state

- loading
- submitting
- completion state
- error state
- success state
- dirty form state

### Safe frontend runtime behavior

- prevent double submits
- disable actions during requests
- invalidate stale runtime state
- refresh runtime after mutations

---

# The hook MUST NOT own

The hook must NOT implement manufacturing rules.

Do NOT implement frontend logic like:

- can this lot be consumed?
- is this process valid?
- can this step progress?
- is QA/QC required?
- is inventory usable?
- should output inventory become available?

The backend already owns these invariants.

Frontend should ask backend:

```text
what is allowed?
what is available?
what is current state?
```

---

# Recommended File Location

```text
src/features/manufacturing/hooks/useProcessExecution.ts
```

---

# Hook Inputs

## Suggested Params

```ts
{
  executionId?: number
  lotProcessStepId?: number
  batchId?: number
  processCode?: string
  processDefinitionId?: number
}
```

Not all params are required simultaneously.

The hook should support:

- loading existing execution
- creating new execution
- runtime workspace flows

---

# Hook Return Shape

## Suggested Return Structure

```ts
{
  (execution,
    inputs,
    outputs,
    loading,
    submitting,
    savingProgress,
    completing,
    error,
    createExecution,
    saveProgress,
    completeExecution,
    refreshExecution,
    fetchInputs,
    fetchOutputs,
    resetError);
}
```

---

# Backend APIs Used

## Create Execution

```http
POST /v2/process-executions
```

Purpose:

- consumes inventory
- creates runtime execution
- creates inventory consume transactions
- creates process_execution_inputs

---

## Save Progress

```http
PATCH /v2/process-executions/:id/progress
```

Purpose:

- saves form progress
- updates runtime state
- updates operator notes
- updates equipment data

This endpoint MUST NOT:

- consume inventory again
- create outputs
- advance workflow

---

## Complete Execution

```http
PATCH /v2/process-executions/:id/complete
```

Purpose:

- completes execution
- creates output inventory
- creates produce inventory transaction
- creates lineage
- advances workflow
- may trigger QA/QC gate

---

## Fetch Inputs

```http
GET /v2/process-executions/:id/inputs
```

Purpose:

- display consumed inventory
- display source lots
- display quantity contribution

---

## Fetch Outputs

```http
GET /v2/process-executions/:id/outputs
```

Purpose:

- display produced inventory
- display output lot
- display QA/QC state

---

# Create Execution Flow

## Frontend Flow

```text
Select inventory lots
↓
Enter quantity
↓
Click Create Process
↓
POST /v2/process-executions
↓
Backend consumes inventory
↓
Execution returned
↓
Workspace becomes active
```

---

# Save Progress Flow

## Frontend Flow

```text
Operator fills runtime form
↓
Click Save Progress
↓
PATCH progress API
↓
Backend stores runtime form state
↓
UI refreshes execution
```

This action should feel lightweight.

No confirmation modal required.

---

# Complete Process Flow

## Frontend Flow

```text
Operator enters:
- quantity out
- quantity loss
- notes
↓
Click Complete Process
↓
Confirmation modal
↓
PATCH complete API
↓
Backend:
- completes process
- creates output inventory
- creates lineage
- advances workflow
↓
UI refreshes runtime
```

---

# QA/QC Runtime Behavior

If process requires QA/QC:

```text
process completes
↓
output inventory status = under_qaqc
↓
workflow step = awaiting_qaqc
↓
QA/QC approval
↓
output inventory status = available
↓
next workflow step activates
```

Frontend should display:

```text
Awaiting QA/QC Approval
```

instead of:

```text
Completed
```

for gated processes.

---

# Loading States

## Required States

### loading

Used when:

- fetching execution
- loading workspace

---

### submitting

Used during:

- create execution

---

### savingProgress

Used during:

- save progress action

Should NOT block entire screen.

---

### completing

Used during:

- complete process action

Should disable:

- complete button
- save button
- inventory edits

---

# Error Handling

## Backend Errors Must Be Displayed

Examples:

```text
insufficient inventory quantity
inventory lot is not available
process execution already exists
process execution output quantity mismatch
```

Frontend should NOT rewrite backend manufacturing errors.

Show meaningful backend messages directly where safe.

---

# Optimistic Updates

## Allowed

Safe optimistic updates:

- local form edits
- temporary button loading
- optimistic save indicators

---

## NOT Allowed

Do NOT optimistically:

- reduce inventory
- advance workflow
- mark process completed
- release QA/QC inventory

Always wait for backend truth.

---

# Runtime Refresh Strategy

## After Create Execution

Refresh:

- process board
- workspace execution
- available inventory

---

## After Complete Execution

Refresh:

- execution
- outputs
- lineage
- batch history
- process board
- available inventory

---

# Suggested Internal Hook Structure

## Suggested Internal State

```ts
const [execution, setExecution];
const [inputs, setInputs];
const [outputs, setOutputs];
const [loading, setLoading];
const [submitting, setSubmitting];
const [savingProgress, setSavingProgress];
const [completing, setCompleting];
const [error, setError];
```

---

# Suggested Hook Methods

## createExecution

Purpose:

- create runtime execution
- consume inventory

---

## saveProgress

Purpose:

- persist runtime form state

---

## completeExecution

Purpose:

- finalize execution
- create outputs

---

## refreshExecution

Purpose:

- re-fetch latest backend truth

---

## fetchInputs

Purpose:

- fetch consumed inventory

---

## fetchOutputs

Purpose:

- fetch produced inventory

---

# UI Philosophy

The operator should feel:

```text
I am running a manufacturing process
```

NOT:

```text
I am editing database records
```

The hook exists to hide orchestration complexity from the UI layer.

---

# Future Enhancements

Not required for v1.

Potential future support:

- autosave
- offline buffering
- execution resume
- websocket runtime sync
- real-time operator collaboration
- rework executions
- partial output batches
- multiple outputs
- inline lineage visualization
- equipment telemetry integration

These should NOT complicate the v1 hook design.
