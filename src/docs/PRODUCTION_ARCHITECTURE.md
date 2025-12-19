# AbaQuest Production Architecture

## Overview
AbaQuest is a gamified K-2 math learning application teaching abacus-based counting through interactive adventures. This document outlines the production architecture for deployment on Google Cloud Platform.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4.0
- **Animation**: Motion (Framer Motion)
- **Charts**: Recharts
- **State Management**: React Context API + Local State
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Audio**: Howler.js (for narration and sound effects)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **API**: RESTful with potential GraphQL for analytics
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore (NoSQL) + Cloud SQL (PostgreSQL for analytics)
- **File Storage**: Cloud Storage (for assets, audio files)
- **Caching**: Cloud Memorystore (Redis)

### Infrastructure (Google Cloud Platform)
- **Hosting**: 
  - Frontend: Firebase Hosting or Cloud Storage + Cloud CDN
  - Backend: Cloud Run (containerized, auto-scaling)
- **Database**: 
  - Primary: Cloud Firestore
  - Analytics: Cloud SQL (PostgreSQL)
  - Data Warehouse: BigQuery
- **Authentication**: Firebase Authentication
- **Storage**: Cloud Storage
- **CDN**: Cloud CDN
- **Monitoring**: Cloud Monitoring + Cloud Logging
- **CI/CD**: Cloud Build
- **Secret Management**: Secret Manager
- **Analytics**: Firebase Analytics + BigQuery

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   React SPA (Tablet Optimized 1024x768)                │ │
│  │   - Service Worker (PWA for offline support)           │ │
│  │   - IndexedDB (local data persistence)                 │ │
│  │   - Web Audio API (narration & sound effects)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD CDN / HTTPS LB                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Cloud Run (Auto-scaling Node.js Containers)        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  API Server (Express.js)                     │   │   │
│  │  │  - Authentication Middleware                 │   │   │
│  │  │  - Rate Limiting                             │   │   │
│  │  │  - Request Validation                        │   │   │
│  │  │  - Error Handling                            │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Business Logic Services                     │   │   │
│  │  │  - Quest Service                             │   │   │
│  │  │  - Student Service                           │   │   │
│  │  │  - Progress Service                          │   │   │
│  │  │  - Analytics Service                         │   │   │
│  │  │  - Teacher Dashboard Service                 │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         DATA TIER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Firestore   │  │  Cloud SQL   │  │  Cloud Storage  │   │
│  │  (Primary)   │  │ (Analytics)  │  │  (Assets/Media) │   │
│  │              │  │              │  │                 │   │
│  │ - Students   │  │ - Aggregated │  │ - Images        │   │
│  │ - Sessions   │  │   Metrics    │  │ - Audio Files   │   │
│  │ - Progress   │  │ - Reports    │  │ - Exports       │   │
│  │ - Interactions│ │ - Research   │  │                 │   │
│  └──────────────┘  │   Data       │  └─────────────────┘   │
│                    └──────────────┘                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  BigQuery    │  │ Memorystore  │                        │
│  │ (Warehouse)  │  │   (Redis)    │                        │
│  │              │  │              │                        │
│  │ - Long-term  │  │ - Sessions   │                        │
│  │   Analytics  │  │ - Cache      │                        │
│  │ - Research   │  │ - Rate Limit │                        │
│  │   Exports    │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Firebase    │  │   SendGrid   │  │  Cloud Tasks    │   │
│  │     Auth     │  │   (Email)    │  │ (Background Jobs)│   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Student Session Flow
1. **Authentication**: Student/Teacher authenticates via Firebase Auth
2. **Session Start**: Create session record in Firestore
3. **Real-time Tracking**: Each interaction logged to Firestore
4. **Local Persistence**: Critical data cached in IndexedDB
5. **Analytics Pipeline**: Data streamed to BigQuery for analysis
6. **Session End**: Aggregate metrics calculated and stored

### Quest Progression Flow
```
Student Login
    ↓
Load Progress (Firestore)
    ↓
Start Quest
    ↓
Log Interactions (Real-time to Firestore)
    ↓
Complete Quest
    ↓
Calculate Metrics (Backend)
    ↓
Update Progress (Firestore + Cloud SQL)
    ↓
Export to BigQuery (Analytics)
```

## Security Architecture

### Authentication & Authorization
- **Student Authentication**: Anonymous Auth + Class Code
- **Teacher Authentication**: Email/Password + MFA
- **Admin Authentication**: Email/Password + MFA + IP Whitelist
- **Session Management**: JWT tokens (15-min access, 7-day refresh)
- **Role-Based Access Control (RBAC)**:
  - `student`: Quest access, progress viewing
  - `teacher`: Student management, dashboard access, data export
  - `admin`: Full system access, user management
  - `researcher`: Read-only analytics access

### Data Protection
- **Encryption at Rest**: All GCP services encrypted by default
- **Encryption in Transit**: TLS 1.3 for all connections
- **PII Handling**: Minimal collection, pseudonymization
- **COPPA Compliance**: 
  - Parental consent workflow
  - No direct marketing to children
  - Data deletion on request
- **FERPA Compliance**: 
  - School data agreements
  - Limited data sharing
  - Audit trails

### Network Security
- **Cloud Armor**: DDoS protection, WAF rules
- **VPC**: Private networking for backend services
- **Identity-Aware Proxy**: Additional auth layer for admin tools
- **Secret Manager**: Secure credential storage

## Scalability

### Auto-scaling Strategy
- **Cloud Run**: Auto-scale based on requests (0-1000 instances)
- **Firestore**: Auto-scales, no manual intervention
- **Cloud SQL**: Read replicas for analytics queries
- **CDN**: Global edge caching for static assets

### Performance Targets
- **Page Load**: < 2 seconds on 3G
- **API Response**: < 200ms (p95)
- **Real-time Updates**: < 500ms latency
- **Concurrent Users**: 10,000+ per school district
- **Quest Completion**: < 10 minutes runtime

## Monitoring & Observability

### Key Metrics
- **Application Performance Monitoring (APM)**
  - Request latency (p50, p95, p99)
  - Error rates (4xx, 5xx)
  - Quest completion rates
  - User session duration

- **Business Metrics**
  - Daily Active Users (DAU)
  - Quest completion rates
  - Learning gain (pre-test to post-test)
  - Teacher engagement

- **Infrastructure Metrics**
  - CPU/Memory utilization
  - Database query performance
  - CDN cache hit rate
  - Storage usage

### Alerting
- **Critical**: P0 - Service down, data loss
- **High**: P1 - Degraded performance, auth issues
- **Medium**: P2 - Elevated error rates
- **Low**: P3 - Resource warnings

### Logging Strategy
```javascript
// Structured logging format
{
  "timestamp": "2024-12-02T10:30:00Z",
  "level": "INFO",
  "service": "quest-service",
  "trace_id": "abc123",
  "user_id": "student_456",
  "event": "quest_interaction",
  "quest_id": 3,
  "scene_id": "pre_test_question_1",
  "metadata": {
    "number": 5,
    "correct": true,
    "time_ms": 3500
  }
}
```

## Disaster Recovery

### Backup Strategy
- **Firestore**: Automated daily backups (35-day retention)
- **Cloud SQL**: Automated backups + point-in-time recovery (7 days)
- **Cloud Storage**: Multi-region storage with versioning
- **BigQuery**: 7-day time travel for data recovery

### Recovery Time Objectives (RTO/RPO)
- **RTO**: 1 hour (maximum downtime)
- **RPO**: 5 minutes (maximum data loss)

### Incident Response
1. **Detection**: Automated monitoring triggers alert
2. **Escalation**: On-call engineer notified
3. **Mitigation**: Rollback or hotfix deployment
4. **Communication**: Status page updates
5. **Post-mortem**: Root cause analysis within 48 hours

## Compliance & Privacy

### Data Retention
- **Active Students**: Data retained while enrolled
- **Inactive Students**: 1-year retention after last activity
- **Deleted Accounts**: 30-day soft delete, then permanent
- **Research Data**: De-identified, indefinite retention

### Data Export
- **Student Reports**: PDF + JSON export
- **Teacher Dashboard**: CSV + Excel export
- **Research Data**: JSON + Parquet (BigQuery)
- **Compliance Reports**: Audit logs in JSON

### Privacy Controls
- **Data Minimization**: Collect only essential data
- **Consent Management**: Track and honor consent preferences
- **Right to Access**: Student/parent data access portal
- **Right to Delete**: Self-service deletion with verification

## Cost Optimization

### Estimated Monthly Costs (1000 students)
- **Cloud Run**: $50 (auto-scales to zero)
- **Firestore**: $100 (1GB storage, 1M reads/writes)
- **Cloud SQL**: $150 (db-f1-micro + storage)
- **Cloud Storage**: $20 (10GB assets)
- **CDN**: $30 (100GB egress)
- **BigQuery**: $50 (100GB storage, 1TB queries)
- **Monitoring**: $30
- **Total**: ~$430/month (43¢ per student)

### Cost Optimization Strategies
- **Caching**: Aggressive CDN + Redis caching
- **Compression**: Gzip/Brotli for all text assets
- **Image Optimization**: WebP format, lazy loading
- **Query Optimization**: Indexed queries, connection pooling
- **Cold Start Reduction**: Minimum Cloud Run instances during peak hours

## Development Workflow

### Environments
1. **Local**: Docker Compose (emulators)
2. **Development**: GCP dev project (auto-deploy from `develop` branch)
3. **Staging**: GCP staging project (manual promotion)
4. **Production**: GCP prod project (manual release)

### CI/CD Pipeline
```yaml
# Simplified Cloud Build pipeline
steps:
  - name: 'Install Dependencies'
  - name: 'Run Linters' (ESLint, Prettier)
  - name: 'Run Tests' (Jest + React Testing Library)
  - name: 'Build Frontend' (Vite)
  - name: 'Build Backend' (TypeScript)
  - name: 'Run E2E Tests' (Playwright)
  - name: 'Build Docker Images'
  - name: 'Push to Artifact Registry'
  - name: 'Deploy to Cloud Run'
  - name: 'Deploy to Firebase Hosting'
  - name: 'Run Smoke Tests'
  - name: 'Notify Team' (Slack)
```

## Next Steps
1. Review and approve architecture
2. Set up GCP organization and projects
3. Configure IAM roles and service accounts
4. Implement backend API (see API_SPECIFICATION.md)
5. Set up database schemas (see DATABASE_SCHEMA.md)
6. Configure CI/CD pipeline
7. Implement monitoring and alerting
8. Conduct security audit
9. Perform load testing
10. Plan phased rollout
