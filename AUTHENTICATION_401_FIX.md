# 401 Unauthorized Error - Authentication Fix

## 🔴 Root Cause Analysis

### The Problem
```
GET http://localhost:8000/api/website/69aaa... 401 (Unauthorized)
GET http://localhost:8000/api/user/current 401 (Unauthorized)
```

### Why This Happened
1. **useGetCurrentUser.jsx** was NOT sending Authorization header
   - Only used `withCredentials: true` for cookies
   - Token wasn't being sent to backend
   - Backend's isAuth middleware couldn't find token

2. **Token Storage Confusion**
   - Backend sends token both as httpOnly cookie AND in response body
   - Frontend stored token in localStorage but didn't always send it in headers
   - Not all API calls were including the Authorization header

### Backend's isAuth Middleware
```javascript
// Checks BOTH:
1. req.cookies.token (from httpOnly cookie)
2. req.headers.authorization (Bearer token from header)
```

---

## ✅ Fixes Applied

### Fix #1: useGetCurrentUser.jsx
**Before:**
```javascript
// ❌ Missing Authorization header!
const response = await axios.get(`${serverUrl}/api/user/current`, {
  withCredentials: true,  // Only sends cookies
});
```

**After:**
```javascript
// ✅ Get token from localStorage AND send in header
const userDataLocal = localStorage.getItem("user");
const token = userDataLocal ? JSON.parse(userDataLocal)?.token : null;

if (!token) {
  console.log("❌ No token found in localStorage");
  dispatch(clearUser());
  return;
}

const response = await axios.get(`${serverUrl}/api/user/current`, {
  headers: {
    Authorization: `Bearer ${token}`  // ✅ Send token
  },
  withCredentials: true,  // ✅ Also send cookies
});
```

### Fix #2: PreviewPage.jsx
**Added:**
- ✅ Check if token exists before API call
- ✅ Better error messages with status codes
- ✅ Handle 401 by redirecting to login
- ✅ Content-Type header for clarity
- ✅ Detailed logging for debugging

```javascript
if (!token) {
  console.error("❌ No token found in localStorage");
  alert("Authentication required. Please login first.");
  navigate("/");
  return;
}
```

---

## 🔄 Complete Authentication Flow

### 1. User Logs In (Google Auth)
```
User clicks "Sign in with Google"
    ↓
Frontend sends: POST /api/auth/google
Backend creates user + generates JWT token
Backend response:
  - Sets httpOnly cookie: token=jwt_value
  - Returns in body: { token: "jwt_value", user: { ... } }
    ↓
Frontend stores in localStorage: 
  {
    "user": {
      "_id": "...",
      "name": "...",
      "token": "jwt_value"
    }
  }
```

### 2. Subsequent API Calls
```
Frontend retrieves token from localStorage
Sends in Authorization header:
  Authorization: Bearer jwt_value
    ↓
Backend isAuth middleware:
  1. Gets token from header
  2. Verifies JWT signature
  3. Finds user by ID
  4. Continues to route handler
    ↓
✅ API call succeeds with 200 OK
```

### 3. Token Included in Both Ways
```javascript
// Method 1: Authorization Header
axios.get(url, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// Method 2: HttpOnly Cookie (sent automatically)
// No need to do anything - browser sends cookies automatically
// with withCredentials: true

// Method 3: Both (Most Secure)
axios.get(url, {
  headers: {
    Authorization: `Bearer ${token}`
  },
  withCredentials: true
})
```

---

## 🧪 Verification Steps

### Step 1: Check if Token is Stored
**In browser DevTools → Application → localStorage:**
```json
{
  "user": {
    "_id": "user_id_here",
    "name": "User Name",
    "email": "user@email.com",
    "avatar": "...",
    "credits": 100,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

✅ If token exists → localStorage setup is correct
❌ If token missing → Login didn't work properly

### Step 2: Check Network Requests
**In browser DevTools → Network tab:**

**Request Headers:**
```
GET /api/website/69aaa... HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Authorization header present → Good!
❌ Authorization header missing → Hook not sending token

**Response:**
```
HTTP/1.1 200 OK
{
  "success": true,
  "website": { ... }
}
```

✅ Status 200 → Authorized!
❌ Status 401 → Token invalid or missing

### Step 3: Check Browser Console Logs
**Expected logs:**
```
✅ User loaded: John Doe
✅ Website loaded successfully
📡 Fetching website: 69aaa...
```

**Error logs:**
```
❌ No token found in localStorage
❌ Fetch error: 401 Unauthorized
❌ Session expired. Please login again.
```

### Step 4: Test API Directly
Using curl to test backend:
```bash
# Get token first (from localStorage)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test endpoint with token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/user/current

# Should return user data:
# { "user": { "_id": "...", "name": "...", ... } }
```

---

## 🔍 Troubleshooting Decision Tree

### Symptom: 401 Unauthorized on every request

**Q1: Is token in localStorage?**
1. Open DevTools → Application → Storage → localStorage
2. Look for "user" key
3. If missing → User never logged in or login failed

**Q2: Does token look valid?**
1. Copy token from localStorage
2. Go to https://jwt.io
3. Paste token in "Encoded" field
4. Check payload has `id` field
5. If payload shows `id` → Token is valid format

**Q3: Is Authorization header being sent?**
1. Open DevTools → Network tab
2. Make API request
3. Click on the request
4. Check "Request Headers"
5. Look for `Authorization: Bearer ...`
6. If missing → Frontend not sending header properly

**Q4: Is CORS configured correctly?**
1. Check backend index.js for:
   ```javascript
   cors({
     origin: "http://localhost:5173",  // ✅ Must match frontend port
     credentials: true                  // ✅ Required for cookies/headers
   })
   ```
2. If origin is wrong → Requests rejected

---

## 🛠️ Backend Checklist

- [ ] JWT_SECRET is set in .env
- [ ] CORS has credentials: true
- [ ] CORS origin matches frontend port
- [ ] isAuth middleware checks both cookies and headers
- [ ] Token is being generated in auth controller
- [ ] Token is returned in response body

---

## 🖥️ Frontend Checklist

- [ ] Token stored in localStorage after login
- [ ] useGetCurrentUser sends Authorization header
- [ ] PreviewPage sends Authorization header
- [ ] All API calls use `withCredentials: true`
- [ ] Token is retrieved before API calls
- [ ] Error handling navigates to login on 401

---

## 🚀 After Fixes Applied

### Expected Behavior

1. **After Login**
   - Token in localStorage ✅
   - Redirects to Dashboard ✅
   - Can view websites ✅

2. **When Opening Preview**
   - Fetches website data ✅
   - Loads chat history ✅
   - Shows website code ✅

3. **When Sending Chat Message**
   - Message saved to MongoDB ✅
   - Page refresh shows message ✅
   - No 401 errors ✅

### Test Flow
```
1. Clear localStorage (logout)
2. Click "Sign in with Google"
3. Verify token in localStorage
4. Click on website to preview
5. Should load without 401 error
6. Send chat message
7. Refresh page
8. Message should persist
```

---

## 📋 Files Modified

- ✅ **useGetCurrentUser.jsx**: Added Authorization header
- ✅ **PreviewPage.jsx**: Better error handling & logging
- ✅ **isAuth.js**: Already checking both cookie and header methods

## Summary

The 401 errors were caused by the frontend **not consistently sending the Authorization header**. The fix ensures all API calls include the token from localStorage in the Authorization header, matching what the backend's isAuth middleware expects.

Key lesson: Always include Authorization headers for protected routes, don't rely only on cookies!
