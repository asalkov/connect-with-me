# API Connection Setup Guide

## Current Issue
The frontend is trying to connect to the API but getting 404 errors because:
- No `.env` file is configured
- Backend might not be running

## Solution Options

### Option 1: Use Production API (Recommended)

1. **Create `.env` file** in the `frontend` directory:
```bash
# In frontend directory
echo "VITE_API_URL=https://hhyeoj2gd1.execute-api.us-east-1.amazonaws.com" > .env
```

2. **Restart the dev server**:
```bash
npm run dev
```

The frontend will now connect to your deployed Lambda API!

---

### Option 2: Use Local Backend

1. **Start the backend** (in a separate terminal):
```bash
cd backend
npm run start:dev
```

2. **Create `.env` file** in the `frontend` directory:
```bash
# In frontend directory
echo "VITE_API_URL=http://localhost:3000" > .env
```

3. **Restart the dev server**:
```bash
npm run dev
```

---

## Quick Fix (Use Production API)

Run this command in PowerShell from the `frontend` directory:

```powershell
"VITE_API_URL=https://hhyeoj2gd1.execute-api.us-east-1.amazonaws.com" | Out-File -FilePath .env -Encoding utf8
```

Then restart your dev server with `npm run dev`.

---

## Verify Connection

After setting up, you should see:
- ✅ No 404 errors in console
- ✅ User search works in "New Conversation" modal
- ✅ Conversations load successfully
- ✅ Messages can be sent

---

## API Endpoints

Your production API is at:
```
https://hhyeoj2gd1.execute-api.us-east-1.amazonaws.com
```

Available endpoints:
- `/api/auth/login` - Login
- `/api/auth/register` - Register
- `/api/conversations` - Conversations CRUD
- `/api/messages` - Messages CRUD
- `/api/users/search` - Search users

---

## Troubleshooting

### Still getting 404 errors?
1. Check if `.env` file exists: `Test-Path .env`
2. Check file contents: `Get-Content .env`
3. Restart dev server completely (Ctrl+C, then `npm run dev`)

### CORS errors?
The backend should already have CORS configured for CloudFront.
If you see CORS errors, the backend needs to allow your local dev server:
```
FRONTEND_URL=http://localhost:5173
```

### Authentication errors?
Make sure you're logged in:
1. Go to `/login`
2. Login with your test user
3. Navigate back to `/chat`

---

## Current Status

**Frontend**: ✅ Built and ready
**Backend**: ✅ Deployed to Lambda
**Connection**: ❌ Needs `.env` configuration

**Next Step**: Create the `.env` file with the production API URL!
