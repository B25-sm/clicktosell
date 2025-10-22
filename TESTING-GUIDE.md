# OLX Classifieds - Testing Guide

This comprehensive guide covers all testing aspects of the OLX Classifieds application, from unit tests to end-to-end testing and quality assurance.

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Mobile App Testing](#mobile-app-testing)
5. [Integration Testing](#integration-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Quality Assurance](#quality-assurance)
10. [CI/CD Testing](#cicd-testing)

## 🎯 Testing Overview

### Testing Strategy
Our testing approach follows the testing pyramid:
- **Unit Tests (70%)**: Fast, isolated tests for individual functions/components
- **Integration Tests (20%)**: Tests for component interactions and API endpoints
- **End-to-End Tests (10%)**: Full user journey tests

### Testing Tools
- **Backend**: Jest, Supertest, MongoDB Memory Server
- **Frontend Web**: Jest, React Testing Library, MSW
- **Mobile App**: Jest, React Native Testing Library, Detox
- **Admin Panel**: Jest, React Testing Library
- **E2E**: Cypress (Web), Detox (Mobile)
- **API**: Postman/Newman, Artillery (Load Testing)

## 🔧 Backend Testing

### Setup
```bash
cd backend
npm install
npm test
```

### Test Structure
```
backend/tests/
├── setup.js                 # Test configuration
├── auth.test.js             # Authentication tests
├── users.test.js            # User management tests
├── listings.test.js         # Listing CRUD tests
├── payments.test.js         # Payment integration tests
├── chat.test.js             # Real-time chat tests
└── integration/
    ├── api.test.js          # API integration tests
    └── database.test.js     # Database integration tests
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.js

# Run tests in watch mode
npm test -- --watch

# Run integration tests
npm run test:integration
```

### Test Examples

#### Unit Test Example
```javascript
// tests/services/paymentService.test.js
const PaymentService = require('../../services/paymentService');
const Transaction = require('../../models/Transaction');

describe('PaymentService', () => {
  describe('calculateFees', () => {
    it('should calculate correct fees for card payment', () => {
      const fees = Transaction.calculateFees(1000, 'card');
      expect(fees.platform).toBe(25);
      expect(fees.payment).toBe(29);
      expect(fees.total).toBe(54);
    });
  });
});
```

#### Integration Test Example
```javascript
// tests/integration/listings.test.js
describe('Listings API', () => {
  it('should create and retrieve a listing', async () => {
    const listingData = { /* test data */ };
    
    const createResponse = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(listingData)
      .expect(201);
    
    const listingId = createResponse.body.data.listing._id;
    
    const getResponse = await request(app)
      .get(`/api/v1/listings/${listingId}`)
      .expect(200);
    
    expect(getResponse.body.data.listing.title).toBe(listingData.title);
  });
});
```

### Test Database
Tests use MongoDB Memory Server for isolated testing:
```javascript
// tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});
```

## 🌐 Frontend Testing

### Setup
```bash
cd frontend-web
npm install
npm test
```

### Test Structure
```
frontend-web/src/
├── __tests__/
│   ├── components/          # Component tests
│   ├── pages/              # Page tests
│   ├── hooks/              # Custom hook tests
│   └── utils/              # Utility function tests
├── __mocks__/              # Mock files
└── setupTests.ts           # Test setup
```

### Testing Components
```typescript
// src/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Testing Pages
```typescript
// src/__tests__/pages/HomePage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import { mockListings } from '../__mocks__/listings';

// Mock API calls
jest.mock('../../services/api', () => ({
  getFeaturedListings: jest.fn(() => Promise.resolve(mockListings)),
  getRecentListings: jest.fn(() => Promise.resolve(mockListings)),
}));

describe('HomePage', () => {
  it('renders hero section and listings', async () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Buy & Sell Anything')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Featured Listings')).toBeInTheDocument();
    });
  });
});
```

### Testing Custom Hooks
```typescript
// src/__tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../contexts/AuthContext';

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

## 📱 Mobile App Testing

### Setup
```bash
cd mobile-app
npm install
npm test
```

### Test Structure
```
mobile-app/src/
├── __tests__/
│   ├── components/          # Component tests
│   ├── screens/            # Screen tests
│   ├── navigation/         # Navigation tests
│   └── services/           # Service tests
└── __mocks__/              # Mock files
```

### Testing React Native Components
```typescript
// src/__tests__/components/ListingCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListingCard from '../../components/listings/ListingCard';
import { mockListing } from '../__mocks__/listings';

describe('ListingCard', () => {
  it('renders listing information correctly', () => {
    const { getByText, getByTestId } = render(
      <ListingCard listing={mockListing} onPress={jest.fn()} />
    );

    expect(getByText(mockListing.title)).toBeTruthy();
    expect(getByText(`₹${mockListing.price.amount}`)).toBeTruthy();
    expect(getByTestId('listing-image')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ListingCard listing={mockListing} onPress={onPress} />
    );

    fireEvent.press(getByTestId('listing-card'));
    expect(onPress).toHaveBeenCalledWith(mockListing._id);
  });
});
```

### Testing Navigation
```typescript
// src/__tests__/navigation/AppNavigator.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../navigation/AppNavigator';
import { AuthProvider } from '../../contexts/AuthContext';

describe('AppNavigator', () => {
  it('shows auth screens when not authenticated', () => {
    const { getByText } = render(
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    );

    expect(getByText('Login')).toBeTruthy();
  });
});
```

### E2E Testing with Detox
```javascript
// e2e/firstTest.e2e.js
describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on first launch', async () => {
    await expect(element(by.text('Login'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Home'))).toBeVisible();
  });
});
```

## 🔗 Integration Testing

### API Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

### Database Integration
```javascript
// tests/integration/database.test.js
describe('Database Integration', () => {
  it('should perform CRUD operations on listings', async () => {
    // Create
    const listing = await Listing.create(testListingData);
    expect(listing._id).toBeDefined();

    // Read
    const foundListing = await Listing.findById(listing._id);
    expect(foundListing.title).toBe(testListingData.title);

    // Update
    await Listing.findByIdAndUpdate(listing._id, { title: 'Updated Title' });
    const updatedListing = await Listing.findById(listing._id);
    expect(updatedListing.title).toBe('Updated Title');

    // Delete
    await Listing.findByIdAndDelete(listing._id);
    const deletedListing = await Listing.findById(listing._id);
    expect(deletedListing).toBeNull();
  });
});
```

### Real-time Chat Integration
```javascript
// tests/integration/chat.test.js
describe('Chat Integration', () => {
  it('should send and receive messages in real-time', (done) => {
    const client1 = io('http://localhost:5000');
    const client2 = io('http://localhost:5000');

    client1.emit('join_chat', { chatId: testChatId });
    client2.emit('join_chat', { chatId: testChatId });

    client1.emit('send_message', {
      chatId: testChatId,
      content: 'Hello from client 1'
    });

    client2.on('new_message', (data) => {
      expect(data.message.content).toBe('Hello from client 1');
      client1.disconnect();
      client2.disconnect();
      done();
    });
  });
});
```

## 🎭 End-to-End Testing

### Web E2E with Cypress
```javascript
// cypress/integration/user-journey.spec.js
describe('Complete User Journey', () => {
  it('should allow user to register, post ad, and receive inquiries', () => {
    // Registration
    cy.visit('/register');
    cy.get('[data-cy=first-name]').type('John');
    cy.get('[data-cy=last-name]').type('Doe');
    cy.get('[data-cy=email]').type('john.doe@example.com');
    cy.get('[data-cy=phone]').type('9876543210');
    cy.get('[data-cy=password]').type('Password123');
    cy.get('[data-cy=register-button]').click();

    // Email verification (mock)
    cy.intercept('POST', '/api/v1/auth/verify-email', { success: true });

    // Post an ad
    cy.get('[data-cy=post-ad-button]').click();
    cy.get('[data-cy=title]').type('iPhone 13 Pro');
    cy.get('[data-cy=description]').type('Excellent condition iPhone');
    cy.get('[data-cy=price]').type('75000');
    cy.get('[data-cy=category]').select('electronics');
    cy.get('[data-cy=submit-button]').click();

    // Verify ad was posted
    cy.contains('Ad posted successfully');
    cy.visit('/my-listings');
    cy.contains('iPhone 13 Pro');
  });
});
```

### Mobile E2E with Detox
```javascript
// e2e/user-journey.e2e.js
describe('Mobile User Journey', () => {
  it('should complete listing creation flow', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Navigate to post ad
    await element(by.id('post-ad-tab')).tap();

    // Fill listing form
    await element(by.id('title-input')).typeText('Test Listing');
    await element(by.id('description-input')).typeText('Test Description');
    await element(by.id('price-input')).typeText('1000');
    
    // Select category
    await element(by.id('category-picker')).tap();
    await element(by.text('Electronics')).tap();

    // Add photos
    await element(by.id('add-photo-button')).tap();
    await element(by.text('Camera')).tap();

    // Submit listing
    await element(by.id('submit-listing-button')).tap();

    // Verify success
    await expect(element(by.text('Listing posted successfully'))).toBeVisible();
  });
});
```

## ⚡ Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"

scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/v1/listings"
      - post:
          url: "/api/v1/auth/login"
          json:
            identifier: "test@example.com"
            password: "password123"
      - get:
          url: "/api/v1/users/profile"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Frontend Performance Testing
```javascript
// performance/lighthouse.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse('http://localhost:3000', options);
  
  console.log('Performance score:', runnerResult.report.categories.performance.score * 100);
  
  await chrome.kill();
}
```

### Mobile Performance Testing
```javascript
// mobile-performance/measure.js
describe('Mobile Performance', () => {
  it('should load home screen within 3 seconds', async () => {
    const startTime = Date.now();
    
    await device.launchApp();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
```

## 🔒 Security Testing

### Vulnerability Scanning
```bash
# Check for known vulnerabilities
npm audit

# Check for high-severity issues only
npm audit --audit-level=high

# Fix automatically fixable vulnerabilities
npm audit fix
```

### Security Linting
```javascript
// .eslintrc-security.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  }
};
```

### API Security Testing
```javascript
// tests/security/api-security.test.js
describe('API Security', () => {
  it('should reject requests without authentication', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .expect(401);
    
    expect(response.body.success).toBe(false);
  });

  it('should prevent SQL injection attempts', async () => {
    const maliciousPayload = {
      email: "test@example.com'; DROP TABLE users; --",
      password: "password123"
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(maliciousPayload)
      .expect(400);
  });

  it('should rate limit requests', async () => {
    const requests = Array(101).fill().map(() =>
      request(app).get('/api/v1/listings')
    );

    const responses = await Promise.all(requests);
    const rateLimitedResponse = responses[responses.length - 1];
    
    expect(rateLimitedResponse.status).toBe(429);
  });
});
```

## ✅ Quality Assurance

### Running Quality Checks
```bash
# Run comprehensive quality check
./scripts/quality-check.sh

# Run all tests
./scripts/test-all.sh

# Check code coverage
npm run test:coverage
```

### Code Quality Metrics
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Quality Gates
- **Code Coverage**: Minimum 80% for all projects
- **TypeScript**: No type errors
- **ESLint**: No linting errors
- **Security**: No high-severity vulnerabilities
- **Performance**: Lighthouse score > 90
- **Tests**: All tests passing

## 🚀 CI/CD Testing

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
      redis:
        image: redis:alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend-web && npm ci
          cd ../mobile-app && npm ci
          cd ../admin-panel && npm ci
      
      - name: Run backend tests
        run: cd backend && npm test -- --coverage
      
      - name: Run frontend tests
        run: cd frontend-web && npm test -- --coverage --watchAll=false
      
      - name: Run mobile app tests
        run: cd mobile-app && npm test -- --coverage --watchAll=false
      
      - name: Run admin panel tests
        run: cd admin-panel && npm test -- --coverage --watchAll=false
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
```

### Test Automation
```bash
# Pre-commit hooks with Husky
npm install --save-dev husky lint-staged

# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test:changed
npm run lint
npm run type-check
```

## 📊 Test Reporting

### Coverage Reports
- **Backend**: `backend/coverage/lcov-report/index.html`
- **Frontend**: `frontend-web/coverage/lcov-report/index.html`
- **Mobile**: `mobile-app/coverage/lcov-report/index.html`
- **Admin**: `admin-panel/coverage/lcov-report/index.html`

### Test Results
- **JUnit XML**: For CI/CD integration
- **JSON**: For programmatic analysis
- **HTML**: For human-readable reports

### Quality Metrics Dashboard
Consider integrating with:
- **SonarQube**: Code quality and security
- **CodeClimate**: Maintainability and test coverage
- **Codecov**: Test coverage visualization

## 🎯 Best Practices

### Test Writing Guidelines
1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Test names should describe the behavior
3. **Single Responsibility**: One assertion per test when possible
4. **Test Data**: Use factories and fixtures for consistent test data
5. **Mocking**: Mock external dependencies and side effects

### Continuous Testing
1. **Run tests locally** before committing
2. **Use watch mode** during development
3. **Maintain high coverage** (>80%)
4. **Review test failures** immediately
5. **Update tests** when requirements change

### Performance Considerations
1. **Fast Tests**: Keep unit tests under 100ms
2. **Parallel Execution**: Run tests in parallel when possible
3. **Test Isolation**: Ensure tests don't depend on each other
4. **Resource Cleanup**: Clean up after tests
5. **Selective Testing**: Run only affected tests during development

---

For additional support with testing, please contact the development team or refer to the individual project documentation in each component directory.



