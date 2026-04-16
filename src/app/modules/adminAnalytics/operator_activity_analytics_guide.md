# Operator Management Analytics Guide

This guide provides details on the new Operator Activity Overview APIs implemented for the admin management dashboard.

## 1. Operator Activity Overview (Summary Cards)
**Endpoint:** `GET /api/v1/admin-analytics/operator-activity`

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operator activity overview fetched successfully",
  "data": {
    "totalOperators": {
      "value": 590,
      "change": 5.2,
      "direction": "up"
    },
    "activeOperators": {
      "value": 487,
      "percentage": 82.5
    },
    "inactiveOperators": {
      "value": 103,
      "percentage": 17.5
    }
  }
}
```

### Frontend Implementation:
- **Total Operators Card:** Display `data.totalOperators.value`. Use `data.totalOperators.change` and `data.totalOperators.direction` for the trend indicator (e.g., "+5.2% from last month").
- **Active Operators Card:** Display `data.activeOperators.value`. Use `data.activeOperators.percentage` for the subtext (e.g., "82.5% online now").
- **Inactive Operators Card:** Display `data.inactiveOperators.value`. Use `data.inactiveOperators.percentage` for the subtext (e.g., "17.5% offline").

---

## Authentication & Authorization
- This route requires a valid **JWT Token** in the `Authorization` header.
- Access is restricted to users with `ADMIN` or `SUPER_ADMIN` roles.
