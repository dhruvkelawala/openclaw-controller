# OpenClaw Controller

A voice and remote approval companion for OpenClaw — receive push notifications for actions requiring approval, tap to approve/reject with biometric authentication.

## Features

- 🔐 **Secure Authentication**: Face ID / Touch ID required before approving/rejecting actions
- 🔔 **Push Notifications**: Real-time alerts for pending approvals
- 📱 **iOS Optimized**: Built specifically for iOS with native look and feel
- ⏱️ **Expiry Awareness**: Visual countdown for time-sensitive actions
- 📜 **History**: Track all your past approvals and rejections

## Tech Stack

- **Expo SDK 54**
- **Expo Router** (file-based routing)
- **Zustand** (state management)
- **Expo Notifications** (push notifications via APNs)
- **Expo Secure Store** (device token storage in iOS Keychain)
- **Expo Local Authentication** (Face ID / Touch ID)
- **NativeWind** (Tailwind CSS for React Native)
- **React Native** 0.81

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Xcode (for iOS development)
- iOS Simulator or physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/dhruvkelawala/openclaw-controller.git
cd openclaw-controller

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

### Running on iOS Simulator

```bash
pnpm ios
```

### Running on Physical Device

1. Update `app.json` with your Expo project ID
2. Run `pnpm start` and scan the QR code with Expo Go

## Architecture

### Folder Structure

```
app/
  _layout.tsx          # Root layout with navigation setup
  index.tsx            # Pending approvals list (home screen)
  approval/[id].tsx    # Approval detail screen
  history.tsx          # History of past approvals/rejections
  settings.tsx         # Settings and configuration
components/
  ApprovalCard.tsx     # Card component for approval items
  ActionButtons.tsx    # Approve/Reject buttons with biometric auth
hooks/
  useAuth.ts           # Device token management and registration
  usePushNotifications.ts  # Push notification handling
  useApprovals.ts      # Approval actions and backend integration
store/
  approvalsStore.ts    # Zustand store for approval state
types/
  index.ts             # TypeScript type definitions
```

### Authentication Flow

1. **First Launch**: Generate random UUID device token
2. **Secure Storage**: Store token in iOS Keychain via `expo-secure-store`
3. **Backend Registration**: POST token to `/devices/register`
4. **Authenticated Requests**: Include token in all API calls via `X-Device-Token` header
5. **Biometric Gate**: Face ID / Touch ID required before approving/rejecting

### Push Notification Flow

```
Backend ──→ APNs ──→ Device
                      ↓
              Notification Received
                      ↓
              Extract Action Data
                      ↓
              Add to Pending Approvals
                      ↓
              User Taps Notification
                      ↓
              Navigate to Detail Screen
                      ↓
              Biometric Auth
                      ↓
              Approve/Reject
```

## API Endpoints

The app communicates with the OpenClaw backend at `https://openclaw-prod.tailbc93c6.ts.net`:

- `GET /pushcut/status` — List pending approvals for device
- `POST /devices/register` — Register device token
- `POST /approve` — Approve an action (`{token, actionId}`)
- `POST /reject` — Reject an action (`{token, actionId}`)

## Configuration

### app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.dhruvkelawala.openclaw-controller"
    },
    "plugins": [
      "expo-router",
      ["expo-notifications", { /* config */ }]
    ]
  }
}
```

## Development

### Linting

```bash
pnpm lint
```

### Building for Production

```bash
# Build for iOS
expo build:ios

# Or use EAS
eas build --platform ios
```

## Next Steps

- [ ] Add notification categories with action buttons (Approve/Reject from notification)
- [ ] Implement background sync for pending approvals
- [ ] Add haptic feedback for actions
- [ ] Support for multiple device tokens per user
- [ ] Web companion app
- [ ] Android support

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a PR.

---

Built with ❤️ for the OpenClaw ecosystem