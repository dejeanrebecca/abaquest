# AbaQuest Testing Strategy

## Testing Philosophy

AbaQuest follows a comprehensive testing pyramid:
- **70% Unit Tests**: Fast, isolated component testing
- **20% Integration Tests**: API and service integration
- **10% E2E Tests**: Critical user workflows

**Quality Gates**:
- Minimum 80% code coverage
- All tests must pass before merge
- No critical security vulnerabilities
- Performance benchmarks met

---

## Testing Stack

### Frontend
- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Coverage**: c8 (built into Vitest)
- **Mocking**: MSW (Mock Service Worker)

### Backend
- **Test Runner**: Jest
- **API Testing**: Supertest
- **Database Testing**: In-memory SQLite for unit tests, Docker PostgreSQL for integration
- **Coverage**: Jest built-in
- **Mocking**: jest.mock()

---

## Frontend Testing

### 1. Unit Tests (Components)

**Test Location**: `frontend/src/components/**/*.test.tsx`

#### Example: Testing a Screen Component

```typescript
// components/screens/PositionNumbers.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PositionNumbers } from './PositionNumbers';
import { DataLoggerProvider } from '../DataLogger';

describe('PositionNumbers', () => {
  const mockOnNext = vi.fn();
  
  const renderComponent = () => {
    return render(
      <DataLoggerProvider>
        <PositionNumbers onNext={mockOnNext} />
      </DataLoggerProvider>
    );
  };
  
  describe('Pre-Test Phase', () => {
    it('should render pre-test questions', () => {
      renderComponent();
      
      expect(screen.getByText(/Show me:/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero/i)).toBeInTheDocument();
    });
    
    it('should allow selecting an answer', async () => {
      renderComponent();
      
      const answerButton = screen.getAllByRole('button')[0];
      fireEvent.click(answerButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Great job!/i)).toBeInTheDocument();
      });
    });
    
    it('should allow skipping with "I don\'t know yet"', async () => {
      renderComponent();
      
      const skipButton = screen.getByRole('button', { name: /I don't know yet/i });
      fireEvent.click(skipButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Thanks for trying!/i)).toBeInTheDocument();
      });
    });
    
    it('should move to next question after answer', async () => {
      renderComponent();
      
      // First question
      expect(screen.getByText(/Question 1 of 4/i)).toBeInTheDocument();
      
      // Answer
      const answerButton = screen.getAllByRole('button')[0];
      fireEvent.click(answerButton);
      
      // Wait for next question
      await waitFor(() => {
        expect(screen.getByText(/Question 2 of 4/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
    
    it('should transition to learn phase after all questions', async () => {
      renderComponent();
      
      // Answer all 4 questions
      for (let i = 0; i < 4; i++) {
        const answerButton = screen.getAllByRole('button')[0];
        fireEvent.click(answerButton);
        await waitFor(() => {}, { timeout: 2000 });
      }
      
      // Should show learn phase
      await waitFor(() => {
        expect(screen.getByText(/Discovery Time/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Data Logging', () => {
    it('should log interactions', async () => {
      const { container } = renderComponent();
      
      // Mock logger spy
      const logSpy = vi.spyOn(console, 'log');
      
      const answerButton = screen.getAllByRole('button')[0];
      fireEvent.click(answerButton);
      
      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('Learning Data'),
          expect.objectContaining({
            quest_id: 3,
            interaction_type: 'pre_test'
          })
        );
      });
      
      logSpy.mockRestore();
    });
  });
  
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderComponent();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    it('should support keyboard navigation', () => {
      renderComponent();
      
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Tab to next button
      fireEvent.keyDown(firstButton, { key: 'Tab' });
      const nextButton = screen.getAllByRole('button')[1];
      expect(nextButton).toHaveFocus();
    });
  });
});
```

#### Example: Testing DataLogger

```typescript
// components/DataLogger.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataLoggerProvider, useDataLogger } from './DataLogger';

describe('DataLogger', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DataLoggerProvider>{children}</DataLoggerProvider>
  );
  
  it('should log interactions', () => {
    const { result } = renderHook(() => useDataLogger(), { wrapper });
    
    act(() => {
      result.current.logInteraction({
        quest_id: 3,
        scene_id: 'pre_test_question_1',
        number: 0,
        correct_flag: true,
        time_ms: 3500,
        interaction_type: 'pre_test'
      });
    });
    
    expect(result.current.interactions).toHaveLength(1);
    expect(result.current.interactions[0]).toMatchObject({
      quest_id: 3,
      scene_id: 'pre_test_question_1',
      correct_flag: true
    });
  });
  
  it('should calculate pre-test score', () => {
    const { result } = renderHook(() => useDataLogger(), { wrapper });
    
    act(() => {
      // 2 correct, 2 incorrect
      result.current.logInteraction({
        quest_id: 3,
        scene_id: 'pre_test_1',
        number: 0,
        correct_flag: true,
        time_ms: 3000,
        interaction_type: 'pre_test'
      });
      
      result.current.logInteraction({
        quest_id: 3,
        scene_id: 'pre_test_2',
        number: 1,
        correct_flag: false,
        time_ms: 4000,
        interaction_type: 'pre_test'
      });
      
      result.current.logInteraction({
        quest_id: 3,
        scene_id: 'pre_test_3',
        number: 5,
        correct_flag: true,
        time_ms: 2500,
        interaction_type: 'pre_test'
      });
      
      result.current.logInteraction({
        quest_id: 3,
        scene_id: 'pre_test_4',
        number: 9,
        correct_flag: false,
        time_ms: 5000,
        interaction_type: 'pre_test'
      });
    });
    
    expect(result.current.getPreTestScore()).toBe(50);
  });
  
  it('should handle "I don\'t know yet" responses', () => {
    const { result } = renderHook(() => useDataLogger(), { wrapper });
    
    act(() => {
      result.current.logInteraction({
        quest_id: 3,
        scene_id: 'pre_test_1',
        number: 0,
        correct_flag: null, // "I don't know yet"
        time_ms: 1500,
        interaction_type: 'pre_test',
        student_response: 'I_dont_know_yet'
      });
    });
    
    // Should not count in score calculation
    expect(result.current.getPreTestScore()).toBe(0);
    expect(result.current.interactions[0].correct_flag).toBeNull();
  });
});
```

### 2. Integration Tests (API Mocking)

```typescript
// Setup MSW handlers
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock session creation
  http.post('/v1/sessions', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        session: {
          id: 'session_mock_123',
          student_id: body.student_id,
          quest_id: body.quest_id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        }
      }
    });
  }),
  
  // Mock interaction logging
  http.post('/v1/sessions/:sessionId/interactions', async ({ params, request }) => {
    return HttpResponse.json({
      success: true,
      data: {
        interaction: {
          id: 'interaction_mock_xyz',
          session_id: params.sessionId,
          logged: true
        }
      }
    });
  })
];

// Use in tests
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3. E2E Tests (Playwright)

**Test Location**: `frontend/tests/e2e/**/*.spec.ts`

```typescript
// tests/e2e/quest-completion-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quest Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with fresh state
    await page.goto('http://localhost:3000');
  });
  
  test('student can complete entire quest flow', async ({ page }) => {
    // Welcome screen
    await expect(page.locator('h1')).toContainText('Welcome');
    await page.click('[data-testid="emotion-happy"]');
    await page.click('button:has-text("Continue")');
    
    // Name counter
    await page.fill('input[type="text"]', 'TestStudent');
    await page.click('button:has-text("Confirm")');
    
    // Skip to position numbers
    await page.click('button:has-text("Next")');
    
    // Pre-test
    for (let i = 0; i < 4; i++) {
      await page.click('[data-testid^="answer-"]').first();
      await page.waitForTimeout(1500); // Wait for feedback
    }
    
    // Learn phase
    await expect(page.locator('text=Discovery Time')).toBeVisible();
    await page.click('button:has-text("Practice")');
    
    // Practice
    for (let i = 0; i < 2; i++) {
      await page.click('[data-testid^="answer-"]').first();
      await page.waitForTimeout(1500);
    }
    
    // Post-test
    for (let i = 0; i < 4; i++) {
      await page.click('[data-testid^="answer-"]').first();
      await page.waitForTimeout(1500);
    }
    
    // Story
    await expect(page.locator('text=Story Time')).toBeVisible();
    for (let i = 0; i < 2; i++) {
      await page.click('[data-testid^="answer-"]').first();
      await page.waitForTimeout(2000);
    }
    
    // Rewards
    await expect(page.locator('text=Quest Complete')).toBeVisible();
    await expect(page.locator('text=/\\d+ Quest Coins/')).toBeVisible();
  });
  
  test('teacher can view dashboard', async ({ page }) => {
    // Login as teacher
    await page.goto('http://localhost:3000/settings');
    await page.click('button:has-text("Open Dashboard")');
    
    // Verify dashboard elements
    await expect(page.locator('text=Teacher Dashboard')).toBeVisible();
    await expect(page.locator('text=Pre-Test')).toBeVisible();
    await expect(page.locator('text=Post-Test')).toBeVisible();
    await expect(page.locator('text=Learning Gain')).toBeVisible();
  });
  
  test('data export functionality works', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.click('button:has-text("Open Dashboard")');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Learning Data")');
    const download = await downloadPromise;
    
    // Verify file
    expect(download.suggestedFilename()).toMatch(/abaquest_.*\.json/);
  });
});

test.describe('Accessibility', () => {
  test('app is keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
  });
  
  test('app meets WCAG AA standards', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Performance', () => {
  test('quest loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });
  
  test('interactions respond within 500ms', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Skip to quest
    await page.click('button').first();
    await page.click('button').first();
    
    // Measure interaction time
    const startTime = Date.now();
    await page.click('[data-testid^="answer-"]').first();
    await page.waitForSelector('text=/Great job|Keep learning/');
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(500);
  });
});
```

---

## Backend Testing

### 1. Unit Tests

```typescript
// services/student.service.test.ts
import { StudentService } from '../src/services/student.service';
import { db } from '../src/config/firebase';

// Mock Firestore
jest.mock('../src/config/firebase');

describe('StudentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createStudent', () => {
    it('should create student with valid data', async () => {
      const mockAdd = jest.fn().mockResolvedValue({ id: 'student_123' });
      (db.collection as jest.Mock).mockReturnValue({
        add: mockAdd
      });
      
      const studentData = {
        name: 'Alex Johnson',
        class_id: 'class_456',
        grade_level: 1
      };
      
      const result = await StudentService.create(studentData);
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alex Johnson',
          grade_level: 1
        })
      );
      expect(result).toHaveProperty('id');
    });
    
    it('should validate grade level', async () => {
      const invalidData = {
        name: 'Alex',
        class_id: 'class_456',
        grade_level: 10
      };
      
      await expect(StudentService.create(invalidData))
        .rejects
        .toThrow('Grade level must be 0, 1, or 2');
    });
    
    it('should sanitize student name', async () => {
      const mockAdd = jest.fn().mockResolvedValue({ id: 'student_123' });
      (db.collection as jest.Mock).mockReturnValue({
        add: mockAdd
      });
      
      await StudentService.create({
        name: '<script>alert("xss")</script>Alex',
        class_id: 'class_456',
        grade_level: 1
      });
      
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alex'
        })
      );
    });
  });
  
  describe('calculateMetrics', () => {
    it('should calculate pre/post test scores correctly', () => {
      const interactions = [
        { interaction_type: 'pre_test', correct_flag: true },
        { interaction_type: 'pre_test', correct_flag: false },
        { interaction_type: 'pre_test', correct_flag: true },
        { interaction_type: 'pre_test', correct_flag: true },
        { interaction_type: 'post_test', correct_flag: true },
        { interaction_type: 'post_test', correct_flag: true },
        { interaction_type: 'post_test', correct_flag: true },
        { interaction_type: 'post_test', correct_flag: true }
      ];
      
      const metrics = StudentService.calculateMetrics(interactions);
      
      expect(metrics.pre_test_score).toBe(75);  // 3/4 = 75%
      expect(metrics.post_test_score).toBe(100); // 4/4 = 100%
      expect(metrics.learning_gain).toBe(25);    // 100 - 75 = 25
    });
    
    it('should handle null responses ("I don\'t know yet")', () => {
      const interactions = [
        { interaction_type: 'pre_test', correct_flag: null },
        { interaction_type: 'pre_test', correct_flag: true },
        { interaction_type: 'pre_test', correct_flag: null },
        { interaction_type: 'pre_test', correct_flag: false }
      ];
      
      const metrics = StudentService.calculateMetrics(interactions);
      
      // Should only count non-null responses: 1 correct out of 2 answered
      expect(metrics.pre_test_score).toBe(50);
    });
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/api.test.ts
import request from 'supertest';
import { app } from '../../src/index';
import { setupTestDatabase, teardownTestDatabase } from '../helpers/database';

describe('API Integration Tests', () => {
  let authToken: string;
  let studentId: string;
  
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test teacher and login
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'test-teacher@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = response.body.data.tokens.access_token;
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  describe('POST /v1/students', () => {
    it('should create a student', async () => {
      const response = await request(app)
        .post('/v1/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Student',
          class_id: 'test_class_1',
          grade_level: 1
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.student).toHaveProperty('id');
      
      studentId = response.body.data.student.id;
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/v1/students')
        .send({
          name: 'Test Student',
          class_id: 'test_class_1',
          grade_level: 1
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Quest Completion Flow', () => {
    let sessionId: string;
    
    it('should create a session', async () => {
      const response = await request(app)
        .post('/v1/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          student_id: studentId,
          quest_id: 3
        });
      
      expect(response.status).toBe(201);
      sessionId = response.body.data.session.id;
    });
    
    it('should log interactions', async () => {
      const response = await request(app)
        .post(`/v1/sessions/${sessionId}/interactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quest_id: 3,
          scene_id: 'pre_test_question_1',
          number: 0,
          correct_flag: true,
          time_ms: 3500,
          interaction_type: 'pre_test'
        });
      
      expect(response.status).toBe(201);
    });
    
    it('should complete session and calculate metrics', async () => {
      // Log pre-test interactions
      for (const interaction of getPreTestInteractions()) {
        await request(app)
          .post(`/v1/sessions/${sessionId}/interactions`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(interaction);
      }
      
      // Complete session
      const response = await request(app)
        .put(`/v1/sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body.data.session.metrics).toMatchObject({
        pre_test_score: expect.any(Number),
        post_test_score: expect.any(Number),
        learning_gain: expect.any(Number)
      });
    });
  });
});
```

### 3. Load Testing (k6)

```javascript
// tests/load/quest-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% error rate
  },
};

export default function () {
  // Student login
  const loginRes = http.post('https://api-dev.abaquest.com/v1/auth/student-login', {
    class_code: 'TEST123',
    student_name: 'LoadTest'
  });
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });
  
  const token = loginRes.json('data.tokens.access_token');
  
  // Create session
  const sessionRes = http.post(
    'https://api-dev.abaquest.com/v1/sessions',
    JSON.stringify({
      student_id: loginRes.json('data.student.id'),
      quest_id: 3
    }),
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  check(sessionRes, {
    'session created': (r) => r.status === 201,
  });
  
  sleep(1);
}
```

---

## Test Coverage

### Coverage Configuration

```javascript
// vitest.config.ts (Frontend)
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});

// jest.config.js (Backend)
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ]
};
```

### Running Coverage

```bash
# Frontend
npm run test:coverage

# Backend
npm run test:coverage

# View HTML report
open coverage/index.html
```

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend
  
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests
        run: cd backend && npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          flags: backend
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

### 1. Test Naming
```typescript
// Good
it('should calculate learning gain when post-test score is higher', () => {});

// Bad
it('test1', () => {});
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should create student', async () => {
  // Arrange
  const studentData = { name: 'Alex', class_id: 'class_1', grade_level: 1 };
  
  // Act
  const student = await StudentService.create(studentData);
  
  // Assert
  expect(student).toHaveProperty('id');
  expect(student.name).toBe('Alex');
});
```

### 3. Mock External Dependencies
```typescript
// Mock Firebase
jest.mock('./config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) })
      })
    })
  }
}));
```

### 4. Test Edge Cases
```typescript
describe('edge cases', () => {
  it('should handle empty interactions array', () => {
    const metrics = calculateMetrics([]);
    expect(metrics.pre_test_score).toBe(0);
  });
  
  it('should handle all null responses', () => {
    const interactions = [
      { correct_flag: null },
      { correct_flag: null }
    ];
    expect(calculateMetrics(interactions).pre_test_score).toBe(0);
  });
});
```

---

This comprehensive testing strategy ensures AbaQuest maintains high quality, performance, and reliability across all environments.
