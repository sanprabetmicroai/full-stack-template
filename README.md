# Kars - Full Stack Application Template

A modern full-stack application template built with React/Next.js frontend and Node.js backend, featuring Firebase authentication, Twilio integration, and AI capabilities.

**Repository**: https://github.com/sanprabetmicroai/full-stack-template

## Features

- 🔐 Firebase Authentication
- 📱 Twilio SMS Integration
- 🤖 AI Integration (OpenAI & Gemini)
- 📧 SendGrid Email Integration
- 🔄 Real-time Updates
- 📱 Responsive Design
- 🔒 Secure API Endpoints
- 🎨 Modern UI/UX
- 📦 Monorepo Structure
- 🔍 TypeScript Support

## Project Structure

```
├── frontend/          # React/Vite frontend application
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
- SendGrid account (for email features)

## Getting the Repository

1. Clone the repository:
   ```bash
   git clone https://github.com/sanprabetmicroai/full-stack-template.git
   cd full-stack-template
   ```

2. Check the current remote:
   ```bash
   git remote -v
   ```

3. The repository should be connected to:
   ```
   origin  https://github.com/sanprabetmicroai/full-stack-template.git (fetch)
   origin  https://github.com/sanprabetmicroai/full-stack-template.git (push)
   ```

## Environment Setup

### Backend Environment Variables
Create a `backend/.env` file with:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=your-client-cert-url

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# JWT Configuration
JWT_SECRET=your-jwt-secret

# AI Services Configuration
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-sender-email
```

### Frontend Environment Variables
Create a `frontend/.env` file with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Production Environment Variables
Create a `frontend/.env.production` file with:

```env
# API Configuration
VITE_API_URL=https://your-backend-url.run.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Environment Variable Management

### Adding New Environment Variables

When adding new environment variables to the project, follow these steps:

1. **Backend Variables**:
   - Add the variable to `backend/.env` with a placeholder value
   - Update this README.md with the new variable in the Backend Environment Variables section
   - Update `deploy-backend.sh` to include the new variable in Secret Manager
   - Update `backend/README.md` if the variable is used in development

2. **Frontend Variables**:
   - Add the variable to `frontend/.env` with a placeholder value
   - Add the variable to `frontend/.env.production` with the production value
   - Update this README.md with the new variable in the Frontend Environment Variables section
   - Update `frontend/README.md` if needed

3. **Security Considerations**:
   - Never commit `.env` files to version control
   - Use Google Cloud Secret Manager for production secrets
   - Prefix frontend variables with `VITE_` for Vite to expose them
   - Use descriptive variable names

### Environment Variable Checklist

When setting up the project, ensure all these variables are configured:

#### Backend Required Variables:
- [ ] `NODE_ENV` - Environment (development/production)
- [ ] `PORT` - Server port
- [ ] `FRONTEND_URL` - Frontend URL for CORS
- [ ] `FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `FIREBASE_PRIVATE_KEY_ID` - Firebase private key ID
- [ ] `FIREBASE_PRIVATE_KEY` - Firebase private key
- [ ] `FIREBASE_CLIENT_EMAIL` - Firebase client email
- [ ] `FIREBASE_CLIENT_ID` - Firebase client ID
- [ ] `FIREBASE_CLIENT_CERT_URL` - Firebase client cert URL
- [ ] `TWILIO_ACCOUNT_SID` - Twilio account SID
- [ ] `TWILIO_AUTH_TOKEN` - Twilio auth token
- [ ] `TWILIO_PHONE_NUMBER` - Twilio phone number
- [ ] `JWT_SECRET` - JWT secret key
- [ ] `GEMINI_API_KEY` - Gemini API key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `SENDGRID_API_KEY` - SendGrid API key
- [ ] `SENDGRID_FROM_EMAIL` - SendGrid verified sender email

#### Frontend Required Variables:
- [ ] `VITE_API_URL` - Backend API URL
- [ ] `VITE_FIREBASE_API_KEY` - Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID

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

2. Set up environment variables (see Environment Setup section above)

3. Start development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
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
- All sensitive data is encrypted in transit and at rest

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 