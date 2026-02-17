# GaiaQuest API Documentation

## Base URL
```
http://localhost:3000/api
```

## Table of Contents
1. [Modules & Lessons](#modules--lessons)
2. [XP & Progression](#xp--progression)
3. [Quests](#quests)
4. [Authentication](#authentication)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Modules & Lessons

### GET /modules
Get all modules with their lessons.

**Request:**
```http
GET /api/modules
```

**Response (200):**
```json
{
  "ok": true,
  "modules": [
    {
      "id": "waste-mgmt",
      "title": "Waste Management",
      "description": "Learn about reducing, reusing, and recycling waste.",
      "icon": "♻️",
      "color": "from-green-500 to-emerald-600",
      "xpReward": 150,
      "lessons": [
        {
          "id": "lesson-waste-1",
          "title": "3Rs Foundation",
          "type": "quiz",
          "xpReward": 50,
          "questions": [
            {
              "id": "q1",
              "text": "Which of the following is the most effective way to handle waste?",
              "options": [
                { "id": "a", "text": "Reduce at the source", "correct": true },
                { "id": "b", "text": "Burn it in a furnace", "correct": false },
                { "id": "c", "text": "Dump it in landfill", "correct": false },
                { "id": "d", "text": "Export it overseas", "correct": false }
              ],
              "explanation": "Reducing waste at the source is the most effective strategy."
            }
          ]
        }
      ]
    }
  ]
}
```

**Errors:**
- `500`: Internal server error - Check server logs

---

### GET /modules/:id
Get a single module by ID.

**Request:**
```http
GET /api/modules/waste-mgmt
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Module ID (e.g., "waste-mgmt") |

**Response (200):**
```json
{
  "ok": true,
  "module": {
    "id": "waste-mgmt",
    "title": "Waste Management",
    "description": "Learn about reducing, reusing, and recycling waste.",
    "icon": "♻️",
    "xpReward": 150,
    "lessons": [...]
  }
}
```

**Errors:**
- `404`: Module not found
- `500`: Internal server error

---

### GET /modules/lesson/:lessonId
Get a single lesson by ID with all quiz questions.

**Request:**
```http
GET /api/modules/lesson/lesson-waste-1
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| lessonId | string | Lesson ID (e.g., "lesson-waste-1") |

**Response (200):**
```json
{
  "ok": true,
  "lesson": {
    "id": "lesson-waste-1",
    "title": "3Rs Foundation",
    "type": "quiz",
    "xpReward": 50,
    "questions": [
      {
        "id": "q1",
        "text": "Which of the following is the most effective way to handle waste?",
        "options": [
          { "id": "a", "text": "Reduce at the source", "correct": true },
          { "id": "b", "text": "Burn it in a furnace", "correct": false }
        ],
        "explanation": "Reducing waste at the source..."
      }
    ]
  },
  "module": {
    "id": "waste-mgmt",
    "title": "Waste Management",
    "icon": "♻️"
  }
}
```

**Errors:**
- `404`: Lesson not found
- `500`: Internal server error

---

## XP & Progression

### GET /xp/:userId
Get user's XP balance and history.

**Request:**
```http
GET /api/xp/u1
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Response (200):**
```json
{
  "ok": true,
  "userId": "u1",
  "xpBalance": 450,
  "level": 3,
  "history": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "amount": 50,
      "reason": "quiz_completed",
      "moduleId": "waste-mgmt"
    },
    {
      "timestamp": "2024-01-15T09:15:00Z",
      "amount": 100,
      "reason": "photo_completed",
      "moduleId": "waste-mgmt"
    }
  ]
}
```

**Errors:**
- `404`: User not found
- `500`: Internal server error

---

### POST /xp/add
Add XP to a user's account.

**Request:**
```http
POST /api/xp/add
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "u1",
  "amount": 50,
  "reason": "quiz_completed",
  "moduleId": "waste-mgmt",
  "success": true
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |
| amount | number | Yes | XP amount to add |
| reason | string | No | Reason for XP (e.g., "quiz_completed", "photo_completed") |
| moduleId | string | No | Module ID that contributed XP |
| success | boolean | No | Whether the action was successful |

**Response (200):**
```json
{
  "ok": true,
  "userId": "u1",
  "xpAdded": 50,
  "newBalance": 500,
  "newLevel": 3,
  "message": "XP added successfully"
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Unauthorized
- `404`: User not found
- `500`: Internal server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/xp/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "u1",
    "amount": 50,
    "reason": "quiz_completed",
    "moduleId": "waste-mgmt"
  }'
```

---

## Quests

### GET /quests
Get all available quests.

**Request:**
```http
GET /api/quests
```

**Response (200):**
```json
[
  {
    "id": "q-1",
    "title": "Litter Patrol - Park",
    "description": "Find litter in the park and log it with a photo or coords.",
    "points": 20,
    "location": { "lat": 12.9716, "lng": 77.5946 },
    "tags": ["litter", "local"]
  },
  {
    "id": "q-2",
    "title": "Plant a Native Tree",
    "description": "Plant a native sapling and submit a photo + short note.",
    "points": 50,
    "location": null,
    "tags": ["planting", "community"]
  }
]
```

---

### GET /quests/:userId
Get user's quest submissions and history.

**Request:**
```http
GET /api/quests/u1
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Response (200):**
```json
{
  "ok": true,
  "userId": "u1",
  "submissions": [
    {
      "id": "sub-1",
      "questId": "lesson-waste-1",
      "type": "quiz",
      "xp": 50,
      "timestamp": "2024-01-15T10:30:00Z",
      "score": 85
    }
  ]
}
```

---

### POST /quests/submit
Submit a quest completion.

**Request:**
```http
POST /api/quests/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "u1",
  "questId": "lesson-waste-1",
  "type": "quiz",
  "xp": 50,
  "score": 85
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID |
| questId | string | Yes | Quest or lesson ID |
| type | string | Yes | Type: "quiz", "photo", "location" |
| xp | number | Yes | XP earned |
| score | number | No | Score percentage (0-100) |

**Response (200):**
```json
{
  "ok": true,
  "submission": {
    "id": "sub-1",
    "questId": "lesson-waste-1",
    "type": "quiz",
    "xp": 50,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "message": "Quest submitted successfully"
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Unauthorized
- `404`: User or quest not found
- `500`: Internal server error

---

## Authentication

### POST /auth/signup
Register a new user.

**Request:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "ecowarrior",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username |
| email | string | Yes | User email |
| password | string | Yes | Password (min 8 chars) |

**Response (201):**
```json
{
  "ok": true,
  "userId": "u1",
  "username": "ecowarrior",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "User registered successfully"
}
```

**Errors:**
- `400`: Invalid input or user already exists
- `500`: Internal server error

---

### POST /auth/login
Login user.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Response (200):**
```json
{
  "ok": true,
  "userId": "u1",
  "username": "ecowarrior",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "xpBalance": 450,
  "level": 3
}
```

**Errors:**
- `400`: Invalid credentials
- `404`: User not found
- `500`: Internal server error

---

### GET /auth/verify
Verify authentication token.

**Request:**
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer token |

**Response (200):**
```json
{
  "ok": true,
  "userId": "u1",
  "username": "ecowarrior",
  "email": "user@example.com"
}
```

**Errors:**
- `401`: Invalid or expired token
- `403`: Unauthorized
- `500`: Internal server error

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| MISSING_FIELDS | 400 | Required fields are missing |
| INVALID_INPUT | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| SERVER_ERROR | 500 | Internal server error |

---

## Examples

### Complete Quiz Flow

1. **Fetch lesson with questions:**
```javascript
const response = await axios.get('/api/modules/lesson/lesson-waste-1');
const { lesson, module } = response.data;
```

2. **Answer quiz and calculate score:**
```javascript
const answers = {
  'q1': 'a',
  'q2': 'b',
  'q3': 'a'
};

const correctAnswers = lesson.questions.filter(q => 
  answers[q.id] === q.options.find(o => o.correct).id
).length;

const percentage = Math.round((correctAnswers / lesson.questions.length) * 100);
const xpReward = Math.round((percentage / 100) * lesson.xpReward);
```

3. **Submit completion:**
```javascript
await axios.post('/api/quests/submit', {
  userId: localStorage.getItem('userId'),
  questId: lesson.id,
  type: 'quiz',
  xp: xpReward,
  score: percentage
});
```

4. **Add XP:**
```javascript
await axios.post('/api/xp/add', {
  userId: localStorage.getItem('userId'),
  amount: xpReward,
  reason: 'quiz_completed',
  moduleId: module.id
});
```

### Fetch User Progress

```javascript
// Get all modules
const modulesRes = await axios.get('/api/modules');
const modules = modulesRes.data.modules;

// Get XP balance
const xpRes = await axios.get(`/api/xp/${userId}`);
const userXP = xpRes.data.xpBalance;

// Calculate progress
const completedLessons = JSON.parse(
  localStorage.getItem('completedLessons') || '[]'
);
const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
const progress = Math.round((completedLessons.length / totalLessons) * 100);
```

---

## Rate Limiting

Currently no rate limiting is implemented. Production deployments should:
- Limit to 100 requests per minute per IP
- Implement exponential backoff for retries
- Cache responses with ETag support

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Backend)
- Production domains (configured in environment)

---

## Versioning

Current API version: **v1**

Future versions will maintain backward compatibility with v1 endpoints.

---

**Last Updated**: 2024
**API Stability**: Production Ready
**Support**: GaiaQuest Development Team
