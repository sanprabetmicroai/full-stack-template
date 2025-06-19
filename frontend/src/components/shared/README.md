# Shared Components

This directory contains reusable components that are shared across the application.

## UpdateContactModal

A modal component for updating user email and phone numbers with OTP verification.

### Features

- **Two-step verification process**: First step for entering new contact info, second step for OTP verification
- **Secure OTP-based updates**: Integrates with backend OTP system for secure contact updates
- **Multi-language support**: Fully internationalized with translation keys
- **Responsive design**: Works on both desktop and mobile devices
- **Error handling**: Comprehensive error handling with user-friendly messages
- **Loading states**: Shows loading indicators during API calls

### Usage

```tsx
import UpdateContactModal from '@/components/shared/UpdateContactModal'

// In your component
const [showEmailModal, setShowEmailModal] = useState(false)
const [showPhoneModal, setShowPhoneModal] = useState(false)

// Email update modal
<UpdateContactModal
    isOpen={showEmailModal}
    onClose={() => setShowEmailModal(false)}
    type="email"
    currentValue={user.email}
    userId={user.id}
/>

// Phone update modal
<UpdateContactModal
    isOpen={showPhoneModal}
    onClose={() => setShowPhoneModal(false)}
    type="phone"
    currentValue={user.phoneNumber}
    userId={user.id}
/>
```

### Props

| Prop           | Type                 | Required | Description                    |
| -------------- | -------------------- | -------- | ------------------------------ |
| `isOpen`       | `boolean`            | Yes      | Controls modal visibility      |
| `onClose`      | `() => void`         | Yes      | Callback when modal is closed  |
| `type`         | `'email' \| 'phone'` | Yes      | Type of contact being updated  |
| `currentValue` | `string`             | Yes      | Current email or phone value   |
| `userId`       | `string`             | Yes      | User ID for cache invalidation |

### Backend Integration

The modal integrates with the following backend endpoints:

- `POST /api/auth/request-update-otp` - Request OTP for contact update
- `POST /api/auth/verify-update-otp` - Verify OTP and update contact

### Translation Keys

The component uses the following translation keys:

- `profile.updateContact` - Modal title
- `profile.currentValue` - Current value label
- `profile.newValue` - New value label
- `profile.sendOTP` - Send OTP button
- `profile.enterOTP` - OTP input label
- `profile.verifyAndUpdate` - Verify and update button
- `profile.otpSent` - Success message when OTP is sent
- `profile.otpSentTo` - Message showing where OTP was sent
- And more...

### Security Features

- **Authentication required**: Uses existing auth token
- **OTP expiration**: OTPs expire after 5 minutes
- **Duplicate prevention**: Checks for existing email/phone usage
- **Input validation**: Validates email and phone formats
- **Rate limiting**: Backend handles OTP request limits
