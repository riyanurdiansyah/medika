# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up Firebase Cloud Messaging in your Next.js application.

## Prerequisites

1. Firebase project with Cloud Messaging enabled
2. Firebase Admin SDK service account key
3. VAPID key for web push notifications

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Firebase Config (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Installation

1. Install Firebase dependencies:
```bash
npm install firebase firebase-admin
```

2. Update the service worker configuration in `public/firebase-messaging-sw.js` with your Firebase config.

## Usage

### 1. Basic FCM Request Form

Navigate to `/fcm` to access the FCM request form where you can:
- Send notifications to individual devices
- Send notifications to topics
- Send notifications to multiple devices
- Manage topic subscriptions
- Configure advanced notification options

### 2. Using the FCM Hook

```tsx
import { useFCM } from 'src/hooks/useFCM'

const MyComponent = () => {
  const {
    isInitialized,
    hasPermission,
    currentToken,
    sendNotification,
    subscribeToTopic
  } = useFCM()

  const handleSendNotification = async () => {
    const success = await sendNotification({
      to: 'device_token_here',
      notification: {
        title: 'Hello!',
        body: 'This is a test notification'
      }
    })
    
    if (success) {
      console.log('Notification sent successfully')
    }
  }

  return (
    <div>
      <p>FCM Initialized: {isInitialized ? 'Yes' : 'No'}</p>
      <p>Permission: {hasPermission ? 'Granted' : 'Not Granted'}</p>
      <p>Token: {currentToken || 'Not available'}</p>
      <button onClick={handleSendNotification}>Send Notification</button>
    </div>
  )
}
```

### 3. Using the FCM Service Directly

```tsx
import fcmNotificationService from 'src/services/fcmNotificationService'

// Initialize FCM
await fcmNotificationService.initialize()

// Request permission
const hasPermission = await fcmNotificationService.requestPermission()

// Get device token
const token = await fcmNotificationService.getToken()

// Send notification
const success = await fcmNotificationService.sendNotification({
  to: token,
  notification: {
    title: 'Test',
    body: 'Test notification'
  }
})
```

## API Endpoints

### POST /api/fcm/send
Send a push notification.

**Request Body:**
```json
{
  "to": "device_token",
  "notification": {
    "title": "Notification Title",
    "body": "Notification Body",
    "icon": "https://example.com/icon.png",
    "clickAction": "https://example.com"
  },
  "data": {
    "key": "value"
  },
  "priority": "high"
}
```

### POST /api/fcm/subscribe
Subscribe a device to a topic.

**Request Body:**
```json
{
  "token": "device_token",
  "topic": "topic_name"
}
```

### POST /api/fcm/unsubscribe
Unsubscribe a device from a topic.

**Request Body:**
```json
{
  "token": "device_token",
  "topic": "topic_name"
}
```

## Features

### 1. Multiple Target Types
- **Single Token**: Send to a specific device
- **Topic**: Send to all devices subscribed to a topic
- **Multiple Tokens**: Send to multiple devices at once

### 2. Advanced Options
- **Priority**: Set notification priority (normal/high)
- **Time to Live**: Set how long the message should be kept if device is offline
- **Collapse Key**: Group similar messages
- **Delay While Idle**: Only send when device is active

### 3. Additional Data
- Attach custom data to notifications
- Data is available when the notification is clicked

### 4. Topic Management
- Subscribe/unsubscribe devices to topics
- Send notifications to topic subscribers

## Service Worker

The service worker (`public/firebase-messaging-sw.js`) handles:
- Background message reception
- Notification display
- Click handling
- Action buttons

## Security Considerations

1. **Server-side validation**: Always validate notification requests on the server
2. **Rate limiting**: Implement rate limiting for notification sending
3. **User consent**: Always request user permission before sending notifications
4. **Token management**: Securely store and manage device tokens

## Troubleshooting

### Common Issues

1. **"FCM is not supported"**
   - Ensure you're using HTTPS in production
   - Check if the browser supports FCM

2. **"Permission denied"**
   - User must explicitly grant notification permission
   - Check browser notification settings

3. **"Failed to send notification"**
   - Verify Firebase Admin SDK credentials
   - Check if the device token is valid
   - Ensure the target device is online

4. **Service worker not loading**
   - Verify the service worker is in the `public` directory
   - Check browser console for errors
   - Ensure HTTPS is used in production

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('fcm-debug', 'true')
```

## Testing

1. **Local Testing**: Use the FCM request form at `/fcm`
2. **Device Testing**: Test on actual devices, not just browser dev tools
3. **Background Testing**: Test notifications when the app is in the background
4. **Topic Testing**: Test topic-based notifications

## Best Practices

1. **User Experience**
   - Request permission at appropriate times
   - Provide clear value proposition for notifications
   - Allow users to easily unsubscribe

2. **Performance**
   - Batch notifications when possible
   - Use topics for broad messaging
   - Implement proper error handling

3. **Content**
   - Keep titles short and descriptive
   - Use action-oriented language
   - Include relevant data for deep linking

4. **Analytics**
   - Track notification delivery rates
   - Monitor click-through rates
   - Analyze user engagement patterns 