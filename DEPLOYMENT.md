# Firebase Hosting Deployment Guide

You have switched your hosting preference to Firebase! Here is how to get your site live on your own domain.

## 1. Prerequisites
Make sure you have the Firebase CLI installed on your computer:
```bash
npm install -g firebase-tools
```

## 2. Login to Firebase
In your terminal, run:
```bash
firebase login
```

## 3. Deploy the App
To build your app and push it to Firebase Hosting, simply run:
```bash
npm run deploy
```

## 4. Connect Your Domain
1. Go to the [Firebase Console](https://console.firebase.google.com/project/gen-lang-client-0269311263/hosting/sites).
2. Click **"Add custom domain"**.
3. Follow the instructions to verify ownership and update your DNS records.

## Why this is better:
- **Global CDN:** Your site is served from Google's fastest servers.
- **Free SSL:** Automatic HTTPS for your domain.
- **Atomic Deploys:** If a deploy fails, your old site stays live until the new one is 100% ready.
