# Operator Reviews & Ratings Dashboard Guide

This guide provides details on the APIs to implement the "Reviews & Ratings" dashboard for operators.

## 1. Review Summary & Distribution (Top Cards)
**Endpoint:** `GET /api/v1/review/stats`
**Query Params:** `operatorId` (Required)

### Response Data Structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review stats fetched successfully",
  "data": {
    "averageRating": 3.9,
    "totalReviews": 10,
    "distribution": [
      { "rating": 5, "count": 5 },
      { "rating": 4, "count": 2 },
      { "rating": 3, "count": 1 },
      { "rating": 2, "count": 1 },
      { "rating": 1, "count": 1 }
    ]
  }
}
```

### Frontend Implementation:
- **Your Rating Card:** Display `data.averageRating`. Use `data.totalReviews` for the "Based on X reviews" text.
- **Rating Distribution Card:** Map the `data.distribution` array to the progress bars. The `count` is the absolute number shown on the right.

---

## 2. Review List (Feed)
**Endpoint:** `GET /api/v1/review`
**Query Params:**
- `operatorId`: (Required) To filter reviews for this operator.
- `storeServiceId`: (Optional) To filter by specific service.
- `storeBundleId`: (Optional) To filter by specific bundle.
- `rating`: (Optional) Filter by star rating (e.g. 1, 2, 3, 4, 5).
- `sortBy`: `createdAt`
- `sortOrder`: `desc` (for Newest First) or `asc` (for Oldest First).

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    {
      "id": "xxx",
      "rating": 5,
      "comment": "Excellent service!...",
      "createdAt": "2026-04-14T12:00:00Z",
      "user": {
        "name": "Sarah Johnson",
        "avatar": "url..."
      },
      "service": {
        "service": { "name": "Wash & Fold" }
      },
      "bundle": null
    }
  ]
}
```

### Table/List Mapping:
- **Order ID:** (Note: Review model currently doesn't link directly to Order, usually mapped via Service/Date).
- **Date:** Use `createdAt` (e.g., "2 days ago").
- **Rating:** Use stars based on `rating` field.
- **Service Name:** Display `service.service.name` or `bundle.bundle.name`.

---

## Authentication
- Header: `Authorization: Bearer <token>`
