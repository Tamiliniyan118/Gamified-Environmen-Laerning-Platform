# Manual Testing Guide

Quick steps to verify all features work correctly in the browser.

## 1. Start the Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Expected: "GaiaQuest running on http://localhost:3000"

# Terminal 2: Frontend
cd frontend
npm run dev
# Expected: "Local: http://localhost:5173"
```

## 2. Test User Creation & Login

1. Open browser: `http://localhost:5173`
2. Click "Sign Up"
3. Fill in: Name: "Alice", Email: "alice@test.com", Password: "pass123"
4. Click "Sign Up" button
5. ✅ Should redirect to Dashboard showing "Alice" in sidebar

## 3. Test Profile Picture Upload

1. Click Profile button in sidebar
2. Under avatar section, click file picker
3. Select any image from your computer
4. See preview of image
5. Click "Save Picture"
6. ✅ Avatar should appear in sidebar and profile immediately
7. Refresh page (Ctrl+R)
8. ✅ Avatar should still be visible (persisted)

## 4. Test Multi-User Switching

1. Click Logout (bottom of sidebar)
2. ✅ Should redirect to login, sidebar shows default avatar
3. Click "Sign Up"
4. Fill in: Name: "Bob", Email: "bob@test.com", Password: "pass456"
5. Click "Sign Up"
6. ✅ Should show "Bob" in sidebar (different from Alice)
7. Click Profile
8. ✅ Bob has no avatar (Alice's avatar is separate)

## 5. Test Avatar Updates Across Components

1. Logged in as Bob
2. Go to Profile and upload a new avatar (use different image)
3. ✅ Avatar appears in sidebar immediately (no page refresh needed)
4. Go to Dashboard
5. ✅ Avatar still visible in sidebar

## 6. Test Page Persistence

1. Logged in as Bob with avatar visible
2. Press Ctrl+R to refresh page
3. ✅ Bob should still be logged in
4. ✅ Bob's avatar should be visible in sidebar
5. Close browser tab and reopen with same URL
6. ✅ Bob should still be logged in (localStorage)

## 7. Test Logout & Re-login

1. Click Logout
2. ✅ Redirected to login, sidebar shows default avatar
3. Click "Log In"
4. Enter: Email: "alice@test.com", Password: "pass123"
5. ✅ Alice's avatar should appear immediately
6. ✅ It should be the same avatar she uploaded earlier

## 8. Verify localStorage in Developer Tools

1. Open Developer Tools (F12)
2. Go to Application → Local Storage → http://localhost:5173
3. ✅ Should see `token` key with JWT value
4. ✅ Should see `user` key with JSON like:
   ```json
   {
     "id": "u1234567890",
     "name": "Alice",
     "email": "alice@test.com",
     "avatar": "/uploads/pfp/u1234567890-timestamp.jpg",
     "xp": 0,
     "weeklyXp": 0,
     "owned": []
   }
   ```

## 9. Verify userUpdated Event

1. Open Console tab (F12)
2. Paste this code:
   ```javascript
   window.addEventListener('userUpdated', (e) => {
     console.log('userUpdated fired:', e.detail);
   });
   ```
3. Upload a new avatar
4. ✅ Console should show the event with updated user object

## 10. Verify Network Requests

1. Open Network tab (F12)
2. Upload avatar
3. ✅ Should see POST to `/api/user/upload-pfp` with status 200
4. ✅ Response should include `{ ok: true, avatar: "/uploads/pfp/..." }`

## Expected Results

If all 10 tests pass:
- ✅ Multiple users can be created and managed
- ✅ Each user has their own avatar
- ✅ Avatar persists across page refreshes
- ✅ Avatar updates sync across all components
- ✅ Logout clears user data
- ✅ Login/Logout switching works correctly
- ✅ localStorage properly stores state
- ✅ userUpdated event syncs all components

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Avatar doesn't appear | Check Network tab, verify `/uploads/pfp/` request succeeds |
| Avatar disappears on refresh | Check localStorage has `user` key with avatar path |
| Logout doesn't work | Check browser console for errors, verify clearUser() is called |
| Different user shows wrong avatar | Clear localStorage and re-login |
| Upload fails with 401 | Check localStorage has `token` key, verify Authorization header sent |

---

**All features working?** 🎉 Implementation is complete and ready for production!
