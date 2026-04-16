# Operator Reporting Dashboard Implementation Guide

This guide provides the API details for building the **Operator Reporting Dashboard**. These endpoints provide summary stats, trend indicators, and chart data as shown in the design mocks.

## Base URL
`/api/v1/operator-reporting`

## 1. Summary Stats
**Endpoint:** `GET /stats?storeId=<optional>`

Returns the four summary cards at the top of the dashboard.

### Response Data Structure:
```json
{
  "success": true,
  "data": {
    "totalOrders": { "value": 2847, "trend": 12.5, "direction": "up" },
    "completedOrders": { "value": 2134, "trend": 3.2, "direction": "up" },
    "pendingOrders": { "value": 542, "trend": 2.1, "direction": "down" },
    "delayedOrders": { "value": 171, "trend": 15.3, "direction": "down" }
  }
}
```

---

## 2. Weekly Order Chart
**Endpoint:** `GET /weekly-chart?storeId=<optional>`

Provides daily order counts for the last 7 days (Mon-Sun).

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    { "day": "Mon", "count": 350 },
    { "day": "Tue", "count": 420 },
    ...
  ]
}
```

---

## 3. Order Status Distribution
**Endpoint:** `GET /status-distribution?storeId=<optional>`

Provides counts and percentages for each individual order status (PENDING, PROCESSING, DELIVERED, etc.).

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    { "label": "PENDING", "value": 542, "percentage": 19 },
    { "label": "PROCESSING", "value": 120, "percentage": 4 },
    { "label": "DELIVERED", "value": 2134, "percentage": 75 },
    { "label": "CANCELLED", "value": 51, "percentage": 2 }
    ...
  ]
}
```

---

## 4. Performance Summary
**Endpoint:** `GET /performance-summary?storeId=<optional>`

Provides the lower-section KPIs.

### Response Data Structure:
```json
{
  "success": true,
  "data": {
    "efficiencyRate": {
      "value": 94.2,
      "label": "Efficiency Rate",
      "subtext": "Completed vs assigned ratio"
    },
    "customerSatisfaction": {
      "value": 4.8,
      "label": "Customer Satisfaction",
      "subtext": "Based on 1247 reviews"
    },
    "revenueImpact": {
      "value": 127000.0,
      "label": "Revenue Impact",
      "trend": 18.3,
      "direction": "up",
      "subtext": "Total subtotal processed"
    }
  }
}
```

## Authentication
- **Role:** Required `OPERATOR`.
- **Header:** `Authorization: Bearer <token>`
- **Identity:** The `operatorId` is automatically resolved from the token.
