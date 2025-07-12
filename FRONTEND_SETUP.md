# 🚀 Frontend Setup Guide

## 📋 Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Google OAuth Configuration
# Get your Client ID from: https://console.cloud.google.com/
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## 🔐 Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email)
5. **Create OAuth 2.0 Client ID**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:5174
     ```
   - Add authorized redirect URIs:
     ```
     http://localhost:5173
     http://localhost:5174
     ```
6. **Copy the Client ID** and add it to your `.env` file

## 🚀 Start Development Server

```bash
cd frontend
npm install
npm run dev
```

## 🔍 Troubleshooting

- Check browser console for Google OAuth errors
- Verify Client ID is correct in `.env` file
- Ensure authorized origins include your domain
- Check if Google+ API is enabled
- Verify OAuth consent screen is configured

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Documentation](https://www.npmjs.com/package/@react-oauth/google) 