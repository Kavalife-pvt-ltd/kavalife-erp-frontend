# Sales PO UI v1.1 – Multi-Item Customer Inquiry

## Overview

Sales PO v1 supports:

- One inquiry = One ingredient/item

Sales PO v1.1 introduces:

- One customer inquiry = Multiple requested ingredients/items

The UI should allow Sales to create a single customer inquiry containing multiple ingredients while allowing Admin, Purchase, and Production teams to process each ingredient independently.

---

# Goals

- Reduce duplicate customer data entry.
- Allow multiple ingredients in one inquiry.
- Preserve the existing workflow engine.
- Keep routing and approvals item-based.
- Present customer information once.
- Keep documents attached at the inquiry level.

---

# Card vs Modal Principle

Cards are summaries. Modals are complete working context. Modal content is role-tailored.

Cards stay compact for scanning:

- Inquiry / PO number
- Company or masked customer label
- Ingredient / product
- Quantity and unit
- Request type
- Status
- Created date
- Due date when available
- Short comments preview when present

The Sales PO ticket modal is the working-context surface. Ingredient / product must always be visible in the modal.

Role visibility:

| Role | Modal context |
| --- | --- |
| Admin | Full business and workflow context, including Created By / Sales Rep where available. |
| Sales | Full own inquiry/customer context. |
| Purchase | Buying context only: ingredient, dates, quantity/specs, asking price when available, comments/requirements, documents, and purchase action context. |
| Production | Production/spec context only: ingredient, dates, quantity/specs, comments/requirements, documents, and production action context. |

Purchase and Production should not need Created By / Sales Rep and should not receive full customer/company/contact details unless role masking rules intentionally allow it.

TODO: Current Sales PO responses may only provide `salesRepId`. Use `Sales Rep ID: <id>` for Admin until the API provides a joined display name.

---

# Create Inquiry Page

## Section 1 – Customer Information

Fields:

- Company Name
- Company Address
- Contact Name
- Contact Number
- Contact Email
- Request Date
- General Comments

These values belong to the Inquiry Group.

---

## Section 2 – Requested Items

User can add one or more ingredient rows.

Example:

```txt
+ Add Ingredient

1. Ashwagandha Extract
2. Shilajit Resin
3. Moringa Powder
```

Each item contains:

- Product Name
- Quantity
- Quantity Unit
- Purity
- Grade
- Asking Price
- Item Comments

Users should be able to:

- Add item
- Remove item
- Reorder item (future enhancement)

---

## Section 3 – Customer Documents

Documents belong to the Inquiry Group.

Examples:

- Customer COA
- Product Requirement Sheet
- Specification Sheet

Upload should continue using the generic document upload system.

---

# Admin Queue UI

## Queue Card

Admin should see one card per Inquiry Group.

Example:

```txt
INQ-052026-001
ABC Pharmaceuticals
3 Requested Items
```

Card summary should show:

- Inquiry Number
- Company Name
- Total Items
- Pending Items
- Returned Items
- Approved Items

---

## Inquiry Modal

Opening the inquiry displays:

### Customer Information

- Company details
- Contact details
- Uploaded documents

### Requested Items

Each item appears independently.

Example:

```txt
Ashwagandha Extract
50 KG

[Route to Purchase]
[Route to Production]
[Return to Sales]
```

Admin actions apply per item.

---

# Purchase Queue UI

Purchase works at item level.

Cards should display:

- Product Name
- Quantity
- Inquiry Number
- Customer Name (masked unless Admin)
- Current Status

Purchase actions:

```txt
Submit Price
Mark Purchase Completed
```

---

# Production Queue UI

Production works at item level.

Cards should display:

- Product Name
- Quantity
- Inquiry Number
- Customer Name (masked unless Admin)
- Current Status

Production actions:

```txt
Mark Production Completed
```

---

# My Inquiries UI

Sales should see Inquiry Groups.

Example:

```txt
INQ-052026-001
ABC Pharmaceuticals
3 Items
```

Expanding an inquiry displays:

```txt
Ashwagandha -> Production
Shilajit -> Purchase
Moringa -> Returned
```

Sales should understand the progress of each item independently.

---

# All POs UI

Display approved items.

Each item should show:

- PO Number
- Inquiry Number
- Product Name
- Quantity
- Status

One inquiry may generate multiple PO numbers.

---

# Status Display

## Group-Level Summary

Possible examples:

```txt
3 Items

1 Production
1 Purchase
1 Returned
```

or

```txt
Partially Processed
```

---

## Item-Level Status

Continue using existing pretty status labels.

Examples:

- Waiting for Admin Review
- Sent to Purchase
- Purchase Price Submitted
- Purchase Approved
- Sent to Production
- Returned to Sales
- Final Approved

---

# Documents

Inquiry documents should be visible from:

- Admin Review
- My Inquiries
- Purchase Queue
- Production Queue

Documents belong to the inquiry group, not individual items.

---

# Edge Cases

## Mixed Routing

Example:

```txt
Ashwagandha -> Production
Shilajit -> Purchase
Moringa -> Returned
```

The inquiry remains visible while items continue independently.

---

## Partial Completion

Example:

```txt
3 Items

2 Final Approved
1 Pending
```

Group summary should reflect mixed progress.

---

## Upload Failure

If inquiry creation succeeds but document upload fails:

- Inquiry remains created
- User receives upload failure message
- User can upload documents later

---

# Out Of Scope

Not included in v1.1:

- Vendor selection
- Vendor comparison
- Inventory auto-routing
- Customer master
- Bulk actions
- Item cloning
- Workflow automation
- Notification redesign

---

# Recommended UX Direction

Use Inquiry Groups for:

- Customer information
- Documents
- High-level tracking

Use Item Cards for:

- Workflow routing
- Purchase actions
- Production actions
- Status transitions

---

# Implemented Phase D View Split

- Admin and Sales views use grouped inquiry cards so one customer inquiry appears once, even when it contains multiple ingredients.
- Purchase and Production queues continue using item-level operational cards because their work is performed per ingredient/item.
- The grouped inquiry modal shows customer context, group-level documents, notes, and all ingredient/item sections together.
- Only items currently owned by Admin are actionable in the Admin grouped modal.
- Routed items remain visible inside the grouped modal, but they are read-only until they return to Admin ownership.

This keeps the customer experience grouped while preserving operational flexibility.
