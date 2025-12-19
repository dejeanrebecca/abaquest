# AbaQuest Database Schema

## Overview

AbaQuest uses a hybrid database approach:
- **Cloud Firestore**: Primary database for real-time data, student sessions, and interactions
- **Cloud SQL (PostgreSQL)**: Analytics database for aggregated metrics and reporting
- **BigQuery**: Data warehouse for long-term analytics and research

---

## Cloud Firestore Schema

Firestore uses a NoSQL document-based structure with collections and subcollections.

### Collection: `schools`

```javascript
{
  "id": "school_456", // Auto-generated
  "name": "Lincoln Elementary",
  "district": "Springfield School District",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701"
  },
  "settings": {
    "timezone": "America/Chicago",
    "school_year_start": "2024-08-15",
    "school_year_end": "2025-06-10"
  },
  "contact": {
    "principal": "Dr. Jane Smith",
    "email": "principal@lincoln.edu",
    "phone": "+1-555-0123"
  },
  "coppa_consent": {
    "obtained": true,
    "obtained_at": "2024-01-15T10:00:00Z",
    "consent_form_url": "gs://abaquest/consents/school_456.pdf"
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-11-01T15:30:00Z"
}
```

**Indexes**:
- `district` (ascending)
- `created_at` (descending)

---

### Collection: `users`

```javascript
{
  "id": "user_123", // Auto-generated (Firebase Auth UID)
  "email": "teacher@school.edu",
  "role": "teacher", // student, teacher, admin, researcher
  "name": "Jane Smith",
  "school_id": "school_456",
  "class_ids": ["class_456", "class_789"], // For teachers
  "profile": {
    "avatar_url": null,
    "bio": "1st Grade Math Teacher",
    "years_teaching": 5
  },
  "preferences": {
    "email_notifications": true,
    "weekly_reports": true,
    "language": "en"
  },
  "mfa_enabled": false,
  "last_login": "2024-12-02T09:00:00Z",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-12-02T09:00:00Z"
}
```

**Indexes**:
- `email` (unique)
- `school_id`, `role` (composite)
- `last_login` (descending)

---

### Collection: `classes`

```javascript
{
  "id": "class_456", // Auto-generated
  "name": "Mrs. Smith's 1st Grade",
  "school_id": "school_456",
  "teacher_id": "user_123",
  "grade_level": 1,
  "class_code": "ABC123", // 6-char unique code for student login
  "student_count": 22,
  "active": true,
  "schedule": {
    "days": ["Monday", "Wednesday", "Friday"],
    "time": "09:00-09:30"
  },
  "created_at": "2024-08-20T10:00:00Z",
  "updated_at": "2024-11-01T15:30:00Z"
}
```

**Indexes**:
- `class_code` (unique)
- `school_id`, `teacher_id` (composite)
- `active` (ascending)

---

### Collection: `students`

```javascript
{
  "id": "student_789", // Auto-generated
  "name": "Alex Johnson", // Can be pseudonym
  "display_name": "Alex", // Used in-app
  "class_id": "class_456",
  "school_id": "school_456",
  "grade_level": 1,
  "anonymous": false,
  "parent_consent": {
    "obtained": true,
    "obtained_at": "2024-08-25T10:00:00Z",
    "parent_email": "parent@example.com" // Encrypted
  },
  "demographics": { // Optional, for research
    "age": 6,
    "gender": null,
    "primary_language": "en",
    "ell_status": false,
    "iep_status": false
  },
  "progress": {
    "level": 2,
    "total_coins": 150,
    "total_xp": 450,
    "quests_completed": 3,
    "badges": ["junior_counter_master", "freeze_expert"],
    "current_quest_id": null,
    "highest_number_mastered": 9
  },
  "settings": {
    "text_size": 100,
    "voice_enabled": true,
    "volume": 80
  },
  "last_activity": "2024-12-02T10:40:00Z",
  "created_at": "2024-08-25T10:00:00Z",
  "updated_at": "2024-12-02T10:40:00Z",
  "deleted_at": null // Soft delete timestamp
}
```

**Indexes**:
- `class_id`, `deleted_at` (composite)
- `school_id`, `grade_level` (composite)
- `last_activity` (descending)

---

### Collection: `sessions`

```javascript
{
  "id": "session_abc123", // Auto-generated
  "student_id": "student_789",
  "quest_id": 3,
  "class_id": "class_456",
  "school_id": "school_456",
  "status": "completed", // in_progress, completed, abandoned
  "started_at": "2024-12-02T10:30:00Z",
  "completed_at": "2024-12-02T10:40:00Z",
  "duration_seconds": 600,
  "device_info": {
    "device_type": "tablet",
    "os": "iPadOS 17.0",
    "browser": "Safari 17.0",
    "screen_resolution": "1024x768"
  },
  "metrics": {
    "pre_test_score": 25,
    "post_test_score": 100,
    "learning_gain": 75,
    "highest_number_built": 9,
    "total_interactions": 18,
    "correct_interactions": 14,
    "accuracy": 77.8,
    "coins_earned": 75,
    "hints_used": 0
  },
  "created_at": "2024-12-02T10:30:00Z",
  "updated_at": "2024-12-02T10:40:00Z"
}
```

**Indexes**:
- `student_id`, `quest_id` (composite)
- `school_id`, `created_at` (composite)
- `status`, `created_at` (composite)

**Subcollection: `sessions/{sessionId}/interactions`**

```javascript
{
  "id": "interaction_xyz", // Auto-generated
  "session_id": "session_abc123",
  "quest_id": 3,
  "scene_id": "pre_test_question_1",
  "number": 0,
  "correct_flag": true,
  "time_ms": 3500,
  "interaction_type": "pre_test", // pre_test, practice, post_test, story
  "student_response": "top",
  "metadata": {
    "attempt_number": 1,
    "hint_used": false,
    "audio_played": true
  },
  "timestamp": "2024-12-02T10:30:15Z"
}
```

**Indexes** (on subcollection):
- `interaction_type`, `timestamp` (composite)
- `correct_flag` (ascending)

---

### Collection: `quests`

```javascript
{
  "id": 3, // Manual ID
  "name": "Position Numbers (0-9)",
  "short_name": "position_numbers",
  "description": "Learn where numbers live on the Junior Counter",
  "version": "1.0.0",
  "duration_minutes": 10,
  "grade_levels": [1, 2],
  "prerequisites": [], // Quest IDs
  "learning_objectives": [
    "Identify positions of numbers 0-9 on abacus",
    "Distinguish between upper and lower beads",
    "Build numbers using correct bead positions"
  ],
  "standards": {
    "ccss": ["K.CC.A.3", "1.NBT.A.1"],
    "state": []
  },
  "scenes": [
    {
      "id": "pre_test",
      "name": "Pre-Test Assessment",
      "type": "assessment",
      "order": 1,
      "questions": [
        {
          "id": "pre_test_question_1",
          "number": 0,
          "correct_position": "top"
        },
        {
          "id": "pre_test_question_2",
          "number": 1,
          "correct_position": "middle-lower"
        },
        {
          "id": "pre_test_question_3",
          "number": 5,
          "correct_position": "middle-upper"
        },
        {
          "id": "pre_test_question_4",
          "number": 9,
          "correct_position": "bottom"
        }
      ]
    },
    {
      "id": "learn",
      "name": "Discovery Time",
      "type": "instruction",
      "order": 2
    },
    {
      "id": "practice",
      "name": "Practice",
      "type": "practice",
      "order": 3
    },
    {
      "id": "post_test",
      "name": "Post-Test Assessment",
      "type": "assessment",
      "order": 4,
      "questions": [
        // Same as pre_test
      ]
    },
    {
      "id": "story",
      "name": "Story Time",
      "type": "story",
      "order": 5
    }
  ],
  "enabled": true,
  "created_at": "2024-01-10T10:00:00Z",
  "updated_at": "2024-11-01T15:30:00Z"
}
```

---

### Collection: `exports`

```javascript
{
  "id": "export_123", // Auto-generated
  "requested_by": "user_123",
  "request_type": "teacher_export", // teacher_export, research_export
  "filters": {
    "student_ids": ["student_789", "student_790"],
    "quest_ids": [3, 4],
    "date_from": "2024-11-01T00:00:00Z",
    "date_to": "2024-12-02T23:59:59Z"
  },
  "format": "json", // json, csv, parquet
  "include_raw_interactions": true,
  "status": "completed", // pending, processing, completed, failed
  "file_url": "gs://abaquest-exports/export_123.json",
  "file_size_bytes": 524288,
  "expires_at": "2024-12-03T10:35:00Z",
  "created_at": "2024-12-02T10:30:00Z",
  "completed_at": "2024-12-02T10:35:00Z"
}
```

---

## Cloud SQL (PostgreSQL) Schema

Used for aggregated analytics and reporting.

### Table: `daily_student_metrics`

```sql
CREATE TABLE daily_student_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) NOT NULL,
  school_id VARCHAR(50) NOT NULL,
  quest_id INTEGER NOT NULL,
  
  -- Session stats
  sessions_started INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_pre_test_score DECIMAL(5,2),
  avg_post_test_score DECIMAL(5,2),
  avg_learning_gain DECIMAL(5,2),
  highest_number_built INTEGER,
  
  -- Engagement metrics
  total_interactions INTEGER DEFAULT 0,
  correct_interactions INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  
  -- Rewards
  coins_earned INTEGER DEFAULT 0,
  badges_earned TEXT[], -- Array of badge names
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(date, student_id, quest_id)
);

CREATE INDEX idx_daily_student_date ON daily_student_metrics(date DESC);
CREATE INDEX idx_daily_student_school ON daily_student_metrics(school_id, date DESC);
CREATE INDEX idx_daily_student_class ON daily_student_metrics(class_id, date DESC);
```

---

### Table: `daily_quest_metrics`

```sql
CREATE TABLE daily_quest_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  quest_id INTEGER NOT NULL,
  school_id VARCHAR(50),
  
  -- Completion stats
  total_attempts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  
  -- Performance aggregates
  avg_pre_test_score DECIMAL(5,2),
  avg_post_test_score DECIMAL(5,2),
  avg_learning_gain DECIMAL(5,2),
  median_learning_gain DECIMAL(5,2),
  
  -- Time metrics
  avg_time_seconds INTEGER,
  median_time_seconds INTEGER,
  p95_time_seconds INTEGER,
  
  -- Student distribution
  students_started INTEGER DEFAULT 0,
  students_completed INTEGER DEFAULT 0,
  unique_students INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(date, quest_id, school_id)
);

CREATE INDEX idx_daily_quest_date ON daily_quest_metrics(date DESC);
CREATE INDEX idx_daily_quest_school ON daily_quest_metrics(school_id, date DESC);
```

---

### Table: `student_skill_mastery`

```sql
CREATE TABLE student_skill_mastery (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  quest_id INTEGER NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  
  -- Mastery metrics
  mastery_level VARCHAR(20), -- emerging, developing, proficient, advanced
  proficiency_score DECIMAL(5,2), -- 0-100
  
  -- Evidence
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_attempt_date TIMESTAMP,
  
  -- Tracking
  first_assessed_at TIMESTAMP NOT NULL,
  last_assessed_at TIMESTAMP NOT NULL,
  
  UNIQUE(student_id, quest_id, skill_name)
);

CREATE INDEX idx_skill_mastery_student ON student_skill_mastery(student_id);
CREATE INDEX idx_skill_mastery_proficiency ON student_skill_mastery(proficiency_score DESC);
```

---

### Table: `teacher_dashboard_cache`

```sql
CREATE TABLE teacher_dashboard_cache (
  id SERIAL PRIMARY KEY,
  teacher_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50),
  cache_key VARCHAR(255) NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(teacher_id, class_id, cache_key)
);

CREATE INDEX idx_dashboard_cache_expiry ON teacher_dashboard_cache(expires_at);
CREATE INDEX idx_dashboard_cache_teacher ON teacher_dashboard_cache(teacher_id);
```

---

## BigQuery Schema

Used for long-term analytics and research data warehouse.

### Table: `interactions`

```sql
CREATE TABLE `abaquest.analytics.interactions` (
  -- Identifiers
  interaction_id STRING NOT NULL,
  session_id STRING NOT NULL,
  student_id STRING NOT NULL,
  quest_id INT64 NOT NULL,
  scene_id STRING NOT NULL,
  
  -- Interaction details
  interaction_type STRING NOT NULL, -- pre_test, practice, post_test, story
  number INT64,
  student_response STRING,
  correct_flag BOOL,
  time_ms INT64,
  
  -- Context
  attempt_number INT64,
  hint_used BOOL,
  audio_played BOOL,
  
  -- Metadata
  school_id STRING,
  class_id STRING,
  grade_level INT64,
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY school_id, quest_id;
```

---

### Table: `sessions`

```sql
CREATE TABLE `abaquest.analytics.sessions` (
  -- Identifiers
  session_id STRING NOT NULL,
  student_id STRING NOT NULL,
  quest_id INT64 NOT NULL,
  
  -- Session info
  status STRING NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INT64,
  
  -- Metrics
  pre_test_score FLOAT64,
  post_test_score FLOAT64,
  learning_gain FLOAT64,
  highest_number_built INT64,
  total_interactions INT64,
  correct_interactions INT64,
  accuracy FLOAT64,
  coins_earned INT64,
  
  -- Context
  school_id STRING,
  class_id STRING,
  grade_level INT64,
  device_type STRING,
  
  -- Timestamps
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(started_at)
CLUSTER BY school_id, quest_id;
```

---

### Table: `student_demographics` (De-identified)

```sql
CREATE TABLE `abaquest.research.student_demographics` (
  -- De-identified student ID (hashed)
  student_hash STRING NOT NULL,
  
  -- Demographics (optional, aggregated for research)
  age_group STRING, -- 5-6, 7-8
  grade_level INT64,
  primary_language STRING,
  ell_status BOOL,
  iep_status BOOL,
  
  -- School context (anonymized)
  school_region STRING, -- Midwest, Northeast, etc.
  school_type STRING, -- urban, suburban, rural
  district_size STRING, -- small, medium, large
  
  -- Consent
  research_consent BOOL,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
```

---

## Data Retention Policies

### Firestore
- **Active students**: Indefinite retention
- **Inactive students (>1 year)**: Archived to BigQuery, deleted from Firestore
- **Deleted accounts**: 30-day soft delete, then permanent deletion
- **Sessions/Interactions**: Retained for 2 years, then archived to BigQuery

### Cloud SQL
- **Daily metrics**: 2 years retention
- **Cache tables**: 7 days retention

### BigQuery
- **Raw interactions**: Indefinite retention (research)
- **Sessions**: Indefinite retention
- **Demographics**: Indefinite retention (de-identified)

---

## Backup Strategy

### Firestore
- **Automated daily backups**: 35-day retention
- **Backup schedule**: 2:00 AM UTC daily
- **Storage location**: `gs://abaquest-backups/firestore/`

### Cloud SQL
- **Automated backups**: Daily at 3:00 AM UTC
- **Point-in-time recovery**: 7 days
- **Storage location**: Multi-region (us-central1, us-east1)

### BigQuery
- **Time travel**: 7-day recovery window
- **Snapshots**: Weekly snapshots retained for 90 days

---

## Data Migration Scripts

### Firestore → BigQuery (Daily ETL)

```javascript
// Cloud Function triggered daily
exports.syncFirestoreToBigQuery = async (event, context) => {
  const yesterday = getYesterdayDateRange();
  
  // Get all completed sessions from yesterday
  const sessions = await db.collection('sessions')
    .where('completed_at', '>=', yesterday.start)
    .where('completed_at', '<', yesterday.end)
    .get();
  
  // Stream to BigQuery
  for (const sessionDoc of sessions.docs) {
    const session = sessionDoc.data();
    
    // Get all interactions for this session
    const interactions = await sessionDoc.ref
      .collection('interactions')
      .get();
    
    // Insert to BigQuery
    await bigquery.dataset('analytics').table('sessions').insert(session);
    await bigquery.dataset('analytics').table('interactions').insert(
      interactions.docs.map(d => d.data())
    );
  }
};
```

---

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Students can only read/write their own data
    match /students/{studentId} {
      allow read: if request.auth.uid == studentId 
                  || isTeacher(resource.data.class_id)
                  || isAdmin();
      allow write: if isTeacher(resource.data.class_id) || isAdmin();
    }
    
    // Sessions - students can write their own, teachers can read their class
    match /sessions/{sessionId} {
      allow read: if request.auth.uid == resource.data.student_id
                  || isTeacher(resource.data.class_id)
                  || isAdmin();
      allow create: if request.auth.uid == request.resource.data.student_id;
      allow update: if request.auth.uid == resource.data.student_id;
      
      // Interactions subcollection
      match /interactions/{interactionId} {
        allow read: if request.auth.uid == get(/databases/$(database)/documents/sessions/$(sessionId)).data.student_id
                    || isTeacher(get(/databases/$(database)/documents/sessions/$(sessionId)).data.class_id);
        allow create: if request.auth.uid == get(/databases/$(database)/documents/sessions/$(sessionId)).data.student_id;
      }
    }
    
    // Classes - teachers can read their own classes
    match /classes/{classId} {
      allow read: if isTeacher(classId) || isAdmin();
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isTeacher(classId) {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher'
        && classId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.class_ids;
    }
    
    function isAdmin() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Database Access Patterns

### Common Queries

**Get student's quest history:**
```javascript
db.collection('sessions')
  .where('student_id', '==', studentId)
  .where('status', '==', 'completed')
  .orderBy('completed_at', 'desc')
  .limit(10)
  .get();
```

**Get class performance for a quest:**
```javascript
db.collection('sessions')
  .where('class_id', '==', classId)
  .where('quest_id', '==', questId)
  .where('status', '==', 'completed')
  .get()
  .then(calculateAverages);
```

**Get today's active students:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

db.collection('sessions')
  .where('school_id', '==', schoolId)
  .where('started_at', '>=', today)
  .get();
```

---

This schema supports all required functionality while maintaining COPPA/FERPA compliance and enabling comprehensive analytics for research teams.
