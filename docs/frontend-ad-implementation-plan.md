# Frontend Implementation Plan — Ad & AdSubscription Modules

This document outlines the frontend implementation plan for integrating with the Ad and AdSubscription modules based on the backend services and routes.

## 1. Module Overview

| Module | Purpose | Main Actions |
| :--- | :--- | :--- |
| **Ad Subscription** | To manage subscription plans for ads. | Checkout session, Buy plan, View active plans. |
| **Ad Management** | To promote specific services or bundles. | Create Ad (requires subscription), View Ads, Update Ad, Delete Ad. |

---

## 2. API Reference

### Ad Subscription Module

#### `POST /ad-subscription/checkout-session`
- **Description**: Initiates a Stripe checkout session for a specific plan.
- **Request Body**:
  ```json
  {
    "planId": "string (UUID of the plan)"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Checkout session created",
    "data": {
      "url": "https://checkout.stripe.com/..."
    }
  }
  ```

#### `GET /ad-subscription/`
- **Description**: Fetches all subscription records for the operator.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "meta": {
        "total": 1,
        "totalPage": 1,
        "page": 1,
        "limit": 10
      },
      "data": [
        {
          "id": "string",
          "operatorId": "string",
          "planId": "string",
          "status": "ACTIVE | INACTIVE | EXPIRED",
          "startDate": "ISO String",
          "endDate": "ISO String",
          "createdAt": "ISO String"
        }
      ]
    }
  }
  ```

### Ad Module

#### `POST /ad/`
- **Description**: Creates a new advertisement.
- **Request Body**:
  ```json
  {
    "storeServiceId": "string (optional)",
    "storeBundleId": "string (optional)",
    "planId": "string (required only if no active subscription exists)"
  }
  ```
- **Response (200 OK - Payment Needed)**:
  ```json
  {
    "success": true,
    "data": {
      "type": "PAYMENT_REQUIRED",
      "checkoutUrl": "https://checkout.stripe.com/..."
    }
  }
  ```
- **Response (201 Created - Success)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "operatorId": "string",
      "storeServiceId": "string | null",
      "storeBundleId": "string | null",
      "subscriptionId": "string",
      "status": "ACTIVE",
      "createdAt": "ISO String"
    }
  }
  ```

#### `GET /ad/`
- **Description**: Lists active ads. Supports distance-based sorting if user coordinates are provided.
- **Query Params**: `userLat`, `userLng`, `searchTerm`, `page`, `limit`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "meta": {
        "total": 10,
        "page": 1,
        "limit": 10
      },
      "data": [
        {
          "id": "string",
          "status": "ACTIVE",
          "serviceName": "string | null",
          "serviceImage": "string | null",
          "bundleName": "string | null",
          "bundleImage": "string | null",
          "avgRating": 4.5,
          "totalReviewCount": 12,
          "distanceMile": 2.3, // distance from userLat/userLng
          "operator": {
             "id": "string",
             "user": { "name": "string", "avatar": "string" }
          },
          "store": { 
             "id": "string", 
             "name": "string", 
             "lat": 0, 
             "lng": 0 
          }
        }
      ]
    }
  }
  ```

#### `PATCH /ad/:id`
- **Description**: Update an existing ad.
- **Request Body**:
  ```json
  {
    "status": "ACTIVE | INACTIVE",
    "storeServiceId": "string",
    "storeBundleId": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { "id": "string", ...updatedFields }
  }
  ```



### Supporting Endpoints (For Selectors)

#### `GET /store-services/operator/:operatorId`
- **Description**: Fetches all services owned by a specific operator. Used in the "Promote a Service" dropdown.
- **Response**: Array of StoreService objects with nested Service details.

#### `GET /store-bundles/operator/:operatorId`
- **Description**: Fetches all bundles owned by a specific operator. Used in the "Promote a Bundle" dropdown.
- **Response**: Array of StoreBundle objects with nested Bundle details.

---

## 3. Frontend Workflow (Operator Perspective)

### A. Subscribing to a Plan
1. **List Plans**: Fetch available `AdSubscriptionPlan` options.
2. **Select & Pay**: When the user clicks "Buy Plan":
   - Call `POST /ad-subscription/checkout-session` with the chosen `planId`.
   - Redirect the user to the `url` provided in the response.
3. **Success/Cancel**: After payment, Stripe redirects to the configured return URLs. The frontend should handle these routes to show success/error toasts.

### B. Creating an Ad
1. **Pre-check**: Check if the user has an active subscription.
2. **Setup**: Provide a form to select a **Store Service** or **Store Bundle**.
3. **Submit**:
   - If user has a subscription: Ad is created immediately.
   - If no subscription: The API response will provide a `checkoutUrl`.
   - **Frontend Action**: `if (res.type === 'PAYMENT_REQUIRED') window.location.href = res.checkoutUrl;`

---

## 4. Frontend Workflow (User Perspective)

### A. Browsing Discovery Feed
1. **Identify Location**: Get `latitude` and `longitude` from the browser.
2. **Fetch Ads**: Call `GET /ad/` with `userLat` and `userLng`.
3. **Display**:
   - Show Ad card with Service/Bundle Image and Name.
   - Show Operator Name/Avatar.
   - Show Rating and Review Count.
   - Show Distance in miles (e.g., "1.2 miles away").

---

## 5. UI Components Needed

1. **AdPlanCard**: Displays plan name, price, and "Buy" button.
2. **AdPromotionCard**: The card used in the discovery feed (User view).
3. **AdManagementCard**: Card for operators to see their active ad, status, and "Delete" button.
4. **PromotionForm**: Form for operators to select what they want to promote (Service or Bundle).

---

## 6. Implementation Checklist

- [ ] Implement Geolocation service to get user coords.
- [ ] Create API hooks for Ad and AdSubscription modules.
- [ ] Handle Stripe redirect return routes (Success/Cancel).
- [ ] Build 'Create Ad' modal with Service/Bundle selection.
- [ ] Build 'Discovery' page/section showcasing ads sorted by distance.
