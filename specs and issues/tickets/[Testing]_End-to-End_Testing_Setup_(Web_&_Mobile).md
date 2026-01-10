# [Testing] End-to-End Testing Setup (Web & Mobile)

## Overview
Set up comprehensive end-to-end testing for both web (Playwright) and mobile (Detox) applications to ensure critical user flows work correctly.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/9205213b-7551-4266-99b1-915e78111a8d` (Frontend Web - Testing Section)
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/40e954fc-4f47-4a50-89ff-6064819e3165` (Frontend Mobile - Testing Section)

E2E tests validate complete user journeys, catching integration issues before production.

## Critical User Flows to Test

### Web Application
1. **Authentication Flow**
   - Sign up → Email verification → Login
   - Password reset
   - Logout

2. **Patient Management**
   - Add new patient
   - Edit patient details
   - View patient history
   - Search patients

3. **Session Recording**
   - Start recording
   - Pause/resume recording
   - Stop recording
   - Generate AI note
   - Approve note

4. **BioSync Integration**
   - View pre-session intelligence brief
   - View wearable data trends
   - Receive alerts

### Mobile Application
1. **Authentication Flow**
   - Login with biometrics
   - Sign up
   - Logout

2. **Offline Recording**
   - Record session offline
   - Verify local storage
   - Sync when online

3. **Health Data Sync**
   - Connect Health Connect/HealthKit
   - Sync data
   - View sync status

## Technical Requirements

### 1. Playwright Setup for Web
Install Playwright:
```bash
cd therapyflow-web
npm install -D @playwright/test
npx playwright install
```

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. Web E2E Test Examples
Create `e2e/auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should sign up successfully', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('input[name="fullName"]', 'Test Therapist');
    await page.fill('input[name="email"]', 'test@therapyflow.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.check('input[name="agreeToTerms"]');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, Test Therapist')).toBeVisible();
  });
  
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@therapyflow.com');
    await page.fill('input[name="password"]', 'Test@1234');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

Create `e2e/patient-management.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@therapyflow.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should add new patient', async ({ page }) => {
    await page.goto('/patients');
    await page.click('button:has-text("Add Patient")');
    
    await page.fill('input[name="full_name"]', 'Rahul Sharma');
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="primary_concern"]', 'Anxiety');
    
    await page.click('button:has-text("Save Patient")');
    
    await expect(page.locator('text=Rahul Sharma')).toBeVisible();
  });
  
  test('should search patients', async ({ page }) => {
    await page.goto('/patients');
    
    await page.fill('input[placeholder*="Search"]', 'Rahul');
    
    await expect(page.locator('text=Rahul Sharma')).toBeVisible();
  });
});
```

Create `e2e/session-recording.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Session Recording', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@therapyflow.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
  });
  
  test('should record session and generate note', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);
    
    await page.goto('/record');
    
    // Select patient
    await page.click('button:has-text("Select Patient")');
    await page.click('text=Rahul Sharma');
    
    // Start recording
    await page.click('button:has-text("Start Recording")');
    
    await expect(page.locator('text=Recording...')).toBeVisible();
    
    // Wait 5 seconds
    await page.waitForTimeout(5000);
    
    // Stop recording
    await page.click('button:has-text("Stop")');
    
    // Generate AI note
    await page.click('button:has-text("Generate AI Clinical Note")');
    
    // Wait for note generation
    await expect(page.locator('text=Clinical note generated')).toBeVisible({ timeout: 60000 });
    
    // Verify note content
    await expect(page.locator('text=Subjective')).toBeVisible();
    await expect(page.locator('text=Objective')).toBeVisible();
    await expect(page.locator('text=Assessment')).toBeVisible();
    await expect(page.locator('text=Plan')).toBeVisible();
  });
});
```

### 3. Detox Setup for Mobile
Install Detox:
```bash
cd therapyflow-mobile
npm install -D detox jest
```

Create `.detoxrc.js`:
```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/TherapyFlow.app',
      build: 'xcodebuild -workspace ios/TherapyFlow.xcworkspace -scheme TherapyFlow -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

### 4. Mobile E2E Test Examples
Create `e2e/auth.e2e.ts`:
```typescript
import { device, element, by, expect } from 'detox';

describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@therapyflow.com');
    await element(by.id('password-input')).typeText('Test@1234');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });
  
  it('should login with biometrics', async () => {
    await element(by.id('biometric-login-button')).tap();
    
    // Simulate biometric authentication
    await device.matchFace();
    
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });
});
```

Create `e2e/recording.e2e.ts`:
```typescript
describe('Session Recording', () => {
  beforeEach(async () => {
    await device.launchApp();
    // Login
    await element(by.id('email-input')).typeText('test@therapyflow.com');
    await element(by.id('password-input')).typeText('Test@1234');
    await element(by.id('login-button')).tap();
  });
  
  it('should record session offline', async () => {
    // Disable network
    await device.disableSynchronization();
    await device.setURLBlacklist(['.*']);
    
    // Navigate to recording
    await element(by.text('Record')).tap();
    
    // Select patient
    await element(by.id('patient-selector')).tap();
    await element(by.text('Rahul Sharma')).tap();
    
    // Start recording
    await element(by.id('start-recording-button')).tap();
    
    await expect(element(by.text('Recording...'))).toBeVisible();
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Stop recording
    await element(by.id('stop-recording-button')).tap();
    
    // Verify offline save
    await expect(element(by.text('Saved Offline'))).toBeVisible();
    
    // Re-enable network
    await device.setURLBlacklist([]);
    await device.enableSynchronization();
    
    // Verify sync
    await element(by.id('sync-button')).tap();
    await expect(element(by.text('Sync Complete'))).toBeVisible();
  });
});
```

### 5. Test Data Management
Create `e2e/helpers/testData.ts`:
```typescript
export async function createTestUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@therapyflow.com',
    password: 'Test@1234',
    options: {
      data: { full_name: 'Test Therapist' }
    }
  });
  
  if (error) throw error;
  return data.user;
}

export async function createTestPatient(therapistId: string) {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: 'Rahul Sharma',
      age: 25,
      gender: 'male',
      phone: '9876543210',
      primary_concern: 'Anxiety',
      assigned_therapist_id: therapistId
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function cleanupTestData() {
  // Delete test user and cascade delete all related data
  await supabase.auth.admin.deleteUser('test-user-id');
}
```

## Acceptance Criteria
- [ ] Playwright installed and configured for web
- [ ] Detox installed and configured for mobile
- [ ] Authentication flow tests passing (web)
- [ ] Patient management tests passing (web)
- [ ] Session recording tests passing (web)
- [ ] Authentication flow tests passing (mobile)
- [ ] Offline recording tests passing (mobile)
- [ ] Health data sync tests passing (mobile)
- [ ] Test data helpers created
- [ ] CI integration for E2E tests
- [ ] Test reports generated
- [ ] Screenshots captured on failure
- [ ] Video recordings for failed tests
- [ ] Test coverage > 80% for critical flows

## Dependencies
- Requires: All frontend implementations complete
- Requires: Backend services deployed

## Estimated Effort
12-14 hours