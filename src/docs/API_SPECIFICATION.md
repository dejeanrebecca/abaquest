# AbaQuest API Specification

## Base URL
- **Production**: `https://api.abaquest.com/v1`
- **Staging**: `https://api-staging.abaquest.com/v1`
- **Development**: `https://api-dev.abaquest.com/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Token Refresh
Tokens expire after 15 minutes. Use the refresh token to obtain a new access token.

## API Endpoints

### Authentication

#### POST /auth/login
**Description**: Authenticate a user (teacher/admin)

**Request Body**:
```json
{
  "email": "teacher@school.edu",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "teacher@school.edu",
      "role": "teacher",
      "name": "Jane Smith",
      "school_id": "school_456"
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "dGhpc2lz...",
      "expires_in": 900
    }
  }
}
```

#### POST /auth/student-login
**Description**: Anonymous student authentication with class code

**Request Body**:
```json
{
  "class_code": "ABC123",
  "student_name": "Alex" // Optional, can be anonymous
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_789",
      "display_name": "Alex",
      "class_id": "class_456",
      "anonymous": false
    },
    "tokens": {
      "access_token": "eyJhbGc...",
      "refresh_token": "dGhpc2lz...",
      "expires_in": 900
    }
  }
}
```

#### POST /auth/refresh
**Description**: Refresh access token

**Request Body**:
```json
{
  "refresh_token": "dGhpc2lz..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 900
  }
}
```

#### POST /auth/logout
**Description**: Invalidate tokens

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### Student Management

#### POST /students
**Description**: Create a new student (Teacher only)

**Request Body**:
```json
{
  "name": "Alex Johnson",
  "class_id": "class_456",
  "grade_level": 1,
  "metadata": {
    "reading_level": "2A",
    "iep_accommodations": false
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_789",
      "name": "Alex Johnson",
      "class_id": "class_456",
      "grade_level": 1,
      "created_at": "2024-12-02T10:30:00Z",
      "updated_at": "2024-12-02T10:30:00Z"
    }
  }
}
```

#### GET /students/:studentId
**Description**: Get student details

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_789",
      "name": "Alex Johnson",
      "class_id": "class_456",
      "grade_level": 1,
      "total_quests_completed": 3,
      "total_coins": 150,
      "level": 2,
      "created_at": "2024-12-02T10:30:00Z"
    }
  }
}
```

#### GET /students/:studentId/progress
**Description**: Get student progress across all quests

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student_id": "student_789",
    "overall_progress": {
      "quests_completed": 3,
      "total_quests": 8,
      "completion_percentage": 37.5,
      "total_coins": 150,
      "level": 2,
      "badges": ["junior_counter_master", "freeze_expert"]
    },
    "quest_progress": [
      {
        "quest_id": 3,
        "quest_name": "Position Numbers (0-9)",
        "status": "completed",
        "pre_test_score": 25,
        "post_test_score": 100,
        "learning_gain": 75,
        "highest_number_built": 9,
        "coins_earned": 75,
        "completed_at": "2024-12-02T11:00:00Z",
        "time_spent_seconds": 540
      }
    ]
  }
}
```

#### DELETE /students/:studentId
**Description**: Soft delete a student (Teacher/Admin only)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Student marked for deletion. Data will be permanently removed in 30 days."
}
```

---

### Quest Management

#### GET /quests
**Description**: List all available quests

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": 3,
        "name": "Position Numbers (0-9)",
        "description": "Learn where numbers live on the Junior Counter",
        "duration_minutes": 10,
        "grade_levels": [1, 2],
        "prerequisites": [],
        "learning_objectives": [
          "Identify positions of numbers 0-9 on abacus",
          "Distinguish between upper and lower beads",
          "Build numbers using correct bead positions"
        ],
        "enabled": true
      }
    ]
  }
}
```

#### GET /quests/:questId
**Description**: Get quest details

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "quest": {
      "id": 3,
      "name": "Position Numbers (0-9)",
      "description": "Learn where numbers live on the Junior Counter",
      "duration_minutes": 10,
      "scenes": [
        {
          "id": "pre_test",
          "name": "Pre-Test Assessment",
          "type": "assessment",
          "questions": [
            {
              "id": "pre_test_question_1",
              "number": 0,
              "correct_position": "top"
            }
          ]
        },
        {
          "id": "learn",
          "name": "Discovery Time",
          "type": "instruction"
        }
      ]
    }
  }
}
```

---

### Session Management

#### POST /sessions
**Description**: Start a new quest session

**Request Body**:
```json
{
  "student_id": "student_789",
  "quest_id": 3,
  "metadata": {
    "device": "iPad",
    "browser": "Safari 17.0",
    "school_id": "school_456"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_abc123",
      "student_id": "student_789",
      "quest_id": 3,
      "status": "in_progress",
      "started_at": "2024-12-02T10:30:00Z"
    }
  }
}
```

#### POST /sessions/:sessionId/interactions
**Description**: Log a student interaction

**Request Body**:
```json
{
  "quest_id": 3,
  "scene_id": "pre_test_question_1",
  "number": 0,
  "correct_flag": true,
  "time_ms": 3500,
  "interaction_type": "pre_test",
  "student_response": "top",
  "metadata": {
    "attempt_number": 1,
    "hint_used": false
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "interaction": {
      "id": "interaction_xyz",
      "session_id": "session_abc123",
      "timestamp": "2024-12-02T10:30:15Z",
      "logged": true
    }
  }
}
```

#### POST /sessions/:sessionId/bulk-interactions
**Description**: Bulk log multiple interactions (offline sync)

**Request Body**:
```json
{
  "interactions": [
    {
      "quest_id": 3,
      "scene_id": "pre_test_question_1",
      "number": 0,
      "correct_flag": true,
      "time_ms": 3500,
      "interaction_type": "pre_test",
      "student_response": "top",
      "timestamp": "2024-12-02T10:30:15Z"
    },
    {
      "quest_id": 3,
      "scene_id": "pre_test_question_2",
      "number": 1,
      "correct_flag": false,
      "time_ms": 5200,
      "interaction_type": "pre_test",
      "student_response": "middle-upper",
      "timestamp": "2024-12-02T10:30:20Z"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "logged_count": 2,
    "failed_count": 0
  }
}
```

#### PUT /sessions/:sessionId/complete
**Description**: Mark session as complete and calculate metrics

**Request Body**:
```json
{
  "completed_at": "2024-12-02T10:40:00Z"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_abc123",
      "status": "completed",
      "duration_seconds": 600,
      "metrics": {
        "pre_test_score": 25,
        "post_test_score": 100,
        "learning_gain": 75,
        "highest_number_built": 9,
        "total_interactions": 18,
        "correct_interactions": 14,
        "accuracy": 77.8,
        "coins_earned": 75
      }
    }
  }
}
```

---

### Teacher Dashboard

#### GET /teacher/dashboard
**Description**: Get overview dashboard metrics (Teacher only)

**Query Parameters**:
- `class_id` (optional): Filter by specific class
- `date_from` (optional): Start date (ISO 8601)
- `date_to` (optional): End date (ISO 8601)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_students": 25,
      "active_students_today": 18,
      "quests_completed_today": 42,
      "average_learning_gain": 65.5
    },
    "recent_sessions": [
      {
        "student_name": "Alex Johnson",
        "quest_name": "Position Numbers (0-9)",
        "pre_test_score": 25,
        "post_test_score": 100,
        "learning_gain": 75,
        "completed_at": "2024-12-02T11:00:00Z"
      }
    ],
    "class_performance": {
      "average_pre_test": 32.5,
      "average_post_test": 78.2,
      "average_learning_gain": 45.7
    }
  }
}
```

#### GET /teacher/students
**Description**: List all students for teacher's classes

**Query Parameters**:
- `class_id` (optional): Filter by class
- `page` (default: 1)
- `limit` (default: 50, max: 100)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_789",
        "name": "Alex Johnson",
        "class_id": "class_456",
        "grade_level": 1,
        "quests_completed": 3,
        "last_activity": "2024-12-02T11:00:00Z",
        "average_learning_gain": 68.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "total_pages": 1
    }
  }
}
```

#### GET /teacher/reports/:studentId
**Description**: Generate detailed student report

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_789",
      "name": "Alex Johnson",
      "class_name": "Mrs. Smith's 1st Grade"
    },
    "quest_performance": [
      {
        "quest_id": 3,
        "quest_name": "Position Numbers (0-9)",
        "attempts": 2,
        "best_score": {
          "pre_test": 25,
          "post_test": 100,
          "learning_gain": 75
        },
        "time_spent_seconds": 540,
        "mastery_level": "proficient",
        "completed_at": "2024-12-02T11:00:00Z"
      }
    ],
    "skill_breakdown": {
      "number_recognition_0_4": 85,
      "number_recognition_5_9": 92,
      "abacus_manipulation": 78
    },
    "recommendations": [
      "Alex shows strong mastery of numbers 5-9",
      "Continue practicing lower bead manipulation for numbers 1-4"
    ]
  }
}
```

#### POST /teacher/export
**Description**: Export student data for research

**Request Body**:
```json
{
  "student_ids": ["student_789", "student_790"],
  "quest_ids": [3, 4],
  "format": "json", // or "csv", "parquet"
  "include_raw_interactions": true,
  "date_from": "2024-11-01T00:00:00Z",
  "date_to": "2024-12-02T23:59:59Z"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "export_id": "export_123",
    "status": "processing",
    "estimated_completion": "2024-12-02T10:35:00Z",
    "download_url": null
  }
}
```

#### GET /teacher/export/:exportId
**Description**: Get export status and download URL

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "export_id": "export_123",
    "status": "completed",
    "download_url": "https://storage.googleapis.com/abaquest-exports/export_123.json?token=...",
    "expires_at": "2024-12-03T10:35:00Z",
    "file_size_bytes": 524288
  }
}
```

---

### Analytics (Research API)

#### GET /analytics/quest/:questId/aggregate
**Description**: Get aggregated quest metrics (Researcher role)

**Query Parameters**:
- `date_from`: Start date (ISO 8601)
- `date_to`: End date (ISO 8601)
- `group_by`: `day`, `week`, `month`, `school`, `class`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "quest_id": 3,
    "date_range": {
      "from": "2024-11-01T00:00:00Z",
      "to": "2024-12-02T23:59:59Z"
    },
    "metrics": {
      "total_completions": 1250,
      "average_pre_test": 28.5,
      "average_post_test": 76.3,
      "average_learning_gain": 47.8,
      "median_time_seconds": 585,
      "completion_rate": 89.2
    },
    "breakdown": [
      {
        "group": "2024-11-01",
        "completions": 45,
        "average_learning_gain": 42.3
      }
    ]
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "quest_id",
        "message": "Quest ID must be a positive integer"
      }
    ]
  }
}
```

### Error Codes
- `AUTHENTICATION_REQUIRED` (401): No valid token provided
- `PERMISSION_DENIED` (403): User lacks required permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

### Limits
- **Student API**: 100 requests/minute per student
- **Teacher API**: 500 requests/minute per teacher
- **Analytics API**: 100 requests/minute per researcher

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1638446400
```

---

## Webhooks (Optional)

### POST /webhooks/register
**Description**: Register a webhook endpoint

**Request Body**:
```json
{
  "url": "https://school.edu/webhooks/abaquest",
  "events": ["session.completed", "student.progress_milestone"],
  "secret": "webhook_secret_key"
}
```

### Webhook Events
- `session.completed`: Fired when a student completes a quest
- `session.started`: Fired when a student starts a quest
- `student.progress_milestone`: Fired when student reaches milestone (e.g., 5 quests completed)
- `teacher.export_ready`: Fired when data export is ready for download

---

## Versioning

API version is included in the URL path: `/v1/`

Breaking changes will result in a new version (e.g., `/v2/`). Previous versions will be supported for 12 months after deprecation announcement.

---

## SDK Support

Official SDKs will be provided for:
- **JavaScript/TypeScript**: `@abaquest/sdk-js`
- **Python**: `abaquest-sdk`
- **REST**: Full documentation for direct HTTP calls

Example usage:
```javascript
import { AbaQuestClient } from '@abaquest/sdk-js';

const client = new AbaQuestClient({
  apiKey: process.env.ABAQUEST_API_KEY,
  environment: 'production'
});

// Start a session
const session = await client.sessions.create({
  student_id: 'student_789',
  quest_id: 3
});

// Log interaction
await client.sessions.logInteraction(session.id, {
  scene_id: 'pre_test_question_1',
  number: 0,
  correct_flag: true,
  time_ms: 3500
});

// Complete session
await client.sessions.complete(session.id);
```
