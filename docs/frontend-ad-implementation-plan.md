# Frontend Implementation Plan — Ad & AdSubscription Modules

This document outlines the frontend implementation plan for integrating with the Ad and AdSubscription modules based on the backend services and routes.

## 1. Module Overview

| Module | Purpose | Main Actions |
| :--- | :--- | :--- |
| **Ad Subscription** | To manage subscription plans for ads. | Checkout session, Buy plan, View active plans. |
| **Ad Management** | Promotes specific services or bundles. | Create Ad, View My Active Ad, Update Ad, Delete Ad. |

---

## 2. API Reference

### Ad Subscription Plan Module

#### `GET /adsubscriptionplan/`
- **Description**: Lists all available ad subscription plans for operators to choose from.
- **Auth Required**: No
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "meta": { "total": 3, "page": 1, "limit": 10 },
      "data": [
        {
          "id": "string",
          "name": "string",
          "price": 29.99,
          "durationMonth": 1
        }
      ]
    }
  }
  ```

---

### Ad Subscription Module

#### `POST /adsubscription/checkout-session`
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

#### `POST /adsubscription/cancel/:id`
- **Description**: Cancels an active ad subscription.
- **Effects**: 
  - Sets subscription status to `CANCELLED`.
  - Sets all linked active Ads to `EXPIRED`.
  - Sets operator `isSubscribed` to `false`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "AdSubscription cancelled successfully",
    "data": { "id": "string", "status": "CANCELLED", ... }
  }
  ```

#### `GET /adsubscription/`
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

#### `GET /ad/my-active-ad`
- **Description**: Fetches the operator's currently active ad.
- **Auth Required**: Yes — `OPERATOR`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "status": "ACTIVE",
      "operatorId": "string",
      "storeService": {
        "id": "string",
        "service": { "name": "string", "image": "string" }
      },
      "storeBundle": null,
      "subscription": {
        "id": "string",
        "status": "ACTIVE",
        "startDate": "...",
        "endDate": "..."
      }
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
    "data": { "id": "string", "storeServiceId": "...", "storeBundleId": "..." }
  }
  ```

#### `DELETE /ad/:id`
- **Description**: Deletes an ad. This allows an operator to delete an active ad and create a new one while their subscription is still active.
- **Auth Required**: Yes — `OPERATOR`, `ADMIN`, `SUPER_ADMIN`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Ad deleted successfully"
  }
  ```

### Supporting Endpoints (For Selectors)

#### `GET /storeservice/operator/:operatorId`
- **Description**: Fetches all services owned by a specific operator. Used in the "Promote a Service" dropdown.
- **Response**: Array of StoreService objects with nested Service details.

#### `GET /storebundle/operator/:operatorId`
- **Description**: Fetches all bundles owned by a specific operator. Used in the "Promote a Bundle" dropdown.
- **Response**: Array of StoreBundle objects with nested Bundle details.

---

## 3. Frontend Workflow (Operator Perspective)

### A. Subscribing to a Plan
1. **List Plans**: Call `GET /adsubscriptionplan/` to fetch available plan options.
2. **Select & Pay**: When the user clicks "Buy Plan":
   - Call `POST /adsubscription/checkout-session` with the chosen `planId`.
   - Redirect the user to the `url` provided in the response.
3. **Success/Cancel**: After payment, Stripe redirects to the configured return URLs. The frontend should handle these routes to show success/error toasts.
4. **Subscription Management**:
   - Call `POST /adsubscription/cancel/:id` to stop the subscription.
   - UI should reflect that ads are now `EXPIRED` and the operator is no longer subscribed.

### B. Managing Ad
1. **View Active Ad**: Call `GET /ad/my-active-ad`. This shows the currently running ad, utilizing the subscription's active timeframe (`startDate` to `endDate`).
2. **Switching Ad**: Operators can delete an active ad by calling `DELETE /ad/:id`. They can then freely create a new ad (`POST /ad/`) utilizing the same remaining subscription time.

### C. Creating an Ad
1. **Pre-check**: Ensure the operator does not currently have an active ad (`GET /ad/my-active-ad` returns null).
2. **Populate Selectors**:
   - Call `GET /storeservice/operator/:operatorId` for the Service dropdown.
   - Call `GET /storebundle/operator/:operatorId` for the Bundle dropdown.
3. **Submit** `POST /ad/` with `storeServiceId` or `storeBundleId`:
   - If `data.type === 'PAYMENT_REQUIRED'` → redirect to `data.checkoutUrl`.
   - Otherwise → show success toast, the ad starts running using the current subscription's timeframe.

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

1. **AdPlanCard**: Displays plan name, price, duration, and "Buy" button.
2. **AdPromotionCard**: Discovery feed card (User view) with distance badge.
3. **AdManagementCard**: Operator card showing active ad (`GET /ad/my-active-ad`) and actions (Edit, Delete, Cancel Subscription).
4. **PromotionForm**: Form to select a Store Service or Store Bundle to promote.

---

## 6. Implementation Checklist

- [ ] Implement Geolocation service to get user coords.
- [ ] Create API hooks for Ad and AdSubscription modules.
- [ ] Handle Stripe redirect return routes (Success/Cancel).
- [ ] Build 'Create Ad' modal with Service/Bundle selection.
- [ ] Build 'Discovery' page/section showcasing ads sorted by distance.
