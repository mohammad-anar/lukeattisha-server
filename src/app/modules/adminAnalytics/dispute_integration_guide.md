# Dispute Management Integration Guide (Admin & Operator)

This guide provides details on the refined Dispute Management logic for both Admin and Operator roles.

## 1. Flow Overview
1.  **Customer** reports an issue.
2.  **Operator** receives the issue and can:
    *   **Refund**: Resolve it immediately by refunding the customer.
    *   **Escalate**: Send it to Admin (requires a reason/note).
3.  **Admin** manages **only escalated** issues and can:
    *   **Refund**: Deduct from platforms/operator and return to customer.
    *   **Deduct Payout**: Penalize the operator by deducting from their wallet.
    *   **Dismiss**: Close the dispute without any financial action (if customer is wrong).

---

## 2. Operator Actions
**Endpoint:** `PATCH /api/v1/order-issue/:id/respond`

### Payload:
```json
{
  "action": "ESCALATE", // Or "REFUND"
  "note": "We checked the items and they were perfect. Escalating for review." // REQUIRED for ESCALATE
}
```

---

## 3. Admin Actions
**Endpoint:** `PATCH /api/v1/order-issue/:id/resolve`
*Note: These actions only work if the dispute is currently `isEscalated: true`.*

| Action Button | Payload `action` | Description |
| :--- | :--- | :--- |
| **Refund** | `REFUND` | Processes a standard refund. Requires `amount`. |
| **Deduct Payout** | `DEDUCT_PAYOUT` | Deducts from operator wallet and connected account. Requires `amount`. |
| **Dismiss** | `DISMISS` | Closes the dispute as invalid. No financial transfer. |

### Example Payload (Deduct):
```json
{
  "action": "DEDUCT_PAYOUT",
  "amount": 50.00,
  "note": "Operator failed to provide proof of delivery. Deducting full amount."
}
```

---

## 4. Get Dispute Details (Unchanged)
**Endpoint:** `GET /api/v1/order-issue/:id`
Provides full order summary, items, pricing, and photo evidence.

## Authentication
Ensure the **Bearer Token** is included. Scoping is handled automatically by the backend.
