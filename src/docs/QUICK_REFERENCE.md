# AbaQuest Quick Reference Card

> **One-page reference for common commands, workflows, and troubleshooting**

## 🚀 Essential Commands

### Local Development
```bash
# Start everything
firebase emulators:start    # Terminal 1: Firebase emulators
cd backend && npm run dev   # Terminal 2: Backend API
cd frontend && npm run dev  # Terminal 3: Frontend app

# Access
http://localhost:3000       # Frontend
http://localhost:8080       # Backend API
http://localhost:4000       # Firebase Emulator UI
```

### Testing
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:e2e            # E2E tests (Playwright)
```

### Code Quality
```bash
npm run lint                # ESLint
npm run format              # Prettier
npm run type-check          # TypeScript
```

### Build & Deploy
```bash
# Frontend
npm run build               # Production build
firebase deploy --only hosting --project abaquest-prod

# Backend
gcloud builds submit --config=cloudbuild.yaml

# Full stack
./scripts/deploy.sh prod    # Custom deploy script
```

---

## 📊 Key Data Structures

### Student Interaction (Logged to Firestore)
```typescript
{
  quest_id: 3,
  scene_id: "pre_test_question_1",
  number: 0,
  correct_flag: true | false | null,  // null = "I don't know yet"
  time_ms: 3500,
  interaction_type: "pre_test" | "practice" | "post_test" | "story",
  student_response: "top" | "middle-upper" | "middle-lower" | "bottom",
  timestamp: "2024-12-02T10:30:15Z"
}
```

### Session Metrics (Calculated)
```typescript
{
  pre_test_score: 25,        // Percentage
  post_test_score: 100,      // Percentage
  learning_gain: 75,         // post - pre
  highest_number_built: 9,
  total_interactions: 18,
  correct_interactions: 14,
  accuracy: 77.8,
  coins_earned: 75
}
```

---

## 🔑 Environment Variables

### Frontend `.env.local`
```bash
VITE_API_URL=http://localhost:8080/v1
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=abaquest-dev
```

### Backend `.env`
```bash
NODE_ENV=development
PORT=8080
FIREBASE_PROJECT_ID=abaquest-dev
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
JWT_SECRET=your_secret
DB_HOST=localhost
DB_NAME=abaquest_analytics
REDIS_HOST=localhost
```

---

## 🔐 Authentication Flow

### Student Login (Anonymous)
```typescript
POST /v1/auth/student-login
{
  "class_code": "ABC123",
  "student_name": "Alex"  // Optional
}
→ Returns: { access_token, student_id }
```

### Teacher Login (Email/Password)
```typescript
POST /v1/auth/login
{
  "email": "teacher@school.edu",
  "password": "SecurePassword123"
}
→ Returns: { access_token, refresh_token, user }
```

### Using Token
```typescript
headers: {
  'Authorization': 'Bearer <access_token>'
}
```

---

## 📡 Key API Endpoints

### Session Management
```bash
# Create session
POST /v1/sessions
{ student_id, quest_id }

# Log interaction
POST /v1/sessions/:sessionId/interactions
{ quest_id, scene_id, number, correct_flag, time_ms, ... }

# Complete session
PUT /v1/sessions/:sessionId/complete
{}
```

### Teacher Dashboard
```bash
# Get dashboard
GET /v1/teacher/dashboard?class_id=class_456

# Get student progress
GET /v1/students/:studentId/progress

# Export data
POST /v1/teacher/export
{ student_ids: [...], quest_ids: [...], format: "json" }
```

---

## 🗄️ Database Quick Access

### Firestore (Local Emulator)
```javascript
// In browser console at localhost:4000
firebase.firestore().collection('students').get()
  .then(snap => snap.forEach(doc => console.log(doc.data())));
```

### PostgreSQL (Docker)
```bash
docker-compose exec postgres psql -U postgres -d abaquest_analytics

# Common queries
SELECT * FROM daily_student_metrics WHERE date = CURRENT_DATE;
SELECT * FROM daily_quest_metrics WHERE quest_id = 3;
```

### BigQuery (Production)
```sql
-- Get today's interactions
SELECT * FROM `abaquest.analytics.interactions`
WHERE DATE(timestamp) = CURRENT_DATE()
ORDER BY timestamp DESC
LIMIT 100;

-- Calculate learning gains
SELECT 
  quest_id,
  AVG(post_test_score - pre_test_score) as avg_learning_gain
FROM `abaquest.analytics.sessions`
WHERE completed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY quest_id;
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :8080

# Kill process
kill -9 <PID>

# Or kill all node processes
pkill -f node
```

### Firebase Emulator Connection Refused
```bash
# Kill existing emulators
pkill -f firebase

# Clear cache
rm -rf ~/.cache/firebase/emulators

# Restart
firebase emulators:start
```

### TypeScript Errors
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### CORS Errors
```typescript
// Add to backend/src/index.ts
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Database Migration Failed
```bash
# Rollback
npm run migrate:rollback

# Re-run
npm run migrate
```

---

## 📦 Docker Commands

### Start Services
```bash
docker-compose up -d
docker-compose ps          # Check status
docker-compose logs -f     # View logs
```

### Access Services
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres

# Redis
docker-compose exec redis redis-cli

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Reset Everything
```bash
docker-compose down -v     # Remove volumes
docker-compose up -d       # Start fresh
```

---

## 🧪 Testing Shortcuts

### Run Specific Test
```bash
# Jest (Backend)
npm test -- student.service.test.ts
npm test -- --testNamePattern="should create student"

# Vitest (Frontend)
npm test -- PositionNumbers.test.tsx
npm test -- -t "should render pre-test"

# Playwright (E2E)
npx playwright test quest-flow.spec.ts
npx playwright test --headed  # With browser
```

### Debug Tests
```bash
# Jest
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright
npx playwright test --debug
```

---

## 🔍 Logging & Monitoring

### View Logs Locally
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend dev server logs
# Visible in terminal running `npm run dev`
```

### View Logs in GCP
```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 --format json

# Firestore logs
gcloud logging read "resource.type=datastore_database" \
  --limit 50 --format json
```

### Structured Logging
```typescript
// Backend
logger.info('Student created', { 
  studentId: 'student_123', 
  classId: 'class_456' 
});

// Frontend (console in dev)
console.log('📊 Learning Data:', interaction);
```

---

## 🚨 Emergency Procedures

### Rollback Deployment
```bash
# Backend (Cloud Run)
gcloud run services update-traffic abaquest-api-prod \
  --to-revisions=abaquest-api-prod-00042-abc=100

# Frontend (Firebase)
firebase hosting:rollback abaquest-prod
```

### Incident Response
```bash
# 1. Check status
curl https://api.abaquest.com/health

# 2. View recent errors
gcloud logging read "severity>=ERROR" --limit 100

# 3. Check metrics
gcloud monitoring dashboards list

# 4. Notify team
# Post in #abaquest-incidents Slack channel
```

---

## 📚 Documentation Shortcuts

| Need | Go To |
|------|-------|
| Setup local dev | [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md) |
| API endpoint reference | [API_SPECIFICATION.md](./API_SPECIFICATION.md) |
| Database queries | [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) |
| Deploy to production | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| COPPA compliance | [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) |
| Write tests | [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) |
| Architecture overview | [PRODUCTION_ARCHITECTURE.md](./PRODUCTION_ARCHITECTURE.md) |

---

## 🎯 Performance Targets

| Metric | Target | Command to Check |
|--------|--------|------------------|
| Page Load | < 2s | Lighthouse in DevTools |
| API Response | < 200ms | `curl -w "@curl-format.txt" API_URL` |
| Test Coverage | > 80% | `npm run test:coverage` |
| Bundle Size | < 500KB | `npm run build -- --analyze` |

---

## 📞 Get Help

| Channel | Use For |
|---------|---------|
| #abaquest-dev | Development questions |
| #abaquest-incidents | Production issues |
| GitHub Issues | Bug reports, features |
| tech-lead@abaquest.com | Urgent technical issues |

---

## 🔗 Quick Links

- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:8080
- **Firebase Console**: https://console.firebase.google.com/project/abaquest-dev
- **GCP Console**: https://console.cloud.google.com/home/dashboard?project=abaquest-prod
- **API Docs (Dev)**: https://api-dev.abaquest.com/api-docs
- **Monitoring**: https://console.cloud.google.com/monitoring

---

**Print this page and keep it handy! 📄**

Last updated: December 2024
