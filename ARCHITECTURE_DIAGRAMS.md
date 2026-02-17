# Architecture & Data Flow Diagrams

## 1. Component State Synchronization Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCALSTORAGE                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 'token': 'eyJhbGciOi...'                             │   │
│  │ 'user': {id, name, email, avatar, xp, ...}          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
          ┌───────┴──────┬───────────┬────────────┬──────────┐
          │              │           │            │          │
          ▼              ▼           ▼            ▼          ▼
      Login.jsx    Signup.jsx  Dashboard.jsx  Profile.jsx  Sidebar.jsx
      ┌─────┐      ┌──────┐    ┌──────────┐   ┌────────┐  ┌───────┐
      │Saves│      │Saves │    │Reads on  │   │Reads & │  │Reads  │
      │user │      │user  │    │mount     │   │uploads │  │& syncs│
      │+    │      │+     │    │          │   │        │  │       │
      │token│      │token │    │Listens   │   │Listens │  │Avatar │
      │     │      │      │    │to event  │   │to event│  │display│
      └──┬──┘      └──┬───┘    └─────┬────┘   └───┬────┘  └───┬───┘
         │            │              │            │           │
         │            │              │            │           │
         └────────────┼──────────────┼────────────┼───────────┘
                      │              │            │
                      └──────────────┼────────────┘
                                     │
                    ┌────────────────▼──────────────────┐
                    │      CUSTOMEVENT BUS              │
                    │  window.dispatchEvent(           │
                    │    'userUpdated', {               │
                    │      detail: {user}               │
                    │    }                              │
                    │  )                                │
                    └────────────────┬──────────────────┘
                                     │
                    ┌────────────────▼──────────────────┐
                    │   All Listeners Notified          │
                    │   and Re-render with new user     │
                    └─────────────────────────────────────┘
```

## 2. Login Flow Sequence Diagram

```
User              Browser          Backend        localStorage
 │                  │                │                │
 ├─ Enter Email/────→│                │                │
 │   Password        │                │                │
 │                   ├─ POST /login──→│                │
 │                   │                │                │
 │                   │  Find user     │                │
 │                   │  Check password│                │
 │                   │                │                │
 │                   │← {ok, user, token}              │
 │                   │                │                │
 │                   ├─ saveUser()────────────────────→│
 │                   │                │    'user'      │
 │                   │                │                │
 │                   ├─ localStorage.setItem('token')─→│
 │                   │                │    'token'     │
 │                   │                │                │
 │                   ├─ dispatchEvent('userUpdated')   │
 │                   │                │                │
 │                   ├─→ Dashboard    │                │
 │                   │                │                │
 │← Logged in ───────┤                │                │
 │   Sidebar shows   │                │                │
 │   user avatar     │                │                │
```

## 3. Avatar Upload Flow Sequence Diagram

```
User              Browser         Backend        File System      users.json
 │                  │                │                │               │
 ├─ Select file────→│                │                │               │
 │                  ├─ Preview       │                │               │
 │                  │                │                │               │
 ├─ Click Upload───→│                │                │               │
 │                  ├─ FormData      │                │               │
 │                  │  {photo, id}   │                │               │
 │                  ├─ POST /upload──│                │               │
 │                  │                ├─ Verify JWT───┐                │
 │                  │                │   Get userID ◄─┘                │
 │                  │                │                │               │
 │                  │                ├─ Save file────→│               │
 │                  │                │ pfp/user1.jpg  │               │
 │                  │                │                │               │
 │                  │                ├─ Update────────────────────→│
 │                  │                │  avatar path   │       avatar  │
 │                  │                │                │       path    │
 │                  │← {ok, avatar}  │                │               │
 │                  │                │                │               │
 │                  ├─ saveUser()     │                │               │
 │                  │                │                │               │
 │                  ├─ dispatchEvent('userUpdated', {..., avatar})   │
 │                  │                │                │               │
 │← Success ────────┤                │                │               │
 │   Avatar in      │                │                │               │
 │   Sidebar & all  │                │                │               │
```

## 4. Component Dependency Tree

```
App
├── Router
│   ├── Login (uses: saveUser, dispatchEvent)
│   ├── Signup (uses: saveUser, dispatchEvent)
│   ├── Dashboard (uses: getUser, addEventListener)
│   │   └── Sidebar (uses: getUser, addEventListener)
│   ├── Profile (uses: getUser, saveUser, dispatchEvent, axios)
│   │   └── Sidebar (uses: getUser, addEventListener)
│   ├── Leaderboard (uses: addEventListener)
│   │   └── Sidebar (uses: getUser, addEventListener)
│   └── Shop
│       └── Sidebar (uses: getUser, addEventListener)

Shared Services:
├── auth.js (saveUser, getUser, clearUser)
├── axios (HTTP requests)
└── localStorage (state persistence)

External APIs:
├── /api/auth/login
├── /api/auth/signup
├── /api/auth/me
├── /api/user/upload-pfp
└── /uploads/pfp/* (avatar files)
```

## 5. State Update Propagation

```
Event Source                Dispatch             Listeners         Effects
─────────────              ──────────           ─────────         ───────

LOGIN/SIGNUP               dispatchEvent        Dashboard         Re-render
  └─ saveUser()          ('userUpdated',        Sidebar           Show user
  └─ dispatchEvent         {user})              Profile           Update avatar

                          ┌─ All 3              All update        All show
                          │  components          on event          correct user
                          │  listen

LOGOUT                    dispatchEvent         Dashboard         Re-render
  └─ clearUser()          ('userUpdated',       Sidebar           Show default
  └─ removeItem token     null)                 Profile           Redirect
  └─ removeItem user                                              to login

                          ┌─ All receive
                          │  null detail
                          │  and update to
                          │  show logged out

AVATAR UPLOAD             dispatchEvent         Dashboard         Re-render
  └─ saveUser()           ('userUpdated',       Sidebar           Show new
  └─ dispatchEvent        {user, avatar})      Profile           avatar

                          ┌─ All 3              All update        No refresh
                          │  components         immediately       needed!
                          │  listen
```

## 6. Data Flow - Avatar Persistence

```
SCENARIO: User uploads avatar, refreshes page, should still see avatar

Step 1: Upload
  Profile.jsx
    ↓
  axios POST /api/user/upload-pfp {photo, userId}
    ↓
  Backend: Creates /uploads/pfp/user1-12345.jpg
    ↓
  Backend: Updates users.json: user.avatar = "/uploads/pfp/user1-12345.jpg"
    ↓
  Response: {ok: true, avatar: "/uploads/pfp/user1-12345.jpg"}
    ↓
  saveUser({...user, avatar: "/uploads/pfp/user1-12345.jpg"})
    ↓
  localStorage['user'] = {id, name, avatar, ...}
    ↓
  dispatchEvent('userUpdated', {displayAvatar: "/uploads/pfp/user1-12345.jpg?t=123456"})
    ↓
  Sidebar re-renders with new avatar

Step 2: Page Refresh (Ctrl+R)
  Browser loads /dashboard
    ↓
  Dashboard mounts
    ↓
  useState(propUser || getUser())
    ↓
  getUser() → JSON.parse(localStorage['user'])
    ↓
  Returns: {id, name, avatar: "/uploads/pfp/user1-12345.jpg", ...}
    ↓
  Dashboard renders with user
    ↓
  Sidebar mounts
    ↓
  Sidebar.useState(getUser())
    ↓
  Sidebar renders with avatar
    ↓
  Avatar persisted! ✓
```

## 7. Token & User ID Isolation

```
User A                                    User B
│                                         │
├─ Signup/Login ──→ Backend              ├─ Signup/Login ──→ Backend
│                   ├─ Create user A     │                   ├─ Create user B
│                   ├─ ID: u123          │                   ├─ ID: u456
│                   ├─ JWT A             │                   ├─ JWT B
│                   └─→ Return to A      │                   └─→ Return to B
│                                         │
├─ localStorage                          ├─ localStorage
│  'token': JWTА                         │  'token': JWTВ
│  'user': {id: u123}                    │  'user': {id: u456}
│                                         │
├─ Upload avatar ──→ Backend             ├─ Upload avatar ──→ Backend
│  Include: JWTА    ├─ Verify: JWTА      │  Include: JWTВ    ├─ Verify: JWTВ
│                   ├─ Extract userId:   │                   ├─ Extract userId:
│                   │  u123              │                   │  u456
│                   ├─ File: u123.jpg    │                   ├─ File: u456.jpg
│                   ├─ Update user A     │                   ├─ Update user B
│                   └─→ Return to A      │                   └─→ Return to B
│                                         │
├─ Sidebar shows:                        ├─ Sidebar shows:
│  User A avatar                         │  User B avatar
│                                         │
│  User A CANNOT                         │  User B CANNOT
│  see User B's avatar                   │  see User A's avatar
│  because:                               │  because:
│  - Different localStorage              │  - Different localStorage
│  - Different JWT/userID                │  - Different JWT/userID
│  - Files stored separately             │  - Files stored separately
```

## 8. Error Recovery Flow

```
Error Scenario                  Handler                    Result
──────────────                  ───────                    ──────

API call fails                  Profile.jsx catches
  ↓                            .catch(() => {              Fallback to
axios.get('/api/auth/me')       const stored = getUser();   localStorage
  (401 Unauthorized)            if (stored) setUser(stored) data
                                })

localStorage not found          getUser() handles
  ↓                            try/catch on JSON.parse     Returns null
JSON.parse() throws            and returns null            Component
  (corrupted data)                                         shows default

Upload fails (401)              Profile.jsx shows
  ↓                            error alert to user        User informed,
POST /api/user/upload-pfp       finally: setUploading(     can retry
  (missing token)              false)

userUpdated event              Sidebar listens and
  listener unmounts            returns cleanup in         No memory
  before event fires           useEffect()               leaks
```

---

**Architecture Summary**:
- ✅ Decentralized state management using localStorage + CustomEvent
- ✅ No global Redux or Context (keep it simple for learning project)
- ✅ Each component independently reads from localStorage
- ✅ Event-driven updates ensure consistency
- ✅ Graceful fallbacks handle edge cases
- ✅ Token isolation prevents cross-user access
