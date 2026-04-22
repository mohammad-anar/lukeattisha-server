# Frontend Implementation Guide: User Subscription Plans

This document outlines the API integration details for the **User Subscription Plans** feature. Use these references to build the corresponding frontend services and UI components for displaying, creating, and managing plans.

## TypeScript Interfaces

```typescript
export interface UserSubscriptionPlan {
  id: string;
  name: string;
  durationMonth: number;
  price: number;
  features: string[]; // Array of strings representing plan features
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  durationMonth: number;
  price: number;
  features?: string[];
}

export interface UpdateSubscriptionPlanPayload {
  name?: string;
  durationMonth?: number;
  price?: number;
  features?: string[];
}
```

## API Endpoints

### 1. Get All Plans
Fetches a list of all available subscription plans. This endpoint is public and does not require authentication, so it can be used on your pricing page.

- **Endpoint**: `GET /api/v1/usersubscriptionplan`
- **Auth Required**: No
- **Response Format**: Array of `UserSubscriptionPlan`

### 2. Get a Single Plan
Fetches the details of a specific subscription plan by its ID.

- **Endpoint**: `GET /api/v1/usersubscriptionplan/:id`
- **Auth Required**: Yes (All authenticated roles: Admin, Super Admin, User, Operator)
- **Response Format**: `UserSubscriptionPlan`

### 3. Create a Plan
Creates a new subscription plan. This is typically used in the Admin dashboard.

- **Endpoint**: `POST /api/v1/usersubscriptionplan`
- **Auth Required**: Yes (Admin / Super Admin)
- **Body**: `CreateSubscriptionPlanPayload`
- **Response Format**: Newly created `UserSubscriptionPlan`

### 4. Update a Plan
Updates an existing subscription plan. You can send a partial payload to update specific fields.

- **Endpoint**: `PATCH /api/v1/usersubscriptionplan/:id`
- **Auth Required**: Yes (Admin / Super Admin)
- **Body**: `UpdateSubscriptionPlanPayload`
- **Response Format**: Updated `UserSubscriptionPlan`

### 5. Delete a Plan
Removes a subscription plan from the system.

- **Endpoint**: `DELETE /api/v1/usersubscriptionplan/:id`
- **Auth Required**: Yes (Admin / Super Admin)
