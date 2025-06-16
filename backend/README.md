# Kars Backend API

The backend API service for the Kars Project Management System, built with Node.js and Express.

## Features

- Express.js REST API
- Firebase Admin SDK Integration
- Twilio Integration for OTP
- JWT Authentication
- Environment-based Configuration

## Getting Started

### Local Development

1. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   JWT_SECRET=your_jwt_secret
   ```

2. Set up Firebase Admin SDK:
   - Generate a service account key from Firebase Console
   - Save it as `firebase-service-account.json` in the project root
   - Or set the JSON content as an environment variable:
     ```env
     FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
     ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Production Deployment (Google Cloud Run)

1. Build the Docker image:
   ```bash
   docker build -t gcr.io/[PROJECT_ID]/kars-backend .
   ```

2. Push to Google Container Registry:
   ```bash
   docker push gcr.io/[PROJECT_ID]/kars-backend
   ```

3. Deploy to Cloud Run with environment variables:
   ```bash
   gcloud run deploy kars-backend \
     --image gcr.io/[PROJECT_ID]/kars-backend \
     --platform managed \
     --region us-central1 \
     --set-env-vars "NODE_ENV=production" \
     --set-env-vars "FRONTEND_URL=https://your-frontend-url.run.app" \
     --set-env-vars "TWILIO_ACCOUNT_SID=your_sid" \
     --set-env-vars "TWILIO_AUTH_TOKEN=your_token" \
     --set-env-vars "TWILIO_PHONE_NUMBER=your_phone" \
     --set-env-vars "JWT_SECRET=your_secret" \
     --set-env-vars "FIREBASE_SERVICE_ACCOUNT=your_service_account_json"
   ```

   Note: For better security, use Secret Manager for sensitive values:
   ```bash
   gcloud run deploy kars-backend \
     --image gcr.io/[PROJECT_ID]/kars-backend \
     --platform managed \
     --region us-central1 \
     --set-env-vars "NODE_ENV=production" \
     --set-env-vars "FRONTEND_URL=https://your-frontend-url.run.app" \
     --update-secrets="TWILIO_ACCOUNT_SID=twilio-sid:latest" \
     --update-secrets="TWILIO_AUTH_TOKEN=twilio-token:latest" \
     --update-secrets="TWILIO_PHONE_NUMBER=twilio-phone:latest" \
     --update-secrets="JWT_SECRET=jwt-secret:latest" \
     --update-secrets="FIREBASE_SERVICE_ACCOUNT=firebase-sa:latest"
   ```

### Firebase Integration

This service uses Firebase Admin SDK to interact with:
- Firestore Database
- Cloud Storage

Make sure the service account has the necessary permissions for these services.

## API Documentation

[Add your API documentation here]

## License

This project is licensed under the MIT License. 