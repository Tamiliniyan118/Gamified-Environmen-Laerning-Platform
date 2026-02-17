# GaiaQuest Implementation & Developer Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm 8+
- Git
- Code editor (VS Code recommended)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd gaiaquest

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Docs**: See API_DOCUMENTATION.md

---

## Project Structure

```
gaiaquest/
├── backend/
│   ├── data/
│   │   ├── modules.json          (Module & lesson definitions)
│   │   ├── users.json            (User accounts)
│   │   └── shop.json             (Shop items)
│   ├── routes/
│   │   ├── modules.js            (Module/lesson endpoints)
│   │   ├── xp.js                 (XP tracking)
│   │   ├── quests.js             (Quest submission)
│   │   ├── auth.js               (Authentication)
│   │   └── ... (other routes)
│   ├── utils/
│   │   ├── xai-utils.js          (XAI explanation utilities)
│   │   ├── hash.js               (Password hashing)
│   │   └── ... (other utils)
│   ├── xai/
│   │   └── explainer.js          (Explainable AI logic)
│   ├── local_xai/
│   │   └── service.py            (Python XAI service)
│   ├── server.js                 (Express server)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── pages/
│   │   │   │   ├── LessonQuiz.jsx     (Quiz component - API enabled)
│   │   │   │   ├── Modules.jsx        (Modules list - API enabled)
│   │   │   │   └── ... (other pages)
│   │   │   ├── components/
│   │   │   │   ├── QuizCard.jsx
│   │   │   │   └── ModuleOverview.jsx
│   │   │   └── data/
│   │   │       └── (old data files removed)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          (API enabled)
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ... (other pages)
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── MIGRATION_SUMMARY.md         (Overview of changes)
├── FRONTEND_CHANGES.md          (Frontend-specific changes)
├── API_DOCUMENTATION.md         (Complete API reference)
├── README.md                    (Project overview)
└── package.json                 (Workspace root)
```

---

## Frontend Development

### Component Development Pattern

#### 1. Page Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/endpoint');
        setData(res.data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Component content */}
    </motion.div>
  );
}
```

#### 2. API Communication
```javascript
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 3. State Management with Custom Hook
```javascript
// hooks/useFetchData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useFetchData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(endpoint);
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}

// Usage
const { data: modules, loading, error } = useFetchData('/api/modules');
```

### Styling Guide

#### Tailwind CSS Classes
```javascript
// Utility classes
className="
  // Layout
  flex items-center justify-between
  w-full max-w-3xl mx-auto
  
  // Spacing
  p-6 px-4 py-8
  mb-8 gap-4
  
  // Colors
  text-white text-gray-400
  bg-gray-800 bg-gradient-to-r from-purple-600 to-pink-600
  border border-purple-500/30
  
  // Interactive
  hover:bg-white/10 hover:shadow-lg
  transition-all duration-300
  
  // Responsive
  lg:col-span-2 md:block sm:hidden
"
```

#### Custom CSS (App.css)
```css
/* Define custom animations, color variables, etc. */
:root {
  --primary: #a855f7;
  --secondary: #ec4899;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Animation with Framer Motion
```javascript
import { motion, AnimatePresence } from 'framer-motion';

// Simple animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Staggered children
<motion.div>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>

// Conditional rendering with animations
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## Backend Development

### Express Server Setup
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/modules', require('./routes/modules'));
app.use('/api/xp', require('./routes/xp'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/auth', require('./routes/auth'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Creating New Routes
```javascript
// routes/example.js
const express = require('express');
const router = express.Router();

// GET /api/example
router.get('/', (req, res) => {
  try {
    const data = require('../data/example.json');
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// POST /api/example
router.post('/', express.json(), (req, res) => {
  const { userId, value } = req.body;

  if (!userId || value === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Process request
    res.json({ ok: true, message: 'Success' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

### Working with JSON Data Files
```javascript
const fs = require('fs');
const path = require('path');

// Read
function readData(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Write
function writeData(filename, data) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Update
function updateData(filename, updateFn) {
  const data = readData(filename);
  const updated = updateFn(data);
  writeData(filename, updated);
  return updated;
}

// Usage
const users = readData('users.json');
const updatedUsers = updateData('users.json', (data) => {
  return data.map(user => ({
    ...user,
    xp: user.xp + 50,
  }));
});
```

---

## Database Schema

### Current JSON Structure

#### users.json
```json
[
  {
    "id": "u1",
    "username": "ecowarrior",
    "email": "user@example.com",
    "passwordHash": "hashed_password",
    "xpBalance": 450,
    "level": 3,
    "createdAt": "2024-01-01T00:00:00Z",
    "badges": ["recycler", "water_saver"]
  }
]
```

#### modules.json
```json
[
  {
    "id": "waste-mgmt",
    "title": "Waste Management",
    "description": "Learn about reducing, reusing, and recycling.",
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
            "text": "Question?",
            "options": [
              { "id": "a", "text": "Option A", "correct": true },
              { "id": "b", "text": "Option B", "correct": false }
            ],
            "explanation": "Explanation"
          }
        ]
      }
    ]
  }
]
```

### Future: MongoDB Schema
```javascript
// User Model
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  xpBalance: Number,
  level: Number,
  completedLessons: [String],
  createdAt: Date,
  updatedAt: Date
}

// Module Model
{
  _id: ObjectId,
  id: String,
  title: String,
  description: String,
  lessons: [LessonModel],
  createdAt: Date
}

// Lesson Model (Embedded)
{
  id: String,
  title: String,
  type: String,
  xpReward: Number,
  questions: [QuestionModel]
}
```

---

## Testing Strategy

### Frontend Testing with Vitest/Jest
```javascript
// components/__tests__/LessonQuiz.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonQuiz from '../LessonQuiz';
import axios from 'axios';

jest.mock('axios');

describe('LessonQuiz', () => {
  it('should fetch lesson on mount', async () => {
    axios.get.mockResolvedValue({
      data: {
        lesson: {
          id: 'lesson-1',
          title: 'Test Lesson',
          type: 'quiz',
          questions: []
        },
        module: { id: 'mod-1', title: 'Test Module' }
      }
    });

    render(<LessonQuiz />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
```

### Backend Testing with Jest
```javascript
// routes/__tests__/modules.test.js
const request = require('supertest');
const app = require('../../server');

describe('GET /api/modules', () => {
  it('should return all modules', async () => {
    const res = await request(app).get('/api/modules');
    
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.modules)).toBe(true);
  });
});
```

### E2E Testing with Cypress
```javascript
// cypress/e2e/quiz.cy.js
describe('Quiz Flow', () => {
  it('should complete quiz and earn XP', () => {
    cy.visit('/modules/lesson/lesson-waste-1');
    
    cy.get('[data-testid="quiz-question"]').should('exist');
    
    // Answer questions
    cy.get('[data-testid="option-a"]').click();
    cy.get('[data-testid="next-btn"]').click();
    
    // Check completion
    cy.get('[data-testid="xp-earned"]').should('contain', '+50 XP');
  });
});
```

---

## Debugging Guide

### Browser DevTools
1. **Network Tab**
   - Check API calls and responses
   - Verify status codes (200, 400, 500)
   - Monitor request/response sizes

2. **Console Tab**
   - Check for JavaScript errors
   - View console.log() messages
   - Inspect API error messages

3. **Application Tab**
   - Check localStorage for user data
   - View sessionStorage
   - Monitor IndexedDB

### Server Debugging
```bash
# Add debug logs
DEBUG=express:* npm run dev

# Node inspector
node --inspect server.js
# Then open chrome://inspect

# Console logging in code
console.log('Debug:', data);
console.error('Error:', error);
console.table(data);
```

### Common Errors
```
1. CORS Error
   ✓ Add CORS middleware to Express
   ✓ Whitelist frontend URL

2. 404 API Not Found
   ✓ Check endpoint URL
   ✓ Verify backend running on :3000
   ✓ Check route registration

3. XP Not Updating
   ✓ Verify user ID in localStorage
   ✓ Check API response status
   ✓ Ensure POST body has required fields

4. Quiz Not Loading
   ✓ Check lesson ID in URL
   ✓ Verify modules.json has lesson
   ✓ Check browser console for errors
```

---

## Performance Optimization

### Frontend
```javascript
// Code splitting
const LessonQuiz = React.lazy(() => import('./LessonQuiz'));

// Memoization
const MemoizedComponent = React.memo(MyComponent);

// useCallback
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// useMemo
const computedValue = useMemo(() => {
  return expensiveOperation(data);
}, [data]);
```

### Backend
```javascript
// Response caching
app.get('/api/modules', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(modules);
});

// Connection pooling (for database)
const pool = new Pool({ max: 20 });

// Compression
const compression = require('compression');
app.use(compression());

// Load balancing (future)
// Run multiple instances behind load balancer
```

---

## Security Best Practices

### Frontend
```javascript
// Sanitize user input
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);

// Secure token storage
localStorage.setItem('token', jwtToken);
// Note: localStorage can be vulnerable to XSS
// Better: use httpOnly cookies

// CSRF protection
const token = document.querySelector('meta[name="csrf-token"]').content;
// Include in POST requests
```

### Backend
```javascript
// Validate input
const { body, validationResult } = require('express-validator');

router.post('/xp/add', [
  body('userId').isString().trim(),
  body('amount').isInt({ min: 0 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors });
  }
  // Process request
});

// Hash passwords
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);

// Implement rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Use HTTPS in production
// Add security headers
app.use(helmet());
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] API keys rotated
- [ ] Performance metrics baseline

### Deployment
- [ ] Frontend build: `npm run build`
- [ ] Backend dependencies updated
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Monitoring configured

### Post-Deployment
- [ ] Test critical paths in production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all API endpoints
- [ ] Monitor user sessions

---

## Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Node Inspector](chrome://inspect) - Node debugging

### Learning
- MDN Web Docs
- JavaScript.info
- CSS-Tricks

---

## Getting Help

### Issues & Support
1. Check existing GitHub issues
2. Review API_DOCUMENTATION.md
3. Check console for error messages
4. Post in development channel

### Reporting Bugs
- Describe steps to reproduce
- Include error messages/logs
- Provide browser/OS info
- Attach screenshots if applicable

---

**Last Updated**: 2024
**Version**: 1.0
**Maintained By**: GaiaQuest Development Team
