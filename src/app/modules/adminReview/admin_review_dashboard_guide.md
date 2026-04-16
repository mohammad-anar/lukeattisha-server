# Admin Reviews & Feedback Dashboard Guide

This guide provides details on the new Admin Review module APIs implemented to match the "Customer Reviews & Feedback" dashboard design.

## 1. Review Summary Stats (Top Cards)
**Endpoint:** `GET /api/v1/admin-review/stats`

### Response Data Structure:
```json
{
  "success": true,
  "data": {
    "overallRating": 4.6,
    "totalReviews": 2847,
    "positiveReviews": 2156,
    "negativeReviews": 284
  }
}
```

## 2. Reviews by Rating (Bar Chart)
**Endpoint:** `GET /api/v1/admin-review/rating-chart`

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    { "rating": "5 Stars", "count": 1600 },
    { "rating": "4 Stars", "count": 556 },
    { "rating": "3 Stars", "count": 407 },
    { "rating": "2 Stars", "count": 216 },
    { "rating": "1 Star", "count": 68 }
  ]
}
```

## 3. Rating Trend (Area/Line Chart)
**Endpoint:** `GET /api/v1/admin-review/trend-chart`
- Returns daily average rating for the last 15 days.

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    { "date": "Dec 1", "rating": 4.2 },
    { "date": "Dec 2", "rating": 4.5 }
    // ... up to present day
  ]
}
```

## 4. Recent Reviews Table
**Endpoint:** `GET /api/v1/review`
- This is the standard review listing API.

### Table Mapping:
- **Review ID:** `id`
- **Customer:** `user.name`
- **Rating:** `rating` (Use for stars)
- **Comment:** `comment`
- **Service:** `service.service.name` or `bundle.bundle.name`
- **Store:** `service.store.name` or `bundle.store.name`
- **Date:** `createdAt`

## 5. Top 10 Operators by Rating
**Endpoint:** `GET /api/v1/admin-review/top-operators`

### Response Data Structure:
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "operatorName": "Mike's Laundry",
      "avgRating": 4.9,
      "totalReviews": 542,
      "positive": 520,
      "negative": 22
    }
    // ... top 10
  ]
}
```

---

## Authentication
- Requires **Admin** or **Super Admin** JWT Token.
- Header: `Authorization: Bearer <token>`
