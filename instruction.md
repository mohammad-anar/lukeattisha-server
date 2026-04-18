# Flutter Socket.io Notification Integration Guide

This guide describes how to integrate the real-time notification system into your Flutter application using `socket_io_client`.

## 1. Socket Setup & Registration

First, connect to the Socket server and register the user. Registration is required to receive personal notifications.

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

IO.Socket socket = IO.io('YOUR_SERVER_URL', <String, dynamic>{
  'transports': ['websocket'],
  'autoConnect': false,
});

socket.connect();

socket.onConnect((_) {
  print('Connected to Socket Server');
  // Register the user to receive notifications
  socket.emit('register', userId); 
});
```

## 2. Receiving Real-time Notifications

Listen for the `new-notification` event to receive alerts instantly.

```dart
socket.on('new-notification', (data) {
  print('New Notification Received: ${data['title']}');
  // data contains: id, title, message, type, channel, isRead, etc.
  
  // Update your local state or show a local notification snackbar
  showSnackbar(data['message']);
});
```

## 3. Marking Notification as Read

To mark a specific notification as read via Socket, emit the `mark-notification-as-read` event.

### Emit Event
```dart
void markAsRead(String notificationId, String userId) {
  socket.emit('mark-notification-as-read', {
    'notificationId': notificationId,
    'userId': userId,
  });
}
```

### Confirmation Listener
Listen for `notification-marked-as-read` to confirm the action was successful in the backend.
```dart
socket.on('notification-marked-as-read', (data) {
  print('Notification ${data['notificationId']} updated successfully');
  // Update your local list to set isRead = true for this ID
});
```

## 4. Marking All Notifications as Read

To mark every notification for the current user as read.

### Emit Event
```dart
void markAllAsRead(String userId) {
  socket.emit('mark-all-notifications-as-read', {
    'userId': userId,
  });
}
```

### Confirmation Listener
```dart
socket.on('all-notifications-marked-as-read', (data) {
  print('All notifications marked as read for user ${data['userId']}');
  // Refresh your notification list or update all items locally
});
```

## Summary of Events

| Event Name | Type | Direction | Payload |
|------------|------|-----------|---------|
| `register` | Emit | App -> Server | `userId` (String) |
| `new-notification` | Listen | Server -> App | Notification Object |
| `mark-notification-as-read` | Emit | App -> Server | `{ notificationId, userId }` |
| `notification-marked-as-read` | Listen | Server -> App | `{ notificationId }` |
| `mark-all-notifications-as-read` | Emit | App -> Server | `{ userId }` |
| `all-notifications-marked-as-read`| Listen | Server -> App | `{ userId }` |
