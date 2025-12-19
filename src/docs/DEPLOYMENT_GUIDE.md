# AbaQuest Deployment Guide - Google Cloud Platform

## Prerequisites

### Required Tools
- **Google Cloud SDK**: `gcloud` CLI tool
- **Node.js**: v20 LTS
- **Docker**: For containerization
- **Terraform**: For infrastructure as code (optional but recommended)
- **Git**: Version control

### GCP Account Setup
1. Create a Google Cloud account
2. Create a new organization (or use existing)
3. Enable billing
4. Create three projects:
   - `abaquest-dev`
   - `abaquest-staging`
   - `abaquest-prod`

### Required GCP APIs
Enable these APIs in each project:
```bash
gcloud services enable \
  cloudrun.googleapis.com \
  firestore.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  cloudtasks.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  firebase.googleapis.com \
  firebasehosting.googleapis.com \
  cloudmonitoring.googleapis.com \
  cloudlogging.googleapis.com \
  redis.googleapis.com \
  bigquery.googleapis.com
```

---

## Initial Setup

### 1. Infrastructure Setup (Using Terraform)

Create `terraform/main.tf`:

```hcl
terraform {
  required_version = ">= 1.5"
  
  backend "gcs" {
    bucket = "abaquest-terraform-state"
    prefix = "prod"
  }
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

# Firestore Database
resource "google_firestore_database" "main" {
  project     = var.project_id
  name        = "(default)"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"
}

# Cloud SQL Instance
resource "google_sql_database_instance" "analytics" {
  name             = "abaquest-analytics-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier = "db-custom-2-4096"
    
    backup_configuration {
      enabled    = true
      start_time = "03:00"
      point_in_time_recovery_enabled = true
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    
    maintenance_window {
      day  = 7  # Sunday
      hour = 4  # 4 AM
    }
  }
  
  deletion_protection = true
}

resource "google_sql_database" "analytics_db" {
  name     = "abaquest_analytics"
  instance = google_sql_database_instance.analytics.name
}

# Cloud Storage Buckets
resource "google_storage_bucket" "assets" {
  name          = "abaquest-assets-${var.environment}"
  location      = "US"
  storage_class = "STANDARD"
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["https://app.abaquest.com"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "exports" {
  name          = "abaquest-exports-${var.environment}"
  location      = "US"
  storage_class = "NEARLINE"
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket" "backups" {
  name          = "abaquest-backups-${var.environment}"
  location      = "US"
  storage_class = "ARCHIVE"
  
  versioning {
    enabled = true
  }
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "abaquest-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private" {
  name          = "abaquest-private-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  
  private_ip_google_access = true
}

# Cloud Memorystore (Redis)
resource "google_redis_instance" "cache" {
  name           = "abaquest-cache-${var.environment}"
  tier           = "STANDARD_HA"
  memory_size_gb = 1
  region         = var.region
  
  authorized_network = google_compute_network.vpc.id
  
  redis_version     = "REDIS_7_0"
  display_name      = "AbaQuest Cache"
}

# BigQuery Dataset
resource "google_bigquery_dataset" "analytics" {
  dataset_id    = "analytics"
  friendly_name = "AbaQuest Analytics"
  description   = "Student interaction and session data"
  location      = "US"
  
  default_table_expiration_ms = null
}

resource "google_bigquery_dataset" "research" {
  dataset_id    = "research"
  friendly_name = "AbaQuest Research Data"
  description   = "De-identified research data"
  location      = "US"
  
  access {
    role          = "READER"
    user_by_email = "researcher@university.edu"
  }
}

# Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  
  replication {
    automatic = true
  }
}

# Cloud Run Service (Backend API)
resource "google_cloud_run_service" "api" {
  name     = "abaquest-api-${var.environment}"
  location = var.region
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/abaquest-api:latest"
        
        env {
          name  = "NODE_ENV"
          value = var.environment
        }
        
        env {
          name  = "FIRESTORE_PROJECT_ID"
          value = var.project_id
        }
        
        env {
          name = "DB_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_password.secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
      
      container_concurrency = 80
      timeout_seconds      = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "100"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM for Cloud Run
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.api.name
  location = google_cloud_run_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Scheduler for daily tasks
resource "google_cloud_scheduler_job" "daily_analytics" {
  name        = "daily-analytics-sync"
  description = "Sync Firestore data to BigQuery"
  schedule    = "0 2 * * *"
  time_zone   = "America/Chicago"
  
  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_service.api.status[0].url}/admin/sync-analytics"
    
    oidc_token {
      service_account_email = google_service_account.scheduler.email
    }
  }
}

# Service Accounts
resource "google_service_account" "api" {
  account_id   = "abaquest-api"
  display_name = "AbaQuest API Service Account"
}

resource "google_service_account" "scheduler" {
  account_id   = "abaquest-scheduler"
  display_name = "AbaQuest Scheduler Service Account"
}

# IAM Bindings
resource "google_project_iam_member" "api_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_bigquery" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.api.email}"
}

# Outputs
output "api_url" {
  value = google_cloud_run_service.api.status[0].url
}

output "db_connection" {
  value     = google_sql_database_instance.analytics.connection_name
  sensitive = true
}
```

### Apply Terraform

```bash
# Initialize
terraform init

# Plan
terraform plan -var="project_id=abaquest-prod" -var="environment=prod"

# Apply
terraform apply -var="project_id=abaquest-prod" -var="environment=prod"
```

---

## Backend Deployment

### 1. Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── firebase.ts
│   │   └── redis.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── student.controller.ts
│   │   ├── session.controller.ts
│   │   └── teacher.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/
│   │   ├── Student.ts
│   │   ├── Session.ts
│   │   └── Interaction.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── student.routes.ts
│   │   ├── session.routes.ts
│   │   └── teacher.routes.ts
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── quest.service.ts
│   │   └── export.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── .dockerignore
├── package.json
├── tsconfig.json
└── cloudbuild.yaml
```

### 2. Dockerfile

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start server
CMD ["node", "dist/index.js"]
```

### 3. Cloud Build Configuration

Create `cloudbuild.yaml`:

```yaml
steps:
  # Install dependencies
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['ci']
    
  # Run linting
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['run', 'lint']
    
  # Run tests
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['run', 'test']
    env:
      - 'NODE_ENV=test'
    
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/abaquest-api:$SHORT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/abaquest-api:latest'
      - '.'
    
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/abaquest-api:$SHORT_SHA'
    
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/abaquest-api:latest'
    
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'abaquest-api-${_ENV}'
      - '--image'
      - 'gcr.io/$PROJECT_ID/abaquest-api:$SHORT_SHA'
      - '--region'
      - '${_REGION}'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=${_ENV}'
      - '--min-instances'
      - '${_MIN_INSTANCES}'
      - '--max-instances'
      - '${_MAX_INSTANCES}'
      - '--memory'
      - '512Mi'
      - '--cpu'
      - '1'
      - '--timeout'
      - '300'
    
  # Run smoke tests
  - name: 'gcr.io/cloud-builders/curl'
    args:
      - '-f'
      - 'https://api-${_ENV}.abaquest.com/health'

substitutions:
  _ENV: 'prod'
  _REGION: 'us-central1'
  _MIN_INSTANCES: '1'
  _MAX_INSTANCES: '100'

images:
  - 'gcr.io/$PROJECT_ID/abaquest-api:$SHORT_SHA'
  - 'gcr.io/$PROJECT_ID/abaquest-api:latest'

timeout: 1200s
```

### 4. Deploy Backend

```bash
# Authenticate
gcloud auth login
gcloud config set project abaquest-prod

# Build and deploy
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_ENV=prod,_MIN_INSTANCES=2,_MAX_INSTANCES=100
```

---

## Frontend Deployment

### 1. Build Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://api.abaquest.com/v1'
        : 'http://localhost:8080/v1'
    ),
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['motion', 'recharts'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
}));
```

### 2. Firebase Configuration

Create `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

### 3. Deploy Frontend

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy --only hosting --project abaquest-prod
```

---

## Database Setup

### 1. Firestore Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "student_id", "order": "ASCENDING" },
        { "fieldPath": "quest_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "school_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "interactions",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "interaction_type", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes --project abaquest-prod
```

### 2. Cloud SQL Setup

```bash
# Connect to Cloud SQL
gcloud sql connect abaquest-analytics-prod --user=postgres

# Run migrations
psql -d abaquest_analytics -f migrations/001_initial_schema.sql
```

Create `migrations/001_initial_schema.sql`:
```sql
-- See DATABASE_SCHEMA.md for full schema
CREATE TABLE daily_student_metrics (...);
CREATE TABLE daily_quest_metrics (...);
-- ... etc
```

---

## Monitoring & Alerting

### 1. Cloud Monitoring Alerts

```bash
# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="API High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"'
```

### 2. Custom Dashboards

Create monitoring dashboard via Terraform or UI:
- API latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- Active sessions
- Database connections
- Cache hit rate

---

## Security Configuration

### 1. Cloud Armor (WAF)

```hcl
resource "google_compute_security_policy" "api_policy" {
  name = "abaquest-api-security-policy"
  
  rule {
    action   = "rate_based_ban"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
  }
  
  rule {
    action   = "deny(403)"
    priority = "2000"
    match {
      expr {
        expression = "origin.region_code == 'CN' || origin.region_code == 'RU'"
      }
    }
  }
}
```

### 2. Identity-Aware Proxy

```bash
# Enable IAP for admin tools
gcloud iap web enable --resource-type=backend-services \
  --service=abaquest-admin-backend
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches:
      - main
      - develop
      - staging

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Build and Deploy
        run: |
          gcloud builds submit --config=cloudbuild.yaml \
            --substitutions=_ENV=${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }}
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: abaquest-${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }}
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check Cloud Run status
gcloud run services describe abaquest-api-prod --region=us-central1

# Test API endpoint
curl https://api.abaquest.com/health

# Check Firebase Hosting
curl https://app.abaquest.com
```

### 2. Seed Initial Data

```bash
# Create admin user
node scripts/create-admin.js --email=admin@abaquest.com --password=SecurePassword123

# Load quest definitions
node scripts/load-quests.js --file=quests.json
```

### 3. Configure DNS

Point your domain to Firebase Hosting and Cloud Run:
```
app.abaquest.com -> Firebase Hosting
api.abaquest.com -> Cloud Run Service URL
```

---

## Rollback Procedure

```bash
# List revisions
gcloud run revisions list --service=abaquest-api-prod --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic abaquest-api-prod \
  --to-revisions=abaquest-api-prod-00042-abc=100 \
  --region=us-central1
```

---

## Cost Estimation

**Monthly cost for 1,000 active students:**
- Cloud Run: $50
- Firestore: $100
- Cloud SQL: $150
- Storage: $20
- CDN: $30
- BigQuery: $50
- Monitoring: $30
- **Total: ~$430/month** (43¢ per student)

---

## Support & Maintenance

### Daily Tasks
- Monitor error logs
- Check alert notifications
- Review performance metrics

### Weekly Tasks
- Review cost reports
- Check backup status
- Update dependencies

### Monthly Tasks
- Security audit
- Performance optimization
- Capacity planning

---

This deployment guide provides a complete path from infrastructure setup to production deployment. Follow each section carefully and adjust configurations based on your specific requirements.
