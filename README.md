# Kars - Full Stack Application Template

A modern full-stack application template built with React/Next.js frontend and Node.js backend, featuring Firebase authentication, Twilio integration, and AI capabilities.

## Features

- 🔐 Firebase Authentication
- 📱 Twilio SMS Integration
- 🤖 AI Integration (OpenAI & Gemini)
- 🔄 Real-time Updates
- 📱 Responsive Design
- 🔒 Secure API Endpoints
- 🎨 Modern UI/UX
- 📦 Monorepo Structure
- 🔍 TypeScript Support

## Project Structure

```
├── frontend/          # Next.js frontend application
├── backend/          # Node.js backend application
├── shared/           # Shared types and utilities
├── deploy-backend.sh # Backend deployment script
└── deploy-frontend.sh # Frontend deployment script
```

## Prerequisites

- Node.js (v18 or higher)
- Google Cloud Platform account
- Firebase account
- Twilio account (for SMS features)
- OpenAI API key (for AI features)
- Gemini API key (for AI features)

## Environment Setup

### Backend Environment Variables
Create a `backend/.env` file with:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=your-client-cert-url
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

### Frontend Environment Variables
Create a `frontend/.env` file with:
```
BACKEND_URL=your-backend-url
```

## Development

1. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. Start development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm run dev
   ```

## Deployment

1. Make deployment scripts executable:
   ```bash
   chmod +x deploy-backend.sh
   chmod +x deploy-frontend.sh
   ```

2. Deploy backend:
   ```bash
   ./deploy-backend.sh
   ```

3. Deploy frontend:
   ```bash
   ./deploy-frontend.sh
   ```

## Resource Configuration

### Backend Service
- CPU: 1
- Memory: 512Mi
- Min instances: 0
- Max instances: 10
- Timeout: 300 seconds
- Port: 8080

### Frontend Service
- CPU: 1
- Memory: 512Mi
- Min instances: 0
- Max instances: 10
- Timeout: 300 seconds
- Port: 8080

## Security

- Environment variables are stored in GCP Secret Manager
- JWT-based authentication
- Firebase security rules
- Rate limiting on API endpoints
- CORS configuration
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 