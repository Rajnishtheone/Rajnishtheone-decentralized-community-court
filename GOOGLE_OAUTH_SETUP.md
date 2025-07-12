# 🔐 Google OAuth Setup Guide

## 📋 Prerequisites
- Google Cloud Console account
- Domain or localhost for testing

## 🚀 Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "DCC Court"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email for testing)

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `http://localhost:5174` (for development)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - Your production domain

### 4. Get Client ID
1. Copy the generated Client ID
2. Replace `YOUR_GOOGLE_CLIENT_ID` in `frontend/src/main.jsx`

### 5. Environment Variables
Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 🔧 Frontend Configuration

Update `frontend/src/main.jsx`:
```jsx
<GoogleOAuthProvider clientId="YOUR_ACTUAL_CLIENT_ID_HERE">
```

## 🧪 Testing
1. Start your development server
2. Try logging in with Google
3. Check browser console for any errors
4. Verify user creation in database

## 🚨 Important Notes
- For production, use your actual domain
- Keep your Client ID secure
- Test thoroughly before deployment
- Google OAuth requires HTTPS in production

## 🔍 Troubleshooting
- Check browser console for errors
- Verify Client ID is correct
- Ensure authorized origins include your domain
- Check if Google+ API is enabled
- Verify OAuth consent screen is configured

## 📚 Additional Resources
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Documentation](https://www.npmjs.com/package/@react-oauth/google) 