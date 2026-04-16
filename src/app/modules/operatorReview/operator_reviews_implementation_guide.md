# Operator Reviews Implementation Guide

This guide provides the API details for building the **Operator Reviews Management** page. These endpoints provide the review feeds with advanced filtering and rating statistics.

## Base URL
`/api/v1/operator-review`

## 1. Get Rating Stats
**Endpoint:** `GET /stats?storeId=<optional>`

Returns the "Your Rating" scorecard and "Rating Distribution" chart data.

### Response Data Structure:
```json
{
  "success": true,
  "data": {
    "averageRating": 3.9,
    "totalReviews": 10,
    "distribution": [
      { "rating": 1, "count": 1 },
      { "rating": 2, "count": 1 },
      { "rating": 3, "count": 1 },
      { "rating": 4, "count": 2 },
      { "rating": 5, "count": 5 }
    ]
  }
}
```

---

## 2. Get Reviews Feed
**Endpoint:** `GET /reviews`

Fetches the list of reviews with pagination and filtering.

### Query Parameters:
| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `rating` | string | Filter by star rating. Use `+` for "or higher". | `4`, `3+` |
| `serviceType` | string | Filter by service name. | `Wash & Fold` |
| `sortBy` | string | Field to sort by: `createdAt` or `rating`. | `createdAt` |
| `sortOrder` | string | `asc` or `desc`. | `desc` |
| `page` | number | Page number for pagination. | `1` |
| `limit` | number | Number of items per page. | `10` |

### Sorting Shortcuts:
*   **Newest First:** `sortBy=createdAt&sortOrder=desc`
*   **Oldest First:** `sortBy=createdAt&sortOrder=asc`
*   **Highest Rating:** `sortBy=rating&sortOrder=desc`
*   **Lowest Rating:** `sortBy=rating&sortOrder=asc`

### Response Data Structure:
```json
{
  "success": true,
  "meta": { "page": 1, "limit": 10, "total": 25 },
  "data": [
    {
      "id": "review_id",
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2024-03-24T10:00:00.000Z",
      "user": {
        "name": "Sarah Johnson",
        "avatar": "/path/to/avatar.jpg"
      },
      "service": {
        "service": { "name": "Wash & Fold" },
        "store": { "name": "LaundryLink HQ" }
      }
    }
  ]
}
```

## Authentication
- **Role:** Required `OPERATOR`.
- **Header:** `Authorization: Bearer <token>`
- **Identity:** The `operatorId` is automatically resolved from the token.
