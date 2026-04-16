# Operator Orders Analytics Guide

This guide provides details on the Operator Order Stats API implemented for the **Orders Management Dashboard**. These stats include trend indicators (comparison vs last week).

## 1. Order Summary Stats (Performance Metrics)
**Endpoint:** `GET /api/v1/operator-analytics/performance-metrics?storeId=<optional>`

Provides the key performance indicators (KPIs) for the orders page.

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operator order stats fetched successfully",
  "data": {
    "totalOrders": 1250,
    "cancellationRate": {
      "value": 2.3,
      "change": 0.5,
      "direction": "down"
    },
    "repeatedCustomerRate": {
      "value": 68.0,
      "change": 3.0,
      "direction": "up"
    },
    "ontimeCompletion": {
      "value": 94.0,
      "change": 2.0,
      "direction": "up"
    },
    "averageTicket": {
      "value": 24.50,
      "change": 1.20,
      "direction": "up"
    }
  }
}
```

### Frontend Implementation:
- **Card Rendering:** Use `data.xxx.value` for the main metric.
- **Trend Indicators:** 
  - Use `data.xxx.change` for the percentage/value change.
  - Use `data.xxx.direction` (`up` or `down`) to determine the arrow icon and color (up-green/down-red, or vice versa for cancellation rate).
  - Subtext should say "vs last week" (e.g., "0.5% vs last week").
- **Metric Formatting:**
  - `cancellationRate`, `repeatedCustomerRate`, `ontimeCompletion` are percentages (%).
  - `averageTicket` is a currency value ($).

---

## 2. Newly Placed Orders
**Endpoint:** `GET /api/v1/operator-orders/newly-placed?storeId=<optional>`

Returns the list of orders with `PENDING` status to keep the operator updated on new incoming work.

---

## Authentication
- **Role:** Required `OPERATOR`.
- **Header:** `Authorization: Bearer <token>`
- **Identity:** The `operatorId` is automatically resolved from the token.
