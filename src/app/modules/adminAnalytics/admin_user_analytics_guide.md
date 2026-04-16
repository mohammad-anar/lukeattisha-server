# Admin User Analytics Implementation Guide

This guide provides details on the new Admin User Analytics APIs implemented to match the requested dashboard design.

## 1. User Stats (Summary Cards)
**Endpoint:** `GET /api/v1/admin-analytics/user-stats`

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User stats fetched successfully",
  "data": {
    "totalUsers": {
      "value": 2847,
      "change": 12.4,
      "direction": "up"
    },
    "activeUsers": {
      "value": 2156,
      "activationRate": 75.7
    },
    "newThisMonth": {
      "value": 184,
      "change": 8.1,
      "direction": "up"
    },
    "suspendedUsers": {
      "value": 37,
      "change": -4.2,
      "direction": "down"
    }
  }
}
```

### Frontend Implementation:
- **Total Users Card:** Display `data.totalUsers.value`. Use `data.totalUsers.change` and `data.totalUsers.direction` for the trend indicator.
- **Active Users Card:** Display `data.activeUsers.value`. Use `data.activeUsers.activationRate` for the subtext.
- **New This Month Card:** Display `data.newThisMonth.value`. Use `data.newThisMonth.change` and `data.newThisMonth.direction` for the trend.
- **Suspended Users Card:** Display `data.suspendedUsers.value`. Use `data.suspendedUsers.change` and `data.suspendedUsers.direction` for the trend.

---

## 2. Users By Role (Bar Chart)
**Endpoint:** `GET /api/v1/admin-analytics/user-roles-chart`

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users by role chart data fetched successfully",
  "data": [
    { "label": "Customers", "count": 2200 },
    { "label": "Operators", "count": 600 },
    { "label": "Admins", "count": 47 }
  ]
}
```

### Frontend Implementation:
- Use a **Bar Chart** (e.g., Recharts, Chart.js).
- **X-Axis:** `label`
- **Y-Axis:** `count`

---

## 3. User Growth Trend (Area Chart)
**Endpoint:** `GET /api/v1/admin-analytics/user-growth-chart`

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User growth chart data fetched successfully",
  "data": [
    { "label": "Jan", "count": 1900 },
    { "label": "Feb", "count": 2050 },
    { "label": "Mar", "count": 2200 },
    ...
    { "label": "Oct", "count": 2847 }
  ]
}
```

### Frontend Implementation:
- Use an **Area Chart** with a gradient fill.
- **X-Axis:** `label`
- **Y-Axis:** `count`
- This chart represents the **cumulative** total of users up to each month, as shown in the requested design.

---

## 4. Revenue Analytics (Stats Cards)
**Endpoint:** `GET /api/v1/admin-analytics/revenue-analytics`
**Query Params:** `operatorId` (Optional)

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Revenue analytics data fetched successfully",
  "data": {
    "successRate": {
      "value": 98.7,
      "change": 8.2,
      "direction": "up"
    },
    "avgOrderValue": {
      "value": 2000.00,
      "change": 4.1,
      "direction": "up"
    }
  }
}
```

---

## 5. Order Volume (Bar Chart)
**Endpoint:** `GET /api/v1/admin-analytics/order-volume-chart`
**Query Params:** `operatorId` (Optional), `month` (Optional), `year` (Optional)

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order volume chart data fetched successfully",
  "data": [
    { "label": "Apr 1", "count": 0 },
    { "label": "Apr 2", "count": 0 },
    ...
    { "label": "Apr 12", "count": 1 },
    { "label": "Apr 13", "count": 2 },
    { "label": "Apr 14", "count": 6 }
  ]
}
```

---

## 6. Payment Success Rate (Donut Chart)
**Endpoint:** `GET /api/v1/admin-analytics/payment-success-chart`
**Query Params:** `operatorId` (Optional)

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment success rate chart data fetched successfully",
  "data": [
    { "label": "Successful", "count": 87, "percentage": 87.0, "color": "#10B981" },
    { "label": "Pending", "count": 5, "percentage": 5.0, "color": "#F59E0B" },
    { "label": "Failed", "count": 8, "percentage": 8.0, "color": "#EF4444" }
  ]
}
```

---

## Authentication & Authorization
- These routes require a valid **JWT Token** in the `Authorization` header.
- Access is restricted to users with `ADMIN` or `SUPER_ADMIN` roles.
- The `operatorId` filter allows refining revenue stats to a specific operator's performance.
