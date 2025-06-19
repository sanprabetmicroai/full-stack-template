# Backend Scripts

This directory contains utility scripts for the backend system.

## OTP System

The OTP system has been upgraded to use UUID as the main identifier instead of phone numbers, with support for both email and phone number verification, and a tagging system for different purposes.

### Key Features

- **UUID-based storage**: OTPs are stored using UUID as document ID
- **Tag system**: OTPs include tags for different purposes:
  - `signup` - For new user registration
  - `login` - For existing user authentication  
  - `update_phone` - For updating phone number
  - `update_email` - For updating email address
- **Dual support**: Works with both email and phone number verification
- **Unified API**: Single endpoints that work with both identifier types

### API Usage

#### Send OTP
```bash
POST /api/auth/send-otp
{
  "identifier": "user@example.com" | "+1234567890",
  "identifierType": "email" | "phone",  // Optional, defaults to "phone"
  "tag": "signup" | "login" | "update_phone" | "update_email"
}
```

#### Verify OTP for Sign In
```bash
POST /api/auth/verify-signin
{
  "identifier": "user@example.com" | "+1234567890",
  "identifierType": "email" | "phone",  // Optional, defaults to "phone"
  "otp": "123456"
}
```

#### Verify OTP for Sign Up
```bash
POST /api/auth/verify-signup
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

### Database Schema

OTP documents now have this structure:
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

For more detailed documentation, see `backend/docs/OTP_SYSTEM.md`. 