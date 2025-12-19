# AbaQuest Security & Compliance Guide

## Overview

AbaQuest handles K-2 student data and must comply with:
- **COPPA** (Children's Online Privacy Protection Act)
- **FERPA** (Family Educational Rights and Privacy Act)
- **GDPR** (General Data Protection Regulation) - if serving EU students
- **SOC 2 Type II** (recommended for enterprise sales)

---

## COPPA Compliance

### Key Requirements

#### 1. Parental Consent
**Requirement**: Obtain verifiable parental consent before collecting personal information from children under 13.

**Implementation**:
```javascript
// Consent workflow
const parentConsentFlow = {
  1: 'School sends consent form to parents via email',
  2: 'Parent reviews data collection practices',
  3: 'Parent provides consent via:',
    a: 'Digital signature (DocuSign)',
    b: 'Consent form upload (photo/PDF)',
    c: 'Email confirmation with PIN',
  4: 'Store consent record in Firestore with timestamp',
  5: 'Link student account to consent record'
};

// Database structure
{
  "parent_consent": {
    "obtained": true,
    "method": "digital_signature",
    "obtained_at": "2024-08-25T10:00:00Z",
    "parent_email": "parent@example.com", // Encrypted
    "consent_document_url": "gs://abaquest/consents/student_789.pdf",
    "ip_address": "192.168.1.1" // For verification
  }
}
```

#### 2. Privacy Notice
**Requirement**: Clear, prominent privacy policy accessible to parents.

**Implementation**:
- Privacy policy at `/privacy-policy`
- Plain language version for parents
- Email privacy notice with consent form
- Annual privacy notice reminders

**Required Content**:
```markdown
# AbaQuest Privacy Notice for Parents

## What Information We Collect
- Student first name (for personalization only)
- Grade level
- Quest completion data (scores, time spent)
- Device information (tablet type, screen size)

## What We DON'T Collect
- Full name or address
- Email addresses (students)
- Phone numbers
- Photos or videos
- Social media profiles
- Precise geolocation

## How We Use Information
- Track learning progress
- Generate teacher reports
- Improve educational content
- Aggregate research (de-identified only)

## Who We Share With
- Teachers and school administrators (with access controls)
- Researchers (de-identified data only)
- NOT shared with advertisers or marketers

## Your Rights
- Access your child's data
- Request data deletion
- Withdraw consent
- Contact us: privacy@abaquest.com
```

#### 3. Data Minimization
**Requirement**: Collect only necessary information.

**Implementation**:
```javascript
// Minimal student profile
interface StudentProfile {
  id: string;                    // Auto-generated pseudonym
  display_name: string;          // First name only or nickname
  class_id: string;
  grade_level: number;           // 0, 1, or 2
  
  // NO full name, NO address, NO email
  // NO birthdate, NO SSN, NO photos
  
  // Optional demographic data (research consent required)
  demographics?: {
    age_group: '5-6' | '7-8';    // Range, not exact age
    primary_language: string;
    ell_status: boolean;
    iep_status: boolean;         // No details, just flag
  };
}
```

#### 4. Reasonable Security
**Requirement**: Maintain reasonable security procedures.

**Implementation**:
- TLS 1.3 encryption in transit
- AES-256 encryption at rest
- Role-based access control (RBAC)
- Regular security audits
- Incident response plan
- Data breach notification within 72 hours

#### 5. Data Retention & Deletion
**Requirement**: Retain data only as long as necessary.

**Implementation**:
```javascript
// Retention policy
const retentionPolicy = {
  activestudent: 'Retained while enrolled',
  inactiveStudent_1year: 'Deleted after 1 year of inactivity',
  deletedAccount: {
    softDelete: '30 days (can be restored)',
    hardDelete: 'Permanent after 30 days'
  },
  researchData: 'De-identified, indefinite retention'
};

// Deletion workflow
async function deleteStudent(studentId: string) {
  // Soft delete
  await db.collection('students').doc(studentId).update({
    deleted_at: new Date(),
    status: 'pending_deletion'
  });
  
  // Schedule hard delete in 30 days
  await scheduleTask({
    taskName: 'hard-delete-student',
    studentId,
    scheduledTime: addDays(new Date(), 30)
  });
  
  // Notify parent
  await sendEmail({
    to: parentEmail,
    subject: 'Student Data Deletion Scheduled',
    body: 'Your child\'s data will be permanently deleted in 30 days. Contact us to restore.'
  });
}
```

---

## FERPA Compliance

### Key Requirements

#### 1. Educational Record Protection
**Requirement**: Protect "education records" and limit disclosure.

**Implementation**:
```javascript
// FERPA-compliant access controls
const accessRules = {
  student: {
    canView: ['own_data'],
    canModify: ['own_settings']
  },
  teacher: {
    canView: ['class_students', 'student_progress', 'aggregated_metrics'],
    canModify: ['student_info', 'class_roster'],
    canExport: ['class_data_only']
  },
  admin: {
    canView: ['all_school_data'],
    canModify: ['users', 'settings'],
    canExport: ['school_data_only']
  },
  researcher: {
    canView: ['de_identified_data_only'],
    canModify: [],
    canExport: ['aggregated_anonymized_data']
  }
};

// Audit trail
interface AuditLog {
  user_id: string;
  action: 'view' | 'modify' | 'export' | 'delete';
  resource: string;
  resource_id: string;
  timestamp: Date;
  ip_address: string;
  justification?: string;
}
```

#### 2. School Official Exception
**Requirement**: Ensure service providers act as "school officials."

**Implementation**:
- Sign School Service Agreement with each district
- Include FERPA compliance clause
- Limit data use to educational purposes only
- Prohibit re-disclosure without consent

**Template Agreement**:
```
SCHOOL SERVICE AGREEMENT

AbaQuest agrees to:
1. Function as a "school official" under FERPA
2. Use student data ONLY for educational services
3. Maintain confidentiality and security
4. NOT re-disclose data to third parties
5. Delete or return data upon request
6. Comply with school's annual notification requirements
7. Submit to annual compliance audits

School agrees to:
1. Obtain necessary parental consents
2. Include AbaQuest in annual FERPA notification
3. Notify AbaQuest of any FERPA violations
4. Provide contact for compliance questions
```

#### 3. Directory Information
**Requirement**: Allow parents to opt-out of directory information disclosure.

**Implementation**:
```javascript
// Student privacy settings
interface PrivacySettings {
  allow_directory_info: boolean;  // Name, grade
  allow_progress_sharing: boolean; // Share with parents
  allow_research: boolean;        // De-identified research
  allow_photos: boolean;          // In-app avatars (if added)
}

// Default: all FALSE (most restrictive)
const defaultPrivacy: PrivacySettings = {
  allow_directory_info: false,
  allow_progress_sharing: true,  // Parents should see progress
  allow_research: false,
  allow_photos: false
};
```

#### 4. Data Breach Notification
**Requirement**: Notify schools of any data breach affecting education records.

**Implementation**:
```javascript
// Incident response procedure
async function handleDataBreach(incident: SecurityIncident) {
  // Step 1: Contain (within 1 hour)
  await containBreach(incident);
  
  // Step 2: Assess impact (within 4 hours)
  const impact = await assessImpact(incident);
  
  // Step 3: Notify affected parties (within 24 hours)
  if (impact.severity >= 'medium') {
    // Notify schools
    await notifySchools(impact.affectedSchools);
    
    // Notify parents (if PII exposed)
    if (impact.exposedPII) {
      await notifyParents(impact.affectedStudents);
    }
    
    // Notify authorities (if required by law)
    if (impact.requiresLegalNotification) {
      await notifyAuthorities();
    }
  }
  
  // Step 4: Document (within 72 hours)
  await documentIncident(incident, impact);
  
  // Step 5: Remediate and prevent recurrence
  await implementSafeguards(incident.lessons);
}
```

---

## GDPR Compliance (If Applicable)

### Key Requirements

#### 1. Legal Basis for Processing
**Requirement**: Establish lawful basis for data processing.

**Implementation**:
```javascript
// Legal basis: Consent (Article 6(1)(a))
const legalBasis = {
  student_data: 'Parental consent under Article 8',
  teacher_data: 'Contract (employment/service agreement)',
  research_data: 'Legitimate interest (with safeguards)'
};
```

#### 2. Data Subject Rights
**Requirement**: Honor GDPR rights (access, rectification, erasure, portability).

**Implementation**:
```javascript
// API endpoints for GDPR rights
POST /gdpr/access-request      // Right to access
POST /gdpr/rectification       // Right to rectification
POST /gdpr/erasure             // Right to be forgotten
POST /gdpr/portability         // Right to data portability
POST /gdpr/object              // Right to object
POST /gdpr/restrict            // Right to restrict processing

// Response timeline: 30 days
```

#### 3. Data Protection Impact Assessment (DPIA)
**Requirement**: Conduct DPIA for high-risk processing.

**AbaQuest DPIA Summary**:
```
Risk Assessment: MODERATE
- Processing children's data (high risk)
- Educational context (controlled environment)
- Minimal PII collection (risk reduction)
- Strong security measures (risk mitigation)

Safeguards:
- Parental consent
- Data minimization
- Encryption
- Access controls
- Regular audits
- Incident response plan

Conclusion: ACCEPTABLE with safeguards
```

#### 4. International Data Transfers
**Requirement**: Ensure adequate protection for EU data.

**Implementation**:
- Host EU student data in EU regions (europe-west1)
- Use Standard Contractual Clauses (SCCs)
- Implement supplementary measures (encryption, access controls)

---

## Additional Security Measures

### 1. Encryption

#### Data at Rest
```javascript
// Firestore: Automatic AES-256 encryption
// Cloud SQL: Encrypted by default
// Cloud Storage: Customer-managed encryption keys (CMEK)

// Additional field-level encryption for PII
import { encrypt, decrypt } from './crypto';

const sensitiveFields = ['parent_email', 'parent_phone'];

async function saveStudent(student: Student) {
  // Encrypt sensitive fields
  const encrypted = {
    ...student,
    parent_email: student.parent_email 
      ? await encrypt(student.parent_email) 
      : null
  };
  
  await db.collection('students').add(encrypted);
}
```

#### Data in Transit
```javascript
// Enforce HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// TLS 1.3 minimum
// Configure in Cloud Run / Load Balancer
```

### 2. Authentication & Authorization

```javascript
// Multi-factor authentication for teachers/admins
import { MFA } from './auth';

async function login(email: string, password: string) {
  // Step 1: Email/password
  const user = await authenticateWithPassword(email, password);
  
  // Step 2: MFA (if enabled)
  if (user.mfa_enabled) {
    const mfaToken = await sendMFACode(user);
    return { status: 'mfa_required', mfa_token: mfaToken };
  }
  
  return { status: 'success', token: generateJWT(user) };
}

// Student authentication: Anonymous + Class Code
async function studentLogin(classCode: string, name?: string) {
  const class = await getClassByCode(classCode);
  
  // Create anonymous auth token
  const anonUser = await firebaseAuth.signInAnonymously();
  
  // Link to class
  await linkStudentToClass(anonUser.uid, class.id, name);
  
  return { status: 'success', token: anonUser.token };
}
```

### 3. Audit Logging

```javascript
// Comprehensive audit trail
interface AuditLog {
  timestamp: Date;
  user_id: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  result: 'success' | 'failure';
  error_message?: string;
}

// Log all sensitive operations
async function logAudit(log: AuditLog) {
  await db.collection('audit_logs').add(log);
  
  // Also stream to Cloud Logging for long-term retention
  await cloudLogging.write({
    severity: 'INFO',
    resource: { type: 'cloud_run_revision' },
    jsonPayload: log
  });
}

// Example usage
await logAudit({
  timestamp: new Date(),
  user_id: 'teacher_123',
  user_role: 'teacher',
  action: 'export_student_data',
  resource_type: 'student',
  resource_id: 'student_789',
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  result: 'success'
});
```

### 4. Vulnerability Management

```javascript
// Regular security scanning
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "security:scan": "snyk test",
    "security:monitor": "snyk monitor"
  },
  
  "devDependencies": {
    "snyk": "^1.1000.0",
    "eslint-plugin-security": "^1.7.0"
  }
}

// Automated scanning in CI/CD
// See .github/workflows/security.yml
```

### 5. Incident Response Plan

```
INCIDENT RESPONSE PLAN

Phase 1: DETECTION (Continuous)
- Automated monitoring alerts
- Error tracking (Sentry)
- Security scanning (Snyk)
- User reports

Phase 2: ASSESSMENT (Within 1 hour)
- Severity classification (P0, P1, P2, P3)
- Impact analysis (# students, data exposed)
- Assign incident commander

Phase 3: CONTAINMENT (Within 4 hours)
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs
- Enable enhanced logging

Phase 4: ERADICATION (Within 24 hours)
- Remove malware/backdoors
- Patch vulnerabilities
- Reset all credentials
- Validate system integrity

Phase 5: RECOVERY (Within 48 hours)
- Restore from backups if needed
- Re-enable systems gradually
- Monitor for recurrence
- Communicate with stakeholders

Phase 6: POST-MORTEM (Within 1 week)
- Root cause analysis
- Document lessons learned
- Implement preventive measures
- Update security policies
```

---

## Compliance Checklist

### COPPA Checklist
- [ ] Privacy policy posted and accessible
- [ ] Parental consent workflow implemented
- [ ] Data minimization enforced
- [ ] Reasonable security measures in place
- [ ] Data retention policy documented
- [ ] Deletion process tested
- [ ] Staff trained on COPPA requirements

### FERPA Checklist
- [ ] School service agreements signed
- [ ] Access controls implemented
- [ ] Audit logging enabled
- [ ] Data breach notification procedure documented
- [ ] Annual compliance review scheduled
- [ ] Teacher training on FERPA completed

### GDPR Checklist (if applicable)
- [ ] DPIA completed and approved
- [ ] Legal basis documented
- [ ] Privacy policy includes GDPR rights
- [ ] Data subject request procedures implemented
- [ ] EU data residency configured
- [ ] DPO appointed (if required)

### Security Checklist
- [ ] Encryption at rest and in transit
- [ ] MFA enabled for all staff accounts
- [ ] Regular security audits scheduled
- [ ] Vulnerability scanning automated
- [ ] Incident response plan tested
- [ ] Backup and recovery tested
- [ ] Penetration testing completed

---

## Annual Compliance Tasks

### Q1 (January-March)
- Security audit and penetration testing
- Review and update privacy policy
- Staff security training
- Backup restoration test

### Q2 (April-June)
- COPPA compliance review
- Update data processing agreements
- Review access controls
- Incident response drill

### Q3 (July-September)
- FERPA compliance audit
- Update school service agreements
- Review data retention policy
- Delete inactive accounts

### Q4 (October-December)
- Annual risk assessment
- Update security documentation
- Plan next year's compliance calendar
- Budget for security tools

---

## Contact Information

**Data Protection Officer (DPO)**
Email: dpo@abaquest.com
Phone: +1-555-PRIVACY

**Security Team**
Email: security@abaquest.com
24/7 Hotline: +1-555-SECURITY

**Privacy Inquiries**
Email: privacy@abaquest.com

**Parent Support**
Email: parents@abaquest.com
Phone: +1-555-SUPPORT

---

## References

- COPPA Rule: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- FERPA Regulations: https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html
- GDPR Text: https://gdpr-info.eu/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- SOC 2 Guidelines: https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome.html

---

**Last Updated**: December 2024
**Next Review**: June 2025
