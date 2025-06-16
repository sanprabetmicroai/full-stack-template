#!/bin/bash
set -e

PROJECT_ID="template-app-1749923296"
REGION="us-central1"
SERVICE_NAME="kars-frontend"

cd frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="BACKEND_URL=https://kars-backend-683953774874.us-central1.run.app" \
  --timeout=300 \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=10 \
  --port=8080 