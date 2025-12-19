# AbaQuest Developer Setup Guide

## Prerequisites

### Required Software
- **Node.js**: v20 LTS ([Download](https://nodejs.org/))
- **npm**: v10+ (comes with Node.js)
- **Git**: Latest version
- **Docker**: For local backend development
- **VS Code**: Recommended IDE

### Optional Tools
- **Firebase CLI**: For local emulators
- **Google Cloud SDK**: For GCP integration
- **Postman**: For API testing
- **TablePlus/DBeaver**: For database management

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/abaquest.git
cd abaquest
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Environment Configuration

#### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
# API Configuration
VITE_API_URL=http://localhost:8080/v1

# Firebase Configuration (Development)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=abaquest-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=abaquest-dev
VITE_FIREBASE_STORAGE_BUCKET=abaquest-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_AUDIO=true
VITE_DEBUG_MODE=true
```

#### Backend Environment Variables

Create `backend/.env`:

```bash
# Server Configuration
NODE_ENV=development
PORT=8080
LOG_LEVEL=debug

# Firebase Configuration
FIREBASE_PROJECT_ID=abaquest-dev
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Database Configuration
# For local development, use Firebase Emulators
FIRESTORE_EMULATOR_HOST=localhost:8081

# Cloud SQL (when not using emulators)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=abaquest_analytics
DB_USER=postgres
DB_PASSWORD=postgres

# Redis (when not using emulators)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration (Optional for dev)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@abaquest.com

# Feature Flags
ENABLE_RATE_LIMITING=false
ENABLE_ANALYTICS_SYNC=false
```

### 4. Firebase Setup

#### Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Login and Initialize
```bash
firebase login
firebase init

# Select:
# - Firestore
# - Hosting
# - Emulators (Firestore, Authentication)
```

#### Download Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `backend/serviceAccountKey.json`
4. **NEVER commit this file to git** (already in `.gitignore`)

### 5. Local Database Setup (Optional)

#### Using Docker Compose

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: abaquest_analytics
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Firebase Emulators (alternative to firebase emulators:start)
  firebase-emulators:
    image: andreysenov/firebase-tools
    command: firebase emulators:start --project=abaquest-dev
    ports:
      - "4000:4000"  # Emulator UI
      - "8081:8081"  # Firestore
      - "9099:9099"  # Authentication
    volumes:
      - ./firebase.json:/home/node/firebase.json
      - ./firestore.rules:/home/node/firestore.rules
      - ./firestore.indexes.json:/home/node/firestore.indexes.json

volumes:
  postgres_data:
  redis_data:
```

#### Start Services
```bash
docker-compose up -d
```

#### Run Migrations
```bash
cd backend
npm run migrate
```

---

## Running the Application

### Development Mode

#### Terminal 1: Firebase Emulators
```bash
firebase emulators:start
```

This starts:
- Firestore Emulator: `localhost:8081`
- Auth Emulator: `localhost:9099`
- Emulator UI: `localhost:4000`

#### Terminal 2: Backend Server
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:8080`

#### Terminal 3: Frontend Development Server
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Docs**: http://localhost:8080/api-docs
- **Firebase Emulator UI**: http://localhost:4000

---

## Project Structure

```
abaquest/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── screens/       # Screen components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── AbbyAvatar.tsx
│   │   │   ├── DataLogger.tsx
│   │   │   └── Navigation.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   ├── styles/            # Global styles
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── firebase.ts
│   │   │   └── redis.ts
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── session.controller.ts
│   │   │   └── teacher.controller.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   │   ├── analytics.service.ts
│   │   │   ├── quest.service.ts
│   │   │   └── export.service.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── logger.ts
│   │   │   └── errors.ts
│   │   └── index.ts           # Entry point
│   ├── tests/
│   │   ├── unit/              # Unit tests
│   │   ├── integration/       # Integration tests
│   │   └── e2e/               # End-to-end tests
│   ├── migrations/            # Database migrations
│   ├── scripts/               # Utility scripts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── docs/                       # Documentation
│   ├── PRODUCTION_ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY_COMPLIANCE.md
│   └── DEVELOPER_SETUP.md
│
├── terraform/                  # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── test.yml
│       └── security.yml
│
├── docker-compose.yml
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .gitignore
├── README.md
└── package.json               # Root package.json (optional)
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/add-new-quest
```

### 2. Make Changes

Follow coding standards:

#### Frontend (React + TypeScript)
```typescript
// Use functional components with TypeScript
interface MyComponentProps {
  title: string;
  onComplete: () => void;
}

export function MyComponent({ title, onComplete }: MyComponentProps) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

#### Backend (Node.js + TypeScript)
```typescript
// Use async/await and proper error handling
export async function getStudent(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    
    const student = await db.collection('students').doc(studentId).get();
    
    if (!student.exists) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student not found' }
      });
    }
    
    return res.json({
      success: true,
      data: { student: student.data() }
    });
  } catch (error) {
    logger.error('Error fetching student', { error, studentId });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch student' }
    });
  }
}
```

### 3. Run Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

### 4. Lint and Format

```bash
# Frontend
cd frontend
npm run lint
npm run format

# Backend
cd backend
npm run lint
npm run format
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new quest for multiplication"

# Commit message format:
# feat: new feature
# fix: bug fix
# docs: documentation changes
# style: formatting changes
# refactor: code refactoring
# test: adding tests
# chore: maintenance tasks
```

### 6. Push and Create PR

```bash
git push origin feature/add-new-quest

# Then create Pull Request on GitHub
```

---

## Testing

### Unit Tests (Jest)

```typescript
// backend/tests/unit/student.service.test.ts
import { StudentService } from '../../src/services/student.service';

describe('StudentService', () => {
  describe('createStudent', () => {
    it('should create a student with valid data', async () => {
      const studentData = {
        name: 'Alex Johnson',
        class_id: 'class_123',
        grade_level: 1
      };
      
      const student = await StudentService.create(studentData);
      
      expect(student).toHaveProperty('id');
      expect(student.name).toBe('Alex Johnson');
      expect(student.grade_level).toBe(1);
    });
    
    it('should throw error with invalid grade level', async () => {
      const studentData = {
        name: 'Alex',
        class_id: 'class_123',
        grade_level: 5  // Invalid
      };
      
      await expect(StudentService.create(studentData))
        .rejects
        .toThrow('Invalid grade level');
    });
  });
});
```

### Integration Tests

```typescript
// backend/tests/integration/api.test.ts
import request from 'supertest';
import { app } from '../../src/index';

describe('Student API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Login as teacher
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'teacher@test.com',
        password: 'TestPassword123'
      });
    
    authToken = response.body.data.tokens.access_token;
  });
  
  it('GET /students/:id should return student data', async () => {
    const response = await request(app)
      .get('/students/student_123')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.student).toHaveProperty('id');
  });
});
```

### E2E Tests (Playwright)

```typescript
// frontend/tests/e2e/quest-flow.spec.ts
import { test, expect } from '@playwright/test';

test('student can complete a quest', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // Start quest
  await page.click('text=Position Numbers');
  
  // Complete pre-test
  await page.click('[data-testid="answer-top"]');
  await expect(page.locator('text=Great job!')).toBeVisible();
  
  // Continue through quest
  await page.click('text=Continue');
  
  // Verify completion
  await expect(page.locator('text=Quest Complete!')).toBeVisible();
});
```

---

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

### Logging

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Usage
logger.info('Student created', { studentId: 'student_123' });
logger.error('Failed to save session', { error, sessionId });
```

---

## Code Quality Tools

### ESLint Configuration

Frontend `frontend/.eslintrc.json`:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react", "@typescript-eslint", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

Backend `backend/.eslintrc.json`:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "security"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "security/detect-object-injection": "off"
  }
}
```

### Prettier Configuration

`.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Common Issues & Solutions

### Issue: Firebase Emulator Connection Refused
**Solution**:
```bash
# Kill any existing emulators
pkill -f firebase

# Restart emulators
firebase emulators:start
```

### Issue: Port Already in Use
**Solution**:
```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Issue: TypeScript Compilation Errors
**Solution**:
```bash
# Clear TypeScript cache
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

### Issue: CORS Errors in Development
**Solution**: Add to `backend/src/index.ts`:
```typescript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Backend
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Docker
docker-compose up -d           # Start services
docker-compose down            # Stop services
docker-compose logs -f         # View logs
docker-compose exec postgres psql -U postgres  # Access PostgreSQL

# Firebase
firebase emulators:start       # Start emulators
firebase emulators:export ./backup  # Export emulator data
firebase emulators:import ./backup  # Import emulator data
firebase deploy                # Deploy to production
```

---

## Getting Help

- **Slack**: #abaquest-dev
- **GitHub Issues**: https://github.com/your-org/abaquest/issues
- **Documentation**: https://docs.abaquest.com
- **Tech Lead**: tech-lead@abaquest.com

---

## Next Steps

1. ✅ Complete environment setup
2. ✅ Run the application locally
3. 📖 Read API_SPECIFICATION.md
4. 📖 Review DATABASE_SCHEMA.md
5. 🎯 Pick up a "good first issue" from GitHub
6. 💻 Start coding!

Happy coding! 🚀
