// Headless camera permission self-test script
// This tests the camera flow in isolation to ensure proper retry behavior

import { ensureCamera } from '../client/src/services/camera';
import { push, clearLogs } from '../client/src/utils/dev-logger';

// Mock navigator.mediaDevices for testing
const originalUserMedia = global.navigator?.mediaDevices?.getUserMedia;

interface TestScenario {
  name: string;
  mockBehavior: () => Promise<MediaStream | void>;
  expectedLogs: string[];
  expectedRetries: number;
}

const scenarios: TestScenario[] = [
  {
    name: "Permission denied → 2 retries",
    mockBehavior: async () => {
      throw new Error('NotAllowedError');
    },
    expectedLogs: [
      'ensureCamera() called',
      'Initial permission status:',
      'Camera permission request failed: Error',
      'Showing permission modal to user'
    ],
    expectedRetries: 2
  },
  {
    name: "Granted on 1st retry",
    mockBehavior: async () => {
      // Mock successful stream
      return {
        getTracks: () => [{ stop: () => {} }]
      } as any;
    },
    expectedLogs: [
      'ensureCamera() called',
      'Camera permission granted on request'
    ],
    expectedRetries: 0
  }
];

async function runTest(scenario: TestScenario): Promise<boolean> {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  clearLogs();
  
  // Mock getUserMedia
  if (global.navigator?.mediaDevices) {
    global.navigator.mediaDevices.getUserMedia = scenario.mockBehavior;
  }
  
  let retryCount = 0;
  let success = false;
  
  const mockSuccessCallback = () => {
    push('Camera granted → starting');
    success = true;
  };
  
  const mockFailCallback = () => {
    push('Camera still denied');
    retryCount++;
  };
  
  try {
    await ensureCamera({
      onGranted: mockSuccessCallback,
      onDenied: mockFailCallback
    });
  } catch (error) {
    console.log(`❌ Test failed with error: ${error}`);
    return false;
  }
  
  // Verify expected behavior
  const expectedRetries = scenario.expectedRetries;
  const actualRetries = retryCount;
  
  if (actualRetries !== expectedRetries) {
    console.log(`❌ Expected ${expectedRetries} retries, got ${actualRetries}`);
    return false;
  }
  
  console.log(`✅ Test passed: ${actualRetries} retries as expected`);
  return true;
}

async function runAllTests() {
  console.log('🚀 Starting camera permission self-tests...\n');
  
  let passed = 0;
  let total = scenarios.length;
  
  for (const scenario of scenarios) {
    const result = await runTest(scenario);
    if (result) passed++;
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All camera tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some camera tests failed');
    process.exit(1);
  }
}

// Restore original after tests
process.on('exit', () => {
  if (global.navigator?.mediaDevices && originalUserMedia) {
    global.navigator.mediaDevices.getUserMedia = originalUserMedia;
  }
});

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };