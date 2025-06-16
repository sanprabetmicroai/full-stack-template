# Kars - Project Management System

Kars is a modern and responsive project management system built with React and TypeScript. It provides a highly customizable and easy-to-use platform for managing projects and tasks efficiently.

## Features

- Modern React with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Comprehensive authentication system
- Project and task management
- User management
- Modern and responsive UI
- Dark/Light mode support
- Firebase Integration (Firestore & Storage)

## Getting Started

### Local Development

1. Set up environment variables:
   Create a `.env` file in the frontend directory:

    ```env
    VITE_API_URL=http://localhost:3000/api
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

### Production Deployment (Google Cloud Run)

1. Set up production environment variables:
   Create a `.env.production` file:

    ```env
    VITE_API_URL=https://your-backend-url.run.app
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

2. Build the Docker image:

    ```bash
    docker build -t gcr.io/[PROJECT_ID]/kars-frontend .
    ```

3. Push to Google Container Registry:

    ```bash
    docker push gcr.io/[PROJECT_ID]/kars-frontend
    ```

4. Deploy to Cloud Run:
    ```bash
    gcloud run deploy kars-frontend \
      --image gcr.io/[PROJECT_ID]/kars-frontend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

### Firebase Configuration

This project uses Firebase for:

- Firestore Database
- Cloud Storage

No Firebase Hosting is used as the application is deployed on Google Cloud Run.

## License

This project is licensed under the MIT License.
