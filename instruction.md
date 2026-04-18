# Store Operational Settings API Documentation

This document outlines the API endpoints for managing store operational settings.

## Base URL
`/api/v1/stores` (Assuming v1 and /api based on common patterns)

## Endpoints

### 1. Fetch Operational Settings
Retrieve the current operational settings for a specific store. Only the operator who owns the store can access this.

- **URL**: `/:storeId/operational-settings`
- **Method**: `GET`
- **Auth**: Required (`OPERATOR` role)
- **Response**:
    - **Code**: 200 OK
    - **Content**:
      ```json
      {
        "success": true,
        "statusCode": 200,
        "message": "Operational settings fetched successfully",
        "data": {
          "id": "cm...abc",
          "operatorId": "cm...def",
          "pauseNewOrders": false,
          "dailyCapacityLimit": 25,
          "blackoutDates": [],
          "serviceRadius": 5.0
        }
      }
      ```

### 2. Update Operational Settings
Update the operational settings for a specific store. Only the operator who owns the store can perform this action.

- **URL**: `/:storeId/operational-settings`
- **Method**: `PATCH`
- **Auth**: Required (`OPERATOR` role)
- **Body**:
    - `pauseNewOrders` (Boolean, optional)
    - `dailyCapacityLimit` (Number, optional)
    - `blackoutDates` (Array of ISO Date strings, optional)
    - `serviceRadius` (Number, optional)
- **Example Body**:
  ```json
  {
    "pauseNewOrders": true,
    "dailyCapacityLimit": 50,
    "blackoutDates": ["2026-12-25", "2027-01-01"],
    "serviceRadius": 10.5
  }
  ```
- **Response**:
    - **Code**: 200 OK
    - **Content**:
      ```json
      {
        "success": true,
        "statusCode": 200,
        "message": "Operational settings updated successfully",
        "data": {
          "id": "cm...abc",
          "pauseNewOrders": true,
          ...
        }
      }
      ```

## Frontend Integration Tips
- Use the `GET` endpoint when the operator selects a store in the "Operational Controls" dashboard.
- Display the `pauseNewOrders` as a toggle switch.
- Display `dailyCapacityLimit` as a number input.
- For `blackoutDates`, use a calendar-based multi-date picker. Sent the dates as format `YYYY-MM-DD`.
- `serviceRadius` can be a numeric input field with a "KM" suffix.
- Ensure the `Authorization` header includes the Bearer token for the operator.
