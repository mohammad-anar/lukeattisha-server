# Operator Membership Analytics — Implementation Guide

Module path: `/api/v1/operator-membership`

All endpoints require `Authorization: Bearer <token>` with role `OPERATOR`. The `operatorId` is resolved automatically from the token.

---

## Schema Change
Two fields were added to the `Order` model:
```prisma
isFromAd Boolean @default(false)
adId     String? // optional relation to Ad model
```
> Run `npx prisma migrate dev --name add_order_ad_tracking` to apply.

When creating an order from an ad click, set `isFromAd: true` and `adId: <ad_id>` in the order creation payload.

---

## 1. Membership Stats (Summary Cards)
`GET /stats?startDate=<ISO>&endDate=<ISO>`

Returns the two top stat cards with trend vs last month.

```json
{
  "data": {
    "membershipOrders":    { "count": 5, "trend": 97.0, "direction": "down" },
    "nonMembershipOrders": { "count": 3, "trend": 97.0, "direction": "down" }
  }
}
```

---

## 2. Order Distribution (Pie Chart)
`GET /order-distribution?startDate=<ISO>&endDate=<ISO>`

```json
{
  "data": [
    { "label": "Membership Orders",     "value": 5, "percentage": 63 },
    { "label": "Non-Membership Orders", "value": 3, "percentage": 37 }
  ]
}
```

---

## 3. Orders Over Time (Bar Chart)
`GET /orders-over-time?months=6`

Returns monthly grouped counts for the last N months (default 6).

```json
{
  "data": [
    { "month": "Nov 24", "membershipOrders": 15, "nonMembershipOrders": 12 },
    { "month": "Dec 24", "membershipOrders": 18, "nonMembershipOrders": 14 },
    ...
  ]
}
```

---

## 4. Order Summary (Table)
`GET /order-summary?startDate=<ISO>&endDate=<ISO>`

Returns a flat list of all orders **plus** an aggregated summary table.

### `data.summary` (bottom table rows):
```json
[
  { "type": "Membership Orders",     "totalOrders": 5, "percentage": 63, "revenue": 933.00, "avgOrderValue": 187.00 },
  { "type": "Non-Membership Orders", "totalOrders": 3, "percentage": 37, "revenue": 450.00, "avgOrderValue": 163.00 },
  { "type": "Total",                 "totalOrders": 8, "percentage": 100,"revenue": 1423.00,"avgOrderValue": 178.00 }
]
```

### `data.orders` (each row):
```json
{
  "id": "...",
  "orderNumber": "ORD-001",
  "isSubscription": true,
  "isFromAd": false,
  "adId": null,
  "status": "DELIVERED",
  "paymentStatus": "PAID",
  "totalAmount": "187.00",
  "subtotal": "180.00",
  "createdAt": "2026-04-16T10:00:00Z",
  "user": { "name": "Sarah Johnson", "email": "sarah@example.com" },
  "ad": null
}
```

### UI Tagging:
- `isSubscription === true` → show **Membership** badge (blue)
- `isSubscription === false` → show **Non-Membership** badge (green)
- `isFromAd === true` → show **From Ad** chip / icon
