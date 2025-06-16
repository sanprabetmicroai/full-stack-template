#!/bin/bash
set -e

PROJECT_ID="template-app-1749923296"
REGION="us-central1"
SERVICE_NAME="kars-backend"

# Read secrets from backend/.env and update Secret Manager
echo "Setting up secrets from backend/.env..."
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  # Remove possible quotes
  value="${value%\"}"
  value="${value#\"}"
  # Convert key to lowercase and replace underscores with hyphens for secret name
  secret_name=$(echo "$key" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
  # Create or update secret
  gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1 \
    || gcloud secrets create "$secret_name" --replication-policy="automatic" --project="$PROJECT_ID"
  echo -n "$value" | gcloud secrets versions add "$secret_name" --data-file=- --project="$PROJECT_ID"
done < backend/.env

# Build and deploy backend
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="FIREBASE_PROJECT_ID=firebase-project-id:latest,FIREBASE_PRIVATE_KEY_ID=firebase-private-key-id:latest,FIREBASE_PRIVATE_KEY=firebase-private-key:latest,FIREBASE_CLIENT_EMAIL=firebase-client-email:latest,FIREBASE_CLIENT_ID=firebase-client-id:latest,FIREBASE_CLIENT_CERT_URL=firebase-client-cert-url:latest,TWILIO_ACCOUNT_SID=twilio-account-sid:latest,TWILIO_AUTH_TOKEN=twilio-auth-token:latest,TWILIO_PHONE_NUMBER=twilio-phone-number:latest,JWT_SECRET=jwt-secret:latest,GEMINI_API_KEY=gemini-api-key:latest,OPENAI_API_KEY=openai-api-key:latest" \
  --timeout=300 \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 