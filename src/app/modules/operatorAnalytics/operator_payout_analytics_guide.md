# Operator Payout & Earnings Analytics Guide

This guide provides details on the Operator Analytics APIs implemented for the **Earnings Dashboard**. These APIs provide real-time data for revenue tracking, payout history, and performance metrics.

## 1. Earnings Summary Stats
**Endpoint:** `GET /api/v1/operator-analytics/stats?storeId=<optional>`

Provides the core summary cards for the earnings page. If `storeId` is passed, it returns all-time stats for that store. If omitted, it returns current-month stats across all stores.

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operator analytics stats fetched successfully",
  "data": {
    "totalOrders": 145,
    "totalRevenue": 451.00,
    "processingOrders": 12,
    "outForDeliveryOrders": 5,
    "completedOrders": 128,
    "grossRevenue": 451.00,
    "platformCommission": 68.00,
    "netPayout": 364.90,
    "walletBalance": 664.90,
    "nextPayout": {
      "amount": 664.90,
      "scheduledDate": "2026-02-24T00:00:00.000Z",
      "schedule": "weekly"
    }
  }
}
```

### Frontend Implementation:
- **Gross Revenue Card:** Display `data.grossRevenue`.
- **Commission Card:** Display `data.platformCommission` (as a deduction/negative value).
- **Processing Card:** If applicable, display processing fees or use `data.processingOrders`. (Note: Currently `platformCommission` includes fee logic).
- **Net Payout Card:** Display `data.netPayout`.
- **Next Payout Section:** Display `data.nextPayout.amount` and format `data.nextPayout.scheduledDate` (e.g., "Feb 24, 2026").

---

## 2. Payout History & Transaction Logs
**Endpoint:** `GET /api/v1/operator-analytics/payout-history?page=1&limit=10&storeId=<opt>&status=<opt>&month=<opt>&year=<opt>`

Returns a paginated list of payout transactions. 
- **Filters Available:** 
  - `storeId`: (Optional) If provided, shows **Order Revenue** for that specific store.
  - `status`: (Optional) Filter by payout status (e.g., `PAID`, `PENDING`).
  - `month`: (Optional) 1-indexed month (1-12).
  - `year`: (Optional) 4-digit year (e.g., 2026).

### Response Data Structure:
```json
{
  "success": true,
  "meta": { "total": 45, "totalPages": 5, "page": 1, "limit": 10 },
  "data": [
    {
      "transactionId": "tx_...",
      "amount": 945.20,
      "type": "WITHDRAWAL",
      "note": "Payout of $945.20",
      "orderNumber": null,
      "payoutStatus": "PAID",
      "createdAt": "2026-03-12T10:00:00Z",
      "withdrawalId": "wd_..."
    }
  ]
}
```

### Frontend Implementation:
- **Table Columns:** Map `createdAt` to "Date", `amount` to "Gross/Net", `payoutStatus` to "Status" (use pills/badges), and `note` or `orderNumber` to the details column.

---

## 3. Monthly Revenue Chart
**Endpoint:** `GET /api/v1/operator-analytics/revenue-chart?filter=3|6|12&storeId=<optional>`

Returns time-series data for the revenue chart.

### Response Data Structure:
```json
{
  "success": true,
  "data": {
    "filter": "last 3 months",
    "data": [
      { "month": "Jan 2026", "revenue": 1200.50 },
      { "month": "Feb 2026", "revenue": 1450.00 },
      { "month": "Mar 2026", "revenue": 980.75 }
    ]
  }
}
```

### Frontend Implementation:
- **Chart Axis:** Use `data[].month` for X-axis and `data[].revenue` for Y-axis.

---

## 4. Top Selling Services
**Endpoint:** `GET /api/v1/operator-analytics/top-services?limit=10&storeId=<optional>`

Provides performance metrics for individual services managed by the operator.

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    {
      "serviceId": "svc_...",
      "serviceName": "Standard Delivery",
      "totalOrders": 85,
      "completedOrders": 82,
      "completionRate": 96.47
    }
  ]
}
```

---

## Authentication
- **Role:** Required `OPERATOR`.
- **Header:** `Authorization: Bearer <token>`
- **Identity:** The `operatorId` is automatically resolved from the token.
