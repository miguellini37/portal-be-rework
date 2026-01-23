# Messaging Feature Documentation

This document provides information about the messaging feature, including API endpoints, WebSocket usage, and deployment configuration.

## API Endpoints

### 1. Get Recent Messages
**Endpoint:** `GET /getRecentMessages`

**Description:** Gets the 10 latest messages from the 10 conversations with the most recent message where the TO or FROM user id is the current user's id.

**Authentication:** Required (JWT Token)

**Response:**
```typescript
[
  {
    conversationId: string;
    otherUserId: string;
    otherUserName: string;
    lastMessage: string;
    lastMessageDate: Date;
    unreadCount: number;
  }
]
```

### 2. Get Conversation
**Endpoint:** `GET /getConversation?otherUserId={userId}`

**Description:** Gets all messages between the current user and another user.

**Authentication:** Required (JWT Token)

**Authorization:** Only users who are part of the conversation can access it.

**Query Parameters:**
- `otherUserId` (string, required): The ID of the other user in the conversation

**Response:**
```typescript
{
  messages: [
    {
      id: string;
      conversationId: string;
      fromUserId: string;
      toUserId: string;
      message: string;
      readAt?: Date;
      createdAt: Date;
    }
  ]
}
```

### 3. Send Message
**Endpoint:** `POST /sendMessage`

**Description:** Sends a message to another user.

**Authentication:** Required (JWT Token)

**Request Body:**
```typescript
{
  toUserId: string;
  message: string;
}
```

**Response:**
```typescript
{
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
}
```

### 4. Mark Message as Read
**Endpoint:** `PATCH /markMessageRead`

**Description:** Marks a message as read.

**Authentication:** Required (JWT Token)

**Authorization:** Only the recipient of the message can mark it as read.

**Request Body:**
```typescript
{
  messageId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  readAt: Date;
}
```

## WebSocket Real-Time Messaging

The messaging feature includes WebSocket support for real-time updates. The WebSocket server is accessible at the `/messages` namespace.

### Events

#### Client to Server

**1. subscribe**
Subscribe to receive messages for a specific user.
```typescript
socket.emit('subscribe', { userId: 'user-id' });
```
Response:
```typescript
{
  success: boolean;
  message: string;
  error?: string;
}
```

**2. unsubscribe**
Unsubscribe from receiving messages.
```typescript
socket.emit('unsubscribe', { userId: 'user-id' });
```

#### Server to Client

**1. newMessage**
Emitted when a new message is sent to the user.
```typescript
socket.on('newMessage', (message) => {
  // message contains the full message object
  console.log('New message:', message);
});
```

**2. messageRead**
Emitted when a message sent by the user has been read.
```typescript
socket.on('messageRead', (data) => {
  // data contains messageId and readAt timestamp
  console.log('Message read:', data);
});
```

## React Frontend Example

Here's an example of how to integrate the messaging WebSocket in a React application using Socket.io client:

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
}

interface MessageReadEvent {
  messageId: string;
  readAt: Date;
}

function MessagingComponent() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Get the JWT token from your auth context/store
  const authToken = 'your-jwt-token-here'; // Replace with actual token
  const userId = 'current-user-id'; // Replace with actual user ID

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io('https://your-backend-domain.com', {
      path: '/messages',
      transports: ['websocket', 'polling'],
      auth: {
        token: authToken,
      },
      query: {
        token: authToken,
      },
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);

      // Subscribe to messages for this user
      newSocket.emit('subscribe', { userId }, (response: any) => {
        if (response.success) {
          console.log('Successfully subscribed to messages');
        } else {
          console.error('Subscription failed:', response.error);
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    // Listen for new messages
    newSocket.on('newMessage', (message: Message) => {
      console.log('Received new message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);

      // Optionally, play a notification sound or show a toast
      // showNotification('New message received');
    });

    // Listen for message read events
    newSocket.on('messageRead', (data: MessageReadEvent) => {
      console.log('Message marked as read:', data);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === data.messageId ? { ...msg, readAt: data.readAt } : msg
        )
      );
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket.connected) {
        newSocket.emit('unsubscribe', { userId });
        newSocket.disconnect();
      }
    };
  }, [authToken, userId]);

  const sendMessage = useCallback(
    async (toUserId: string, message: string) => {
      try {
        const response = await fetch('https://your-backend-domain.com/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ toUserId, message }),
        });

        if (response.ok) {
          const sentMessage = await response.json();
          console.log('Message sent:', sentMessage);
          // The WebSocket will also receive this via the newMessage event for the recipient
        } else {
          console.error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [authToken]
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch('https://your-backend-domain.com/markMessageRead', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ messageId }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Message marked as read:', result);
        } else {
          console.error('Failed to mark message as read');
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    },
    [authToken]
  );

  return (
    <div>
      <h2>Messages</h2>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      
      {/* Your messaging UI here */}
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <p>{msg.message}</p>
            <small>
              {msg.readAt ? 'Read' : 'Unread'} - {new Date(msg.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
      </div>

      {/* Example: Send a message */}
      <button onClick={() => sendMessage('recipient-user-id', 'Hello!')}>
        Send Test Message
      </button>
    </div>
  );
}

export default MessagingComponent;
```

### Installing Socket.io Client

To use Socket.io in your React app, install the client library:

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

## CloudFront and EC2 Configuration

Since the backend is hosted on an EC2 instance and accessed through CloudFront (HTTPS), you'll need to configure WebSocket support properly.

### WebSocket Support with CloudFront

CloudFront supports WebSocket connections, but you need to ensure proper configuration:

#### 1. CloudFront Distribution Settings

Make sure your CloudFront distribution has the following settings:

- **Allowed HTTP Methods:** GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache Behavior:**
  - For WebSocket paths (e.g., `/messages/*` or `/socket.io/*`), create a separate cache behavior
  - Set **Cache Policy** to disable caching or use a very short TTL
  - Set **Origin Request Policy** to forward all headers, query strings, and cookies
  - Enable **Compress Objects Automatically** (optional)

Example CloudFront Cache Behavior for WebSocket:
```
Path Pattern: /socket.io/*
Origin: Your EC2 origin
Viewer Protocol Policy: Redirect HTTP to HTTPS
Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
Cache Policy: CachingDisabled (or custom with 0 TTL)
Origin Request Policy: AllViewer
```

#### 2. Security Group Configuration

Ensure your EC2 instance's security group allows:
- Inbound traffic on port 3000 (or your backend port) from CloudFront IP ranges
- Or if using an Application Load Balancer (ALB), allow traffic from the ALB

#### 3. Backend Configuration

The backend is already configured to accept WebSocket connections. Make sure:

1. **CORS is properly configured** (already done in `src/index.ts`)
2. **The backend listens on the correct port** (default: 3000)
3. **The WebSocket gateway is accessible** at `/messages` namespace

#### 4. Environment Variables

Add these environment variables to your EC2 instance if needed:
```bash
PORT=3000
KEYCLOAK_CLIENT_SECRET=your-keycloak-secret
```

#### 5. Nginx Configuration (if using Nginx as reverse proxy)

If you're using Nginx in front of your Node.js application, add WebSocket support:

```nginx
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

### Testing WebSocket Connection

You can test the WebSocket connection using the browser console:

```javascript
const socket = io('https://your-cloudfront-domain.com', {
  path: '/messages',
  auth: { token: 'your-jwt-token' },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
socket.emit('subscribe', { userId: 'your-user-id' });
```

## Database Migration

Before using the messaging feature, run the database migration:

```bash
yarn migration:run
```

This will create the `message` table with the following schema:
- `id` (UUID, Primary Key)
- `conversationId` (VARCHAR)
- `fromUserId` (VARCHAR, Foreign Key to user table)
- `toUserId` (VARCHAR, Foreign Key to user table)
- `message` (TEXT)
- `readAt` (DATETIME, nullable)
- `createdAt` (DATETIME)

Indexes are created on:
- `conversationId`
- `fromUserId`
- `toUserId`
- `createdAt`

## Security Considerations

1. **Authentication:** All WebSocket connections require a valid JWT token
2. **Authorization:** Users can only subscribe to their own messages
3. **Conversation Privacy:** Users can only view conversations they're part of
4. **Message Reading:** Users can only mark their own received messages as read
5. **Token Validation:** ⚠️ **IMPORTANT:** The current implementation decodes JWT tokens without proper verification. In production, you MUST implement proper JWT verification using Keycloak's public key or JWKS endpoint. The current implementation checks token expiration but does not verify the signature.

### Implementing Proper JWT Verification

For production, you should verify JWT tokens against Keycloak's public key. Here's how to do it:

1. **Fetch Keycloak's public key from the JWKS endpoint:**
   ```
   https://<keycloak-domain>/realms/<realm-name>/protocol/openid-connect/certs
   ```

2. **Use a library like `jwks-rsa` to verify tokens:**
   ```bash
   yarn add jwks-rsa
   ```

3. **Update the WebSocket gateway:**
   ```typescript
   import jwksClient from 'jwks-rsa';
   
   const client = jwksClient({
     jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`
   });
   
   function getKey(header, callback) {
     client.getSigningKey(header.kid, (err, key) => {
       const signingKey = key.getPublicKey();
       callback(null, signingKey);
     });
   }
   
   // Then use it with jsonwebtoken
   jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
     if (err) {
       throw new UnauthorizedException('Invalid token');
     }
     // Use decoded payload
   });
   ```

## Best Practices

1. **Reconnection:** The Socket.io client automatically handles reconnection
2. **Error Handling:** Always implement error handlers for WebSocket events
3. **Token Refresh:** If using short-lived tokens, implement token refresh logic
4. **Message Persistence:** All messages are stored in the database
5. **Scalability:** For high-traffic scenarios, consider using Redis adapter for Socket.io to support multiple server instances
