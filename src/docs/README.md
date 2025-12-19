# AbaQuest Production Documentation

> **Complete technical documentation for building and deploying AbaQuest to production on Google Cloud Platform**

## 📋 Table of Contents

### Quick Start
- [Developer Setup](./DEVELOPER_SETUP.md) - Get started developing locally
- [Quick Reference](#quick-reference) - Common commands and workflows

### Architecture & Design
- [Production Architecture](./PRODUCTION_ARCHITECTURE.md) - System design, infrastructure, and technology stack
- [API Specification](./API_SPECIFICATION.md) - Complete REST API documentation
- [Database Schema](./DATABASE_SCHEMA.md) - Firestore, Cloud SQL, and BigQuery schemas

### Deployment & Operations
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Step-by-step GCP deployment
- [Security & Compliance](./SECURITY_COMPLIANCE.md) - COPPA, FERPA, GDPR compliance
- [Testing Strategy](./TESTING_STRATEGY.md) - Comprehensive testing approach

---

## 🎯 Project Overview

**AbaQuest** is a gamified tablet learning application for K-2 students that teaches abacus-based counting through interactive adventures.

### Key Features
- ✅ **Quest-based Learning**: Structured 10-minute learning modules
- ✅ **Pre/Post Assessment**: Measure learning gains with identical tests
- ✅ **Data Logging**: Comprehensive tracking for research analysis
- ✅ **Teacher Dashboard**: Real-time progress monitoring and reporting
- ✅ **Accessibility**: WCAG AA compliant, multi-sensory learning
- ✅ **Compliance**: COPPA, FERPA, GDPR compliant

### Current Implementation Status
- **Frontend**: ✅ Complete - React + Tailwind CSS + Motion
- **Backend API**: 📝 Specification complete - Ready for implementation
- **Database**: 📝 Schema designed - Ready for setup
- **Infrastructure**: 📝 Terraform templates ready
- **Testing**: 📝 Strategy documented

---

## 🏗️ Technology Stack

### Frontend
```
React 18 + TypeScript
├── Vite (Build tool)
├── Tailwind CSS v4.0 (Styling)
├── Motion (Animations)
├── Recharts (Analytics charts)
├── Firebase SDK (Authentication, Firestore)
└── Axios (API client)
```

### Backend
```
Node.js 20 LTS + Express + TypeScript
├── Firebase Admin SDK (Firestore, Auth)
├── PostgreSQL Client (Analytics DB)
├── Redis Client (Caching)
├── JWT (Authentication)
├── Winston (Logging)
└── Joi (Validation)
```

### Infrastructure (GCP)
```
Google Cloud Platform
├── Cloud Run (Backend containers)
├── Firebase Hosting (Frontend CDN)
├── Cloud Firestore (Primary database)
├── Cloud SQL PostgreSQL (Analytics)
├── Cloud Storage (Assets, exports)
├── BigQuery (Data warehouse)
├── Cloud Memorystore Redis (Cache)
├── Cloud Monitoring & Logging
└── Secret Manager (Credentials)
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────┐
│          Students (Tablets - 1024x768)          │
│                 React SPA + PWA                  │
└────────────────┬────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────┐
│        Firebase Hosting + Cloud CDN             │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Cloud Run (Node.js API)                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Authentication • Rate Limiting          │  │
│  │  Quest Service • Student Service         │  │
│  │  Analytics Service • Export Service      │  │
│  └──────────────────────────────────────────┘  │
└───┬─────────────┬──────────────┬───────────────┘
    │             │              │
┌───▼───┐    ┌───▼────┐    ┌───▼──────┐
│Firestore│  │Cloud SQL│  │BigQuery  │
│(Primary)│  │Analytics│  │Warehouse │
└─────────┘  └─────────┘  └──────────┘
```

See [Production Architecture](./PRODUCTION_ARCHITECTURE.md) for detailed diagrams.

---

## 🚀 Quick Reference

### Development Commands

```bash
# Setup
git clone https://github.com/your-org/abaquest.git
cd abaquest
npm install

# Frontend Development
cd frontend
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm test                 # Run tests
npm run lint             # Lint code

# Backend Development
cd backend
npm run dev              # Start dev server (localhost:8080)
npm run build            # Build TypeScript
npm test                 # Run tests
npm run migrate          # Run DB migrations

# Firebase Emulators
firebase emulators:start # Local Firestore + Auth

# Docker (Full Stack)
docker-compose up -d     # Start all services
docker-compose down      # Stop services
```

### Deployment Commands

```bash
# Deploy Frontend to Firebase
cd frontend
npm run build
firebase deploy --only hosting --project abaquest-prod

# Deploy Backend to Cloud Run
cd backend
gcloud builds submit --config=cloudbuild.yaml

# Deploy Infrastructure
cd terraform
terraform init
terraform apply -var="project_id=abaquest-prod"
```

### Testing Commands

```bash
# Unit Tests
npm test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage
npm run test:coverage

# Load Testing
k6 run tests/load/quest-load.js
```

---

## 📁 Repository Structure

```
abaquest/
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── screens/   # Screen components
│   │   │   ├── ui/        # Reusable UI components
│   │   │   ├── AbbyAvatar.tsx
│   │   │   ├── DataLogger.tsx
│   │   │   └── Navigation.tsx
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts        # Entry point
│   ├── tests/              # Backend tests
│   ├── migrations/         # DB migrations
│   ├── Dockerfile
│   └── package.json
│
├── docs/                    # 📚 THIS DIRECTORY
│   ├── README.md           # ← You are here
│   ├── PRODUCTION_ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY_COMPLIANCE.md
│   ├── DEVELOPER_SETUP.md
│   └── TESTING_STRATEGY.md
│
├── terraform/               # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── .github/workflows/       # CI/CD pipelines
│   ├── deploy.yml
│   ├── test.yml
│   └── security.yml
│
├── docker-compose.yml       # Local development
├── firebase.json            # Firebase config
├── .gitignore
└── README.md                # Project README
```

---

## 🎓 Getting Started

### For Developers
1. **Start here**: [Developer Setup Guide](./DEVELOPER_SETUP.md)
2. **Understand the API**: [API Specification](./API_SPECIFICATION.md)
3. **Learn the data model**: [Database Schema](./DATABASE_SCHEMA.md)
4. **Write tests**: [Testing Strategy](./TESTING_STRATEGY.md)

### For DevOps/Platform Engineers
1. **Review architecture**: [Production Architecture](./PRODUCTION_ARCHITECTURE.md)
2. **Setup infrastructure**: [Deployment Guide](./DEPLOYMENT_GUIDE.md)
3. **Configure security**: [Security & Compliance](./SECURITY_COMPLIANCE.md)

### For Product/Research Teams
1. **API integration**: [API Specification](./API_SPECIFICATION.md)
2. **Data export format**: [Database Schema](./DATABASE_SCHEMA.md) (BigQuery section)
3. **Compliance requirements**: [Security & Compliance](./SECURITY_COMPLIANCE.md)

---

## 🔐 Security & Compliance

AbaQuest is designed for K-2 students and must comply with:

- ✅ **COPPA** - Parental consent, data minimization, secure deletion
- ✅ **FERPA** - Education record protection, school official agreements
- ✅ **GDPR** - Data subject rights, lawful processing, EU data residency
- ✅ **SOC 2** - Security controls, audit trails, incident response

See [Security & Compliance Guide](./SECURITY_COMPLIANCE.md) for complete details.

---

## 📊 Key Metrics & Performance Targets

### Application Performance
- **Page Load Time**: < 2 seconds on 3G
- **API Response Time**: < 200ms (p95)
- **Quest Completion**: < 10 minutes runtime
- **Concurrent Users**: 10,000+ per school district

### Quality Metrics
- **Test Coverage**: > 80%
- **Uptime SLA**: 99.9%
- **Error Rate**: < 0.1%
- **Security Scan**: Zero critical vulnerabilities

### Business Metrics
- **Learning Gain**: Average 45-75% improvement (pre-test to post-test)
- **Completion Rate**: > 85%
- **Teacher Engagement**: Weekly dashboard access
- **Data Export**: < 5 minutes for 1000 students

---

## 💰 Cost Estimation

**Monthly operational cost for 1,000 active students:**

| Service | Monthly Cost |
|---------|--------------|
| Cloud Run (Backend) | $50 |
| Firestore (Primary DB) | $100 |
| Cloud SQL (Analytics) | $150 |
| Cloud Storage (Assets) | $20 |
| Cloud CDN | $30 |
| BigQuery (Data Warehouse) | $50 |
| Monitoring & Logging | $30 |
| **Total** | **~$430/month** |

**Cost per student**: 43¢/month

See [Production Architecture](./PRODUCTION_ARCHITECTURE.md#cost-optimization) for optimization strategies.

---

## 🔄 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-quest

# Develop locally
npm run dev

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: add new quest for addition"
git push origin feature/new-quest
```

### 2. Code Review
- Create Pull Request on GitHub
- Automated tests run (CI/CD)
- Code review by team
- Merge to `develop` branch

### 3. Deployment
```bash
# Staging deployment (automatic from develop branch)
git push origin develop

# Production deployment (manual promotion)
git checkout main
git merge develop
git push origin main
```

---

## 📞 Support & Resources

### Documentation
- **Technical Docs**: `/docs` directory (this folder)
- **API Playground**: https://api-dev.abaquest.com/api-docs
- **Component Storybook**: (Coming soon)

### Communication
- **Slack**: #abaquest-dev
- **GitHub Issues**: https://github.com/your-org/abaquest/issues
- **Email**: dev-team@abaquest.com

### Emergency Contacts
- **On-Call Engineer**: +1-555-ON-CALL
- **Security Team**: security@abaquest.com
- **DPO (Privacy)**: dpo@abaquest.com

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Core quest functionality
- ✅ Pre/post assessment
- ✅ Data logging
- ✅ Teacher dashboard

### Phase 2: Enhancement (Q1 2025)
- 🔲 Audio narration (Abby voice)
- 🔲 Offline mode (PWA)
- 🔲 Additional quests (4-8)
- 🔲 Spanish localization

### Phase 3: Scale (Q2 2025)
- 🔲 Multi-school deployment
- 🔲 Advanced analytics
- 🔲 Adaptive difficulty
- 🔲 Parent portal

---

## 📄 License & Credits

**Copyright © 2024 AbaQuest**

Built with ❤️ for K-2 learners

### Technologies Used
- React, TypeScript, Tailwind CSS
- Node.js, Express, PostgreSQL
- Google Cloud Platform, Firebase
- Motion (Framer Motion), Recharts

### Research Partners
- [Your University Research Team]
- [School District Partners]

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Read the docs**: Start with [Developer Setup](./DEVELOPER_SETUP.md)
2. **Pick an issue**: Check GitHub Issues for "good first issue"
3. **Follow conventions**: ESLint + Prettier configurations
4. **Write tests**: Maintain > 80% coverage
5. **Document changes**: Update relevant docs
6. **Submit PR**: Include description and test results

---

## ❓ FAQ

### Q: What's the difference between Firestore and Cloud SQL?
**A**: Firestore is the primary real-time database for student sessions and interactions. Cloud SQL stores aggregated analytics and metrics for reporting.

### Q: Can I run the entire stack locally?
**A**: Yes! Use Firebase Emulators + Docker Compose. See [Developer Setup](./DEVELOPER_SETUP.md#running-the-application).

### Q: How is student data protected?
**A**: We use encryption at rest and in transit, RBAC, audit logging, and comply with COPPA/FERPA. See [Security & Compliance](./SECURITY_COMPLIANCE.md).

### Q: What's the data export format for research?
**A**: JSON files with structure matching Quests 1-2 format. BigQuery exports available in Parquet. See [Database Schema](./DATABASE_SCHEMA.md#bigquery-schema).

### Q: How do I add a new quest?
**A**: Create quest definition in Firestore, build frontend components, update quest service, add tests. Contact tech lead for guidance.

---

**Last Updated**: December 2024  
**Documentation Version**: 1.0.0  
**Contact**: tech-docs@abaquest.com

---

## 📚 Document Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [Production Architecture](./PRODUCTION_ARCHITECTURE.md) | System design, tech stack, infrastructure | DevOps, Architects |
| [API Specification](./API_SPECIFICATION.md) | Complete REST API reference | Backend Devs, Integrators |
| [Database Schema](./DATABASE_SCHEMA.md) | All database schemas & queries | Backend Devs, Data Engineers |
| [Deployment Guide](./DEPLOYMENT_GUIDE.md) | Step-by-step GCP deployment | DevOps, Platform Engineers |
| [Security & Compliance](./SECURITY_COMPLIANCE.md) | COPPA, FERPA, GDPR compliance | Legal, Security, Product |
| [Developer Setup](./DEVELOPER_SETUP.md) | Local development setup | All Developers |
| [Testing Strategy](./TESTING_STRATEGY.md) | Testing approach & examples | QA, Developers |

---

**Ready to build?** Start with the [Developer Setup Guide](./DEVELOPER_SETUP.md) →
