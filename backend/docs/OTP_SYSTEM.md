# OTP System Documentation

## Overview

The OTP (One-Time Password) system has been updated to use UUID as the main identifier instead of phone numbers, with support for both email and phone number verification, and a tagging system for different purposes.

## Key Changes

### 1. UUID-Based Storage
- **Old System**: OTPs were stored using phone number as document ID
- **New System**: OTPs are stored using UUID as document ID with identifier and type fields

### 2. Tag System
OTPs now include tags to identify their purpose:
- `signup` - For new user registration
- `login` - For existing user authentication
- `update_phone` - For updating phone number
- `update_email` - For updating email address

### 3. Dual Support
- Support for both email and phone number verification
- Unified API endpoints that work with both identifier types

## Database Schema

### New OTP Document Structure
```javascript
{
  identifier: "user@example.com" | "+1234567890",  // Email or phone number
  identifierType: "email" | "phone",               // Type of identifier
  otp: "123456",                                   // 6-digit OTP code
  tag: "signup" | "login" | "update_phone" | "update_email", // Purpose tag
  timestamp: Timestamp,                            // When OTP was created
  ttl: Timestamp,                                  // Expiration time (5 minutes)
  attempts: 0                                      // Verification attempts count
}
```

## API Endpoints

### 1. Send OTP
**Endpoint**: `POST /api/auth/send-otp`

**Request Body**:
```javascript
{
  "identifier": "user@example.com" | "+1234567890",
  "identifierType": "email" | "phone",  // Optional, defaults to "phone"
  "tag": "signup" | "login" | "update_phone" | "update_email"
}
```

**Response**:
```javascript
{
  "success": true,
  "message": "Verification code sent successfully",
  "data": {
    "identifier": "user@example.com",
    "identifierType": "email",
    "tag": "signup"
  }
}
```

### 2. Verify OTP for Sign In
**Endpoint**: `POST /api/auth/verify-signin`

**Request Body**:
```javascript
{
  "identifier": "user@example.com" | "+1234567890",
  "identifierType": "email" | "phone",  // Optional, defaults to "phone"
  "otp": "123456"
}
```

### 3. Verify OTP for Sign Up
**Endpoint**: `POST /api/auth/verify-signup`

**Request Body**:
```javascript
{
  "identifier": "user@example.com" | "+1234567890",
  "identifierType": "email" | "phone",  // Optional, defaults to "phone"
  "otp": "123456",
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",        // Optional if identifier is email
    "phoneNumber": "+1234567890"        // Optional if identifier is phone
  }
}
```

### 4. Request Update OTP
**Endpoint**: `POST /api/auth/request-update-otp` (Requires authentication)

**Request Body**:
```javascript
{
  "type": "email" | "phone",
  "value": "new@example.com" | "+1234567890"
}
```

### 5. Verify Update OTP
**Endpoint**: `POST /api/auth/verify-update-otp` (Requires authentication)

**Request Body**:
```javascript
{
  "type": "email" | "phone",
  "value": "new@example.com" | "+1234567890",
  "otp": "123456"
}
```

## Usage Examples

### Email-based Sign Up
```javascript
// 1. Send OTP
const sendResponse = await fetch('/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    identifierType: 'email',
    tag: 'signup'
  })
});

// 2. Verify OTP and create account
const verifyResponse = await fetch('/api/auth/verify-signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    identifierType: 'email',
    otp: '123456',
    userData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      phoneNumber: '+1234567890'  // Optional additional contact
    }
  })
});
```

### Phone-based Login
```javascript
// 1. Send OTP
const sendResponse = await fetch('/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: '+1234567890',
    identifierType: 'phone',
    tag: 'login'
  })
});

// 2. Verify OTP
const verifyResponse = await fetch('/api/auth/verify-signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: '+1234567890',
    identifierType: 'phone',
    otp: '123456'
  })
});
```

### Update Email
```javascript
// 1. Request update OTP
const requestResponse = await fetch('/api/auth/request-update-otp', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'email',
    value: 'new@example.com'
  })
});

// 2. Verify and update
const updateResponse = await fetch('/api/auth/verify-update-otp', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'email',
    value: 'new@example.com',
    otp: '123456'
  })
});
```

## Migration Process

### 1. Run Migration
```bash
cd backend
node scripts/migrateOTP.js
```

### 2. Verify Migration
```bash
node scripts/migrateOTP.js --verify
```

### 3. Cleanup (Optional)
```bash
node scripts/migrateOTP.js --cleanup --confirm
```

## Security Features

1. **TTL (Time To Live)**: OTPs expire after 5 minutes
2. **Attempt Limiting**: Maximum 3 verification attempts per OTP
3. **Automatic Cleanup**: OTPs are deleted after successful verification or expiration
4. **Tag-based Validation**: Each OTP can only be used for its intended purpose

## Error Handling

Common error responses:

```javascript
// Invalid identifier
{
  "success": false,
  "message": "Please provide a valid email address"
}

// Invalid tag
{
  "success": false,
  "message": "Valid tag is required (signup, login, update_phone, update_email)"
}

// OTP expired
{
  "success": false,
  "message": "OTP has expired"
}

// Too many attempts
{
  "success": false,
  "message": "Maximum verification attempts exceeded"
}

// Invalid OTP
{
  "success": false,
  "message": "Invalid OTP"
}
```

## Development Mode

In development mode (`NODE_ENV=development`), OTPs are logged to console instead of being sent:

```javascript
{
  "success": true,
  "message": "Verification code sent successfully (development mode)",
  "data": {
    "identifier": "user@example.com",
    "identifierType": "email",
    "tag": "signup",
    "otp": "123456"  // Only included in development mode
  }
}
```

## Backward Compatibility

The new system maintains backward compatibility for existing phone number-based OTPs during the migration period. However, it's recommended to update frontend code to use the new API structure for better functionality and security. 