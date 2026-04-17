# Flutter Frontend Implementation Guide: Support Tickets & Chat

This guide outlines how to implement the Support Ticket and Real-time Chat system in your Flutter application based on the current backend architecture.

## 1. Required Packages

Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  socket_io_client: ^2.0.3
  http: ^1.1.0
  shared_preferences: ^2.2.1
  provider: ^6.0.5 # Or your preferred state management
```

## 2. API Endpoints

You will interact with these REST endpoints for the ticket and room metadata:

- **Create Ticket:** `POST /api/v1/support-tickets`
- **Get Tickets:** `GET /api/v1/support-tickets` (Contains `chatRooms` in the response)
- **Get Messages:** `GET /api/v1/chats/:roomId/messages` (Assuming standard chat routes)
- **Get Chat Rooms:** `GET /api/v1/chats/rooms`

## 3. Socket.IO Service Implementation

Create a singleton service to manage the WebSocket connection. The backend uses specific events: `register`, `join-room`, `leave-room`, `send-message`, and listens for `new-message`.

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  IO.Socket? socket;
  
  // Stream to broadcast new messages to the UI
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;

  factory SocketService() {
    return _instance;
  }

  SocketService._internal();

  void initSocket(String userId, String token) {
    socket = IO.io('YOUR_BACKEND_URL', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'extraHeaders': {
        'Authorization': 'Bearer $token' 
      }
    });

    socket!.connect();

    socket!.onConnect((_) {
      print('Connected to Socket');
      // 1. Register with the user's ID upon connection
      socket!.emit('register', userId);
    });

    socket!.on('new-message', (data) {
      print('New message received: $data');
      _messageController.add(Map<String, dynamic>.from(data));
    });

    socket!.onDisconnect((_) => print('Disconnected from Socket'));
  }

  void joinRoom(String roomId) {
    if (socket != null && socket!.connected) {
      socket!.emit('join-room', roomId);
    }
  }

  void leaveRoom(String roomId) {
    if (socket != null && socket!.connected) {
      socket!.emit('leave-room', roomId);
    }
  }

  void sendMessage(String roomId, String senderId, String content) {
    if (socket != null && socket!.connected) {
      // Use send-live-support-message if chatting with live support
      // Use send-message for normal chat
      socket!.emit('send-message', {
        'roomId': roomId,
        'senderId': senderId,
        'content': content,
      });
    }
  }

  void dispose() {
    socket?.disconnect();
    socket?.dispose();
    _messageController.close();
  }
}
```

## 4. Workflow: Creating a Ticket & Joining Chat

When the user creates a support ticket, the backend automatically generates a `ChatRoom` and `ChatParticipant`. Here is the Flutter workflow:

### Step A: Create Ticket via HTTP

```dart
Future<Map<String, dynamic>?> createTicket(String subject, String description) async {
  final response = await http.post(
    Uri.parse('YOUR_BACKEND_URL/api/v1/support-tickets'),
    headers: {
      'Authorization': 'Bearer $YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'subject': subject,
      'description': description,
    }),
  );

  if (response.statusCode == 201) {
    final responseBody = jsonDecode(response.body);
    // The backend returns the created chatRoom in the response:
    // responseBody['data']['chatRoom']['id'] // Use this ID for chatting
    return responseBody['data']; 
  }
  return null;
}
```

### Step B: The Chat Screen

When navigating to the chat screen, pass the `roomId` obtained when creating the ticket or retrieved from the ticket details.

```dart
class SupportChatScreen extends StatefulWidget {
  final String roomId;
  final String currentUserId;

  const SupportChatScreen({Key? key, required this.roomId, required this.currentUserId}) : super(key: key);

  @override
  _SupportChatScreenState createState() => _SupportChatScreenState();
}

class _SupportChatScreenState extends State<SupportChatScreen> {
  final SocketService _socketService = SocketService();
  final TextEditingController _msgController = TextEditingController();
  List<Map<String, dynamic>> messages = [];
  late StreamSubscription _messageSubscription;

  @override
  void initState() {
    super.initState();
    // 1. Fetch initial messages from REST API
    _fetchPreviousMessages();

    // 2. Join the Socket.io room
    _socketService.joinRoom(widget.roomId);

    // 3. Listen for incoming live messages
    _messageSubscription = _socketService.messageStream.listen((message) {
      if (message['roomId'] == widget.roomId) {
        setState(() {
          messages.add(message);
        });
      }
    });
  }

  Future<void> _fetchPreviousMessages() async {
    // Implement standard HTTP GET for /chats/:roomId/messages
    // setState(() { messages = fetchedMessages; });
  }

  @override
  void dispose() {
    _messageSubscription.cancel();
    _socketService.leaveRoom(widget.roomId);
    _msgController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_msgController.text.trim().isEmpty) return;

    // Use socket to emit the message event
    _socketService.sendMessage(
      widget.roomId, 
      widget.currentUserId, 
      _msgController.text.trim()
    );

    _msgController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Support Task: ${widget.roomId}')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final msg = messages[index];
                final isMe = msg['senderId'] == widget.currentUserId;
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: EdgeInsets.all(8.0),
                    padding: EdgeInsets.all(12.0),
                    color: isMe ? Colors.blue[100] : Colors.grey[200],
                    child: Text(msg['content'] ?? ''),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: InputDecoration(hintText: 'Type a message...'),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: _sendMessage,
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
```

## 5. Troubleshooting (Why it might not be working)

1. **Room ID extraction:** Make sure you are using the correct `roomId`. When calling the `POST /api/v1/support-tickets` endpoint, the `id` of the `chatRoom` object returned inside `data` must be passed to `socket.emit('join-room', roomId)` and `socket.emit('send-message', { roomId : ... })`. Make sure you aren't passing the `ticketId` as the `roomId`.
2. **Socket Prefix:** Note that the backend registers `socket.join("room:${roomId}")` under the hood. You don't need to pass the prefix `room:` from Flutter - just pass the raw UUID for the `roomId`. The backend automatically attaches `room:` in `socketHelper.ts`.
3. **Register Event:** Emitting the `register` event (with the user's UUID) upon connection is *crucial* before attempting to join rooms or send messages.
