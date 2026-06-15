# useProcessExecution Hook Contract

> Status: Active frontend implementation contract  
> Scope: Manufacturing runtime orchestration hook  
> Audience: Developers and AI coding agents

---

## 1. Purpose

`useProcessExecution` is the main frontend runtime orchestration hook for manufacturing processes.

The hook exists to:

- load an existing process execution
- create a process execution
- save progress
- complete process
- fetch inputs/outputs
- manage loading/submission/error state
- keep frontend runtime synced with backend truth

The hook should behave like a runtime controller.

It must not become a manufacturing rules engine.

---

## 2. Core mental model

```text
lot_process_step
  = workflow eligibility slot

process_execution
  = actual operator job/form/run

inventory_lot
  = material truth
```

Important:

```text
Workspace should operate existing executions.
Workspace should not auto-create executions.
```

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
Workspace opens
```

---

## 3. Recommended file location

```text
src/features/manufacturing/hooks/useProcessExecution.ts
```

---

## 4. Hook responsibilities

The hook owns:

- runtime API orchestration
- loading/submitting/completing states
- execution state refresh
- inputs/outputs fetch
- safe mutation flow
- runtime error handling
- dirty form tracking

The hook should:

- prevent double submits
- disable actions during requests
- refresh runtime after mutations
- surface backend errors clearly

---

## 5. Hook must NOT own

The hook must not implement manufacturing rules.

Do not implement frontend rules like:

- can this lot be consumed?
- should this process be allowed?
- is QA/QC required?
- should next step activate?
- should inventory become available?
- should workflow progress?

Backend owns:

- inventory eligibility
- inventory mutations
- workflow progression
- QA/QC gating
- lineage creation
- audit metadata

Frontend should ask backend:

```text
What is allowed?
What is available?
What is current state?
```

---

## 6. Suggested hook params

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

Primary workspace usage:

```ts
useProcessExecution({
  lotProcessStepId: stepId,
});
```

---

## 7. Suggested return shape

```ts
{
  execution,
  inputs,
  outputs,
  loading,
  submitting,
  savingProgress,
  completing,
  error,
  dirty,
  createExecution,
  saveProgress,
  completeExecution,
  refreshExecution,
  fetchInputs,
  fetchOutputs,
  resetError,
  setDirty,
}
```

---

## 8. Main backend APIs

## 8.1 Create execution

```http
POST /v2/process-executions
```

Purpose:

- create process execution
- consume inventory
- create consume transactions
- create process_execution_inputs

---

## 8.2 Save progress

```http
PATCH /v2/process-executions/:id/progress
```

Purpose:

- save runtime form state
- save notes/equipment data
- update execution progress

This endpoint must not:

- consume inventory
- create outputs
- advance workflow
- complete process

---

## 8.3 Complete process

```http
PATCH /v2/process-executions/:id/complete
```

Purpose:

- complete process execution
- create output inventory
- create produce transaction
- create lineage
- advance workflow
- move to awaiting_qaqc if required

---

## 8.4 Fetch inputs

```http
GET /v2/process-executions/:id/inputs
```

Purpose:

- display consumed inventory
- display quantity consumed
- display source lots

---

## 8.5 Fetch outputs

```http
GET /v2/process-executions/:id/outputs
```

Purpose:

- display produced inventory
- display output lots
- display QA/QC state

---

## 8.6 Fetch execution by step

```http
GET /v2/process-executions/step/:stepId
```

Purpose:

- load existing execution for workspace route

---

## 9. Create execution flow

Correct frontend flow:

```text
Operator opens process page
  ↓
Clicks Create New Process
  ↓
Selects eligible inventory
  ↓
Enters quantity
  ↓
Clicks Start Process
  ↓
POST /v2/process-executions
  ↓
Backend consumes inventory
  ↓
Execution returned
  ↓
Workspace opens
```

The hook should support this flow.

The hook should not auto-create execution during workspace load.

---

## 10. Workspace load flow

Correct workspace flow:

```text
Read stepId
  ↓
Fetch existing execution
  ↓
Fetch inputs/outputs
  ↓
Fetch form schema
  ↓
Render workspace
```

If no execution exists:

```text
No process job has been started for this step.
Please start it from the process page.
```

Do not silently create execution.

---

## 11. Save progress flow

```text
Operator edits form
  ↓
Click Save Progress
  ↓
PATCH progress API
  ↓
Backend stores runtime form state
  ↓
Refresh execution state
```

Save Progress should feel lightweight.

No confirmation modal required.

Save Progress should not:

- consume inventory
- create outputs
- advance workflow
- complete process

---

## 12. Complete process flow

```text
Operator enters:
- quantityOut
- output details
- notes
↓
Frontend previews loss/yield
↓
Click Complete Process
↓
Confirmation modal
↓
PATCH complete API
↓
Backend:
- completes execution
- creates output inventory
- creates lineage
- advances workflow
↓
UI refreshes runtime
```

Frontend may preview:

```text
quantityLoss = quantityIn - quantityOut
yieldPercent = quantityOut / quantityIn * 100
```

Backend owns final persisted values.

---

## 13. QA/QC runtime behavior

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
next step activates
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

## 14. Required loading states

## loading

Used when:

- fetching execution
- loading workspace
- loading runtime dependencies

---

## submitting

Used during:

- create execution

Disable:

- Start Process button
- duplicate create actions

---

## savingProgress

Used during:

- Save Progress

Should not block entire page.

---

## completing

Used during:

- Complete Process

Disable:

- Complete button
- Save button
- editable form actions if needed

---

## 15. Error handling

Backend manufacturing/runtime errors should be displayed directly where safe.

Examples:

```text
insufficient inventory quantity
inventory lot is not available
process execution already exists
quantity mismatch
output validation failed
```

Frontend should not rewrite manufacturing errors into generic messages.

---

## 16. Dirty state

The hook should track local unsaved state.

Dirty becomes true when:

- form fields change
- repeatable rows change
- notes/equipment change

Dirty becomes false when:

- Save Progress succeeds
- Complete Process succeeds
- execution reloads from backend

The hook should expose:

```ts
dirty;
setDirty;
```

---

## 17. Optimistic updates

Allowed:

- local form edits
- loading indicators
- optimistic save indicators

Not allowed:

- reducing inventory locally
- advancing workflow locally
- marking QA/QC released locally
- marking execution completed before backend response

Always refresh backend truth after runtime mutations.

---

## 18. Runtime refresh strategy

## After create execution

Refresh:

- process page/board
- execution
- available inventory

---

## After save progress

Refresh:

- execution only if needed

Avoid unnecessary full-page reloads.

---

## After complete process

Refresh:

- execution
- outputs
- process board/page
- batch history
- available inventory
- lineage if visible

---

## 19. Suggested internal state

```ts
const [execution, setExecution];
const [inputs, setInputs];
const [outputs, setOutputs];
const [loading, setLoading];
const [submitting, setSubmitting];
const [savingProgress, setSavingProgress];
const [completing, setCompleting];
const [error, setError];
const [dirty, setDirty];
```

---

## 20. Suggested methods

## createExecution

Purpose:

- create process execution
- consume inventory

---

## saveProgress

Purpose:

- persist form/runtime data

---

## completeExecution

Purpose:

- finalize process execution
- create output inventory

---

## refreshExecution

Purpose:

- refresh backend runtime truth

---

## fetchInputs

Purpose:

- fetch consumed inventory

---

## fetchOutputs

Purpose:

- fetch produced inventory

---

## resetError

Purpose:

- clear displayed runtime errors

---

## 21. UI philosophy

The operator should feel:

```text
I am running a manufacturing process.
```

NOT:

```text
I am editing workflow rows and database records.
```

The hook exists to hide runtime orchestration complexity from UI components.

---

## 22. Future enhancements

Not required for v1.

Possible later additions:

- autosave
- offline buffering
- websocket runtime sync
- execution resume
- operator collaboration
- rework flows
- multiple outputs
- lineage visualization
- equipment telemetry

Do not complicate v1 hook design for future ideas.

---

## 23. AI implementation rules

Before editing the hook, read:

```text
docs/frontend/process-runtime-flow.md
docs/frontend/01-manufacturing-runtime-ui-contract.md
docs/frontend/pages/process-board-page.md
docs/frontend/pages/process-workspace-page.md
docs/frontend/contracts/runtime-api-contract.md
```

Rules:

- keep hook focused on orchestration
- do not implement backend manufacturing rules in frontend
- do not reintroduce auto-start behavior
- keep backend as source of runtime truth
- report API/contract mismatches clearly

---

## 24. Short locked summary

```text
- useProcessExecution is the runtime orchestration hook.
- Workspace should operate existing executions only.
- Process creation should happen from process pages/popups.
- Hook manages loading/submission/runtime refresh state.
- Hook must not implement manufacturing rules.
- Backend owns inventory, workflow, QA/QC, lineage, and audit truth.
- Save Progress only saves runtime form data.
- Complete Process creates output inventory through backend.
```
