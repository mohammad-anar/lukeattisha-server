# Central Dispute Management Implementation Guide

This guide provides details on the APIs used for the Central Dispute Management dashboard where admins can track and resolve customer disputes.

## 1. List Disputes
**Endpoint:** `GET /api/v1/order-issue`
**Access:** ADMIN, SUPER_ADMIN

### Query Parameters:
- `searchTerm`: (Optional) Search by Order Number, Customer Name, or Operator Name.
- `status`: (Optional) Filter by status (`PENDING`, `RESOLVED`, `ESCALATED`, `REFUNDED`).
- `page`: (Optional) Page number for pagination.
- `limit`: (Optional) Number of records per page.
- `sortBy`: (Optional) Field to sort by (e.g., `createdAt`).
- `sortOrder`: (Optional) `asc` or `desc`.

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order issues fetched successfully",
  "meta": {
    "total": 45,
    "totalPage": 8,
    "page": 1,
    "limit": 6
  },
  "data": [
    {
      "id": "CLM-2847",
      "orderId": "xxx",
      "userId": "xxx",
      "operatorId": "xxx",
      "description": "Laundry was damaged...",
      "status": "ESCALATED",
      "isEscalated": true,
      "createdAt": "2026-04-16T12:00:00Z",
      "order": {
        "id": "xxx",
        "orderNumber": "ORD-9234"
      },
      "user": {
        "id": "xxx",
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "avatar": "url_to_avatar"
      },
      "operator": {
        "id": "xxx",
        "user": {
          "id": "xxx",
          "name": "Mike's Laundry",
          "avatar": "url_to_avatar"
        }
      }
    }
  ]
}
```

### Frontend Table Mapping:
- **Claim ID:** Use `id`.
- **Order ID:** Use `order.orderNumber`.
- **Customer:** Use `user.name`.
- **Operator:** Use `operator.user.name`.
- **Status:** Display `status`. Map visually:
    - `ESCALATED` -> **Escalated** (Red)
    - `PENDING` -> **Open** (Grey/Yellow)
    - `RESOLVED` / `REFUNDED` -> **Resolved** (Blue/Green)

---

## 2. Resolve Escalated Dispute (Admin Action)
**Endpoint:** `PATCH /api/v1/order-issue/:id/resolve`
**Access:** ADMIN, SUPER_ADMIN

### Request Body:
```json
{
  "action": "REFUND", // Options: "REFUND", "PARTIAL_REFUND", "SOLVE"
  "amount": 50.00,    // Required for REFUND or PARTIAL_REFUND
  "note": "Resolved by admin after reviewing images." // Admin note
}
```

---

## Authentication & Authorization
- These routes require a valid **JWT Token** with `ADMIN` or `SUPER_ADMIN` role in the `Authorization` header.
